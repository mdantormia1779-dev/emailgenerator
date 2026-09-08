import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validation/resume.schema';
import { AppError } from '@/lib/errors';

const UPLOAD_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'uploads', 'resumes');

/**
 * Initializes the upload directory if it does not exist.
 */
export async function ensureUploadDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

/**
 * Validates and securely saves an uploaded resume file to disk.
 */
export async function saveResumeFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}> {
  // 1. Validate File Size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new AppError(`File size exceeds limit of 5MB (Received: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
  }

  // 2. Validate Extension
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError(`Invalid file extension "${ext}". Only .pdf and .docx are allowed.`);
  }

  // 3. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(`Invalid MIME type "${mimeType}". Only PDF and Word documents are permitted.`);
  }

  // 4. Validate Magic Numbers (Buffer header checks)
  if (ext === '.pdf') {
    const header = fileBuffer.slice(0, 4).toString();
    if (!header.startsWith('%PDF')) {
      throw new AppError('File header does not match a valid PDF document.');
    }
  } else if (ext === '.docx') {
    // DOCX is a zip file starting with PK\x03\x04
    const header = fileBuffer.slice(0, 4).toString('hex');
    if (header !== '504b0304') {
      throw new AppError('File header does not match a valid Word document.');
    }
  }

  // 5. Generate safe unique filename to prevent overwrites and directory traversal
  await ensureUploadDir();
  const safeRandomId = crypto.randomBytes(16).toString('hex');
  const sanitizedOriginal = path.basename(originalName).replace(/[^a-zA-Z0-9.-]/g, '_');
  const storedFileName = `${safeRandomId}_${sanitizedOriginal}`;
  const fullPath = path.join(UPLOAD_DIR, storedFileName);

  // Write file
  await fs.writeFile(fullPath, fileBuffer);

  return {
    fileName: storedFileName,
    originalName: sanitizedOriginal,
    filePath: fullPath,
    fileSize: fileBuffer.length,
    mimeType,
  };
}

/**
 * Reads a resume file from disk.
 */
export async function getResumeFileBuffer(filePath: string): Promise<Buffer> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    throw new AppError('Resume file not found on disk. It may have been moved or deleted.', 404);
  }
}

/**
 * Safely removes a resume file from disk.
 */
export async function deleteResumeFile(filePath: string): Promise<void> {
  try {
    // Ensure path is inside UPLOAD_DIR
    const resolved = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    if (!resolved.startsWith(resolvedUploadDir)) {
      throw new AppError('Invalid file path deletion attempt.', 403);
    }
    await fs.unlink(resolved);
  } catch (error) {
    console.warn(`Could not delete resume file at ${filePath}:`, error);
  }
}
