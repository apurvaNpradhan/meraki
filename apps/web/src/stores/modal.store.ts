import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const MODAL_TYPES = [
	"UPDATE_PASSWORD",
	"UPDATE_EMAIL",
	"FORGOT_PASSWORD",
	"DELETE_ACCOUNT",
	"NEW_WORKSPACE",
	"DELETE_WORKSPACE",
	"CREATE_TASK",
	"TASK_DETAIL",
	"CREATE_SPACE",
	"DELETE_SPACE",
	"CREATE_PROJECT",
] as const;

export type ModalType = (typeof MODAL_TYPES)[number];
export interface ModalInstance {
	id: string;
	type: ModalType;
	data?: Record<string, unknown>;
	title?: string;
	description?: string;
	modalSize?: "sm" | "md" | "lg" | "fullscreen";
	closeOnClickOutside?: boolean;
}

export type ModalConfig = Omit<ModalInstance, "id"> & {
	id?: string;
};

interface ModalStore {
	stack: ModalInstance[];
	open: (config: ModalConfig) => void;
	close: () => void;
	closeAll: () => void;
	replace: (config: ModalConfig) => void;
	update: (id: string, updates: Partial<Omit<ModalInstance, "id">>) => void;
}

export const useModalStore = create<ModalStore>()(
	devtools(
		(set, get) => ({
			stack: [],

			open: (config) => {
				const id =
					config.id || `${config.type}-${JSON.stringify(config.data || {})}`;
				const currentStack = get().stack;

				const index = currentStack.findIndex((m) => m.id === id);
				if (index !== -1) {
					const newStack = [...currentStack];
					const [item] = newStack.splice(index, 1);
					set({ stack: [...newStack, item] });
					return;
				}

				const newInstance: ModalInstance = {
					closeOnClickOutside: true,
					...config,
					id,
				};

				set((state) => ({
					stack: [...state.stack, newInstance],
				}));
			},

			close: () => {
				set((state) => ({
					stack: state.stack.slice(0, -1),
				}));
			},

			closeAll: () => set({ stack: [] }),

			replace: (config) => {
				const id =
					config.id || `${config.type}-${JSON.stringify(config.data || {})}`;
				const newInstance: ModalInstance = {
					closeOnClickOutside: true,
					...config,
					id,
				};

				set((state) => ({
					stack: [...state.stack.slice(0, -1), newInstance],
				}));
			},

			update: (id, updates) => {
				set((state) => ({
					stack: state.stack.map((m) =>
						m.id === id ? { ...m, ...updates } : m,
					),
				}));
			},
		}),
		{ name: "ModalStore" },
	),
);

export const useModal = () => {
	const stack = useModalStore((state) => state.stack);
	const top = stack[stack.length - 1];

	return {
		isOpen: stack.length > 0,
		stack,
		current: top,
		open: useModalStore((state) => state.open),
		close: useModalStore((state) => state.close),
		closeAll: useModalStore((state) => state.closeAll),
		replace: useModalStore((state) => state.replace),
		update: useModalStore((state) => state.update),
	};
};
