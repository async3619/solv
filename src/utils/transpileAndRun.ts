import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import { NodeVM } from "vm2";

import { InputType } from "../types";
import { BaseProvider } from "../providers/base";

export async function transpileAndRun(input: InputType, output: string, targetPath: string, provider: BaseProvider) {
    let fileContent = await fs.readFile(targetPath).then(res => res.toString());
    fileContent = provider.beforeExecute(fileContent, input);

    const transpiledContent = esbuild.transformSync(fileContent, {
        loader: "ts",
    });

    const outputBuffer: string[] = [];
    const handleConsoleMessage = (...data: any[]) => {
        outputBuffer.push(data.map(item => provider.serializeOutput(item)).join(" "));
    };

    const inputData = Array.isArray(input) ? input.map(item => JSON.parse(item)) : input;
    const vm = new NodeVM({
        console: "redirect",
        sandbox: {
            input: inputData,
        },
    });

    vm.on("console.log", handleConsoleMessage);
    vm.on("console.info", handleConsoleMessage);
    vm.on("console.warn", handleConsoleMessage);
    vm.run(transpiledContent.code);

    return outputBuffer.join("\n").replace(/\r\n/g, "\n");
}
