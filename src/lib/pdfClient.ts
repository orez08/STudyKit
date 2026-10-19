/**
 * Browser-side PDF text extraction using PDF.js
 * Extracts raw textual content page-by-page directly on the client,
 * keeping payloads lightweight (<200KB) and eliminating server-side binary uploads.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs-dist in modern browsers
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('Could not set PDF worker URL:', err);
  }
}

export interface ExtractedPdfData {
  text: string;
  pageCount: number;
  wordCount: number;
  isScanned: boolean;
  pages: { pageNumber: number; text: string }[];
}

/**
 * Extracts plain text from a File or ArrayBuffer in the browser.
 */
export async function extractTextFromPdf(
  fileOrBuffer: File | ArrayBuffer | Uint8Array,
  maxPages: number = 80
): Promise<ExtractedPdfData> {
  let uint8: Uint8Array;

  if (fileOrBuffer instanceof File) {
    uint8 = new Uint8Array(await fileOrBuffer.arrayBuffer());
  } else if (fileOrBuffer instanceof Uint8Array) {
    uint8 = fileOrBuffer;
  } else {
    uint8 = new Uint8Array(fileOrBuffer);
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const pagesToRead = Math.min(totalPages, maxPages);

    const pagesData: { pageNumber: number; text: string }[] = [];
    const fullTextChunks: string[] = [];

    for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageStrings: string[] = [];
        let lastY: number | null = null;

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          
          // Add line break if Y position changed significantly
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
            pageStrings.push('\n');
          } else if (pageStrings.length > 0 && !pageStrings[pageStrings.length - 1].endsWith(' ')) {
            pageStrings.push(' ');
          }

          pageStrings.push(item.str);
          lastY = item.transform[5];
        }

        const pageText = pageStrings.join('').replace(/\s+/g, ' ').trim();
        pagesData.push({ pageNumber: pageNum, text: pageText });
        if (pageText) {
          fullTextChunks.push(`[Page ${pageNum}]\n${pageText}`);
        }
      } catch (pageErr) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageErr);
      }
    }

    const combinedText = fullTextChunks.join('\n\n').trim();
    const wordCount = combinedText.split(/\s+/).filter(Boolean).length;
    const isScanned = wordCount < 30 && totalPages > 0;

    // Safety trim text to well under 6MB payload (max 150k characters ~ 30,000 words)
    const trimmedText = combinedText.length > 150000 
      ? combinedText.slice(0, 150000) + '\n\n...[Content truncated for processing size]' 
      : combinedText;

    return {
      text: trimmedText,
      pageCount: totalPages,
      wordCount,
      isScanned,
      pages: pagesData,
    };
  } catch (err: any) {
    console.error('Client-side PDF extraction failed:', err);
    throw new Error(
      'Unable to extract text from this PDF file in your browser. Please ensure the file is not password protected.'
    );
  }
}
