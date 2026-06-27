import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Wraps the Supabase Admin API (service-role). Only used for privileged
 * operations like inviting users. If SUPABASE_SERVICE_ROLE_KEY is not set the
 * service stays dormant and privileged calls throw a clear 503.
 */
@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private readonly client: SupabaseClient | null;
  private readonly bucket: string | undefined;

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = config.get<string>('DOCUMENTS_BUCKET');
    if (url && key) {
      this.client = createClient(url, key, { auth: { persistSession: false } });
      this.logger.log('Supabase admin client ready (invites + storage enabled)');
    } else {
      this.client = null;
      this.logger.warn('SUPABASE_SERVICE_ROLE_KEY not set — user invites + uploads disabled');
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  get isStorageConfigured(): boolean {
    return this.client !== null && Boolean(this.bucket);
  }

  private requireStorage(): { client: SupabaseClient; bucket: string } {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException(
        'File storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and DOCUMENTS_BUCKET on the API.',
      );
    }
    return { client: this.client, bucket: this.bucket };
  }

  /** A short-lived signed URL the browser can upload a file to. */
  async createSignedUploadUrl(path: string): Promise<{ bucket: string; path: string; token: string }> {
    const { client, bucket } = this.requireStorage();
    const { data, error } = await client.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) {
      throw new ServiceUnavailableException(error?.message ?? 'Could not create upload URL');
    }
    return { bucket, path: data.path, token: data.token };
  }

  /** A short-lived signed URL to download/view a stored file. */
  async createSignedDownloadUrl(path: string, expiresIn = 3600): Promise<string> {
    const { client, bucket } = this.requireStorage();
    const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error || !data) {
      throw new ServiceUnavailableException(error?.message ?? 'Could not create download URL');
    }
    return data.signedUrl;
  }

  private require(): SupabaseClient {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'User invites are not configured. Set SUPABASE_SERVICE_ROLE_KEY on the API.',
      );
    }
    return this.client;
  }

  /** Invite a new user by email. Returns the new auth user id. */
  async inviteByEmail(email: string): Promise<string> {
    const client = this.require();
    const { data, error } = await client.auth.admin.inviteUserByEmail(email);
    if (error || !data.user) {
      throw new ServiceUnavailableException(error?.message ?? 'Invite failed');
    }
    return data.user.id;
  }
}
