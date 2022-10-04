export class TestCaseFailedError extends Error {
    public constructor(
        public readonly testCaseIndex: number,
        public readonly result: [string, string],
        customMessage: string | undefined,
        isCustom: boolean,
    ) {
        super(
            customMessage || `Output was not matched with ${isCustom ? "custom " : ""}test case #${testCaseIndex + 1}`,
        );
    }
}
