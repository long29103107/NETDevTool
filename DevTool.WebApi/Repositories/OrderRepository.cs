using DevTool.WebApi.Data;
using DevTool.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTool.WebApi.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default) =>
        await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product).OrderByDescending(o => o.OrderDate).ToListAsync(ct);

    public async Task<Order?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product).FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<Order> AddAsync(Order order, CancellationToken ct = default)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        return order;
    }
}
