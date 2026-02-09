# DevTool.UI

ASP.NET Core host and static UI for the **API Explorer** dev tool. The package includes the built React SPA under `wwwroot/dev-tool-ui` and middleware to serve it (optionally under a path like `/_devtool`) and to cache your API’s OpenAPI/Swagger document.

## What it does

- **Serves the API Explorer SPA** – Single-page app that loads your API’s OpenAPI (Swagger) JSON and lets you:
  - Browse operations by tag/group
  - Fill path, query, and body parameters (with basic validation)
  - Send requests and view responses
  - Use JWT: set a token in the UI, “Apply JWT from response” after login, and optional default auth body
  - Use foreign-key dropdowns for fields described as “Foreign key to &lt;Entity&gt;” (e.g. category list for `categoryId`)

- **Optional integration** – Use `MapDevToolUi(path)` to mount the UI at a path (e.g. `/_devtool`) in an existing app. The middleware can fetch your OpenAPI document from the same host and cache it (e.g. in the host’s `wwwroot`) so the SPA can load it.

## Package contents

- **Assembly** – `DevTool.UI.dll` with middleware and options (e.g. `MapDevToolUi`, `SwaggerJsonOptions`, SPA fallback).
- **Static files** – Pre-built UI under `wwwroot/dev-tool-ui` (HTML, JS, CSS). Include these in your app’s serving path (e.g. next to the app or in your own `wwwroot`) so the middleware or static files middleware can serve them.

## Requirements

- **.NET 10** (or the TFM you build against)
- **Bun** (only if you build the frontend from source in the repo; the package ships the built assets)

## Building the package

From the solution directory:

1. Build the project (this builds the frontend and copies it to `wwwroot/dev-tool-ui`):
   ```bash
   dotnet build DevTool.UI/DevTool.UI.csproj
   ```
2. Pack the NuGet package:
   ```bash
   dotnet pack DevTool.UI/DevTool.UI.csproj -c Release -o ./nupkgs
   ```

The resulting `.nupkg` includes the DLL and `wwwroot/dev-tool-ui` with the built SPA.

## Using the UI (standalone)

Run the DevTool.UI project and open the app in the browser. It serves the SPA from the project’s `wwwroot`. Point the in-app “OpenAPI URL” to your API’s OpenAPI/Swagger URL (e.g. `https://localhost:5235/openapi/v1.json`).

## Using the UI in your app (MapDevToolUi)

When you reference the package and want to host the Explorer under a path (e.g. `/_devtool`):

1. Ensure the built `wwwroot/dev-tool-ui` from the package is available to your app (e.g. copy from the package’s `wwwroot` into your project’s `wwwroot`, or use a file provider that points at the package content).
2. Call `MapDevToolUi(path)` (or the overload with `SwaggerJsonOptions`) in your pipeline after `UseRouting` (or in the appropriate `Map` branch). The middleware serves the SPA and can fetch/cache your OpenAPI document from the same host.

See the project’s middleware (e.g. `SpaFallbackExtensions`, `SwaggerJsonOptions`) for configuration (OpenAPI path, cache location, base path).

## Project layout (source repo)

- **DevTool.UI** – ASP.NET Core app and NuGet package project; builds the frontend and copies it to `wwwroot/dev-tool-ui`.
- **dev-tool-ui** – React (Bun + Vite-style build) app: API Explorer UI, OpenAPI loading, payload forms, JWT, foreign-key selects.
- **DevTool.WebApi** – Sample API with OpenAPI, auth, and entities used to develop and test the Explorer.

## License

See the repository license.
