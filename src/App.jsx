import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FormSection from "./components/FormSection";
import Dashboard from "./components/Dashaboard";
import AdminDashboard from "./components/AdminDashboard";

const router = createBrowserRouter([
  { path: "/", element: <FormSection /> },
  { path: "/admin", element: <Dashboard /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
