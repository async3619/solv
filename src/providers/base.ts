import { Challenge } from "../types";
import fetch from "node-fetch";

export abstract class BaseProvider {
    public abstract checkUrl(url: string): boolean;
    public abstract retrieve(url: string): Promise<Challenge>;

    public getName(): string {
        return this.constructor.name.replace("Provider", "");
    }

    protected async fetch(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch (${response.status}) - ${response.statusText}`);
        }

        return response.text();
    }
}
