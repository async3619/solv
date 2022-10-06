import * as chalk from "chalk";
import { Command } from "commander";

import { serialize } from "./serialize";
import { CommandLineArgs, InputType } from "./types";

import { version, description } from "../../package.json";

export function clearConsole() {
    process.stdout.write("\x1Bc");
}

export function drawLogo() {
    const ASCII_LOGO = `               __     
   _________  / /   __
  / ___/ __ \\/ / | / /
 (__  ) /_/ / /| |/ / 
/____/\\____/_/ |___/ ${chalk.italic.white(`v${version}`)}`;

    console.log(chalk.cyan(ASCII_LOGO));
}

export function breakLine(count = 1) {
    for (let i = 0; i < count; i++) {
        console.log();
    }
}

export function drawLine(length: number, char = "=") {
    console.log(new Array(length).fill(char).join(""));
}

export async function parseCommandLine(argv: string[]): Promise<CommandLineArgs> {
    const program = await new Command()
        .name("solv")
        .description(description)
        .version(version)
        .argument("<url>", "specify a website url to solve")
        .option("--source, -s <source>", "specify source code path to watch")
        .option("--config, -c <config>", "specify configuration file path")
        .option("--no-overwrite, -n", "specify if program should not overwrite source code file")
        .option("--no-cache, -w", "specify if program should not cache challenge information")
        .parseAsync(argv);

    const { S: source, C: configPath, N: noOverwrite, W: noCache } = program.opts();
    const [targetUrl] = program.args;

    return {
        source,
        configPath,
        noCache,
        noOverwrite,
        targetUrl,
    };
}

export function renderSection(title: string, content: InputType, chalkFunction?: (target: string) => string) {
    let contentText: string | null;
    if (Array.isArray(content)) {
        contentText = content.map(item => serialize(JSON.parse(item))).join(" ");
    } else {
        contentText = content;
    }

    console.info(title);
    drawLine(15);

    const actualContent = contentText || chalk.italic("(empty)");
    console.info(chalkFunction ? chalkFunction(actualContent) : actualContent);

    breakLine();
}

export function getVersion() {
    return version;
}
