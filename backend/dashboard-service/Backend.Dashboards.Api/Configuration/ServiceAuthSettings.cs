namespace Backend.Dashboard.Api.Configuration
{
    public class ServiceAuthSettings
    {
        public const string SectionName = "ServiceAuth";

        public string GatewaySecretHeader { get; set; } = "X-Gateway-Source";
        public string GatewaySecretValue { get; set; } = "dev-secret-key-change-in-prod";
        public string ApplicationName { get; set; } = "dashboard-service";
    }
}