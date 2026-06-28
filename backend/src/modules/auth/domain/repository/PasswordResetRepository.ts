export interface PasswordResetRecord {
  id: string;
  user_id: string;
  used_at: string | null;
  expires_at: string;
}

export interface PasswordResetRepository {
  create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetRecord | null>;
  markUsed(id: string): Promise<void>;
}