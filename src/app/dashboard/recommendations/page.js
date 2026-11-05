"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

export default function RecommendationsPage() {
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const result = await protectedFetch("/api/recommendations");

        if (active) {
          setEvents(result.data);
          setMode(result.mode);
        }
      } catch (error) {
        if (active) {
          setError(error.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [reload]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recommended Events</h1>

          <p className="mt-2 text-base-content/70">
            {mode === "personalized"
              ? "Discover events related to your favorites and registrations."
              : "Explore upcoming events. Save favorites to personalize your recommendations."}
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => setReload((value) => value + 1)}
          className="btn btn-outline"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p role="status" className="py-12">
          Finding events for you...
        </p>
      ) : error ? (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="mt-8 rounded-xl border border-base-300 p-8">
          No eligible upcoming events are available right now.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="card border border-base-300 bg-base-100"
            >
              <div className="card-body">
                <span className="badge badge-primary">
                  {event.category}
                </span>

                <h2 className="card-title mt-3">{event.title}</h2>

                <p>{event.venue}</p>

                <p className="text-sm text-base-content/70">
                  {new Date(event.startDate).toLocaleString(
                    "en-GB",
                    { timeZone: "Asia/Dhaka" }
                  )}
                  {" · Bangladesh time"}
                </p>

                <p className="mt-3 rounded-lg bg-base-200 p-3 text-sm">
                  {event.reason}
                </p>

                <Link
                  href={`/events/${event.id}`}
                  className="btn btn-primary mt-4"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}