import { footerTheme } from "@/theme/components";

export function FooterMission() {
  return (
    <div className="col-span-1">
      <h4 className={footerTheme.missionTitle}>Our Mission</h4>
      <p className={footerTheme.missionText}>
        Empowering creators with AI-driven apparel design. High quality prints,
        delivered to your door with a nostalgic touch.
      </p>
    </div>
  );
}
