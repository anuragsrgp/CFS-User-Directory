
using UserDirectory.API.DTOs;
using UserDirectory.API.Models;
using UserDirectory.API.Repositories;

namespace UserDirectory.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync(
        CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);

        return users.Select(MapToResponse).ToList();
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);

        return user is null ? null : MapToResponse(user);
    }

    public async Task<UserResponseDto> CreateUserAsync(
        CreateUserDto request,
        CancellationToken cancellationToken = default)
    {
        var user = new User
        {
            Name = request.Name.Trim(),
            Age = request.Age,
            City = request.City.Trim(),
            State = request.State.Trim(),
            Pincode = request.Pincode.Trim()
        };

        var createdUser = await _userRepository.AddAsync(
            user, cancellationToken);

        return MapToResponse(createdUser);
    }

    public async Task<UserResponseDto?> UpdateUserAsync(
        int id,
        UpdateUserDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);

        if (user is null)
        {
            return null;
        }

        user.Name = request.Name.Trim();
        user.Age = request.Age;
        user.City = request.City.Trim();
        user.State = request.State.Trim();
        user.Pincode = request.Pincode.Trim();

        await _userRepository.UpdateAsync(user, cancellationToken);

        return MapToResponse(user);
    }

    public async Task<bool> DeleteUserAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _userRepository.DeleteAsync(id, cancellationToken);
    }

    private static UserResponseDto MapToResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Age = user.Age,
            City = user.City,
            State = user.State,
            Pincode = user.Pincode
        };
    }
}
