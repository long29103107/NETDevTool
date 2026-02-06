using DevTool.UI.Middleware;
using DevTool.WebApi.Data;
using DevTool.WebApi.Endpoints;
using DevTool.WebApi.Repositories;
using DevTool.WebApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("DevToolDb"));

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.SeedProductsAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "DevTool API"));
}

app.UseHttpsRedirection();

// API endpoints
app.MapWeatherEndpoints();
app.MapProductEndpoints();

app.MapDevToolUi("/_devtool");

app.Run();