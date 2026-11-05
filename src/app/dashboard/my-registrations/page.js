"use client";

import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [ticket, setTicket] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadRegistrations() {
      setLoading(true);
      setError("");

      try {
        const result = await protectedFetch(
          "/api/my-registrations"
        );

        if (active) {
          setRegistrations(result.data);
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

    loadRegistrations();

    return () => {
      active = false;
    };
  }, [retry]);

  async function openTicket(registrationId) {
    if (openingId) return;

    setOpeningId(registrationId);
    setError("");
    setTicket(null);
    setQrImage("");

    try {
      const result = await protectedFetch(
        `/api/registrations/${registrationId}/ticket`,
        { method: "POST" }
      );

      const image = await QRCode.toDataURL(result.data.qrValue, {
        width: 320,
        margin: 4,
        errorCorrectionLevel: "M",
      });

      setTicket(result.data);
      setQrImage(image);
    } catch (error) {
      setError(error.message);
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
        My Registrations
      </h1>

      <p className="mt-2 text-base-content/70">
        View your registered events and attendance tickets.
      </p>

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setRetry((count) => count + 1)}
          >
            Reload List
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span
            role="status"
            aria-label="Loading registrations"
            className="loading loading-spinner loading-lg"
          />
        </div>
      ) : registrations.length === 0 && !error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-base-300 p-8 text-center">
          <h2 className="text-xl font-bold">
            No registrations yet
          </h2>

          <Link href="/#events" className="btn btn-primary mt-4">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {registrations.map((registration) => {
            const event = registration.event;

            const unavailable =
              !event ||
              event.status !== "published" ||
              registration.status !== "registered";

            return (
              <article
                key={registration._id}
                className="card border border-base-300 bg-base-100"
              >
                <div className="card-body">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="card-title">
                        {event?.title || "Event unavailable"}
                      </h2>

                      {event && (
                        <>
                          <p className="mt-2">{event.venue}</p>

                          <p className="mt-1 text-sm text-base-content/70">
                            {formatDate(event.startDate)} · Bangladesh time
                          </p>
                        </>
                      )}
                    </div>

                    <span
                      className={`badge ${
                        unavailable
                          ? "badge-error"
                          : registration.attended
                            ? "badge-success"
                            : "badge-primary"
                      }`}
                    >
                      {unavailable
                        ? "Unavailable"
                        : registration.attended
                          ? "Attended"
                          : "Registered"}
                    </span>
                  </div>

                  <div className="card-actions mt-4">
                    <button
                      type="button"
                      disabled={unavailable || openingId !== null}
                      onClick={() => openTicket(registration._id)}
                      className="btn btn-primary btn-sm"
                    >
                      {openingId === registration._id
                        ? "Preparing..."
                        : "View QR Ticket"}
                    </button>
                    {registration.attended &&
  registration.event?.status === "published" && (
    <Link
      href={`/dashboard/certificate/${registration._id}`}
      className="btn btn-outline btn-sm"
    >
      Certificate
    </Link>
  )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {ticket && qrImage && (
        <section
          aria-label="Attendance ticket"
          className="mx-auto mt-10 max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 text-center shadow-lg"
        >
          <p className="font-bold text-primary">CampusEvents</p>

          <h2 className="mt-2 text-2xl font-bold">
            {ticket.eventTitle}
          </h2>

          <p className="mt-3 font-semibold">
            {ticket.attendeeName}
          </p>

          <p className="mt-1 text-sm">{ticket.venue}</p>

          <p className="mt-1 text-sm text-base-content/70">
            {formatDate(ticket.startDate)} · Bangladesh time
          </p>

          <Image
            src={qrImage}
            alt="Your event attendance QR ticket"
            width={320}
            height={320}
            unoptimized
            className="mx-auto mt-4 h-auto max-w-full"
          />

          <p className="text-sm text-base-content/70">
            Show this QR to the organizer at check-in.
            Keep your ticket private.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={qrImage}
              download={`campus-ticket-${ticket.registrationId}.png`}
              className="btn btn-primary"
            >
              Download QR
            </a>


            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setTicket(null);
                setQrImage("");
              }}
            >
              Close Ticket
            </button>
            
            
          </div>
        </section>
      )}
    </section>
  );
}