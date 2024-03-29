import fetch from "node-fetch";

import { Challenge, InputType } from "../utils/types";
import { CachedChallenge } from "../utils/retrieveChallenge";

export abstract class BaseProvider {
    public abstract checkUrl(url: string): boolean;
    public abstract retrieve(url: string): Promise<Challenge>;
    public abstract getId(url: string): string | number;

    protected constructor(public readonly needJs: boolean) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public hydrateCache({ version, ...challenge }: CachedChallenge): Challenge {
        return {
            ...challenge,
            provider: this,
        };
    }

    public serializeOutput(outputItem: any): string {
        return typeof outputItem !== "string" ? JSON.stringify(outputItem) : outputItem;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public beforeExecute(sourceCode: string, input: InputType, challenge: Challenge): string {
        return sourceCode;
    }

    public getName(): string {
        return this.constructor.name.replace("Provider", "");
    }

    protected async fetch(url: string): Promise<string> {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch (${response.status}) - ${response.statusText}`);
        }

        return response.text();
    }
}
