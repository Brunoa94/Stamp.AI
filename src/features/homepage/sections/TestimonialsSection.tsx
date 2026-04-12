"use client";

import { useState, useEffect, useRef } from "react";

interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  image: string;
  delay: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "James M.",
    title: "Creative Director",
    quote:
      "Stamp.AI transformed how we approach custom apparel. The precision is unmatched.",
    image: "/assets/testimonial-bachelorette.png",
    delay: 0,
  },
  {
    id: 2,
    name: "Sofia R.",
    title: "Brand Strategist",
    quote:
      "The AI synthesis feature gave us design variations we never imagined. Game-changing.",
    image: "/assets/testimonial-dog-owner.png",
    delay: 0.15,
  },
  {
    id: 3,
    name: "Marcus T.",
    title: "Entrepreneur",
    quote:
      "From concept to production in hours, not weeks. This is the future of design.",
    image: "/assets/testimonial-college-guys.png",
    delay: 0.3,
  },
  {
    id: 4,
    name: "Elena S.",
    title: "Designer & Founder",
    quote:
      "Finally, a platform that respects both creativity and manufacturing excellence.",
    image: "/assets/testimonial-fourth.png",
    delay: 0.45,
  },
];

export function TestimonialsSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleCards((prev) =>
                  new Set(prev).add(testimonials[index].id),
                );
              }, testimonials[index].delay * 1000);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px -100px 0px",
        },
      );

      observer.observe(card);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-linear-to-br from-[#D946EF]/10 via-white to-[#06B6D4]/10 py-16 md:py-24 lg:py-32"
    >
      {/* Gradient Blobs */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#7C3AED]/18 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#06B6D4]/16 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D946EF]/12 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-360 space-y-12 px-6 md:space-y-16 md:px-16 xl:px-24">
        {/* Header */}
        <header className="space-y-3 md:space-y-4">
          <span className="mb-4 block text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
            04 / Customer Stories
          </span>
          <h2 className="font-heading text-4xl uppercase leading-tight text-slate-900 md:text-5xl lg:text-6xl">
            Voices from the community.
          </h2>
          <div className="mt-6 h-1.5 w-24 rounded-full bg-linear-to-r from-[#D946EF] via-[#7C3AED] to-[#06B6D4]" />
          <p className="max-w-2xl text-base font-medium text-slate-600 md:text-lg">
            Real stories from creators using Stamp.AI to push the boundaries of
            apparel design.
          </p>
        </header>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => {
            const isVisible = visibleCards.has(testimonial.id);

            return (
              <article
                key={testimonial.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="group relative min-h-112.5 overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:min-h-125"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(40px)",
                  transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
                }}
                onMouseEnter={() => setHoveredCard(testimonial.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Content - Stacked on Mobile, Side-by-Side on MD+ */}
                <div className="flex h-full flex-col gap-4 md:flex-row md:gap-6">
                  {/* Quote Section - Left on Desktop, Top on Mobile - 50% width on desktop */}
                  <div className="flex flex-1 flex-col justify-center p-8 sm:p-10 md:w-[50%] md:p-12 lg:p-16">
                    <blockquote className="space-y-8">
                      <p className="font-heading text-3xl font-bold uppercase leading-[1.1] text-slate-900 sm:text-4xl md:text-4xl lg:text-5xl">
                        {testimonial.quote}
                      </p>
                      <footer className="space-y-2">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-900">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {testimonial.title}
                        </p>
                      </footer>
                    </blockquote>
                  </div>

                  {/* Image Section - Right on Desktop, Bottom on Mobile - 50% width on desktop */}
                  <div className="flex items-center justify-center p-4 md:w-[50%] md:p-6 lg:p-8">
                    <div className="relative h-80 w-full overflow-hidden rounded-2xl md:h-full md:min-h-100 lg:min-h-112.5">
                      {/* Subtle gradient overlay */}
                      <div
                        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-br from-[#7C3AED]/20 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40"
                        aria-hidden="true"
                      />

                      {/* Image */}
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>

                {/* Purple Glow Shadow on Hover */}
                <div
                  className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 ${hoveredCard === testimonial.id ? "opacity-100" : ""}`}
                  style={{
                    boxShadow:
                      "0 30px 80px rgba(124, 58, 237, 0.4), 0 0 50px rgba(217, 70, 239, 0.3)",
                  }}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
