"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setLoading(true);
      setError("");

      try {
        const result = await protectedFetch("/api/notifications");

        if (active) {
          setNotifications(result.data);
          setUnreadCount(result.unreadCount);
        }
      } catch (error) {
        if (active) setError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [reload]);

  async function markRead(notification) {
    if (pendingId || notification.read) return;

    setPendingId(notification._id);
    setError("");

    try {
      await protectedFetch(
        `/api/notifications/${notification._id}/read`,
        { method: "PATCH" }
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, read: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setError(error.message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>

          <p className="mt-2 text-base-content/70">
            {unreadCount} unread · Latest 50 notifications
          </p>
        </div>

        <button
          type="button"
          disabled={loading || pendingId !== null}
          onClick={() => setReload((value) => value + 1)}
          className="btn btn-outline"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p role="status" className="py-12">
          Loading notifications...
        </p>
      ) : notifications.length === 0 && !error ? (
        <p className="mt-8 rounded-xl border border-base-300 p-8">
          No notifications yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`rounded-xl border p-5 ${
                notification.read
                  ? "border-base-300 bg-base-100"
                  : "border-primary bg-base-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {notification.title}
                </h2>

                {!notification.read && (
                  <span className="badge badge-primary">New</span>
                )}
              </div>

              <p className="mt-3">{notification.message}</p>

              <p className="mt-3 text-sm text-base-content/60">
                {new Date(notification.createdAt).toLocaleString(
                  "en-GB",
                  { timeZone: "Asia/Dhaka" }
                )}
                {" · Bangladesh time"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={notification.href}
                  className="btn btn-outline btn-sm"
                >
                  View Registrations
                </Link>

                {!notification.read && (
                  <button
                    type="button"
                    disabled={pendingId !== null}
                    onClick={() => markRead(notification)}
                    className="btn btn-primary btn-sm"
                  >
                    {pendingId === notification._id
                      ? "Saving..."
                      : "Mark as Read"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}