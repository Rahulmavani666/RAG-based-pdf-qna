import Link from 'next/link'

const steps = [
  { number: '01', title: 'Add your PDFs', text: 'Bring reports, notes, and other documents into one workspace.' },
  { number: '02', title: 'Ask in plain language', text: 'Find key details without searching page by page.' },
  { number: '03', title: 'Check the source', text: 'Use page references to verify what the documents say.' },
]

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f7f8f6] text-[#202a27]">
      <section className="relative mx-auto grid min-h-[620px] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_.95fr] md:px-10 md:py-24">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white px-3 py-1.5 text-xs font-medium text-[#39785c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#58a779]" /> Your documents, easier to explore
          </div>
          <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-.055em] text-[#26332d] sm:text-6xl">
            Make sense of every page.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#728078]">
            Keep your PDFs together, ask questions in plain language, and check answers against the source pages.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#287854] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#206746]">
              Open your workspace <span className="ml-2" aria-hidden="true">→</span>
            </Link>
            <a href="#how-it-works" className="inline-flex h-12 items-center justify-center rounded-xl border border-[#dfe5df] bg-white px-5 text-sm font-semibold text-[#59665e] transition hover:border-[#bdd0c1]">
              How it works
            </a>
          </div>
          <p className="mt-5 text-xs text-[#95a098]">Sign in to upload PDFs and start a workspace.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[470px]">
          <div className="absolute -inset-8 rounded-[40px] bg-[#e7f1e9] blur-2xl" />
          <div className="relative rounded-[26px] border border-[#e5eae4] bg-white p-5 shadow-[0_24px_80px_rgba(41,74,52,.10)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#edf0ec] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f2e9] text-lg">✳</span>
                <div><p className="text-sm font-semibold text-[#344039]">Document workspace</p><p className="mt-0.5 text-xs text-[#98a29c]">A clearer way to find answers</p></div>
              </div>
              <span className="rounded-full bg-[#eff7f1] px-2.5 py-1 text-[10px] font-semibold text-[#45805c]">PDF Q&amp;A</span>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-[#ceddce] bg-[#f9fbf8] px-4 py-6 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f2e9] text-xl text-[#43805b]">↑</span>
              <p className="mt-3 text-sm font-semibold text-[#47554c]">Add a document to begin</p>
              <p className="mt-1 text-xs text-[#98a29c]">Upload a PDF from your workspace</p>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f4f6f3] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa49d]">Then ask</p>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e8ece7] bg-white px-3 py-3 text-xs text-[#89948d]">
                <span className="flex-1">What are the main findings?</span><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#287854] text-white">↗</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#758279]"><span className="text-[#43805b]">✓</span> Answers can be checked against cited pages</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#e7ebe6] bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#43805b]">Simple by design</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-[#2d3932]">From PDF to useful answers.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl border border-[#e9ede8] bg-[#fcfdfb] p-5">
                <span className="text-xs font-bold tracking-[.1em] text-[#5d9672]">{step.number}</span>
                <h3 className="mt-5 text-base font-semibold text-[#3a473f]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#7c8880]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
