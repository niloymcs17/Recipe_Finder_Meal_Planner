export function ceBind(node: HTMLElement, props: Record<string, unknown>) {
	let current = props;
	let cancelled = false;

	async function apply() {
		try {
			if (!customElements.get(node.localName)) {
				await customElements.whenDefined(node.localName);
			}
		} catch {
			return;
		}
		if (cancelled) return;
		Object.assign(node, current);
	}

	void apply();

	return {
		update(next: Record<string, unknown>) {
			current = next;
			void apply();
		},
		destroy() {
			cancelled = true;
		}
	};
}
