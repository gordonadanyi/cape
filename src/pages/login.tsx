import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.accesstoken) {
        localStorage.setItem("token", response.data.accesstoken);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Invoicing that chases payments so you don't have to.">
      <h1 className="text-4xl font-bold text-[#1E56CD]">Welcome Back!</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
        Log in to access your dashboard, manage your invoices, and stay on
        top of every payment.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-xl border border-[#E2DED3] px-4 py-3 text-[15px] outline-none transition focus:border-[#1E56CD]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-[#E2DED3] px-4 py-3 pr-11 text-[15px] outline-none transition focus:border-[#1E56CD]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A93AC] hover:text-[#1E56CD]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#5B6584]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#E2DED3] accent-[#1E56CD]"
            />
            Remember me
          </label>
          {/* Not wired to a real flow yet — no password-reset endpoint exists on the backend. */}
          <span className="cursor-not-allowed text-[#8A93AC]" title="Coming soon">
            Forgot Password?
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#1E56CD] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#17439E] disabled:cursor-not-allowed disabled:bg-[#9FB2E0]"
        >
          {loading ? "Logging in…" : "Log In to Your Space"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#5B6584]">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-[#1E56CD] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;