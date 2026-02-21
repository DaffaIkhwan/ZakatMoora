const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isDev ? 'http://localhost:5000/api' : '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
    // Auth
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },
    register: async (data: any) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Registration failed');
        }
        return res.json();
    },

    // Users
    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },
    addUser: async (data: any) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },
    updateUser: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },
    deleteUser: async (id: string) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete user');
        return;
    },

    // Mustahik
    getMustahik: async () => {
        const res = await fetch(`${API_URL}/mustahik`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch mustahik');
        return res.json();
    },
    createMustahik: async (data: any) => {
        const res = await fetch(`${API_URL}/mustahik`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create mustahik');
        return res.json();
    },
    updateMustahik: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/mustahik/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update mustahik');
        return res.json();
    },
    deleteMustahik: async (id: string) => {
        const res = await fetch(`${API_URL}/mustahik/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete mustahik');
        return;
    },

    // Criteria
    getCriteria: async () => {
        const res = await fetch(`${API_URL}/criteria`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch criteria');
        return res.json();
    },
    updateCriteria: async (data: any) => {
        const res = await fetch(`${API_URL}/criteria`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update criteria');
        return res.json();
    },

    // Programs
    getPrograms: async () => {
        const res = await fetch(`${API_URL}/programs`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch programs');
        return res.json();
    },
    createProgram: async (data: any) => {
        const res = await fetch(`${API_URL}/programs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create program');
        return res.json();
    },
    updateProgram: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/programs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update program');
        return res.json();
    },
    deleteProgram: async (id: string) => {
        const res = await fetch(`${API_URL}/programs/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete program');
        return;
    },

    // History
    getHistory: async () => {
        const res = await fetch(`${API_URL}/history`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
    },
    createHistory: async (data: any) => {
        const res = await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create history');
        return res.json();
    },

    // Monitoring
    getMonitoring: async () => {
        const res = await fetch(`${API_URL}/monitoring`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch monitoring');
        return res.json();
    },
    createMonitoring: async (data: any) => {
        const res = await fetch(`${API_URL}/monitoring`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create monitoring');
        return res.json();
    }
};
