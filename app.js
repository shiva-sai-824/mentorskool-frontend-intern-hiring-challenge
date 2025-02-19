"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function init() {
    var formsKey = 'forms';
    var formsData = localStorage.getItem(formsKey);
    var forms = JSON.parse(formsData || '[]');
    var unpublishedFormCardRow = document.getElementById('unpublished-form-card-row');
    var publishedFormCardRow = document.getElementById('published-form-card-row');
    forms.forEach(function (form) {
        var cardColumn = document.createElement('div');
        cardColumn.className = 'column';
        cardColumn.innerHTML = "\n            <div class=\"card\">\n                <button class=\"edit-form-button\" onclick=\"location.href='form/?id=".concat(form.id, "&mode=builder'\">\n                    <i class=\"fa fa-edit fa-lg\" title=\"Edit form\"></i>\n                </button>\n                <p class=\"text-overflow-hidden\">").concat(form.title, "</p>\n                <div style=\"display: flex; flex-direction: column;\">\n                    ").concat(form.published ? "\n                    <button class=\"form-option-buttons\" onclick=\"copyResponseUrl('".concat(form.id, "')\" title=\"Copy fill response URL\">\n                        Copy fill response URL\n                    </button>               \n                    <button class=\"form-option-buttons\" onclick=\"location.href='form/?id=").concat(form.id, "&mode=response-review'\" title=\"View form responses\">\n                        View responses\n                    </button>") : '', "\n                </div>\n            </div>\n        ");
        form.published ? publishedFormCardRow.appendChild(cardColumn) : unpublishedFormCardRow.appendChild(cardColumn);
    });
}
function copyResponseUrl(formId) {
    var url = "".concat(window.location.origin, "/form/?id=").concat(formId, "&mode=response");
    navigator.clipboard.writeText(url)
        .then(function () { return alert('Response URL copied to clipboard!'); })
        .catch(function (err) { return console.error('Failed to copy URL:', err); });
}
init();