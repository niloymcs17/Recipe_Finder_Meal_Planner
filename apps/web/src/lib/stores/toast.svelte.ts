export type ToastType = 'success' | 'error' | 'info';

export type ToastState = {
	visible: boolean;
	message: string;
	type: ToastType;
};

let current = $state<ToastState>({ visible: false, message: '', type: 'info' });

export const toastStore = {
	get current() {
		return current;
	},
	show(message: string, type: ToastType = 'info') {
		current = { visible: false, message: '', type };
		queueMicrotask(() => {
			current = { visible: true, message, type };
		});
	}
};
