import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";
import Layout from "./components/Layout";

// Lazy load components for route-based code-splitting
const FormSection = lazy(() => import("./components/FormSection"));
const TournamentFormSection = lazy(() => import("./components/TournamentFormSection"));
const RegistrationForm = lazy(() => import("./components/RegistrationForm"));
const Dashboard = lazy(() => import("./components/Dashaboard"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const NotFound = lazy(() => import("./components/NotFound"));

// Loading fallback component
const LoadingFallback = () => <LoadingScreen isLoading={true} />;

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><FormSection /></Suspense> },
      { path: "games", element: <Suspense fallback={<LoadingFallback />}><TournamentFormSection /></Suspense> },
      { path: "game-developers-registration", element: <Suspense fallback={<LoadingFallback />}><RegistrationForm /></Suspense> },
      { path: "admin", element: <Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense> },
      { path: "admin/dashboard", element: <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense> },
      { path: "*", element: <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense> },
    ]
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      
    </ErrorBoundary>
  );
}

export default App;
