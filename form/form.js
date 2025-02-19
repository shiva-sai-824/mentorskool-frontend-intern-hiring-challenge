"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var form;
function findGetParameter() {
    var result = {}, tmp = [];
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
function init() {
    var params = findGetParameter();
    var container = document.getElementById("form-".concat(params.mode || 'builder'));
    if (params.id && params.mode) {
        var formsKey = 'forms';
        var formsData = localStorage.getItem(formsKey);
        var forms = JSON.parse(formsData || '[]');
        var existingForm = forms.filter(function (form) { return form.id === params.id; })[0];
        form = existingForm;
        if (params.mode === "builder") {
            generateQuestionHTML(existingForm, 'questions');
            container.classList.remove('hidden');
        }
        else if (params.mode === "response") {
            viewForm();
            container.classList.remove('hidden');
        }
        else if (params.mode === "response-review") {
            var responseKey = form.id;
            var responseData = localStorage.getItem(responseKey);
            var formResponses = JSON.parse(responseData || '[]');
            formResponses.forEach(function (formResponse, index) { return viewFormResponses(formResponse.responses, index); });
            container.classList.remove('hidden');
        }
    }
    else {
        form = {
            id: crypto.randomUUID(),
            published: false,
            title: 'Untitled form',
            questions: []
        };
        container.classList.remove('hidden');
    }
    var formTitleElement = document.getElementById('formTitle');
    formTitleElement.value = form.title;
}
init();
function formTitleChange(value) {
    form.title = value;
}
function addQuestion(type) {
    var questionData = {
        type: type,
        label: '',
    };
    form.questions.push(questionData);
    generateQuestionHTML(form, 'questions');
}
function generateQuestionHTML(form, mode, responses) {
    var questionsContainer = document.getElementById("".concat(mode, "-container"));
    if (!questionsContainer)
        return;
    if (mode !== 'response-review')
        questionsContainer.innerHTML = '';
    if (mode === 'questions') {
        form.questions.forEach(function (question, index) {
            var questionBlock = document.createElement('div');
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
            var dragHandle = document.createElement('div');
            dragHandle.className = 'drag-handle';
            dragHandle.innerHTML = '⋮⋮';
            dragHandle.style.cursor = 'move';
            dragHandle.style.padding = '5px';
            questionBlock.appendChild(dragHandle);
            // Create controls container for delete button and type selector
            var controlsContainer = document.createElement('div');
            controlsContainer.className = 'controls-container';
            // Add delete button
            var deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
                form.questions.splice(index, 1);
                generateQuestionHTML(form, 'questions');
            };
            // Question type selector
            var typeSelect = document.createElement('select');
            typeSelect.className = 'question-type-select';
            ['text', 'choice', 'checkbox'].forEach(function (type) {
                var option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                option.selected = question.type === type;
                typeSelect.appendChild(option);
            });
            typeSelect.onchange = function (event) {
                var target = event.target;
                form.questions[index].type = target.value;
                if (['choice', 'checkbox'].includes(target.value)) {
                    form.questions[index].options = form.questions[index].options || ['Option 1'];
                }
                else {
                    delete form.questions[index].options;
                }
                generateQuestionHTML(form, 'questions');
            };
            // Add controls to container
            controlsContainer.appendChild(deleteButton);
            controlsContainer.appendChild(typeSelect);
            questionBlock.appendChild(controlsContainer);
            // Question input
            var questionInput = document.createElement('input');
            questionInput.type = 'text';
            questionInput.placeholder = 'Enter your question';
            questionInput.value = question.label;
            questionInput.className = 'question-input';
            questionInput.onchange = function (event) {
                var target = event.target;
                form.questions[index].label = target.value;
            };
            questionBlock.appendChild(questionInput);
            // Options container for choice/checkbox
            if (['choice', 'checkbox'].includes(question.type)) {
                var optionsContainer = document.createElement('div');
                optionsContainer.className = 'options-container';
                addOption(optionsContainer, question);
                var addOptionButton = document.createElement('button');
                addOptionButton.textContent = 'Add Option';
                addOptionButton.onclick = function () {
                    question.options = question.options || [];
                    question.options.push("Option ".concat(question.options.length + 1));
                    generateQuestionHTML(form, 'questions');
                };
                optionsContainer.appendChild(addOptionButton);
                questionBlock.appendChild(optionsContainer);
            }
            else {
                var questionAnswer = document.createElement('input');
                questionAnswer.readOnly = true;
                questionAnswer.type = 'text';
                questionAnswer.className = 'question-answer';
                questionAnswer.placeholder = 'Enter your answer';
                questionBlock.appendChild(questionAnswer);
            }
            questionsContainer.appendChild(questionBlock);
        });
    }
    else {
        var formElement_1 = document.createElement('form');
        formElement_1.id = mode + '-form';
        form.questions.forEach(function (question, index) {
            var _a, _b;
            var questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            var label = document.createElement('label');
            label.textContent = question.label;
            questionBlock.appendChild(label);
            switch (question.type) {
                case 'text':
                    var input = document.createElement('input');
                    input.className = 'question-input';
                    input.type = 'text';
                    input.name = "question_".concat(index);
                    input.required = true;
                    if (mode === 'response-review' && responses) {
                        input.value = responses[index] || '';
                        input.readOnly = true;
                    }
                    questionBlock.appendChild(input);
                    break;
                case 'choice':
                    (_a = question.options) === null || _a === void 0 ? void 0 : _a.forEach(function (option, optionIndex) {
                        var radioDiv = document.createElement('div');
                        var radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = "question_".concat(index);
                        radio.value = option;
                        radio.required = true;
                        if (mode === 'response-review') {
                            radio.disabled = true;
                            radio.checked = option === (responses === null || responses === void 0 ? void 0 : responses[index]);
                        }
                        var optionLabel = document.createElement('label');
                        optionLabel.textContent = option;
                        radioDiv.appendChild(radio);
                        radioDiv.appendChild(optionLabel);
                        questionBlock.appendChild(radioDiv);
                    });
                    break;
                case 'checkbox':
                    (_b = question.options) === null || _b === void 0 ? void 0 : _b.forEach(function (option, optionIndex) {
                        var checkDiv = document.createElement('div');
                        var checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = "question_".concat(index);
                        checkbox.value = option;
                        if (mode === 'response-review') {
                            checkbox.disabled = true;
                            // Handle array of responses for checkboxes
                            var responseArray = Array.isArray(responses === null || responses === void 0 ? void 0 : responses[index])
                                ? responses[index]
                                : [];
                            checkbox.checked = responseArray.includes(option);
                        }
                        var optionLabel = document.createElement('label');
                        optionLabel.textContent = option;
                        checkDiv.appendChild(checkbox);
                        checkDiv.appendChild(optionLabel);
                        questionBlock.appendChild(checkDiv);
                    });
                    break;
            }
            formElement_1.appendChild(questionBlock);
        });
        questionsContainer.appendChild(formElement_1);
    }
}
function addOption(container, question) {
    var _a;
    (_a = question.options) === null || _a === void 0 ? void 0 : _a.forEach(function (option, optionIndex) {
        var optionDiv = document.createElement('div');
        optionDiv.style.display = 'flex';
        optionDiv.style.gap = '10px';
        optionDiv.style.marginBottom = '10px';
        var optionInput = document.createElement('input');
        optionInput.className = 'option-input';
        optionInput.type = 'text';
        optionInput.value = option;
        optionInput.placeholder = 'Enter option';
        optionInput.style.flex = '1';
        optionInput.onchange = function (event) {
            var target = event.target;
            if (question.options) {
                question.options[optionIndex] = target.value;
            }
        };
        var deleteOption = document.createElement('button');
        deleteOption.textContent = 'Delete Option';
        deleteOption.onclick = function () {
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
function previewForm() {
    var formBuilder = document.querySelector('.form-builder');
    var formPreview = document.getElementById('form-preview');
    var previewContainer = document.getElementById('preview-container');
    // Generate preview
    previewContainer.innerHTML = "<h1>".concat(form.title, "</h1>");
    generateQuestionHTML(form, 'preview');
    formBuilder.classList.add('hidden');
    formPreview.classList.remove('hidden');
}
function viewForm() {
    var responseContainer = document.getElementById('response-container');
    // Generate preview
    responseContainer.innerHTML = "<h1>".concat(form.title, "</h1>");
    generateQuestionHTML(form, 'response');
}
function viewFormResponses(responses, index) {
    var responseContainer = document.getElementById('response-review-container');
    var formTitleElement = document.createElement('h1');
    formTitleElement.innerHTML = "".concat(form.title, " - Response ").concat(index);
    responseContainer.appendChild(formTitleElement);
    generateQuestionHTML(form, 'response-review', responses);
}
function backToEdit() {
    var formBuilder = document.querySelector('.form-builder');
    var formPreview = document.getElementById('form-preview');
    formBuilder.classList.remove('hidden');
    formPreview.classList.add('hidden');
}
function saveForm() {
    var formsKey = 'forms';
    var formsData = localStorage.getItem(formsKey);
    var forms = JSON.parse(formsData || '[]');
    if (forms && forms.length > 0) {
        var filteredForms = forms.filter(function (existingForm) { return existingForm.id !== form.id; });
        localStorage.setItem(formsKey, JSON.stringify(__spreadArray(__spreadArray([], filteredForms, true), [form], false)));
    }
    else {
        localStorage.setItem(formsKey, JSON.stringify([form]));
    }
    alert('Form save successfully');
}
function publishForm() {
    form.published = true;
    saveForm();
    location.href = "/form/?id=".concat(form.id, "&mode=response");
}
function submitResponse() {
    var _a;
    var response = {
        id: crypto.randomUUID(),
        formId: form.id,
        responses: []
    };
    // Group inputs by question (using name attribute)
    var questionGroups = new Map();
    for (var i = 0; i < document.forms[0].length; i++) {
        var input = document.forms[0][i];
        var name_1 = input.name;
        if (!questionGroups.has(name_1)) {
            questionGroups.set(name_1, []);
        }
        (_a = questionGroups.get(name_1)) === null || _a === void 0 ? void 0 : _a.push(input);
    }
    // Process each question group
    questionGroups.forEach(function (inputs, name) {
        var firstInput = inputs[0];
        if (firstInput.type === 'text') {
            response.responses.push(firstInput.value || ''); // Empty string if no input
        }
        else if (firstInput.type === 'radio') {
            var checkedRadio = inputs.find(function (input) { return input.checked; });
            response.responses.push(checkedRadio ? checkedRadio.value : ''); // Empty string if none selected
        }
        else if (firstInput.type === 'checkbox') {
            var checkedBoxes = inputs.filter(function (input) { return input.checked; }).map(function (input) { return input.value; });
            response.responses.push(checkedBoxes.length > 0 ? checkedBoxes : ''); // Empty string if none selected
        }
    });
    var responseKey = form.id;
    var responseData = localStorage.getItem(responseKey);
    var responses = JSON.parse(responseData || '[]');
    if (responses && responses.length > 0) {
        localStorage.setItem(responseKey, JSON.stringify(__spreadArray(__spreadArray([], responses, true), [response], false)));
    }
    else {
        localStorage.setItem(responseKey, JSON.stringify([response]));
    }
}
var draggedItem = null;
function handleDragStart(e) {
    var target = e.target;
    draggedItem = target;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    }
    target.style.opacity = '0.5';
}
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}
function handleDragEnter(e) {
    var _a;
    var target = e.target;
    (_a = target.closest('.question-block')) === null || _a === void 0 ? void 0 : _a.classList.add('drag-over');
}
function handleDragLeave(e) {
    var _a;
    var target = e.target;
    (_a = target.closest('.question-block')) === null || _a === void 0 ? void 0 : _a.classList.remove('drag-over');
}
function handleDrop(e) {
    e.preventDefault();
    var target = e.target;
    var questionBlock = target.closest('.question-block');
    if (questionBlock && draggedItem && questionBlock !== draggedItem) {
        var fromIndex = parseInt(draggedItem.dataset.index || '0');
        var toIndex = parseInt(questionBlock.dataset.index || '0');
        // Reorder the questions array
        var movedQuestion = form.questions.splice(fromIndex, 1)[0];
        form.questions.splice(toIndex, 0, movedQuestion);
        // Regenerate the HTML to reflect the new order
        generateQuestionHTML(form, 'questions');
    }
    questionBlock === null || questionBlock === void 0 ? void 0 : questionBlock.classList.remove('drag-over');
    if (draggedItem) {
        draggedItem.style.opacity = '1';
    }
    draggedItem = null;
}