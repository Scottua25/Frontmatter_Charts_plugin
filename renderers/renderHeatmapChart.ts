import { App } from "obsidian";
import Plotly from "plotly.js-dist-min";
import { getDataMap } from "../src/dataUtils";
import type { ChartSettings } from "../src/settings";

export default function renderHeatmapChart(
	app: App,
	el: HTMLElement,
	type: string,
	settings: ChartSettings
): void {
	const config = settings.chartTypes[type];
	if (!config || !config.fields) {
		el.createEl("div", { text: "Heatmap config missing." });
		return;
	}

	const dataMap = getDataMap(app, config);
	let dates = Object.keys(dataMap).sort();
	const limit = config.limitDays ?? 0;
	if (limit > 0) dates = dates.slice(-limit);

	const fields = Object.keys(config.fields).filter(k => config.fields[k].enabled);

	const z: number[][] = fields.map(field => {
		const row = dates.map(date => {
			const rawVal = dataMap[date]?.[field];
			const val = typeof rawVal === "number" ? rawVal : Number(rawVal);
			const target = config.fields[field]?.target ?? config.fields[field]?.target ?? 1;
			const pct = target > 0 ? Math.round((val / target) * 100) : 0;
	
			// console.log(`[HEATMAP] field=${field}, date=${date}, val=${val}, target=${target}, pct=${pct}`);
			return pct;
		});
		return row;
	});	

    const annotations: Partial<Plotly.Annotations>[] = [];

	fields.forEach((field, rowIdx) => {
		dates.forEach((date, colIdx) => {
			const val = dataMap[date]?.[field] ?? 0;
			const target = config.fields[field]?.target ?? 1;
			const pct = (val / target) * 100;
			if (pct > 100) {
				annotations.push({
					x: date,
					y: field,
					text: "X",
					showarrow: false,
					font: {
						color: config.fontColor || "#000",
						size: config.fontSize || 12,
					}
				});
			}
		});
	});

	const cellHeight = Math.max(10, Math.min(100, config.cellHeight ?? 30));

	const layout = {
		title: `Heatmap: ${type}`,
		margin: { t: config.marginTop ?? 30, l: 120 },
		xaxis: {
			type: 'category',
			tickangle: -45,
			tickfont: { size: config.fontSize ?? 12 }
		},
		yaxis: {
			type: 'category',
			automargin: true,
			tickfont: { size: config.fontSize ?? 12 }
		},
		height: 50 + fields.length * cellHeight,
		plot_bgcolor: config.backgroundChartColor ?? "rgba(0,0,0,0)",
		paper_bgcolor: config.backgroundPageColor ?? "rgba(0,0,0,0)",
		font: {
			color: config.fontColor ?? "#ffffff",
			size: config.fontSize ?? 12
		},
		annotations
	};

    const data = [{
        z,
        x: dates,
        y: fields,
        type: 'heatmap',
        colorscale: config.colorscale || 'YlGnBu',
        showscale: config.showScale ?? true,
        reversescale: config.reverseScale ?? false,
        zmin: 0,
        zmax: 100
    }];
    
	const chartDiv = el.createDiv({ cls: "heatmap-chart" });
	// @ts-ignore
    
	Plotly.newPlot(chartDiv, data, layout, { displayModeBar: false });
}
