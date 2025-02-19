export interface Question {
    type: 'text' | 'choice' | 'checkbox';
    label: string;
    options?: string[];
}

export interface FormResponse {
    id: string;
    formId: string;
    responses: Array<string | string[]>;
}

export interface Form {
    id: string,
    published: boolean,
    title: string,
    questions: Array<Question>

}