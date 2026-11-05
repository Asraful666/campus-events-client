"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { protectedFetch } from "@/lib/api";

function ReviewForm({ eventId, existingReview, onSaved }) {
  const [rating, setRating] = useState(
    String(existingReview?.rating || 5)
  );
  const [comment, setComment] = useState(
    existingReview?.comment || ""
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (pending) return;

    setPending(true);
    setError("");

    try {
      await protectedFetch(`/api/events/${eventId}/review`, {
        method: "PUT",
        body: JSON.stringify({
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      onSaved("Review saved successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (pending || !window.confirm("Delete your review?")) {
      return;
    }

    setPending(true);
    setError("");

    try {
      await protectedFetch(`/api/events/${eventId}/review`, {
        method: "DELETE",
      });

      onSaved("Review deleted.");
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-xl border border-base-300 p-5"
    >
      <h3 className="text-lg font-bold">
        {existingReview ? "Update your review" : "Write a review"}
      </h3>

      <p className="text-sm text-base-content/70">
        Reviews are available to attended participants after the event ends.
      </p>

      <div>
        <label htmlFor="review-rating" className="mb-2 block">
          Rating
        </label>

        <select
          id="review-rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="select select-bordered w-full"
          disabled={pending}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} / 5
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-2 block">
          Your experience
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          minLength={5}
          maxLength={1000}
          rows={4}
          disabled={pending}
          placeholder="Share your experience of this event..."
          className="textarea textarea-bordered w-full"
        />
      </div>

      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Please wait..." : "Save Review"}
        </button>

        {existingReview && (
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            className="btn btn-error btn-outline"
          >
            Delete My Review
          </button>
        )}
      </div>
    </form>
  );
}

export default function EventReviews({ eventId }) {
  const { data: session, isPending } = authClient.useSession();

  const [data, setData] = useState({
    reviews: [],
    total: 0,
    average: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/reviews`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load reviews.");
        }

        if (!controller.signal.aborted) {
          setData(result.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => controller.abort();
  }, [eventId, reload]);

  const ownReview = data.reviews.find(
    (review) => review.userId === session?.user.id
  );

  function handleSaved(text) {
    setMessage(text);
    setReload((value) => value + 1);
  }

  return (
    <section className="mt-10 border-t border-base-300 pt-8">
      <h2 className="text-2xl font-bold">Reviews & Ratings</h2>

      {message && (
        <p role="status" className="mt-4 text-success">
          {message}
        </p>
      )}

      {loading ? (
        <p role="status" className="mt-4">
          Loading reviews...
        </p>
      ) : error ? (
        <div role="alert" className="alert alert-error mt-4">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            className="btn btn-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-lg">
            {data.total
              ? `${data.average.toFixed(1)} / 5 · ${data.total} reviews`
              : "No reviews yet"}
          </p>

          {!isPending && (
            session ? (
              <ReviewForm
                key={`${eventId}-${session.user.id}-${reload}`}
                eventId={eventId}
                existingReview={ownReview}
                onSaved={handleSaved}
              />
            ) : (
              <Link href="/login" className="btn btn-outline mt-4">
                Login to Review
              </Link>
            )
          )}

          <div className="mt-6 space-y-4">
            {data.reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-xl border border-base-300 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{review.name}</h3>

                  <span className="badge badge-primary">
                    {review.rating} / 5
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}