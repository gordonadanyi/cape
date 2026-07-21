import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      });
      console.log("Login successful:", response.data);
      // Store auth token if provided
     if (response.data.accesstoken) {
     localStorage.setItem("token", response.data.accesstoken);
}
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9EE] relative font-candara px-6 py-12">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[40px] border border-[#E6DCC7] bg-white p-10 shadow-[0_28px_70px_rgba(30,33,24,0.08)]">
          <h2 className="text-4xl font-semibold text-center text-[#1E2118] mb-8">Welcome Back</h2>
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#D9D1C1] rounded-2xl focus:outline-none focus:border-[#4B672D]"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#D9D1C1] rounded-2xl focus:outline-none focus:border-[#4B672D]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4B672D] hover:bg-[#3F5824] disabled:bg-[#9FA19F] text-white py-4 rounded-3xl font-medium text-lg transition"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <p className="text-center mt-6 text-[#4B672D]">
            Don't have an account? <Link to="/signup" className="font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;