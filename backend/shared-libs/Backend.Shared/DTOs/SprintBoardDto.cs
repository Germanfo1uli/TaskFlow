using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Shared.DTOs
{
    public class SprintBoardDto
    {
     
        public long SprintId { get; set; }
       
        public string SprintName { get; set; } = string.Empty;
   
        //public List<long> IssueIds { get; set; } = new List<long>();

        public List<InternalIssueResponse> Issues { get; set; } = new List<InternalIssueResponse>();
    }
}