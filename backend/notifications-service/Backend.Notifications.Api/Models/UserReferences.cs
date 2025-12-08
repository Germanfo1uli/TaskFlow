using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Notifications.Api.Models
{
    public class UserReferences
    {

        [Table("UserPreferences")]
        public class UserPreference
        {
            [Key]
            public long UserId { get; set; } 

            [Key]
            public EventType EventType { get; set; }

        }
    }
}
