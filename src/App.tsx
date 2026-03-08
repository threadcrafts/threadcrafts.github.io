import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Landing } from '@/pages/Landing'
import { Generator } from '@/pages/Generator'
import { Gallery } from '@/pages/Gallery'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('string-art-dark')
    if (stored !== null) return stored === '1'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('string-art-dark', '1')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('string-art-dark', '0')
    }
  }, [darkMode])

  return (
    <BrowserRouter>
      <Layout darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<Generator />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
