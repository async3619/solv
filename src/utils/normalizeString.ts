import { InputType } from "./types";

export function normalizeString(input: string): string;
export function normalizeString(input: string[]): string[];
export function normalizeString(input: InputType): InputType;
export function normalizeString(input: string | string[]): string | string[] {
    return Array.isArray(input) ? input.map(s => s.trim()) : input.trim();
}
