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
      url: `/submissions/zip/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
  git: (sourceLanguage: string, targetLanguage: string, body: RemixGitDTO, token: string) =>
    request<RemixResponseDTO>({
      method: "POST",
      url: `/submissions/git/${sourceLanguage}/to/${targetLanguage}`,
      body,
      token,
    }),
  inline: (sourceLanguage: string, targetLanguage: string, body: RemixInlineDTO, token: string) =>
    request<RemixResponseDTO>({
      method: "POST",
      url: `/submissions/inline/${sourceLanguage}/to/${targetLanguage}`,
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

export const validateToken = (token: string) =>
  request<void>({
    method: "POST",
    url: `/auth/check`,
    token,
    raw: true,
  });

export interface GetCurrentUserResponseDTO {
  id: string;
  email: string;
  subscription?: {
    tier: string;
    expires_at: string;
    cancelled: boolean;
  };
}

export const getCurrentUser = (token: string) =>
  request<GetCurrentUserResponseDTO>({
    method: "GET",
    url: `/users/me`,
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

export interface SubmissionDTO {
  id: string;
  source_language: string;
  target_language: string;
  is_inline: boolean;
  is_public: boolean;
  status: string;
  reason: string;
  git_repo: string;
  created_at: Date;
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
  source_language: string;
  target_language: string;
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
