/**
 * Store Zustand pour la gestion de la paie
 * Gère les employés, bulletins de paie et déclarations CNSS
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  cin: string;
  cnssNumber: string;
  position: string;
  department?: string;
  hireDate: Date;
  baseSalary: number;
  isActive: boolean;
  bankAccount?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PayslipItem {
  type: 'EARNING' | 'DEDUCTION' | 'EMPLOYER_CHARGE';
  code: string;
  label: string;
  amount: number;
  isTaxable?: boolean;
  isCNSSBase?: boolean;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string; // Format: "2025-01" (année-mois)
  year: number;
  month: number;
  status: 'DRAFT' | 'VALIDATED' | 'PAID';

  // Salaire et éléments
  baseSalary: number;
  items: PayslipItem[];

  // Totaux
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  employerCharges: number;
  cnssEmployeeContribution: number;
  cnssEmployerContribution: number;

  // Paiement
  paymentDate?: Date;
  paymentMethod?: 'BANK_TRANSFER' | 'CHECK' | 'CASH';
  paymentReference?: string;

  // Métadonnées
  notes?: string;
  validatedBy?: string;
  validatedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CNSSDeclaration {
  id: string;
  period: string; // Format: "2025-Q1"
  year: number;
  quarter: number;
  status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED';

  // Données agrégées
  totalEmployees: number;
  totalSalaries: number;
  totalCNSSEmployee: number;
  totalCNSSEmployer: number;
  totalCNSS: number;

  // Soumission
  submittedAt?: Date;
  submittedBy?: string;
  validatedAt?: Date;
  declarationNumber?: string;

  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface PayrollStore {
  // État
  employees: Employee[];
  payslips: Payslip[];
  cnssDeclarations: CNSSDeclaration[];

  // Actions - Employés
  createEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  getActiveEmployees: () => Employee[];

  // Actions - Bulletins de paie
  createPayslip: (payslip: Omit<Payslip, 'id' | 'createdAt' | 'grossSalary' | 'totalEarnings' | 'totalDeductions' | 'netSalary' | 'employerCharges' | 'cnssEmployeeContribution' | 'cnssEmployerContribution'>) => Payslip;
  updatePayslip: (id: string, updates: Partial<Payslip>) => void;
  deletePayslip: (id: string) => void;
  getPayslip: (id: string) => Payslip | undefined;
  getPayslipsByEmployee: (employeeId: string) => Payslip[];
  getPayslipsByPeriod: (period: string) => Payslip[];
  validatePayslip: (id: string) => void;
  markPayslipAsPaid: (id: string, paymentDate: Date, paymentMethod: string, paymentReference?: string) => void;

  // Actions - CNSS
  createCNSSDeclaration: (year: number, quarter: number) => CNSSDeclaration;
  updateCNSSDeclaration: (id: string, updates: Partial<CNSSDeclaration>) => void;
  submitCNSSDeclaration: (id: string) => void;
  validateCNSSDeclaration: (id: string) => void;
  getCNSSDeclaration: (id: string) => CNSSDeclaration | undefined;
  getCNSSDeclarations: () => CNSSDeclaration[];

  // Helpers
  calculatePayslipTotals: (items: PayslipItem[], baseSalary: number) => {
    grossSalary: number;
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
    employerCharges: number;
    cnssEmployeeContribution: number;
    cnssEmployerContribution: number;
  };
}

// Taux CNSS Maroc (2025)
const CNSS_RATE_EMPLOYEE = 0.0448; // 4.48%
const CNSS_RATE_EMPLOYER = 0.162; // 16.2%
const CNSS_MAX_BASE = 6000; // Plafond CNSS

export const usePayrollStore = create<PayrollStore>()(
  persist(
    (set, get) => ({
      // État initial
      employees: [],
      payslips: [],
      cnssDeclarations: [],

      // ========================================================================
      // Gestion des employés
      // ========================================================================

      createEmployee: (employeeData) => {
        const employee: Employee = {
          ...employeeData,
          id: `employee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };

        set((state) => ({
          employees: [...state.employees, employee],
        }));

        return employee;
      },

      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates, updatedAt: new Date() } : emp
          ),
        }));
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        }));
      },

      getEmployee: (id) => {
        return get().employees.find((emp) => emp.id === id);
      },

      getActiveEmployees: () => {
        return get().employees.filter((emp) => emp.isActive);
      },

      // ========================================================================
      // Gestion des bulletins de paie
      // ========================================================================

      createPayslip: (payslipData) => {
        const totals = get().calculatePayslipTotals(payslipData.items, payslipData.baseSalary);

        const payslip: Payslip = {
          ...payslipData,
          ...totals,
          id: `payslip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };

        set((state) => ({
          payslips: [...state.payslips, payslip],
        }));

        return payslip;
      },

      updatePayslip: (id, updates) => {
        set((state) => ({
          payslips: state.payslips.map((ps) => {
            if (ps.id !== id) return ps;

            const updated = { ...ps, ...updates, updatedAt: new Date() };

            // Recalculer les totaux si les items ou le salaire de base changent
            if (updates.items || updates.baseSalary) {
              const totals = get().calculatePayslipTotals(
                updated.items,
                updated.baseSalary
              );
              return { ...updated, ...totals };
            }

            return updated;
          }),
        }));
      },

      deletePayslip: (id) => {
        set((state) => ({
          payslips: state.payslips.filter((ps) => ps.id !== id),
        }));
      },

      getPayslip: (id) => {
        return get().payslips.find((ps) => ps.id === id);
      },

      getPayslipsByEmployee: (employeeId) => {
        return get().payslips
          .filter((ps) => ps.employeeId === employeeId)
          .sort((a, b) => {
            const dateA = new Date(a.year, a.month - 1);
            const dateB = new Date(b.year, b.month - 1);
            return dateB.getTime() - dateA.getTime();
          });
      },

      getPayslipsByPeriod: (period) => {
        return get().payslips.filter((ps) => ps.period === period);
      },

      validatePayslip: (id) => {
        set((state) => ({
          payslips: state.payslips.map((ps) =>
            ps.id === id
              ? {
                  ...ps,
                  status: 'VALIDATED' as const,
                  validatedAt: new Date(),
                }
              : ps
          ),
        }));
      },

      markPayslipAsPaid: (id, paymentDate, paymentMethod, paymentReference) => {
        set((state) => ({
          payslips: state.payslips.map((ps) =>
            ps.id === id
              ? {
                  ...ps,
                  status: 'PAID' as const,
                  paymentDate,
                  paymentMethod: paymentMethod as any,
                  paymentReference,
                }
              : ps
          ),
        }));
      },

      // ========================================================================
      // Gestion CNSS
      // ========================================================================

      createCNSSDeclaration: (year, quarter) => {
        const period = `${year}-Q${quarter}`;

        // Calculer les mois du trimestre
        const startMonth = (quarter - 1) * 3 + 1;
        const endMonth = startMonth + 2;

        // Agréger les bulletins du trimestre
        const payslipsInPeriod = get().payslips.filter(
          (ps) =>
            ps.year === year &&
            ps.month >= startMonth &&
            ps.month <= endMonth &&
            ps.status !== 'DRAFT'
        );

        const totalSalaries = payslipsInPeriod.reduce(
          (sum, ps) => sum + ps.grossSalary,
          0
        );
        const totalCNSSEmployee = payslipsInPeriod.reduce(
          (sum, ps) => sum + ps.cnssEmployeeContribution,
          0
        );
        const totalCNSSEmployer = payslipsInPeriod.reduce(
          (sum, ps) => sum + ps.cnssEmployerContribution,
          0
        );

        const declaration: CNSSDeclaration = {
          id: `cnss-decl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          period,
          year,
          quarter,
          status: 'DRAFT',
          totalEmployees: new Set(payslipsInPeriod.map((ps) => ps.employeeId)).size,
          totalSalaries,
          totalCNSSEmployee,
          totalCNSSEmployer,
          totalCNSS: totalCNSSEmployee + totalCNSSEmployer,
          createdAt: new Date(),
        };

        set((state) => ({
          cnssDeclarations: [...state.cnssDeclarations, declaration],
        }));

        return declaration;
      },

      updateCNSSDeclaration: (id, updates) => {
        set((state) => ({
          cnssDeclarations: state.cnssDeclarations.map((decl) =>
            decl.id === id ? { ...decl, ...updates, updatedAt: new Date() } : decl
          ),
        }));
      },

      submitCNSSDeclaration: (id) => {
        set((state) => ({
          cnssDeclarations: state.cnssDeclarations.map((decl) =>
            decl.id === id
              ? {
                  ...decl,
                  status: 'SUBMITTED' as const,
                  submittedAt: new Date(),
                }
              : decl
          ),
        }));
      },

      validateCNSSDeclaration: (id) => {
        set((state) => ({
          cnssDeclarations: state.cnssDeclarations.map((decl) =>
            decl.id === id
              ? {
                  ...decl,
                  status: 'VALIDATED' as const,
                  validatedAt: new Date(),
                }
              : decl
          ),
        }));
      },

      getCNSSDeclaration: (id) => {
        return get().cnssDeclarations.find((decl) => decl.id === id);
      },

      getCNSSDeclarations: () => {
        return get().cnssDeclarations.sort((a, b) => {
          const dateA = new Date(a.year, a.quarter * 3);
          const dateB = new Date(b.year, b.quarter * 3);
          return dateB.getTime() - dateA.getTime();
        });
      },

      // ========================================================================
      // Helpers
      // ========================================================================

      calculatePayslipTotals: (items, baseSalary) => {
        const earnings = items
          .filter((item) => item.type === 'EARNING')
          .reduce((sum, item) => sum + item.amount, 0);

        const deductions = items
          .filter((item) => item.type === 'DEDUCTION')
          .reduce((sum, item) => sum + item.amount, 0);

        const employerCharges = items
          .filter((item) => item.type === 'EMPLOYER_CHARGE')
          .reduce((sum, item) => sum + item.amount, 0);

        const grossSalary = baseSalary + earnings;

        // Calculer CNSS sur le salaire brut plafonné
        const cnssBase = Math.min(grossSalary, CNSS_MAX_BASE);
        const cnssEmployeeContribution = cnssBase * CNSS_RATE_EMPLOYEE;
        const cnssEmployerContribution = cnssBase * CNSS_RATE_EMPLOYER;

        const totalDeductions = deductions + cnssEmployeeContribution;
        const totalEarnings = earnings;
        const netSalary = grossSalary - totalDeductions;

        return {
          grossSalary,
          totalEarnings,
          totalDeductions,
          netSalary,
          employerCharges: employerCharges + cnssEmployerContribution,
          cnssEmployeeContribution,
          cnssEmployerContribution,
        };
      },
    }),
    {
      name: 'mizanpro-payroll-storage',
    }
  )
);
