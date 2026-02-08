using DevTool.WebApi.Data;
using DevTool.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTool.WebApi.Repositories;

public class CategoryRepository(AppDbContext db) : ICategoryRepository
{
    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default) =>
        await db.Categories.OrderBy(c => c.Name).ToListAsync(ct);

    public async Task<Category?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Categories.FindAsync([id], ct);

    public async Task<Category> AddAsync(Category category, CancellationToken ct = default)
    {
        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);
        return category;
    }

    public async Task<Category?> UpdateAsync(int id, Action<Category> update, CancellationToken ct = default)
    {
        var category = await db.Categories.FindAsync([id], ct);
        if (category is null) return null;
        update(category);
        await db.SaveChangesAsync(ct);
        return category;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await db.Categories.FindAsync([id], ct);
        if (category is null) return false;
        
        // Safety check: don't delete categories with products
        var hasProducts = await db.Products.AnyAsync(p => p.CategoryId == id, ct);
        if (hasProducts) return false;

        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
