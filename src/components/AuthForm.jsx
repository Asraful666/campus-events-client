"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (pending) return;

    setError("");

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    if (isRegister && !name) {
      setError("Please enter your name.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const result = isRegister
        ? await authClient.signUp.email({
            name,
            email,
            password,
          })
        : await authClient.signIn.email({
            email,
            password,
          });

      if (result.error) {
        setError(
          result.error.message || "Authentication failed."
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-base-200 px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold">
            {isRegister ? "Create an account" : "Welcome back"}
          </h1>

          <p className="mb-4 text-base-content/70">
            {isRegister
              ? "Join your campus community."
              : "Sign in to CampusEvents."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="mb-2 block font-medium">
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  className="input input-bordered w-full"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block font-medium">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input input-bordered w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block font-medium">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                required
                minLength={8}
                maxLength={128}
                className="input input-bordered w-full"
                placeholder="At least 8 characters"
              />
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-medium"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  className="input input-bordered w-full"
                  placeholder="Repeat your password"
                />
              </div>
            )}

            {error && (
              <div role="alert" className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary w-full"
            >
              {pending && (
                <span className="loading loading-spinner loading-sm" />
              )}

              {pending
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            {isRegister
              ? "Already have an account? "
              : "Don't have an account? "}

            <Link
              href={isRegister ? "/login" : "/register"}
              className="link link-primary"
            >
              {isRegister ? "Login" : "Register"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}