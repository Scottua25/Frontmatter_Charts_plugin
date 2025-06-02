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

