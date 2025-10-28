import { useState, useEffect, useRef } from "react";
import pb from "../lib/pocketbase";

export default function AutocompleteField({
  label,
  name,
  value = "",
  onChange,
  onBlur,
  error,
  placeholder = "Start typing...",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allSchools, setAllSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Fetch all schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setIsLoading(true);
        // Note: Collection name is "shools" (typo in backend)
        const records = await pb.collection("shools").getFullList({
          sort: "name",
        });
        setAllSchools(records.map((r) => r.name));
      } catch (err) {
        console.error("Failed to fetch schools:", err);
        setAllSchools([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchools();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const filtered = allSchools.filter((school) =>
      school.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
  }, [value, allSchools]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    // Create synthetic event for onChange
    const syntheticEvent = {
      target: {
        name,
        value: suggestion,
      },
    };
    onChange(syntheticEvent);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-light mb-2"
      >
        {label}
      </label>
      <div ref={wrapperRef} className="relative" style={{ zIndex: showSuggestions ? 1000 : 'auto' }}>
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          onFocus={() => value && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          list={`${name}-datalist`}
          className={`w-full px-4 py-3 bg-white/10 border ${
            error ? "border-red-400" : "border-white/20"
          } rounded-lg text-white placeholder-light/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 text-white hover:bg-white/20 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-white/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* No suggestions message */}
        {showSuggestions && value.length >= 2 && suggestions.length === 0 && !isLoading && (
          <div 
            className="absolute left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl px-4 py-3 text-white/60 text-sm"
            style={{ zIndex: 9999 }}
          >
            No schools found. You can type a custom name.
          </div>
        )}

        {/* Native datalist for browser autocomplete */}
        <datalist id={`${name}-datalist`}>
          {allSchools.map((school) => (
            <option key={school} value={school} />
          ))}
        </datalist>
      </div>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
