"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function ParticipantsLoading() {
  return (
    <div className="flex justify-center py-16">
      <span
        role="status"
        aria-label="Loading participants"
        className="loading loading-spinner loading-lg"
      />
    </div>
  );
}

function ParticipantsContent() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadParticipants() {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const result = await protectedFetch(
          `/api/manage/events/${id}/participants`
        );

        if (active) {
          setData(result.data);
        }
      } catch (error) {
        if (active) {
          setError(error.message || "Could not load participants.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadParticipants();

    return () => {
      active = false;
    };
  }, [id, reload]);

  const participants = (data?.participants || []).filter(
    (participant) => {
      if (filter === "attended") return participant.attended;
      if (filter === "pending") return !participant.attended;
      return true;
    }
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/dashboard/my-events"
        className="link link-primary"
      >
        Back to Manage Events
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Participants</h1>

          {data && (
            <p className="mt-2 text-base-content/70">
              {data.event.title}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => setReload((count) => count + 1)}
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
        <ParticipantsLoading />
      ) : data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Registered", data.summary.registered],
              ["Attended", data.summary.attended],
              ["Not checked in", data.summary.notCheckedIn],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-base-300 bg-base-100 p-6"
              >
                <p className="text-base-content/70">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <label
              htmlFor="attendance-filter"
              className="font-medium"
            >
              Show
            </label>

            <select
              id="attendance-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="select select-bordered"
            >
              <option value="all">All participants</option>
              <option value="attended">Attended</option>
              <option value="pending">Not checked in</option>
            </select>
          </div>

          {participants.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-base-300 p-8 text-center">
              No participants match this filter.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-base-300">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Attendance</th>
                    <th>Check-in time</th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.registrationId}>
                      <td className="font-semibold">
                        {participant.name}
                      </td>

                      <td>{participant.email || "—"}</td>

                      <td>
                        {formatDate(participant.registeredAt)}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            participant.attended
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {participant.attended
                            ? "Attended"
                            : "Not checked in"}
                        </span>
                      </td>

                      <td>
                        {formatDate(participant.attendedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-sm text-base-content/60">
            All times are shown in Bangladesh time.
          </p>
        </>
      ) : null}
    </section>
  );
}

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<ParticipantsLoading />}>
      <ParticipantsContent />
    </Suspense>
  );
}