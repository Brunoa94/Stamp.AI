import { ProcessingDots } from "./ProcessingDots";

export function CreatingProgressBar() {
  return (
    <div className="w-full max-w-120 flex flex-col items-center">
      <ProcessingDots />
    </div>
  );
}
