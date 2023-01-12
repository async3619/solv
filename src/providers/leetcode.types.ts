export interface QuestionMetadata {
    name: string;
    params: Array<{
        name: string;
        type: string;
    }>;
    return: {
        type: string;
    };
}
