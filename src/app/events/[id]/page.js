"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { protectedFetch } from "@/lib/api";
import FavoriteButton from "@/components/FavoriteButton";
import EventReviews from "@/components/EventReviews";

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

function EventDetailsContent() {
  const { id } = useParams();

  const {
    data: session,
    isPending: sessionPending,
  } = authClient.useSession();

  const userId = session?.user?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [registration, setRegistration] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setLoading(true);
      setError("");
      setEvent(null);
      setMessage("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not load event."
          );
        }

        if (!controller.signal.aborted) {
          setEvent(result.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || "Could not load event.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    let active = true;

    setProfile(null);
    setRegistration(null);
    setAccountError("");

    if (!userId) {
      setChecking(false);
      return;
    }

    setChecking(true);

    async function loadAccount() {
      try {
        const [profileResult, registrationResult] =
          await Promise.all([
            protectedFetch("/api/me"),
            protectedFetch(`/api/events/${id}/registration`),
          ]);

        if (active) {
          setProfile(profileResult.data);
          setRegistration(registrationResult.data);
        }
      } catch (error) {
        if (active) {
          setAccountError(
            error.message || "Could not check registration."
          );
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [id, userId, reload]);

  async function handleRegister() {
    if (pending) return;

    setPending(true);
    setAccountError("");
    setMessage("");

    try {
      const result = await protectedFetch(
        `/api/events/${id}/register`,
        { method: "POST" }
      );

      setRegistration({ status: "registered" });

      setEvent((current) =>
        current
          ? {
              ...current,
              registeredCount: (current.registeredCount || 0) + 1,
            }
          : current
      );

      setMessage(
        result.message || "Registered successfully."
      );
    } catch (error) {
      setAccountError(
        error.message || "Could not register for this event."
      );
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <EventLoading />;
  }

  if (error || !event) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div role="alert" className="alert alert-error">
          <span>{error || "Event not found"}</span>
        </div>

        <Link href="/#events" className="btn btn-primary mt-6">
          Back to Events
        </Link>
      </section>
    );
  }

  const seatsLeft = Math.max(
    0,
    event.capacity - (event.registeredCount || 0)
  );

  const closed =
    new Date(event.registrationDeadline).getTime() <= Date.now() ||
    new Date(event.startDate).getTime() <= Date.now() ||
    seatsLeft === 0;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/#events" className="link link-primary">
        Back to Events
      </Link>

      <article className="card mt-6 border border-base-300 bg-base-100">
        <div className="card-body">
          <span className="badge badge-primary">
            {event.category}
          </span>

          <h1 className="mt-3 text-3xl font-bold">
            {event.title}
          </h1>

          <div className="mt-4">
            <FavoriteButton
              key={event._id}
              eventId={event._id}
            />
          </div>

          <p className="mt-4 whitespace-pre-wrap leading-7 text-base-content/75">
            {event.description}
          </p>

          <dl className="mt-6 grid gap-5 border-t border-base-300 pt-6 sm:grid-cols-2">
            {[
              ["Venue", event.venue],
              ["Starts", formatDate(event.startDate)],
              ["Ends", formatDate(event.endDate)],
              [
                "Registration deadline",
                formatDate(event.registrationDeadline),
              ],
              ["Seats remaining", seatsLeft],
              [
                "Fee",
                Number(event.fee) === 0
                  ? "Free"
                  : `৳${Number(event.fee).toLocaleString("en-BD")}`,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-semibold">{label}</dt>
                <dd className="mt-1 text-base-content/70">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-sm text-base-content/60">
            All times are shown in Bangladesh time.
          </p>

          {message && (
            <div
              role="status"
              className="alert alert-success mt-5"
            >
              <span>{message}</span>
            </div>
          )}

          {accountError && (
            <div
              role="alert"
              className="alert alert-error mt-5"
            >
              <span>{accountError}</span>

              <button
                type="button"
                disabled={checking || pending}
                className="btn btn-sm"
                onClick={() => setReload((count) => count + 1)}
              >
                Recheck
              </button>
            </div>
          )}

          <div className="mt-6">
            {sessionPending || checking ? (
              <span
                role="status"
                aria-label="Checking registration"
                className="loading loading-spinner"
              />
            ) : !session ? (
              <Link href="/login" className="btn btn-primary">
                Login to Register
              </Link>
            ) : registration ? (
              <button
                type="button"
                className="btn btn-success w-full"
                disabled
              >
                Already Registered
              </button>
            ) : accountError ? (
              <p className="text-base-content/70">
                Could not verify your registration. Please use Recheck.
              </p>
            ) : profile?.role !== "student" ? (
              <p className="text-base-content/70">
                Registration is available for Student accounts.
              </p>
            ) : (
              <button
                type="button"
                disabled={pending || closed}
                onClick={handleRegister}
                className="btn btn-primary w-full"
              >
                {pending
                  ? "Registering..."
                  : closed
                    ? "Registration Closed"
                    : "Register for Event"}
              </button>
            )}
          </div>
        </div>
      </article>

      <EventReviews
        key={event._id}
        eventId={event._id}
      />
    </section>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<EventLoading />}>
      <EventDetailsContent />
    </Suspense>
  );
}