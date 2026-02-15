import ErrorDisplay from "@/features/dashboard/createProduct/components/ErrorDisplay";
import ResultHeader from "@/features/dashboard/createProduct/components/ResultHeader";
import GeneratedImageDisplay from "@/features/dashboard/createProduct/components/GeneratedImageDisplay";

import { useCreateProductNavigation } from "../hooks/useCreateProductNavigation";
import { CreateProductSelectors } from "../context/CreateProductContextSubscriber/selectors";
import { useCreateProductSubscriberActions } from "../context/CreateProductContextSubscriber/actions";

interface IResultsSectionProps {
  ref?: React.Ref<HTMLElement>;
}

const ResultsSection = ({ ref }: IResultsSectionProps) => {
  const generatedResult = CreateProductSelectors.generatedResult();
  const generationError = CreateProductSelectors.generationError();
  const { handleUseImage } = useCreateProductSubscriberActions();
  const { scrollToCustomizer } = useCreateProductNavigation();

  const onUseImage = () => {
    handleUseImage();
    scrollToCustomizer();
  };

  const error = generationError?.message;
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
