import { normalizeString } from "./normalizeString";

describe("normalizeString", () => {
    it("should normalizes given string as a string", async () => {
        expect(normalizeString("   123    ")).toBe("123");
    });

    it("should normalizes given string array as a string array", async () => {
        expect(normalizeString(["   123    ", "  456      "])).toStrictEqual(["123", "456"]);
    });
});
