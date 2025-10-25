import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import logo from "../assets/logo.png";
import FormField from "./FormField";
import SelectField from "./SelectField";
import Orb from "./Orb";

export default function FormSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthDate: "",
    educationDegree: "",
    areaOfInterest: "",
    favoriteGame: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [orbHoverState, setOrbHoverState] = useState(false);

  // Refs for GSAP animations
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const interactionTimeoutRef = useRef(null);

  // Handle user interaction for orb effect
  const handleUserInteraction = () => {
    setOrbHoverState(true);
    
    // Clear existing timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    // Reset hover state after 2 seconds of no interaction
    interactionTimeoutRef.current = setTimeout(() => {
      setOrbHoverState(false);
    }, 3500);
  };

  // Add global event listeners for mobile interactions
  useEffect(() => {
    const handleKeyDown = () => handleUserInteraction();
    const handleTouchStart = () => handleUserInteraction();
    const handleInput = () => handleUserInteraction();
    
    // Add event listeners
    globalThis.addEventListener('keydown', handleKeyDown);
    globalThis.addEventListener('touchstart', handleTouchStart);
    globalThis.addEventListener('input', handleInput);
    
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      globalThis.removeEventListener('touchstart', handleTouchStart);
      globalThis.removeEventListener('input', handleInput);
      
      // Clear timeout on unmount
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo animation - entrance effect
      gsap.from(logoRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      // Logo continuous subtle floating animation
      gsap.to(logoRef.current, {
        y: -15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      // Container animation - entrance effect
      gsap.from(containerRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });

      // Continuous subtle floating animation for the container
      gsap.to(containerRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
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
        if (age < 7 || age > 80) return "Age must be between 7 and 80";
        return "";
      }

      case "educationDegree":
        if (!value) return "Please select your education degree";
        return "";

      case "areaOfInterest":
        if (!value) return "Please select your area of interest";
        return "";

      case "favoriteGame":
        if (formData.areaOfInterest === "gaming" && !value)
          return "Please select your favorite game";
        return "";

      default:
        return "";
    }
  };

  // Define form steps
  const steps = useMemo(() => {
    const baseSteps = [
      {
        title: "Let's start with your name",
        fields: ["firstName", "lastName"],
      },
      {
        title: "Your contact information",
        fields: ["phoneNumber", "birthDate"],
      },
      {
        title: "Tell us about yourself",
        fields:
          formData.areaOfInterest === "gaming"
            ? ["educationDegree", "areaOfInterest", "favoriteGame"]
            : ["educationDegree", "areaOfInterest"],
      },
    ];

    return baseSteps;
  }, [formData.areaOfInterest]);

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canGoNext = () => {
    return currentStepData.fields.every((field) => {
      const value = formData[field];
      const error = validateField(field, value);
      return value && !error;
    });
  };

  const handleNext = () => {
    // Validate current step fields
    const stepErrors = {};
    currentStepData.fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) stepErrors[field] = error;
    });

    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      setTouched((prev) => {
        const newTouched = { ...prev };
        currentStepData.fields.forEach((field) => {
          newTouched[field] = true;
        });
        return newTouched;
      });
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      // Animate to next step
      gsap.fromTo(
        containerRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      // Animate to previous step
      gsap.fromTo(
        containerRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear favorite game if user changes away from gaming
    if (name === "areaOfInterest" && value !== "gaming") {
      setFormData((prev) => ({ ...prev, favoriteGame: "" }));
      setErrors((prev) => ({ ...prev, favoriteGame: "" }));
      setTouched((prev) => ({ ...prev, favoriteGame: false }));
    }

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentStep < totalSteps - 1 && canGoNext()) {
        handleNext();
      } else if (currentStep === totalSteps - 1 && canGoNext()) {
        handleSubmit(e);
      }
    }
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
        favoriteGame: "",
      });
      setTouched({});
      setErrors({});
      setCurrentStep(0);

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-8"
    >
      {/* Orb Background */}
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <div 
          style={{ 
            width: "100%", 
            height: "100%", 
            maxWidth: "800px", 
            maxHeight: "800px"
          }}
        >
          <Orb
            hoverIntensity={1.1}
            rotateOnHover={true}
            hue={259}
            forceHoverState={orbHoverState}
          />
        </div>
      </div>
      {/* Logo - Outside Container */}
      <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 flex justify-center items-center">
        <img
          src={logo}
          alt="Logo"
          className="w-20 h-auto md:w-25 lg:w-30 drop-shadow-2xl mx-auto"
        />
      </div>

      {/* Form Container with Glass Effect */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-2xl mt-24 md:mt-32 px-2 md:px-0"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 md:p-8 border border-white/10 shadow-2xl shadow-black/50">
          {/* Progress Bar */}
          <div className="mb-4 md:mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-light/60 text-xs font-body">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-light/60 text-xs font-body">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Title */}
          <div className="text-center mb-5 md:mb-6">
            <h2 className="font-heading text-lg md:text-2xl lg:text-3xl font-bold text-white mb-2 tracking-wider px-2">
              {currentStepData.title}
            </h2>
            <p className="text-light/70 text-xs md:text-sm font-body">
              Press Enter to continue ↵
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            onKeyPress={handleKeyPress}
            className="flex flex-col gap-4 md:gap-5"
            noValidate
          >
            {/* Step 0: First Name & Last Name */}
            {currentStep === 0 && (
              <div className="space-y-4 md:space-y-5">
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
            )}

            {/* Step 1: Phone & Birth Date */}
            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-5">
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
            )}

            {/* Step 2: Education & Area of Interest */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-5">
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
                    { value: "gaming", label: "Gaming" },
                    { value: "other", label: "Other" },
                  ]}
                />

                {/* Favorite Game - Conditionally shown when gaming is selected */}
                {formData.areaOfInterest === "gaming" && (
                  <SelectField
                    label="What's your favorite game?"
                    name="favoriteGame"
                    value={formData.favoriteGame}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.favoriteGame && errors.favoriteGame}
                    options={[
                      { value: "", label: "Select your favorite game" },
                      { value: "valorant", label: "Valorant" },
                      {
                        value: "league-of-legends",
                        label: "League of Legends",
                      },
                      { value: "fortnite", label: "Fortnite" },
                      { value: "fc26", label: "FC26" },
                      { value: "tekken8", label: "Tekken 8" },
                      { value: "pubg-mobile", label: "PUBG Mobile" },
                      { value: "mobile-legends", label: "Mobile Legends" },
                      { value: "clash-royale", label: "Clash Royale" },
                      { value: "retro-games", label: "Retro Games (Arcade Games)" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row gap-3 mt-5 md:mt-6">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 px-5 py-3 md:px-4 md:py-2.5 bg-white/10 border border-white/20 text-white font-heading text-sm font-semibold tracking-wider rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:border-white/40"
                >
                  ← Previous
                </button>
              )}

              {currentStep < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex-1 px-5 py-3 md:px-4 md:py-2.5 bg-white/20 border border-white/30 text-white font-heading text-sm font-semibold tracking-wider rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !canGoNext()}
                  className="flex-1 px-5 py-3 md:px-4 md:py-2.5 bg-white/20 border border-white/30 text-white font-heading text-sm font-semibold tracking-wider rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application ✓"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
