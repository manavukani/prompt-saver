document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('savePrompt');
    const promptList = document.getElementById('promptList');
    const promptName = document.getElementById('promptName');
    const promptText = document.getElementById('promptText');

    saveButton.addEventListener('click', savePrompt);
    loadPrompts();

    function savePrompt() {
        const name = promptName.value.trim();
        const text = promptText.value.trim();

        if (name && text) {
            chrome.storage.sync.get('prompts', (data) => {
                const prompts = data.prompts || [];
                prompts.push({ name, text });
                chrome.storage.sync.set({ prompts }, () => {
                    promptName.value = '';
                    promptText.value = '';
                    loadPrompts();
                });
            });
        }
    }

    function loadPrompts() {
        chrome.storage.sync.get('prompts', (data) => {
            const prompts = data.prompts || [];
            promptList.innerHTML = '';
            prompts.forEach((prompt, index) => {
                const promptElement = createPromptElement(prompt, index);
                promptList.appendChild(promptElement);
            });
        });
    }

    function createPromptElement(prompt, index) {
        const element = document.createElement('div');
        element.className = 'prompt-item';
        const preview = prompt.text.split(' ').slice(0, 5).join(' ') + (prompt.text.split(' ').length > 5 ? '...' : '');

        element.innerHTML = `
            <div class="prompt-header">
                <span class="prompt-name">${prompt.name}</span>
                <span class="prompt-preview">${preview}</span>
                <button class="expand-btn">▼</button>
            </div>
            <div class="prompt-content hidden">
                <p>${prompt.text}</p>
                <div class="button-container">
                    <button class="copy-btn">Copy</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;

        const expandBtn = element.querySelector('.expand-btn');
        const content = element.querySelector('.prompt-content');
        const copyBtn = element.querySelector('.copy-btn');
        const deleteBtn = element.querySelector('.delete-btn');

        expandBtn.addEventListener('click', () => {
            content.classList.toggle('hidden');
            expandBtn.textContent = content.classList.contains('hidden') ? '▼' : '▲';
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(prompt.text)
                .then(() => alert('Prompt copied to clipboard!'))
                .catch(err => console.error('Failed to copy text: ', err));
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this prompt?')) {
                chrome.storage.sync.get('prompts', (data) => {
                    const prompts = data.prompts || [];
                    prompts.splice(index, 1);
                    chrome.storage.sync.set({ prompts }, loadPrompts);
                });
            }
        });

        return element;
    }
});