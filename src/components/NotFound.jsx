import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Orb from "./Orb";
import logo from "../assets/logo.png";

export default function NotFound() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const logoRef = useRef(null);

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

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-dark via-gradient2 to-dark">
      {/* Background Orb */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Orb hoverIntensity={0.5} rotateOnHover={false} isHovered={false} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div ref={logoRef} className="flex justify-center mb-8">
          <img src={logo} alt="Connecta Logo" className="h-16 md:h-20" />
        </div>

        {/* 404 Content */}
        <div
          ref={containerRef}
          className="bg-dark/40 backdrop-blur-xl border border-gradient1/20 rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center"
        >
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="font-heading text-8xl md:text-9xl font-bold bg-linear-to-r from-gradient1 via-gradient3 to-gradient1 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Message */}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-light mb-4">
            Page Not Found
          </h2>
          <p className="text-light/70 text-base md:text-lg mb-3 leading-relaxed">
            Oops! The page you're looking for doesn't exist. 
          </p>
          <p className="text-light/70 text-base md:text-lg mb-8 leading-relaxed">
            It also might have been moved or deleted.
          </p>  

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-linear-to-r from-gradient1 to-gradient3 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-gradient1/30 transition-all duration-300"
            >
              Go to Homepage
            </button>
          </div>
          {/*TODO: Change this */}
          {/* Additional Links */}
          {/* <div className="mt-8 pt-6 border-t border-light/10">
            <p className="text-light/50 text-sm mb-3">Quick Links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <button
                onClick={() => navigate("/games")}
                className="text-gradient1 hover:underline"
              >
                Tournament Registration
              </button>
              <span className="text-light/30">•</span>
              
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
