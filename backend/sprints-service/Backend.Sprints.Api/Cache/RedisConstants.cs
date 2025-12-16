namespace Backend.Sprints.Api.Cache
{
    public static class RedisConstants
    {
        public const string UserRoleKey = "user:{0}:project:{1}";
        public static readonly TimeSpan UserRoleTtl = TimeSpan.FromMinutes(5);

        public const string RolePermissionsKey = "role:{0}:permissions";
        public static readonly TimeSpan RolePermsTtl = TimeSpan.FromMinutes(10);

        public const string RoleIsOwnerKey = "role:{0}:isOwner";
        public static readonly TimeSpan RoleIsOwnerTtl = TimeSpan.FromMinutes(10);
    }

    public enum EntityType
    {
        PROJECT, ISSUE, SPRINT, COMMENT,
        ATTACHMENT, TAG, ANALYTICS, LOGS
    }

    public enum ActionType
    {
        VIEW, CREATE, EDIT, DELETE, ASSIGN, MANAGE,
        TAKE_ISSUE, CREATE_SUBTASK, SUBMIT_FOR_REVIEW,
        TRANSITION_CODE_REVIEW, TRANSITION_QA, FULL_TRANSITION,
        EDIT_OWN, DELETE_OWN, APPLY
    }
}
