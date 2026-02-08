using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;

namespace DevTool.WebApi.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/categories").WithTags("Categories");

        group.MapGet("/", async (ICategoryService service, CancellationToken ct) =>
        {
            var categories = await service.GetAllAsync(ct);
            return Results.Ok(categories);
        }).WithName("GetAllCategories");

        group.MapGet("/{id:int}", async (int id, ICategoryService service, CancellationToken ct) =>
        {
            var category = await service.GetByIdAsync(id, ct);
            return category is null ? Results.NotFound() : Results.Ok(category);
        }).WithName("GetCategoryById");

        group.MapPost("/", async (CreateCategoryRequest request, ICategoryService service, CancellationToken ct) =>
        {
            var category = await service.CreateAsync(request, ct);
            return Results.Created($"/api/categories/{category.Id}", category);
        }).WithName("CreateCategory");

        group.MapPut("/{id:int}", async (int id, UpdateCategoryRequest request, ICategoryService service, CancellationToken ct) =>
        {
            var category = await service.UpdateAsync(id, request, ct);
            return category is null ? Results.NotFound() : Results.Ok(category);
        }).WithName("UpdateCategory");

        group.MapDelete("/{id:int}", async (int id, ICategoryService service, CancellationToken ct) =>
        {
            var deleted = await service.DeleteAsync(id, ct);
            return deleted ? Results.NoContent() : Results.Problem("Cannot delete category (it may contain products or not exist)", statusCode: 400);
        }).WithName("DeleteCategory");
    }
}
