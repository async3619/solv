import { BaseProvider } from "./providers/base";

export type InputType = string[] | string;

export interface Challenge {
    title: string;
    description?: string;
    inputDescription?: string;
    outputDescription?: string;
    input: InputType[];
    output: string[];
    provider: BaseProvider;
    initialCode?: string;
}
