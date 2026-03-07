// File: d:\laragon\www\next-js\psb-app\app\(auth)\login\page.tsx
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-shell">
        <div className="login-card">
          <div className="login-loading-container">
            <div className="login-spinner" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}