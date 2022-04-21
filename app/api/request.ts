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
    return [data, null]
  } catch (e) {
    if ((e as any).response) {
      const { data } = (e as any).response;

      if (data?.errors) {
        return [null, data.errors]
      }

      if ((e as any).response.statusText) {
        console.error(e);
        return [null, [(e as any).response.statusText]]
      }
    }

    console.error(e);
    return [null, ["Internal Server Error"]];
  }
}
