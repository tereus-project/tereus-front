export type Guard<T, P extends unknown[] = []> = (request: Request, ...args: P) => Promise<T>;
