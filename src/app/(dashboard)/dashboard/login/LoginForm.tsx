"use client";

import { useActionState } from "react";
import { Loader2, Mail, ArrowRight, ExternalLink } from "lucide-react";
import { requestLoginLink, type LoginActionState } from "./actions";

const initial: LoginActionState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(requestLoginLink, initial);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Email address
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-muted)" }}
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@fmeli.org"
            className="w-full rounded-lg border bg-white py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-2"
            style={{
              borderColor: "rgb(11 20 27 / 0.12)",
              color: "var(--color-ink)",
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--color-brand-blue-ink)",
          color: "white",
        }}
      >
        {pending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send sign-in link
            <ArrowRight size={14} />
          </>
        )}
      </button>

      {state.status === "error" && state.message && (
        <p
          className="rounded-lg border p-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--color-brand-red) 6%, white)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-red) 30%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          {state.message}
        </p>
      )}

      {state.status === "sent" && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-gold) 10%, white)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-gold) 35%, white)",
            color: "var(--color-ink)",
          }}
        >
          <p>{state.message}</p>
          {state.devLink && (
            <a
              href={state.devLink}
              className="mt-3 inline-flex items-center gap-1.5 font-semibold underline"
              style={{ color: "var(--color-brand-blue-ink)" }}
            >
              Click to sign in (dev) <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </form>
  );
}
