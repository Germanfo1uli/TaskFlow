using Backend.Dashboard.Api.Configuration;
using Microsoft.Extensions.Options;

namespace Backend.Dashboard.Api.Handlers
{
    public class InternalAuthHandler : DelegatingHandler
    {
        private readonly ServiceAuthSettings _settings;

        public InternalAuthHandler(IOptions<ServiceAuthSettings> settings)
        {
            _settings = settings.Value;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            request.Headers.TryAddWithoutValidation(_settings.GatewaySecretHeader, _settings.GatewaySecretValue);
            request.Headers.TryAddWithoutValidation("X-Source-Service", _settings.ApplicationName);

            request.Headers.Remove("X-User-Id");
            request.Headers.Remove("X-User-Role");
            request.Headers.Remove("X-User-Email");
            request.Headers.Remove("Authorization");

            return base.SendAsync(request, cancellationToken);
        }
    }
}