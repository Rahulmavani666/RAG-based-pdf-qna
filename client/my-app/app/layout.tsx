import type { Metadata } from 'next'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { ui } from '@clerk/ui'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Suspense } from 'react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Papertrail | PDF workspace',
  description: 'Ask questions about your PDFs and check answers against the source pages.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          ui={ui}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          afterSignOutUrl="/"
        >
          <header className="relative z-20 h-16 shrink-0 border-b border-[#e7ebe6] bg-white">
            <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8">
              <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-[#304037]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dff2e9] text-[#287854]">✳</span>
                Papertrail
              </Link>
              <nav className="flex items-center gap-3" aria-label="Account navigation">
                <Suspense fallback={<div className="h-9 w-24" />}>
                  <Show when="signed-out">
                    <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                      <button className="rounded-lg px-3 py-2 text-sm font-medium text-[#56635b] hover:bg-[#f4f7f4]">Sign in</button>
                    </SignInButton>
                    <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                      <button className="rounded-lg bg-[#287854] px-4 py-2 text-sm font-semibold text-white hover:bg-[#206746]">Get started</button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-[#56635b] hover:bg-[#f4f7f4]">Dashboard</Link>
                    <UserButton />
                  </Show>
                </Suspense>
              </nav>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
