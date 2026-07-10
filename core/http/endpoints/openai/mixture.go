package openai

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/labstack/echo/v4"
	"github.com/mudler/LocalAI/core/backend"
	"github.com/mudler/LocalAI/core/config"
	"github.com/mudler/LocalAI/core/schema"
	"github.com/mudler/LocalAI/core/templates"
	"github.com/mudler/LocalAI/pkg/model"
	"github.com/mudler/xlog"
)

// mixtureCandidate is one member model's answer to the user's prompt.
type mixtureCandidate struct {
	Model    string
	Response string
}

// lastUserMessageContent returns the plain text of the most recent user
// message, used as the question shown to the judge model.
func lastUserMessageContent(messages []schema.Message) string {
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role != "user" {
			continue
		}
		if messages[i].StringContent != "" {
			return messages[i].StringContent
		}
		if s, ok := messages[i].Content.(string); ok {
			return s
		}
	}
	return ""
}

// simpleChoiceCallback returns a ComputeChoices callback that appends a
// single assistant-message choice carrying the raw completion text.
func simpleChoiceCallback() func(string, *[]schema.Choice) {
	return func(s string, choices *[]schema.Choice) {
		*choices = append(*choices, schema.Choice{Message: &schema.Message{Role: "assistant", Content: s}})
	}
}

// runMixtureMember renders the prompt for one mixture member model and runs
// a single non-streaming completion against it.
func runMixtureMember(ctx context.Context, input *schema.OpenAIRequest, modelName string, cl *config.ModelConfigLoader, ml *model.ModelLoader, evaluator *templates.Evaluator, o *config.ApplicationConfig) (mixtureCandidate, backend.TokenUsage, error) {
	memberCfg, err := cl.LoadModelConfigFileByNameDefaultOptions(modelName, o)
	if err != nil {
		return mixtureCandidate{Model: modelName}, backend.TokenUsage{}, fmt.Errorf("loading mixture member %q: %w", modelName, err)
	}

	memberReq := &schema.OpenAIRequest{
		PredictionOptions: input.PredictionOptions,
		Context:           ctx,
		Messages:          input.Messages,
		Metadata:          input.Metadata,
	}
	memberReq.N = 1

	predInput := evaluator.TemplateMessages(*memberReq, memberReq.Messages, memberCfg, nil, false)

	choices, usage, _, err := ComputeChoices(memberReq, predInput, memberCfg, cl, o, ml, simpleChoiceCallback(), nil)
	if err != nil {
		return mixtureCandidate{Model: modelName}, usage, fmt.Errorf("running mixture member %q: %w", modelName, err)
	}
	if len(choices) == 0 || choices[0].Message == nil {
		return mixtureCandidate{Model: modelName}, usage, fmt.Errorf("mixture member %q returned no response", modelName)
	}

	text, _ := choices[0].Message.Content.(string)
	return mixtureCandidate{Model: modelName, Response: text}, usage, nil
}

// runMixtureCandidates fans the request out to every mixture member model
// concurrently and collects the ones that answered successfully. It only
// fails outright if every single member errored.
func runMixtureCandidates(ctx context.Context, input *schema.OpenAIRequest, models []string, cl *config.ModelConfigLoader, ml *model.ModelLoader, evaluator *templates.Evaluator, o *config.ApplicationConfig) ([]mixtureCandidate, backend.TokenUsage, error) {
	candidates := make([]mixtureCandidate, len(models))
	errs := make([]error, len(models))

	var totalUsage backend.TokenUsage
	var mu sync.Mutex
	var wg sync.WaitGroup

	for i, modelName := range models {
		wg.Add(1)
		go func(i int, modelName string) {
			defer wg.Done()
			cand, usage, err := runMixtureMember(ctx, input, modelName, cl, ml, evaluator, o)
			candidates[i] = cand
			if err != nil {
				errs[i] = err
				return
			}
			mu.Lock()
			totalUsage.Prompt += usage.Prompt
			totalUsage.Completion += usage.Completion
			mu.Unlock()
		}(i, modelName)
	}
	wg.Wait()

	okCandidates := make([]mixtureCandidate, 0, len(candidates))
	for i, cand := range candidates {
		if errs[i] != nil {
			xlog.Warn("mixture member failed", "model", cand.Model, "error", errs[i])
			continue
		}
		okCandidates = append(okCandidates, cand)
	}
	if len(okCandidates) == 0 {
		return nil, totalUsage, fmt.Errorf("all mixture members failed, last error: %w", errs[len(errs)-1])
	}
	return okCandidates, totalUsage, nil
}

