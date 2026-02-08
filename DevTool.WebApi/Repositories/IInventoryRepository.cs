using DevTool.WebApi.Entities;

namespace DevTool.WebApi.Repositories;

public interface IInventoryRepository
{
    Task<IReadOnlyList<Inventory>> GetAllAsync(CancellationToken ct = default);
    Task<Inventory?> GetByProductIdAsync(int productId, CancellationToken ct = default);
    Task<Inventory> AddAsync(Inventory inventory, CancellationToken ct = default);
    Task<Inventory?> UpdateAsync(int productId, Action<Inventory> update, CancellationToken ct = default);
}
