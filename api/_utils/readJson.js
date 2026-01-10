import { promises as fs } from 'fs';
import path from 'path';

export async function readJson(fileName) {
  const filePath = path.join(process.cwd(), 'api', 'data', fileName);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}
