import type { DropdownComponent } from "obsidian";

// Chart types supported by your plugin
export type ChartType =
	| "heatmap"
	| "bar"
	| "line"
	| "pie"
	| "scatter"
	| "scatter3d"
	| "bubble"
	| "candlestick"
	| "histogram"
	| "box"
	| "violin";

// Configuration object for each chart
export interface ChartConfig {
	chartType: ChartType;
	chartStyle?: string;
	cellHeight?: number;
	marginTop?: number;
	fontColor?: string;
	fontSize?: number;
	backgroundPageColor?: string;
	backgroundChartColor?: string;
	colorscale?: string;
	reverseScale?: boolean;
	chartColor?: string;
	folder?: string;
	fields?: Record<string, FieldConfig>;
	sortOrder?: "custom" | "alphabetical" | "usage" | "reverse"; // optional if applicable
	customOrder?: string[];
	limitDays?: number;
	heatmapCustomGradient?: [number, string][];
	useCustomColorscale?: boolean;
	[key: string]: unknown;
}

// Extended DropdownComponent with optional method
export type DropdownWithCustomUpdate = DropdownComponent & {
	_updateStyleOptions?: () => void;
};

export interface ChartFieldConfig extends FieldConfig {
	enabled: boolean;
	[option: string]: unknown;
}

export interface ChartStyleConfig {
	chartType: string;
	chartStyle?: string;
	_chartStyleDropdown?: DropdownWithCustomUpdate;
}

export interface ChartSortableConfig {
	customOrder: string[];
	[key: string]: unknown;
}

export interface SortableFieldConfig {
	sortOrder?: "alphabetical" | "reverse" | "custom" | "usage";
	customOrder?: string[];
}

export interface FieldConfig {
	enabled?: boolean;
	target?: number;
	color?: string;
	// Add anything else you support
}

export interface ChartConfigWithFieldMeta extends ChartConfig {
	fields?: Record<string, FieldConfig>;
}

export interface FolderConfig {
	folder?: string;
}

export interface FontConfig {
	font?: string;
	fontColor?: string;
	fontSize?: number;
}

export interface MarginConfig {
	marginTop?: number;
	marginBottom?: number;
	marginLeft?: number;
	marginRight?: number;
}

export interface FrontmatterMap {
	[key: string]: Record<string, unknown>;
}
