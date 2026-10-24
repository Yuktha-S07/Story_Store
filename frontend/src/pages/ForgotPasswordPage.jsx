import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

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

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res?.data?.message || "If an account exists with that email, a reset link has been sent.");
      if (res?.data?.reset_token) {
        setResetToken(res.data.reset_token);
      }
    } catch (err) {
      const msg = toErrorMessage(err?.response?.data?.detail || err?.response?.data, 'Request failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 bg-[#fbf8f2] [color-scheme:light]">
      <div className="relative w-full max-w-md -translate-y-6 rounded-[28px] border border-black/8 bg-white/65 p-8">
        <h2 className="text-center font-serif text-3xl text-[#26231f]">Forgot Password</h2>
        <p className="mt-3 text-center text-sm leading-6 text-[#6d6a63]">Enter your email to receive a password reset link.</p>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-200 transform hover:-translate-y-0.5 bg-gradient-to-r from-[#E06B80] to-[#C2D099] shadow-[0_10px_30px_rgba(192,107,118,0.12)] hover:shadow-[0_14px_40px_rgba(192,107,118,0.16)] disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#6d6a63]">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-black underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
