import * as moment from "moment";
import * as chalk from "chalk";

export type LogLevel = "info" | "error" | "warn";
type Func<A extends any[], R> = (...arg: A) => R;

const colors: Record<LogLevel, Func<[string], string>> = {
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
};

function log(content: string, level: LogLevel, time: moment.Moment = moment()) {
    console.info(`${colors[level](`[${level}]`)}${chalk.green(`[${time.format("HH:mm:ss.SSS")}]`)} ${content}`);
}

type LoggerFn = (content: string, time?: moment.Moment) => void;
const logger: Record<LogLevel, LoggerFn> = {
    info: (content, time) => log(content, "info", time),
    error: (content, time) => log(content, "error", time),
    warn: (content, time) => log(content, "warn", time),
};

export default logger;
