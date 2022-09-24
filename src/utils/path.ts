import * as os from "os";
import * as path from "path";
import * as fs from "fs-extra";
import { v4 as generateUUID } from "uuid";

const INSTANCE_ID = generateUUID();

export async function getTranspiledPath() {
    const targetDirectory = path.join(os.homedir(), ".solv");

    await fs.ensureDir(targetDirectory);
    return path.join(targetDirectory, `${INSTANCE_ID}.js`);
}
