using DevTool.UI.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "DevTool.Mvc API", Version = "v1" });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DevTool.Mvc API v1"));

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthorization();

app.MapControllers();

app.MapDevToolUi("/_devtool", "index.html", opts =>
{
    opts.OpenApiPath = "/swagger/v1/swagger.json";
    opts.SwaggerJsonFileName = "swagger.json";
});

app.Run();
