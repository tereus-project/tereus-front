class RequestError {
  constructor(public response: Response, public data: any) { }
}

export default async function request<T>(config: {
  method: string;
  url: string;
  body?: FormData | any;
  token?: string;
}): Promise<[T, null] | [null, string[]]> {
  try {
    const headers: HeadersInit = {};
    let body = config.body;

    if (!(config.body instanceof FormData)) {
      body = JSON.stringify(config.body);
      headers['Content-Type'] = 'application/json';
    }

    if (config.token) {
      headers['Authorization'] = `Bearer ${config.token}`;
    }

    const res = await fetch(`${process.env.API_URL}${config.url}`, {
      method: config.method,
      body,
      headers,
    });

    const data = await res.json();

    if (res.status >= 400 && res.status <= 599) {
      throw new RequestError(res, data);
    }

    return [data, null]
  } catch (e) {
    if (e instanceof RequestError) {
      return [null, Array.isArray(e.data) ? e.data : [e.data]];
    }

    console.error(e);
    return [null, ["Internal Server Error"]];
  }
}
