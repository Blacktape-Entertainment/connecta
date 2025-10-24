import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import logo from "../assets/logo.png";
import FormField from "./FormField";
import SelectField from "./SelectField";

export default function FormSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthDate: "",
    educationDegree: "",
    areaOfInterest: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for GSAP animations
  const sectionRef = useRef(null);
  const gradientLeftRef = useRef(null);
  const gradientRightRef = useRef(null);
  const containerRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gradient animations - floating effect
      gsap.to(gradientLeftRef.current, {
        x: 30,
        y: -30,
        scale: 1.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(gradientRightRef.current, {
        x: -30,
        y: 30,
        scale: 1.1,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Container animation - entrance effect
      gsap.from(containerRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
      });

      // Continuous subtle floating animation for the container
      gsap.to(containerRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName": {
        if (!value.trim())
          return `${name === "firstName" ? "First" : "Last"} name is required`;
        if (value.trim().length < 2) return "Must be at least 2 characters";
        if (!/^[a-zA-Z\s-']+$/.test(value))
          return "Only letters, spaces, hyphens and apostrophes allowed";
        return "";
      }

      case "phoneNumber": {
        if (!value.trim()) return "Phone number is required";

        // Egyptian phone numbers: +20 / 0020 / 0 followed by 10,11,12,15 then 8 digits
        const egyptianPhoneRegex = /^(?:\+20|0020|0)?1[0,1,2,5][0-9]{8}$/;

        if (!egyptianPhoneRegex.test(value.replace(/\s|-/g, "")))
          return "Please enter a valid Egyptian phone number";

        return "";
      }

      case "birthDate": {
        if (!value) return "Birth date is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16 || age > 100) return "Age must be between 16 and 100";
        return "";
      }

      case "educationDegree":
        if (!value) return "Please select your education degree";
        return "";

      case "areaOfInterest":
        if (!value) return "Please select your area of interest";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field on change if already touched
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Replace with your API endpoint
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      const data = await response.json();
      console.log("Form submitted successfully:", data);

      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        birthDate: "",
        educationDegree: "",
        areaOfInterest: "",
      });
      setTouched({});
      setErrors({});

      // Show success message (you can replace with a toast or modal)
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a0a14] via-[#0f0515] to-[#150a1f] overflow-hidden px-4 py-8 lg:py-12"
    >
      {/* Animated Gradient Overlays */}
      <div
        ref={gradientLeftRef}
        className="absolute -top-1/4 -left-20 w-96 h-96 md:w-lg md:h-128 rounded-full opacity-60 blur-3xl pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, #791752 0%, #370862 50%, transparent 70%)",
        }}
      />
      <div
        ref={gradientRightRef}
        className="absolute -bottom-1/4 -right-20 w-96 h-96 md:w-lg md:h-128 rounded-full opacity-60 blur-3xl pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, #370862 0%, #791752 50%, transparent 70%)",
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-gradient1 rounded-full animate-pulse opacity-70" />
      <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-gradient3 rounded-full animate-pulse delay-75 opacity-70" />
      <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-gradient1 rounded-full animate-pulse delay-150 opacity-70" />

      {/* Form Container with Improved Layout */}
      <div ref={containerRef} className="relative z-10 w-full max-w-4xl">
        <div className="bg-linear-to-br from-dark/60 via-[#1a0a14]/70 to-dark/60 backdrop-blur-lg rounded-3xl p-8 md:p-12 lg:p-16 border border-gradient1/40 shadow-2xl shadow-gradient1/10">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient1 blur-2xl opacity-40 rounded-full" />
              <img
                src={logo}
                alt="Logo"
                className="relative w-28 md:w-32 h-auto mx-auto drop-shadow-2xl"
              />
            </div>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold bg-linear-to-br from-gradient1 via-gradient3 to-gradient1 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-lg">
              Join Us
            </h2>
            <p className="text-light text-lg md:text-xl font-body max-w-md mx-auto">
              Fill in your details to get started on your journey
            </p>
            <div className="h-1 w-20 bg-linear-to-r from-gradient1 to-gradient3 mx-auto mt-6 rounded-full shadow-lg shadow-gradient1/50" />
          </header>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8"
            noValidate
          >
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && errors.firstName}
                placeholder="Enter your first name"
              />
              <FormField
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && errors.lastName}
                placeholder="Enter your last name"
              />
            </div>

            {/* Phone & Birth Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phoneNumber && errors.phoneNumber}
                placeholder="+20 10 1234 5678"
              />
              <FormField
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.birthDate && errors.birthDate}
              />
            </div>

            {/* Education & Area of Interest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Education Degree"
                name="educationDegree"
                value={formData.educationDegree}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.educationDegree && errors.educationDegree}
                options={[
                  { value: "", label: "Select your degree" },
                  { value: "high-school", label: "High School" },
                  { value: "associate", label: "Associate Degree" },
                  { value: "bachelor", label: "Bachelor's Degree" },
                  { value: "master", label: "Master's Degree" },
                  { value: "phd", label: "Ph.D." },
                  { value: "other", label: "Other" },
                ]}
              />
              <SelectField
                label="Area of Interest"
                name="areaOfInterest"
                value={formData.areaOfInterest}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.areaOfInterest && errors.areaOfInterest}
                options={[
                  { value: "", label: "Select your interest" },
                  { value: "technology", label: "Technology" },
                  { value: "design", label: "Design" },
                  { value: "business", label: "Business" },
                  { value: "marketing", label: "Marketing" },
                  { value: "education", label: "Education" },
                  { value: "healthcare", label: "Healthcare" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 px-8 py-5 bg-linear-to-br from-gradient1 to-gradient3 text-light font-heading text-lg font-semibold tracking-widest rounded-xl cursor-pointer transition-all duration-300 shadow-lg uppercase hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-light/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
