interface DescriptionProps {
  description: string;
}

export function Description({ description }: DescriptionProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
        Description
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
