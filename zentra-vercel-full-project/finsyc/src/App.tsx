import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, BadgeDollarSign, LogOut, Plus, RefreshCw, ShieldCheck, Wallet, X } from "lucide-react";
import Header01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Header 01 Finsyc";
import MetricsWithLogo01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Metrics with logo 01 Finsyc";
import Feature01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Feature 01 Finsyc";
import HowItWorks01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/How it Works 01 Finsyc";
import WhyChooseUs01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Why Choose us 01 Finsyc";
import MetricsWithTestimonialFinsyc from "@/components/templates/finance-management-landing-page-finsyc/Metrics with Testimonial Finsyc";
import Pricing01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Pricing 01 Finsyc";
import Integration01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Integration 01 Finsyc";
import Blog01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/Blog 01 Finsyc";
import CTAWithFooter01Finsyc from "@/components/templates/finance-management-landing-page-finsyc/CTA with Footer 01 Finsyc";
import { authApi, financeApi } from "@/lib/api";

type User = { id: number; name: string; email: string; currency?: string };
type Tx = { id: number; type: "income" | "expense"; title: string; category?: string; amount: number | string; transaction_date: string; notes?: string | null };
type Summary = { totalIncome: number | string; totalExpenses: number | string; transactionCount: number; balance: number | string };
const TOKEN_KEY = "zentra_token";
const USER_KEY = "zentra_user";
const money = (value: number | string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null") as User | null; } catch { return null; } });
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txTitle, setTxTitle] = useState("");
  const [txCategory, setTxCategory] = useState("Other");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txBusy, setTxBusy] = useState(false);
  const [txError, setTxError] = useState("");

  const loadDashboard = useCallback(async (activeToken: string) => {
    try {
      const [s, t] = await Promise.all([financeApi.summary(activeToken), financeApi.transactions(activeToken)]);
      setSummary(s.summary);
      setTransactions(t.transactions as Tx[]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not load dashboard.";
      if (/session|authentication|token/i.test(message)) { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(""); setUser(null); }
      else setError(message);
    }
  }, []);

  useEffect(() => { if (token && user) void loadDashboard(token); }, [token, user, loadDashboard]);

  const openAuth = () => { setError(""); setAuthPassword(""); setAuthMode("register"); setAuthOpen(true); };
  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthBusy(true); setError("");
    try {
      const result = authMode === "register"
        ? await authApi.register({ name: authName, email: authEmail, password: authPassword })
        : await authApi.login({ email: authEmail, password: authPassword });
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setToken(result.token); setUser(result.user); setAuthOpen(false); setAuthPassword(""); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Authentication failed."); }
    finally { setAuthBusy(false); }
  };
  const handleLogout = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(""); setUser(null); setSummary(null); setTransactions([]); setAuthOpen(false); };
  const addTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token) return; setTxBusy(true); setTxError("");
    try {
      await financeApi.addTransaction(token, { type: txType, title: txTitle.trim(), category: txCategory, amount: Number(txAmount), transaction_date: txDate });
      setTxTitle(""); setTxAmount(""); await loadDashboard(token);
    } catch (e) { setTxError(e instanceof Error ? e.message : "Could not save transaction."); }
    finally { setTxBusy(false); }
  };
  const deleteTransaction = async (id: number) => { if (!token || !window.confirm("Delete this transaction?")) return; try { await financeApi.deleteTransaction(token, id); await loadDashboard(token); } catch (e) { setTxError(e instanceof Error ? e.message : "Could not delete transaction."); } };

  if (token && user) return <Dashboard user={user} summary={summary} transactions={transactions} onLogout={handleLogout} onRefresh={() => loadDashboard(token)} txType={txType} setTxType={setTxType} txTitle={txTitle} setTxTitle={setTxTitle} txCategory={txCategory} setTxCategory={setTxCategory} txAmount={txAmount} setTxAmount={setTxAmount} txDate={txDate} setTxDate={setTxDate} txBusy={txBusy} txError={txError} onAdd={addTransaction} onDelete={deleteTransaction} error={error} />;

  return <main className="min-h-screen"><Header01Finsyc onGetStarted={openAuth} /><MetricsWithLogo01Finsyc /><Feature01Finsyc /><HowItWorks01Finsyc /><WhyChooseUs01Finsyc /><MetricsWithTestimonialFinsyc /><Pricing01Finsyc /><Integration01Finsyc /><Blog01Finsyc /><CTAWithFooter01Finsyc />
    {authOpen && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#031b12]/65 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setAuthOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9"><button aria-label="Close" onClick={() => setAuthOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f5ed] text-[#06452b]"><ShieldCheck size={26}/></div><h2 id="auth-title" className="text-3xl font-bold tracking-tight text-[#042718]">{authMode === "register" ? "Create your Zentra account" : "Welcome back"}</h2><p className="mt-2 text-sm text-slate-500">{authMode === "register" ? "Start managing your money with confidence." : "Sign in to view your personal finance dashboard."}</p><div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => { setAuthMode("login"); setError(""); }} className={`rounded-lg py-2 text-sm font-semibold ${authMode === "login" ? "bg-white text-[#042718] shadow" : "text-slate-500"}`}>Login</button><button type="button" onClick={() => { setAuthMode("register"); setError(""); }} className={`rounded-lg py-2 text-sm font-semibold ${authMode === "register" ? "bg-white text-[#042718] shadow" : "text-slate-500"}`}>Sign up</button></div><form onSubmit={handleAuth} className="mt-5 space-y-4">{authMode === "register" && <label className="block text-sm font-medium text-slate-700">Full name<input required minLength={2} maxLength={100} value={authName} onChange={e => setAuthName(e.target.value)} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" placeholder="Your name"/></label>}<label className="block text-sm font-medium text-slate-700">Email address<input required type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" placeholder="you@example.com"/></label><label className="block text-sm font-medium text-slate-700">Password<input required type="password" minLength={authMode === "register" ? 8 : 1} value={authPassword} onChange={e => setAuthPassword(e.target.value)} autoComplete={authMode === "register" ? "new-password" : "current-password"} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" placeholder={authMode === "register" ? "At least 8 characters" : "Your password"}/></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button disabled={authBusy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#042718] px-5 py-3.5 font-semibold text-white transition hover:bg-[#075232] disabled:cursor-not-allowed disabled:opacity-60">{authBusy ? "Please wait…" : authMode === "register" ? "Create account" : "Login securely"}<ArrowUpRight size={18}/></button></form><p className="mt-5 text-center text-xs text-slate-500">Your account is protected with password hashing and token-based authentication.</p></section></div>}
  </main>;
}

