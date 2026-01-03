import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OnboardingSchema } from "./schema";

type OnboardingState = Partial<OnboardingSchema> & {
	setData: (data: Partial<OnboardingSchema>) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set) => ({
			setData: (data) => set(data),
		}),
		{
			name: "onboarding-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
