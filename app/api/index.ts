import request from "~/api/request";

export * from "~/api/utils";

export interface RemixGitDTO {
  git_repo: string;
}

export interface RemixInlineDTO {
  source_code: string;
}

export interface RemixResponseDTO {
  id: string;
  source_language: string;
  target_language: string;
}

export const remix = {
  zip: (sourceLanguage: string, targetLanguage: string, body: FormData, token: string) =>
    request<RemixResponseDTO>({
      method: "POST",
      url: `/remix/zip/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
  git: (sourceLanguage: string, targetLanguage: string, body: RemixGitDTO, token: string) =>
    request<RemixResponseDTO>({
      method: "POST",
      url: `/remix/git/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
  inline: (sourceLanguage: string, targetLanguage: string, body: RemixInlineDTO, token: string) =>
    request<RemixResponseDTO>({
      method: "POST",
      url: `/remix/inline/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
};

export interface AuthGithubDTO {
  code: string;
}

export interface AuthGithubResponseDTO {
  token: string;
}

export const authGithub = (body: AuthGithubDTO) =>
  request<AuthGithubResponseDTO>({
    method: "POST",
    url: `/auth/login/github`,
    body,
  });

export interface GetCurrentUserResponseDTO {
  id: string;
  email: string;
}

export const getCurrentUser = (token: string) =>
  request<GetCurrentUserResponseDTO>({
    method: "GET",
    url: `/users/me`,
    token,
  });

export interface GetUserSubmissionsResponseDTO {
  submissions: SubmissionDTO[];
}

export interface SubmissionDTO {
  id: string;
  source_language: string;
  target_language: string;
  status: string;
  git_repo: string;
  created_at: Date;
}

export const getUserSubmissions = (token: string) =>
  request<GetUserSubmissionsResponseDTO>({
    method: "GET",
    url: `/users/me/submissions`,
    token,
  });

export const downloadSubmission = (token: string, id: string) =>
  request<void>({
    method: "GET",
    url: `/remix/${id}`,
    token,
    raw: true,
  });
