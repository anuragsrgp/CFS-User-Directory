
using UserDirectory.API.DTOs;

namespace UserDirectory.API.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync(
        CancellationToken cancellationToken = default);

    Task<UserResponseDto?> GetUserByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<UserResponseDto> CreateUserAsync(
        CreateUserDto request,
        CancellationToken cancellationToken = default);

    Task<UserResponseDto?> UpdateUserAsync(
        int id,
        UpdateUserDto request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteUserAsync(
        int id,
        CancellationToken cancellationToken = default);
}
