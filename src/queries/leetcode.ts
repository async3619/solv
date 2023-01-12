import gql from "graphql-tag";

export const LeetCodeQuestionDocument = gql`
    query leetCodeQuestion($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionId
            questionTitle
            exampleTestcaseList
            content
            metaData
            codeSnippets {
                lang
                langSlug
                code
            }
        }
    }
`;
