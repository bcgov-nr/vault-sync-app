import * as fs from 'fs';
import { injectable } from 'inversify';

@injectable()
/**
 * Utility class for reading files
 */
export default class FsUtil {
  public readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      // If the file is a symbolic link, resolve the actual path
      const realPath = fs.readlinkSync(filePath);
      return this.readActualFile(realPath, encoding);
    } else {
      // If it's not a symbolic link, read the file directly
      return this.readActualFile(filePath, encoding);
    }
  }

  private readActualFile(filePath: string, encoding: BufferEncoding): string {
    return fs.readFileSync(filePath, encoding);
  }
}