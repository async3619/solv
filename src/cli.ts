import * as chalk from "chalk";

export function clearConsole() {
    process.stdout.write("\x1Bc");
}

export function drawLogo() {
    const ASCII_LOGO = `               __     
   _________  / /   __
  / ___/ __ \\/ / | / /
 (__  ) /_/ / /| |/ / 
/____/\\____/_/ |___/ ${chalk.italic.white("v0.1.0")}`;

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
