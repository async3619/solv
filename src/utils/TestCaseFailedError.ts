export class TestCaseFailedError extends Error {
    public constructor(public readonly testCaseIndex: number, public readonly result: string, customMessage?: string) {
        super(customMessage || `Output was not matched with test case #${testCaseIndex + 1}`);
    }
}
