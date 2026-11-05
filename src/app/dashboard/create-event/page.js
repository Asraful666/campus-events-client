"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

const categories = [
  "Workshop",
  "Seminar",
  "Competition",
  "Cultural",
  "Sports",
  "Other",
];

export default function CreateEventPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const result = await protectedFetch("/api/me");

        if (active) {
          setUser(result.data);
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

    checkAccess();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (pending) return;

    const form = event.currentTarget;
    const values = new FormData(form);

    setError("");
    setSuccess("");
    setPending(true);

    try {
      // The form explicitly asks for Bangladesh time.
      function toBangladeshISO(field) {
        const value = String(values.get(field) || "");

        if (!value) {
          throw new Error("Please complete all date fields.");
        }

        return new Date(`${value}:00+06:00`).toISOString();
      }

      const payload = {
        title: String(values.get("title") || "").trim(),
        description: String(values.get("description") || "").trim(),
        category: String(values.get("category") || ""),
        venue: String(values.get("venue") || "").trim(),
        capacity: Number(values.get("capacity")),
        fee: Number(values.get("fee")),
        startDate: toBangladeshISO("startDate"),
        endDate: toBangladeshISO("endDate"),
        registrationDeadline: toBangladeshISO(
          "registrationDeadline"
        ),
      };

      const result = await protectedFetch("/api/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(result.message);
      form.reset();
    } catch (error) {
      setError(error.message || "Could not create event.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span
          role="status"
          aria-label="Checking permissions"
          className="loading loading-spinner loading-lg"
        />
      </div>
    );
  }

  const canCreate =
    user && ["organizer", "admin"].includes(user.role);

  if (!canCreate) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Create Event</h1>

        <div role="alert" className="alert alert-error mt-6">
          <span>
            {error ||
              "Only Organizers and Admins can create events."}
          </span>
        </div>

        <Link
          href={user ? "/dashboard" : "/login"}
          className="btn btn-primary mt-6"
        >
          {user ? "Back to Dashboard" : "Login"}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">Create an Event</h1>

      <p className="mt-2 text-base-content/70">
        Publish a new experience for your campus community.
      </p>

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div role="status" className="alert alert-success mt-6">
          <span>{success}</span>
          <Link href="/#events" className="link">
            View events
          </Link>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-base-300 bg-base-100 p-6"
      >
        <div>
          <label htmlFor="title" className="mb-2 block font-medium">
            Event title
          </label>

          <input
            id="title"
            name="title"
            required
            minLength={5}
            maxLength={150}
            className="input input-bordered w-full"
            placeholder="Example: React Workshop"
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
            required
            minLength={20}
            maxLength={5000}
            rows={5}
            className="textarea textarea-bordered w-full"
            placeholder="Describe the event and what students will learn."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
              required
              defaultValue=""
              className="select select-bordered w-full"
            >
              <option value="" disabled>
                Select category
              </option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="venue" className="mb-2 block font-medium">
              Venue
            </label>

            <input
              id="venue"
              name="venue"
              required
              minLength={3}
              maxLength={200}
              className="input input-bordered w-full"
              placeholder="University Auditorium"
            />
          </div>
        </div>

        <p className="text-sm font-semibold text-primary">
          Enter all dates and times in Bangladesh time (UTC+6).
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="startDate"
              className="mb-2 block font-medium"
            >
              Start date & time
            </label>

            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              required
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="mb-2 block font-medium"
            >
              End date & time
            </label>

            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              required
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="registrationDeadline"
            className="mb-2 block font-medium"
          >
            Registration deadline
          </label>

          <input
            id="registrationDeadline"
            name="registrationDeadline"
            type="datetime-local"
            required
            className="input input-bordered w-full"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="capacity"
              className="mb-2 block font-medium"
            >
              Participant capacity
            </label>

            <input
              id="capacity"
              name="capacity"
              type="number"
              required
              min={1}
              max={100000}
              step={1}
              className="input input-bordered w-full"
              placeholder="100"
            />
          </div>

          <div>
            <label htmlFor="fee" className="mb-2 block font-medium">
              Fee (BDT)
            </label>

            <input
              id="fee"
              name="fee"
              type="number"
              required
              min={0}
              max={1000000}
              step="0.01"
              defaultValue={0}
              className="input input-bordered w-full"
            />

            <p className="mt-1 text-sm text-base-content/60">
              Enter 0 for a free event.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full"
        >
          {pending && (
            <span className="loading loading-spinner loading-sm" />
          )}

          {pending ? "Publishing..." : "Publish Event"}
        </button>
      </form>
    </section>
  );
}