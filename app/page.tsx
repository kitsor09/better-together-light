'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Better Together</h1>
      <p>Deepen love, explore desires, and grow together.</p>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link href="/quiz">💬 Take a Couples Quiz</Link>
        <Link href="/journal">📓 Open Journal</Link>
        <Link href="/fantasy">🔥 Desire & Fantasy</Link>
      </div>
    </main>
  );
}
