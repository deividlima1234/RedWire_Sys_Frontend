import { create } from 'zustand';

// Recuperar el token y el usuario del localStorage al cargar la app por primera vez (síncrono)
const storedToken = localStorage.getItem('token');
let storedUser = null;
try {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    storedUser = JSON.parse(userJson);
  }
} catch (error) {
  console.error('Error parsing stored user from localStorage', error);
}

const useAuthStore = create((set) => ({
  token: storedToken,
  user: storedUser,
  isAuthenticated: !!storedToken,
  
  setAuth: (token, user) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }

    set({
      token,
      user,
      isAuthenticated: !!token
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  },

  refreshUser: async () => {
    const currentToken = useAuthStore.getState().token;
    if (!currentToken) return;

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data));
        set({ user: data, isAuthenticated: true });
      } else if (response.status === 401) {
        // Token inválido o expirado
        useAuthStore.getState().logout();
      }
    } catch (error) {
      console.error('Error refreshing user', error);
    }
  }
}));

export default useAuthStore;
