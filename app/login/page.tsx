"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import InputField from "../components/shared/InputField";
import WelcomeHeader from "../components/shared/WelcomeHeader";
import { useAuth } from "../../lib/auth/auth.context";
import { toast } from "sonner";
import { PageSpinner } from "../components/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Do not auto-redirect: show login form when visiting /login

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <main
        className="flex flex-col gap-16 items-center p-6 min-h-screen justify-center"
        style={{
          backgroundImage: `url('/Images/Sign-Up-Bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <PageSpinner fullScreen className="text-white" />
      </main>
    );
  }

  return (
    <main
      className="flex flex-col gap-16 items-center p-6 min-h-screen justify-center"
      style={{
        backgroundImage: `url('/Images/Sign-Up-Bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <WelcomeHeader
        title="Welcome Back"
        description="Manage your e-commerce store. Access your dashboard to manage products, orders, categories, and view analytics."
      />

      <section className="flex flex-col gap-5 items-start bg-white rounded-xl border border-solid border-slate-200 shadow-[0px_12px_50px_#EFF4FF] w-[470px] max-md:w-full max-sm:w-full">
        <header className="flex flex-col gap-3.5 items-start px-5 py-4 w-full bg-custom-gradient-red rounded-t-xl">
          <h2 className="text-2xl font-open-sans-bold text-white">Sign In</h2>
          <p className="text-sm text-white font-open-sans-regular">
            Access your admin dashboard to manage your e-commerce store.
          </p>
        </header>

        <form
          id="login-form"
          onSubmit={handleLogin}
          className="flex flex-col gap-8 items-start px-6 py-0 w-full"
        >
          <InputField
            label="Email"
            placeholder="Enter your email address"
            required
            type="email"
            value={email}
            onChange={handleEmailChange}
          />

          <div className="relative w-full">
            <InputField
              label="Password"
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[36px] text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>

        <footer className="flex flex-col gap-4 items-start px-6 py-4 w-full">
          <button
            type="submit"
            form="login-form"
            className="bg-custom-gradient-blue text-white px-4 py-2 rounded-md w-full font-open-sans-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </button>
        </footer>
      </section>
    </main>
  );
}
