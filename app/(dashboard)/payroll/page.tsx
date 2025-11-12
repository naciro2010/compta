'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserPlus, FileText, Download } from 'lucide-react'
import { usePayrollStore } from '@/store/payroll'

export default function PayrollPage() {
  const { employees, payslips, cnssDeclarations, getActiveEmployees, getPayslipsByPeriod } = usePayrollStore()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')

  const activeEmployees = getActiveEmployees()
  const currentDate = new Date()
  const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const periodPayslips = selectedPeriod ? getPayslipsByPeriod(selectedPeriod) : getPayslipsByPeriod(currentPeriod)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      VALIDATED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
    }
    const labels = {
      DRAFT: 'Brouillon',
      VALIDATED: 'Validé',
      PAID: 'Payé',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Paie</h1>
          <p className="text-claude-text-muted mt-2">
            Gestion des salaires et déclarations CNSS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un employé
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Nouveau bulletin
          </Button>
        </div>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-claude-text-muted">Employés actifs</div>
            <div className="text-2xl font-bold text-claude-text">{activeEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-claude-text-muted">Bulletins ce mois</div>
            <div className="text-2xl font-bold text-claude-text">{periodPayslips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-claude-text-muted">Masse salariale</div>
            <div className="text-2xl font-bold text-claude-text">
              {formatAmount(periodPayslips.reduce((sum, ps) => sum + ps.grossSalary, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-claude-text-muted">CNSS total</div>
            <div className="text-2xl font-bold text-claude-text">
              {formatAmount(
                periodPayslips.reduce(
                  (sum, ps) => sum + ps.cnssEmployeeContribution + ps.cnssEmployerContribution,
                  0
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employés */}
      <Card>
        <CardHeader>
          <CardTitle>Employés actifs</CardTitle>
          <CardDescription>Liste des employés en activité</CardDescription>
        </CardHeader>
        <CardContent>
          {activeEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-claude-text-muted">Aucun employé enregistré</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-claude-border">
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Nom complet</th>
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">CIN</th>
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">N° CNSS</th>
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Poste</th>
                    <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Salaire de base</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-claude-border hover:bg-claude-surface">
                      <td className="p-3 text-sm text-claude-text">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="p-3 text-sm text-claude-text-muted">{emp.cin}</td>
                      <td className="p-3 text-sm text-claude-text-muted">{emp.cnssNumber}</td>
                      <td className="p-3 text-sm text-claude-text">{emp.position}</td>
                      <td className="p-3 text-sm text-right text-claude-text font-medium">
                        {formatAmount(emp.baseSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulletins de paie */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulletins de paie</CardTitle>
              <CardDescription>Bulletins du mois en cours</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {periodPayslips.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-claude-text-muted">Aucun bulletin pour cette période</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-claude-border">
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Employé</th>
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Période</th>
                    <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Salaire brut</th>
                    <th className="text-right p-3 text-sm font-medium text-claude-text-muted">CNSS</th>
                    <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Net à payer</th>
                    <th className="text-center p-3 text-sm font-medium text-claude-text-muted">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {periodPayslips.map((ps) => {
                    const employee = employees.find((e) => e.id === ps.employeeId)
                    return (
                      <tr key={ps.id} className="border-b border-claude-border hover:bg-claude-surface">
                        <td className="p-3 text-sm text-claude-text">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-claude-text-muted">{ps.period}</td>
                        <td className="p-3 text-sm text-right text-claude-text">
                          {formatAmount(ps.grossSalary)}
                        </td>
                        <td className="p-3 text-sm text-right text-claude-text-muted">
                          {formatAmount(ps.cnssEmployeeContribution)}
                        </td>
                        <td className="p-3 text-sm text-right text-claude-text font-medium">
                          {formatAmount(ps.netSalary)}
                        </td>
                        <td className="p-3 text-center">{getStatusBadge(ps.status)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Déclarations CNSS */}
      <Card>
        <CardHeader>
          <CardTitle>Déclarations CNSS</CardTitle>
          <CardDescription>Déclarations trimestrielles</CardDescription>
        </CardHeader>
        <CardContent>
          {cnssDeclarations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-claude-text-muted">Aucune déclaration CNSS</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cnssDeclarations.slice(0, 5).map((decl) => (
                <div
                  key={decl.id}
                  className="flex items-center justify-between p-4 border border-claude-border rounded-lg hover:bg-claude-surface"
                >
                  <div>
                    <div className="font-medium text-claude-text">{decl.period}</div>
                    <div className="text-sm text-claude-text-muted">
                      {decl.totalEmployees} employés - {formatAmount(decl.totalCNSS)}
                    </div>
                  </div>
                  <div>{getStatusBadge(decl.status)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
