import { footerTheme } from "@/theme/components";

export function FooterMission() {
  return (
    <div className="col-span-1">
      <h3 className={footerTheme.missionTitle}>Our Mission</h3>
      <p className={footerTheme.missionText}>
        Empowering creators with AI-driven apparel design. High quality prints,
        delivered to your door.
      </p>
    </div>
  );
}
