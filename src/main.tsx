import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import { App } from "./App";
import { SetupRoute } from "./routes/Setup";
import { PracticeRoute } from "./routes/Practice";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/setup" replace /> },
      { path: "/setup", element: <SetupRoute /> },
      { path: "/practice/:sessionId", element: <PracticeRoute /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
