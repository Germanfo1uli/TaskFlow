namespace Backend.Shared.DTOs
{
    public class ProjectDto
    {
        public long Id { get; set; }
        public long OwnerId { get; set; } 
        public string Name { get; set; }
        public string Key { get; set; }
    }
}
