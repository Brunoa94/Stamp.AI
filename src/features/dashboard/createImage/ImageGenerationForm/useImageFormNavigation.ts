import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";

interface UseImageFormNavigationProps {
  isProcessing: boolean;
  generatedResult: any;
}

const useImageFormNavigation = ({
  isProcessing,
  generatedResult,
}: UseImageFormNavigationProps) => {
  const { smoothScrollToSection } = useScrollToSection();

  // Create refs for sections
  const processingRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  // Auto-scroll to results when generation is complete
  useEffect(() => {
    if (generatedResult) {
      // Additional scroll trigger as backup
      setTimeout(() => {
        smoothScrollToSection(resultsRef, { delay: 200, offset: -80 });
      }, 300);
    }
  }, [generatedResult, smoothScrollToSection, resultsRef]);

  // Function to handle form submission scroll
  const handleFormSubmit = () => {
    smoothScrollToSection(processingRef, { delay: 200, offset: -50 });
  };

  return {
    processingRef,
    resultsRef,
    handleFormSubmit,
  };
};

export default useImageFormNavigation;