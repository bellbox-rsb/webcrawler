import { ChevronRight, Cpu, Box } from 'lucide-react';
import { useState } from 'react';

export function TechStack({ data }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!data || Object.keys(data).length === 0) return null;

    return (
        <div className="w-full mt-20 fade-in delay-200">
            <h3
                onClick={() => setIsOpen(!isOpen)}
                className="text-white font-medium mb-6 flex items-center gap-2 cursor-pointer group select-none"
            >
                <ChevronRight
                    size={18}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                />
                <Cpu size={18} />
                Detected Technology
                <span className="text-xs text-neutral-600 ml-2 group-hover:text-neutral-500 transition-colors">
                    (Click to expand)
                </span>
            </h3>

            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(data).map(([category, techs]) => (
                        <div key={category} className="p-6 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 hover:bg-neutral-900/50 transition-all duration-300">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 mb-4 font-semibold">
                                {category}
                            </div>
                            <div className="space-y-3">
                                {techs.map((tech, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <Box size={20} className="text-neutral-400" />
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">{tech.name}</span>
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
            )}
        </div>
    );
}
