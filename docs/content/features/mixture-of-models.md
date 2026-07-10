+++
disableToc = false
title = "Mixture of Models"
weight = 28
url = "/features/mixture-of-models/"
+++

A mixture config turns several models you already have installed into a single virtual model. A chat request sent to it is fanned out to every member model concurrently, a judge model picks the single best answer, and that answer comes back as if it came from one model — reachable from the normal `/v1/chat/completions` endpoint (and the WebUI model dropdown) like any other model.

## Configuring a mixture model

Create a model config file (e.g. `models/combined-ai.yaml`) with a `mixture` block instead of a `backend`:

```yaml
name: combined-ai
mixture:
  models:
    - kimi-k2.6
    - qwen3.6-35b-a3b
    - deepseek-ai.deepseek-v3.2
    - glm-4.7-flash
  judge: kimi-k2.6
```

- `mixture.models`: the model names to fan the request out to (at least 2, each must already be a working model config on this instance — install them from the gallery first, e.g. `local-ai run kimi-k2.6`).
- `mixture.judge`: the model name asked to pick the best candidate answer. It may also be one of `mixture.models`.

The example above intentionally lists flagship-tier open-weight models (as of writing, the strongest generalist models in the gallery) — the point of a mixture is to pool your best available models, not general-purpose filler ones. Swap in whichever top models are current and installed on your instance; the judge doesn't need to be the single strongest model, just one that reliably follows the "reply with only a number" instruction.

Call it exactly like any other model:

```bash
curl http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d '{
  "model": "combined-ai",
  "messages": [{"role": "user", "content": "Explain the CAP theorem in two sentences."}]
}'
```

## How it works

1. The request's messages are sent, unmodified, to every model in `mixture.models`, in parallel.
2. Each member's raw answer is collected. Members that error out are dropped; the request only fails if every member fails.
3. The judge model is given the original question plus every surviving answer, numbered, and asked to reply with only the number of the best one.
4. The winning answer is returned as the mixture model's response, with token usage summed across every member call plus the judge call.

If the judge's reply can't be parsed into a valid choice (or the judge call itself fails), the mixture falls back to the first surviving candidate rather than failing the request.

Streaming (`"stream": true`) is supported, but since the answer is only known once every member and the judge have finished, it arrives as a single chunk rather than token-by-token.

## Limitations

- Tool/function calling, MCP tool injection, and `response_format`/grammar constraints are not applied to the mixture model itself — the request is forwarded to member models as a plain chat completion. Configure those on the member models directly if needed.
- Latency is bounded by the slowest member plus the judge call, and cost/compute scales with the number of members.
