// app/api/backup/list/route.js
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const files = fs.readdirSync(backupsDir);
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    return NextResponse.json({
      success: true,
      data: backups
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
