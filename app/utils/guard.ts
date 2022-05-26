export type Guard<T> = (request: Request) => Promise<T>;
