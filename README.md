# DevTool.WebApi

Sample ASP.NET Core API that hosts the **API Explorer** dev tool at `/_devtool`. Use this project as a reference for adding the dev tool to your own API.

---

## Purpose

This project demonstrates:

- A minimal API with OpenAPI/Swagger, JWT auth, and CRUD-style endpoints (Categories, Products, Orders, Inventory, Auth).
- Integration of **DevTool.UI**: the API Explorer SPA is served at `/_devtool` and loads this API’s OpenAPI document so you can browse and try operations (path/query/body, JWT, foreign-key dropdowns) from the browser.

You can copy the integration pattern into any ASP.NET Core app to get the same Explorer UI for your API.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| **Runtime** | .NET 10 |
| **API** | ASP.NET Core minimal APIs, `Microsoft.AspNetCore.OpenApi`, `MapOpenApi()` |
| **OpenAPI / Swagger** | `Swashbuckle.AspNetCore`, `Swashbuckle.AspNetCore.Annotations` |
| **Auth** | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`, `System.IdentityModel.Tokens.Jwt`) |
| **Data** | Entity Framework Core, InMemory provider |
| **Dev tool UI** | **DevTool.UI** (project reference): React SPA + middleware to serve it and fetch/cache OpenAPI |

The API Explorer UI itself is a React app (see `dev-tool-ui/`) built with Bun, React, Tailwind, and Zustand; it is built and packaged by the **DevTool.UI** project.

---

## How to implement the dev tool in a new project

Follow these steps to add the API Explorer at `/_devtool` to your own ASP.NET Core API.

### Step 1: Expose OpenAPI (Swagger) from your API

Your API must expose an OpenAPI (Swagger) JSON document so the Explorer can discover operations.

**Option A – OpenAPI with `MapOpenApi()` (recommended)**

- Add the OpenAPI package and map the document:

  ```csharp
  builder.Services.AddOpenApi();
  builder.Services.AddEndpointsApiExplorer();
  // ...
  app.MapOpenApi();  // e.g. exposes /openapi/v1.json
  ```

- If you also use Swashbuckle for Swagger UI:

  ```csharp
  builder.Services.AddSwaggerGen(c => { /* optional config */ });
  app.UseSwagger();
  app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "My API"));
  ```

**Option B – Swashbuckle only**

- Add `Swashbuckle.AspNetCore` and optionally `Swashbuckle.AspNetCore.Annotations`.
- Register Swagger and Swagger UI. The document is usually at `/swagger/v1/swagger.json` (or the document name you configure).

Note the URL of your OpenAPI document (e.g. `https://localhost:5001/openapi/v1.json` or `https://localhost:5001/swagger/v1/swagger.json`). You will use it in Step 3.

### Step 2: Reference DevTool.UI and copy the UI assets

- Add a **project reference** to DevTool.UI (or reference the DevTool.UI NuGet package once published):

  ```xml
  <ItemGroup>
    <ProjectReference Include="..\DevTool.UI\DevTool.UI.csproj" />
  </ItemGroup>
  ```

- Ensure the DevTool UI static files are available in your app’s output. With a project reference, use a build target that copies DevTool.UI’s built `wwwroot` into your output:

  ```xml
  <Target Name="CopyDevToolWwwRoot" AfterTargets="Build">
    <PropertyGroup>
      <DevToolUiWwwRoot>$(MSBuildProjectDirectory)\..\DevTool.UI\bin\$(Configuration)\$(TargetFramework)\wwwroot</DevToolUiWwwRoot>
    </PropertyGroup>
    <ItemGroup>
      <DevToolWwwFiles Include="$(DevToolUiWwwRoot)\**\*" Condition="Exists('$(DevToolUiWwwRoot)')" />
    </ItemGroup>
    <Copy SourceFiles="@(DevToolWwwFiles)" DestinationFiles="@(DevToolWwwFiles->'$(OutputPath)wwwroot\%(RecursiveDir)%(Filename)%(Extension)')" SkipUnchangedFiles="true" Condition="Exists('$(DevToolUiWwwRoot)')" />
  </Target>
  ```

  Build **DevTool.UI** at least once first so it produces `wwwroot` (it builds the frontend and copies it into `wwwroot/dev-tool-ui`).

### Step 3: Map the DevTool UI in your pipeline

- In `Program.cs`, add the `DevTool.UI.Middleware` namespace and call `MapDevToolUi` with the path where you want the Explorer (e.g. `/_devtool`) and the OpenAPI URL used by your app:

  ```csharp
  using DevTool.UI.Middleware;

  // After UseStaticFiles(), UseAuthentication(), UseAuthorization(), and your API mappings:
  app.MapDevToolUi("/_devtool", "index.html", opts =>
  {
      opts.OpenApiPath = "/openapi/v1.json";   // or "/swagger/v1/swagger.json" if using Swashbuckle only
      opts.SwaggerJsonFileName = "swagger.json";
  });

  app.Run();
  ```

- `OpenApiPath` must match the URL path of your OpenAPI document on the same host. The middleware fetches it from the current request’s host (e.g. `https://localhost:5001/openapi/v1.json`) and caches it in your app’s `wwwroot` so the SPA can load it.

### Step 4: Run and open the Explorer

- Run your API (e.g. `dotnet run` or F5).
- Open `https://localhost:<port>/_devtool` in the browser. The Explorer loads your OpenAPI document and lists your operations; you can try them with path/query/body, set JWT in the Authorize panel, and use “Apply JWT from response” after login if you expose a login endpoint.

### Step 5 (optional): Foreign-key dropdowns in the Explorer

For request body or path parameters that are foreign keys (e.g. `categoryId`, `productId`), the Explorer can show a dropdown filled from a list endpoint instead of a number input.

- In your OpenAPI schema, set the **description** of that property to the pattern: `Foreign key to <EntityName>` (e.g. `Foreign key to Category`). With Swashbuckle annotations you can do:

  ```csharp
  [property: SwaggerSchema(Description = "Foreign key to Category")] int CategoryId
  ```

- The Explorer looks for a GET list endpoint for that entity (e.g. `/api/categories` for “Category”) and uses it to build the options. Ensure your API exposes a GET endpoint that returns an array of items with `id` and a label field (`name`, `title`, or `code`).

---

## Project layout (this repo)

- **DevTool.WebApi** – This project: sample API + dev tool integration.
- **DevTool.UI** – ASP.NET Core host and NuGet package for the Explorer; builds the frontend and provides `MapDevToolUi` and options.
- **dev-tool-ui** – React (Bun + Tailwind) app: API Explorer UI source.

For more on the UI package (contents, building the package, standalone usage), see **DevTool.UI/README.md**.
