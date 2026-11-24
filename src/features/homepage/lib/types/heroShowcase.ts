import type { LucideIcon } from "lucide-react";

export type HeroRotatingWordIdType = "tees" | "totes" | "mugs" | "hoodies";

/** Where a headline word is in its rotation: showing, sliding out, or waiting below */
export type HeroRotatingWordStateType = "active" | "leaving" | "waiting";

/** A way into the creator from the hero card; its copy lives in home.hero.<id> */
type HeroStartOptionIdT = "upload" | "describe";

export type HeroStartOptionT = {
  id: HeroStartOptionIdT;
  icon: LucideIcon;
};
