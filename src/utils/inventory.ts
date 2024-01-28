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
