using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;

namespace DevTool.WebApi.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/orders").WithTags("Orders");

        group.MapGet("/", async (IOrderService service, CancellationToken ct) =>
        {
            var orders = await service.GetAllAsync(ct);
            return Results.Ok(orders);
        }).WithName("GetAllOrders");

        group.MapGet("/{id:int}", async (int id, IOrderService service, CancellationToken ct) =>
        {
            var order = await service.GetByIdAsync(id, ct);
            return order is null ? Results.NotFound() : Results.Ok(order);
        }).WithName("GetOrderById");

        group.MapPost("/", async (CreateOrderRequest request, IOrderService service, CancellationToken ct) =>
        {
            var order = await service.CreateAsync(request, ct);
            return Results.Created($"/api/orders/{order.Id}", order);
        }).WithName("CreateOrder");
    }
}
