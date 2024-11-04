import fs from 'fs';
import path from 'path';
import { logger } from '../logging/logger.js';

export class FileManager {
  constructor(basePath) {
    this.basePath = basePath;
    this.ensureDirectory(basePath);
  }

  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async writeFile(relativePath, data, isBinary = false) {
    const fullPath = path.join(this.basePath, relativePath);
    this.ensureDirectory(path.dirname(fullPath));
    
    try {
      if (isBinary) {
        await fs.promises.writeFile(fullPath, data);
      } else {
        await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2));
      }
      logger.info(`File saved: ${relativePath}`);
    } catch (error) {
      logger.error(`Error saving file ${relativePath}: ${error.message}`);
      throw error;
    }
  }

  async readFile(relativePath, isBinary = false) {
    const fullPath = path.join(this.basePath, relativePath);
    
    try {
      if (!fs.existsSync(fullPath)) {
        logger.warn(`File not found: ${relativePath}`);
        return null;
      }
      
      if (isBinary) {
        return await fs.promises.readFile(fullPath);
      }
      return JSON.parse(await fs.promises.readFile(fullPath, 'utf8'));
    } catch (error) {
      logger.error(`Error reading file ${relativePath}: ${error.message}`);
      throw error;
    }
  }

  listFiles() {
    const files = [];
    
    const readDirRecursive = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          readDirRecursive(fullPath);
        } else {
          files.push(path.relative(this.basePath, fullPath));
        }
      });
    };
    
    readDirRecursive(this.basePath);
    return files;
  }
}