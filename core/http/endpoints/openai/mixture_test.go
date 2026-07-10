package openai

import (
	"github.com/mudler/LocalAI/core/schema"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Mixture of models helpers", func() {
	Context("parseJudgeChoice", func() {
		It("parses a plain number", func() {
			Expect(parseJudgeChoice("2", 3)).To(Equal(2))
		})
		It("parses a number embedded in surrounding text", func() {
			Expect(parseJudgeChoice("I'd say answer 3 is the best.", 3)).To(Equal(3))
		})
		It("falls back to the first candidate on empty input", func() {
			Expect(parseJudgeChoice("", 3)).To(Equal(1))
		})
		It("falls back to the first candidate on an out-of-range choice", func() {
			Expect(parseJudgeChoice("7", 3)).To(Equal(1))
		})
		It("falls back to the first candidate on unparsable input", func() {
			Expect(parseJudgeChoice("the best one, clearly", 3)).To(Equal(1))
		})
	})

	Context("buildJudgePrompt", func() {
		It("numbers every candidate and includes the question", func() {
			candidates := []mixtureCandidate{
				{Model: "a", Response: "answer A"},
				{Model: "b", Response: "answer B"},
			}
			prompt := buildJudgePrompt("what is 2+2?", candidates)
			Expect(prompt).To(ContainSubstring("what is 2+2?"))
			Expect(prompt).To(ContainSubstring("Answer 1:\nanswer A"))
			Expect(prompt).To(ContainSubstring("Answer 2:\nanswer B"))
		})
	})

	Context("lastUserMessageContent", func() {
		It("returns the most recent user message's StringContent", func() {
			messages := []schema.Message{
				{Role: "system", StringContent: "you are a helpful assistant"},
				{Role: "user", StringContent: "first question"},
				{Role: "assistant", StringContent: "first answer"},
				{Role: "user", StringContent: "second question"},
			}
			Expect(lastUserMessageContent(messages)).To(Equal("second question"))
		})
		It("falls back to Content when StringContent is empty", func() {
			messages := []schema.Message{
				{Role: "user", Content: "raw content question"},
			}
			Expect(lastUserMessageContent(messages)).To(Equal("raw content question"))
		})
		It("returns empty string when there is no user message", func() {
			messages := []schema.Message{
				{Role: "system", StringContent: "system prompt"},
			}
			Expect(lastUserMessageContent(messages)).To(Equal(""))
		})
	})
})
