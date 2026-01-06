import { ref } from 'vue';
import axios from 'axios';

// Singleton state if needed, or just a factory function.
// For this app, per-component usage is fine, but keeping state preserved during navigation is good.
// Let's use global state ref pattern or just basic composable.

export function useCrawler() {
    const url = ref('');
    const loading = ref(false);
    const data = ref(null);
    const error = ref(null);

    const reset = () => {
        data.value = null;
        error.value = null;
        url.value = '';
    };

    const crawl = async (inputUrl) => {
        if (!inputUrl) {
            error.value = 'Please enter a URL';
            return;
        }

        // Basic URL validation
        try {
            new URL(inputUrl);
        } catch (_) {
            error.value = 'Please enter a valid URL (e.g., https://example.com)';
            return;
        }

        loading.value = true;
        error.value = null;
        data.value = null;

        try {
            const response = await axios.post('/crawl', {
                url: inputUrl
            });

            if (response.data.success) {
                data.value = response.data;
            } else {
                error.value = response.data.error || 'Failed to crawl URL';
            }
        } catch (err) {
            error.value = err.response?.data?.error || err.message || 'Network error';
        } finally {
            loading.value = false;
        }
    };

    return {
        url,
        loading,
        data,
        error,
        crawl,
        reset
    };
}
