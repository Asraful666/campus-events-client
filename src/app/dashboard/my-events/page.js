"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
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

        if (active) {
          setEvents(result.data);
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

    loadEvents();

    return () => {
      active = false;
    };
  }, [retryCount]);

  async function handleDelete(event) {
    const confirmed = window.confirm(
      `Cancel "${event.title}"? It will be removed from public listings.`
    );

    if (!confirmed || deletingId) return;

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

      setMessage(result.message);
    } catch (error) {
      setError(error.message);
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
      ) : events.length === 0 && !error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-base-300 p-10 text-center">
          <h2 className="text-xl font-bold">No events yet</h2>
          <p className="mt-2">Create your first campus event.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Start · Bangladesh time</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                 <td>
  <div className="flex items-center gap-2">
    <Link
  href={`/dashboard/participants/${event._id}`}
  className="btn btn-outline btn-sm"
>
  Participants
</Link>
    {event.status === "published" && (
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
        deletingId !== null ||
        event.status === "cancelled"
      }
      onClick={() => handleDelete(event)}
    >
      {deletingId === event._id
        ? "Cancelling..."
        : event.status === "cancelled"
          ? "Cancelled"
          : "Cancel Event"}
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}