var judgeDigitsRe = regexp.MustCompile(`\d+`)

// parseJudgeChoice extracts the 1-based candidate index the judge picked from
// its raw response text. Falls back to 1 (the first candidate) if the
// response doesn't contain a valid in-range number, so a confused judge model
// never fails the whole request.
func parseJudgeChoice(response string, n int) int {
	match := judgeDigitsRe.FindString(response)
	if match == "" {
		return 1
	}
	idx, err := strconv.Atoi(match)
	if err != nil || idx < 1 || idx > n {
		return 1
	}
	return idx
}

// buildJudgePrompt lays out the original question plus every candidate
// answer, numbered, and asks for just the winning number back.
func buildJudgePrompt(userQuestion string, candidates []mixtureCandidate) string {
	var b strings.Builder
	b.WriteString("You are judging answers from multiple AI models to the same question. ")
	b.WriteString("Pick the single best answer: the most correct, complete, and helpful one.\n\n")
	b.WriteString("Question:\n")
	b.WriteString(userQuestion)
	b.WriteString("\n\n")
	for i, cand := range candidates {
		fmt.Fprintf(&b, "Answer %d:\n%s\n\n", i+1, cand.Response)
	}
	b.WriteString("Reply with ONLY the number of the best answer, nothing else.")
	return b.String()
}

// runMixtureJudge asks the judge model to pick the best candidate answer and
// returns it. If the judge call itself fails, or its response can't be
// parsed into a valid choice, it falls back to the first candidate rather
// than failing the whole request.
func runMixtureJudge(ctx context.Context, input *schema.OpenAIRequest, judgeModel, userQuestion string, candidates []mixtureCandidate, cl *config.ModelConfigLoader, ml *model.ModelLoader, evaluator *templates.Evaluator, o *config.ApplicationConfig) (mixtureCandidate, backend.TokenUsage, error) {
	judgeCfg, err := cl.LoadModelConfigFileByNameDefaultOptions(judgeModel, o)
	if err != nil {
		return candidates[0], backend.TokenUsage{}, fmt.Errorf("loading mixture judge %q: %w", judgeModel, err)
	}

	prompt := buildJudgePrompt(userQuestion, candidates)
	judgeReq := &schema.OpenAIRequest{
		PredictionOptions: input.PredictionOptions,
		Context:           ctx,
		Messages: []schema.Message{
			{Role: "user", Content: prompt, StringContent: prompt},
		},
	}
	judgeReq.N = 1

	predInput := evaluator.TemplateMessages(*judgeReq, judgeReq.Messages, judgeCfg, nil, false)

	choices, usage, _, err := ComputeChoices(judgeReq, predInput, judgeCfg, cl, o, ml, simpleChoiceCallback(), nil)
	if err != nil {
		return candidates[0], usage, fmt.Errorf("running mixture judge %q: %w", judgeModel, err)
	}

	var verdict string
	if len(choices) > 0 && choices[0].Message != nil {
		verdict, _ = choices[0].Message.Content.(string)
	}

	idx := parseJudgeChoice(verdict, len(candidates))
	return candidates[idx-1], usage, nil
}

