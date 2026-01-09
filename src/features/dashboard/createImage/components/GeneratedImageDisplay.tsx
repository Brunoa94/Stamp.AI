interface Props {
  imageUrl: string;
  altText?: string;
}

const GeneratedImageDisplay = ({
  imageUrl,
  altText = "AI Generated Image",
}: Props) => {
  return (
    <div className="bg-linear-to-br from-white via-gray-50/50 to-purple-50/30 rounded-2xl p-8 border border-gray-200 shadow-xl">
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-w-2xl mx-auto block rounded-xl"
      />

      <div className="mt-6 flex justify-center">
        <a
          href={imageUrl}
          download="ai-generated-image.png"
          className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Download Image 📥
        </a>
      </div>
    </div>
  );
};

export default GeneratedImageDisplay;
