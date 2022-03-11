import request from "~/api/request";

export * from '~/api/utils';

export interface RemixResponseDTO {
  id: string;
  source_language: string;
  target_language: string;
}

export const remix = (body: FormData) => request<RemixResponseDTO>('POST', `/remix/${body.get('sourceLanguage')}/to/${body.get('targetLanguage')}`, body);
