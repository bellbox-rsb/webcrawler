
import { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, Box } from 'lucide-react';

export function TechStack({ data }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!data || Object.keys(data).length === 0) return null;

    // Custom Categorization Logic
    const categorizeData = (rawData) => {
        const categories = {
            'Programming Languages': [],
            'Frontend Frameworks': [],
            'Backend Frameworks': [],
            'Hosting': [],
            'CDN': [],
            'Utils': []
        };

        const knownMappings = {
            // Languages
            'Python': 'Programming Languages',
            'JavaScript': 'Programming Languages',
            'TypeScript': 'Programming Languages',
            'PHP': 'Programming Languages',
            'Go': 'Programming Languages',
            'Ruby': 'Programming Languages',

            // Frontend
            'React': 'Frontend Frameworks',
            'Vue.js': 'Frontend Frameworks',
            'Next.js': 'Frontend Frameworks',
            'Nuxt.js': 'Frontend Frameworks',
            'Angular': 'Frontend Frameworks',
            'Svelte': 'Frontend Frameworks',
            'Tailwind CSS': 'Frontend Frameworks',
            'Bootstrap': 'Frontend Frameworks',
            'jQuery': 'Frontend Frameworks',

            // Backend
            'Flask': 'Backend Frameworks',
            'Django': 'Backend Frameworks',
            'Express': 'Backend Frameworks',
            'Laravel': 'Backend Frameworks',
            'Rails': 'Backend Frameworks',
            'FastAPI': 'Backend Frameworks',

            // Hosting/Servers
            'Nginx': 'Hosting',
            'Apache': 'Hosting',
            'Vercel': 'Hosting',
            'Netlify': 'Hosting',
            'Amazon Web Services': 'Hosting',
            'Docker': 'Hosting',
            'Ubuntu': 'Hosting',

            // CDN
            'Cloudflare': 'CDN',
            'Fastly': 'CDN',
            'Akamai': 'CDN',
            'Amazon CloudFront': 'CDN',
        };

        const categoryKeyMap = {
            'web-servers': 'Hosting',
            'operating-systems': 'Hosting',
            'paas': 'Hosting',
            'cms': 'Backend Frameworks',
            'programming-languages': 'Programming Languages',
            'javascript-frameworks': 'Frontend Frameworks',
            'web-frameworks': 'Backend Frameworks',
            'content-delivery-networks': 'CDN'
        };

        // Process all entries
        Object.entries(rawData).forEach(([catKey, techs]) => {
            if (!techs) return;

            techs.forEach(tech => {
                let targetCat = 'Utils'; // Default

                // 1. Check specific tech name mapping
                if (knownMappings[tech.name]) {
                    targetCat = knownMappings[tech.name];
                }
                // 2. Check detected category mapping
                else if (categoryKeyMap[catKey]) {
                    targetCat = categoryKeyMap[catKey];
                }
                // 3. Heuristics for "Detected" category (Wappalyzer raw output)
                else if (catKey === 'Detected') {
                    // If it's in detected but not known, it falls to Utils
                    targetCat = 'Utils';
                }

                // Avoid duplicates
                if (!categories[targetCat].some(t => t.name === tech.name)) {
                    categories[targetCat].push(tech);
                }
            });
        });

        // Remove empty categories but keep preferred order if present
        const orderedResult = {};
        Object.keys(categories).forEach(key => {
            if (categories[key].length > 0) {
                orderedResult[key] = categories[key];
            }
        });

        return orderedResult;
    };

    const groupedData = categorizeData(data);
    const totalTechs = Object.values(groupedData).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <div className="w-full mt-20 fade-in delay-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/80 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        <Cpu size={18} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-medium text-white">Detected Technology</h3>
                        <p className="text-xs text-neutral-500">
                            {totalTechs} technologies found across {Object.keys(groupedData).length} categories
                        </p>
                    </div>
                </div>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {isOpen && (
                <div className="mt-2 p-4 bg-neutral-900/30 border border-white/5 rounded-xl border-t-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(groupedData).map(([category, techs]) => (
                            <div key={category} className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-3 font-semibold">
                                    {category}
                                </div>
                                <div className="space-y-2">
                                    {techs.map((tech, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group/item">
                                            <Box size={14} className="text-neutral-600 group-hover/item:text-neutral-400 transition-colors" />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-neutral-300 font-medium group-hover/item:text-white transition-colors">{tech.name}</span>
                                                {tech.version && (
                                                    <span className="text-[10px] text-neutral-600">{tech.version}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
