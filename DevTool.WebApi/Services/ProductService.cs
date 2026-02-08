using DevTool.WebApi.DTOs;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Repositories;

namespace DevTool.WebApi.Services;

public class ProductService(IProductRepository repository) : IProductService
{
    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(string? name = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, CancellationToken ct = default)
    {
        var products = await repository.GetAllAsync(name, categoryId, minPrice, maxPrice, ct);
        return products.Select(ToResponse).ToList();
    }

    public async Task<ProductResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await repository.GetByIdAsync(id, ct);
        return product is null ? null : ToResponse(product);
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow
        };
        product = await repository.AddAsync(product, ct);
        return ToResponse(product);
    }

    public async Task<ProductResponse?> UpdateAsync(int id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await repository.UpdateAsync(id, p =>
        {
            if (request.Name is { } name) p.Name = name;
            if (request.Description is { } desc) p.Description = desc;
            if (request.Price is { } price) p.Price = price;
            if (request.Stock is { } stock) p.Stock = stock;
            if (request.CategoryId is { } catId) p.CategoryId = catId;
        }, ct);
        return product is null ? null : ToResponse(product);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default) =>
        repository.DeleteAsync(id, ct);

    private static ProductResponse ToResponse(Product p) =>
        new(p.Id, p.Name, p.Description, p.Price, p.Stock, p.CategoryId, p.CreatedAt, p.UpdatedAt);
}
