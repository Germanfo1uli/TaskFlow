using System.Collections.Generic;

namespace Backend.Shared.DTOs
{
    public class UserPermissionsResponse
    {
        public long UserId { get; set; }
        public long ProjectId { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }
}