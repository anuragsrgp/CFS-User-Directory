
using System.ComponentModel.DataAnnotations;

namespace UserDirectory.API.DTOs;

public class UpdateUserDto
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Name must be between 2 and 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, 120,
        ErrorMessage = "Age must be between 0 and 120.")]
    public int Age { get; set; }

    [Required(ErrorMessage = "City is required.")]
    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters.")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "State is required.")]
    [StringLength(100, ErrorMessage = "State cannot exceed 100 characters.")]
    public string State { get; set; } = string.Empty;

    [Required(ErrorMessage = "Pincode is required.")]
    [RegularExpression(@"^\d{4,10}$",
        ErrorMessage = "Pincode must contain 4 to 10 digits.")]
    public string Pincode { get; set; } = string.Empty;
}
