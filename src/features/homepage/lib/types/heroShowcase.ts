import type { LucideIcon } from "lucide-react";

export type HeroRotatingWordIdType = "tees" | "totes" | "mugs" | "hoodies";

/** Where a headline word is in its rotation: showing, sliding out, or waiting below */
export type HeroRotatingWordStateType = "active" | "leaving" | "waiting";

export type HeroFlowBenefitIdType = "noSkills" | "preview" | "onDemand";

/** A way into the creator from the hero card; its copy lives in home.hero.<id> */
type HeroStartOptionIdT = "upload" | "describe";

export type HeroStartOptionT = {
  id: HeroStartOptionIdT;
  icon: LucideIcon;
};

/** One banner under the hero's flow demo; its copy lives in home.hero.flowBenefits.<id> */
export interface HeroFlowBenefitType {
  id: HeroFlowBenefitIdType;
  icon: LucideIcon;
}
