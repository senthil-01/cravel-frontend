import { useState, useEffect } from "react";
const BASE =  import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;
const TOKEN_KEY = "cravecall_token";
const USER_KEY  = "cravecall_user";

export interface AuthUser {
  userId:    string;
  firstName: string;
  lastName:  string;
  email:     string;
  phone?:    string;
  role:      string;
}

// ── Shared auth state across all components ───────────────────────────────────
let _authListeners: Array<(user: AuthUser | null) => void> = [];

const _notifyListeners = (user: AuthUser | null) => {
  _authListeners.forEach((fn) => fn(user));
};

const _getStoredUser = (): AuthUser | null => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? "null"); }
  catch { return null; }
};

export const useAuth = () => {
  const [user, setUser]       = useState<AuthUser | null>(_getStoredUser);
  const [loading, setLoading] = useState(false);

  // subscribe to auth changes
  useEffect(() => {
    const listener = (u: AuthUser | null) => setUser(u);
    _authListeners.push(listener);
    return () => { _authListeners = _authListeners.filter((fn) => fn !== listener); };
  }, []);

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const res  = await fetch(`${API_BASE}/auth/signin`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) throw new Error(data.detail || "Sign in failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    _notifyListeners(data.user);  // ← notify all components
    return data.user;
  };

  const signUp = async (payload: {
    firstName: string; lastName: string; email: string;
    phone?: string; password: string; role?: string;
  }) => {
    setLoading(true);
    const res  = await fetch(`${API_BASE}/auth/signup`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...payload, role: payload.role ?? "customer" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) throw new Error(data.detail || "Sign up failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    _notifyListeners(data.user);  // ← notify all components
    return data.user;
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    _notifyListeners(null);       // ← notify all components
  };

  const displayName = user
    ? (user.firstName || user.email?.split("@")[0])
    : null;

  return { user, loading, signIn, signUp, signOut, getToken, displayName };
};