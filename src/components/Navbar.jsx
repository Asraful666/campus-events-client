"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(result.error.message || "Logout failed.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100">
      <nav className="navbar mx-auto max-w-7xl flex-wrap gap-3 px-4">
        <div className="flex-1">
          <Link
            href="/"
            className="text-xl font-extrabold text-primary"
          >
            CampusEvents
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/#events" className="btn btn-ghost btn-sm">
            Events
          </Link>
          {session && (
  <Link href="/dashboard" className="btn btn-ghost btn-sm">
    Dashboard
  </Link>
)}

          {isPending ? (
            <span
              role="status"
              aria-label="Loading account"
              className="loading loading-spinner loading-sm"
            />
          ) : session ? (
            <>
              <span className="max-w-32 truncate text-sm font-semibold">
                {session.user.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-outline btn-sm"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>

              <Link
                href="/register"
                className="btn btn-primary btn-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {error && (
        <p role="alert" className="px-4 pb-2 text-center text-error">
          {error}
        </p>
      )}
    </header>
  );
}