using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;

namespace DevTool.WebApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products").WithTags("Product").RequireAuthorization();

        group.MapGet("/", async (string? name, int? categoryId, decimal? minPrice, decimal? maxPrice, IProductService service, CancellationToken ct) =>
            {
                var products = await service.GetAllAsync(name, categoryId, minPrice, maxPrice, ct);
                return Results.Ok(products);
            })
            .WithName("GetAllProducts")
            .WithSummary("Retrieves all products")
            .WithDescription("Returns a list of all products currently available in the catalog, with optional filtering by name, category, and price range.");

        group.MapGet("/{id:int}", async (int id, IProductService service, CancellationToken ct) =>
            {
                var product = await service.GetByIdAsync(id, ct);
                return product is null ? Results.NotFound() : Results.Ok(product);
            })
            .WithName("GetProductById")
            .WithSummary("Retrieves a product by ID")
            .WithDescription("Returns a single product based on its unique identifier.");

        group.MapPost("/", async (CreateProductRequest request, IProductService service, CancellationToken ct) =>
            {
                var product = await service.CreateAsync(request, ct);
                return Results.Created($"/api/products/{product.Id}", product);
            })
            .WithName("CreateProduct")
            .WithSummary("Creates a new product")
            .WithDescription("Adds a new product to the catalog with the provided details.");

        group.MapPut("/{id:int}", async (int id, UpdateProductRequest request, IProductService service, CancellationToken ct) =>
            {
                var product = await service.UpdateAsync(id, request, ct);
                return product is null ? Results.NotFound() : Results.Ok(product);
            })
            .WithName("UpdateProduct")
            .WithSummary("Updates an existing product")
            .WithDescription("Updates the details of an existing product identified by its ID.");

        group.MapDelete("/{id:int}", async (int id, IProductService service, CancellationToken ct) =>
            {
                var deleted = await service.DeleteAsync(id, ct);
                return deleted ? Results.NoContent() : Results.NotFound();
            })
            .WithName("DeleteProduct")
            .WithSummary("Deletes a product")
            .WithDescription("Removes a product from the catalog by its unique identifier.");
    }
}
