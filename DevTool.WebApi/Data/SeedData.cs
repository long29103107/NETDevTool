using DevTool.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTool.WebApi.Data;

public static class SeedData
{
    public static async Task SeedProductsAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Products.AnyAsync(ct)) return;

        var categories = new[]
        {
            new Category { Name = "Electronics", Code = "ELEC" },
            new Category { Name = "Books", Code = "BOOK" },
            new Category { Name = "Home & Kitchen", Code = "HOME" }
        };
        await db.Categories.AddRangeAsync(categories, ct);
        await db.SaveChangesAsync(ct);

        var products = new[]
        {
            new Product { Name = "Smartphone X", Description = "Latest flagship", Price = 999.99m, Stock = 50, CreatedAt = DateTime.UtcNow, CategoryId = categories[0].Id },
            new Product { Name = "Laptop Pro", Description = "High performance", Price = 1499.50m, Stock = 30, CreatedAt = DateTime.UtcNow, CategoryId = categories[0].Id },
            new Product { Name = "C# in Depth", Description = "Great book", Price = 45.00m, Stock = 100, CreatedAt = DateTime.UtcNow, CategoryId = categories[1].Id },
            new Product { Name = "Coffee Maker", Description = "Automatic", Price = 89.00m, Stock = 20, CreatedAt = DateTime.UtcNow, CategoryId = categories[2].Id }
        };
        await db.Products.AddRangeAsync(products, ct);
        await db.SaveChangesAsync(ct);

        var inventories = products.Select(p => new Inventory
        {
            ProductId = p.Id,
            Quantity = p.Stock,
            Location = "Warehouse A",
            LastUpdated = DateTime.UtcNow
        });
        await db.Inventories.AddRangeAsync(inventories, ct);

        var order = new Order
        {
            CustomerName = "John Doe",
            OrderDate = DateTime.UtcNow.AddDays(-1),
            TotalAmount = 1044.99m,
            Items = new List<OrderItem>
            {
                new OrderItem { ProductId = products[0].Id, Quantity = 1, UnitPrice = 999.99m },
                new OrderItem { ProductId = products[2].Id, Quantity = 1, UnitPrice = 45.00m }
            }
        };
        await db.Orders.AddAsync(order, ct);

        await db.SaveChangesAsync(ct);
    }
}
