class RequestError {
  constructor(public response: Response, public data: any) {}
}

export default async function request<T>(config: {
  method: string;
  url: string;
  body?: FormData | any;
  token?: string | null;
  raw?: boolean;
}): Promise<[T, null, Response] | [null, string[], Response | null]> {
  try {
    const headers: HeadersInit = {};
    let body = config.body;

    if (body && !(body instanceof FormData)) {
      body = JSON.stringify(config.body);
      headers["Content-Type"] = "application/json";
    }

    if (config.token) {
      headers["Authorization"] = `Bearer ${config.token}`;
    }

    const res = await fetch(`${process.env.API_URL}${config.url}`, {
      method: config.method,
      body,
      headers,
    });

    const data = config.raw ? null : await res.json();

    if (res.status >= 400 && res.status <= 599) {
      throw new RequestError(res, data);
    }

    return [data, data?.errors, res];
  } catch (e) {
    if (e instanceof RequestError) {
      if (!e.data) {
        try {
          e.data = await e.response.json();
        } catch {}
      }

      const data = e.data ?? e.response.statusText;
      const errors = (Array.isArray(data) ? data : [data]).map((e) => e.message);
      return [null, errors, e.response];
    }

    console.error(e);
    return [null, ["Internal Server Error"], null];
  }
}
