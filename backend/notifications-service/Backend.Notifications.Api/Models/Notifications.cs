using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Notifications.Api.Models

{
    [Table("Notifications")]
    public class Notifications
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [ForeignKey("User")]
        public long UserId { get; set; }

        [ForeignKey("TriggeringUser")]
        public long? TriggeredBy { get; set; }

        [Required]
        public EventType Type { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; }

        [Required]
        public EntityType EntityType { get; set; }

        public long? EntityId { get; set; }

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

public enum EntityType {

    Project,
    ProjectRole,
    Issue,
    Comment,
    Attachment
}

public enum EventType
{
    // События, связанные с проектами
    ProjectCreated = 1,
    ProjectUpdated = 2,
    ProjectDeleted = 3,

    // События, связанные с ролями в проекте
    ProjectRoleAssigned = 11,
    ProjectRoleRemoved = 12,

    // События, связанные с задачами
    IssueCreated = 21,
    IssueAssigned = 22,
    IssueUpdated = 23,
    IssueStatusChanged = 24,
    IssueResolved = 25,
    IssueClosed = 26,

    // События, связанные с комментариями
    CommentAdded = 31,
    CommentUpdated = 32,
    CommentDeleted = 33,

    // События, связанные с вложениями
    AttachmentAdded = 41,
    AttachmentRemoved = 42,

}


