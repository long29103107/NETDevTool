using DevTool.WebApi.Data;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace DevTool.WebApi.Repositories;

public class InventoryRepository(AppDbContext db) : IInventoryRepository
{
    public async Task<IReadOnlyList<Inventory>> GetAllAsync(CancellationToken ct = default) =>
        await db.Inventories.Include(i => i.Product).ToListAsync(ct);

    public async Task<Inventory?> GetByProductIdAsync(int productId, CancellationToken ct = default) =>
        await db.Inventories.Include(i => i.Product).FirstOrDefaultAsync(i => i.ProductId == productId, ct);

    public async Task<Inventory> AddAsync(Inventory inventory, CancellationToken ct = default)
    {
        db.Inventories.Add(inventory);
        await db.SaveChangesAsync(ct);
        return inventory;
    }

    public async Task<Inventory?> UpdateAsync(int productId, Action<Inventory> update, CancellationToken ct = default)
    {
        var inventory = await db.Inventories.FirstOrDefaultAsync(i => i.ProductId == productId, ct);
        if (inventory is null) throw new EntityNotFoundException("Inventory", productId);
        update(inventory);
        inventory.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return inventory;
    }
}
