import { cleanAndTruncate } from "@/utils/htmlUtils";

interface Props {
  name: string;
  description: string;
}

export default function TshirtInfo({ name, description }: Props) {
  const cleanDescription = cleanAndTruncate(description, 120);

  return (
    <div>
      <h3 className="font-semibold text-lg bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
        {name}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
        {cleanDescription}
      </p>
    </div>
  );
}
