export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CodeSnippet = {
  __typename?: 'CodeSnippet';
  code: Scalars['String'];
  lang: Scalars['String'];
  langSlug: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  question?: Maybe<Question>;
};


export type QueryQuestionArgs = {
  titleSlug: Scalars['String'];
};

export type Question = {
  __typename?: 'Question';
  codeSnippets: Array<CodeSnippet>;
  content: Scalars['String'];
  exampleTestcaseList: Array<Scalars['String']>;
  metaData: Scalars['String'];
  questionId: Scalars['String'];
  questionTitle: Scalars['String'];
};

export type LeetCodeQuestionQueryVariables = Exact<{
  titleSlug: Scalars['String'];
}>;


export type LeetCodeQuestionQuery = { __typename?: 'Query', question?: { __typename?: 'Question', questionId: string, questionTitle: string, exampleTestcaseList: Array<string>, content: string, metaData: string, codeSnippets: Array<{ __typename?: 'CodeSnippet', lang: string, langSlug: string, code: string }> } | null };
