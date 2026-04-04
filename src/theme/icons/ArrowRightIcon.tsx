interface ArrowRightIconProps {
  className?: string;
}

export const ArrowRightIcon = ({ className = "w-5 h-5" }: ArrowRightIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
};
