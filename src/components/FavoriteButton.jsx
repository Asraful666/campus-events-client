"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { protectedFetch } from "@/lib/api";

export default function FavoriteButton({ eventId }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setSaved(false);
    setError("");

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    async function loadFavorite() {
      try {
        const result = await protectedFetch("/api/favorites");

        if (active) {
          setSaved(
            result.data.some((item) => item.eventId === eventId)
          );
        }
      } catch (error) {
        if (active) setError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFavorite();

    return () => {
      active = false;
    };
  }, [userId, eventId, retry]);

  async function toggleFavorite() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      await protectedFetch(`/api/favorites/${eventId}`, {
        method: saved ? "DELETE" : "PUT",
      });

      setSaved(!saved);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  if (isPending || loading) {
    return <p className="text-sm">Loading favorite status...</p>;
  }

  if (!session) {
    return (
      <Link href="/login" className="btn btn-outline">
        Login to Save Event
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending || Boolean(error)}
        onClick={toggleFavorite}
        className="btn btn-outline"
      >
        {pending
          ? "Please wait..."
          : saved
            ? "Remove from Favorites"
            : "Save to Favorites"}
      </button>

      {error && (
        <div role="alert" className="mt-3 text-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn btn-ghost btn-sm mt-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}