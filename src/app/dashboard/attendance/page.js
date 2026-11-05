"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { protectedFetch } from "@/lib/api";

function AttendanceScanner() {
  const containerRef = useRef(null);
  const lockedRef = useRef(false);

  const [pending, setPending] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let disposed = false;
    let scanner;

    // Each effect owns a separate scanner container.
    const element = document.createElement("div");
    element.id = `qr-reader-${crypto.randomUUID()}`;
    containerRef.current.appendChild(element);

    async function initialize() {
      try {
        const {
          Html5QrcodeScanner,
          Html5QrcodeSupportedFormats,
        } = await import("html5-qrcode");

        if (disposed) return;

        scanner = new Html5QrcodeScanner(
          element.id,
          {
            fps: 10,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
            rememberLastUsedCamera: false,
          },
          false
        );

        scanner.render(
          async (decodedText) => {
            if (disposed || lockedRef.current) return;

            lockedRef.current = true;
            setPending(true);
            setProcessed(false);
            setError("");
            setResult(null);

            try {
              if (
                !/^campus-events:[a-f0-9]{64}$/.test(decodedText)
              ) {
                throw new Error(
                  "This is not a valid CampusEvents QR ticket."
                );
              }

              const response = await protectedFetch(
                "/api/attendance/check-in",
                {
                  method: "POST",
                  body: JSON.stringify({
                    qrValue: decodedText,
                  }),
                }
              );

              if (!disposed) {
                setResult(response);
              }
            } catch (error) {
              if (!disposed) {
                setError(
                  error.message || "Could not record attendance."
                );
              }
            } finally {
              if (!disposed) {
                setPending(false);
                setProcessed(true);
              }
            }
          },
          () => {
            // Frames without a readable QR are expected.
          }
        );
      } catch (error) {
        if (!disposed) {
          setError(error.message || "Could not start scanner.");
        }
      }
    }

    void initialize();

    return () => {
      disposed = true;

      if (scanner) {
        scanner
          .clear()
          .catch(() => {
            // Release any remaining camera tracks.
            const video = element.querySelector("video");
            const stream = video?.srcObject;

            if (stream instanceof MediaStream) {
              stream.getTracks().forEach((track) => track.stop());
            }
          })
          .finally(() => element.remove());
      } else {
        element.remove();
      }
    };
  }, []);

  function scanNext() {
    setError("");
    setResult(null);
    setProcessed(false);
    lockedRef.current = false;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
        <div ref={containerRef} />
      </div>

      {pending && (
        <p role="status" className="flex items-center gap-3">
          <span className="loading loading-spinner loading-sm" />
          Verifying ticket...
        </p>
      )}

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div role="status" className="alert alert-success">
          <div>
            <h2 className="font-bold">{result.message}</h2>

            <p className="mt-2">{result.data.eventTitle}</p>

            <p className="mt-2 break-all text-sm">
              Registration: {result.data.registrationId}
            </p>

            <p className="mt-1 text-sm">
              {new Date(result.data.attendedAt).toLocaleString(
                "en-GB",
                { timeZone: "Asia/Dhaka" }
              )}
              {" · Bangladesh time"}
            </p>
          </div>
        </div>
      )}

      {processed && (
        <div>
          <p className="mb-3 text-sm text-base-content/70">
            Remove the previous QR from the camera before scanning
            another ticket.
          </p>

          <button
            type="button"
            onClick={scanNext}
            className="btn btn-primary"
          >
            Scan Next Ticket
          </button>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        await protectedFetch("/api/organizer/access");

        if (active) setAllowed(true);
      } catch (error) {
        if (active) setError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
        Event Check-in
      </h1>

      <p className="mt-2 text-base-content/70">
        Scan a participant&apos;s QR ticket using your camera or
        select a QR image.
      </p>

      {loading && (
        <p role="status" className="py-10">
          Checking access...
        </p>
      )}

      {error && (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>
        </div>
      )}

      {allowed && <AttendanceScanner />}
    </section>
  );
}