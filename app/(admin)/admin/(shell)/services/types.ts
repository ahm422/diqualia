export type ServicesPageData = {
  id: number;
  eyebrow: string;
  headline: string;
  body: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;
  ctaEyebrow: string;
  ctaHeadline: string;
  ctaBody: string;
  ctaBtn1Label: string;
  ctaBtn1Href: string;
  ctaEmailHref: string;
} | null;

export type ServiceItem = {
  id: number;
  sectionId: number;
  groupLabel: string | null;
  title: string;
  body: string | null;
  order: number;
};

export type ServiceSection = {
  id: number;
  tabId: string;
  order: number;
  eyebrow: string;
  title: string;
  body: string;
  cardTitle: string | null;
  cardBody: string | null;
  items: ServiceItem[];
};
