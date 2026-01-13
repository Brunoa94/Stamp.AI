const PromptTipBanner = () => {
  return (
    <div className="mb-4 p-3 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg group-hover:bg-linear-to-r group-hover:from-emerald-100 group-hover:to-teal-100 group-hover:border-emerald-300 transition-all duration-500 animate-[slideInDown_0.6s_ease-out]">
      <div className="flex items-center justify-center w-full">
        <div className="w-5 h-5 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-2 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shrink-0">
          <span className="text-xs">💡</span>
        </div>
        <span className="text-xs text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300 w-full flex items-center"></span>
      </div>
    </div>
  );
};

export default PromptTipBanner;
