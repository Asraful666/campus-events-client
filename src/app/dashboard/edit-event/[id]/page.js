"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

const categories = [
  "Workshop",
  "Seminar",
  "Competition",
  "Cultural",
  "Sports",
  "Other",
];

function EventLoading() {
  return (
    <div className="flex justify-center py-20">
      <span
        role="status"
        aria-label="Loading event"
        className="loading loading-spinner loading-lg"
      />
    </div>
  );
}

function EditEventContent() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      setLoading(true);
      setError("");
      setEvent(null);
      setMessage("");

      try {
        const result = await protectedFetch(
          `/api/manage/events/${id}`
        );

        if (active) {
          setEvent(result.data);
        }
      } catch (error) {
        if (active) {
          setError(error.message || "Could not load event.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    if (pending) return;

    const values = new FormData(submitEvent.currentTarget);

    setPending(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: String(values.get("title") || "").trim(),
        description: String(
          values.get("description") || ""
        ).trim(),
        category: String(values.get("category") || ""),
        venue: String(values.get("venue") || "").trim(),
        capacity: Number(values.get("capacity")),
        fee: Number(values.get("fee")),
      };

      const result = await protectedFetch(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setMessage(result.message || "Event updated successfully.");
    } catch (error) {
      setError(error.message || "Could not update event.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <EventLoading />;
  }

  const canEdit = event?.status === "published";

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/dashboard/my-events"
        className="link link-primary"
      >
        Back to Manage Events
      </Link>

      <h1 className="mt-4 text-3xl font-bold">Edit Event</h1>

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div role="status" className="alert alert-success mt-6">
          <span>{message}</span>
        </div>
      )}

      {event && !canEdit && (
        <div role="alert" className="alert alert-warning mt-6">
          <span>Only published events can be edited.</span>
        </div>
      )}

      {canEdit && (
        <form
          key={id}
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-base-300 bg-base-100 p-6"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block font-medium"
            >
              Event title
            </label>

            <input
              id="title"
              name="title"
              defaultValue={event.title}
              required
              minLength={5}
              maxLength={150}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              defaultValue={event.description}
              required
              minLength={20}
              maxLength={5000}
              rows={5}
              className="textarea textarea-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block font-medium"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              defaultValue={event.category}
              required
              className="select select-bordered w-full"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="venue"
              className="mb-2 block font-medium"
            >
              Venue
            </label>

            <input
              id="venue"
              name="venue"
              defaultValue={event.venue}
              required
              minLength={3}
              maxLength={200}
              className="input input-bordered w-full"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="capacity"
                className="mb-2 block font-medium"
              >
                Capacity
              </label>

              <input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue={event.capacity}
                required
                min={1}
                max={100000}
                step={1}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label
                htmlFor="fee"
                className="mb-2 block font-medium"
              >
                Fee (BDT)
              </label>

              <input
                id="fee"
                name="fee"
                type="number"
                defaultValue={event.fee}
                required
                min={0}
                max={1000000}
                step="0.01"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full"
          >
            {pending && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}

            {pending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </section>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<EventLoading />}>
      <EditEventContent />
    </Suspense>
  );
}