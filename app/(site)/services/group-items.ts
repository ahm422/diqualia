export type ServiceItemData = {
  id: number;
  groupLabel: string | null;
  title: string;
  body: string | null;
  order: number;
};

export type ServiceSectionData = {
  id: number;
  tabId: string;
  eyebrow: string;
  title: string;
  body: string;
  cardTitle: string | null;
  cardBody: string | null;
  overviewHtml: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  order: number;
  items: ServiceItemData[];
};

export type GroupedCard = {
  groupLabel: string;
  title: string;
  body: string;
  deliverables: string[];
};

export function groupItems(items: ServiceItemData[]): GroupedCard[] {
  const groups = new Map<string, GroupedCard>();
  const order: string[] = [];

  for (const item of items) {
    if (item.groupLabel === null || item.groupLabel === "What You Receive") continue;

    if (!groups.has(item.groupLabel)) {
      order.push(item.groupLabel);
      groups.set(item.groupLabel, {
        groupLabel: item.groupLabel,
        title: "",
        body: "",
        deliverables: [],
      });
    }

    const group = groups.get(item.groupLabel)!;
    if (item.body !== null && group.title === "") {
      group.title = item.title;
      group.body = item.body;
    } else if (item.body === null) {
      group.deliverables.push(item.title);
    }
  }

  return order.map((label) => groups.get(label)!);
}
