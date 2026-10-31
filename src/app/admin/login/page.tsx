import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper p-7 shadow-sm">
        <p className="font-serif text-3xl font-semibold">Villa Gemini</p>
        <p className="mt-1 text-muted">Kalendar i cijene</p>
        <LoginForm />
      </div>
    </main>
  );
}
