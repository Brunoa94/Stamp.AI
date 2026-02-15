import { Wand2 } from "lucide-react";
import { CreateProductSelectors } from "../context/CreateProductContextSubscriber/selectors";

interface IProcessingSectionProps {
  sectionRef?: React.RefObject<HTMLElement | null>;
}

const ProcessingSection = ({ sectionRef }: IProcessingSectionProps) => {
  const isProcessing = CreateProductSelectors.isGenerating();
  if (!isProcessing) return null;

  return (
    <section
      ref={sectionRef}
      className="text-center py-12 animate-[fadeIn_0.8s_ease-out] transition-all duration-800"
      aria-live="polite"
      aria-label="Processing status"
    >
      <div className="relative transform transition-transform duration-1000 hover:scale-105">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 animate-spin rounded-full h-24 w-24 border-4 border-transparent bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-border mx-auto"></div>
        {/* Inner spinning circle */}
        <div className="relative animate-pulse rounded-full h-24 w-24 bg-linear-to-br from-purple-100 to-pink-100 mx-auto flex items-center justify-center transition-all duration-500">
          <Wand2 className="w-8 h-8 text-purple-600 animate-[wiggle_0.8s_ease-in-out_infinite]" />
        </div>
      </div>
      <p className="mt-6 text-xl font-semibold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse transition-all duration-500">
        Creating magic... ✨
      </p>
      <div className="mt-4 flex items-center justify-center space-x-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 bg-purple-400 rounded-full animate-bounce transition-all duration-300`}
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default ProcessingSection;
