import { auth } from '@clerk/nextjs/server'
import type { ReactNode } from 'react'
import { Suspense } from 'react'

async function RequireUser({ children }: { children: ReactNode }) {
  await auth.protect()
  return children
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center bg-[#f7f8f6] text-sm text-[#738177]">Checking your session…</main>}>
      <RequireUser>{children}</RequireUser>
    </Suspense>
  )
}
