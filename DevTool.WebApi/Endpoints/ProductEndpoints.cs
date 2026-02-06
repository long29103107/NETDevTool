using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;

namespace DevTool.WebApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", async (IProductService service, CancellationToken ct) =>
            {
                var products = await service.GetAllAsync(ct);
                return Results.Ok(products);
            })
            .WithName("GetAllProducts");

        group.MapGet("/{id:int}", async (int id, IProductService service, CancellationToken ct) =>
            {
                var product = await service.GetByIdAsync(id, ct);
                return product is null ? Results.NotFound() : Results.Ok(product);
            })
            .WithName("GetProductById");

        group.MapPost("/", async (CreateProductRequest request, IProductService service, CancellationToken ct) =>
            {
                var product = await service.CreateAsync(request, ct);
                return Results.Created($"/api/products/{product.Id}", product);
            })
            .WithName("CreateProduct");

        group.MapPut("/{id:int}", async (int id, UpdateProductRequest request, IProductService service, CancellationToken ct) =>
            {
                var product = await service.UpdateAsync(id, request, ct);
                return product is null ? Results.NotFound() : Results.Ok(product);
            })
            .WithName("UpdateProduct");

        group.MapDelete("/{id:int}", async (int id, IProductService service, CancellationToken ct) =>
            {
                var deleted = await service.DeleteAsync(id, ct);
                return deleted ? Results.NoContent() : Results.NotFound();
            })
            .WithName("DeleteProduct");
    }
}
