import { App } from "obsidian";
import { HeatmapSettings } from "../src/settings";

// Import chart-specific renderers
import renderHeatmapChart from "../renderers/renderHeatmapChart";
import renderBarChart from "../renderers/renderBarChart";
import renderLineChart from "../renderers/renderLineChart";

export const chartRendererMap: Record<
  string,
  (app: App, el: HTMLElement, type: string, settings: HeatmapSettings) => void
> = {
  heatmap: renderHeatmapChart,
  bar: renderBarChart,
  line: renderLineChart,
  // Add more as you implement them
};
