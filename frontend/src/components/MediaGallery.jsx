
import { useState } from 'react'
import { Image, Video, Link, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

export function MediaGallery({ data }) {
    if (!data) return null

    // Check if we have any media to show
    const hasImages = data.images && data.images.length > 0
    const hasVideos = data.videos && data.videos.length > 0
    const hasLinks = data.links && data.links.length > 0

    if (!hasImages && !hasVideos && !hasLinks) return null

    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(hasImages ? 'images' : hasVideos ? 'videos' : 'links')

    return (
        <div className="w-full mt-6 fade-in delay-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/80 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors">
                        <Image size={18} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-medium text-white">Media Gallery</h3>
                        <p className="text-xs text-neutral-500">
                            {data.images?.length || 0} images, {data.videos?.length || 0} videos, {data.links?.length || 0} links
                        </p>
                    </div>
                </div>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {isOpen && (
                <div className="mt-2 p-4 bg-neutral-900/30 border border-white/5 rounded-xl border-t-0">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-white/5 pb-2">
                        {hasImages && (
                            <button
                                onClick={() => setActiveTab('images')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'images' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'
                                    }`}
                            >
                                <Image size={14} /> Images ({data.images.length})
                            </button>
                        )}
                        {hasVideos && (
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'videos' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'
                                    }`}
                            >
                                <Video size={14} /> Videos ({data.videos.length})
                            </button>
                        )}
                        {hasLinks && (
                            <button
                                onClick={() => setActiveTab('links')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'links' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'
                                    }`}
                            >
                                <Link size={14} /> Links ({data.links.length})
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {activeTab === 'images' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {data.images.map((img, i) => (
                                    <div key={i} className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={img.src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm"
                                                title="Open Original"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.videos.map((vid, i) => (
                                    <div key={i} className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                                        <iframe
                                            src={vid.src}
                                            title={vid.title}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allowFullScreen
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'links' && (
                            <div className="flex flex-col gap-2">
                                {data.links.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                                    >
                                        <span className="text-sm text-neutral-300 truncate max-w-[80%]">{link.text}</span>
                                        <ExternalLink size={14} className="text-neutral-500 group-hover:text-purple-400 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
