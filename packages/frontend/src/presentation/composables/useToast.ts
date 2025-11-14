import { ref } from "vue";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type Toast = {
	readonly id: number;
	readonly message: string;
	readonly variant: ToastVariant;
	readonly duration: number;
};

const toasts = ref<readonly Toast[]>([]);
let nextId = 0;

export const useToast = () => {
	const show = (
		message: string,
		variant: ToastVariant = "info",
		duration = 3000,
	): void => {
		const id = nextId++;
		const toast: Toast = { id, message, variant, duration };
		toasts.value = [...toasts.value, toast];

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}
	};

	const remove = (id: number): void => {
		toasts.value = toasts.value.filter((t) => t.id !== id);
	};

	const success = (message: string): void => {
		show(message, "success");
	};

	const error = (message: string): void => {
		show(message, "error");
	};

	const warning = (message: string): void => {
		show(message, "warning");
	};

	const info = (message: string): void => {
		show(message, "info");
	};

	return {
		toasts,
		show,
		remove,
		success,
		error,
		warning,
		info,
	};
};
