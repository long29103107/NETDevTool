using DevTool.WebApi.DTOs;

namespace DevTool.WebApi.Services;

public interface IOrderService
{
    Task<IReadOnlyList<OrderResponse>> GetAllAsync(CancellationToken ct = default);
    Task<OrderResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken ct = default);
}
