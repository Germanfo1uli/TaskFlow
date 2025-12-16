using System.Collections.Generic;

namespace Backend.Shared.DTOs
{
    public record UserPermissionsResponse(
       long UserId,
       long ProjectId,
       HashSet<string> Permissions,
       bool IsOwner
   );
}