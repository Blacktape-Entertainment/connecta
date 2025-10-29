import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load components for route-based code-splitting
const FormSection = lazy(() => import("./components/FormSection"));
const TournamentFormSection = lazy(() => import("./components/TournamentFormSection"));
const RegistrationForm = lazy(() => import("./components/RegistrationForm"));
const Dashboard = lazy(() => import("./components/Dashaboard"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/60">Loading...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <Suspense fallback={<LoadingFallback />}><FormSection /></Suspense> },
  { path: "/games", element: <Suspense fallback={<LoadingFallback />}><TournamentFormSection /></Suspense> },
  { path: "/game-developers-registration", element: <Suspense fallback={<LoadingFallback />}><RegistrationForm /></Suspense> },
  { path: "/admin", element: <Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense> },
  { path: "/admin/dashboard", element: <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense> },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
