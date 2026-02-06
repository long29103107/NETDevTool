using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace DevTool.UI.Middleware;

/// <summary>
/// Options for mapping and caching Swagger/OpenAPI JSON in the DevTool UI wwwroot.
/// </summary>
public class SwaggerJsonOptions
{
    /// <summary>
    /// File name used to cache and serve the OpenAPI document (e.g. "swagger.json").
    /// </summary>
    public string SwaggerJsonFileName { get; set; } = "swagger.json";

    /// <summary>
    /// When true (default), the OpenAPI document is cached in the host application's wwwroot (e.g. {HostProject}/wwwroot/swagger.json).
    /// When false, use CacheSubpath under DevTool.UI wwwroot.
    /// </summary>
    public bool CacheToHostWwwRoot { get; set; } = true;

    /// <summary>
    /// Subpath under DevTool.UI wwwroot where the OpenAPI document is cached when CacheToHostWwwRoot is false (e.g. "swagger").
    /// Ignored when CacheToHostWwwRoot is true; then the file is at host wwwroot root.
    /// </summary>
    public string CacheSubpath { get; set; } = "swagger";

    /// <summary>
    /// Path on the same host to fetch the OpenAPI document (e.g. "/openapi/v1.json").
    /// The URL is built from the current request's scheme and host.
    /// </summary>
    public string OpenApiPath { get; set; } = "/openapi/v1.json";
}

/// <summary>
/// Extensions to serve a SPA with fallback to index.html for client-side routing.
/// Use after UseDefaultFiles() and UseStaticFiles().
/// </summary>
public static class SpaFallbackExtensions
{
    /// <summary>
    /// Maps fallback to the given file (default index.html) so unmatched routes are served the SPA entry.
    /// Call this after UseStaticFiles() so API and static file routes take precedence.
    /// </summary>
    public static IEndpointRouteBuilder MapDevToolSpaFallback(this IEndpointRouteBuilder endpoints, string fallbackFile = "index.html")
    {
        endpoints.MapFallbackToFile(fallbackFile);
        return endpoints;
    }

    /// <summary>
    /// Maps fallback to the given file when used inside a Map branch (IApplicationBuilder).
    /// Call after UseDefaultFiles() and UseStaticFiles() within the branch.
    /// </summary>
    public static IApplicationBuilder MapDevToolSpaFallback(this IApplicationBuilder app, string fallbackFile = "index.html")
    {
        if (app is IEndpointRouteBuilder routeBuilder)
            routeBuilder.MapFallbackToFile(fallbackFile);
        return app;
    }

