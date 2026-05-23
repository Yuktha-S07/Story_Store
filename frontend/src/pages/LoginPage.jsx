import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [error, setError] = React.useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');
    try {
      await login(form.email.value, form.password.value);
      navigate('/', { replace: true });
    } catch (err) {
      const message = toErrorMessage(err?.response?.data?.detail || err?.response?.data, 'Login failed');
      setError(message);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#f8f7f3] px-4">
      {/* decorative circles removed for cleaner auth pages */}

      <div className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-black/6 bg-white/95 p-8 shadow-[0_30px_80px_rgba(62,46,26,0.08)] backdrop-blur-lg">
          <h2 className="text-center font-serif text-3xl text-[#26231f]">Join the Community</h2>
          <p className="mt-3 text-center text-sm leading-6 text-[#6d6a63]">Log in to continue reading or start sharing your own stories.</p>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-full border border-black/8 bg-[#fbfaf7] px-5 py-3 text-[#3a3a3a] outline-none transition-shadow duration-200 focus:shadow-[0_8px_30px_rgba(224,107,128,0.12)] focus:border-transparent focus:ring-2 focus:ring-[#E06B80]/30"
            />

            <button
              type="submit"
              className="w-full rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-200 transform hover:-translate-y-0.5 bg-gradient-to-r from-[#E06B80] to-[#C2D099] shadow-[0_10px_30px_rgba(192,107,118,0.12)] hover:shadow-[0_14px_40px_rgba(192,107,118,0.16)]"
            >
              Login
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
    </div>
  );
};

export default LoginPage;
