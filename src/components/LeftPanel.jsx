import React, { useRef, useState } from 'react'
import { THEME_NAMES, LIGHT_THEMES } from '../themes'
import { DAYS, DAY_FULL } from '../constants'
import { exportTimetable } from '../utils/exportTimetable'

const SEMS = ['ภาคต้น', 'ภาคปลาย']

export default function LeftPanel({
  className = '',
  theme, setTheme, semester, setSemester,
  schedule, totalCr, maxCr, setMaxCr,
  conflicts, onAdd, onSave, onClear, unsaved
}) {
  const maxCrRef = useRef()
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState(new Set())

  const prog = maxCr > 0 ? Math.min(totalCr / maxCr, 1) : 0
  const barColor = totalCr > maxCr ? 'var(--DANGER)'
    : totalCr >= maxCr * 0.85 ? 'var(--SUCCESS)' : 'var(--ACCENT)'
  const activeDays = new Set(schedule.flatMap(c => (c.slots || []).map(s => s.day)))

  function handleMaxCrBlur() {
    const v = parseInt(maxCrRef.current?.value)
    setMaxCr(isNaN(v) || v < 1 ? 1 : v)
  }

  function toggleSelect(i) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function copySelected() {
    const targets = selected.size > 0
      ? schedule.filter((_, i) => selected.has(i))
      : schedule
    const text = targets.map(c => c.code || '').filter(Boolean).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`left-panel ${className}`}>

      {/* ── Header ── */}
      <div className="left-header">
        <div className="left-header-accent" />
        <div className="left-header-inner">
          <div className="left-header-text">
            <div className="left-header-title">📅 ตารางเรียน</div>
            <div className="left-header-sub">Schedule Planner</div>
          </div>
          <div className="left-header-right">
            <select className="theme-select" value={theme} onChange={e => setTheme(e.target.value)}>
              {THEME_NAMES.map(n => <option key={n}>{n}</option>)}
            </select>
            <select className="sem-select" value={semester} onChange={e => setSemester(e.target.value)}>
              {SEMS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="left-body">

        {/* 1. ปุ่มเพิ่มวิชา */}
        <button className="btn-add-course" onClick={onAdd}>
          ＋ เพิ่มรายวิชา
        </button>

        {/* 2. หน่วยกิต + วันที่มีเรียน รวมกัน */}
        <div className="card">
          {/* Credits */}
          <div className="credit-row">
            <span className="credit-label">หน่วยกิต</span>
            <span className="credit-right">
              <span style={{ fontSize: 15, fontWeight: 800 }}>{totalCr}</span>
              <span style={{ color: 'var(--MUTED)' }}>/</span>
              <input
                ref={maxCrRef}
                defaultValue={maxCr}
                key={maxCr}
                type="number" min="1" max="99"
                onBlur={handleMaxCrBlur}
                onKeyDown={e => e.key === 'Enter' && handleMaxCrBlur()}
              />
            </span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${prog * 100}%`, background: barColor }} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--BORDER)', margin: '4px 12px 0' }} />

          {/* Days */}
          <div className="days-grid" style={{ paddingTop: 8 }}>
            {DAYS.map(d => (
              <div className="day-dot" key={d}>
                <div className={`day-circle${activeDays.has(d) ? ' active' : ''}`}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. รายวิชาที่ลงทะเบียน */}
        {schedule.length > 0 ? (
          <div className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px 6px', gap: 8 }}>
              <span className="card-label" style={{ padding: 0, flex: 1 }}>
                รายวิชา {selected.size > 0 && <span style={{ color: 'var(--ACCENT)', fontSize: 10 }}>({selected.size} เลือกอยู่)</span>}
              </span>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())} style={{
                  fontSize: 10, background: 'none', color: 'var(--MUTED)',
                  border: '1px solid var(--BORDER)', borderRadius: 4,
                  padding: '3px 7px', cursor: 'pointer', fontFamily: 'var(--font)'
                }}>ยกเลิก</button>
              )}
              <button onClick={copySelected} style={{
                fontSize: 11, fontWeight: 700,
                background: copied ? 'var(--SUCCESS)' : 'var(--ACCENT)',
                color: 'var(--BG)', border: 'none', borderRadius: 5,
                padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'background .2s', whiteSpace: 'nowrap'
              }}>
                {copied ? '✓ คัดลอกแล้ว' : selected.size > 0 ? `คัดลอก ${selected.size} รหัส` : 'คัดลอกรหัสวิชา'}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
              {schedule.map((c, i) => {
                const isSel = selected.has(i)
                const isConflict = conflicts.has(i)
                return (
                  <div key={i} onClick={() => toggleSelect(i)} style={{
                    display: 'flex', alignItems: 'center', gap: 0,
                    marginBottom: 5, borderRadius: 9, cursor: 'pointer', overflow: 'hidden',
                    background: isSel ? 'var(--BORDER)' : 'var(--BG)',
                    outline: isSel ? '2px solid var(--ACCENT)' : 'none',
                    transition: 'background .15s, outline .15s',
                    boxShadow: isSel ? '0 0 0 0' : '0 1px 3px rgba(0,0,0,.15)'
                  }}>
                    {/* left color bar */}
                    <div style={{ width: 4, alignSelf: 'stretch', background: c.color, flexShrink: 0 }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '8px 10px' }}>
                      {/* tick circle */}
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isSel ? 'var(--ACCENT)' : 'var(--BORDER)'}`,
                        background: isSel ? 'var(--ACCENT)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: 'var(--BG)', fontWeight: 900,
                        transition: 'background .15s, border .15s'
                      }}>
                        {isSel ? '✓' : ''}
                      </div>

                      <span style={{ fontWeight: 800, color: 'var(--TEXT)', fontSize: 12, minWidth: 70 }}>
                        {c.code || '-'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--MUTED)', flexShrink: 0 }}>
                        หมู่ {c.section || '-'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--MUTED)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                        {c.name}
                      </span>
                      {isConflict && <span style={{ fontSize: 12, flexShrink: 0 }} title="วิชาตีกัน">⚠️</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--MUTED)', fontSize: 12, padding: '24px 0' }}>
            ยังไม่มีรายวิชา<br />
            <span style={{ fontSize: 11, opacity: .6 }}>กด "เพิ่มรายวิชา" เพื่อเริ่มต้น</span>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="left-footer">
        <div className="footer-row">
          <button className="btn btn-save" onClick={onSave}>
            💾 {unsaved ? 'บันทึก*' : 'บันทึก'}
          </button>
          <button className="btn btn-clear" onClick={onClear}>
            🗑 ล้างทั้งหมด
          </button>
        </div>
        <button className="btn btn-export" onClick={() => exportTimetable({ schedule, conflicts, theme, semester })}>
          🖼 บันทึกรูปภาพตาราง
        </button>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--MUTED)', paddingTop: 2, lineHeight: 1.6 }}>
          by น้องดรีม · วิทย์คอม ปี 2 · ม.เกษตรศาสตร์ กำแพงแสน
        </div>
      </div>
    </div>
  )
}
