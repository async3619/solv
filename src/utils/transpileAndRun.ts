import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import { node } from "execa";

import { getTranspiledPath } from "../utils/path";

export async function transpileAndRun(input: string, output: string, targetPath: string) {
    const fileContent = await fs.readFile(targetPath).then(res => res.toString());
    const transpiledContent = esbuild.transformSync(fileContent, {
        loader: "ts",
    });

    const targetFilePath = await getTranspiledPath();
    await fs.writeFile(targetFilePath, transpiledContent.code);

    const process = node(targetFilePath.replace(/\\/g, "/"), {
        input,
    });
    const result = await process;

    return {
        input,
        output,
        result: result.stdout,
    };
}
