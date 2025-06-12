import Plotly from "plotly.js-dist-min";
import { App } from "obsidian";
import { ChartSettings } from "../src/settings";
import { getDataMap } from "../src/dataUtils";

export default function renderLineChart(app: App, el: HTMLElement, type: string, settings: ChartSettings): void {
	const config = settings.chartTypes[type];
    if (!config || !config.x || !config.y) {
        el.createEl("div", { text: "Missing bar chart configuration." });
        return;
    }
    

	const dataMap = getDataMap(app, config);
	const dates = Object.keys(dataMap).sort().slice(-config.limitDays || undefined);

	const x = dates.map(date => dataMap[date]?.[config.x] ?? date);
	const yFields = Array.isArray(config.y) ? config.y : [config.y];

	const data = yFields.map((yField) => {
		const y = dates.map(date => dataMap[date]?.[yField] ?? 0);
		const color = config.fields?.[yField]?.color || '#ff9900';
	
		let mode = "lines";
		let shape: "linear" | "hv" | undefined = undefined;
	
		switch (config.chartStyle) {
			case "scatter":
				mode = "markers";
				break;
			case "line+markers":
				mode = "lines+markers";
				break;
			case "stepped":
				mode = "lines";
				shape = "hv";
				break;
		}
	
		return {
			x,
			y,
			name: yField,
			type: "scatter",
			mode,
			line: {
				color,
				width: 2,
				...(shape ? { shape } : {})
			},
			marker: {
				color,
				size: 6
			}
		};
	});
	

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
