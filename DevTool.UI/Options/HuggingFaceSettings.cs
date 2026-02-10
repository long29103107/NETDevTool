namespace DevTool.UI.Options;

/// <summary>
/// Represents a Hugging Face (router) model entry.
/// </summary>
public sealed class HuggingFaceSettings
{
    public string Url { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;

    public bool IsEmpty =>
        string.IsNullOrWhiteSpace(Url) &&
        string.IsNullOrWhiteSpace(ApiKey) &&
        string.IsNullOrWhiteSpace(Model);
}
