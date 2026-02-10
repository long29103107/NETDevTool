using DevTool.WebApi.DTOs;
using DevTool.WebApi.Services;

namespace DevTool.WebApi.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/orders").WithTags("Order").RequireAuthorization();

        group.MapGet("/", async (IOrderService service, CancellationToken ct) =>
        {
            var orders = await service.GetAllAsync(ct);
            return Results.Ok(orders);
        }).WithName("GetAllOrders")
          .WithSummary("Retrieves all orders")
          .WithDescription("Returns a list of all historical customer orders.");

        group.MapGet("/{id:int}", async (int id, IOrderService service, CancellationToken ct) =>
        {
            var order = await service.GetByIdAsync(id, ct);
            return order is null ? Results.NotFound() : Results.Ok(order);
        }).WithName("GetOrderById")
          .WithSummary("Retrieves an order by ID")
          .WithDescription("Returns the full details of a specific order, including its items.");

        group.MapPost("/", async (CreateOrderRequest request, IOrderService service, CancellationToken ct) =>
        {
            var order = await service.CreateAsync(request, ct);
            return Results.Created($"/api/orders/{order.Id}", order);
        }).WithName("CreateOrder")
          .WithSummary("Creates a new order")
          .WithDescription("Places a new order for one or more products.");

        group.MapGet("/{orderId:int}/items", async (int orderId, IOrderService service, CancellationToken ct) =>
        {
            var items = await service.GetItemsByOrderIdAsync(orderId, ct);
            return items is null ? Results.NotFound() : Results.Ok(items);
        }).WithName("GetOrderItems")
          .WithSummary("Gets items for an order")
          .WithDescription("Returns all line items for the specified order.");

        group.MapGet("/{orderId:int}/items/{itemId:int}", async (int orderId, int itemId, IOrderService service, CancellationToken ct) =>
        {
            var item = await service.GetItemByOrderIdAndItemIdAsync(orderId, itemId, ct);
            return item is null ? Results.NotFound() : Results.Ok(item);
        }).WithName("GetOrderItemById")
          .WithSummary("Gets an order item by ID")
          .WithDescription("Returns a single line item for the specified order.");

        group.MapPost("/{orderId:int}/items", async (int orderId, CreateOrderItemRequest request, IOrderService service, CancellationToken ct) =>
        {
            var (item, orderFound, productFound) = await service.AddItemToOrderAsync(orderId, request, ct);
            if (!productFound) return Results.BadRequest("Product not found.");
            if (!orderFound || item is null) return Results.NotFound();
            return Results.Created($"/api/orders/{orderId}/items/{item.Id}", item!);
        }).WithName("AddOrderItem")
          .WithSummary("Adds an item to an order")
          .WithDescription("Adds a product line item to an existing order.");

        group.MapDelete("/{orderId:int}/items/{itemId:int}", async (int orderId, int itemId, IOrderService service, CancellationToken ct) =>
        {
            await service.DeleteItemAsync(orderId, itemId, ct);
            return Results.NoContent();
        }).WithName("DeleteOrderItem")
          .WithSummary("Deletes an order item")
          .WithDescription("Removes a line item from an order and updates the order total.");

        group.MapDelete("/{id:int}", async (int id, IOrderService service, CancellationToken ct) =>
        {
            await service.DeleteAsync(id, ct);
            return Results.NoContent();
        }).WithName("DeleteOrder")
          .WithSummary("Deletes an order")
          .WithDescription("Deletes an order and all its line items.");
    }
}
