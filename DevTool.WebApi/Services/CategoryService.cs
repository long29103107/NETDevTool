using DevTool.WebApi.DTOs;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Repositories;

namespace DevTool.WebApi.Services;

public class CategoryService(ICategoryRepository repository) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var categories = await repository.GetAllAsync(ct);
        return categories.Select(ToResponse).ToList();
    }

    public async Task<CategoryResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var category = await repository.GetByIdAsync(id, ct);
        return category is null ? null : ToResponse(category);
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var category = new Category
        {
            Name = request.Name,
            Code = request.Code
        };
        category = await repository.AddAsync(category, ct);
        return ToResponse(category);
    }

    public async Task<CategoryResponse?> UpdateAsync(int id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var category = await repository.UpdateAsync(id, c =>
        {
            if (request.Name is { } name) c.Name = name;
            if (request.Code is { } code) c.Code = code;
        }, ct);
        return category is null ? null : ToResponse(category);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default) =>
        repository.DeleteAsync(id, ct);

    private static CategoryResponse ToResponse(Category c) =>
        new(c.Id, c.Name, c.Code);
}
