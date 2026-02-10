using DevTool.UI.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace DevTool.UI.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddDevToolHttpClients(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<HuggingFaceSettings>()
            .Bind(configuration.GetSection("HuggingFace"))
            .ValidateDataAnnotations()
            .ValidateOnStart(); 

        services.AddSingleton(sp =>
        {
            var opt = sp.GetService<IOptions<HuggingFaceSettings>>();
            return opt?.Value ?? new HuggingFaceSettings();
        });
        
        services.AddHttpClient("llm", (sp, client) =>
        {
            var settings = sp.GetRequiredService<IOptions<HuggingFaceSettings>>().Value;
            client.BaseAddress = new Uri(string.IsNullOrWhiteSpace(settings.Url)
                ? "https://router.huggingface.co/"
                : settings.Url.TrimEnd('/') + "/");
            if (!string.IsNullOrWhiteSpace(settings.ApiKey))
            {
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", settings.ApiKey);
            }
        });
        return services;
    }
}
