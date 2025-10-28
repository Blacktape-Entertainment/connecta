import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import pb from "../lib/pocketbase";
import logo from "../assets/logo.png";
import FormField from "./FormField";
import SelectField from "./SelectField";
import MultiSelectField from "./MultiSelectField";
import AutocompleteField from "./AutocompleteField";
import Orb from "./Orb";
import { SuccessModal } from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import { validatePhoneNumber } from "../lib/phone-validator";

export default function TournamentFormSection() {
  /* =========================
   * 🎯 STATE MANAGEMENT
   * ========================= */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthDate: "",
    educationDegree: "",
    areaOfInterest: "gaming", // Fixed to gaming
    favoriteGame: [], // Changed to array for multiple games
    schoolName: "", // New field for school/university name
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [orbHoverState, setOrbHoverState] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [existingUser, setExistingUser] = useState(null);
  const [tournamentsToRegister, setTournamentsToRegister] = useState([]);
  const [isReturningUser, setIsReturningUser] = useState(null); // null = not selected, true = returning, false = new

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
        return value ? "" : "Please select your education degree";

      case "favoriteGame":
        // For tournament registration, require at least one game
        return Array.isArray(value) && value.length > 0
          ? ""
          : "Please select at least one favorite game";

      case "schoolName":
        // Required only if conditions are met
        if (shouldShowSchoolField()) {
          if (formData.educationDegree === "high-school") {
            return text ? "" : "School name is required";
          }
          return text ? "" : "University name is required";
        }
        return "";

      default:
        return "";
    }
  };

  /* =========================
   * 🧮 HELPER FUNCTIONS
   * ========================= */
  // Sanitize phone number - remove all non-digit characters
  const sanitizePhoneNumber = (phoneNumber) => {
    return phoneNumber.replace(/\D/g, ""); // Remove +, spaces, dashes, etc.
  };

  // Check phone number for existing user
  const checkPhoneNumber = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    
    const sanitized = sanitizePhoneNumber(phoneNumber);
    
    try {
      console.log("Checking phone number:", sanitized);
      const records = await pb.collection("users").getFullList({
        filter: `phoneNumber = "${sanitized}"`,
      });
      console.log("Phone check records:", records);
      
      if (records && records.length > 0) {
        // User exists - set existingUser to trigger tournament selection view
        setExistingUser(records[0]);
        // No need to change step - we're already at step 1, 
        // and the useMemo will recalculate steps to show tournament selection
      } else {
        // User not found
        setExistingUser(null);
        if (isReturningUser) {
          setErrorModal({
            isOpen: true,
            message: "No account found with this phone number. Please register as a new user.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to check phone number:", error);
      setExistingUser(null);
    }
  };

  // Calculate user age from birth date
  const calculateAge = useCallback(() => {
    if (!formData.birthDate) return null;
    const birth = new Date(formData.birthDate);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [formData.birthDate]);

  // Check if school field should be displayed
  const shouldShowSchoolField = useCallback(() => {
    const age = calculateAge();
    const isEligibleEducation =
      formData.educationDegree === "high-school" ||
      formData.educationDegree === "bachelor";
    return isEligibleEducation && age !== null && age < 27;
  }, [formData.educationDegree, calculateAge]);

  /* =========================
   * 🪄 STEPS CONFIGURATION
   * ========================= */
  const steps = useMemo(
    () => {
      // Step 0: Always ask if returning user
      if (isReturningUser === null) {
        return [
          {
            title: "Have you registered with us before?",
            fields: [], // No fields, just a choice
          },
        ];
      }

      // If returning user, show phone number then tournament selection
      if (isReturningUser) {
        return [
          { title: "Have you registered with us before?", fields: [] },
          {
            title: existingUser ? `Welcome back, ${existingUser.name}!` : "Enter your phone number",
            fields: ["phoneNumber"],
          },
          {
            title: "Select Tournaments",
            fields: ["favoriteGame"],
          },
        ];
      }
      
      // New user - show full form
      const showSchool = shouldShowSchoolField();
      const baseFields = ["educationDegree"];
      
      if (showSchool) {
        baseFields.push("schoolName");
      }
      
      baseFields.push("favoriteGame");

      return [
        { title: "Have you registered with us before?", fields: [] },
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
          fields: baseFields,
        },
      ];
    },
    [existingUser, isReturningUser, shouldShowSchoolField]
  );

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canGoNext = () =>
    currentStepData.fields.every(
      (f) => {
        const fieldValue = formData[f];
        // Special handling for favoriteGame array
        if (f === "favoriteGame") {
          return Array.isArray(fieldValue) && fieldValue.length > 0;
        }
        // Special handling for schoolName - only required if should be shown
        if (f === "schoolName") {
          return shouldShowSchoolField() ? fieldValue : true;
        }
        return fieldValue && !validateField(f, fieldValue);
      }
    );

  /* =========================
   * 📋 HANDLERS
   * ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      // If changing favoriteGame, update tournamentsToRegister
      if (name === "favoriteGame") {
        setTournamentsToRegister(value); // value is already an array from MultiSelectField
      }
      
      // Reset schoolName if conditions no longer met
      if (name === "educationDegree" || name === "birthDate") {
        const age = name === "birthDate" ? (() => {
          if (!value) return null;
          const birth = new Date(value);
          if (isNaN(birth.getTime())) return null;
          const today = new Date();
          let calculatedAge = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            calculatedAge--;
          }
          return calculatedAge;
        })() : calculateAge();
        
        const education = name === "educationDegree" ? value : prev.educationDegree;
        const isEligible = (education === "high-school" || education === "bachelor") && 
                          age !== null && age < 27;
        
        if (!isEligible) {
          next.schoolName = "";
        }
      }
      
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
    
    // Check if user exists when phone number is entered
    if (name === "phoneNumber" && value && !errors.phoneNumber) {
      checkPhoneNumber(value);
    }
  };

  const handleNext = async () => {
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

    // For returning users at step 1 (phone entry), check phone before advancing
    if (isReturningUser && currentStep === 1 && !existingUser) {
      const sanitized = sanitizePhoneNumber(formData.phoneNumber);
      
      try {
        const records = await pb.collection("users").getFullList({
          filter: `phoneNumber = "${sanitized}"`,
        });
        
        if (records && records.length > 0) {
          // User exists - set existingUser and advance to tournament selection
          setExistingUser(records[0]);
          gsap.fromTo(
            containerRef.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
          );
          setCurrentStep((p) => Math.min(p + 1, totalSteps - 1));
        } else {
          // User not found - show error
          setErrorModal({
            isOpen: true,
            message: "No account found with this phone number. Please register as a new user.",
          });
        }
      } catch (error) {
        console.error("Failed to check phone number:", error);
        setErrorModal({
          isOpen: true,
          message: "Failed to verify phone number. Please try again.",
        });
      }
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
    
    // Reset isReturningUser when going back to step 0
    if (currentStep === 1) {
      setIsReturningUser(null);
      setExistingUser(null);
    }
    
    // Reset existingUser when going back from tournament selection to phone entry
    if (isReturningUser && currentStep === 2) {
      setExistingUser(null);
    }
    
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
      let result;
      
      // If existing user, only update tournaments_interested_in
      if (existingUser) {
        const submissionData = {
          tourments_interested_in: tournamentsToRegister, // Keep as array
        };
        result = await pb.collection("users").update(existingUser.id, submissionData);
        
        if (!result) throw new Error("Failed to update tournament registration");
      } else {
        // New user - send full data with sanitized phone number
        const sanitizedPhone = sanitizePhoneNumber(formData.phoneNumber);
        const submissionData = {
          name: `${formData.firstName} ${formData.lastName}`,
          phoneNumber: sanitizedPhone, // Save sanitized phone number
          birthDate: formData.birthDate,
          educationDegree: formData.educationDegree,
          areaOfInterest: formData.areaOfInterest,
          favoriteGame: tournamentsToRegister, // Send as array, not string
          tourments_interested_in: tournamentsToRegister, // Same games
          schoolName: formData.schoolName || null,
          password: sanitizedPhone + "TempPassword123!",
          passwordConfirm: sanitizedPhone + "TempPassword123!",
        };
        
        result = await pb.collection("users").create(submissionData);
        if (!result) throw new Error("Submission failed");
      }

      // reset form
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        birthDate: "",
        educationDegree: "",
        areaOfInterest: "gaming",
        favoriteGame: [],
        schoolName: "",
      });
      setErrors({});
      setTouched({});
      setCurrentStep(0);
      setExistingUser(null);
      setTournamentsToRegister([]);
      setIsReturningUser(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Submission error:", err);
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
          {/* Tournament Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm font-semibold text-white">
              <span className="text-lg">🎮</span>
              Tournament Registration
            </span>
          </div>

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

          {/* Existing user indicator */}
          {existingUser && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-3 text-center mb-4">
              <p className="text-green-300 text-sm font-medium">
                ✓ Account found! Please select the tournaments you'd like to register for.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Step 0: Returning User Question */}
            {currentStep === 0 && isReturningUser === null && (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsReturningUser(true);
                    setCurrentStep(1);
                  }}
                  className="w-full px-6 py-4 bg-white/20 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/30 hover:border-white/40 transition-all text-lg"
                >
                  ✓ Yes, I have an account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReturningUser(false);
                    setCurrentStep(1);
                  }}
                  className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 hover:border-white/30 transition-all text-lg"
                >
                  ✗ No, I'm new here
                </button>
              </div>
            )}

            {/* Step 1 for Returning User: Phone Number */}
            {isReturningUser && !existingUser && currentStep === 1 && (
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
            )}

            {/* Step 1 for New User: Name fields */}
            {isReturningUser === false && currentStep === 1 && (
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

            {/* Step 2 for New User: Contact Info */}
            {isReturningUser === false && currentStep === 2 && (
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

            {/* Step 3 for New User or Step 2 for Returning User: Tournament/Education Selection */}
            {((isReturningUser === false && currentStep === 3) || (isReturningUser && existingUser && currentStep === 2)) && (
              <>
                {!existingUser && (
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
                    {shouldShowSchoolField() && (
                      <AutocompleteField
                        label={formData.educationDegree === "high-school" ? "School Name" : "University Name"}
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.schoolName && errors.schoolName}
                        placeholder="Start typing your school or university name..."
                      />
                    )}
                  </>
                )}
                <MultiSelectField
                  label={existingUser ? "Select Tournaments to Join" : "Favorite Games (Select one or more)"}
                  name="favoriteGame"
                  value={formData.favoriteGame}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.favoriteGame && errors.favoriteGame}
                  placeholder={existingUser ? "Select tournaments you want to join" : "Select your favorite games"}
                  options={[
                    { value: "", label: existingUser ? "Select tournaments" : "Select your favorite games" },
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
              </>
            )}

            {/* Navigation Buttons - Hidden on step 0 */}
            {currentStep > 0 && (
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
                    ? existingUser ? "Updating..." : "Submitting..."
                    : currentStep === totalSteps - 1
                    ? existingUser ? "Register for Tournaments" : "Submit Registration"
                    : "Continue →"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ✅ Modals */}
      {showSuccessModal && (
        <SuccessModal 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)} 
        />
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
