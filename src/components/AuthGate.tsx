import { useAuth } from "../hooks/useAuth";
import { signInWithGoogle } from "../firebase/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-lg">Loading…</div>;
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <button
          onClick={() => signInWithGoogle()}
          className="rounded-2xl bg-white px-8 py-5 text-2xl font-medium text-black"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
