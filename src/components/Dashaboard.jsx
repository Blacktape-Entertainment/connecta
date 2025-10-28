import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Orb from "./Orb";
import logo from "../assets/logo.png";
import Login from "./Login";

const Dashboard = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const logoRef = useRef(null);

  // Animate logo & container
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

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-8"
    >
      {/* Orb */}
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
            forceHoverState={false}
          />
        </div>
      </div>

      {/* Logo */}
      <div
        ref={logoRef}
        className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 flex justify-center items-center"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-20 h-auto md:w-25 lg:w-30 drop-shadow-2xl"
        />
      </div>

      {/* Login container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-md mt-18 md:mt-20 px-2 md:px-0"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/50">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-6">
            Admin Login
          </h2>
          <Login />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
