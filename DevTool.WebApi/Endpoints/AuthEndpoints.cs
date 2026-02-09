using System.Security.Claims;
using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace DevTool.WebApi.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService service, CancellationToken ct) =>
        {
            try
            {
                var user = await service.RegisterAsync(request, ct);
                return Results.Created($"/api/auth/me", user);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { detail = ex.Message });
            }
        })
            .WithName("Register")
            .WithSummary("Register a new user")
            .WithDescription("Creates a new user account. Use the returned user to login.");

        group.MapPost("/login", async (LoginRequest request, IAuthService service, CancellationToken ct) =>
        {
            var response = await service.LoginAsync(request, ct);
            return response is null
                ? Results.Unauthorized()
                : Results.Ok(response);
        })
            .WithName("Login")
            .WithSummary("Login")
            .WithDescription("Returns a JWT token. Use it in the Authorization header as Bearer <token>.");

        group.MapGet("/me", [Authorize] (ClaimsPrincipal user) =>
        {
            var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = user.FindFirstValue(ClaimTypes.Email);
            var name = user.FindFirstValue(ClaimTypes.Name);
            if (id is null || email is null) return Results.Unauthorized();
            return Results.Ok(new UserResponse(int.Parse(id), email, name ?? "", default));
        })
            .WithName("GetCurrentUser")
            .WithSummary("Get current user (requires login)")
            .WithDescription("Simulates authorized access: returns the current user from the JWT. Call with Authorization: Bearer <token>.");
    }
}