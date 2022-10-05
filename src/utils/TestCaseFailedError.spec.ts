import { TestCaseFailedError } from "./TestCaseFailedError";

describe("TestCaseFailedError", () => {
    it("should provides default error message if custom message was not provided", () => {
        const error = new TestCaseFailedError(0, ["", ""], undefined, false);
        expect(error.message).toBe("Output was not matched with test case #1");
    });

    it("should provides different message if custom flag is set", () => {
        const error = new TestCaseFailedError(0, ["", ""], undefined, true);
        expect(error.message).toBe("Output was not matched with custom test case #1");
    });
});
