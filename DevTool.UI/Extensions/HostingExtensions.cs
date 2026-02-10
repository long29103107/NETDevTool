using System.Net.Http.Json;
using System.Text.Json;
using DevTool.UI.Models;
using DevTool.UI.Options;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace DevTool.UI.Extensions;

public static class HostingExtensions
{
    public static IEndpointRouteBuilder MapPromptEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/prompt", async (
            PromptReq req,
            IHttpClientFactory factory,
            IOptions<HuggingFaceSettings> options
        ) =>
        {
            if (string.IsNullOrWhiteSpace(req.Prompt))
                return Results.BadRequest("Prompt is required.");

            var settings = options.Value;
            if (settings is null || settings.IsEmpty )
                return Results.Ok(new { content = string.Empty });

            var model = settings.Model;

            var client = factory.CreateClient("llm");
            var requestBody = new
            {
                model,
                messages = new[] { new { role = "user", content = req.Prompt } }
            };
            using var response = await client.PostAsJsonAsync("v1/chat/completions", requestBody).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                return Results.Problem(detail: err, statusCode: (int)response.StatusCode);
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>().ConfigureAwait(false);
            var content = json.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0
                ? choices[0].TryGetProperty("message", out var msg) && msg.TryGetProperty("content", out var c)
                    ? c.GetString()
                    : null
                : null;
            return Results.Ok(content);
        }).WithTags("Prompt");
        return app;
    }
}
