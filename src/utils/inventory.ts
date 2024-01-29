import { type Attributes, type Dino } from "@prisma/client";

export function groupByColor(items: any[]): Record<string, any> {
  return items.reduce((acc: Record<string, any>, item: any) => {
    const color = item.color;
    if (!acc[color]) {
      acc[color] = [];
    }
    acc[color].push(item);
    return acc;
  }, {});
}

export function groupByEdition(items: any[]): Record<string, any> {
  return items.reduce((acc: Record<string, any>, item: any) => {
    const edition = item.edition;
    if (!acc[edition]) {
      acc[edition] = [];
    }
    acc[edition].push(item);
    return acc;
  }, {});
}

export function groupBySymbol(items: any[]): Record<string, any> {
  return items.reduce((acc: Record<string, any>, item: any) => {
    const symbol = item.symbol;
    if (!acc[symbol]) {
      acc[symbol] = [];
    }
    acc[symbol].push(item);
    return acc;
  }, {});
}

type IndexableAttributes = Attributes & {
  [key: string]: string | null | undefined;
};

export type Character = Dino & {
  attributes: IndexableAttributes | null;
};

export const sortByAttribute = (items: Character[], attribute: string) => {
  return items?.sort((a, b) => {
    const attrA = a.attributes?.[attribute] || "";
    const attrB = b.attributes?.[attribute] || "";
    return attrA.localeCompare(attrB);
  });
};

export const sortByRarity = (items: Character[]) => {
  return items?.sort((a, b) => {
    return (a.rarity ?? 0) - (b.rarity ?? 0); // Sort by the 'rarity' property in ascending order
  });
};
