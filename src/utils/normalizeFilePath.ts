import * as path from "path";

export function normalizeFilePath(targetPath: string) {
    return path.isAbsolute(targetPath) ? targetPath : path.join(process.cwd(), targetPath);
}
