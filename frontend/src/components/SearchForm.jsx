import { ArrowRight, Loader2, Search } from 'lucide-react';

export function SearchForm({ url, setUrl, onSubmit, loading }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group fade-in delay-100">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

            <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-800 overflow-hidden">
                <div className="pl-5 text-neutral-500">
                    <Search size={20} strokeWidth={1.5} />
                </div>

                <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none text-white placeholder-neutral-600 px-4 py-5 text-base focus:ring-0 focus:outline-none h-16 font-light"
                    autoComplete="off"
                    autoFocus
                    required
                />

                <div className="pr-3 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <ArrowRight size={18} strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
