import { getProvider } from ".";

describe("Providers", () => {
    it("should returns suitable provider instance with valid url", () => {
        [
            "https://www.acmicpc.net/problem/1018",
            "https://school.programmers.co.kr/learn/courses/30/lessons/12937",
        ].forEach(url => {
            expect(() => getProvider(url)).not.toThrow();
        });
    });

    it("should throws an error with invalid url", () => {
        ["https://www.example.com"].forEach(url => {
            expect(() => getProvider(url)).toThrow();
        });
    });
});
