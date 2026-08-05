import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/signup", {
        businessname: name,
        email,
        password,
      });
      if (response.data.accesstoken) {
        localStorage.setItem("token", response.data.accesstoken);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Get paid on time, every time without the follow-up emails.">
      <h1 className="text-4xl font-bold text-[#1E56CD]">Create Your Account</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
        Set up your workspace to start sending invoices and automatic
        reminders in minutes.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">
            Business Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your business name"
            required
            className="w-full rounded-xl border border-[#E2DED3] px-4 py-3 text-[15px] outline-none transition focus:border-[#1E56CD]"
          />
        </div>

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
              placeholder="Create a password"
              required
              minLength={6}
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

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            className="w-full rounded-xl border border-[#E2DED3] px-4 py-3 text-[15px] outline-none transition focus:border-[#1E56CD]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#1E56CD] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#17439E] disabled:cursor-not-allowed disabled:bg-[#9FB2E0]"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#5B6584]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#1E56CD] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;