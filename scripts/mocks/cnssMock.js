export function exportCnssCsv(payroll) {
  const headers = ['ID', 'Nom', 'Poste', 'CNSS', 'Période', 'Brut', 'Retenues', 'Avantages', 'Net'];
  const rows = payroll.map((entry) => {
    const retenues = Object.values(entry.retenues || {}).reduce((acc, val) => acc + Number(val), 0);
    const avantages = Object.values(entry.avantages || {}).reduce((acc, val) => acc + Number(val), 0);
    const net = entry.salaireBrut - retenues + avantages;
    return [
      entry.id,
      entry.nom,
      entry.poste,
      entry.cnss,
      entry.periode,
      entry.salaireBrut,
      retenues,
      avantages,
      net,
    ].join(';');
  });
  const csv = [headers.join(';'), ...rows].join('\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CNSS-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
