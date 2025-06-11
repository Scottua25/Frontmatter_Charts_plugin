import Plotly from "plotly.js-dist-min";
import { App } from "obsidian";
import { ChartSettings } from "../src/settings";
import { getDataMap } from "../src/dataUtils";

export default function renderPieChart(
  app: App,
  el: HTMLElement,
  type: string,
  settings: ChartSettings
): void {
  const config = settings.chartTypes[type];
  if (!config) {
    el.createEl("div", { text: "Missing pie chart configuration." });
    return;
  }

  const enabledFields = Object.entries(config.fields || {})
    .filter(([, field]) => field.enabled)
    .map(([field]) => field);

  if (!enabledFields.length) {
    el.createEl("div", { text: "No fields enabled for pie chart." });
    return;
  }

  const dataMap = getDataMap(app, config);
  const totals: Record<string, number> = {};

  for (const date in dataMap) {
    const entry = dataMap[date];
    for (const field of enabledFields) {
      const val = Number(entry?.[field]);
      if (!isNaN(val)) {
        totals[field] = (totals[field] || 0) + val;
      }
    }
  }

  const labels = Object.keys(totals);
  const values = labels.map(label => totals[label]);

  const trace: Partial<Plotly.PieData> = {
    type: "pie",
    labels,
    values,
    textinfo: "label+percent",
    hoverinfo: "label+value+percent",
  };

  const layout: Partial<Plotly.Layout> = {
    margin: { t: 20, b: 20, l: 20, r: 20 },
    font: { size: 12 },
    paper_bgcolor: "transparent",
  };

  const configPlot: Partial<Plotly.Config> = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot(el, [trace], layout, configPlot);
}
