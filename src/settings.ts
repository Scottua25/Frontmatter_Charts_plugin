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
	colorscale?: string;
	showScale?: boolean;
	reverseScale?: boolean;
	fontSize?: number;
	marginTop?: number;
	fontColor?: string;
	backgroundColor?: string;
	chartType?: string; // "heatmap", "bar", "line", etc.
	xField?: string; // Field to use for x-axis (non-heatmap)
	yField?: string; // Field to use for y-axis (non-heatmap)
	chartColor?: string;
	backgroundChartColor?: string; // for plot_bgcolor
	backgroundPageColor?: string;  // for paper_bgcolor
	cellHeight?: number; // for heatmap
	
}


export interface HeatmapSettings {
	heatmapTypes: Record<string, HeatmapTypeConfig>;
	gridSize?: number;
	opacity?: number;
	// maxRDA: number;
	// limitDays: number;
}

export const DEFAULT_SETTINGS: HeatmapSettings = {
	heatmapTypes: {},
	gridSize: 10,
	opacity: 1.0
};

