import Plotly from "plotly.js-dist-min";
import { App } from "obsidian";
import { ChartSettings } from "../src/settings";
import { getDataMap } from "../src/dataUtils";

export default function renderBarChart(app: App, el: HTMLElement, type: string, settings: ChartSettings): void {
	const config = settings.chartTypes[type];
    if (!config || !config.x || !config.y) {
        el.createEl("div", { text: "Missing bar chart configuration." });
        return;
    }
    

	const dataMap = getDataMap(app, config);
	const dates = Object.keys(dataMap).sort().slice(-config.limitDays || undefined);

	const x = dates.map(date => dataMap[date]?.[config.x] ?? date);
	const y = dates.map(date => dataMap[date]?.[config.y] ?? 0);

	const data = [{
		x,
		y,
		type: 'bar',
		marker: {
			color: config.chartColor || '#888'
		}
	}];

	const layout = {
		title: `Bar Chart: ${type}`,
		plot_bgcolor: config.backgroundChartColor || "rgba(0,0,0,0)",
		paper_bgcolor: config.backgroundPageColor || "rgba(0,0,0,0)",
		font: {
			color: config.fontColor || "#fff",
			size: config.fontSize || 12
		}
	};

	const chartDiv = el.createDiv({ cls: "bar-chart" });
	// @ts-ignore
	Plotly.newPlot(chartDiv, data, layout, { displayModeBar: false });
}
