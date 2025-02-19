import { Form } from "./index";

function init(): void {
    const formsKey = 'forms'
    const formsData = localStorage.getItem(formsKey);
    const forms = JSON.parse(formsData || '[]') as Form[];
    const unpublishedFormCardRow = document.getElementById('unpublished-form-card-row') as HTMLElement;
    const publishedFormCardRow = document.getElementById('published-form-card-row') as HTMLElement;

    forms.forEach(form => {
        const cardColumn = document.createElement('div');
        cardColumn.className = 'column';
        cardColumn.innerHTML = `
            <div class="card">
                <button class="edit-form-button" onclick="location.href='form/?id=${form.id}&mode=builder'">
                    <i class="fa fa-edit fa-lg" title="Edit form"></i>
                </button>
                <p class="text-overflow-hidden">${form.title}</p>
                <div style="display: flex; flex-direction: column;">
                    ${form.published ? `
                    <button class="form-option-buttons" onclick="copyResponseUrl('${form.id}')" title="Copy fill response URL">
                        Copy fill response URL
                    </button>               
                    <button class="form-option-buttons" onclick="location.href='form/?id=${form.id}&mode=response-review'" title="View form responses">
                        View responses
                    </button>` : ''}
                </div>
            </div>
        `;
        form.published ? publishedFormCardRow.appendChild(cardColumn) : unpublishedFormCardRow.appendChild(cardColumn);
    })
}

function copyResponseUrl(formId: string): void {
    const url = `${window.location.origin}/form/?id=${formId}&mode=response`;
    navigator.clipboard.writeText(url)
        .then(() => alert('Response URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy URL:', err));
}

init();