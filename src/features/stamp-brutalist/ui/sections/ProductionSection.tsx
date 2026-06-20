"use client";

import { memo } from "react";
import { ProductionLoader } from "../components/ProductionLoader";

export const ProductionSection = memo(function ProductionSection() {
  return (
    <section
      id="step-7"
      className="stamp-section p-12 lg:p-24 items-center text-center"
    >
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div
          className="gradient-layer"
          style={{ animationDelay: "-6s" }}
        ></div>
        <div
          className="blob w-[40vw] h-[40vw] bg-brandOrange/20 bottom-0 left-0"
          style={{
            animation: "floatBlob 38s ease-in-out infinite",
            animationDelay: "-3s",
          }}
        ></div>
      </div>

      <ProductionLoader />
    </section>
  );
});
