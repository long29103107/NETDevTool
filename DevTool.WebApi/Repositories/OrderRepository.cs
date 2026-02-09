using DevTool.WebApi.Data;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Exceptions;
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

    public async Task<IReadOnlyList<OrderItem>?> GetItemsByOrderIdAsync(int orderId, CancellationToken ct = default)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);
        return order?.Items.ToList();
    }

    public async Task<OrderItem?> GetItemByOrderIdAndItemIdAsync(int orderId, int itemId, CancellationToken ct = default)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);
        return order?.Items.FirstOrDefault(i => i.Id == itemId);
    }

    public async Task<OrderItem?> AddItemAsync(int orderId, OrderItem item, CancellationToken ct = default)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order is null) return null;

        item.OrderId = orderId;
        order.Items.Add(item);
        order.TotalAmount += item.Quantity * item.UnitPrice;
        await db.SaveChangesAsync(ct);
        return item;
    }

    public async Task DeleteAsync(int orderId, CancellationToken ct = default)
    {
        var order = await db.Orders.FindAsync([orderId], ct);
        if (order is null) throw new EntityNotFoundException("Order", orderId);
        db.Orders.Remove(order);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteItemAsync(int orderId, int itemId, CancellationToken ct = default)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order is null) throw new EntityNotFoundException("Order", orderId);

        var item = order.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null) throw new EntityNotFoundException("OrderItem", itemId);

        order.Items.Remove(item);
        order.TotalAmount -= item.Quantity * item.UnitPrice;
        await db.SaveChangesAsync(ct);
    }
}
