import { ShieldCheck } from "lucide-react";
import { paymentMethods } from "@/features/homepage/constants/homepageContent";
import { mapPaymentMethodIndexToVisual } from "@/features/homepage/mappers/securityCardMapper";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="relative overflow-hidden border-t border-slate-200 bg-linear-to-br from-[#7C3AED]/14 via-white to-[#FF8C42]/10 py-24"
    >
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#7C3AED]/22 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[#06B6D4]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF8C42]/12 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 ">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
            05 / Trust & Verification
          </span>
          <h2 className="font-heading text-3xl uppercase tracking-tight text-slate-900 md:text-4xl">
            Secure payments & buyer protection
          </h2>
          <div className="mt-6 mx-auto h-1.5 w-24 rounded-full bg-linear-to-r from-[#7C3AED] via-[#FF8C42] to-[#06B6D4]" />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method, idx) => {
            const Icon = method.icon;
            const { cardTheme, methodIcons } =
              mapPaymentMethodIndexToVisual(idx);

            return (
              <article
                key={method.name}
                className={`glass-card relative flex min-h-56 flex-col items-center overflow-hidden rounded-xl border bg-linear-to-br p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${cardTheme.gradient} ${cardTheme.border}`}
              >
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-linear-to-r ${cardTheme.bar}`}
                  aria-hidden="true"
                />
                <div className="mb-6 flex h-14 items-center justify-center">
                  <Icon className={`h-10 w-10 ${cardTheme.iconColor}`} />
                </div>
                <h3 className="font-heading text-lg uppercase text-slate-900">
                  {method.name}
                </h3>
                <p className="mb-5 mt-2 text-[11px] italic leading-relaxed text-slate-500">
                  {method.description}
                </p>
                <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
                  {methodIcons.map((item) => {
                    const MethodIcon = item.icon;

                    return (
                      <span
                        key={item.label}
                        className={`inline-flex items-center gap-1.5 rounded-full border bg-white/85 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 ${cardTheme.badgeBorder}`}
                      >
                        <MethodIcon
                          className={`h-3.5 w-3.5 ${cardTheme.badgeIcon}`}
                        />
                        <span>{item.label}</span>
                      </span>
                    );
                  })}
                </div>
                <div
                  className={`mt-auto flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 ${cardTheme.badgeBorder}`}
                >
                  <ShieldCheck
                    className={`h-3.5 w-3.5 ${cardTheme.badgeIcon}`}
                  />
                  <span>{method.badge}</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="glass-card flex flex-wrap items-center justify-center gap-5 rounded-2xl border border-white/60 bg-linear-to-r from-[#7C3AED]/12 via-white/90 to-[#06B6D4]/12 px-7 py-4 text-center">
          {[
            { color: "text-[#635BFF]", label: "256-bit SSL Encryption" },
            { color: "text-[#009CDE]", label: "3-D Secure Authentication" },
            { color: "text-[#FF8C42]", label: "PCI-DSS Compliant" },
            { color: "text-[#D946EF]", label: "GDPR Data Protection" },
            { color: "text-[#06B6D4]", label: "Chargeback Coverage" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <ShieldCheck className={`h-4 w-4 ${color}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
