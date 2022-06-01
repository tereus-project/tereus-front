export type ActionFormData<T> = {
  response: T | null;
  errors: string[] | null;
};

export type ActionFormDataEnsured<T> = {
  response: T;
  errors: string[] | null;
};
