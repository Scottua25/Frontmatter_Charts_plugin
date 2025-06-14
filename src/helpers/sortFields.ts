export function getSortedFields(fields: string[], config: any, reverseForChart = false): string[] {
	const sortOrder = config.sortOrder || "alphabetical";

	if (sortOrder === "alphabetical") {
		const sorted = [...fields].sort((a, b) => a.localeCompare(b));
		return reverseForChart ? sorted.reverse() : sorted;
	}

	if (sortOrder === "reverse") {
		const sorted = [...fields].sort((a, b) => b.localeCompare(a));
		return reverseForChart ? sorted.reverse() : sorted;
	}

	if (sortOrder === "custom" && Array.isArray(config.customOrder)) {
		const ordered = config.customOrder.filter((f: string) => fields.includes(f));
		const extras = fields.filter((f: string) => !ordered.includes(f));
		const result = [...ordered, ...extras];
		return reverseForChart ? result.slice().reverse() : result;
	}

	// Fallback
	return fields;
}
