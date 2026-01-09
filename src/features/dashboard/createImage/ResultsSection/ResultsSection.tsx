import ErrorDisplay from "@/features/dashboard/createImage/components/ErrorDisplay";
import ResultHeader from "@/features/dashboard/createImage/components/ResultHeader";
import GeneratedImageDisplay from "@/features/dashboard/createImage/components/GeneratedImageDisplay";

interface IGeneratedImageResult {
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

interface IResultsSectionProps {
  generatedResult: IGeneratedImageResult | null;
  error: string | undefined;
  ref?: React.Ref<HTMLElement>;
}

const ResultsSection = ({ generatedResult, error, ref }: IResultsSectionProps) => {
  const hasError = !!error;
  const hasResult = !!generatedResult;

  return (
    <>
      {hasError && <ErrorDisplay error={error} />}

      {hasResult && (
        <section
          ref={ref}
          className="space-y-8 animate-[slideInUp_1s_ease-out] transform transition-all duration-1000"
          aria-label="Generated image result"
        >
          <ResultHeader />
          <GeneratedImageDisplay imageUrl={generatedResult.imageUrl} />
        </section>
      )}
    </>
  );
};

export default ResultsSection;