    /// <summary>
    /// Middleware that serves the SPA fallback file (e.g. index.html) when no static file was served.
    /// Use inside a Map branch after UseStaticFiles(); the branch's IApplicationBuilder is not an IEndpointRouteBuilder, so MapFallbackToFile is never registered without this.
    /// When basePath is set (e.g. "/_devtool"), injects a &lt;base href="basePath/"&gt; so relative assets and React Router resolve correctly under the subpath.
    /// </summary>
    /// <param name="wwwRootPath">Optional wwwroot directory for the SPA fallback file.</param>
    private static IApplicationBuilder UseSpaFallback(this IApplicationBuilder app, string fallbackFile = "index.html", string? basePath = null, string? wwwRootPath = null)
    {
        var fallbackPath = !string.IsNullOrEmpty(wwwRootPath)
            ? Path.Combine(wwwRootPath, fallbackFile)
            : Path.Combine(Path.GetDirectoryName(typeof(SpaFallbackExtensions).Assembly.Location) ?? "", "wwwroot", fallbackFile);
        if (!File.Exists(fallbackPath))
            return app;

        var baseTag = string.IsNullOrEmpty(basePath)
            ? null
            : $"<base href=\"{basePath.TrimEnd('/')}/\" />";

        app.Use(async (context, next) =>
        {
            await next(context);
            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 200;
                context.Response.ContentType = "text/html";
                if (baseTag == null)
                {
                    await context.Response.SendFileAsync(fallbackPath);
                }
                else
                {
                    var html = await File.ReadAllTextAsync(fallbackPath);
                    var insertAfter = "<head>";
                    var idx = html.IndexOf(insertAfter, StringComparison.OrdinalIgnoreCase);
                    var body = idx >= 0
                        ? html.AsSpan(0, idx + insertAfter.Length).ToString() + "\n    " + baseTag + "\n" + html.AsSpan(idx + insertAfter.Length).ToString()
                        : baseTag + "\n" + html;
                    context.Response.ContentLength = body.Length;
                    await context.Response.WriteAsync(body);
                }
            }
        });
        return app;
    }

    /// <summary>
    /// Resolves DevTool.UI project wwwroot path (e.g. ...\DevTool.UI\wwwroot) from this source file location.
    /// </summary>
    private static string GetDevToolProjectWwwRoot([CallerFilePath] string sourceFilePath = "")
    {
        var middlewareDir = Path.GetDirectoryName(sourceFilePath) ?? "";
        return Path.GetFullPath(Path.Combine(middlewareDir, "..", "wwwroot"));
    }

    /// <summary>
    /// Maps the DevTool UI SPA at the given path (e.g. "/_devtool"). Serves static files from DevTool.UI project wwwroot and falls back to index.html for client-side routing.
    /// wwwRoot is always ...\DevTool.UI\wwwroot (resolved from source path). Allows access to /_devtool and /_devtool/* for React Router DOM.
    /// </summary>
    public static IApplicationBuilder MapDevToolUi(this IApplicationBuilder app, string path = "/_devtool", string fallbackFile = "index.html")
        => MapDevToolUi(app, path, fallbackFile, new SwaggerJsonOptions());

    /// <summary>
    /// Maps the DevTool UI SPA at the given path with configurable Swagger/OpenAPI JSON mapping.
    /// </summary>
    /// <param name="configureSwagger">Optional action to configure where and how swagger.json is cached and fetched.</param>
    public static IApplicationBuilder MapDevToolUi(this IApplicationBuilder app, string path, string fallbackFile, Action<SwaggerJsonOptions>? configureSwagger)
    {
        var swaggerOptions = new SwaggerJsonOptions();
        configureSwagger?.Invoke(swaggerOptions);
        return MapDevToolUi(app, path, fallbackFile, swaggerOptions);
    }

    /// <summary>
    /// Maps the DevTool UI SPA at the given path with Swagger JSON options.
    /// </summary>
    public static IApplicationBuilder MapDevToolUi(this IApplicationBuilder app, string path, string fallbackFile, SwaggerJsonOptions swaggerOptions)
    {
        var wwwRoot = GetDevToolProjectWwwRoot();
        var spaRoot = Path.Combine(wwwRoot, "dev-tool-ui");
        if (!Directory.Exists(spaRoot))
            return app;

        var spaFileProvider = new PhysicalFileProvider(spaRoot);
        var wwwRootFileProvider = new PhysicalFileProvider(wwwRoot);
        var swaggerFileName = string.IsNullOrWhiteSpace(swaggerOptions.SwaggerJsonFileName) ? "swagger.json" : swaggerOptions.SwaggerJsonFileName.Trim();
        var openApiPath = string.IsNullOrWhiteSpace(swaggerOptions.OpenApiPath) ? "/openapi/v1.json" : swaggerOptions.OpenApiPath.Trim();

        string swaggerCacheDir;
        IFileProvider? hostWwwRootFileProvider = null;
        if (swaggerOptions.CacheToHostWwwRoot)
        {
            var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
            var contentRoot = (env.ContentRootPath ?? "").TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            // Always use host's wwwroot subfolder; create it if it doesn't exist.
            var hostWwwRoot = string.IsNullOrEmpty(env.WebRootPath)
                ? Path.Combine(contentRoot, "wwwroot")
                : env.WebRootPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            if (!string.IsNullOrEmpty(contentRoot))
            {
                swaggerCacheDir = hostWwwRoot;
                if (!Directory.Exists(hostWwwRoot))
                {
                    Directory.CreateDirectory(hostWwwRoot);
                }
                hostWwwRootFileProvider = new PhysicalFileProvider(hostWwwRoot);
            }
            else
            {
                var cacheSubpath = string.IsNullOrWhiteSpace(swaggerOptions.CacheSubpath) ? "" : swaggerOptions.CacheSubpath.Trim().TrimStart('/', '\\');
                swaggerCacheDir = string.IsNullOrEmpty(cacheSubpath) ? wwwRoot : Path.Combine(wwwRoot, cacheSubpath);
            }
        }
        else
        {
            var cacheSubpath = string.IsNullOrWhiteSpace(swaggerOptions.CacheSubpath) ? "swagger" : swaggerOptions.CacheSubpath.Trim().TrimStart('/', '\\');
            swaggerCacheDir = Path.Combine(wwwRoot, cacheSubpath);
        }

        app.Map(path, devToolApp =>
        {
            devToolApp.Use(async (context, next) =>
            {
                // On every access to /_devtool/*, fetch fresh swagger and cache to wwwroot.
                Directory.CreateDirectory(swaggerCacheDir);
                var filePath = Path.Combine(swaggerCacheDir, swaggerFileName);
                try
                {
                    var swaggerJson = await FetchSwaggerJsonAsync(context.Request, openApiPath);
                    await File.WriteAllTextAsync(filePath, swaggerJson);
                }
                catch
                {
                    // If fetch fails, continue; existing file may still be served
                }

                await next(context);
            });

            devToolApp.UseDefaultFiles(new DefaultFilesOptions { FileProvider = spaFileProvider });
            devToolApp.UseStaticFiles(new StaticFileOptions { FileProvider = spaFileProvider });
            devToolApp.UseStaticFiles(new StaticFileOptions { FileProvider = wwwRootFileProvider });
            if (hostWwwRootFileProvider != null)
                devToolApp.UseStaticFiles(new StaticFileOptions { FileProvider = hostWwwRootFileProvider });
            devToolApp.UseSpaFallback(fallbackFile: fallbackFile, basePath: path, wwwRootPath: spaRoot);
        });
        return app;
    }

    private static async Task<string> FetchSwaggerJsonAsync(HttpRequest request, string openApiPath)
    {
        var path = openApiPath.StartsWith('/') ? openApiPath : "/" + openApiPath;
        var url = $"{request.Scheme}://{request.Host}{path}";
        using var client = new HttpClient();
        return await client.GetStringAsync(url);
    }
}
