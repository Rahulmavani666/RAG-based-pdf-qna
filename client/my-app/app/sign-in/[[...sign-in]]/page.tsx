import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f7f8f6] px-4 py-12">
      <Suspense fallback={<div className="h-[430px] w-[360px] animate-pulse rounded-2xl bg-white" />}>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
      </Suspense>
    </main>
  )
}
