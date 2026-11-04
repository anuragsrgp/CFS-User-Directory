
using Microsoft.AspNetCore.Mvc;
using UserDirectory.API.DTOs;
using UserDirectory.API.Services;

namespace UserDirectory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // GET: api/users
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers(
        CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllUsersAsync(cancellationToken);

        return Ok(users);
    }

    // GET: api/users/1
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> GetUserById(
        int id,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "User ID must be greater than zero." });
        }

        var user = await _userService.GetUserByIdAsync(id, cancellationToken);

        if (user is null)
        {
            return NotFound(new { message = $"User with ID {id} was not found." });
        }

        return Ok(user);
    }

    // POST: api/users
    [HttpPost]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResponseDto>> CreateUser(
        [FromBody] CreateUserDto request,
        CancellationToken cancellationToken)
    {
        var createdUser = await _userService.CreateUserAsync(
            request, cancellationToken);

        return CreatedAtAction(
            nameof(GetUserById),
            new { id = createdUser.Id },
            createdUser);
    }

    // PUT: api/users/1
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResponseDto>> UpdateUser(
        int id,
        [FromBody] UpdateUserDto request,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "User ID must be greater than zero." });
        }

        var updatedUser = await _userService.UpdateUserAsync(
            id, request, cancellationToken);

        if (updatedUser is null)
        {
            return NotFound(new { message = $"User with ID {id} was not found." });
        }

        return Ok(updatedUser);
    }

    // DELETE: api/users/1
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(
        int id,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "User ID must be greater than zero." });
        }

        var deleted = await _userService.DeleteUserAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new { message = $"User with ID {id} was not found." });
        }

        return NoContent();
    }
}
