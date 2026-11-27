import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'
import { LangProvider } from './hooks/useLang'
import { ToastProvider } from './components/ui/Toast'
import { normalizeTour } from './lib/toursApi'
import { HeadSinkContext, PrerenderToursContext, type HeadSink } from './prerender/sink'

export type RenderedRoute = {
  html: string
  head: HeadSink
}

/** Browser-free render of one public URL. `rows` are raw `tours` records. */
export function render(url: string, rows: Record<string, unknown>[]): RenderedRoute {
  const tours = rows.map((row) => normalizeTour(row))
  const head: HeadSink = { jsonLd: [] }
  const html = renderToString(
    <StrictMode>
      <HeadSinkContext.Provider value={head}>
        <PrerenderToursContext.Provider value={tours}>
          <LangProvider>
            <ToastProvider>
              <div className="h-full min-h-0 overflow-hidden">
                <StaticRouter location={url}>
                  <AppRoutes />
                </StaticRouter>
              </div>
            </ToastProvider>
          </LangProvider>
        </PrerenderToursContext.Provider>
      </HeadSinkContext.Provider>
    </StrictMode>,
  )
  return { html, head }
}
