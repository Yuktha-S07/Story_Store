import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get('token') || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', { token, new_password: newPassword });
      setMessage(res?.data?.message || "Password updated successfully");
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = toErrorMessage(err?.response?.data?.detail || err?.response?.data, 'Reset failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 bg-[#fbf8f2] [color-scheme:light]">
      <div className="relative w-full max-w-md -translate-y-6 rounded-[28px] border border-black/8 bg-white/65 p-8">
        <h2 className="text-center font-serif text-3xl text-[#26231f]">Reset Password</h2>
        <p className="mt-3 text-center text-sm leading-6 text-[#6d6a63]">Enter your reset token and new password.</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="token"
            type="text"
            placeholder="Reset token"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
          />
          <input
            name="newPassword"
            type="password"
            placeholder="New password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-200 transform hover:-translate-y-0.5 bg-gradient-to-r from-[#E06B80] to-[#C2D099] shadow-[0_10px_30px_rgba(192,107,118,0.12)] hover:shadow-[0_14px_40px_rgba(192,107,118,0.16)] disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#6d6a63]">
          <Link to="/login" className="font-semibold text-black underline underline-offset-4">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
