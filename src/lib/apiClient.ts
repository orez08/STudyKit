export const apiClient = {
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || `Request failed with status ${response.status}`);
      }
      return json;
    } catch (err: any) {
      console.error(`API Client Error [${endpoint}]:`, err);
      throw err;
    }
  },

  async get<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || `Request failed with status ${response.status}`);
      }
      return json;
    } catch (err: any) {
      console.error(`API Client Error [${endpoint}]:`, err);
      throw err;
    }
  },
};
