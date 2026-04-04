import { Button } from "@/features/ui/button";
import { profileTheme } from "@/theme";
import { LucideIcon } from "lucide-react";

interface ProfileSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  buttonText: string;
  isEditing: boolean;
  onEdit: () => void;
}

export function ProfileSectionHeader({
  icon: Icon,
  title,
  subtitle,
  buttonText,
  isEditing,
  onEdit,
}: ProfileSectionHeaderProps) {
  return (
    <div className={profileTheme.section.header}>
      <div className={profileTheme.section.iconTitleWrap}>
        <div className={profileTheme.section.iconBox}>
          <Icon className="text-2xl" />
        </div>
        <div className={profileTheme.section.titleWrap}>
          <h2 className={profileTheme.section.title}>{title}</h2>
          <p className={profileTheme.section.subtitle}>{subtitle}</p>
        </div>
      </div>
      {!isEditing && (
        <Button
          onClick={onEdit}
          variant="ghost"
          className={profileTheme.section.editButton}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
