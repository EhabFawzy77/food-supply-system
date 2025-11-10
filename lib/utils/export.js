
// lib/utils/export.js
// تصدير البيانات

export const exportUtils = {
  // تصدير JSON
  toJSON(data, filename = 'data') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.download(blob, `${filename}.json`);
  },

  // تصدير CSV
  toCSV(data, filename = 'data') {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.download(blob, `${filename}.csv`);
  },

  // تحميل ملف
  download(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
