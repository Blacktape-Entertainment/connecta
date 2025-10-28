import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PocketBase from "pocketbase";
import FormField from "./FormField";

const pb = new PocketBase("https://api.worldofconnecta.com");
pb.authStore.loadFromCookie(localStorage.getItem("pb_auth") || "");

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (pb.authStore.isValid) navigate("/admin/dashboard");
  }, [navigate]);

  const validateField = (name, value) =>
    !value ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name])
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await pb
        .collection("admins")
        .authWithPassword(formData.email, formData.password);

      // ✅ Store session + credentials in sessionStorage
      sessionStorage.setItem("pb_auth", pb.authStore.exportToCookie());
      sessionStorage.setItem("admin_email", formData.email);
      sessionStorage.setItem("admin_password", formData.password);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMessage("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
        placeholder="Enter your email"
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && errors.password}
        placeholder="Enter your password"
      />
      {errorMessage && (
        <p className="text-red-400 text-sm text-center">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 px-5 py-3 bg-white/20 border border-white/30 text-white font-semibold rounded-lg shadow-lg hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;
