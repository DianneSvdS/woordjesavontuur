import { useEffect, useMemo, useState } from 'react'
import { wordSets } from './words.js'

const groups = Object.keys(wordSets)
const read = (key, fallback) => {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

export default function App() {
  const [group, setGroup] = useState(() => read('woordjes-group', 'Groep 6'))
  const [mode, setMode] = useState('leren')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [stars, setStars] = useState(() => Number(read('woordjes-stars', '0')))
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)

  const words = useMemo(() => wordSets[group], [group])
  const word = words[index % words.length]

  useEffect(() => {
    localStorage.setItem('woordjes-group', group)
    localStorage.setItem('woordjes-stars', String(stars))
  }, [group, stars])

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onInstall = event => { event.preventDefault(); setInstallPrompt(event) }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('beforeinstallprompt', onInstall)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onInstall)
    }
  }, [])

  const reset = (nextGroup = group) => {
    setGroup(nextGroup); setIndex(0); setAnswer(''); setScore(0); setDone(0); setFeedback(null)
  }
  const next = () => { setIndex(i => (i + 1) % words.length); setAnswer(''); setFeedback(null) }
  const speak = text => {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'nl-NL'; utterance.rate = 0.78
    speechSynthesis.speak(utterance)
  }
  const check = () => {
    if (!answer.trim() || feedback !== null) return
    const correct = answer.trim().toLocaleLowerCase('nl-NL') === word.toLocaleLowerCase('nl-NL')
    setFeedback(correct); setDone(v => v + 1)
    if (correct) { setScore(v => v + 1); setStars(v => v + 1) }
  }
  const install = async () => {
    if (!installPrompt) return
    installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null)
  }

  return <main className="app-shell">
    <div className="app">
      <header>
        <div><p className="eyebrow">✨ Leren wordt een avontuur</p><h1>Woordjesavontuur</h1></div>
        <div className="stars" aria-label={`${stars} sterren`}>⭐ <strong>{stars}</strong></div>
      </header>

      {!online && <div className="notice">📴 Je bent offline. Opgeslagen oefeningen blijven beschikbaar.</div>}
      {installPrompt && <button className="install" onClick={install}>📱 Zet Woordjesavontuur op mijn telefoon</button>}

      <div className="layout">
        <aside>
          <section className="panel">
            <h2>📖 Kies je groep</h2>
            <div className="groups">{groups.map(g =>
              <button key={g} className={g === group ? 'active' : ''} onClick={() => reset(g)}>{g.replace('Groep ', 'G')}</button>
            )}</div>
          </section>
          <div className="modes">
            <button className={mode === 'leren' ? 'active' : ''} onClick={() => { setMode('leren'); setFeedback(null) }}>Bekijken</button>
            <button className={mode === 'dictee' ? 'active purple' : ''} onClick={() => { setMode('dictee'); setFeedback(null); setAnswer('') }}>Dictee</button>
          </div>
        </aside>

        <section className="practice">
          <div className="meta"><span>{group}</span><span>{done} geoefend · {score} goed</span></div>
          <div className="progress"><div style={{ width: `${Math.min(100, done / words.length * 100)}%` }} /></div>
          <div className="card">
            {mode === 'leren' ? <>
              <p className="label blue">Lees het woord</p>
              <div className="word">{word}</div>
              <button className="listen" onClick={() => speak(word)}>🔊 Luister</button>
              <button className="primary" onClick={next}>Volgende woord</button>
            </> : <>
              <p className="label violet">Luister en typ</p>
              <button className="speaker" aria-label="Luister naar het woord" onClick={() => speak(word)}>🔊</button>
              <div className="answer-row">
                <input autoCapitalize="none" autoCorrect="off" spellCheck="false" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && (feedback === null ? check() : next())} placeholder="Typ het woord…" />
                <button className="primary purple-bg" onClick={feedback === null ? check : next}>{feedback === null ? 'Nakijken' : 'Verder'}</button>
              </div>
              {feedback !== null && <div className={`feedback ${feedback ? 'correct' : 'wrong'}`}>{feedback ? '✓ Super, goed geschreven!' : `✕ Bijna! Het woord is ${word}.`}</div>}
            </>}
          </div>
          <button className="reset" onClick={() => reset()}>↻ Oefening opnieuw</button>
        </section>
      </div>
    </div>
  </main>
}
