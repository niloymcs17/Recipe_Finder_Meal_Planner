// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

/** Minimal typings for Stencil custom elements used in Svelte templates. */
declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'recipe-card': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			heading?: string;
			image?: string;
			'cook-time'?: number;
			rating?: number;
			'recipe-id'?: string;
			favorited?: boolean;
			tags?: string[];
			onrecipeselect?: (event: Event) => void;
			onfavoritetoggle?: (event: Event) => void;
		};
		'search-bar': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			placeholder?: string;
			value?: string;
			label?: string;
			onsearchchange?: (event: Event) => void;
			onsearchsubmit?: (event: Event) => void;
		};
		'empty-state': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			message?: string;
			icon?: string;
		};
		'recipe-grid': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			columns?: number;
		};
		'filter-chip-group': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			label?: string;
			options?: { label: string; value: string }[];
			selected?: string[];
			onfilterchange?: (event: Event) => void;
		};
		'rating-stars': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			value?: number;
			readonly?: boolean;
		};
		'form-input': import('svelte/elements').HTMLAttributes<HTMLElement>;
		'rf-modal': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			open?: boolean;
			heading?: string;
		};
		'toast-notification': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			message?: string;
			type?: string;
			visible?: boolean;
		};
		'day-column': import('svelte/elements').HTMLAttributes<HTMLElement>;
	}
}

export {};
