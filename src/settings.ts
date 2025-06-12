export interface ChartFieldConfig {
	enabled: boolean;
	target?: number;
}
export interface FieldConfig {
	enabled: boolean;
	target?: number;
	color?: string;
}

export interface ChartTypeConfig {
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


export interface ChartSettings {
	chartTypes: Record<string, ChartTypeConfig>;
	gridSize?: number;
	opacity?: number;
	// maxRDA: number;
	// limitDays: number;
}

export const DEFAULT_SETTINGS: ChartSettings = {
	chartTypes: {
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
		},
		"Example Pie Chart": {
			folder: "",
			fields: {},
			limitDays: 30,
			chartType: "pie",
			chartColor: "#ff66cc",
			x: "", // optional, not used by pie
			y: ""  // optional, not used by pie
			}
	},
	gridSize: 10,
	opacity: 1.0
};

	// == Chart Styles Definitions ==
export const CHART_STYLES: Record<string, string[]> = {
	bar: ["vertical", "horizontal", "stacked", "grouped", "overlay"],
	line: ["basic", "line+markers", "scatter", "stepped"],
	pie: ["pie", "donut"],
	heatmap: ["standard", "symmetric", "log"],
  };
  

