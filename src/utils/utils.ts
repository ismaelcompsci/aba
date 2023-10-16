export const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));
