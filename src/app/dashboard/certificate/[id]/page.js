"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

function CertificateLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p role="status" className="py-10 text-center">
        Preparing certificate...
      </p>
    </div>
  );
}

function CertificateContent() {
  const { id } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCertificate() {
      setLoading(true);
      setError("");
      setCertificate(null);

      try {
        if (typeof id !== "string" || !id) {
          throw new Error("Invalid registration ID.");
        }

        const result = await protectedFetch(
          `/api/registrations/${encodeURIComponent(id)}/certificate`,
          { method: "POST" }
        );

        if (!result?.data) {
          throw new Error("Certificate data was not returned.");
        }

        if (active) {
          setCertificate(result.data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load certificate. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCertificate();

    return () => {
      active = false;
    };
  }, [id, retry]);

  return (
    <section className="certificate-page mx-auto max-w-5xl px-4 py-12">
      <div className="certificate-controls mb-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/my-registrations"
          className="btn btn-outline"
        >
          Back to My Registrations
        </Link>

        {certificate && !loading && !error && (
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            Print / Save PDF
          </button>
        )}
      </div>

      {loading && (
        <p role="status" className="py-10 text-center">
          Preparing certificate...
        </p>
      )}

      {!loading && error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setRetry((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && certificate && (
        <article
          id="event-certificate"
          className="border-8 border-double border-indigo-900 bg-white p-8 text-center text-slate-900 sm:p-14"
        >
          <p className="text-xl font-bold tracking-widest text-indigo-900">
            CAMPUS EVENTS
          </p>

          <h1 className="mt-8 text-3xl font-bold sm:text-5xl">
            Certificate of Participation
          </h1>

          <p className="mt-8 text-lg">
            This certificate is awarded to
          </p>

          <h2 className="mt-5 break-words text-3xl font-bold text-indigo-900 sm:text-4xl">
            {certificate.attendeeName}
          </h2>

          <p className="mt-6 text-lg">for participating in</p>

          <h3 className="mt-4 break-words text-2xl font-semibold">
            {certificate.eventTitle}
          </h3>

          <p className="mt-5">
            Held on {formatDate(certificate.eventDate)}
          </p>

          <div className="mt-12 border-t border-slate-300 pt-6 text-sm">
            <p>Issued on {formatDate(certificate.issuedAt)}</p>

            <p className="mt-2 break-all">
              Certificate ID: {certificate.certificateId}
            </p>

            <p className="mt-4 font-semibold">
              CampusEvents · Event Management System
            </p>
          </div>
        </article>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          body > header,
          body > footer,
          .certificate-controls {
            display: none !important;
          }

          body,
          main {
            display: block !important;
            min-height: 0 !important;
            background: white !important;
          }

          .certificate-page {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #event-certificate {
            break-inside: avoid;
            padding: 10mm !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          #event-certificate h1 {
            font-size: 30px !important;
          }

          #event-certificate h2 {
            font-size: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<CertificateLoading />}>
      <CertificateContent />
    </Suspense>
  );
}