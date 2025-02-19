import { Form, FormResponse, Question } from "../index";

let form: Form;

function findGetParameter() {
    var result = {},
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            // @ts-ignore
            result[tmp[0]] = decodeURIComponent(tmp[1]);
        });
    return result;
}

function init(): void {
    const params: { id?: string, mode?: 'builder' | 'response' | 'response-review' } = findGetParameter();

    const container = document.getElementById(`form-${params.mode || 'builder'}`) as HTMLElement;
    if (params.id && params.mode) {
        const formsKey = 'forms'
        const formsData = localStorage.getItem(formsKey);
        const forms: Form[] = JSON.parse(formsData || '[]');
        const existingForm = forms.filter(form => form.id === params.id)[0];
        form = existingForm;
        if (params.mode === "builder") {
            generateQuestionHTML(existingForm, 'questions')
            container.classList.remove('hidden');
        } else if (params.mode === "response") {
            viewForm();
            container.classList.remove('hidden');
        } else if (params.mode === "response-review") {
            const responseKey = form.id
            const responseData = localStorage.getItem(responseKey);
            const formResponses: FormResponse[] = JSON.parse(responseData || '[]');
            formResponses.forEach((formResponse, index) => viewFormResponses(formResponse.responses, index));
            container.classList.remove('hidden');
        }
    } else {
        form = {
            id: crypto.randomUUID(),
            published: false,
            title: 'Untitled form',
            questions: []
        };
        container.classList.remove('hidden');
    }
    const formTitleElement = document.getElementById('formTitle') as HTMLInputElement;
    formTitleElement.value = form.title
}

init();

function formTitleChange(value: string): void {
    form.title = value
}

function addQuestion(type: 'text' | 'choice' | 'checkbox'): void {
    const questionData: Question = {
        type,
        label: '',
    }
    form.questions.push(questionData);
    generateQuestionHTML(form, 'questions');
}

