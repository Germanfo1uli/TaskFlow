using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Sprints.Api.Models.Entities;

[Table("sprints")]
public class Sprint
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("project_id")]
    public long ProjectId { get; set; }

    [Column("name")]
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Column("goal")]
    [MaxLength(1000)]
    public string? Goal { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("status")]
    public string Status { get; set; } = "planned"; // планируется planned, active, completed?
}