# NETDevTool

**LonG.DevTool** is a developer tool UI for ASP.NET Core: an in-browser **API Explorer** that loads your OpenAPI/Swagger document and lets you try operations (path, query, body, JWT, foreign-key dropdowns) without leaving the app.

- **NuGet:** [LonG.DevTool](https://www.nuget.org/packages/LonG.DevTool)
- **Install:** `dotnet add package LonG.DevTool --version 1.0.0`

---

## Purpose

- **API Explorer SPA** – Single-page app served at a path (e.g. `/_devtool`) that:
  - Loads your API’s OpenAPI (Swagger) JSON from the same host
  - Lists operations by tag/group
  - Lets you fill path/query/body, send requests, and view responses
  - Supports JWT (set token, “Apply JWT from response” after login)
  - Shows foreign-key dropdowns when schema uses “Foreign key to &lt;Entity&gt;”

- **Drop-in for any ASP.NET Core API** – Add the package, expose OpenAPI, call `MapDevToolUi("/_devtool")`, and open `/_devtool` in the browser. No separate Swagger UI host required.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| **Package** | LonG.DevTool 1.0.0 (.NET 10) |
| **Host** | ASP.NET Core (minimal API or controllers) |
| **OpenAPI** | `Microsoft.AspNetCore.OpenApi`, `MapOpenApi()` and/or `Swashbuckle.AspNetCore` |
| **UI** | React SPA (pre-built in package) + middleware to serve it and fetch/cache OpenAPI |

The Explorer UI is built with React, Tailwind, and Zustand; the package ships the built assets under `wwwroot/dev-tool-ui`. The middleware resolves them from the assembly location when you reference the NuGet package.

---

## Step-by-step: Add the dev tool to your API

You can use either **controllers** or **minimal APIs** (or both). The steps are the same; only how you define endpoints differs.

### Prerequisites

- .NET 10 (or the TFM your app targets)
- An ASP.NET Core Web API project

---

### Option A – Controller-based API

This mirrors the **Sample.Api** project in this repo (see `Sample.Api/`).

#### 1. Add packages

```bash
dotnet add package LonG.DevTool --version 1.0.0
dotnet add package Microsoft.AspNetCore.OpenApi
dotnet add package Swashbuckle.AspNetCore
```

Or in the project file:

```xml
<ItemGroup>
  <PackageReference Include="LonG.DevTool" Version="1.0.0" />
  <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.0" />
  <PackageReference Include="Swashbuckle.AspNetCore" Version="10.1.2" />
</ItemGroup>
```

#### 2. Register OpenAPI and controllers

In `Program.cs`:

```csharp
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
```

#### 3. Map OpenAPI and Swagger UI (e.g. in Development)

```csharp
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();  // exposes /openapi/v1.json
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "My API"));
}
```

#### 4. Add static files and the DevTool UI

```csharp
app.UseStaticFiles();
app.MapDevToolUi("/_devtool");   // requires: using DevTool.UI.Middleware;
app.MapControllers();

app.Run();
```

#### 5. Define a controller (example)

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetAll() => Ok(products);

    [HttpGet("{id:int}")]
    public ActionResult<Product> GetById(int id) => ...
}
```

#### 6. Run and open the Explorer

- Run the app (`dotnet run` or F5).
- Open `https://localhost:<port>/_devtool`.
- The Explorer loads `/openapi/v1.json` and lists your controller actions; you can try them from the UI.

---

### Option B – Minimal API

Same package and OpenAPI setup; endpoints are defined with `MapGet`, `MapPost`, `MapGroup`, etc. (see **Sample.Api** `Endpoints/CategoryEndpoints.cs`).

#### 1. Add packages

Same as Option A:

```bash
dotnet add package LonG.DevTool --version 1.0.0
dotnet add package Microsoft.AspNetCore.OpenApi
dotnet add package Swashbuckle.AspNetCore
```

#### 2. Register OpenAPI and map endpoints

In `Program.cs`:

```csharp
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();
```

#### 3. Map OpenAPI and Swagger UI (e.g. in Development)

```csharp
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "My API"));
}
```

#### 4. Add static files and the DevTool UI

```csharp
app.UseStaticFiles();
app.MapDevToolUi("/_devtool");   // using DevTool.UI.Middleware;

app.MapGet("/api/hello", () => Results.Ok(new { message = "Hello" }));

// Or use extension method for a group:
app.MapCategoryEndpoints();

app.Run();
```

#### 5. Define minimal endpoints (example)

```csharp
// Endpoints/CategoryEndpoints.cs
public static void MapCategoryEndpoints(this WebApplication app)
{
    var group = app.MapGroup("/api/category").WithTags("Category");
    group.MapGet("", () => Results.Ok(categories));
    group.MapGet("{id:int}", (int id) => ...);
}
```

#### 6. Run and open the Explorer

- Run the app and open `https://localhost:<port>/_devtool`.
- The Explorer uses `/openapi/v1.json` and lists your minimal API endpoints.

---

### Customizing the OpenAPI path (optional)

If your OpenAPI document is at a different path (e.g. Swashbuckle-only at `/swagger/v1/swagger.json`):

```csharp
app.MapDevToolUi("/_devtool", "index.html", opts =>
{
    opts.OpenApiPath = "/swagger/v1/swagger.json";
    opts.SwaggerJsonFileName = "swagger.json";
});
```

---

### Optional: Foreign-key dropdowns

For body or path parameters that are foreign keys (e.g. `categoryId`), the Explorer can show a dropdown filled from a list endpoint:

- In your OpenAPI schema, set the property **description** to `Foreign key to <EntityName>` (e.g. `Foreign key to Category`).
- Expose a GET list endpoint for that entity (e.g. `GET /api/categories`) returning an array with `id` and a label field (`name`, `title`, or `code`).

See **DevTool.WebApi** and its DTOs for `[SwaggerSchema(Description = "Foreign key to Category")]` examples.

---

## Project layout (this repo)

| Project | Description |
|--------|-------------|
| **Sample.Api** | Sample API using the **LonG.DevTool** NuGet package with both controllers and minimal API endpoints. |
| **DevTool.WebApi** | Full sample with OpenAPI, JWT, EF Core, and dev tool integration (project reference). |
| **DevTool.UI** | Source for the NuGet package: builds the React SPA and produces the `LonG.DevTool` package. |
| **dev-tool-ui** | React (Bun + Tailwind) app: API Explorer UI source. |

- To **use** the dev tool in your app: install [LonG.DevTool](https://www.nuget.org/packages/LonG.DevTool) and follow the steps above.
- To **build or publish** the package: see **DevTool.UI/README.md**.

---

## License

MIT. See repository license.
