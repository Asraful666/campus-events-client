"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const result = await protectedFetch("/api/manage/events");

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid event list received.");
        }

        if (active) {
          setEvents(result.data);
        }
      } catch (error) {
        if (active) {
          setError(error.message || "Could not load events.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [retryCount]);

  async function handleCancel(event) {
    if (deletingId !== null || event.status !== "published") {
      return;
    }

    const confirmed = window.confirm(
      `Cancel "${event.title}"? It will be removed from public listings.`
    );

    if (!confirmed) return;

    setDeletingId(event._id);
    setError("");
    setMessage("");

    try {
      const result = await protectedFetch(
        `/api/events/${event._id}`,
        { method: "DELETE" }
      );

      setEvents((current) =>
        current.map((item) =>
          item._id === event._id
            ? { ...item, status: "cancelled" }
            : item
        )
      );

      setMessage(result.message || "Event cancelled successfully.");
    } catch (error) {
      setError(error.message || "Could not cancel event.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Events</h1>

          <p className="mt-2 text-base-content/70">
            Organizers manage their own events. Admins manage all events.
          </p>
        </div>

        <Link
          href="/dashboard/create-event"
          className="btn btn-primary"
        >
          Create Event
        </Link>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm"
            disabled={loading || deletingId !== null}
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Reload
          </button>
        </div>
      )}

      {message && (
        <div role="status" className="alert alert-success mt-6">
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span
            role="status"
            aria-label="Loading events"
            className="loading loading-spinner loading-lg"
          />
        </div>
      ) : events.length === 0 ? (
        !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-base-300 p-10 text-center">
            <h2 className="text-xl font-bold">No events yet</h2>
            <p className="mt-2">Create your first campus event.</p>
          </div>
        )
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">Start · Bangladesh time</th>
                <th scope="col">Capacity</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => {
                const isPublished = event.status === "published";
                const isCancelled = event.status === "cancelled";
                const isCancelling = deletingId === event._id;

                return (
                  <tr key={event._id}>
                    <td className="min-w-56">
                      <p className="font-semibold">
                        {event.title || "Untitled event"}
                      </p>

                      <p className="mt-1 text-sm text-base-content/60">
                        {event.category || "—"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap">
                      {formatDate(event.startDate)}
                    </td>

                    <td>{event.capacity ?? "—"}</td>

                    <td>
                      <span
                        className={`badge ${
                          isPublished
                            ? "badge-success"
                            : isCancelled
                              ? "badge-error"
                              : "badge-ghost"
                        }`}
                      >
                        {isPublished
                          ? "Published"
                          : isCancelled
                            ? "Cancelled"
                            : event.status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/participants/${event._id}`}
                          className="btn btn-outline btn-sm"
                        >
                          Participants
                        </Link>

                        {isPublished && (
                          <Link
                            href={`/dashboard/edit-event/${event._id}`}
                            className="btn btn-primary btn-sm"
                          >
                            Edit
                          </Link>
                        )}

                        <button
                          type="button"
                          className="btn btn-error btn-outline btn-sm"
                          disabled={
                            deletingId !== null || !isPublished
                          }
                          onClick={() => handleCancel(event)}
                        >
                          {isCancelling
                            ? "Cancelling..."
                            : isCancelled
                              ? "Cancelled"
                              : "Cancel Event"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}