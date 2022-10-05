import * as moment from "moment";
import * as chalk from "chalk";

export type LogLevel = "info" | "error" | "warn";
type Func<A, R> = (arg: A) => R;

const colors: Record<LogLevel, Func<string, string>> = {
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
};

function log(content: string, level: LogLevel) {
    console.info(`${colors[level](`[${level}]`)}${chalk.green(`[${moment().format("HH:mm:ss.SSS")}]`)} ${content}`);
}

const logger: Record<LogLevel, Func<string, void>> = {
    info: content => log(content, "info"),
    error: content => log(content, "error"),
    warn: content => log(content, "warn"),
};

export default logger;