function generateQuestionHTML(form: Form, mode: 'questions' | 'preview' | 'response' | 'response-review', responses?: string[]): void {
    const questionsContainer = document.getElementById(`${mode}-container`);
    if (!questionsContainer) return;
    if (mode !== 'response-review') questionsContainer.innerHTML = '';

    if (mode === 'questions') {
        form.questions.forEach((question, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            questionBlock.draggable = true;
            questionBlock.dataset.index = index.toString();

            // Add drag event listeners
            questionBlock.addEventListener('dragstart', handleDragStart);
            questionBlock.addEventListener('dragover', handleDragOver);
            questionBlock.addEventListener('drop', handleDrop);
            questionBlock.addEventListener('dragenter', handleDragEnter);
            questionBlock.addEventListener('dragleave', handleDragLeave);

            // Add drag handle
            const dragHandle = document.createElement('div');
            dragHandle.className = 'drag-handle';
            dragHandle.innerHTML = '⋮⋮';
            dragHandle.style.cursor = 'move';
            dragHandle.style.padding = '5px';
            questionBlock.appendChild(dragHandle);

            // Create controls container for delete button and type selector
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'controls-container';

            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                form.questions.splice(index, 1);
                generateQuestionHTML(form, 'questions');
            };

            // Question type selector
            const typeSelect = document.createElement('select');
            typeSelect.className = 'question-type-select';
            ['text', 'choice', 'checkbox'].forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                option.selected = question.type === type;
                typeSelect.appendChild(option);
            });
            typeSelect.onchange = (event) => {
                const target = event.target as HTMLSelectElement;
                form.questions[index].type = target.value as 'text' | 'choice' | 'checkbox';
                if (['choice', 'checkbox'].includes(target.value)) {
                    form.questions[index].options = form.questions[index].options || ['Option 1'];
                } else {
                    delete form.questions[index].options;
                }
                generateQuestionHTML(form, 'questions');
            };

            // Add controls to container
            controlsContainer.appendChild(deleteButton);
            controlsContainer.appendChild(typeSelect);
            questionBlock.appendChild(controlsContainer);

            // Question input
            const questionInput = document.createElement('input');
            questionInput.type = 'text';
            questionInput.placeholder = 'Enter your question';
            questionInput.value = question.label;
            questionInput.className = 'question-input';
            questionInput.onchange = (event) => {
                const target = event.target as HTMLInputElement;
                form.questions[index].label = target.value;
            };

            questionBlock.appendChild(questionInput);

            // Options container for choice/checkbox
            if (['choice', 'checkbox'].includes(question.type)) {
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'options-container';
                addOption(optionsContainer, question)

                const addOptionButton = document.createElement('button');
                addOptionButton.textContent = 'Add Option';
                addOptionButton.onclick = () => {
                    question.options = question.options || [];
                    question.options.push(`Option ${question.options.length + 1}`);
                    generateQuestionHTML(form, 'questions');
                };
                optionsContainer.appendChild(addOptionButton);
                questionBlock.appendChild(optionsContainer);
            } else {
                const questionAnswer = document.createElement('input');
                questionAnswer.readOnly = true
                questionAnswer.type = 'text';
                questionAnswer.className = 'question-answer';
                questionAnswer.placeholder = 'Enter your answer';
                questionBlock.appendChild(questionAnswer);
            }

            questionsContainer.appendChild(questionBlock);
        });
    } else {
        const formElement = document.createElement('form');
        formElement.id = mode + '-form';

        form.questions.forEach((question, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';

            const label = document.createElement('label');
            label.textContent = question.label;
            questionBlock.appendChild(label);

            switch (question.type) {
                case 'text':
                    const input = document.createElement('input');
                    input.className = 'question-input';
                    input.type = 'text';
                    input.name = `question_${index}`;
                    input.required = true;
                    if (mode === 'response-review' && responses) {
                        input.value = responses[index] || '';
                        input.readOnly = true;
                    }
                    questionBlock.appendChild(input);
                    break;

                case 'choice':
                    question.options?.forEach((option, optionIndex) => {
                        const radioDiv = document.createElement('div');
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = `question_${index}`;
                        radio.value = option;
                        radio.required = true;
                        if (mode === 'response-review') {
                            radio.disabled = true;
                            radio.checked = option === responses?.[index];
                        }

                        const optionLabel = document.createElement('label');
                        optionLabel.textContent = option;

                        radioDiv.appendChild(radio);
                        radioDiv.appendChild(optionLabel);
                        questionBlock.appendChild(radioDiv);
                    });
                    break;

                case 'checkbox':
                    question.options?.forEach((option, optionIndex) => {
                        const checkDiv = document.createElement('div');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = `question_${index}`;
                        checkbox.value = option;
                        if (mode === 'response-review') {
                            checkbox.disabled = true;
                            // Handle array of responses for checkboxes
                            const responseArray = Array.isArray(responses?.[index])
                                ? responses[index]
                                : [];
                            checkbox.checked = responseArray.includes(option);
                        }

                        const optionLabel = document.createElement('label');
                        optionLabel.textContent = option;

                        checkDiv.appendChild(checkbox);
                        checkDiv.appendChild(optionLabel);
                        questionBlock.appendChild(checkDiv);
                    });
                    break;
            }

            formElement.appendChild(questionBlock);
        });

        questionsContainer.appendChild(formElement);
    }
}

function addOption(container: HTMLDivElement, question: Question): void {
    question.options?.forEach((option, optionIndex) => {
        const optionDiv = document.createElement('div');
        optionDiv.style.display = 'flex';
        optionDiv.style.gap = '10px';
        optionDiv.style.marginBottom = '10px';

        const optionInput = document.createElement('input');
        optionInput.className = 'option-input';
        optionInput.type = 'text';
        optionInput.value = option;
        optionInput.placeholder = 'Enter option';
        optionInput.style.flex = '1';
        optionInput.onchange = (event) => {
            const target = event.target as HTMLInputElement;
            if (question.options) {
                question.options[optionIndex] = target.value;
            }
        };

        const deleteOption = document.createElement('button');
        deleteOption.textContent = 'Delete Option';
        deleteOption.onclick = () => {
            if (question.options && question.options.length > 1) {
                question.options.splice(optionIndex, 1);
                generateQuestionHTML(form, 'questions');
            }
        };

        optionDiv.appendChild(optionInput);
        optionDiv.appendChild(deleteOption);
        container.appendChild(optionDiv);
    });
}

function previewForm(): void {
    const formBuilder = document.querySelector('.form-builder') as HTMLElement;
    const formPreview = document.getElementById('form-preview') as HTMLElement;
    const previewContainer = document.getElementById('preview-container') as HTMLElement;
    // Generate preview
    previewContainer.innerHTML = `<h1>${form.title}</h1>`;
    generateQuestionHTML(form, 'preview');

    formBuilder.classList.add('hidden');
    formPreview.classList.remove('hidden');
}

