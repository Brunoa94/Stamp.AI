import { ProcessingOrbit } from "./ProcessingOrbit";
import { ProcessingDots } from "./ProcessingDots";

interface IProcessingSectionProps {
  sectionRef?: React.RefObject<HTMLElement | null>;
}

const ProcessingSection = ({ sectionRef }: IProcessingSectionProps) => {
  return (
    <section
      ref={sectionRef}
      className="flex h-full w-full flex-col justify-center animate-[fadeIn_0.6s_ease-out]"
      aria-live="polite"
      aria-label="AI synthesis in progress"
    >
      {/* Center orbital animation */}
      <div className="flex items-center justify-center">
        <ProcessingOrbit />
      </div>

      {/* Bottom status block */}
      <footer className="shrink-0 pb-12 flex flex-col gap-4 items-center">
        <div className="text-center space-y-1.5">
          <h2 className="font-sans text-xl font-bold text-violet-500 dark:text-violet-400 tracking-widest uppercase">
            Creating Your Design
          </h2>
          <p className="font-sans text-sm text-muted-foreground">
            Our AI is weaving your image into something special…
          </p>
        </div>
        <ProcessingDots />
      </footer>
    </section>
  );
};

export default ProcessingSection;
