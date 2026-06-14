import React, { useState, useEffect, useCallback } from 'react'
import { THEMES, THEME_NAMES } from './themes'
import { DAYS, COLORS, t2m } from './constants'
import SplashScreen from './components/SplashScreen'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import CourseDialog from './components/CourseDialog'

const STORAGE_KEY = 'ku_schedule_v1'
const STORAGE_THEME = 'ku_theme_v1'
const STORAGE_SEM = 'ku_semester_v1'
const STORAGE_MAX_CR = 'ku_max_cr_v1'
const STORAGE_AUTO = 'ku_theme_auto_v1'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
}

function applyTheme(name) {
  const t = THEMES[name] || THEMES.Dark
  const root = document.documentElement.style
  Object.entries(t).forEach(([k, v]) => root.setProperty(`--${k}`, v))
}

function assignColors(schedule) {
  return schedule.map((c, i) => ({ ...c, color: c.color || COLORS[i % COLORS.length] }))
}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [isAuto, setIsAuto] = useState(() => localStorage.getItem(STORAGE_AUTO) !== 'false')
  const [theme, setThemeRaw] = useState(() => {
    const auto = localStorage.getItem(STORAGE_AUTO) !== 'false'
    if (!auto) return localStorage.getItem(STORAGE_THEME) || 'Light'
    return getSystemTheme()
  })
  const [semester, setSemester] = useState(() => localStorage.getItem(STORAGE_SEM) || 'ภาคต้นการศึกษา')
  const [maxCr, setMaxCr] = useState(() => parseInt(localStorage.getItem(STORAGE_MAX_CR) || '21'))
  const [schedule, setSchedule] = useState(() => {
    try { return assignColors(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
    catch { return [] }
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [unsaved, setUnsaved] = useState(false)
  const [activeTab, setActiveTab] = useState('timetable')

  const setTheme = useCallback((val) => {
    if (val === '__auto__') {
      setIsAuto(true)
      localStorage.setItem(STORAGE_AUTO, 'true')
      setThemeRaw(getSystemTheme())
    } else {
      setIsAuto(false)
      localStorage.setItem(STORAGE_AUTO, 'false')
      localStorage.setItem(STORAGE_THEME, val)
      setThemeRaw(val)
    }
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!isAuto) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setThemeRaw(e.matches ? 'Dark' : 'Light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [isAuto])

  useEffect(() => { localStorage.setItem(STORAGE_SEM, semester) }, [semester])
  useEffect(() => { localStorage.setItem(STORAGE_MAX_CR, String(maxCr)) }, [maxCr])

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule))
    setUnsaved(false)
  }, [schedule])

  const clearAll = useCallback(() => {
    if (!window.confirm('ล้างตารางเรียนทั้งหมดหรือไม่?')) return
    setSchedule([])
    setSelectedIdx(null)
    setUnsaved(false)
    localStorage.setItem(STORAGE_KEY, '[]')
  }, [])

  const openAdd = () => { setEditIdx(null); setDialogOpen(true) }
  const openEdit = (idx) => { setEditIdx(idx); setDialogOpen(true) }

  const deleteCourse = useCallback((idx) => {
    setSchedule(prev => {
      const next = prev.filter((_, i) => i !== idx)
      setUnsaved(true)
      return assignColors(next)
    })
    setSelectedIdx(null)
  }, [])

  const submitCourse = useCallback((course) => {
    setSchedule(prev => {
      const next = editIdx !== null
        ? prev.map((c, i) => i === editIdx ? { ...c, ...course } : c)
        : [...prev, course]
      setUnsaved(true)
      return assignColors(next)
    })
    setDialogOpen(false)
  }, [editIdx])

  const totalCr = schedule.reduce((s, c) => s + (Number(c.credits) || 0), 0)
  const conflicts = findConflicts(schedule)

  return (
    <>
      {splash && <SplashScreen />}
      <div className="app-layout">
        {/* Left panel — hidden on mobile when timetable tab active */}
        <LeftPanel
          className={activeTab !== 'settings' ? 'panel-hidden-mobile' : ''}
          theme={theme} setTheme={setTheme} isAuto={isAuto}
          semester={semester} setSemester={setSemester}
          schedule={schedule} totalCr={totalCr} maxCr={maxCr} setMaxCr={setMaxCr}
          conflicts={conflicts}
          onAdd={openAdd} onSave={save} onClear={clearAll}
          unsaved={unsaved}
        />
        {/* Right panel — hidden on mobile when settings tab active */}
        <RightPanel
          className={activeTab !== 'timetable' ? 'panel-hidden-mobile' : ''}
          schedule={schedule} conflicts={conflicts}
          selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx}
          onEdit={openEdit} onDelete={deleteCourse}
          tooltip={tooltip} setTooltip={setTooltip}
          theme={theme} semester={semester}
        />
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tabbar">
        <button
          className={`tab-btn${activeTab === 'timetable' ? ' active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          <span className="tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <rect x="7" y="13.5" width="2.5" height="2.5" rx="0.4" fill="currentColor" stroke="none"/>
              <rect x="10.8" y="13.5" width="2.5" height="2.5" rx="0.4" fill="currentColor" stroke="none"/>
            </svg>
          </span>
          <span className="tab-label">ตาราง</span>
        </button>
        <button className="tab-btn tab-add" onClick={openAdd}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
        <button
          className={`tab-btn${activeTab === 'settings' ? ' active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="8" y1="8" x2="16" y2="8"/>
              <line x1="8" y1="12" x2="13" y2="12"/>
            </svg>
          </span>
          <span className="tab-label">วิชา</span>
        </button>
      </nav>

      {dialogOpen && (
        <CourseDialog
          initial={editIdx !== null ? schedule[editIdx] : null}
          onSubmit={submitCourse}
          onCancel={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}

function findConflicts(schedule) {
  const conflicts = new Set()
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      for (const si of schedule[i].slots || []) {
        for (const sj of schedule[j].slots || []) {
          if (si.day !== sj.day) continue
          const aS = t2m(si.start), aE = t2m(si.end)
          const bS = t2m(sj.start), bE = t2m(sj.end)
          if (aS < bE && bS < aE) { conflicts.add(i); conflicts.add(j) }
        }
      }
    }
  }
  return conflicts
}
