"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />

      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-xs font-medium tracking-wide text-ink-soft uppercase">E-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-leaf"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-xs font-medium tracking-wide text-ink-soft uppercase">Senha</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-leaf"
        />
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-leaf-deep py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
