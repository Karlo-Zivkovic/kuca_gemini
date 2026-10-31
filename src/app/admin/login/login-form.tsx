"use client";

import { useActionState } from "react";
import { LoaderCircle, Lock } from "lucide-react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">
        Lozinka
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 text-lg outline-none focus:border-sea focus:ring-2 focus:ring-sea/20"
        />
      </label>
      {state.error && <p className="text-sm font-medium text-terracotta-dark">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-sea px-6 py-3.5 text-lg font-semibold text-white disabled:opacity-70"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" /> : <Lock className="size-5" />}
        Prijava
      </button>
    </form>
  );
}
