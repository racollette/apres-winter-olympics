export function truncateAccount(str: string) {
  const firstFive = str.slice(0, 5);
  const lastFive = str.slice(-5);

  return `${firstFive}...${lastFive}`;
}

export function shortAccount(str: string, length = 5) {
  const firstFive = str.slice(0, length);
  return `${firstFive}`;
}