function viewForm(): void {
    const responseContainer = document.getElementById('response-container') as HTMLElement;
    // Generate preview
    responseContainer.innerHTML = `<h1>${form.title}</h1>`;
    generateQuestionHTML(form, 'response');
}

function viewFormResponses(responses: string[], index: number): void {
    const responseContainer = document.getElementById('response-review-container') as HTMLElement;

    const formTitleElement = document.createElement('h1');
    formTitleElement.innerHTML = `${form.title} - Response ${index}`;
    responseContainer.appendChild(formTitleElement);
    generateQuestionHTML(form, 'response-review', responses)
}

function backToEdit(): void {
    const formBuilder = document.querySelector('.form-builder') as HTMLElement;
    const formPreview = document.getElementById('form-preview') as HTMLElement;

    formBuilder.classList.remove('hidden');
    formPreview.classList.add('hidden');
}

function saveForm(): void {
    const formsKey = 'forms'
    const formsData = localStorage.getItem(formsKey);
    const forms: Form[] = JSON.parse(formsData || '[]');
    if (forms && forms.length > 0) {
        const filteredForms = forms.filter(existingForm => existingForm.id !== form.id)
        localStorage.setItem(formsKey, JSON.stringify([...filteredForms, form]));
    } else {
        localStorage.setItem(formsKey, JSON.stringify([form]));
    }
    alert('Form save successfully');
}

function publishForm(): void {
    form.published = true;
    saveForm();
    location.href = `/form/?id=${form.id}&mode=response`;
}

function submitResponse(): void {
    const response: FormResponse = {
        id: crypto.randomUUID(),
        formId: form.id,
        responses: []
    }

    // Group inputs by question (using name attribute)
    const questionGroups = new Map<string, HTMLInputElement[]>();

    for (let i = 0; i < document.forms[0].length; i++) {
        const input = document.forms[0][i] as HTMLInputElement;
        const name = input.name;
        if (!questionGroups.has(name)) {
            questionGroups.set(name, []);
        }
        questionGroups.get(name)?.push(input);
    }

    // Process each question group
    questionGroups.forEach((inputs, name) => {
        const firstInput = inputs[0];

        if (firstInput.type === 'text') {
            response.responses.push(firstInput.value || ''); // Empty string if no input
        }
        else if (firstInput.type === 'radio') {
            const checkedRadio = inputs.find(input => input.checked);
            response.responses.push(checkedRadio ? checkedRadio.value : ''); // Empty string if none selected
        }
        else if (firstInput.type === 'checkbox') {
            const checkedBoxes = inputs.filter(input => input.checked).map(input => input.value);
            response.responses.push(checkedBoxes.length > 0 ? checkedBoxes : ''); // Empty string if none selected
        }
    });

    const responseKey = form.id;
    const responseData = localStorage.getItem(responseKey);
    const responses = JSON.parse(responseData || '[]');
    if (responses && responses.length > 0) {
        localStorage.setItem(responseKey, JSON.stringify([...responses, response]));
    } else {
        localStorage.setItem(responseKey, JSON.stringify([response]));
    }
}

let draggedItem: HTMLElement | null = null;

function handleDragStart(e: DragEvent) {
    const target = e.target as HTMLElement;
    draggedItem = target;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    }
    target.style.opacity = '0.5';
}

function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
}

function handleDragEnter(e: DragEvent) {
    const target = e.target as HTMLElement;
    target.closest('.question-block')?.classList.add('drag-over');
}

function handleDragLeave(e: DragEvent) {
    const target = e.target as HTMLElement;
    target.closest('.question-block')?.classList.remove('drag-over');
}

function handleDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const questionBlock = target.closest('.question-block');

    if (questionBlock && draggedItem && questionBlock !== draggedItem) {
        const fromIndex = parseInt(draggedItem.dataset.index || '0');
        const toIndex = parseInt(questionBlock.dataset.index || '0');

        // Reorder the questions array
        const [movedQuestion] = form.questions.splice(fromIndex, 1);
        form.questions.splice(toIndex, 0, movedQuestion);

        // Regenerate the HTML to reflect the new order
        generateQuestionHTML(form, 'questions');
    }

    questionBlock?.classList.remove('drag-over');
    if (draggedItem) {
        draggedItem.style.opacity = '1';
    }
    draggedItem = null;
}