import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { log } from './vite';

const execPromise = promisify(exec);
const writeFilePromise = promisify(fs.writeFile);
const mkdirPromise = promisify(fs.mkdir);
const unlinkPromise = promisify(fs.unlink);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PYTHON_SCRIPT = path.join(process.cwd(), 'server', 'python', 'wrapper.py');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdirPromise(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Parse resume file using Python script
 * @param file Buffer containing file data
 * @param originalFileName Original filename
 * @returns Extracted text from resume
 */
export async function parseResume(file: Buffer, originalFileName: string): Promise<string> {
  await ensureUploadDir();
  
  // Create a temporary file
  const tmpFilename = `${Date.now()}_${originalFileName}`;
  const filePath = path.join(UPLOAD_DIR, tmpFilename);
  
  try {
    // Write the file to disk
    await writeFilePromise(filePath, file);
    
    log(`Converting resume file: ${filePath}`, 'pdf-parser');
    
    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python3 ${PYTHON_SCRIPT} convert ${filePath}`);
    
    if (stderr) {
      log(`Warning from Python script: ${stderr}`, 'pdf-parser');
    }
    
    // Parse the output - expecting JSON
    try {
      const result = JSON.parse(stdout);
      
      if (result.error) {
        throw new Error(`Python script error: ${result.error}`);
      }
      
      if (!result.text) {
        throw new Error('No text was extracted from the resume');
      }
      
      return result.text;
    } catch (parseError) {
      log(`Error parsing Python output: ${parseError}`, 'pdf-parser');
      log(`Raw output: ${stdout}`, 'pdf-parser');
      throw new Error('Failed to parse output from Python script');
    }
  } catch (error) {
    log(`Error in parseResume: ${error}`, 'pdf-parser');
    throw error;
  } finally {
    // Clean up temp file
    try {
      await unlinkPromise(filePath);
    } catch (cleanupError) {
      log(`Warning: Failed to clean up temp file ${filePath}: ${cleanupError}`, 'pdf-parser');
    }
  }
}