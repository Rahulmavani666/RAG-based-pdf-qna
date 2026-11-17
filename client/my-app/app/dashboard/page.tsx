'use client'

import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from 'react'

type PdfFile = {
  id: string
  name: string
  size: string
  status: 'uploading' | 'uploaded' | 'error'
  serverFilename?: string
}

type Message = { 
  id: number; 
  role: 'assistant' | 'user';
  text: string;
   time: string }



function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<string, ReactNode> = {
    logo: <><path d="M7 3.75h6.5L19 9.25v10A1.75 1.75 0 0 1 17.25 21h-10A1.75 1.75 0 0 1 5.5 19.25v-13A2.5 2.5 0 0 1 8 3.75Z"/><path d="M13 4v5.5h5.5M8.5 14h7M8.5 17h5"/><path d="m9 10.5 2 1.5 4-3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4.2 4.2"/></>,
    upload: <><path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></>,
    file: <><path d="M7 3.75h6.5L19 9.25v10A1.75 1.75 0 0 1 17.25 21h-10A1.75 1.75 0 0 1 5.5 19.25v-13A2.5 2.5 0 0 1 8 3.75Z"/><path d="M13 4v5.5h5.5M8.5 14h7M8.5 17h5"/></>,
    send: <><path d="m21 3-7.2 18-3.9-7.9L2 9.2 21 3Z"/><path d="M10 13 21 3"/></>,
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    shield: <><path d="M12 3 19 6v5.5c0 4.4-3 7.8-7 9.5-4-1.7-7-5.1-7-9.5V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7M8 10h5"/></>,
  }
  return <svg {...common} aria-hidden="true">{paths[name] ?? paths.file}</svg>
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<PdfFile[]>([])
  const [question, setQuestion] = useState('')
  const [dragging, setDragging] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: 'Hi! Add a PDF to get started. You’ll be able to ask questions and keep answers tied to the documents you choose.', time: 'Now' },
  ])
  
  async function uploadPdf(file: File, id: string) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error ?? 'Upload failed')
      }

      setFiles((current) => current.map((item) => item.id === id
        ? { ...item, status: 'uploaded', serverFilename: result.filename }
        : item))
    } catch (error) {
      console.error('PDF upload failed:', error)
      setFiles((current) => current.map((item) => item.id === id
        ? { ...item, status: 'error' }
        : item))
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const pdfs = Array.from(fileList).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))

    for (const file of pdfs) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
      setFiles((current) => [...current, {
        id,
        name: file.name,
        size: formatSize(file.size),
        status: 'uploading',
      }])
      void uploadPdf(file, id)
    }

    if (fileInput.current) fileInput.current.value = ''
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) { addFiles(event.target.files) }
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text: trimmed, time: now },
    ])
    setQuestion('')

    try {
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Question failed')
      setMessages((current) => [...current, {
        id: Date.now(),
        role: 'assistant',
        text: result.answer,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }])
    } catch (error) {
      console.error('Question failed:', error)
      setMessages((current) => [...current, {
        id: Date.now(),
        role: 'assistant',
        text: 'I could not answer that question. Please make sure a PDF has finished indexing and try again.',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }])
    }
  }

  const suggestions = ['What are the key takeaways?', 'Summarize this document', 'Find important dates']

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f7f8f6] text-[#202a27]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside className="hidden w-[258px] shrink-0 flex-col border-r border-[#e6e9e5] bg-white px-5 py-6 md:flex">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff2e9] text-[#247857]"><Icon name="logo" size={22} /></span>
            <div><div className="text-[15px] font-semibold tracking-tight">Papertrail</div><div className="text-xs text-[#84908b]">Your document workspace</div></div>
          </div>

          <button onClick={() => fileInput.current?.click()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#287854] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#206746]">
            <Icon name="plus" size={18} /> Add documents
          </button>
          <input ref={fileInput} type="file" accept="application/pdf,.pdf" multiple onChange={handleFileChange} className="hidden" />

          <div className="mt-9 flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-[.12em] text-[#909b96]">Your library</span>
            <span className="rounded-full bg-[#f0f2ef] px-2 py-0.5 text-[11px] font-medium text-[#737f79]">{files.length}</span>
          </div>
          {files.length ? <div className="mt-3 space-y-1">
            {files.map((file) => <div key={file.id} className="group flex items-center gap-3 rounded-xl px-2.5 py-3 hover:bg-[#f6f8f6]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff0ed] text-[#d26b5c]"><Icon name="file" size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-[#36413c]">{file.name}</span><span className="mt-0.5 block text-[11px] text-[#8b9691]">{file.size} · {file.status === 'uploading' ? 'uploading…' : file.status === 'error' ? 'upload failed' : 'received · not indexed yet'}</span></span>
              <button aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))} className="rounded-md p-1 text-[#9aa49f] opacity-0 transition hover:bg-white hover:text-[#be5547] group-hover:opacity-100"><Icon name="close" size={15} /></button>
            </div>)}
          </div> : <div className="mt-4 rounded-xl border border-dashed border-[#e2e7e2] px-3 py-5 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f6f3] text-[#8b9991]"><Icon name="book" size={18} /></span>
            <p className="mt-2 text-xs font-medium text-[#66736c]">Your library is empty</p>
            <p className="mt-1 text-[11px] leading-4 text-[#98a29d]">Add PDFs to keep your research in one place.</p>
          </div>}

          <div className="mt-auto rounded-2xl bg-[#f4f7f4] p-4">
            <div className="flex items-center gap-2 text-[#39785c]"><Icon name="shield" size={17} /><span className="text-xs font-semibold">Grounded by design</span></div>
            <p className="mt-2 text-[11px] leading-[1.55] text-[#77847c]">Answers should cite your documents. If a detail isn’t there, the assistant should say so.</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-[72px] items-center justify-between border-b border-[#e7eae6] bg-white/80 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3f2ea] text-[#287854] md:hidden"><Icon name="logo" size={20} /></span>
              <div><p className="text-[13px] font-semibold text-[#36413c]">New conversation</p><p className="mt-0.5 text-xs text-[#89948e]">{files.length ? `${files.length} PDF${files.length === 1 ? '' : 's'} in this workspace` : 'Your documents, one conversation'}</p></div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#e5e9e5] bg-white px-3 py-1.5 text-[11px] font-medium text-[#647169]"><span className="h-1.5 w-1.5 rounded-full bg-[#59a879]" /> Answers with sources</div>
          </div>

          <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-8 sm:px-8 sm:pt-12">
            <div className="flex w-full max-w-[760px] flex-1 flex-col">
              <div className="mb-7 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2f1e8] text-[#287854]"><Icon name="spark" size={25} /></div>
                <h1 className="mt-4 text-[25px] font-semibold tracking-[-.04em] text-[#26332d] sm:text-[30px]">Ask your documents anything.</h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7d8982]">Get clear answers grounded in your PDFs, with page references you can verify.</p>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto pb-4">
                {messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e2f1e8] text-[#287854]"><Icon name="spark" size={17} /></span>}
                  <div className={`max-w-[88%] sm:max-w-[78%] ${message.role === 'user' ? 'rounded-2xl rounded-tr-md bg-[#287854] px-4 py-3 text-white' : 'rounded-2xl rounded-tl-md border border-[#e8ebe7] bg-white px-4 py-3.5 text-[#49564f] shadow-[0_2px_10px_rgba(30,50,40,.025)]'}`}>
                    <p className="whitespace-pre-wrap text-[13px] leading-[1.7]">{message.text}</p>
                    <p className={`mt-2 text-[10px] ${message.role === 'user' ? 'text-white/65' : 'text-[#9aa39e]'}`}>{message.time}</p>
                  </div>
                </div>)}

                {messages.length === 1 && <div className="pt-2">
                  {!files.length ? <div onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileInput.current?.click()} className={`group cursor-pointer rounded-2xl border border-dashed px-6 py-8 text-center transition ${dragging ? 'border-[#4c9a72] bg-[#edf7f0]' : 'border-[#dce4dc] bg-white/70 hover:border-[#9fbea9] hover:bg-white'}`}>
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4ee] text-[#39815b]"><Icon name="upload" size={21} /></span>
                    <p className="mt-3 text-sm font-semibold text-[#44524a]">Drop your PDFs here</p>
                    <p className="mt-1 text-xs text-[#8b9690]">or <span className="font-semibold text-[#287854]">browse files</span> · PDF only</p>
                  </div> : <div className="rounded-2xl border border-[#e7ebe6] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold text-[#56635b]">Documents in this workspace</p><button onClick={() => fileInput.current?.click()} className="text-xs font-semibold text-[#287854] hover:underline">Add another</button></div>
                    <div className="flex flex-wrap gap-2">{files.map((file) => <span key={file.id} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-[#f5f7f4] px-2.5 py-2 text-xs text-[#536158]"><Icon name="file" size={15} /><span className="max-w-[220px] truncate">{file.name}</span></span>)}</div>
                  </div>}
                  <div className="mt-6"><p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[.11em] text-[#9aa39e]">Try asking</p><div className="flex flex-wrap justify-center gap-2">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)} className="rounded-full border border-[#e4e9e3] bg-white px-3.5 py-2 text-xs text-[#68756d] transition hover:border-[#a9c7b2] hover:text-[#287854]">{item}</button>)}</div></div>
                </div>}
              </div>

              <form onSubmit={sendMessage} className="mt-3 rounded-2xl border border-[#e2e8e1] bg-white p-2 shadow-[0_8px_30px_rgba(43,65,51,.06)] focus-within:border-[#b5cfbc]">
                {files.length > 0 && <div className="flex items-center gap-1.5 px-3 pb-1 pt-1 text-[10px] font-medium text-[#738177]"><Icon name="file" size={13} /> {files.length} PDF{files.length === 1 ? '' : 's'} selected</div>}
                <div className="flex items-end gap-2">
                  <textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} rows={2} placeholder="Ask a question about your PDFs…" className="max-h-36 min-h-[48px] flex-1 resize-y bg-transparent px-3 py-3 text-sm text-[#334139] outline-none placeholder:text-[#a1aaa4]" />
                  <button type="submit" disabled={!question.trim()} aria-label="Send message" className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#287854] text-white transition hover:bg-[#206746] disabled:cursor-not-allowed disabled:bg-[#dce7de] disabled:text-[#9caca0]"><Icon name="send" size={18} /></button>
                </div>
                <div className="flex items-center justify-between px-3 pb-1 pt-1"><span className="text-[10px] text-[#a0aaa3]">Enter to send · Shift + Enter for a new line</span><span className="hidden items-center gap-1 text-[10px] text-[#8b9890] sm:flex"><Icon name="shield" size={12} /> Verify important details in the source</span></div>
              </form>
              <p className="mt-3 text-center text-[10px] leading-4 text-[#9aa39d]">Answers should come from your documents. Always check the cited pages for context.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
