import { api } from "./api";
import type { User } from "../@types/user";

export const userService = {
  async upgradeToPremium(): Promise<User> {
    const { data } = await api.post<User>("/api/users/me/upgrade");
    return data;
  },
  async downgrade(): Promise<User> {
    const { data } = await api.post<User>("/api/users/me/downgrade");
    return data;
  },
  async completeOnboarding(): Promise<User> {
    const { data } = await api.post<User>("/api/users/me/onboarding/complete");
    return data;
  },
};
