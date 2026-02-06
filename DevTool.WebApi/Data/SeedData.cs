using DevTool.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTool.WebApi.Data;

public static class SeedData
{
    public static async Task SeedProductsAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Products.AnyAsync(ct)) return;

        var products = new[]
        {
            new Product { Id = 1, Name = "Widget A", Description = "Small widget", Price = 9.99m, Stock = 100, CreatedAt = DateTime.UtcNow },
            new Product { Id = 2, Name = "Gadget B", Description = "Medium gadget", Price = 24.50m, Stock = 50, CreatedAt = DateTime.UtcNow },
            new Product { Id = 3, Name = "Tool C", Description = "Heavy-duty tool", Price = 99.00m, Stock = 20, CreatedAt = DateTime.UtcNow }
        };
        await db.Products.AddRangeAsync(products, ct);
        await db.SaveChangesAsync(ct);
    }
}
