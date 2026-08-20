export type HomeHero = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  body: string;
  btn1Label: string;
  btn1Href: string;
  btn2Label: string;
  btn2Href: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
} | null;

export type MarqueeItem = { id: number; text: string; order: number };

export type ExploreSection = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  body: string;
} | null;

export type ExploreCard = {
  id: number;
  href: string;
  title: string;
  body: string;
  sectionLabel: string | null;
  visible: boolean;
  order: number;
};

export type WhereNext = {
  id: number;
  eyebrow: string;
  headline: string;
  body: string;
  btnLabel: string;
  btnHref: string;
} | null;
