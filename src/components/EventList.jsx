"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const categories = [
  "Workshop",
  "Seminar",
  "Competition",
  "Cultural",
  "Sports",
  "Other",
];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

export default function EventList() {
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    page: 1,
  });

  const [result, setResult] = useState({
    data: [],
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is missing in .env.local.");
        }

        const params = new URLSearchParams({
          search: filters.search,
          category: filters.category,
          page: String(filters.page),
          limit: "6",
        });

        const response = await fetch(
          `${apiUrl}/api/events?${params}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const body = await response.json();

        if (!response.ok || !body.success) {
          throw new Error(body.message || "Could not load events.");
        }

        if (!Array.isArray(body.data)) {
          throw new Error("Invalid server response.");
        }

        if (!controller.signal.aborted) {
          setResult(body);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || "Could not load events.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => controller.abort();
  }, [filters, retryCount]);

  function handleSearch(event) {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
      page: 1,
    }));
  }

  function clearFilters() {
    setSearchInput("");

    setFilters({
      search: "",
      category: "",
      page: 1,
    });
  }

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-base-300 bg-base-200 p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="event-search" className="sr-only">
            Search events by title or venue
          </label>

          <input
            id="event-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
            placeholder="Search by event title or venue..."
            className="input input-bordered w-full flex-1"
          />

          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label htmlFor="event-category" className="font-medium">
            Category
          </label>

          <select
            id="event-category"
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value,
                page: 1,
              }))
            }
            className="select select-bordered w-full sm:w-56"
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-ghost"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div
          role="status"
          aria-label="Loading events"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-base-300 p-6"
            >
              <div className="skeleton mb-5 h-7 w-24" />
              <div className="skeleton mb-4 h-7 w-3/4" />
              <div className="skeleton mb-3 h-4 w-full" />
              <div className="skeleton h-24 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="btn btn-sm"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <p role="status" className="mb-4 text-base-content/70">
            {result.total} event{result.total === 1 ? "" : "s"} found
          </p>

          {result.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 p-10 text-center">
              <h3 className="text-xl font-bold">No events found</h3>
              <p className="mt-2 text-base-content/70">
                Try another search or clear your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.data.map((event) => (
                <article
                  key={event._id}
                  className="card border border-base-300 bg-base-100 shadow-sm"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between gap-3">
                      <span className="badge badge-primary badge-soft">
                        {event.category}
                      </span>

                      <span className="font-semibold text-success">
                        {Number(event.fee) === 0
                          ? "Free"
                          : `৳${Number(event.fee).toLocaleString("en-BD")}`}
                      </span>
                    </div>

                    <h3 className="card-title mt-3">{event.title}</h3>

                    <p className="line-clamp-3 text-sm leading-6 text-base-content/70">
                      {event.description}
                    </p>

                    <dl className="mt-4 space-y-3 border-t border-base-300 pt-4 text-sm">
                      <div>
                        <dt className="font-semibold">
                          Date · Bangladesh time
                        </dt>
                        <dd className="text-base-content/70">
                          {formatDate(event.startDate)}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-semibold">Venue</dt>
                        <dd>{event.venue}</dd>
                      </div>

                      <div>
                        <dt className="font-semibold">Capacity</dt>
                        <dd>{event.capacity} participants</dd>
                      </div>
                    </dl>
                    <div className="card-actions mt-5">
  <Link
    href={`/events/${event._id}`}
    className="btn btn-primary w-full"
  >
    View Details
  </Link>
</div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <nav
              aria-label="Event pagination"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>

              <span className="text-sm">
                Page {filters.page} of {result.totalPages}
              </span>

              <button
                type="button"
                disabled={filters.page >= result.totalPages}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}