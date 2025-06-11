import { App } from "obsidian";
import { ChartSettings } from "../src/settings";

// Import chart-specific renderers
import renderHeatmapChart from "../renderers/renderHeatmapChart";
import renderBarChart from "../renderers/renderBarChart";
import renderLineChart from "../renderers/renderLineChart";
import renderPieChart from "../renderers/renderPieChart";

export const chartRendererMap: Record<
  string,
  (app: App, el: HTMLElement, type: string, settings: ChartSettings) => void
> = {
  heatmap: renderHeatmapChart,
  bar: renderBarChart,
  line: renderLineChart,
  pie: renderPieChart,
  // Add more as you implement them
};
