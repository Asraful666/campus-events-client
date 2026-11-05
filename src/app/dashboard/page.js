"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

const statLabels = {
  registered: "My Registrations",
  attended: "Events Attended",
  certificates: "Certificates Issued",
  favorites: "Saved Favorites",
  totalEvents: "Total Events",
  publishedEvents: "Published Events",
  cancelledEvents: "Cancelled Events",
  registrations: "Registrations",
  attendance: "Attendance",
  totalUsers: "Total Users",
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      setUser(null);
      setSummary(null);

      try {
        const [profileResult, summaryResult] = await Promise.all([
          protectedFetch("/api/me"),
          protectedFetch("/api/dashboard/summary"),
        ]);

        if (active) {
          setUser(profileResult.data);
          setSummary(summaryResult.data);
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

    loadDashboard();

    return () => {
      active = false;
    };
  }, [retry]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span
          role="status"
          aria-label="Loading dashboard"
          className="loading loading-spinner loading-lg"
        />
      </div>
    );
  }

  if (error || !user || !summary) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div role="alert" className="alert alert-error mt-6">
          <span>{error || "Could not load dashboard."}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn btn-primary"
          >
            Retry
          </button>

          <Link href="/login" className="btn btn-outline">
            Login
          </Link>
        </div>
      </section>
    );
  }

  const canManage = ["organizer", "admin"].includes(user.role);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-primary">
            Welcome back
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {user.name}
          </h1>

          <p className="mt-2 text-base-content/70">
            {user.email}
          </p>

          <span className="badge badge-primary mt-3 capitalize">
            {user.role}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
          className="btn btn-outline"
        >
          Refresh Dashboard
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary.stats).map(([key, value]) => (
          <article
            key={key}
            className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"
          >
            <h2 className="text-sm font-medium text-base-content/70">
              {statLabels[key] || key}
            </h2>

            <p className="mt-3 text-4xl font-bold text-primary">
              {value}
            </p>
          </article>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Quick Actions</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#events" className="btn btn-outline">
            Explore Events
          </Link>

          <Link
            href="/dashboard/favorites"
            className="btn btn-outline"
          >
            My Favorites
          </Link>
          <Link
  href="/dashboard/notifications"
  className="btn btn-outline"
>
  Notifications
</Link>
<Link
  href="/dashboard/recommendations"
  className="btn btn-outline"
>
  Recommended Events
</Link>

          <Link
            href="/dashboard/my-registrations"
            className="btn btn-outline"
          >
            My Registrations & Certificates
          </Link>

          {canManage && (
            <>
              <Link
                href="/dashboard/create-event"
                className="btn btn-primary"
              >
                Create Event
              </Link>

              <Link
                href="/dashboard/my-events"
                className="btn btn-outline"
              >
                Manage Events
              </Link>

              <Link
                href="/dashboard/attendance"
                className="btn btn-outline"
              >
                Take Attendance
              </Link>
            </>
          )}

          {user.role === "admin" && (
            <Link
              href="/dashboard/users"
              className="btn btn-primary"
            >
              Manage Users
            </Link>
          )}
        </div>
      </section>

      {canManage && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Event Analytics</h2>

          <p className="mt-2 text-sm text-base-content/70">
            Attendance rate compares checked-in participants with
            registrations. Upcoming events may have no attendance yet.
          </p>

          {summary.events.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-base-300 p-8">
              No events available yet.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-base-300">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Capacity</th>
                    <th>Registered</th>
                    <th>Attended</th>
                    <th>Attendance rate</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.events.map((event) => (
                    <tr key={event.id}>
                      <td className="font-semibold">
                        {event.title}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            event.status === "cancelled"
                              ? "badge-error"
                              : "badge-success"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td>{event.capacity}</td>
                      <td>{event.registered}</td>
                      <td>{event.attended}</td>

                      <td className="min-w-40">
                        <span className="text-sm">
                          {event.attendanceRate}%
                        </span>

                        <progress
                          aria-label={`Attendance rate for ${event.title}`}
                          className="progress progress-primary mt-2 w-full"
                          value={event.attendanceRate}
                          max={100}
                        />
                      </td>

                      <td>
                        <Link
                          href={`/dashboard/participants/${event.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          Participants
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  );
}