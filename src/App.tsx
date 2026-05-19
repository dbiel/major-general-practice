import { Outlet } from "react-router-dom";
import { AuthGate } from "./components/AuthGate";

export function App() {
  return (
    <AuthGate>
      <main className="h-full">
        <Outlet />
      </main>
    </AuthGate>
  );
}
