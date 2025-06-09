export interface HeatmapFieldConfig {
	enabled: boolean;
	rda?: number;
}
export interface FieldConfig {
	enabled: boolean;
	rda?: number;
}

export interface HeatmapTypeConfig {
	folder: string;
	fields: Record<string, FieldConfig>;
	limitDays: number;

	chartType?: string;

	// Common visual config
	colorscale?: string;
	showScale?: boolean;
	reverseScale?: boolean;
	fontSize?: number;
	marginTop?: number;
	fontColor?: string;
	backgroundColor?: string;
	chartColor?: string;
	backgroundChartColor?: string;
	backgroundPageColor?: string;
	cellHeight?: number;
	[roleKey: string]: any; // dynamically store role fields like x, y, labels, etc.
}


export interface HeatmapSettings {
	heatmapTypes: Record<string, HeatmapTypeConfig>;
	gridSize?: number;
	opacity?: number;
	// maxRDA: number;
	// limitDays: number;
}

export const DEFAULT_SETTINGS: HeatmapSettings = {
	heatmapTypes: {
		"Example Bar Chart": {
			folder: "",
			fields: {},
			limitDays: 30,
			chartType: "bar",
			x: "",
			y: "",
			chartColor: "#ff9900"
		},
		"Example Line Chart": {
			folder: "",
			fields: {},
			limitDays: 30,
			chartType: "line",
			x: "",
			y: "",
			chartColor: "#00ccff"
		}
	},
	gridSize: 10,
	opacity: 1.0
};


