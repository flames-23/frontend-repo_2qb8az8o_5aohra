import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin.replace('3000', '8000') : '')

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
      {children}
    </span>
  )
}

function Hero() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white"></div>
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 text-center md:pt-28">
        <Badge>AI video studio • Shorts & long-form</Badge>
        <h1 className="mt-6 bg-gradient-to-br from-purple-700 via-blue-600 to-rose-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          PromptToTube
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-gray-700 sm:text-lg">
          Turn a text or voice prompt into a YouTube-ready video with script, subtitles, music, sound effects, transitions, and thumbnail.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Badge>Realistic AI voices</Badge>
          <Badge>Auto-captions</Badge>
          <Badge>Thumbnail + SEO</Badge>
          <Badge>YouTube export</Badge>
        </div>
      </div>
    </section>
  )
}

function ProjectForm({ onCreated, loading, setLoading }) {
  const [prompt, setPrompt] = useState('1-minute motivational short about discipline with punchy hook')
  const [mode, setMode] = useState('short')
  const [duration, setDuration] = useState(60)
  const [language, setLanguage] = useState('en')

  const canSubmit = prompt.trim().length > 5 && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, duration_sec: Number(duration), language })
      })
      if (!res.ok) throw new Error('Failed to create project')
      const data = await res.json()
      onCreated?.(data)
    } catch (err) {
      console.error(err)
      alert('Something went wrong creating your project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-700">Describe your video</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white/70 p-3 text-sm shadow-inner outline-none transition focus:border-blue-400"
            placeholder="e.g. 10-minute tech review of the latest noise-cancelling headphones"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:w-[420px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Format</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white/70 p-2.5 text-sm shadow-inner focus:border-blue-400">
              <option value="short">Short (vertical)</option>
              <option value="long">Long-form</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Duration (sec)</label>
            <input type="number" min={10} max={3600} value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white/70 p-2.5 text-sm shadow-inner focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Language</label>
            <input value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white/70 p-2.5 text-sm shadow-inner focus:border-blue-400" />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-purple-700 hover:to-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">We automatically generate script, captions, music, transitions, SFX, thumbnail, title, and tags. You can refine everything later.</p>
    </form>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="group rounded-xl border bg-white/60 p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="rounded bg-purple-50 px-2 py-0.5 font-medium text-purple-700 ring-1 ring-purple-100">{project.mode}</span>
          <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700 ring-1 ring-blue-100">{project.language}</span>
          <span className="rounded bg-gray-100 px-2 py-0.5">{project.duration_sec}s</span>
        </div>
        <span className="text-xs text-gray-500">{project.status || 'created'}</span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-800">{project.title || project.prompt}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{project.prompt}</p>
      {project.suggestions?.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
          {project.suggestions.slice(0, 3).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Projects() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`)
      const data = await res.json()
      setItems(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setInitialLoaded(true)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Your projects</h2>
        <button onClick={fetchProjects} className="text-sm font-medium text-blue-600 hover:text-blue-700">Refresh</button>
      </div>
      <div className="mt-4">
        <ProjectForm
          loading={loading}
          setLoading={setLoading}
          onCreated={(p) => {
            setItems((prev) => [p, ...prev])
          }}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {!items.length && initialLoaded && (
          <div className="col-span-full rounded-xl border bg-white/60 p-6 text-center text-sm text-gray-600 ring-1 ring-black/5">
            No projects yet. Create your first one above.
          </div>
        )}
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-indigo-50/40 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow" />
          <span className="text-sm font-semibold text-gray-800">PromptToTube</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#projects" className="hover:text-gray-900">Projects</a>
          <a href="#" className="rounded-lg bg-gray-900 px-3 py-1.5 font-medium text-white shadow hover:bg-black">Launch Studio</a>
        </nav>
      </header>

      <Hero />

      <section id="features" className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-3">
        {[
          {
            title: 'Script → Subtitles → SFX',
            desc: 'We generate an engaging hook, full script, captions, background music, transitions, and sound effects automatically.'
          },
          {
            title: 'Branding + SEO',
            desc: 'Automatic logo placement, intro/outro, thumbnail design, plus SEO-optimized titles and tags for faster uploads.'
          },
          {
            title: 'Shorts or Long-form',
            desc: 'Vertical or cinematic widescreen. Export ready for YouTube with one click.'
          }
        ].map((f, i) => (
          <div key={i} className="rounded-xl border bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="text-sm font-semibold text-gray-800">{f.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <section id="projects">
        <Projects />
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10 pt-6 text-xs text-gray-500">
        © {new Date().getFullYear()} PromptToTube. Built with AI.
      </footer>
    </div>
  )
}
