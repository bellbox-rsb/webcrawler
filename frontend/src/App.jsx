import { useState } from 'react'
import { Layers, Github, FileText, Clipboard, Download, RotateCcw, AlertTriangle, ShieldCheck, Zap, Terminal, Minus, Plus, Check } from 'lucide-react'
import axios from 'axios'
import { SearchForm } from './components/SearchForm'
import { TechStack } from './components/TechStack'
import { Editor } from './components/Editor'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null) // { html, tech_stack }
  const [error, setError] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')

  const handleCrawl = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await axios.post('/crawl', { url })
      const result = response.data

      if (result.success) {
        setData(result)
        setEditorContent(result.html)
      } else {
        setError(result.error || 'Failed to crawl URL')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEditorUpdate = (html, markdown) => {
    // markdownContent will be used for export/copy
    setMarkdownContent(markdown)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent).then(() => {
      alert('Markdown copied to clipboard!') // Replace with toast ideally
    })
  }

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'crawled_content.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden text-neutral-400 selection:bg-white/20 selection:text-white">
      {/* Backgrounds */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="noise-bg"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <Layers className="text-white group-hover:text-emerald-400 transition-colors" size={20} />
          <span className="text-white font-medium tracking-tighter text-sm uppercase">Nexus</span>
        </div>

        <nav className="flex gap-4 md:gap-8 items-center">
          <a href="/docs/index.md" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">Development</a>
          <a href="https://github.com/raksitbell/webcrawler" target="_blank" rel="noreferrer" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
            <Github size={14} />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-4xl mx-auto mt-12 md:mt-0">
        {/* Hero */}
        <div className="text-center w-full fade-in px-4">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3 py-1 mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-300">v3.0 Neural Search Live</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white tracking-tight mb-4 leading-[1.1]">
            Search without the <br className="hidden md:block" />
            <span className="text-neutral-500">noise.</span>
          </h1>

          <p className="text-neutral-500 text-sm md:text-base max-w-md mx-auto mb-12 font-light leading-relaxed">
            An intelligent search engine designed for clarity. No ads, no tracking, just the results you're looking for.
          </p>
        </div>

        <SearchForm url={url} setUrl={setUrl} onSubmit={handleCrawl} loading={loading} />

        {error && (
          <div className="mt-6 w-full max-w-2xl fade-in delay-100">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertTriangle size={16} />
              {error}
            </div>
          </div>
        )}

        {data && (
          <>
            <TechStack data={data.tech_stack} />

            {/* Editor Section */}
            <div className="w-full mt-12 fade-in delay-300 pb-20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <FileText size={18} />
                  Content
                </h3>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors flex items-center gap-2">
                    <Clipboard size={14} /> Copy MD
                  </button>
                  <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors flex items-center gap-2">
                    <Download size={14} /> Save MD
                  </button>
                  <button onClick={() => { setData(null); setUrl(''); }} className="px-3 py-1.5 rounded-lg border border-white/10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs transition-colors flex items-center gap-2">
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
                <Editor initialContent={editorContent} onUpdate={handleEditorUpdate} />
              </div>
            </div>
          </>
        )}

        {!data && !loading && (
          <>
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-20 fade-in delay-200">
              <div className="group p-6 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 hover:bg-neutral-900/50 transition-all duration-300">
                <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center mb-4 text-white border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck size={16} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-white mb-2">Zero Tracking</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  We don't store your history or sell your data. Your queries disappear the moment you close the tab.
                </p>
              </div>

              <div className="group p-6 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 hover:bg-neutral-900/50 transition-all duration-300">
                <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center mb-4 text-white border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={16} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-white mb-2">Instant Answers</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Powered by neural networks to understand context, delivering direct answers instead of just blue links.
                </p>
              </div>

              <div className="group p-6 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 hover:bg-neutral-900/50 transition-all duration-300">
                <div className="h-8 w-8 rounded-lg bg-neutral-800/50 flex items-center justify-center mb-4 text-white border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  <Terminal size={16} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-white mb-2">Developer First</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Native support for code snippets, documentation parsing, and API integration directly in results.
                </p>
              </div>
            </div>

            {/* Settings Area (Visual Demo) */}
            <div className="w-full mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 fade-in delay-300 pb-20">
              <div className="flex items-center gap-6">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 border border-neutral-700 rounded bg-neutral-900 group-hover:border-neutral-500 transition-colors">
                    <input type="checkbox" className="custom-check peer absolute opacity-0 w-full h-full cursor-pointer" />
                    <Check size={10} strokeWidth={2} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="ml-2 text-xs text-neutral-500 group-hover:text-neutral-400">Safe mode</span>
                </label>

                <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-lg border border-white/5">
                  <button className="px-3 py-1 bg-neutral-800 rounded text-[10px] text-white shadow-sm border border-white/5 font-medium">Standard</button>
                  <button className="px-3 py-1 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors font-medium">Raw</button>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Minus size={12} className="text-neutral-600" />
                <div className="relative w-32 h-1 bg-neutral-800 rounded-full">
                  <div className="absolute top-0 left-0 h-full w-2/3 bg-neutral-600 rounded-full"></div>
                  <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-3 h-3 bg-neutral-200 rounded-full shadow-lg border border-neutral-950 cursor-pointer hover:scale-110 transition-transform"></div>
                </div>
                <Plus size={12} className="text-neutral-600" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wide ml-2">Density</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
