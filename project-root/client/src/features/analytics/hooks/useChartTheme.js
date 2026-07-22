// client/src/features/analytics/hooks/useChartTheme.js
/**
 * Returns the current chart color palette based on theme.
 * Reactive: automatically re-renders charts when theme changes.
 */

import { useTheme } from "../../../context/ThemeContext";
import { CHART_THEMES } from "../config/chartTheme";

export default function useChartTheme() {
  const { theme } = useTheme();
  return CHART_THEMES[theme] || CHART_THEMES.light;
}