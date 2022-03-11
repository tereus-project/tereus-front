export default async function request<T>(method: string, url: string, body?: FormData): Promise<[T, null] | [null, string[]]> {
  try {
    const res = await fetch(`${process.env.API_URL}${url}`, {
      method,
      body,
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
