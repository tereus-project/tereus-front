const OAUTH2_PROVIDERS = {
  github: {
    baseUrl: "https://github.com/login/oauth/authorize?scope=user:email%20repo%20gist",
    clientId: process.env.GITHUB_OAUTH2_CLIENT_ID,
  },
  gitlab: {
    baseUrl: "https://gitlab.com/oauth/authorize?scope=read_api%20read_user%20read_repository&response_type=code",
    clientId: process.env.GITLAB_OAUTH2_CLIENT_ID,
  },
};

export type OAuth2Provider = keyof typeof OAUTH2_PROVIDERS;

export function getRedirectUri(provider: OAuth2Provider, origin: URL, to: string | null) {
  const searchParams = new URLSearchParams();

  if (to) {
    searchParams.set("to", to);
  }

  if (process.env.FRONT_URL) {
    return `${process.env.FRONT_URL}/auth/login/${provider}?${searchParams.toString()}`;
  }

  return `http://127.0.0.1:${origin.port}/auth/login/${provider}?${searchParams.toString()}`;
}

export function getAuthorizeUrl(provider: OAuth2Provider, origin: URL, to: string | null) {
  const redirectUri = getRedirectUri(provider, origin, to);

  const providerConfig = OAUTH2_PROVIDERS[provider];
  return `${providerConfig.baseUrl}&client_id=${providerConfig.clientId}&redirect_uri=${redirectUri}`;
}