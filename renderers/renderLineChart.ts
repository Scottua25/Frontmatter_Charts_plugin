import Plotly from "plotly.js-dist-min";
import { App } from "obsidian";
import { HeatmapSettings } from "../src/settings";
import { getDataMap } from "../src/dataUtils";

export default function renderLineChart(app: App, el: HTMLElement, type: string, settings: HeatmapSettings): void {
	const config = settings.heatmapTypes[type];
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
		type: 'scatter',
		mode: 'lines+markers',
		line: {
			color: config.chartColor || '#ff9900',
			width: 2
		},
		marker: {
			color: config.chartColor || '#ff9900',
			size: 6
		}
	}];

	const layout = {
		title: `Line Chart: ${type}`,
		plot_bgcolor: config.backgroundChartColor || "rgba(0,0,0,0)",
		paper_bgcolor: config.backgroundPageColor || "rgba(0,0,0,0)",
		font: {
			color: config.fontColor || "#fff",
			size: config.fontSize || 12
		}
	};

	const chartDiv = el.createDiv({ cls: "line-chart" });
	// @ts-ignore
	Plotly.newPlot(chartDiv, data, layout, { displayModeBar: false });
}
