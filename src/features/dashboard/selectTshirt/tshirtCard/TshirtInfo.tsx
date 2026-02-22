import { cleanAndTruncate } from "@/utils/htmlUtils";

interface Props {
  name: string;
  description: string;
}

export default function TshirtInfo({ name, description }: Props) {
  const cleanDescription = cleanAndTruncate(description, 120);

  return (
    <div>
      <h3 className="font-semibold text-lg bg-linear-to-r from-slate-700 via-gray-700 to-slate-800 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent">
        {name}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
        {cleanDescription}
      </p>
    </div>
  );
}
