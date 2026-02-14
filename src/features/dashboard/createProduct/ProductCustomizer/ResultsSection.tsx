import ErrorDisplay from "@/features/dashboard/createProduct/components/ErrorDisplay";
import ResultHeader from "@/features/dashboard/createProduct/components/ResultHeader";
import GeneratedImageDisplay from "@/features/dashboard/createProduct/components/GeneratedImageDisplay";

interface IGeneratedImageResult {
  imageUrl: string;
  enhancedPrompt: string;
  originalPrompt: string;
}

interface IResultsSectionProps {
  generatedResult: IGeneratedImageResult | null;
  error: string | undefined;
  ref?: React.Ref<HTMLElement>;
  onUseImage?: () => void;
}

const ResultsSection = ({
  generatedResult,
  error,
  ref,
  onUseImage,
}: IResultsSectionProps) => {
  const hasError = !!error;
  const hasResult = !!generatedResult;

  if (hasError) return <ErrorDisplay error={error} />;

  return (
    <>
      {hasResult && (
        <section
          ref={ref}
          className="space-y-8 animate-[slideInUp_1s_ease-out] transform transition-all duration-1000"
          aria-label="Generated image result"
        >
          <ResultHeader />
          <GeneratedImageDisplay
            imageUrl={generatedResult.imageUrl}
            onUseImage={onUseImage}
          />
        </section>
      )}
    </>
  );
};

export default ResultsSection;
