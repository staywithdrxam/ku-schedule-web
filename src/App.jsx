import React, { useState, useEffect, useCallback, useRef } from 'react'
import { THEMES, THEME_NAMES } from './themes'
import { DAYS, COLORS, t2m } from './constants'
import SplashScreen from './components/SplashScreen'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import CourseDialog from './components/CourseDialog'
import TutorialModal from './components/TutorialModal'

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
  const [showTutorial, setShowTutorial] = useState(false)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
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
  const [prefillSlot, setPrefillSlot] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [unsaved, setUnsaved] = useState(false)
  const [activeTab, setActiveTab] = useState('timetable')
  const [undoStack, setUndoStack] = useState([])
  const [undoToast, setUndoToast] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [copiedCourse, setCopiedCourse] = useState(null)
  const [copyToast, setCopyToast] = useState('')
  const pasteIdxRef = useRef(-1)
  const scheduleRef = useRef(schedule)
  const copiedCourseRef = useRef(null)
  const selectedIdxRef = useRef(selectedIdx)
  const dialogOpenRef = useRef(dialogOpen)
  useEffect(() => { scheduleRef.current = schedule }, [schedule])
  useEffect(() => { copiedCourseRef.current = copiedCourse }, [copiedCourse])
  useEffect(() => { selectedIdxRef.current = selectedIdx }, [selectedIdx])
  useEffect(() => { dialogOpenRef.current = dialogOpen }, [dialogOpen])

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
    const timer = setTimeout(() => {
      setSplash(false)
      const hideUntil = parseInt(localStorage.getItem('ku_tutorial_hide_until') || '0')
      setShowTutorial(Date.now() >= hideUntil)
    }, 1600)
    return () => clearTimeout(timer)
  }, [])

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule))
    setUnsaved(false)
  }, [schedule])

  const clearAll = useCallback(() => { setConfirmOpen(true) }, [])

  const confirmClearAll = useCallback(() => {
    setSchedule([])
    setSelectedIdx(null)
    setUnsaved(false)
    localStorage.setItem(STORAGE_KEY, '[]')
    setConfirmOpen(false)
  }, [])

  const resizeSlot = useCallback((ci, slotIdx, newEnd) => {
    setSchedule(prev => {
      setUndoStack(stack => [...stack.slice(-19), prev])
      return prev.map((c, i) => {
        if (i !== ci) return c
        const slots = (c.slots || []).map((s, si) =>
          si === slotIdx ? { ...s, end: newEnd } : s
        )
        return { ...c, slots }
      })
    })
    setUnsaved(true)
  }, [])

  const moveSlot = useCallback((ci, slotIdx, newDay, newStart, newEnd) => {
    setSchedule(prev => {
      setUndoStack(stack => [...stack.slice(-19), prev])
      return prev.map((c, i) => {
        if (i !== ci) return c
        const slots = (c.slots || []).map((s, si) =>
          si === slotIdx ? { ...s, day: newDay, start: newStart, end: newEnd } : s
        )
        return { ...c, slots }
      })
    })
    setUnsaved(true)
  }, [])

  const openAdd = () => { setEditIdx(null); setPrefillSlot(null); setDialogOpen(true) }
  const openEdit = (idx) => { setEditIdx(idx); setPrefillSlot(null); setDialogOpen(true) }
  const openAddAt = useCallback((day, start, end) => {
    setEditIdx(null)
    setPrefillSlot({ day, start, end })
    setDialogOpen(true)
  }, [])

  const deleteCourse = useCallback((idx) => {
    setSchedule(prev => {
      setUndoStack(stack => [...stack.slice(-19), prev])
      const next = prev.filter((_, i) => i !== idx)
      setUnsaved(true)
      return assignColors(next)
    })
    setSelectedIdx(null)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (dialogOpenRef.current) return
      const mod = e.ctrlKey || e.metaKey

      if (mod && (e.key === 'z' || e.key === 'Z')) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        setUndoStack(stack => {
          if (!stack.length) {
            setCopyToast('ไม่มีอะไรให้ย้อนกลับ')
            setTimeout(() => setCopyToast(''), 1500)
            return stack
          }
          const prev = stack[stack.length - 1]
          setSchedule(prev)
          setUnsaved(true)
          setUndoToast(true)
          setTimeout(() => setUndoToast(false), 2000)
          return stack.slice(0, -1)
        })
      }

      if (mod && (e.key === 'c' || e.key === 'C')) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        const si = selectedIdxRef.current
        const cur = scheduleRef.current
        if (si !== null && cur[si]) {
          const course = cur[si]
          setCopiedCourse({ ...course })
          copiedCourseRef.current = { ...course }
          setCopyToast(`คัดลอก "${course.name || course.code}" แล้ว`)
          setTimeout(() => setCopyToast(''), 2000)
        } else {
          setCopyToast('กดที่วิชาในตารางก่อน แล้วค่อยกด Ctrl+C')
          setTimeout(() => setCopyToast(''), 2000)
        }
      }

      if (mod && (e.key === 'v' || e.key === 'V')) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        const copied = copiedCourseRef.current
        if (!copied) {
          setCopyToast('ยังไม่ได้คัดลอกวิชา — กด Ctrl+C ที่วิชาที่เลือกก่อน')
          setTimeout(() => setCopyToast(''), 2000)
          return
        }
        pasteIdxRef.current = -1
        setSchedule(prev => {
          setUndoStack(stack => [...stack.slice(-19), prev])
          pasteIdxRef.current = prev.length
          const pasted = { ...copied, name: copied.name ? `${copied.name} (สำเนา)` : '' }
          return assignColors([...prev, pasted])
        })
        setUnsaved(true)
        setTimeout(() => {
          if (pasteIdxRef.current >= 0) {
            setEditIdx(pasteIdxRef.current)
            setDialogOpen(true)
          }
        }, 0)
        setCopyToast('วางวิชาแล้ว — แก้ไขเวลาได้เลย')
        setTimeout(() => setCopyToast(''), 2500)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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
      {splash && <SplashScreen theme={theme} />}
      <div className={`app-layout${leftCollapsed ? ' left-collapsed' : ''}`}>
        {/* Left panel — hidden on mobile when timetable tab active */}
        <LeftPanel
          className={activeTab !== 'settings' ? 'panel-hidden-mobile' : ''}
          collapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed(c => !c)}
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
          onEdit={openEdit} onDelete={deleteCourse} onAddAt={openAddAt} onMoveSlot={moveSlot} onResizeSlot={resizeSlot}
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

      {/* Mobile theme toggle button — visible on timetable tab */}
      {activeTab === 'timetable' && (
        <button
          className="mobile-theme-toggle"
          onClick={() => {
            if (isAuto) setTheme('Light')
            else if (theme === 'Light') setTheme('Dark')
            else setTheme('__auto__')
          }}
          title="เปลี่ยนธีม"
        >
          {isAuto ? '🌗' : theme === 'Dark' ? '🌙' : '☀️'}
        </button>
      )}

      {/* Expand button — shows when left panel is collapsed (desktop only) */}
      {leftCollapsed && (
        <button className="panel-expand-btn" onClick={() => setLeftCollapsed(false)} title="แสดงเครื่องมือ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      )}

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      {(undoToast || copyToast) && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--TEXT)', color: 'var(--BG)',
          padding: '10px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          pointerEvents: 'none', whiteSpace: 'nowrap'
        }}>
          {copyToast || 'ย้อนกลับแล้ว (Ctrl+Z)'}
        </div>
      )}

      {confirmOpen && (
        <div className="dialog-overlay" onClick={e => e.target === e.currentTarget && setConfirmOpen(false)}>
          <div className="confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <div className="confirm-title">ล้างตารางเรียน</div>
            <div className="confirm-desc">วิชาทั้งหมดจะถูกลบออก ไม่สามารถย้อนกลับได้</div>
            <div className="confirm-actions">
              <button className="btn-cancel confirm-cancel" onClick={() => setConfirmOpen(false)}>ยกเลิก</button>
              <button className="btn-danger-confirm" onClick={confirmClearAll}>ล้างทั้งหมด</button>
            </div>
          </div>
        </div>
      )}

      {dialogOpen && (
        <CourseDialog
          initial={editIdx !== null ? schedule[editIdx] : null}
          prefillSlot={editIdx === null ? prefillSlot : null}
          onSubmit={submitCourse}
          onCancel={() => { setDialogOpen(false); setPrefillSlot(null) }}
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
