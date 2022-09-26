import * as util from "util";
import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import { NodeVM } from "vm2";

import { InputType } from "../types";

export async function transpileAndRun(input: InputType, output: string, targetPath: string) {
    const fileContent = await fs.readFile(targetPath).then(res => res.toString());
    const transpiledContent = esbuild.transformSync(fileContent, {
        loader: "ts",
    });

    const outputBuffer: string[] = [];
    const handleConsoleMessage = (...data: any[]) => {
        outputBuffer.push(data.map(v => (typeof v === "string" ? v : util.inspect(v))).join(" "));
    };

    const vm = new NodeVM({ console: "redirect" });
    vm.on("console.log", handleConsoleMessage);
    vm.on("console.info", handleConsoleMessage);
    vm.on("console.warn", handleConsoleMessage);
    vm.run(transpiledContent.code);

    return {
        output,
        result: outputBuffer.join("\n"),
    };
}
