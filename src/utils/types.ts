import { BaseProvider } from "src/providers/base";

export type InputType = string[] | string;

export interface Challenge {
    id: string | number;
    title: string;
    description?: string;
    inputDescription?: string;
    outputDescription?: string;
    input: InputType[];
    output: string[];
    needJs?: boolean;
    provider: BaseProvider;
    initialCode?: string;
}

export interface InputOutput {
    isCustom?: boolean;
    input: InputType;
    output: string;
}

interface ConfigCaseItem {
    provider: string;
    id: number | string;
    items: InputOutput[];
}

export interface Config {
    cases: ConfigCaseItem[];
}

export interface CommandLineArgs {
    source?: string;
    configPath?: string;
    noCache?: boolean;
    noOverwrite?: boolean;
    targetUrl: string;
}
