import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { submitApplication } from "../services/applicationService.ts";
import logo from "../assets/logo.png";
import FormField from "./FormField";
import SelectField from "./SelectField";
import Orb from "./Orb";
import { SuccessModal } from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import { validatePhoneNumber } from "../lib/phone-validator";

export default function FormSection() {
  /* =========================
   * 🎯 STATE MANAGEMENT
   * ========================= */
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  /* =========================
   * 🌀 REFS
   * ========================= */
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const interactionTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  /* =========================
   * ⚙️ CLEANUP ON UNMOUNT
   * ========================= */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearTimeout(interactionTimeoutRef.current);
    };
  }, []);

  /* =========================
   * 🪩 INTERACTION LOGIC
   * ========================= */
  const triggerOrbHover = () => {
    setOrbHoverState(true);
    clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) setOrbHoverState(false);
    }, 3500);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleInteraction = () => triggerOrbHover();

    // enable keyboard and touch interactions
    section.setAttribute("tabindex", "0");
    section.addEventListener("keydown", handleInteraction);
    section.addEventListener("touchstart", handleInteraction, {
      passive: true,
    });
    section.addEventListener("input", handleInteraction);

    return () => {
      section.removeEventListener("keydown", handleInteraction);
      section.removeEventListener("touchstart", handleInteraction);
      section.removeEventListener("input", handleInteraction);
    };
  }, []);

  /* =========================
   * ✨ GSAP ANIMATIONS
   * ========================= */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.to(logoRef.current, {
        y: -15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      gsap.from(containerRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });

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

  /* =========================
   * ✅ VALIDATION
   * ========================= */
  const validateField = (name, value) => {
    const text = value?.toString().trim();

    switch (name) {
      case "firstName":
      case "lastName":
        if (!text)
          return `${name === "firstName" ? "First" : "Last"} name is required`;
        if (text.length < 2) return "Must be at least 2 characters";
        if (!/^[a-zA-Z\s-']+$/.test(text))
          return "Only letters, spaces, hyphens, and apostrophes allowed";
        return "";

      case "phoneNumber": {
        if (!text) return "Phone number is required";
        const res = validatePhoneNumber(text);
        return res.isValid ? "" : res.reason || "Invalid phone number";
      }

      case "birthDate": {
        if (!value) return "Birth date is required";
        const birth = new Date(value);
        if (isNaN(birth.getTime())) return "Invalid date";
        const age = new Date().getFullYear() - birth.getFullYear();
        if (age < 7 || age > 80) return "Age must be between 7 and 80";
        return "";
      }

      case "educationDegree":
      case "areaOfInterest":
        return value
          ? ""
          : `Please select your ${
              name === "educationDegree"
                ? "education degree"
                : "area of interest"
            }`;

      case "favoriteGame":
        return formData.areaOfInterest === "gaming" && !value
          ? "Please select your favorite game"
          : "";

      default:
        return "";
    }
  };

  /* =========================
   * 🪄 STEPS CONFIGURATION
   * ========================= */
  const steps = useMemo(
    () => [
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
    ],
    [formData.areaOfInterest]
  );

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canGoNext = () =>
    currentStepData.fields.every(
      (f) => formData[f] && !validateField(f, formData[f])
    );

  /* =========================
   * 📋 HANDLERS
   * ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "areaOfInterest" && value !== "gaming")
        next.favoriteGame = "";
      return next;
    });

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleNext = () => {
    const stepErrors = {};
    currentStepData.fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) stepErrors[f] = err;
    });

    if (Object.keys(stepErrors).length) {
      setErrors((p) => ({ ...p, ...stepErrors }));
      setTouched((p) => ({
        ...p,
        ...Object.fromEntries(currentStepData.fields.map((f) => [f, true])),
      }));
      return;
    }

    gsap.fromTo(
      containerRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    setCurrentStep((p) => Math.min(p + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    gsap.fromTo(
      containerRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    setCurrentStep((p) => Math.max(p - 1, 0));
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" || isSubmitting) return;
    e.preventDefault();
    if (currentStep < totalSteps - 1 && canGoNext()) handleNext();
    else if (currentStep === totalSteps - 1 && canGoNext()) handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitApplication(formData);
      if (!result.success)
        throw new Error(result.error?.message || "Submission failed");

      // reset form
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        birthDate: "",
        educationDegree: "",
        areaOfInterest: "",
        favoriteGame: "",
      });
      setErrors({});
      setTouched({});
      setCurrentStep(0);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message:
          err?.message || "Failed to submit application. Please try again.",
      });
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  /* =========================
   * 🎨 RENDER
   * ========================= */
  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-8"
    >
      {/* 🌌 Orb Background */}
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full max-w-[800px] max-h-[800px]">
          <Orb
            hoverIntensity={1.1}
            rotateOnHover
            hue={259}
            forceHoverState={orbHoverState}
          />
        </div>
      </div>

      {/* 🪐 Floating Logo */}
      <div
        ref={logoRef}
        className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20"
      >
        <img src={logo} alt="Logo" className="w-20 md:w-24 drop-shadow-2xl" />
      </div>

      {/* 📄 Form Container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-2xl mt-28 md:mt-32"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-black/50">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-light/60">
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Title */}
          <h2 className="text-center text-lg md:text-2xl font-bold text-white tracking-wide mb-5">
            {currentStepData.title}
          </h2>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Step fields */}
            {currentStep === 0 && (
              <>
                <FormField
                  {...{
                    label: "First Name",
                    name: "firstName",
                    type: "text",
                    value: formData.firstName,
                    onChange: handleChange,
                    onBlur: handleBlur,
                    error: touched.firstName && errors.firstName,
                    placeholder: "Enter your first name",
                  }}
                />
                <FormField
                  {...{
                    label: "Last Name",
                    name: "lastName",
                    type: "text",
                    value: formData.lastName,
                    onChange: handleChange,
                    onBlur: handleBlur,
                    error: touched.lastName && errors.lastName,
                    placeholder: "Enter your last name",
                  }}
                />
              </>
            )}

            {currentStep === 1 && (
              <>
                <FormField
                  {...{
                    label: "Phone Number",
                    name: "phoneNumber",
                    type: "tel",
                    value: formData.phoneNumber,
                    onChange: handleChange,
                    onBlur: handleBlur,
                    error: touched.phoneNumber && errors.phoneNumber,
                    placeholder: "+20 10 1234 5678",
                  }}
                />
                <FormField
                  {...{
                    label: "Birth Date",
                    name: "birthDate",
                    type: "date",
                    value: formData.birthDate,
                    onChange: handleChange,
                    onBlur: handleBlur,
                    error: touched.birthDate && errors.birthDate,
                  }}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
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
                  ]}
                />
                {formData.areaOfInterest === "gaming" && (
                  <SelectField
                    label="Favorite Game"
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
                      { value: "clash-royale", label: "Clash Royale" },
                      { value: "retro-games", label: "Retro Games" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                )}
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  ← Previous
                </button>
              )}
              <button
                type={currentStep === totalSteps - 1 ? "submit" : "button"}
                onClick={
                  currentStep === totalSteps - 1 ? undefined : handleNext
                }
                disabled={!canGoNext() || isSubmitting}
                className="flex-1 px-5 py-3 bg-white/20 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Submitting..."
                  : currentStep === totalSteps - 1
                  ? "Submit"
                  : "Continue →"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Modals */}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {errorModal.isOpen && (
        <ErrorModal
          isOpen
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}
    </section>
  );
}
