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
        }).WithName("GetAllCategories")
          .WithSummary("Retrieves all categories")
          .WithDescription("Returns a list of all product categories available.");

        group.MapGet("/{id:int}", async (int id, ICategoryService service, CancellationToken ct) =>
        {
            var category = await service.GetByIdAsync(id, ct);
            return category is null ? Results.NotFound() : Results.Ok(category);
        }).WithName("GetCategoryById")
          .WithSummary("Retrieves a category by ID")
          .WithDescription("Returns details of a single category identified by its ID.");

        group.MapPost("/", async (CreateCategoryRequest request, ICategoryService service, CancellationToken ct) =>
        {
            var category = await service.CreateAsync(request, ct);
            return Results.Created($"/api/categories/{category.Id}", category);
        }).WithName("CreateCategory")
          .WithSummary("Creates a new category")
          .WithDescription("Adds a new product category to the system.");

        group.MapPut("/{id:int}", async (int id, UpdateCategoryRequest request, ICategoryService service, CancellationToken ct) =>
        {
            var category = await service.UpdateAsync(id, request, ct);
            return category is null ? Results.NotFound() : Results.Ok(category);
        }).WithName("UpdateCategory")
          .WithSummary("Updates an existing category")
          .WithDescription("Modifies an existing product category's details.");

        group.MapDelete("/{id:int}", async (int id, ICategoryService service, CancellationToken ct) =>
        {
            var deleted = await service.DeleteAsync(id, ct);
            return deleted ? Results.NoContent() : Results.Problem("Cannot delete category (it may contain products or not exist)", statusCode: 400);
        }).WithName("DeleteCategory")
          .WithSummary("Deletes a category")
          .WithDescription("Removes a category if it has no associated products.");
    }
}
