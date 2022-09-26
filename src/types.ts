export type InputType = Record<string, string> | string;

export interface Challenge {
    title: string;
    description?: string;
    inputDescription?: string;
    outputDescription?: string;
    input: InputType[];
    output: string[];
}
