export default function Home() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center space-y-6 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Imaginary Builder AI
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
          AI-powered design and building platform
        </p>
      </div>
    </section>
  );
}
