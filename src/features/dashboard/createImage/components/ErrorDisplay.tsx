interface Props {
  error: string;
}

const ErrorDisplay = ({ error }: Props) => {
  return (
    <section
      className="text-center py-8 animate-[fadeIn_0.6s_ease-out]"
      aria-live="polite"
    >
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto">
        <p className="text-red-700 font-medium">❌ {error}</p>
      </div>
    </section>
  );
};

export default ErrorDisplay;