function Dashboard(props: { user: User; summary: Summary | null; transactions: Tx[]; onLogout: () => void; onRefresh: () => void; txType: "income" | "expense"; setTxType: (v: "income" | "expense") => void; txTitle: string; setTxTitle: (v: string) => void; txCategory: string; setTxCategory: (v: string) => void; txAmount: string; setTxAmount: (v: string) => void; txDate: string; setTxDate: (v: string) => void; txBusy: boolean; txError: string; onAdd: (e: FormEvent<HTMLFormElement>) => void; onDelete: (id: number) => void; error: string }) {
  const { user, summary, transactions, onLogout, onRefresh, txType, setTxType, txTitle, setTxTitle, txCategory, setTxCategory, txAmount, setTxAmount, txDate, setTxDate, txBusy, txError, onAdd, onDelete, error } = props;
  return <main className="min-h-screen bg-[#f5f8f5] text-slate-900"><header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><a href="#dashboard" className="flex items-center gap-2 text-xl font-bold text-[#042718]"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#042718] text-white">∧</span>Zentra</a><div className="flex items-center gap-3"><span className="hidden text-sm text-slate-600 sm:inline">Hi, {user.name}</span><button onClick={onRefresh} title="Refresh dashboard" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"><RefreshCw size={18}/></button><button onClick={onLogout} className="flex items-center gap-2 rounded-xl bg-[#042718] px-4 py-2 text-sm font-semibold text-white"><LogOut size={16}/> Logout</button></div></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-emerald-800">Personal finance</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your dashboard</h1><p className="mt-2 text-slate-500">Your money, organized in one place.</p></div><span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-900">{summary?.transactionCount ?? 0} transactions</span></div>{error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Current balance" value={money(summary?.balance || 0)} icon={<Wallet/>}/><StatCard title="Total income" value={money(summary?.totalIncome || 0)} icon={<ArrowDownLeft/>} positive/><StatCard title="Total expenses" value={money(summary?.totalExpenses || 0)} icon={<ArrowUpRight/>}/><StatCard title="Transactions" value={String(summary?.transactionCount ?? 0)} icon={<BadgeDollarSign/>}/></div><div className="mt-7 grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold">Add a transaction</h2><p className="mt-1 text-sm text-slate-500">Saved directly to your MySQL account.</p><form onSubmit={onAdd} className="mt-5 space-y-4"><div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setTxType("expense")} className={`rounded-lg py-2 text-sm font-semibold ${txType === "expense" ? "bg-white text-rose-700 shadow" : "text-slate-500"}`}>Expense</button><button type="button" onClick={() => setTxType("income")} className={`rounded-lg py-2 text-sm font-semibold ${txType === "income" ? "bg-white text-emerald-800 shadow" : "text-slate-500"}`}>Income</button></div><label className="block text-sm font-medium">Description<input required maxLength={140} value={txTitle} onChange={e => setTxTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700" placeholder="e.g. Monthly salary"/></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Amount (₹)<input required type="number" min="0.01" step="0.01" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700" placeholder="0.00"/></label><label className="block text-sm font-medium">Category<select value={txCategory} onChange={e => setTxCategory(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700"><option>Other</option><option>Salary</option><option>Food</option><option>Transport</option><option>Shopping</option><option>Bills</option><option>Health</option><option>Education</option><option>Investment</option></select></label></div><label className="block text-sm font-medium">Date<input required type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700"/></label>{txError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{txError}</p>}<button disabled={txBusy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#042718] py-3 font-semibold text-white disabled:opacity-60"><Plus size={18}/>{txBusy ? "Saving…" : "Save transaction"}</button></form></section><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Recent transactions</h2><p className="mt-1 text-sm text-slate-500">Latest activity from your database.</p></div><button onClick={onRefresh} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Refresh</button></div>{transactions.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center"><Wallet className="mx-auto text-slate-400" size={30}/><p className="mt-3 font-semibold">No transactions yet</p><p className="mt-1 text-sm text-slate-500">Add your first income or expense to get started.</p></div> : <div className="mt-4 divide-y divide-slate-100">{transactions.map(tx => <div key={tx.id} className="flex items-center gap-3 py-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{tx.type === "income" ? <ArrowDownLeft size={19}/> : <ArrowUpRight size={19}/>}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{tx.title}</p><p className="text-xs text-slate-500">{tx.category || "Other"} · {String(tx.transaction_date).slice(0, 10)}</p></div><div className="text-right"><p className={`font-bold ${tx.type === "income" ? "text-emerald-700" : "text-slate-800"}`}>{tx.type === "income" ? "+" : "−"}{money(tx.amount)}</p><button onClick={() => onDelete(tx.id)} className="mt-1 text-xs text-rose-600 hover:underline">Delete</button></div></div>)}</div>}</section></div><p className="mt-6 text-center text-xs text-slate-500">Zentra stores your transactions securely in your own database. <a href="mailto:support@zentra.local" className="underline">Need help?</a></p></div></main>;
}
function StatCard({ title, value, icon, positive = false }: { title: string; value: string; icon: ReactNode; positive?: boolean }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{title}</p><span className={`rounded-xl p-2 ${positive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{icon}</span></div><p className="mt-4 text-2xl font-bold tracking-tight">{value}</p></section>; }
