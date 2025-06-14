export function enableDragAndDrop(
	container: HTMLElement,
	config: any,
	key: string,
	saveSettings: () => Promise<void>
) {
	let draggedEl: HTMLElement | null = null;

	// Add draggable and drag handlers to each child
	Array.from(container.children).forEach(child => {
		if (!(child instanceof HTMLElement)) return;

		child.draggable = true;

		child.addEventListener("dragstart", (e) => {
			draggedEl = child;
			child.classList.add("dragging");
		});

		child.addEventListener("dragend", () => {
			if (draggedEl) draggedEl.classList.remove("dragging");
			draggedEl = null;
		});

		child.addEventListener("dragover", (e) => {
			e.preventDefault();
			const target = e.currentTarget as HTMLElement;
			if (!draggedEl || draggedEl === target) return;

			const bounding = target.getBoundingClientRect();
			const offset = e.clientY - bounding.top;
			const insertBefore = offset < bounding.height / 2;
			if (insertBefore) {
				container.insertBefore(draggedEl, target);
			} else {
				container.insertBefore(draggedEl, target.nextSibling);
			}
		});
	});

	// Save new order on drop
	container.addEventListener("drop", async () => {
		const newOrder = Array.from(container.children)
			.map(el => (el as HTMLElement).dataset.field)
			.filter(Boolean) as string[];

		config.customOrder = newOrder;
		await saveSettings();
	});
}