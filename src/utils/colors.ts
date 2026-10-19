export interface GroupColor {
  name: string;
  border: string;
  fill: string;
  fillHover: string;
  badgeBg: string;
  badgeText: string;
  pillBgLight: string;
  pillBgDark: string;
  pillBorder: string;
  pillTextLight: string;
  pillTextDark: string;
}

export const GROUP_COLORS: GroupColor[] = [
  {
    name: "Violet",
    border: "#8b5cf6",
    fill: "rgba(139, 92, 246, 0.16)",
    fillHover: "rgba(139, 92, 246, 0.32)",
    badgeBg: "#7c3aed",
    badgeText: "#ffffff",
    pillBgLight: "rgba(124, 58, 237, 0.2)",
    pillBgDark: "rgba(124, 58, 237, 0.22)",
    pillBorder: "#8b5cf6",
    pillTextLight: "#ddd6fe",
    pillTextDark: "#ede9fe",
  },
  {
    name: "Cyan",
    border: "#06b6d4",
    fill: "rgba(6, 182, 212, 0.16)",
    fillHover: "rgba(6, 182, 212, 0.32)",
    badgeBg: "#0891b2",
    badgeText: "#ffffff",
    pillBgLight: "rgba(8, 145, 178, 0.2)",
    pillBgDark: "rgba(8, 145, 178, 0.22)",
    pillBorder: "#06b6d4",
    pillTextLight: "#cffafe",
    pillTextDark: "#e0f2fe",
  },
  {
    name: "Emerald",
    border: "#10b981",
    fill: "rgba(16, 185, 129, 0.16)",
    fillHover: "rgba(16, 185, 129, 0.32)",
    badgeBg: "#059669",
    badgeText: "#ffffff",
    pillBgLight: "rgba(5, 150, 105, 0.2)",
    pillBgDark: "rgba(5, 150, 105, 0.22)",
    pillBorder: "#10b981",
    pillTextLight: "#d1fae5",
    pillTextDark: "#ecfdf5",
  },
  {
    name: "Amber",
    border: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.16)",
    fillHover: "rgba(245, 158, 11, 0.32)",
    badgeBg: "#d97706",
    badgeText: "#ffffff",
    pillBgLight: "rgba(217, 119, 6, 0.2)",
    pillBgDark: "rgba(217, 119, 6, 0.22)",
    pillBorder: "#f59e0b",
    pillTextLight: "#fef3c7",
    pillTextDark: "#fffbeb",
  },
  {
    name: "Rose",
    border: "#f43f5e",
    fill: "rgba(244, 63, 94, 0.16)",
    fillHover: "rgba(244, 63, 94, 0.32)",
    badgeBg: "#e11d48",
    badgeText: "#ffffff",
    pillBgLight: "rgba(225, 29, 72, 0.2)",
    pillBgDark: "rgba(225, 29, 72, 0.22)",
    pillBorder: "#f43f5e",
    pillTextLight: "#ffe4e6",
    pillTextDark: "#fff1f2",
  },
  {
    name: "Sky",
    border: "#0284c7",
    fill: "rgba(2, 132, 199, 0.16)",
    fillHover: "rgba(2, 132, 199, 0.32)",
    badgeBg: "#0369a1",
    badgeText: "#ffffff",
    pillBgLight: "rgba(3, 105, 161, 0.2)",
    pillBgDark: "rgba(3, 105, 161, 0.22)",
    pillBorder: "#0ea5e9",
    pillTextLight: "#e0f2fe",
    pillTextDark: "#f0f9ff",
  },
  {
    name: "Teal",
    border: "#14b8a6",
    fill: "rgba(20, 184, 166, 0.16)",
    fillHover: "rgba(20, 184, 166, 0.32)",
    badgeBg: "#0d9488",
    badgeText: "#ffffff",
    pillBgLight: "rgba(13, 148, 136, 0.2)",
    pillBgDark: "rgba(13, 148, 136, 0.22)",
    pillBorder: "#14b8a6",
    pillTextLight: "#ccfbf1",
    pillTextDark: "#f0fdfa",
  },
  {
    name: "Fuchsia",
    border: "#d946ef",
    fill: "rgba(217, 70, 239, 0.16)",
    fillHover: "rgba(217, 70, 239, 0.32)",
    badgeBg: "#c026d3",
    badgeText: "#ffffff",
    pillBgLight: "rgba(192, 38, 211, 0.2)",
    pillBgDark: "rgba(192, 38, 211, 0.22)",
    pillBorder: "#d946ef",
    pillTextLight: "#fae8ff",
    pillTextDark: "#fdf4ff",
  },
];

export function getGroupColor(index: number): GroupColor {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}
