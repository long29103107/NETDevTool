using DevTool.WebApi.Entities;

namespace DevTool.WebApi.Repositories;

public interface IOrderRepository
{
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default);
    Task<Order?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Order> AddAsync(Order order, CancellationToken ct = default);
}
