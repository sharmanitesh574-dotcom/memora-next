import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-surface)' }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-7 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm italic"
            style={{ background: 'var(--color-brand)', fontFamily: 'Georgia, serif' }}
          >
            M
          </div>
          <span className="text-base font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Memora
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-full text-sm cursor-pointer"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full text-sm text-white cursor-pointer"
            style={{ background: 'var(--color-brand)' }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center pt-32 pb-16 px-5">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6"
          style={{
            background: 'var(--color-brand-light)',
            color: 'var(--color-brand)',
            border: '1px solid rgba(91,71,224,0.15)',
          }}
        >
          Your second brain that actually thinks
        </div>

        <h1
          className="font-display text-5xl md:text-7xl font-bold leading-[1.06] tracking-tight mb-5 max-w-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Never lose a{' '}
          <em className="not-italic" style={{ color: 'var(--color-brand)' }}>
            thought
          </em>{' '}
          again
        </h1>

        <p
          className="text-lg leading-relaxed max-w-md mx-auto mb-9 font-light"
          style={{ color: 'var(--text-secondary)' }}
        >
          Capture ideas, decisions, and goals. Memora&apos;s AI connects the dots,
          surfaces patterns, and reminds you what matters.
        </p>

        <div className="flex gap-3 flex-wrap justify-center mb-14">
          <Link
            href="/signup"
            className="px-7 py-3 rounded-full text-sm font-medium text-white cursor-pointer transition-all hover:shadow-lg"
            style={{ background: 'var(--color-brand)' }}
          >
            Start free — no card needed
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 rounded-full text-sm cursor-pointer"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            See how it works
          </Link>
        </div>

        {/* Feature grid */}
        <div id="features" className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full">
          {[
            { icon: '💭', title: 'Capture anything', desc: 'Text, voice, photos — just think, Memora remembers' },
            { icon: '✨', title: 'AI that knows you', desc: 'Chat with an AI that has your full context' },
            { icon: '🔮', title: 'Pattern insights', desc: 'Discover themes in your thinking you missed' },
            { icon: '🎙️', title: 'Voice capture', desc: 'Tap and talk — fastest way to save a thought' },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-4 text-left"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
            >
              <div className="text-xl mb-2">{f.icon}</div>
              <h3 className="text-xs font-semibold mb-1 font-display">{f.title}</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
