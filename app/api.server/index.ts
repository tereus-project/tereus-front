import request from "~/api.server/request";

export * from "~/api.server/utils";

export interface TranspileGitDTO {
  git_repo: string;
}

export interface TranspileInlineDTO {
  source_code: string;
}

export interface TranspileResponseDTO {
  id: string;
  source_language: string;
  target_language: string;
}

export const transpile = {
  zip: (sourceLanguage: string, targetLanguage: string, body: FormData, token: string) =>
    request<TranspileResponseDTO>({
      method: "POST",
      url: `/submissions/zip/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
  git: (sourceLanguage: string, targetLanguage: string, body: TranspileGitDTO, token: string) =>
    request<TranspileResponseDTO>({
      method: "POST",
      url: `/submissions/git/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
  inline: (sourceLanguage: string, targetLanguage: string, body: TranspileInlineDTO, token: string) =>
    request<TranspileResponseDTO>({
      method: "POST",
      url: `/submissions/inline/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
};

export interface LoginResponseDTO {
  token: string;
}

export interface RevokeResponseDTO {
  success: boolean;
}

export interface LoginGithubBodyDTO {
  code: string;
}

export const authLoginGithub = (token: string | null, body: LoginGithubBodyDTO) =>
  request<LoginResponseDTO>({
    method: "POST",
    url: `/auth/login/github`,
    body,
    token,
  });

export const authRevokeGithub = (token: string) =>
  request<RevokeResponseDTO>({
    method: "POST",
    url: `/auth/revoke/github`,
    token,
  });

export interface LoginGitlabBodyDTO {
  code: string;
  redirect_uri: string;
}

export const authLoginGitlab = (token: string | null, body: LoginGitlabBodyDTO) =>
  request<LoginResponseDTO>({
    method: "POST",
    url: `/auth/login/gitlab`,
    body,
    token,
  });

export const authRevokeGitlab = (token: string) =>
  request<RevokeResponseDTO>({
    method: "POST",
    url: `/auth/revoke/gitlab`,
    token,
  });

export interface AuthCheckResponseDTO {
  valid: boolean;
}

export const authCheck = (token: string) =>
  request<AuthCheckResponseDTO>({
    method: "POST",
    url: `/auth/check`,
    token,
  });

export interface SubscriptionDTO {
  tier: string;
  expires_at: string;
  cancelled: boolean;
}

export interface GetCurrentUserResponseDTO {
  id: string;
  email: string;
  subscription?: SubscriptionDTO;
  current_usage_bytes: number;
}

export const getCurrentUser = (token: string) =>
  request<GetCurrentUserResponseDTO>({
    method: "GET",
    url: `/users/me`,
    token,
  });

export interface GetCurrentUserLinkedAccountsResponseDTO {
  github: boolean;
  gitlab: boolean;
}

export const getCurrentUserLinkedAccounts = (token: string) =>
  request<GetCurrentUserLinkedAccountsResponseDTO>({
    method: "GET",
    url: `/users/me/linked-accounts`,
    token,
  });

export interface PaginationMetadataDTO {
  item_count: number;
  total_items: number;
  items_per_page: number;
  total_pages: number;
  current_page: number;
}

export interface GetUserSubmissionsResponseDTO {
  items: SubmissionDTO[];
  meta: PaginationMetadataDTO;
}

export type SubmissionStatus = "pending" | "processing" | "done" | "failed" | "cleaned";

export interface SubmissionDTO {
  id: string;
  source_language: string;
  target_language: string;
  is_inline: boolean;
  is_public: boolean;
  status: SubmissionStatus;
  reason: string;
  git_repo: string;
  created_at: Date;
  share_id: string;
  source_size_bytes: number;
  target_size_bytes: number;
  duration: number;
}

export const getUserSubmissions = (token: string, page: number) =>
  request<GetUserSubmissionsResponseDTO>({
    method: "GET",
    url: `/users/me/submissions?page=${page}`,
    token,
  });

export const downloadSubmission = (token: string, id: string) =>
  request<void>({
    method: "GET",
    url: `/submissions/${id}/download`,
    token,
    raw: true,
  });

export interface DownloadInlineSubmissionDataResponseDTO {
  data: string;
  status: SubmissionStatus;
  source_language: string;
  target_language: string;
  source_size_bytes: number;
  target_size_bytes: number;
  processing_started_at: string;
  processing_finished_at: string;
  reason: string;
}

export const downloadInlineSubmissionInput = (token: string | null, id: string) =>
  request<DownloadInlineSubmissionDataResponseDTO>({
    method: "GET",
    url: `/submissions/${id}/inline/source`,
    token,
  });

export const downloadInlineSubmissionOutput = (token: string | null, id: string) =>
  request<DownloadInlineSubmissionDataResponseDTO>({
    method: "GET",
    url: `/submissions/${id}/inline/output`,
    token,
  });

export interface UpdateSubmissionVisibilityBodyDTO {
  is_public: boolean;
}

export interface UpdateSubmissionVisibilityResponseDTO {
  id: string;
  is_public: boolean;
  share_id: string;
}

export const updateSubmissionVisibility = (token: string, id: string, body: UpdateSubmissionVisibilityBodyDTO) =>
  request<UpdateSubmissionVisibilityResponseDTO>({
    method: "PATCH",
    url: `/submissions/${id}/visibility`,
    token,
    body,
  });

export interface CreateSubscriptionCheckoutBodyDTO {
  tier: string;
  success_url: string;
  cancel_url: string;
}

export interface CreateSubscriptionCheckoutResponseDTO {
  redirect_url: string;
}

export const createSubscriptionCheckout = (token: string, body: CreateSubscriptionCheckoutBodyDTO) => {
  return request<CreateSubscriptionCheckoutResponseDTO>({
    method: "POST",
    url: `/subscription/checkout`,
    body,
    token,
  });
};

export interface CreateBillingPortalBodyDTO {
  return_url: string;
}

export interface CreateBillingPortalResponseDTO {
  redirect_url: string;
}

export const createBillingPortal = (token: string, body: CreateBillingPortalBodyDTO) => {
  return request<CreateBillingPortalResponseDTO>({
    method: "POST",
    url: `/subscription/portal`,
    body,
    token,
  });
};

export const cleanSubmission = (token: string, id: string) => {
  return request<void>({
    method: "DELETE",
    url: `/submissions/${id}`,
    token,
    raw: true,
  });
};

export const deleteCrrentUser = (token: string) => {
  return request<void>({
    method: "DELETE",
    url: `/users/me`,
    token,
    raw: true,
  });
};

export const downloadUserExport = (token: string) =>
  request<void>({
    method: "GET",
    url: `/users/me/export`,
    token,
    raw: true,
  });
