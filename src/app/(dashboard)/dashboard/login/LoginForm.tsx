"use client";

import { useActionState } from "react";
import { Mail, ArrowRight, ExternalLink } from "lucide-react";
import {
  FormBanner,
  SubmitButton,
  inputClass,
  labelClass,
} from "@/components/forms";
import { requestLoginLink, type LoginActionState } from "./actions";

const initial: LoginActionState = { status: "idle" };

export function LoginForm() {
  const [state, action] = useActionState(requestLoginLink, initial);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>
          Email address
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]"
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@fmeli.org"
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      <SubmitButton
        tone="secondary"
        pendingLabel="Sending…"
        className="w-full"
      >
        Send sign-in link
        <ArrowRight size={14} />
      </SubmitButton>

      {state.status === "error" && state.message && (
        <FormBanner tone="error" message={state.message} />
      )}

      {state.status === "sent" && (
        <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--color-brand-gold)_35%,white)] bg-[color:color-mix(in_srgb,var(--color-brand-gold)_10%,white)] p-4 text-sm text-[color:var(--color-ink)]">
          <p>{state.message}</p>
          {state.devLink && (
            <a
              href={state.devLink}
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[color:var(--color-brand-blue-ink)] underline"
            >
              Click to sign in (dev) <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </form>
  );
}
