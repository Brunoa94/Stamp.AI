import { theme } from "@/theme";
import { ROUTE_HEADER_CONFIGS } from "@/config/routeHeaders";

interface IDashboardHeaderProps {
  route: keyof typeof ROUTE_HEADER_CONFIGS;
}

const DashboardHeader = ({ route }: IDashboardHeaderProps) => {
  const config = ROUTE_HEADER_CONFIGS[route];
  const {
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    leftIconColor,
    rightIconColor,
    title,
    subtitle,
  } = config;

  return (
    <header className={theme.dashboard.header}>
      <div className="flex items-center justify-center mb-6">
        {LeftIcon && (
          <LeftIcon
            className={`w-8 h-8 ${leftIconColor} mr-3 animate-[wiggle_0.8s_ease-in-out_infinite]`}
          />
        )}
        <h1 className={theme.dashboard.title}>{title}</h1>
        {RightIcon && (
          <RightIcon
            className={`w-8 h-8 ${rightIconColor} ml-3 animate-[float_3s_ease-in-out_infinite]`}
          />
        )}
      </div>
      <p className={theme.dashboard.subtitle}>{subtitle}</p>
    </header>
  );
};

export default DashboardHeader;
