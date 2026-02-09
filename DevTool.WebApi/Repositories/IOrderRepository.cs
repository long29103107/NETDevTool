using DevTool.WebApi.Entities;

namespace DevTool.WebApi.Repositories;

public interface IOrderRepository
{
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default);
    Task<Order?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Order> AddAsync(Order order, CancellationToken ct = default);
    Task<IReadOnlyList<OrderItem>?> GetItemsByOrderIdAsync(int orderId, CancellationToken ct = default);
    Task<OrderItem?> GetItemByOrderIdAndItemIdAsync(int orderId, int itemId, CancellationToken ct = default);
    Task<OrderItem?> AddItemAsync(int orderId, OrderItem item, CancellationToken ct = default);
    Task DeleteAsync(int orderId, CancellationToken ct = default);
    Task DeleteItemAsync(int orderId, int itemId, CancellationToken ct = default);
}
