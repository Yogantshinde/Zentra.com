const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body as T;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest<{ token: string; user: { id: number; name: string; email: string } }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiRequest<{ token: string; user: { id: number; name: string; email: string } }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: (token: string) => apiRequest<{ user: { id: number; name: string; email: string; currency: string } }>("/auth/me", {}, token),
};

export const financeApi = {
  summary: (token: string) => apiRequest<{ summary: { totalIncome: number; totalExpenses: number; transactionCount: number; balance: number }; recentTransactions: unknown[] }>("/dashboard/summary", {}, token),
  transactions: (token: string) => apiRequest<{ transactions: unknown[] }>("/transactions", {}, token),
  addTransaction: (token: string, data: { type: "income" | "expense"; title: string; category?: string; amount: number; transaction_date?: string; notes?: string }) =>
    apiRequest<{ transaction: unknown }>("/transactions", { method: "POST", body: JSON.stringify(data) }, token),
  deleteTransaction: (token: string, id: number) => apiRequest<{ message: string }>(`/transactions/${id}`, { method: "DELETE" }, token),
};
