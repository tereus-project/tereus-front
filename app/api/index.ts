import request from "~/api/request";

export * from '~/api/utils';

export interface RemixResponseDTO {
  id: string;
  source_language: string;
  target_language: string;
}

export const remix = (body: FormData, token: string) => request<RemixResponseDTO>({
  method: 'POST',
  url: `/remix/zip/${body.get('sourceLanguage')}/to/${body.get('targetLanguage')}`,
  body,
  token,
});

export interface AuthGithubDTO {
  code: string;
}

export interface AuthGithubResponseDTO {
  token: string;
}

export const authGithub = (body: AuthGithubDTO) => request<AuthGithubResponseDTO>({
  method: 'POST',
  url: `/auth/login/github`,
  body,
});

export interface GetCurrentUserResponseDTO {
  id: string;
  email: string;
}

export const getCurrentUser = (token: string) => request<GetCurrentUserResponseDTO>({
  method: 'GET',
  url: `/users/me`,
  token,
});
