import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface Props {
  title: string;
  description: string;
}

export default function PageSubsectionVertical({ title, description }: Props) {
  return (
    <div className={`flex flex-col gap-3 ${notoSans.className}`}>
      <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </p>
      <p className="text-base text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
