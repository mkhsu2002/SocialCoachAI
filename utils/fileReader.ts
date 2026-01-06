/**
 * 文件讀取工具
 * 支援讀取各種文件格式的內容
 */

/**
 * 讀取文字文件內容
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        resolve(text);
      } else {
        reject(new Error('無法讀取文件內容'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('讀取文件失敗'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 讀取文件內容（自動判斷格式）
 */
export async function readFileContent(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // 文字文件
  if (
    fileType.startsWith('text/') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.markdown') ||
    fileName.endsWith('.json')
  ) {
    return readTextFile(file);
  }
  
  // PDF 文件（需要用戶手動複製內容，或使用 PDF.js）
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    throw new Error('PDF 文件目前不支援自動讀取，請先將內容複製為文字後貼上');
  }
  
  // Word 文件
  if (
    fileType.includes('wordprocessingml') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    throw new Error('Word 文件目前不支援自動讀取，請先將內容複製為文字後貼上');
  }
  
  // 預設嘗試讀取為文字
  try {
    return readTextFile(file);
  } catch (error) {
    throw new Error('不支援的文件格式，請先將內容複製為文字後貼上');
  }
}

/**
 * 驗證文件大小（最大 5MB）
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 取得文件大小顯示文字
 */
export function getFileSizeText(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}

