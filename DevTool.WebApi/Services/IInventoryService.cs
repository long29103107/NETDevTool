using DevTool.WebApi.DTOs;

namespace DevTool.WebApi.Services;

public interface IInventoryService
{
    Task<IReadOnlyList<InventoryResponse>> GetAllAsync(CancellationToken ct = default);
    Task<InventoryResponse?> GetByProductIdAsync(int productId, CancellationToken ct = default);
    Task<InventoryResponse?> UpdateQuantityAsync(int productId, UpdateInventoryQuantityRequest request, CancellationToken ct = default);
}
