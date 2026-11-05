"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadFavorites() {
      setLoading(true);
      setError("");

      try {
        const result = await protectedFetch("/api/favorites");

        if (active) setFavorites(result.data);
      } catch (error) {
        if (active) setError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      active = false;
    };
  }, [retry]);

  async function removeFavorite(eventId) {
    if (removingId) return;

    setRemovingId(eventId);
    setError("");

    try {
      await protectedFetch(`/api/favorites/${eventId}`, {
        method: "DELETE",
      });

      setFavorites((current) =>
        current.filter((item) => item.eventId !== eventId)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">My Favorites</h1>

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setRetry((value) => value + 1)}
          >
            Reload
          </button>
        </div>
      )}

      {loading ? (
        <p role="status" className="py-12">
          Loading favorites...
        </p>
      ) : favorites.length === 0 && !error ? (
        <div className="mt-8 rounded-xl border border-base-300 p-8">
          <p>You have no favorite events yet.</p>

          <Link href="/#events" className="btn btn-primary mt-4">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {favorites.map(({ eventId, event }) => (
            <article
              key={eventId}
              className="card border border-base-300 bg-base-100"
            >
              <div className="card-body">
                <h2 className="card-title">
                  {event?.title || "Event unavailable"}
                </h2>

                {event && (
                  <>
                    <p>{event.category} · {event.venue}</p>

                    <p className="text-sm text-base-content/70">
                      {new Date(event.startDate).toLocaleString(
                        "en-GB",
                        { timeZone: "Asia/Dhaka" }
                      )}
                      {" · Bangladesh time"}
                    </p>
                  </>
                )}

                <div className="card-actions mt-4">
                  {event && (
                    <Link
                      href={`/events/${eventId}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={removingId !== null}
                    onClick={() => removeFavorite(eventId)}
                    className="btn btn-outline btn-sm"
                  >
                    {removingId === eventId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}