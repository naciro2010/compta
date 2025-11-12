/**
 * Adaptateur de base pour les intégrations avec systèmes comptables externes
 * Définit l'interface commune pour tous les adaptateurs
 */

import { SyncEntity } from '@/store/integrations';

export interface IntegrationCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  companyId?: string;
  tenantId?: string;
  realm?: string;
  baseUrl?: string;
}

export interface SyncResult {
  success: boolean;
  records: number;
  created: number;
  updated: number;
  deleted: number;
  errors: Array<{ id?: string; error: string }>;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}

/**
 * Interface de base pour tous les adaptateurs d'intégration
 */
export abstract class BaseIntegrationAdapter {
  protected credentials: IntegrationCredentials;
  protected baseUrl: string;

  constructor(credentials: IntegrationCredentials, baseUrl: string) {
    this.credentials = credentials;
    this.baseUrl = baseUrl;
  }

  /**
   * Tester la connexion à l'API
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Rafraîchir le token OAuth2 si nécessaire
   */
  async refreshToken(): Promise<void> {
    throw new Error('OAuth2 not implemented for this provider');
  }

  /**
   * Importer des données depuis le système externe
   */
  abstract importEntity(entity: SyncEntity): Promise<SyncResult>;

  /**
   * Exporter des données vers le système externe
   */
  abstract exportEntity(entity: SyncEntity): Promise<SyncResult>;

  /**
   * Obtenir la liste des entités supportées
   */
  abstract getSupportedEntities(): SyncEntity[];

  /**
   * Helper: Faire une requête HTTP avec authentification
   */
  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Ajouter l'authentification selon le type
    if (this.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
    } else if (this.credentials.accessToken) {
      headers['Authorization'] = `Bearer ${this.credentials.accessToken}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  /**
   * Helper: Transformer les données de MizanPro vers le format externe
   */
  protected abstract transformToExternal(entity: SyncEntity, data: any): any;

  /**
   * Helper: Transformer les données du format externe vers MizanPro
   */
  protected abstract transformFromExternal(entity: SyncEntity, data: any): any;
}