// handleMixtureRequest serves a chat completion for a mixture-of-models
// virtual model (config.Mixture set): it fans the request out to every
// member model concurrently, asks the judge model to pick the single best
// answer, and returns that answer as if it came from one model.
//
// Tool calling, MCP tool injection, and response_format/grammar constraints
// are not supported for mixture models — the request is forwarded to member
// models as a plain chat completion.
func handleMixtureRequest(c echo.Context, cl *config.ModelConfigLoader, ml *model.ModelLoader, evaluator *templates.Evaluator, o *config.ApplicationConfig, input *schema.OpenAIRequest, cfg *config.ModelConfig, id string, created int, extraUsage bool) error {
	ctx := c.Request().Context()
	userQuestion := lastUserMessageContent(input.Messages)

	candidates, usage, err := runMixtureCandidates(ctx, input, cfg.Mixture.Models, cl, ml, evaluator, o)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	chosen, judgeUsage, err := runMixtureJudge(ctx, input, cfg.Mixture.Judge, userQuestion, candidates, cl, ml, evaluator, o)
	if err != nil {
		xlog.Warn("mixture judge failed, falling back to first candidate", "error", err)
	}
	usage.Prompt += judgeUsage.Prompt
	usage.Completion += judgeUsage.Completion

	xlog.Debug("mixture request served", "model", cfg.Name, "chosen", chosen.Model, "candidates", len(candidates))

	openaiUsage := schema.OpenAIUsage{
		PromptTokens:     usage.Prompt,
		CompletionTokens: usage.Completion,
		TotalTokens:      usage.Prompt + usage.Completion,
	}
	if extraUsage {
		openaiUsage.TimingTokenGeneration = usage.TimingTokenGeneration
		openaiUsage.TimingPromptProcessing = usage.TimingPromptProcessing
	}

	if !input.Stream {
		finishReason := "stop"
		resp := &schema.OpenAIResponse{
			ID:      id,
			Created: created,
			Model:   input.Model,
			Choices: []schema.Choice{{
				Index:        0,
				FinishReason: &finishReason,
				Message:      &schema.Message{Role: "assistant", Content: chosen.Response},
			}},
			Object: "chat.completion",
			Usage:  openaiUsage,
		}
		return c.JSON(http.StatusOK, resp)
	}

	// The answer is already fully computed by this point, so stream mode
	// emits it as a single content chunk rather than faking token-by-token
	// generation.
	c.Response().Header().Set("Content-Type", "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().Header().Set("X-Correlation-ID", id)

	writeChunk := func(resp schema.OpenAIResponse) error {
		data, err := json.Marshal(resp)
		if err != nil {
			return err
		}
		if _, err := fmt.Fprintf(c.Response().Writer, "data: %s\n\n", string(data)); err != nil {
			return err
		}
		c.Response().Flush()
		return nil
	}

	if err := writeChunk(schema.OpenAIResponse{
		ID: id, Created: created, Model: input.Model, Object: "chat.completion.chunk",
		Choices: []schema.Choice{{Index: 0, Delta: &schema.Message{Role: "assistant"}}},
	}); err != nil {
		return err
	}

	content := chosen.Response
	if err := writeChunk(schema.OpenAIResponse{
		ID: id, Created: created, Model: input.Model, Object: "chat.completion.chunk",
		Choices: []schema.Choice{{Index: 0, Delta: &schema.Message{Content: &content}}},
		Usage:   openaiUsage,
	}); err != nil {
		return err
	}

	finishReason := "stop"
	if err := writeChunk(schema.OpenAIResponse{
		ID: id, Created: created, Model: input.Model, Object: "chat.completion.chunk",
		Choices: []schema.Choice{{Index: 0, Delta: &schema.Message{}, FinishReason: &finishReason}},
	}); err != nil {
		return err
	}

	fmt.Fprintf(c.Response().Writer, "data: [DONE]\n\n")
	c.Response().Flush()
	return nil
}
