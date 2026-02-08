using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;

namespace DevTool.WebApi.Endpoints;

public static class InventoryEndpoints
{
    public static void MapInventoryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/inventory").WithTags("Inventory");

        group.MapGet("/", async (IInventoryService service, CancellationToken ct) =>
        {
            var inventory = await service.GetAllAsync(ct);
            return Results.Ok(inventory);
        }).WithName("GetAllInventory")
          .WithSummary("Retrieves all inventory records")
          .WithDescription("Returns a list of inventory status for all products.");

        group.MapGet("/{productId:int}", async (int productId, IInventoryService service, CancellationToken ct) =>
        {
            var inventory = await service.GetByProductIdAsync(productId, ct);
            return inventory is null ? Results.NotFound() : Results.Ok(inventory);
        }).WithName("GetInventoryByProductId")
          .WithSummary("Retrieves inventory for a specific product")
          .WithDescription("Returns the inventory level and location for the product identified by its ID.");

        group.MapPut("/{productId:int}", async (int productId, UpdateInventoryQuantityRequest request, IInventoryService service, CancellationToken ct) =>
        {
            var inventory = await service.UpdateQuantityAsync(productId, request, ct);
            return inventory is null ? Results.NotFound() : Results.Ok(inventory);
        }).WithName("UpdateInventoryQuantity")
          .WithSummary("Updates product inventory")
          .WithDescription("Updates the stock quantity or location for a specific product.");
    }
}
