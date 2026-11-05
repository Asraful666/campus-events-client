"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-base-300 bg-base-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-xl font-bold text-primary"
          >
            CampusEvents
          </Link>

          <p className="mt-2 text-sm text-base-content/70">
            Discover events. Build connections. Create memories.
          </p>
        </div>

        <p className="text-sm text-base-content/70">
          © {year ? `${year} ` : ""}CampusEvents
        </p>
      </div>
    </footer>
  );
}