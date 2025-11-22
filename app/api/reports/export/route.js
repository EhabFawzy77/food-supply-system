
// app/api/reports/export/route.js
export async function POST(request) {
  try {
    const body = await request.json();
    const { reportType, format, data } = body;

    if (format === 'excel') {
      // تصدير Excel
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=report-${Date.now()}.xlsx`
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'صيغة غير مدعومة' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
