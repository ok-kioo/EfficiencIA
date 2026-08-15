import type { UserRecord } from "../entity/Auth";

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string | null;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  /* upsertGoogleUser(
    profile: GoogleProfile,
  ): Promise<{ user: UserRecord; isNew: boolean }>; */
  createEmailUser(input: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<UserRecord>;
  findCredentialsByEmail(
    email: string,
  ): Promise<(UserRecord & { password_hash: string | null }) | null>;
  findById(id: string): Promise<UserRecord | null>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
}