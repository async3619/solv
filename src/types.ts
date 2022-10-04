import { BaseProvider } from "./providers/base";

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