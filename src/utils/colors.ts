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
    name: "Cyan",
    border: "#06b6d4",
    fill: "rgba(6, 182, 212, 0.16)",
    fillHover: "rgba(6, 182, 212, 0.32)",
    badgeBg: "#0891b2",
    badgeText: "#ffffff",
    pillBgLight: "#ecfeff",
    pillBgDark: "rgba(8, 145, 178, 0.2)",
    pillBorder: "#06b6d4",
    pillTextLight: "#0e7490",
    pillTextDark: "#22d3ee",
  },
  {
    name: "Violet",
    border: "#8b5cf6",
    fill: "rgba(139, 92, 246, 0.16)",
    fillHover: "rgba(139, 92, 246, 0.32)",
    badgeBg: "#7c3aed",
    badgeText: "#ffffff",
    pillBgLight: "#f5f3ff",
    pillBgDark: "rgba(124, 58, 237, 0.2)",
    pillBorder: "#8b5cf6",
    pillTextLight: "#6d28d9",
    pillTextDark: "#a78bfa",
  },
  {
    name: "Amber",
    border: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.16)",
    fillHover: "rgba(245, 158, 11, 0.32)",
    badgeBg: "#d97706",
    badgeText: "#ffffff",
    pillBgLight: "#fffbeb",
    pillBgDark: "rgba(217, 119, 6, 0.2)",
    pillBorder: "#f59e0b",
    pillTextLight: "#b45309",
    pillTextDark: "#fbbf24",
  },
  {
    name: "Emerald",
    border: "#10b981",
    fill: "rgba(16, 185, 129, 0.16)",
    fillHover: "rgba(16, 185, 129, 0.32)",
    badgeBg: "#059669",
    badgeText: "#ffffff",
    pillBgLight: "#ecfdf5",
    pillBgDark: "rgba(5, 150, 105, 0.2)",
    pillBorder: "#10b981",
    pillTextLight: "#047857",
    pillTextDark: "#34d399",
  },
  {
    name: "Rose",
    border: "#f43f5e",
    fill: "rgba(244, 63, 94, 0.16)",
    fillHover: "rgba(244, 63, 94, 0.32)",
    badgeBg: "#e11d48",
    badgeText: "#ffffff",
    pillBgLight: "#fff1f2",
    pillBgDark: "rgba(225, 29, 72, 0.2)",
    pillBorder: "#f43f5e",
    pillTextLight: "#be123c",
    pillTextDark: "#fb7185",
  },
  {
    name: "Blue",
    border: "#3b82f6",
    fill: "rgba(59, 130, 246, 0.16)",
    fillHover: "rgba(59, 130, 246, 0.32)",
    badgeBg: "#2563eb",
    badgeText: "#ffffff",
    pillBgLight: "#eff6ff",
    pillBgDark: "rgba(37, 99, 235, 0.2)",
    pillBorder: "#3b82f6",
    pillTextLight: "#1d4ed8",
    pillTextDark: "#60a5fa",
  },
  {
    name: "Teal",
    border: "#14b8a6",
    fill: "rgba(20, 184, 166, 0.16)",
    fillHover: "rgba(20, 184, 166, 0.32)",
    badgeBg: "#0d9488",
    badgeText: "#ffffff",
    pillBgLight: "#f0fdfa",
    pillBgDark: "rgba(13, 148, 136, 0.2)",
    pillBorder: "#14b8a6",
    pillTextLight: "#0f766e",
    pillTextDark: "#2dd4bf",
  },
  {
    name: "Fuchsia",
    border: "#d946ef",
    fill: "rgba(217, 70, 239, 0.16)",
    fillHover: "rgba(217, 70, 239, 0.32)",
    badgeBg: "#c026d3",
    badgeText: "#ffffff",
    pillBgLight: "#fdf4ff",
    pillBgDark: "rgba(192, 38, 211, 0.2)",
    pillBorder: "#d946ef",
    pillTextLight: "#a21caf",
    pillTextDark: "#e879f9",
  },
];

export function getGroupColor(index: number): GroupColor {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}
