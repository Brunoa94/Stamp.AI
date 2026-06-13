"use client";

import { memo } from "react";
import { GenerationLoader } from "../components/GenerationLoader";

export const GenerationSection = memo(function GenerationSection() {
  return (
    <section
      id="step-3"
      className="stamp-section p-12 lg:p-24 items-center text-center"
    >
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div
          className="gradient-layer"
          style={{ animationDuration: "8s" }}
        ></div>
        <div className="blob w-[30vw] h-[30vw] bg-brandOrange/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <GenerationLoader />
    </section>
  );
});
