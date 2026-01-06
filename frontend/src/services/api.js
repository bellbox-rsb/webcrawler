import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const scrapeUrl = async (url) => {
    const response = await axios.post(`${API_URL}/api/scrape`, { url });
    return response.data;
};
