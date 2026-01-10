import { promises as fs } from 'fs';
import path from 'path';

export async function writeJson(fileName, data) {
  const filePath = path.join(process.cwd(), 'api', 'data', fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return true;
}
