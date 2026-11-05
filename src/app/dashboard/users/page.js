"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { protectedFetch } from "@/lib/api";

function UserRow({ user, currentUserId, onUpdated }) {
  const [role, setRole] = useState(user.role);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const isSelf = user.id === currentUserId;

  async function saveRole() {
    if (pending || isSelf || role === user.role) return;

    const confirmed = window.confirm(
      `Change ${user.name}'s role to ${role}?`
    );

    if (!confirmed) return;

    setPending(true);
    setError("");

    try {
      await protectedFetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      onUpdated(user.id, role);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <tr>
      <td>
        <p className="font-semibold">{user.name}</p>
        {isSelf && (
          <span className="badge badge-primary badge-sm mt-1">
            You
          </span>
        )}
      </td>

      <td>{user.email}</td>

      <td>
        <select
          aria-label={`Role for ${user.email}`}
          value={role}
          disabled={isSelf || pending}
          onChange={(event) => setRole(event.target.value)}
          className="select select-bordered select-sm w-36"
        >
          <option value="student">Student</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </td>

      <td>
        <button
          type="button"
          disabled={isSelf || pending || role === user.role}
          onClick={saveRole}
          className="btn btn-primary btn-sm"
        >
          {pending ? "Saving..." : "Save Role"}
        </button>

        {error && (
          <p role="alert" className="mt-2 max-w-xs text-sm text-error">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState({ search: "", page: 1 });

  const [result, setResult] = useState({
    data: [],
    total: 0,
    totalPages: 0,
    currentUserId: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search: query.search,
          page: String(query.page),
        });

        const response = await protectedFetch(
          `/api/admin/users?${params}`
        );

        if (active) {
          setResult(response);
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

    loadUsers();

    return () => {
      active = false;
    };
  }, [query, retry]);

  function handleSearch(event) {
    event.preventDefault();

    setMessage("");
    setQuery({
      search: searchInput.trim(),
      page: 1,
    });
  }

  function handleUpdated(userId, role) {
    setResult((current) => ({
      ...current,
      data: current.data.map((user) =>
        user.id === userId ? { ...user, role } : user
      ),
    }));

    setMessage("User role updated successfully.");
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/dashboard" className="link link-primary">
        Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">Manage Users</h1>

      <p className="mt-2 text-base-content/70">
        Search accounts and manage their access.
      </p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex flex-wrap gap-3"
      >
        <label htmlFor="user-search" className="sr-only">
          Search users by name or email
        </label>

        <input
          id="user-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={100}
          placeholder="Search name or email..."
          className="input input-bordered w-full sm:w-80"
        />

        <button type="submit" className="btn btn-primary">
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            setQuery({ search: "", page: 1 });
          }}
          className="btn btn-outline"
        >
          Clear
        </button>
      </form>

      {message && (
        <p role="status" className="mt-5 text-success">
          {message}
        </p>
      )}

      {loading ? (
        <p role="status" className="py-12">
          Loading users...
        </p>
      ) : error ? (
        <div role="alert" className="alert alert-error mt-6">
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <p className="mt-6 text-base-content/70">
            {result.total} users found
          </p>

          {result.data.length === 0 ? (
            <p className="py-10">No users match this search.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-base-300">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {result.data.map((user) => (
                    <UserRow
                      key={`${user.id}-${user.role}`}
                      user={user}
                      currentUserId={result.currentUserId}
                      onUpdated={handleUpdated}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.totalPages > 1 && (
            <nav
              aria-label="User pagination"
              className="mt-6 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={query.page <= 1}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>

              <span>
                Page {query.page} of {result.totalPages}
              </span>

              <button
                type="button"
                disabled={query.page >= result.totalPages}
                onClick={() =>
                  setQuery((current) => ({
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
    </section>
  );
}