export const chartRoleDefinitions = {
	heatmap: {
		x: "Date",
		y: "Field Name",
		z: "Value",
		options: ["colorscale", "reverseScale", "cellHeight"]
	},
	bar: {
		x: "Category",
		y: "Value",
		options: ["chartColor"]
	},
	line: {
		x: "Time",
		y: "Value",
		options: ["chartColor"]
	},
	pie: {
		labels: "Category",
		values: "Size",
		options: ["chartColor"]
	},
	// Future: scatter3d, candlestick, etc.
};
