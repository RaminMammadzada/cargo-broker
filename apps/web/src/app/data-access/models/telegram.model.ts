export interface TelegramSettings {
  phoneNumber: string | null;
  chatId: string | null;
  lastSyncedAt: string | null;
  botTokenConfigured: boolean;
}
