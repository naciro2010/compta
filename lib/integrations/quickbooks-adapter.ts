/**
 * Adaptateur pour QuickBooks Online API
 * Documentation: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice
 */

import { BaseIntegrationAdapter, SyncResult, ConnectionTestResult, IntegrationCredentials } from './base-adapter';
import { SyncEntity } from '@/store/integrations';

export class QuickBooksAdapter extends BaseIntegrationAdapter {
  constructor(credentials: IntegrationCredentials) {
    // QuickBooks Sandbox URL (remplacer par production URL pour prod)
    const baseUrl = credentials.baseUrl || 'https://sandbox-quickbooks.api.intuit.com/v3';
    super(credentials, baseUrl);
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      // Test avec un simple GET sur company info
      const companyInfo = await this.makeRequest(
        'GET',
        `/company/${this.credentials.realm}/companyinfo/${this.credentials.realm}`
      );

      return {
        success: true,
        message: `Connected to ${companyInfo.CompanyInfo?.CompanyName || 'QuickBooks'}`,
        details: companyInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async refreshToken(): Promise<void> {
    // QuickBooks OAuth2 token refresh
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.credentials.apiKey}:${this.credentials.apiSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.credentials.accessToken = data.access_token;
    this.credentials.refreshToken = data.refresh_token;
  }

  async importEntity(entity: SyncEntity): Promise<SyncResult> {
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
          return await this.importCustomers();
        case 'PRODUCTS':
          return await this.importItems();
        default:
          result.errors.push({ error: `Entity ${entity} not supported for import` });
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

    try {
      switch (entity) {
        case 'INVOICES':
          return await this.exportInvoices();
        case 'CUSTOMERS':
          return await this.exportCustomers();
        default:
          result.errors.push({ error: `Entity ${entity} not supported for export` });
          return result;
      }
    } catch (error) {
      result.errors.push({ error: error instanceof Error ? error.message : 'Export failed' });
      return result;
    }
  }

  getSupportedEntities(): SyncEntity[] {
    return ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'PAYMENTS', 'TAXES'];
  }

  // ========================================================================
  // Import spécifique
  // ========================================================================

  private async importInvoices(): Promise<SyncResult> {
    const response = await this.makeRequest(
      'GET',
      `/company/${this.credentials.realm}/query?query=SELECT * FROM Invoice MAXRESULTS 100`
    );

    const invoices = response.QueryResponse?.Invoice || [];

    // TODO: Importer les factures dans MizanPro
    // Utiliser useInvoicingStore().createInvoice() pour chaque facture

    return {
      success: true,
      records: invoices.length,
      created: invoices.length,
      updated: 0,
      deleted: 0,
      errors: [],
    };
  }

  private async importCustomers(): Promise<SyncResult> {
    const response = await this.makeRequest(
      'GET',
      `/company/${this.credentials.realm}/query?query=SELECT * FROM Customer MAXRESULTS 100`
    );

    const customers = response.QueryResponse?.Customer || [];

    // TODO: Importer les clients dans MizanPro
    // Utiliser useInvoicingStore().createThirdParty() pour chaque client

    return {
      success: true,
      records: customers.length,
      created: customers.length,
      updated: 0,
      deleted: 0,
      errors: [],
    };
  }

  private async importItems(): Promise<SyncResult> {
    const response = await this.makeRequest(
      'GET',
      `/company/${this.credentials.realm}/query?query=SELECT * FROM Item MAXRESULTS 100`
    );

    const items = response.QueryResponse?.Item || [];

    return {
      success: true,
      records: items.length,
      created: items.length,
      updated: 0,
      deleted: 0,
      errors: [],
    };
  }

  // ========================================================================
  // Export spécifique
  // ========================================================================

  private async exportInvoices(): Promise<SyncResult> {
    // TODO: Récupérer les factures depuis MizanPro
    // const invoices = useInvoicingStore.getState().invoices;

    const result: SyncResult = {
      success: true,
      records: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
    };

    // Pour chaque facture, créer dans QuickBooks
    // const qbInvoice = this.transformToExternal('INVOICES', invoice);
    // await this.makeRequest('POST', `/company/${this.credentials.realm}/invoice`, qbInvoice);

    return result;
  }

  private async exportCustomers(): Promise<SyncResult> {
    // TODO: Récupérer les clients depuis MizanPro

    const result: SyncResult = {
      success: true,
      records: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
    };

    return result;
  }

  // ========================================================================
  // Transformations
  // ========================================================================

  protected transformToExternal(entity: SyncEntity, data: any): any {
    switch (entity) {
      case 'INVOICES':
        // Transformer une facture MizanPro vers format QuickBooks
        return {
          CustomerRef: { value: data.thirdPartyId },
          Line: data.lines?.map((line: any) => ({
            Amount: line.totalAmount,
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: { value: line.productId },
              Qty: line.quantity,
              UnitPrice: line.unitPrice,
            },
          })),
          TxnDate: data.issueDate,
          DueDate: data.dueDate,
        };

      case 'CUSTOMERS':
        // Transformer un client MizanPro vers format QuickBooks
        return {
          DisplayName: data.name,
          PrimaryEmailAddr: { Address: data.email },
          PrimaryPhone: { FreeFormNumber: data.phone },
          BillAddr: {
            Line1: data.address,
            City: data.city,
            PostalCode: data.postalCode,
          },
        };

      default:
        return data;
    }
  }

  protected transformFromExternal(entity: SyncEntity, data: any): any {
    switch (entity) {
      case 'INVOICES':
        // Transformer une facture QuickBooks vers format MizanPro
        return {
          thirdPartyId: data.CustomerRef?.value,
          issueDate: new Date(data.TxnDate),
          dueDate: data.DueDate ? new Date(data.DueDate) : undefined,
          lines: data.Line?.map((line: any) => ({
            description: line.Description,
            quantity: line.SalesItemLineDetail?.Qty || 1,
            unitPrice: line.SalesItemLineDetail?.UnitPrice || 0,
            totalAmount: line.Amount,
          })),
          totalAmountInclTax: data.TotalAmt,
          status: data.Balance === 0 ? 'PAID' : 'SENT',
        };

      case 'CUSTOMERS':
        // Transformer un client QuickBooks vers format MizanPro
        return {
          name: data.DisplayName,
          email: data.PrimaryEmailAddr?.Address,
          phone: data.PrimaryPhone?.FreeFormNumber,
          address: data.BillAddr?.Line1,
          city: data.BillAddr?.City,
          postalCode: data.BillAddr?.PostalCode,
          type: 'CUSTOMER',
        };

      default:
        return data;
    }
  }
}
