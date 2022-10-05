import * as chalk from "chalk";
import { Command } from "commander";

import { version, description, name } from "../../package.json";

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

export async function parseCommandLine() {
    const program = await new Command()
        .name(name)
        .description(description)
        .version(version)
        .argument("<url>", "Specify a website url to solve")
        .option("--source, -s <path>", "Specify source code path to watch")
        .option("--config, -c <path>", "Specify configuration file path")
        .option("--no-overwrite, -n", "Specify if program should not overwrite source code file")
        .parseAsync();

    const { S: source, C: configPath, N: noOverwrite } = program.opts();
    const [targetUrl] = program.args;

    return {
        source,
        configPath,
        noOverwrite,
        targetUrl,
    };
}
