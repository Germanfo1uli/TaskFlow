using System.ComponentModel.DataAnnotations;

namespace Backend.Shared.DTOs;


public record UserDto
{
    public long Id { get; init; }

    [Required]
    public string Username { get; init; } = string.Empty;

    [Required]
    public string Tag { get; init; } = string.Empty;

    public string? Bio { get; init; }

    public DateTime CreatedAt { get; init; }
}