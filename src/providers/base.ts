import { Challenge } from "../types";

export abstract class BaseProvider {
    public abstract checkUrl(url: string): boolean;
    public abstract retrieve(url: string): Promise<Challenge>;

    public getName(): string {
        return this.constructor.name.replace("Provider", "");
    }
}
