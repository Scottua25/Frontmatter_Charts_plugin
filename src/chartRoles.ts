export const chartRoleDefinitions = {
	heatmap: {
		roles: {
			x: { label: "X Axis (Dates)", single: true },
			y: { label: "Y Axis (Fields)", single: false },
			z: { label: "Z Values (Required)", single: false }
		},
		options: ["colorscale", "reverseScale", "cellHeight"],
        allowTarget: true
	},

	bar: {
		roles: {
			x: { label: "X Axis (Categories)", single: true },
			y: { label: "Y Axis (Values)", single: false }
		},
		options: ["chartColor"]
	},

	line: {
		roles: {
			x: { label: "X Axis (Time or Categories)", single: true },
			y: { label: "Y Axis (Series Values)", single: false }
		},
		options: ["chartColor"]
	},

	pie: {
		roles: {
			labels: { label: "Labels (Categories)", single: true },
			values: { label: "Values (Sizes)", single: true }
		},
		options: ["chartColor"]
	},

	scatter: {
		roles: {
			x: { label: "X Axis", single: true },
			y: { label: "Y Axis", single: true }
		},
		options: ["chartColor"]
	},

	scatter3d: {
		roles: {
			x: { label: "X Axis", single: true },
			y: { label: "Y Axis", single: true },
			z: { label: "Z Axis", single: true }
		},
		options: ["chartColor"]
	},

	bubble: {
		roles: {
			x: { label: "X Axis", single: true },
			y: { label: "Y Axis", single: true },
			size: { label: "Bubble Size", single: true },
			color: { label: "Bubble Color", single: true }
		},
		options: ["chartColor"]
	},

	candlestick: {
		roles: {
			x: { label: "X Axis (Time)", single: true },
			open: { label: "Open Price", single: true },
			high: { label: "High Price", single: true },
			low: { label: "Low Price", single: true },
			close: { label: "Close Price", single: true }
		},
		options: []
	},

	histogram: {
		roles: {
			x: { label: "Values", single: false }
		},
		options: ["chartColor"]
	},

	box: {
		roles: {
			y: { label: "Values", single: false }
		},
		options: ["chartColor"]
	},

	violin: {
		roles: {
			y: { label: "Values", single: false }
		},
		options: ["chartColor"]
	}
};
