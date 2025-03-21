export async function fetchWithType<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json() as T;
}