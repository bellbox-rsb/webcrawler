export async function convertToMarkdown(html) {
    try {
        const TurndownService = (await import('turndown')).default
        const { gfm } = (await import('turndown-plugin-gfm'))

        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        })
        turndownService.use(gfm)

        // Preserve YouTube embeds
        turndownService.addRule('youtube', {
            filter: function (node) {
                return (
                    (node.nodeName === 'DIV' && node.getAttribute('data-youtube-video') !== null) ||
                    (node.nodeName === 'IFRAME' && (node.getAttribute('src') || '').includes('youtube.com/embed'))
                )
            },
            replacement: function (content, node) {
                const iframe = node.nodeName === 'IFRAME' ? node : node.querySelector('iframe')
                if (!iframe) return content

                const src = iframe.getAttribute('src')
                return `\n<iframe src="${src}" width="640" height="360" frameborder="0" allowfullscreen></iframe>\n`
            }
        })

        return turndownService.turndown(html)
    } catch (e) {
        console.error("Markdown conversion failed", e)
        return ""
    }
}
