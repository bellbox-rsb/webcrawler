document.addEventListener('DOMContentLoaded', () => {
    // Toast Notification Logic
    const toastContainer = document.getElementById('toast-container');

    window.showToast = (message, type = 'error') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon based on type
        const icon = type === 'error' ? '<i class="bi bi-exclamation-triangle-fill"></i>' : '<i class="bi bi-check-circle-fill"></i>';

        toast.innerHTML = `
            <span style="font-size: 1.2rem; margin-right: 10px;">${icon}</span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    };

    // Loading Overlay Logic
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    const showLoading = (message = 'Crawling URL...') => {
        if (loadingOverlay) {
            loadingText.textContent = message;
            loadingOverlay.classList.add('active');
        }
    };

    // Main Form Submit
    const crawlForm = document.getElementById('crawl-form');
    if (crawlForm) {
        crawlForm.addEventListener('submit', () => showLoading());
    }

    // QuillJS Logic
    const editorContainer = document.getElementById('editor-container');
    const initialMarkdownEl = document.getElementById('initial-markdown-content');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');

    if (editorContainer && initialMarkdownEl) {
        // Initialize Turndown Service (HTML -> Markdown)
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });

        // Initialize Quill
        const quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image', 'code-block', 'blockquote'],
                    ['clean']
                ]
            }
        });

        // Load Content: Markdown -> HTML -> Quill
        // We use marked.js (already loaded) to convert the initial markdown to HTML
        const initialHtml = marked.parse(initialMarkdownEl.value);
        quill.clipboard.dangerouslyPasteHTML(initialHtml);

        // Copy to Clipboard Logic
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const editorContent = quill.root.innerHTML;
                const markdownContent = turndownService.turndown(editorContent);

                navigator.clipboard.writeText(markdownContent).then(() => {
                    if (window.showToast) {
                        window.showToast('Markdown copied to clipboard!', 'success');
                    } else {
                        alert('Markdown copied to clipboard!');
                    }
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    if (window.showToast) {
                        window.showToast('Failed to copy to clipboard.', 'error');
                    }
                });
            });
        }

        // Save to File Handle Logic
        const downloadBlob = (content, filename) => {
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.showToast) window.showToast('File downloaded.', 'success');
        };

        // Save to File Handle Logic
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const editorContent = quill.root.innerHTML;
                const markdownContent = turndownService.turndown(editorContent);
                const suggestedName = 'crawled_content.md';
                let usedFallback = false;

                try {
                    // Check for modern API support
                    if (window.showSaveFilePicker) {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: suggestedName,
                            types: [{
                                description: 'Markdown File',
                                accept: { 'text/markdown': ['.md'] },
                            }],
                        });
                        const writable = await handle.createWritable();
                        await writable.write(markdownContent);
                        await writable.close();
                        if (window.showToast) window.showToast('File saved successfully!', 'success');
                    } else {
                        // Not supported
                        usedFallback = true;
                    }
                } catch (err) {
                    // Ignore abort errors (user cancelled)
                    if (err.name === 'AbortError') {
                        return;
                    }
                    // For security errors or other failures, fallback to blob
                    console.warn('File System Access API failed, falling back to download:', err);
                    usedFallback = true;
                }

                if (usedFallback) {
                    const userFilename = prompt("Enter filename to save (browser does not support picking folder):", suggestedName);
                    if (userFilename) {
                        // Ensure .md extension
                        const finalName = userFilename.endsWith('.md') ? userFilename : userFilename + '.md';
                        downloadBlob(markdownContent, finalName);
                    }
                }
            });
        }
    }
});
