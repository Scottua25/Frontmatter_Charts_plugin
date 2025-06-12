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
	const yFields = Array.isArray(config.y) ? config.y : [config.y];

	const style = config.chartStyle || "vertical";
	const isHorizontal = style === "horizontal";

	// Determine axis swap
	// const traceX = isHorizontal ? y : x;
	// const traceY = isHorizontal ? x : y;

	// Determine bar mode for layout
	let barmode: "stack" | "group" | "overlay" | "relative" = "relative";
	switch (style) {
		case "stacked":
			barmode = "stack";
			break;
		case "grouped":
			barmode = "group";
			break;
		case "overlay":
			barmode = "overlay";
			break;
	}

	const data = yFields.map((yField) => {
		const y = dates.map(date => dataMap[date]?.[yField] ?? 0);
		const x = dates.map(date => dataMap[date]?.[config.x] ?? date);
	
		const color = config.fields?.[yField]?.color || config.chartColor || '#888';
	
		return {
			x: isHorizontal ? y : x,
			y: isHorizontal ? x : y,
			type: 'bar',
			name: yField,
			orientation: isHorizontal ? "h" : "v",
			marker: {
				color
			}
		};
	});	

	const layout = {
		title: `Bar Chart: ${type}`,
		barmode,
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
