namespace DevTool.UI.Models;

/// <summary>
/// Request body for the /prompt endpoint.
/// </summary>
public sealed record PromptReq
{
    public string Prompt { get; init; } = string.Empty;
}