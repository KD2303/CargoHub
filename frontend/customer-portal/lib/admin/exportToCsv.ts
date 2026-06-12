export function exportToCsv(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  if (!rows || rows.length === 0) return;

  // Build CSV header
  const header = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Build CSV body
  const body = rows.map(row => {
    return columns.map(col => {
      let cellData = row[col.key];
      // handle objects/arrays
      if (cellData !== null && cellData !== undefined && typeof cellData === 'object') {
        cellData = JSON.stringify(cellData);
      }
      // sanitize quotes
      const stringData = String(cellData || '').replace(/"/g, '""');
      return `"${stringData}"`;
    }).join(',');
  }).join('\n');

  const csv = `${header}\n${body}`;

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
