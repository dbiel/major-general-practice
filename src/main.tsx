import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import { App } from "./App";
import { SetupRoute } from "./routes/Setup";
import { PracticeRoute } from "./routes/Practice";

const ChunkMarker = lazy(() =>
  import("../tools/chunk-marker/ChunkMarker").then(m => ({ default: m.ChunkMarker }))
);
const MarkerLazy = () => (
  <Suspense fallback={<div className="p-6">Loading…</div>}>
    <ChunkMarker />
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/setup" replace /> },
      { path: "/setup", element: <SetupRoute /> },
      { path: "/practice/:sessionId", element: <PracticeRoute /> },
      ...(import.meta.env.DEV
        ? [{ path: "/marker", element: <MarkerLazy /> }]
        : []),
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
