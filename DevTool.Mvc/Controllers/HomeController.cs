using Microsoft.AspNetCore.Mvc;

namespace DevTool.Mvc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
    /// <summary>Returns a simple greeting.</summary>
    [HttpGet]
    public IActionResult Get() => Ok(new { message = "Hello from DevTool.Mvc", timestamp = DateTime.UtcNow });
}
