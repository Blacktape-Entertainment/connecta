import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import FormField from "./FormField";
import SelectField from "./SelectField";
import MultiSelectField from "./MultiSelectField";
import TextAreaField from "./TextAreaField";
import { governorates } from "../data/governorates";
import { SuccessModal } from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import Orb from "./Orb";
import logo from "../assets/logo.png";
import pb from "../lib/pocketbase";

export default function RegistrationForm() {
  /* =========================
   * 🎯 STATE MANAGEMENT
   * ========================= */
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    studioName: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
    studioLocation: "",
    studioType: "",
    yearsOfOperation: "",

    // Section 2: Game Information
    gameTitle: "",
    gameGenre: [],
    gameGenreOther: "",
    targetPlatforms: [],
    targetPlatformsOther: "",
    gameDevelopmentStatus: "",
    releaseDate: "",
    gameAvailability: [],
    gameAvailabilityOther: "",

    // Section 3: Business Readiness
    registeredBusiness: "",
    monetizationModel: [],
    monetizationModelOther: "",
    totalRevenue: "",
    fundingSource: [],
    fundingSourceOther: "",
    businessPlan: "",
    seekingInvestment: "",

    // Section 4: Marketing & Press Readiness
    pressKit: "",
    marketingMaterials: [],
    websiteUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    discordUrl: "",
    otherSocialUrl: "",

    // Section 5: Exhibition Requirements & Demo Readiness
    exhibitionSetup: [],
    exhibitionSetupComments: "",
    demoBuildStatus: "",
    demoDuration: "",
    gamePlayability: "",
    playerStatistics: "",
    previousExhibition: "",

    // Section 6: Motivation & Vision
    motivationWhy: "",
    gameUniqueness: "",
    targetAudience: [],
    targetAudienceOther: "",

    // Section 7: Required Uploads
    gameTrailerUrl: "",
    gameScreenshotsUrl: "",
    pitchDeckUrl: "",

    // Section 8: Legal & Commitment
    ipConfirmation: false,
    commitmentConfirmation: false,
    hearAbout: "",
    hearAboutOther: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [orbHoverState, setOrbHoverState] = useState(false);

  /* =========================
   * 🌀 REFS
   * ========================= */
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const interactionTimeoutRef = useRef(null);

  /* =========================
   * 📋 FORM SECTIONS CONFIGURATION
   * ========================= */
  const sections = [
    { title: "Basic Information", fields: 7 },
    { title: "Game Information", fields: 8 },
    { title: "Business Readiness", fields: 6 },
    { title: "Marketing & Press", fields: 9 },
    { title: "Exhibition & Demo", fields: 6 },
    { title: "Motivation & Vision", fields: 3 },
    { title: "Required Uploads", fields: 3 },
    { title: "Legal & Commitment", fields: 3 },
  ];

  /* =========================
   * 💾 AUTO-SAVE TO LOCALSTORAGE
   * ========================= */
  const STORAGE_KEY = "connecta2025_registration_draft";
  const STORAGE_TIMESTAMP_KEY = "connecta2025_registration_timestamp";

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const timestamp = savedTimestamp ? new Date(savedTimestamp) : null;
        
        // Show notification if data is older than 7 days
        if (timestamp) {
          const daysSinceLastSave = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastSave > 7) {
            console.log(`Restored form data from ${daysSinceLastSave} days ago`);
          }
        }
        
        setFormData(parsedData);
        console.log("✅ Form data restored from previous session");
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }
  }, []);

  // Auto-save form data whenever it changes
  useEffect(() => {
    // Don't save initial empty state
    if (formData.studioName || formData.gameTitle || formData.email) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
      } catch (error) {
        console.error("Error saving form data:", error);
      }
    }
  }, [formData]);

  // Clear saved data after successful submission
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      console.log("✅ Saved form data cleared");
    } catch (error) {
      console.error("Error clearing saved data:", error);
    }
  };

  /* =========================
   * 🪩 INTERACTION LOGIC
   * ========================= */
  const triggerOrbHover = () => {
    setOrbHoverState(true);
    clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      setOrbHoverState(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(interactionTimeoutRef.current);
    };
  }, []);

  /* =========================
   * ✨ GSAP ANIMATIONS
   * ========================= */
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8, y: -30 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" }
    ).fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );
  }, []);

  /* =========================
   * 📝 FORM HANDLERS
   * ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" && !Array.isArray(prev[name]) ? checked : value,
    }));
    triggerOrbHover();
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  /* =========================
   * ✅ VALIDATION
   * ========================= */
  const validateField = (name, value) => {
    let error = "";

    // Required field validation
    const requiredFields = [
      "studioName", "contactPerson", "email", "phoneNumber", "studioLocation",
      "studioType", "yearsOfOperation", "gameTitle", "gameGenre", "targetPlatforms",
      "gameDevelopmentStatus", "registeredBusiness", "totalRevenue", "businessPlan",
      "seekingInvestment", "pressKit", "demoBuildStatus", "demoDuration",
      "gamePlayability", "previousExhibition", "motivationWhy", "gameUniqueness",
      "targetAudience", "gameTrailerUrl", "gameScreenshotsUrl", "pitchDeckUrl",
      "ipConfirmation", "commitmentConfirmation", "hearAbout"
    ];

    if (requiredFields.includes(name)) {
      if (Array.isArray(value)) {
        if (value.length === 0) error = "This field is required";
      } else if (typeof value === "boolean") {
        if (!value) error = "You must accept this confirmation";
      } else {
        if (!value || value.trim() === "") error = "This field is required";
      }
    }

    // Email validation
    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Please enter a valid email address";
      }
    }

    // URL validation
    const urlFields = ["gameTrailerUrl", "gameScreenshotsUrl", "pitchDeckUrl", 
      "websiteUrl", "facebookUrl", "instagramUrl", "twitterUrl", 
      "youtubeUrl", "tiktokUrl", "discordUrl", "otherSocialUrl"];
    if (urlFields.includes(name) && value && !value.startsWith("http")) {
      error = "Please enter a valid URL starting with http:// or https://";
    }

    // Word count validation for textareas
    if (name === "motivationWhy" && value) {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 200) {
        error = "Maximum 200 words allowed";
      }
    }
    if (name === "gameUniqueness" && value) {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 300) {
        error = "Maximum 300 words allowed";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const validateSection = (sectionIndex) => {
    const sectionFields = {
      0: ["studioName", "contactPerson", "email", "phoneNumber", "studioLocation", "studioType", "yearsOfOperation"],
      1: ["gameTitle", "gameGenre", "targetPlatforms", "gameDevelopmentStatus"],
      2: ["registeredBusiness", "totalRevenue", "businessPlan", "seekingInvestment"],
      3: ["pressKit"],
      4: ["demoBuildStatus", "demoDuration", "gamePlayability", "previousExhibition"],
      5: ["motivationWhy", "gameUniqueness", "targetAudience"],
      6: ["gameTrailerUrl", "gameScreenshotsUrl", "pitchDeckUrl"],
      7: ["ipConfirmation", "commitmentConfirmation", "hearAbout"],
    };

    const fields = sectionFields[sectionIndex] || [];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
      setTouched((prev) => ({ ...prev, [field]: true }));
    });

    return isValid;
  };

  /* =========================
   * 🚀 NAVIGATION
   * ========================= */
  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setErrorModal({
        isOpen: true,
        message: "Please fill in all required fields before proceeding.",
      });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* =========================
   * 📤 FORM SUBMISSION
   * ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSection(currentSection)) {
      setErrorModal({
        isOpen: true,
        message: "Please complete all required fields before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for PocketBase submission
      const data = {
        studioName: formData.studioName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        studioLocation: formData.studioLocation,
        studioType: formData.studioType,
        yearsOfOperation: formData.yearsOfOperation,
        gameTitle: formData.gameTitle,
        gameGenre: formData.gameGenre,
        gameGenreOther: formData.gameGenreOther,
        targetPlatforms: formData.targetPlatforms,
        targetPlatformsOther: formData.targetPlatformsOther,
        gameDevelopmentStatus: formData.gameDevelopmentStatus,
        releaseDate: formData.releaseDate,
        gameAvailability: formData.gameAvailability,
        gameAvailabilityOther: formData.gameAvailabilityOther,
        registeredBusiness: formData.registeredBusiness,
        monetizationModel: formData.monetizationModel,
        monetizationModelOther: formData.monetizationModelOther,
        totalRevenue: formData.totalRevenue,
        fundingSource: formData.fundingSource,
        fundingSourceOther: formData.fundingSourceOther,
        businessPlan: formData.businessPlan,
        seekingInvestment: formData.seekingInvestment,
        pressKit: formData.pressKit,
        marketingMaterials: formData.marketingMaterials,
        websiteUrl: formData.websiteUrl,
        facebookUrl: formData.facebookUrl,
        instagramUrl: formData.instagramUrl,
        twitterUrl: formData.twitterUrl,
        youtubeUrl: formData.youtubeUrl,
        tiktokUrl: formData.tiktokUrl,
        discordUrl: formData.discordUrl,
        otherSocialUrl: formData.otherSocialUrl,
        exhibitionSetup: formData.exhibitionSetup,
        exhibitionSetupComments: formData.exhibitionSetupComments,
        demoBuildStatus: formData.demoBuildStatus,
        demoDuration: formData.demoDuration,
        gamePlayability: formData.gamePlayability,
        playerStatistics: formData.playerStatistics,
        previousExhibition: formData.previousExhibition,
        motivationWhy: formData.motivationWhy,
        gameUniqueness: formData.gameUniqueness,
        targetAudience: formData.targetAudience,
        targetAudienceOther: formData.targetAudienceOther,
        gameTrailerUrl: formData.gameTrailerUrl,
        gameScreenshotsUrl: formData.gameScreenshotsUrl,
        pitchDeckUrl: formData.pitchDeckUrl,
        ipConfirmation: formData.ipConfirmation,
        commitmentConfirmation: formData.commitmentConfirmation,
        hearAbout: formData.hearAbout,
        hearAboutOther: formData.hearAboutOther,
      };

      // Submit to PocketBase
      const record = await pb.collection('game_developers').create(data);
      
      console.log("Form submitted successfully:", record);
      
      // Clear saved draft after successful submission
      clearSavedData();
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Submission error:", error);
      setErrorModal({
        isOpen: true,
        message: error?.message || "Failed to submit the form. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
   * 🎨 PROGRESS CALCULATION
   * ========================= */
  const calculateProgress = () => {
    return ((currentSection + 1) / sections.length) * 100;
  };

  /* =========================
   * 🎭 RENDER SECTION CONTENT
   * ========================= */
  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderGameInformation();
      case 2:
        return renderBusinessReadiness();
      case 3:
        return renderMarketingPress();
      case 4:
        return renderExhibitionDemo();
      case 5:
        return renderMotivationVision();
      case 6:
        return renderRequiredUploads();
      case 7:
        return renderLegalCommitment();
      default:
        return null;
    }
  };

  /* =========================
   * 📋 SECTION 1: BASIC INFORMATION
   * ========================= */
  const renderBasicInformation = () => (
    <div className="space-y-4">
      <FormField
        label="Studio/Developer Name *"
        name="studioName"
        type="text"
        value={formData.studioName}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.studioName && errors.studioName}
        placeholder="Enter your studio or developer name"
      />
      <FormField
        label="Contact Person *"
        name="contactPerson"
        type="text"
        value={formData.contactPerson}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.contactPerson && errors.contactPerson}
        placeholder="Full name of primary contact"
      />
      <FormField
        label="Email Address *"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
        placeholder="your.email@example.com"
      />
      <FormField
        label="Phone Number (with country code) *"
        name="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phoneNumber && errors.phoneNumber}
        placeholder="+20 123 456 7890"
      />
      <SelectField
        label="Studio Location *"
        name="studioLocation"
        value={formData.studioLocation}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.studioLocation && errors.studioLocation}
        options={governorates}
      />
      <SelectField
        label="Studio Type *"
        name="studioType"
        value={formData.studioType}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.studioType && errors.studioType}
        options={[
          { value: "", label: "Select Studio Type" },
          { value: "individual", label: "Individual Indie Developer" },
          { value: "small", label: "Small Studio (2-5 members)" },
          { value: "medium", label: "Medium Studio (6-15 members)" },
          { value: "established", label: "Established Studio (15+ members)" },
        ]}
      />
      <SelectField
        label="Years of Operation *"
        name="yearsOfOperation"
        value={formData.yearsOfOperation}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.yearsOfOperation && errors.yearsOfOperation}
        options={[
          { value: "", label: "Select Years of Operation" },
          { value: "less-1", label: "Less than 1 year" },
          { value: "1-2", label: "1-2 years" },
          { value: "3-5", label: "3-5 years" },
          { value: "5plus", label: "More than 5 years" },
        ]}
      />
    </div>
  );

  /* =========================
   * 📋 SECTION 2: GAME INFORMATION
   * ========================= */
  const renderGameInformation = () => (
    <div className="space-y-4">
      <FormField
        label="Game Title *"
        name="gameTitle"
        type="text"
        value={formData.gameTitle}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameTitle && errors.gameTitle}
        placeholder="Enter your game title"
      />
      <MultiSelectField
        label="Game Genre"
        name="gameGenre"
        value={formData.gameGenre}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameGenre && errors.gameGenre}
        required
        options={[
          { value: "action-adventure", label: "Action/Adventure" },
          { value: "rpg", label: "RPG (Role-Playing Game)" },
          { value: "strategy", label: "Strategy" },
          { value: "puzzle", label: "Puzzle" },
          { value: "platformer", label: "Platformer" },
          { value: "simulation", label: "Simulation" },
          { value: "sports", label: "Sports" },
          { value: "racing", label: "Racing" },
          { value: "fighting", label: "Fighting" },
          { value: "horror", label: "Horror" },
          { value: "educational", label: "Educational" },
          { value: "vr-ar", label: "VR/AR" },
          { value: "mobile-casual", label: "Mobile Casual" },
          { value: "card", label: "Card Games" },
          { value: "board", label: "Board Games" },
          { value: "Other", label: "Other" },
        ]}
      />
      {formData.gameGenre.includes("Other") && (
        <FormField
          label="Please specify other genre"
          name="gameGenreOther"
          value={formData.gameGenreOther}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.gameGenreOther && errors.gameGenreOther}
          placeholder="Enter other genre"
        />
      )}
      <MultiSelectField
        label="Target Platform(s)"
        name="targetPlatforms"
        value={formData.targetPlatforms}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.targetPlatforms && errors.targetPlatforms}
        required
        options={[
          { value: "pc-windows", label: "PC (Windows)" },
          { value: "pc-mac", label: "PC (Mac)" },
          { value: "pc-linux", label: "PC (Linux)" },
          { value: "playstation", label: "PlayStation" },
          { value: "xbox", label: "Xbox" },
          { value: "mobile-ios", label: "Mobile (iOS)" },
          { value: "mobile-android", label: "Mobile (Android)" },
          { value: "vr-headsets", label: "VR Headsets" },
          { value: "web-browser", label: "Web Browser" },
          { value: "Other", label: "Other" },
        ]}
      />
      {formData.targetPlatforms.includes("Other") && (
        <FormField
          label="Please specify other platform"
          name="targetPlatformsOther"
          value={formData.targetPlatformsOther}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.targetPlatformsOther && errors.targetPlatformsOther}
          placeholder="Enter other platform"
        />
      )}
      <SelectField
        label="Game Development Status"
        name="gameDevelopmentStatus"
        value={formData.gameDevelopmentStatus}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameDevelopmentStatus && errors.gameDevelopmentStatus}
        required
        placeholder="Select Development Status"
        options={[
          { value: "fully-released", label: "Fully Released (commercially available)" },
          { value: "soft-launch", label: "Soft Launch (limited release)" },
          { value: "release-candidate", label: "Release Candidate (completed, pending launch)" },
          { value: "not-applicable", label: "Not applicable" },
        ]}
      />
      <FormField
        label="Release Date (if already released)"
        name="releaseDate"
        type="date"
        value={formData.releaseDate}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.releaseDate && errors.releaseDate}
      />
      <MultiSelectField
        label="Where is your game currently available?"
        name="gameAvailability"
        value={formData.gameAvailability}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameAvailability && errors.gameAvailability}
        options={[
          { value: "steam", label: "Steam" },
          { value: "epic", label: "Epic Games Store" },
          { value: "playstation-store", label: "PlayStation Store" },
          { value: "xbox-store", label: "Xbox Store" },
          { value: "google-play", label: "Google Play Store" },
          { value: "app-store", label: "Apple App Store" },
          { value: "own-website", label: "Own Website" },
          { value: "not-released", label: "Not yet released" },
          { value: "Other", label: "Other" },
        ]}
      />
      {formData.gameAvailability.includes("Other") && (
        <FormField
          label="Please specify other availability"
          name="gameAvailabilityOther"
          value={formData.gameAvailabilityOther}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.gameAvailabilityOther && errors.gameAvailabilityOther}
          placeholder="Enter other availability"
        />
      )}
    </div>
  );

  /* =========================
   * 📋 SECTION 3: BUSINESS READINESS
   * ========================= */
  const renderBusinessReadiness = () => (
    <div className="space-y-4">
      <SelectField
        label="Do you have a registered business entity in Egypt?"
        name="registeredBusiness"
        value={formData.registeredBusiness}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.registeredBusiness && errors.registeredBusiness}
        required
        placeholder="Select Business Entity Status"
        options={[
          { value: "company", label: "Yes, registered company" },
          { value: "freelancer", label: "Yes, registered freelancer/sole proprietorship" },
          { value: "in-process", label: "No, but in process" },
          { value: "no", label: "No" },
        ]}
      />
      <MultiSelectField
        label="Monetization Model"
        name="monetizationModel"
        value={formData.monetizationModel}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.monetizationModel && errors.monetizationModel}
        options={[
          { value: "premium", label: "Premium/Paid Game" },
          { value: "f2p-iap", label: "Free-to-Play with In-App Purchases" },
          { value: "f2p-ads", label: "Free-to-Play with Ads" },
          { value: "subscription", label: "Subscription Model" },
          { value: "dlc", label: "DLC/Expansion Packs" },
          { value: "not-monetized", label: "Not yet monetized" },
          { value: "Other", label: "Other" },
        ]}
      />
      {formData.monetizationModel.includes("Other") && (
        <FormField
          label="Please specify other monetization model"
          name="monetizationModelOther"
          value={formData.monetizationModelOther}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.monetizationModelOther && errors.monetizationModelOther}
          placeholder="Enter other monetization model"
        />
      )}
      <SelectField
        label="Total Revenue Generated (if applicable)"
        name="totalRevenue"
        value={formData.totalRevenue}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.totalRevenue && errors.totalRevenue}
        required
        placeholder="Select Revenue Range"
        options={[
          { value: "no-revenue", label: "No revenue yet" },
          { value: "less-50k", label: "Less than EGP 50,000" },
          { value: "50k-200k", label: "EGP 50,000-200,000" },
          { value: "200k-500k", label: "EGP 200,000-500,000" },
          { value: "500k-1m", label: "EGP 500,000-1,000,000" },
          { value: "1m-plus", label: "More than EGP 1,000,000" },
          { value: "not-disclose", label: "Prefer not to disclose" },
        ]}
      />
      <MultiSelectField
        label="Current Development Funding Source"
        name="fundingSource"
        value={formData.fundingSource}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.fundingSource && errors.fundingSource}
        options={[
          { value: "self-funded", label: "Self-funded/Bootstrapped" },
          { value: "angel", label: "Angel Investors" },
          { value: "vc", label: "Venture Capital" },
          { value: "grant", label: "Government Grant" },
          { value: "crowdfunding", label: "Crowdfunding" },
          { value: "publisher", label: "Publisher Deal" },
          { value: "previous-games", label: "Revenue from Previous Games" },
          { value: "Other", label: "Other" },
        ]}
      />
      {formData.fundingSource.includes("Other") && (
        <FormField
          label="Please specify other funding source"
          name="fundingSourceOther"
          value={formData.fundingSourceOther}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.fundingSourceOther && errors.fundingSourceOther}
          placeholder="Enter other funding source"
        />
      )}
      <SelectField
        label="Do you have a business plan for your game/studio?"
        name="businessPlan"
        value={formData.businessPlan}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.businessPlan && errors.businessPlan}
        required
        placeholder="Select Business Plan Status"
        options={[
          { value: "comprehensive", label: "Yes, comprehensive business plan" },
          { value: "basic", label: "Yes, basic plan" },
          { value: "working", label: "Working on it" },
          { value: "no", label: "No" },
        ]}
      />
      <SelectField
        label="Are you currently seeking investment or publishing deals?"
        name="seekingInvestment"
        value={formData.seekingInvestment}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.seekingInvestment && errors.seekingInvestment}
        required
        placeholder="Select Investment Status"
        options={[
          { value: "actively", label: "Yes, actively seeking" },
          { value: "open", label: "Open to opportunities" },
          { value: "not-now", label: "Not at this time" },
          { value: "secured", label: "Already secured" },
        ]}
      />
    </div>
  );

  /* =========================
   * 📋 SECTION 4: MARKETING & PRESS READINESS
   * ========================= */
  const renderMarketingPress = () => (
    <div className="space-y-4">
      <SelectField
        label="Do you have a press kit prepared?"
        name="pressKit"
        value={formData.pressKit}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.pressKit && errors.pressKit}
        required
        placeholder="Select Press Kit Status"
        options={[
          { value: "complete", label: "Yes, complete press kit available" },
          { value: "partial", label: "Partial press kit (some materials ready)" },
          { value: "can-prepare", label: "No, but can prepare before event" },
          { value: "no", label: "No" },
        ]}
      />
      <MultiSelectField
        label="Marketing Materials Available"
        name="marketingMaterials"
        value={formData.marketingMaterials}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.marketingMaterials && errors.marketingMaterials}
        options={[
          { value: "trailer", label: "Game Trailer/Teaser Video" },
          { value: "screenshots", label: "Screenshots (high-resolution)" },
          { value: "logo", label: "Logo and Key Art" },
          { value: "fact-sheet", label: "Fact Sheet" },
          { value: "bios", label: "Developer Bios" },
          { value: "press-release", label: "Press Release" },
          { value: "social-media", label: "Social Media Presence" },
          { value: "website", label: "Website" },
          { value: "none", label: "None yet" },
        ]}
      />
      <div className="mt-6 p-4 bg-light/5 rounded-lg border border-gradient1/20">
        <h4 className="text-light font-heading text-sm font-semibold mb-3">
          Social Media Presence
        </h4>
        <div className="space-y-3">
          <FormField
            label="Website/Portfolio URL"
            name="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.websiteUrl && errors.websiteUrl}
            placeholder="https://yourwebsite.com"
          />
          <FormField
            label="Facebook Page"
            name="facebookUrl"
            type="url"
            value={formData.facebookUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.facebookUrl && errors.facebookUrl}
            placeholder="https://facebook.com/yourpage"
          />
          <FormField
            label="Instagram"
            name="instagramUrl"
            type="url"
            value={formData.instagramUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.instagramUrl && errors.instagramUrl}
            placeholder="https://instagram.com/yourprofile"
          />
          <FormField
            label="Twitter/X"
            name="twitterUrl"
            type="url"
            value={formData.twitterUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.twitterUrl && errors.twitterUrl}
            placeholder="https://twitter.com/yourhandle"
          />
          <FormField
            label="YouTube Channel"
            name="youtubeUrl"
            type="url"
            value={formData.youtubeUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.youtubeUrl && errors.youtubeUrl}
            placeholder="https://youtube.com/@yourchannel"
          />
          <FormField
            label="TikTok"
            name="tiktokUrl"
            type="url"
            value={formData.tiktokUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.tiktokUrl && errors.tiktokUrl}
            placeholder="https://tiktok.com/@yourprofile"
          />
          <FormField
            label="Discord Community"
            name="discordUrl"
            type="url"
            value={formData.discordUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.discordUrl && errors.discordUrl}
            placeholder="https://discord.gg/yourserver"
          />
          <FormField
            label="Other Social Media"
            name="otherSocialUrl"
            type="url"
            value={formData.otherSocialUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.otherSocialUrl && errors.otherSocialUrl}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );

  /* =========================
   * 📋 SECTION 5: EXHIBITION REQUIREMENTS & DEMO READINESS
   * ========================= */
  const renderExhibitionDemo = () => (
    <div className="space-y-4">
      <MultiSelectField
        label="Exhibition Setup Requirements"
        name="exhibitionSetup"
        value={formData.exhibitionSetup}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.exhibitionSetup && errors.exhibitionSetup}
        options={[
          { value: "pc-laptop", label: "PC/Laptop (we will provide our own)" },
          { value: "console", label: "Gaming Console (we will provide our own)" },
          { value: "monitor", label: "Monitor/TV Screen (specify size needed in comments)" },
          { value: "vr", label: "VR Headset (we will provide our own)" },
          { value: "internet", label: "Internet Connection (specify speed needed)" },
          { value: "sound", label: "Sound System/Headphones" },
          { value: "controllers", label: "Controllers/Gamepads" },
          { value: "special", label: "Special Hardware (please specify in comments)" },
          { value: "power", label: "Power outlets (specify number needed)" },
        ]}
      />
      <TextAreaField
        label="Exhibition Setup Comments/Specifications"
        name="exhibitionSetupComments"
        value={formData.exhibitionSetupComments}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.exhibitionSetupComments && errors.exhibitionSetupComments}
        placeholder="Please specify any additional details about your exhibition setup requirements..."
        rows={3}
      />
      <SelectField
        label="Demo Build Status"
        name="demoBuildStatus"
        value={formData.demoBuildStatus}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.demoBuildStatus && errors.demoBuildStatus}
        required
        placeholder="Select Demo Build Status"
        options={[
          { value: "ready-now", label: "Stable demo build ready now" },
          { value: "ready-mid-nov", label: "Demo build ready by mid-November" },
          { value: "1-2-weeks", label: "Need 1-2 weeks to prepare demo build" },
          { value: "not-ready", label: "Not ready" },
        ]}
      />
      <SelectField
        label="Demo Duration per Player"
        name="demoDuration"
        value={formData.demoDuration}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.demoDuration && errors.demoDuration}
        required
        placeholder="Select Demo Duration"
        options={[
          { value: "5-10", label: "5-10 minutes" },
          { value: "10-15", label: "10-15 minutes" },
          { value: "15-20", label: "15-20 minutes" },
          { value: "20-30", label: "20-30 minutes" },
          { value: "30plus", label: "30+ minutes" },
        ]}
      />
      <SelectField
        label="Is your game playable by general public without extensive tutorials?"
        name="gamePlayability"
        value={formData.gamePlayability}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gamePlayability && errors.gamePlayability}
        required
        placeholder="Select Playability Level"
        options={[
          { value: "easy", label: "Yes, easy to pick up and play" },
          { value: "brief", label: "Yes, with brief 1-2 minute explanation" },
          { value: "5-10-tutorial", label: "Requires 5-10 minute tutorial" },
          { value: "complex", label: "Complex, requires significant guidance" },
        ]}
      />
      <TextAreaField
        label="Player Statistics (if applicable)"
        name="playerStatistics"
        value={formData.playerStatistics}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.playerStatistics && errors.playerStatistics}
        placeholder="Provide any relevant metrics: downloads, active users, user ratings, reviews, community size, etc."
        rows={4}
      />
      <SelectField
        label="Previous Exhibition Experience"
        name="previousExhibition"
        value={formData.previousExhibition}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.previousExhibition && errors.previousExhibition}
        required
        placeholder="Select Exhibition Experience"
        options={[
          { value: "gaming", label: "Yes, exhibited at gaming events before" },
          { value: "tech", label: "Yes, exhibited at tech events (non-gaming)" },
          { value: "first-time", label: "First time exhibiting" },
          { value: "no", label: "No experience" },
        ]}
      />
    </div>
  );

  /* =========================
   * 📋 SECTION 6: MOTIVATION & VISION
   * ========================= */
  const renderMotivationVision = () => (
    <div className="space-y-4">
      <TextAreaField
        label="Why do you want to exhibit at Connecta? *"
        name="motivationWhy"
        value={formData.motivationWhy}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.motivationWhy && errors.motivationWhy}
        placeholder="What do you hope to achieve by participating in this event?"
        maxLength={1500}
        rows={5}
        required
      />
      <div className="text-xs text-light/50 -mt-3">
        Maximum 200 words
      </div>
      <TextAreaField
        label="What makes your game unique? *"
        name="gameUniqueness"
        value={formData.gameUniqueness}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameUniqueness && errors.gameUniqueness}
        placeholder="Describe what sets your game apart and why attendees should play it."
        maxLength={2000}
        rows={6}
        required
      />
      <div className="text-xs text-light/50 -mt-3">
        Maximum 300 words
      </div>
      <MultiSelectField
        label="Target Audience"
        name="targetAudience"
        value={formData.targetAudience}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.targetAudience && errors.targetAudience}
        required
        options={[
          { value: "children", label: "Children (under 12)" },
          { value: "teenagers", label: "Teenagers (13-17)" },
          { value: "young-adults", label: "Young Adults (18-25)" },
          { value: "adults", label: "Adults (26-40)" },
          { value: "all-ages", label: "All Ages" },
          { value: "casual", label: "Casual Gamers" },
          { value: "core", label: "Core Gamers" },
          { value: "Other", label: "Specific demographic" },
        ]}
      />
      {formData.targetAudience.includes("Other") && (
        <FormField
          label="Please specify specific demographic"
          name="targetAudienceOther"
          value={formData.targetAudienceOther}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.targetAudienceOther && errors.targetAudienceOther}
          placeholder="Enter specific demographic"
        />
      )}
    </div>
  );

  /* =========================
   * 📋 SECTION 7: REQUIRED UPLOADS
   * ========================= */
  const renderRequiredUploads = () => (
    <div className="space-y-4">
      <FormField
        label="Game Trailer/Gameplay Video URL *"
        name="gameTrailerUrl"
        type="url"
        value={formData.gameTrailerUrl}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameTrailerUrl && errors.gameTrailerUrl}
        placeholder="https://youtube.com/watch?v=..."
      />
      <div className="text-xs text-light/50 -mt-3">
        Provide a YouTube/Vimeo link to your game trailer or gameplay footage
      </div>
      <FormField
        label="Game Screenshots URL *"
        name="gameScreenshotsUrl"
        type="url"
        value={formData.gameScreenshotsUrl}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.gameScreenshotsUrl && errors.gameScreenshotsUrl}
        placeholder="https://drive.google.com/... or https://dropbox.com/..."
      />
      <div className="text-xs text-light/50 -mt-3">
        Upload at least 3-5 high-quality screenshots (Google Drive/Dropbox link)
      </div>
      <FormField
        label="Pitch Deck/Presentation URL *"
        name="pitchDeckUrl"
        type="url"
        value={formData.pitchDeckUrl}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.pitchDeckUrl && errors.pitchDeckUrl}
        placeholder="https://drive.google.com/... or https://dropbox.com/..."
      />
      <div className="text-xs text-light/50 -mt-3">
        Business/game pitch deck or one-pager summarizing your game and studio (PDF preferred)
      </div>
    </div>
  );

  /* =========================
   * 📋 SECTION 8: LEGAL & COMMITMENT
   * ========================= */
  const renderLegalCommitment = () => (
    <div className="space-y-4">
      <div className="p-4 bg-light/5 rounded-lg border border-gradient1/20">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="ipConfirmation"
            checked={formData.ipConfirmation}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-5 h-5 mt-0.5 rounded border-gradient1/40 bg-light/10 checked:bg-gradient1 checked:border-gradient1 focus:ring-2 focus:ring-gradient1/30 cursor-pointer shrink-0"
          />
          <span className="text-sm text-light leading-relaxed">
            I confirm that all content in the submitted game is original or properly licensed, 
            and I have the legal right to exhibit this game publicly. *
          </span>
        </label>
        {touched.ipConfirmation && errors.ipConfirmation && (
          <span className="text-red-400 text-xs font-body flex items-center gap-1.5 mt-2 ml-8">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.ipConfirmation}
          </span>
        )}
      </div>

      <div className="p-4 bg-light/5 rounded-lg border border-gradient1/20">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="commitmentConfirmation"
            checked={formData.commitmentConfirmation}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-5 h-5 mt-0.5 rounded border-gradient1/40 bg-light/10 checked:bg-gradient1 checked:border-gradient1 focus:ring-2 focus:ring-gradient1/30 cursor-pointer shrink-0"
          />
          <span className="text-sm text-light leading-relaxed">
            I confirm that if selected, my team will be present for all 3 days of Connecta 
            (November 17-19, 2025) with a stable demo build and professional booth presence. *
          </span>
        </label>
        {touched.commitmentConfirmation && errors.commitmentConfirmation && (
          <span className="text-red-400 text-xs font-body flex items-center gap-1.5 mt-2 ml-8">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.commitmentConfirmation}
          </span>
        )}
      </div>

      <SelectField
        label="How did you hear about this opportunity?"
        name="hearAbout"
        value={formData.hearAbout}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.hearAbout && errors.hearAbout}
        required
        placeholder="Select Source"
        options={[
          { value: "social-media", label: "Cairo ICT/Connecta social media" },
          { value: "gaming-community", label: "Gaming community/forum" },
          { value: "university", label: "University/academic institution" },
          { value: "referral", label: "Friend/colleague referral" },
          { value: "gaming-media", label: "Gaming media/press" },
          { value: "email", label: "Email announcement" },
          { value: "Other", label: "Other" },
        ]}
      />
      {formData.hearAbout === "Other" && (
        <FormField
          label="Please specify"
          name="hearAboutOther"
          type="text"
          value={formData.hearAboutOther}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="How did you hear about this opportunity?"
        />
      )}
    </div>
  );

  /* =========================
   * 🎨 RENDER
   * ========================= */
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-dark via-gradient2 to-dark">
      {/* Background Orb */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Orb
          hoverIntensity={0.7}
          rotateOnHover={true}
         isHovered={orbHoverState} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Logo */}
        <div ref={logoRef} className="flex justify-center mb-8">
          <img src={logo} alt="Connecta Logo" className="h-16 md:h-20" />
        </div>

        {/* Form Container */}
        <div
          ref={containerRef}
          className="bg-dark/40 backdrop-blur-xl border border-gradient1/20 rounded-3xl shadow-2xl p-6 md:p-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-light mb-3">
              Connecta 2025
            </h1>
            <h2 className="font-heading text-xl md:text-2xl text-gradient1 mb-2">
              Game Developer Exhibition
            </h2>
            <p className="text-light/70 text-sm mb-2">
              November 17-19, 2025 • El Manara Hall 4
            </p>
            <p className="text-light/50 text-xs">
              💾 Your progress is automatically saved - feel free to leave and come back anytime
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-light/70 font-medium">
                Section {currentSection + 1} of {sections.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-light/70 font-medium">
                  {Math.round(calculateProgress())}% Complete
                </span>
                <div className="flex items-center gap-1.5 text-xs text-light/50">
                  <svg className="w-3.5 h-3.5 text-gradient1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  <span>Auto-saved</span>
                </div>
              </div>
            </div>
            <div className="w-full h-2 bg-light/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-gradient1 to-gradient3 transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>

            {/* Section Navigation - Horizontal Step Bar */}
            <div className="mt-4">
              <div className="flex items-start justify-between gap-1">
                {sections.map((section, index) => {
                  const isCompleted = index < currentSection;
                  const isCurrent = index === currentSection;
                  const isNext = index === currentSection + 1;
                  const isPrevious = index === currentSection - 1;
                  const isLast = currentSection === sections.length - 1;
                  
                  // Show name for current and next, or current and previous if on last section
                  const showName = isCurrent || isNext || (isLast && isPrevious);
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      {/* Circle with Number */}
                      <div className="relative flex items-center w-full">
                        {/* Connecting Line (Before) */}
                        {index > 0 && (
                          <div
                            className={`absolute right-1/2 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-300 ${
                              isCompleted
                                ? "bg-gradient1/60 w-full"
                                : "bg-light/20 w-full"
                            }`}
                          />
                        )}
                        
                        {/* Circle */}
                        <div
                          className={`relative z-10 mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCurrent
                              ? "bg-linear-to-br from-gradient1 to-gradient3 text-white shadow-lg shadow-gradient1/30 scale-110"
                              : isCompleted
                              ? "bg-gradient1/30 text-gradient1 border-2 border-gradient1/60"
                              : "bg-light/10 text-light/40 border border-light/20"
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        {/* Connecting Line (After) */}
                        {index < sections.length - 1 && (
                          <div
                            className={`absolute left-1/2 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-300 ${
                              isCompleted
                                ? "bg-gradient1/60 w-full"
                                : "bg-light/20 w-full"
                            }`}
                          />
                        )}
                      </div>
                      
                      {/* Section Name (Only for current and next/previous) */}
                      {showName && (
                        <div className="mt-2 text-center px-1">
                          <div
                            className={`text-xs font-medium transition-all duration-300 ${
                              isCurrent
                                ? "text-light font-semibold"
                                : "text-light/60"
                            }`}
                          >
                            {section.title}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Section Title */}
            <h3 className="font-heading text-2xl font-bold text-light mb-6 pb-3 border-b border-gradient1/20">
              {sections[currentSection].title}
            </h3>

            {/* Section Content */}
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gradient1/20">
              {currentSection > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 bg-light/10 border border-gradient1/40 rounded-lg text-light font-medium hover:bg-light/15 hover:border-gradient1/60 transition-all duration-300"
                >
                  Previous
                </button>
              )}
              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-gradient1 to-gradient3 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-gradient1/30 transition-all duration-300"
                >
                  Next Section
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-gradient1 to-gradient3 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-gradient1/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
        {/* TODO: Change this email */}
        {/* Footer */}
        <div className="text-center mt-8 text-light/50 text-sm space-y-2">
          <p>
            Questions? Contact us at{" "}
            <a
              href="mailto:info@worldofconnecta.com"
              className="text-gradient1 hover:underline"
            >
              info@worldofconnecta.com
            </a>
          </p>
          {(formData.studioName || formData.gameTitle || formData.email) && (
            <p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all saved progress and start over? This action cannot be undone.")) {
                    clearSavedData();
                    window.location.reload();
                  }
                }}
                className="text-light/40 hover:text-gradient1 underline text-xs transition-colors duration-200"
              >
                Clear saved draft & start over
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        shareTitle="I registered for Connecta 2025!"
        shareUrl="https://worldofconnecta.com"
        shareText="I just registered for Connecta 2025 Indie Game Developer Exhibition! Join me at El Manara Hall 4, Nov 17-19, 2025!"
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        message={errorModal.message}
      />
    </section>
  );
}
