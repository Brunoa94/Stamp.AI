interface Props {
  src: string;
  alt: string;
  isSelected: boolean;
}

export default function TshirtImage({ src, alt, isSelected }: Props) {
  return (
    <div className="aspect-square mb-4 relative">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-lg bg-gray-50 dark:bg-gray-700"
      />
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}
