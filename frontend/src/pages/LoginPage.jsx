import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const toErrorMessage = (detail, fallback) => {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || item?.detail || '')
      .filter(Boolean)
      .join(', ') || fallback;
  }
  if (detail && typeof detail === 'object') {
    return detail.message || detail.detail || fallback;
  }
  return fallback;
};

const LoginPage = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    setError('');
    setSubmitting(true);
    try {
      await login(form.email.value, form.password.value);
      const next = searchParams.get('next');
      navigate(next && next.startsWith('/') ? next : '/', { replace: true });
    } catch (err) {
      const message = toErrorMessage(err?.response?.data?.detail || err?.response?.data, 'Login failed');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4">
      {/* decorative circles removed for cleaner auth pages */}

      <div className="relative w-full max-w-md -translate-y-6 rounded-[28px] border border-black/8 bg-white/65 p-8">
          <h2 className="text-center font-serif text-3xl text-[#26231f]">Join the Community</h2>
          <p className="mt-3 text-center text-sm leading-6 text-[#6d6a63]">Log in to continue reading or start sharing your own stories.</p>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              required
              className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-base text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
            />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              required
              className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-base text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
            />

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-200 transform active:scale-[0.98] bg-gradient-to-r from-[#E06B80] to-[#C2D099] shadow-[0_10px_30px_rgba(192,107,118,0.12)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(192,107,118,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6d6a63]">
            No account?{' '}
            <Link to="/signup" className="font-semibold text-[#3a3a3a] underline underline-offset-4">
              Sign up
            </Link>
          </p>
      </div>
    </div>
  );
};

export default LoginPage;
