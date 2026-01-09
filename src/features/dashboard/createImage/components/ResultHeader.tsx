const ResultHeader = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold mr-4 animate-[bounceIn_0.8s_ease-out] shadow-lg">
          3
        </div>
        <div className="flex flex-col items-start">
          <h3 className="text-3xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            🎨 Magic Created!
          </h3>
          <p className="text-gray-600 text-left">
            Your AI-generated masterpiece is ready
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultHeader;
