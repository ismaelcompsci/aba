type Theme = {
  name: "dark" | "light" | "sepia";
  bg: string;
  fg: string;
};

export const themes: Theme[] = [
  { name: "light", bg: "#ffffff", fg: "#000000" },
  { name: "dark", bg: "#09090b", fg: "#d2d2d2" },
  { name: "sepia", bg: "#f1e8d0", fg: "#5b4636" },
];
