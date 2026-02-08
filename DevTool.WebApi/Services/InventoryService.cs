using DevTool.WebApi.DTOs;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Repositories;

namespace DevTool.WebApi.Services;

public class InventoryService(IInventoryRepository repository) : IInventoryService
{
    public async Task<IReadOnlyList<InventoryResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var inventories = await repository.GetAllAsync(ct);
        return inventories.Select(ToResponse).ToList();
    }

    public async Task<InventoryResponse?> GetByProductIdAsync(int productId, CancellationToken ct = default)
    {
        var inventory = await repository.GetByProductIdAsync(productId, ct);
        return inventory is null ? null : ToResponse(inventory);
    }

    public async Task<InventoryResponse?> UpdateQuantityAsync(int productId, UpdateInventoryQuantityRequest request, CancellationToken ct = default)
    {
        var inventory = await repository.UpdateAsync(productId, i =>
        {
            i.Quantity = request.Quantity;
            if (request.Location is { } loc) i.Location = loc;
        }, ct);
        return inventory is null ? null : ToResponse(inventory);
    }

    private static InventoryResponse ToResponse(Inventory i) =>
        new(i.Id, i.ProductId, i.Product?.Name ?? "Unknown", i.Quantity, i.Location, i.LastUpdated);
}
