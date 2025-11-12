/**
 * Adaptateur pour Odoo ERP API
 * Documentation: https://www.odoo.com/documentation/16.0/developer/reference/external_api.html
 */

import { BaseIntegrationAdapter, SyncResult, ConnectionTestResult, IntegrationCredentials } from './base-adapter';
import { SyncEntity } from '@/store/integrations';

export class OdooAdapter extends BaseIntegrationAdapter {
  private database: string;
  private username: string;
  private password: string;
  private userId?: number;

  constructor(credentials: IntegrationCredentials) {
    const baseUrl = credentials.baseUrl || 'https://your-odoo-instance.com';
    super(credentials, baseUrl);

    this.database = credentials.companyId || 'odoo';
    this.username = credentials.apiKey || '';
    this.password = credentials.apiSecret || '';
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      // Authentifier et obtenir l'UID
      const uid = await this.authenticate();

      if (uid) {
        this.userId = uid;
        return {
          success: true,
          message: `Connected to Odoo as user ${this.username}`,
          details: { userId: uid, database: this.database },
        };
      }

      return {
        success: false,
        error: 'Authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  private async authenticate(): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/web/session/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            db: this.database,
            login: this.username,
            password: this.password,
          },
        }),
      });

      const data = await response.json();
      return data.result?.uid || null;
    } catch (error) {
      console.error('Odoo authentication failed:', error);
      return null;
    }
  }

  async importEntity(entity: SyncEntity): Promise<SyncResult> {
    if (!this.userId) {
      await this.authenticate();
    }

    const result: SyncResult = {
      success: false,
      records: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
    };

    try {
      switch (entity) {
        case 'INVOICES':
          return await this.importInvoices();
        case 'CUSTOMERS':
          return await this.importPartners('customer');
        case 'SUPPLIERS':
          return await this.importPartners('supplier');
        case 'PRODUCTS':
          return await this.importProducts();
        default:
          result.errors.push({ error: `Entity ${entity} not supported` });
          return result;
      }
    } catch (error) {
      result.errors.push({ error: error instanceof Error ? error.message : 'Import failed' });
      return result;
    }
  }

  async exportEntity(entity: SyncEntity): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      records: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
    };

    result.errors.push({ error: 'Export not yet implemented for Odoo' });
    return result;
  }

  getSupportedEntities(): SyncEntity[] {
    return ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'ACCOUNTS', 'ENTRIES'];
  }

  // ========================================================================
  // Import spécifique
  // ========================================================================

  private async importInvoices(): Promise<SyncResult> {
    const invoices = await this.searchRead('account.move', [
      ['move_type', '=', 'out_invoice'],
      ['state', '!=', 'cancel'],
    ], ['name', 'partner_id', 'invoice_date', 'amount_total', 'state']);

    return {
      success: true,
      records: invoices.length,
      created: invoices.length,
      updated: 0,
      deleted: 0,
      errors: [],
    };
  }

  private async importPartners(type: 'customer' | 'supplier'): Promise<SyncResult> {
    const domain = type === 'customer'
      ? [['customer_rank', '>', 0]]
      : [['supplier_rank', '>', 0]];

    const partners = await this.searchRead('res.partner', domain, [
      'name', 'email', 'phone', 'street', 'city', 'zip', 'vat',
    ]);

    return {
      success: true,
      records: partners.length,
      created: partners.length,
      updated: 0,
      deleted: 0,
      errors: [],
    };
  }

  private async importProducts(): Promise<SyncResult> {
    const products = await this.searchRead('product.product', [
      ['sale_ok', '=', true],
    ], ['name', 'default_code', 'list_price', 'type']);

    return {
      success: true,
      records: products.length,
      created: products.length,
      updated: 0,
      deleted: 0,
      errors: [],
    };
  }

  // ========================================================================
  // Helpers Odoo spécifiques
  // ========================================================================

  private async searchRead(model: string, domain: any[], fields: string[]): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/web/dataset/search_read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          model,
          domain,
          fields,
          limit: 100,
        },
      }),
    });

    const data = await response.json();
    return data.result?.records || [];
  }

  // ========================================================================
  // Transformations
  // ========================================================================

  protected transformToExternal(entity: SyncEntity, data: any): any {
    // Transformer depuis MizanPro vers Odoo
    switch (entity) {
      case 'INVOICES':
        return {
          partner_id: data.thirdPartyId,
          invoice_date: data.issueDate,
          invoice_line_ids: data.lines?.map((line: any) => [0, 0, {
            product_id: line.productId,
            quantity: line.quantity,
            price_unit: line.unitPrice,
          }]),
        };
      default:
        return data;
    }
  }

  protected transformFromExternal(entity: SyncEntity, data: any): any {
    // Transformer depuis Odoo vers MizanPro
    switch (entity) {
      case 'INVOICES':
        return {
          number: data.name,
          thirdPartyId: data.partner_id?.[0],
          issueDate: new Date(data.invoice_date),
          totalAmountInclTax: data.amount_total,
          status: data.state === 'posted' ? 'SENT' : 'DRAFT',
        };

      case 'CUSTOMERS':
      case 'SUPPLIERS':
        return {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.street,
          city: data.city,
          postalCode: data.zip,
          ice: data.vat,
          type: entity === 'CUSTOMERS' ? 'CUSTOMER' : 'SUPPLIER',
        };

      default:
        return data;
    }
  }
}
