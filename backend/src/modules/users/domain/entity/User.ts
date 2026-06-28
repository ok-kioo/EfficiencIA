export type UserPlan = "free" | "premium";

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  plan: UserPlan;
  plan_updated_at: string | null;
  onboarded_at: string | null;
}
