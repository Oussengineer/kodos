import { create } from "zustand";

export const useDriverStore = create((set) => ({
  activeDeliveries: [],
  setActiveDeliveries: (deliveries) => set({ activeDeliveries: deliveries }),
}));
