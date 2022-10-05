import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import { NodeVM } from "vm2";

import { BaseProvider } from "../providers/base";

import logger from "./logger";
import { InputType } from "./types";

const replaceExt = require("replace-ext");

export async function transpileAndRun(
    input: InputType,
    output: string,
    targetPath: string,
    provider: BaseProvider,
): Promise<[string, string] | Error> {
    let fileContent = await fs.readFile(targetPath).then(res => res.toString());
    fileContent = provider.beforeExecute(fileContent, input);

    const transpiledContent = esbuild.transformSync(fileContent, {
        loader: "ts",
    });

    if (provider.needJs) {
        const transpiledFilePath = replaceExt(targetPath, ".js");
        await fs.writeFile(transpiledFilePath, transpiledContent.code);
    }

    const outputBuffer: string[] = [];
    const debugBuffer: string[] = [];
    const handleConsoleMessage =
        (targetBuffer: string[]) =>
        (...data: any[]) => {
            targetBuffer.push(data.map(item => provider.serializeOutput(item)).join(" "));
        };

    const inputData = Array.isArray(input) ? input.map(item => JSON.parse(item)) : input;
    const vm = new NodeVM({
        console: "redirect",
        sandbox: {
            input: inputData,
        },
        require: {
            builtin: ["readline", "events"],
        },
        env: {
            arguments: inputData,
        },
    });

    vm.on("console.log", handleConsoleMessage(outputBuffer));
    vm.on("console.warn", handleConsoleMessage(outputBuffer));
    vm.on("console.error", handleConsoleMessage(outputBuffer));
    vm.on("console.debug", handleConsoleMessage(debugBuffer));

    try {
        vm.run(transpiledContent.code);
    } catch (e) {
        if (!(e instanceof Error)) {
            logger.error("fatal error: " + e);
            process.exit();
        }

        return e;
    }

    return [outputBuffer.join("\n").replace(/\r\n/g, "\n"), debugBuffer.join("\n").replace(/\r\n/g, "\n")];
}
