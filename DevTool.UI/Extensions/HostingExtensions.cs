using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.RegularExpressions;
using DevTool.UI.Models;
using DevTool.UI.Options;
using Microsoft.Extensions.Options;

namespace DevTool.UI.Extensions;

public static class HostingExtensions
{
    static readonly ConcurrentDictionary<string, bool> _inflight = new();
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

            var prompt = req.Prompt;
            var customMessage = MakeCustomMessage(prompt);

            var settings = options.Value;
            if (settings is null || settings.IsEmpty )
                return Results.Ok(new { content = string.Empty });

            var model = settings.Model;

            var client = factory.CreateClient("llm");
            var requestBody = new
            {
                model,
                messages = new[] { new { role = "user", content = customMessage } }
            };
            using var response = await client.PostAsJsonAsync("v1/chat/completions", requestBody).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                return Results.Problem(detail: err, statusCode: (int)response.StatusCode);
            }

            var root = await response.Content.ReadFromJsonAsync<JsonElement>();

            var content = root
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            var result = ExtractFirstJson(content);
            Console.WriteLine(result);
            return Results.Ok(result);
        }).WithTags("Prompt");
        return app;
    }

    private static string MakeCustomMessage(string schema)
    {
        return $"Generate mock data. Rules: Output RAW JSON. No explanation. Replace all values. Keep keys & types. DO NOT wrap in markdown. DO NOT use ``` or ```json. Schema: {schema}";
    }
    
    static string ExtractFirstJson(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        input = Regex.Replace(input, @"```json|```", "", RegexOptions.IgnoreCase).Trim();
        var match = Regex.Match(input, @"\{[\s\S]*?\}");
        return match.Success ? match.Value : input;
    }
}
