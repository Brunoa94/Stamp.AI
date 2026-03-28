import { ProcessingOrbit } from "./ProcessingOrbit";
import { ProcessingText } from "./ProcessingText";
import { ProcessingDots } from "./ProcessingDots";

interface IProcessingSectionProps {
  sectionRef?: React.RefObject<HTMLElement | null>;
}

const ProcessingSection = ({ sectionRef }: IProcessingSectionProps) => {
  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center justify-center gap-8 py-12 animate-[fadeIn_0.6s_ease-out]"
      aria-live="polite"
      aria-label="Processing status"
    >
      <ProcessingOrbit />
      <ProcessingText />
      <ProcessingDots />
    </section>
  );
};

export default ProcessingSection;
