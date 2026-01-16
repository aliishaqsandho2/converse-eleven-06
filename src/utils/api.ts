export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
}

export const api = {
    get: async (endpoint: string, params: Record<string, string> = {}) => {
        const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
        const url = new URL(`${baseUrl}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        const response = await fetch(url.toString());
        return handleResponse(response);
    },

    post: async (endpoint: string, body: any) => {
        const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
        const response = await fetch(`${baseUrl}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    put: async (endpoint: string, body: any) => {
        const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
        const response = await fetch(`${baseUrl}/${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    delete: async (endpoint: string) => {
        const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
        const response = await fetch(`${baseUrl}/${endpoint}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};
