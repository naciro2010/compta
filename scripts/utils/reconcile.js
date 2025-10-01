/**
 * Compute outstanding amount for a document.
 * @param {object} doc
 * @returns {number}
 */
export function docOutstanding(doc) {
  const total = doc.lines.reduce((acc, line) => acc + Number(line.qty) * Number(line.unitPrice) * (1 + Number(line.vatRate) / 100), 0);
  const paid = (doc.payments || []).reduce((acc, payment) => acc + Number(payment.amount || 0), 0);
  return Number((total - paid).toFixed(2));
}

function scoreMatch(bankEntry, doc) {
  const outstanding = docOutstanding(doc);
  const amount = Number(bankEntry.amount);
  const amountScore = Math.abs(Math.abs(amount) - Math.abs(outstanding)) < 5 ? 0.5 : 0;
  const dateDiff = Math.abs(new Date(bankEntry.date) - new Date(doc.date)) / (1000 * 60 * 60 * 24);
  const dateScore = dateDiff <= 5 ? 0.2 : 0;
  const label = `${bankEntry.label} ${bankEntry.ref}`.toLowerCase();
  const idScore = label.includes((doc.id || '').toLowerCase()) ? 0.3 : 0;
  return amountScore + dateScore + idScore;
}

/**
 * Auto reconcile bank entries against documents (invoices/purchases).
 * @param {Array} bankEntries
 * @param {Array} docs
 */
export function autoReconcile(bankEntries = [], docs = []) {
  const matches = [];
  bankEntries
    .filter((entry) => !entry.reconciled)
    .forEach((entry) => {
      let best = { score: 0, doc: null };
      docs.forEach((doc) => {
        if (doc.reconciled) return;
        const score = scoreMatch(entry, doc);
        if (score > best.score) {
          best = { score, doc };
        }
      });
      if (best.doc && best.score >= 0.7) {
        matches.push({ bankId: entry.id, docId: best.doc.id, score: Number(best.score.toFixed(2)) });
      }
    });
  return matches;
}

/**
 * Apply reconciliation to both bank entry and document.
 * @param {object} entry
 * @param {object} doc
 */
export function applyReconciliation(entry, doc) {
  entry.reconciled = true;
  entry.matchDocId = doc.id;
  doc.reconciled = true;
  doc.lettrageId = `LET-${entry.id}`;
  return { entry, doc };
}

/**
 * Undo reconciliation state.
 * @param {object} entry
 * @param {object} doc
 */
export function undoReconciliation(entry, doc) {
  delete entry.reconciled;
  delete entry.matchDocId;
  delete doc.reconciled;
  delete doc.lettrageId;
}
