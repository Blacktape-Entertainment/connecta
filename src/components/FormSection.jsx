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

  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const interactionTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (interactionTimeoutRef.current)
        clearTimeout(interactionTimeoutRef.current);
    };
  }, []);

  const handleUserInteraction = () => {
    setOrbHoverState(true);
    if (interactionTimeoutRef.current)
      clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) setOrbHoverState(false);
    }, 3500);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleKeyDown = (e) => {
      // only treat keyboard interactions (non-modifier)
      if ((e.key && e.key.length === 1) || e.key === "Enter" || e.key === " ") {
        handleUserInteraction();
      }
    };
    const handleTouchStart = () => handleUserInteraction();
    const handleInput = () => handleUserInteraction();

    // ensure section can receive keyboard events
    if (!section.hasAttribute("tabindex"))
      section.setAttribute("tabindex", "0");

    section.addEventListener("keydown", handleKeyDown);
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("input", handleInput);

    return () => {
      section.removeEventListener("keydown", handleKeyDown);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("input", handleInput);
      if (interactionTimeoutRef.current)
        clearTimeout(interactionTimeoutRef.current);
    };
  }, []);

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

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName": {
        if (!value || !value.toString().trim())
          return `${name === "firstName" ? "First" : "Last"} name is required`;
        if (value.toString().trim().length < 2)
          return "Must be at least 2 characters";
        if (!/^[a-zA-Z\s-']+$/.test(value))
          return "Only letters, spaces, hyphens and apostrophes allowed";
        return "";
      }
      case "phoneNumber": {
        if (!value || !value.toString().trim())
          return "Phone number is required";
        const validationResult = validatePhoneNumber(value);
        if (!validationResult.isValid)
          return validationResult.reason || "Invalid phone number";
        return "";
      }
      case "birthDate": {
        if (!value) return "Birth date is required";
        const birthDate = new Date(value);
        if (isNaN(birthDate.getTime())) return "Invalid date";
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
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

  const steps = useMemo(() => {
    const base = [
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
    return base;
  }, [formData.areaOfInterest]);

  const totalSteps = steps.length;
  useEffect(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(Math.max(0, totalSteps - 1));
    }
  }, [totalSteps, currentStep]);

  const currentStepData = steps[currentStep] || steps[0];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canGoNext = () =>
    currentStepData.fields.every(
      (f) => formData[f] && !validateField(f, formData[f])
    );

  // live-validate fields that are touched
  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(touched).forEach((k) => {
        if (touched[k]) {
          const err = validateField(k, formData[k]);
          if (err) next[k] = err;
          else if (k in next) delete next[k];
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, touched]);

  const handleNext = () => {
    const stepErrors = {};
    currentStepData.fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) stepErrors[f] = err;
    });

    if (Object.keys(stepErrors).length > 0) {
      setErrors((p) => ({ ...p, ...stepErrors }));
      setTouched((p) => ({
        ...p,
        ...Object.fromEntries(currentStepData.fields.map((f) => [f, true])),
      }));
      return;
    }

    if (currentStep < totalSteps - 1) {
      gsap.killTweensOf(containerRef.current);
      setCurrentStep((p) => p + 1);
      gsap.fromTo(
        containerRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      // clear touched for the step we're leaving so errors don't linger
      const leavingFields = currentStepData.fields;
      setTouched((prev) => {
        const next = { ...prev };
        leavingFields.forEach((f) => {
          if (f in next) next[f] = false;
        });
        return next;
      });

      gsap.killTweensOf(containerRef.current);
      setCurrentStep((p) => p - 1);
      gsap.fromTo(
        containerRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "areaOfInterest" && value !== "gaming") {
        next.favoriteGame = "";
      }
      return next;
    });

    if (name === "areaOfInterest" && value !== "gaming") {
      setErrors((p) => ({ ...p, favoriteGame: "" }));
      setTouched((p) => ({ ...p, favoriteGame: false }));
    }

    if (touched[name]) {
      setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isSubmitting) return;
      if (currentStep < totalSteps - 1 && canGoNext()) handleNext();
      else if (currentStep === totalSteps - 1 && canGoNext()) handleSubmit(e);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((k) => {
      const err = validateField(k, formData[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setTouched(Object.fromEntries(Object.keys(formData).map((k) => [k, true])));
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await submitApplication(formData);
      if (!result.success)
        throw new Error(result.error?.message || "Submission failed");

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
      setOrbHoverState(false);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message:
          error?.message || "Failed to submit application. Please try again.",
      });
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-8"
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <div
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "800px",
            maxHeight: "800px",
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

      <div
        ref={logoRef}
        className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 flex justify-center items-center"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-20 h-auto md:w-25 lg:w-30 drop-shadow-2xl mx-auto"
        />
      </div>

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-2xl mt-24 md:mt-32 px-2 md:px-0"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 md:p-8 border border-white/10 shadow-2xl shadow-black/50">
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

          <div className="text-center mb-5 md:mb-6">
            <h2 className="font-heading text-lg md:text-2xl lg:text-3xl font-bold text-white mb-2 tracking-wider px-2">
              {currentStepData.title}
            </h2>
            <p className="text-light/70 text-xs md:text-sm font-body">
              Press Enter to continue ↵
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:gap-5"
            noValidate
          >
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
                      {
                        value: "retro-games",
                        label: "Retro Games (Arcade Games)",
                      },
                      { value: "other", label: "Other" },
                    ]}
                  />
                )}
              </div>
            )}

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
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {errorModal.isOpen && (
        <ErrorModal
          isOpen={errorModal.isOpen}
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}
    </section>
  );
}
