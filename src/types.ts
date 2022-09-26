export interface Challenge {
    title: string;
    description?: string;
    inputDescription?: string;
    outputDescription?: string;
    input: Array<Record<string, string> | string>;
    output: string[];
}
