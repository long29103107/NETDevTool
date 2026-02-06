using DevTool.WebApi.DTOs;

namespace DevTool.WebApi.Endpoints;

public static class WeatherEndpoints
{
    private static readonly string[] Summaries =
    [
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    ];

    public static void MapWeatherEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/weatherforecast").WithTags("Weather");

        group.MapGet("/", () =>
            {
                var forecast = Enumerable.Range(1, 5).Select(index =>
                    new WeatherForecastDto(
                        DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                        Random.Shared.Next(-20, 55),
                        Summaries[Random.Shared.Next(Summaries.Length)]
                    )).ToArray();
                return forecast;
            })
            .WithName("GetWeatherForecast");
    }
}
