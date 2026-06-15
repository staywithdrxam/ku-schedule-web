import React, { useState, useEffect } from 'react'
import { DAYS, DAY_FULL, TIMES, COLORS } from '../constants'
import ColorWheel from './ColorWheel'

const DEFAULT_SLOT = () => ({ day: 'จ', start: '08:00', end: '09:00', room: '', isLab: false })

export default function CourseDialog({ initial, prefillSlot, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [code, setCode] = useState(initial?.code || '')
  const [section, setSection] = useState(initial?.section || '')
  const [credits, setCredits] = useState(initial?.credits ?? 3)
  const [instructor, setInstructor] = useState(initial?.instructor || '')
  const [color, setColor] = useState(initial?.color || COLORS[0])
  const [slots, setSlots] = useState(() => {
    if (initial?.slots?.length) return initial.slots
    if (prefillSlot) return [{ day: prefillSlot.day, start: prefillSlot.start, end: prefillSlot.end, room: '', isLab: false }]
    return [DEFAULT_SLOT()]
  })

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  function addSlot() { setSlots(prev => [...prev, DEFAULT_SLOT()]) }
  function removeSlot(i) { setSlots(prev => prev.filter((_, idx) => idx !== i)) }
  function updateSlot(i, field, val) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  function handleSubmit() {
    if (!name.trim() && !code.trim()) { alert('กรุณาใส่ชื่อหรือรหัสวิชา'); return }
    onSubmit({ name: name.trim(), code: code.trim(), section: section.trim(), credits: Number(credits) || 0, instructor: instructor.trim(), color, slots })
  }

  return (
    <div className="dialog-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="dialog">
        <div className="dialog-header">
          <div className="dialog-accent" />
          <div className="dialog-title-row">
            <div>
              <div className="dialog-title">{initial ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่'}</div>
              <div className="dialog-sub">กรอกข้อมูลรายวิชาและเวลาเรียน</div>
            </div>
          </div>
        </div>

        <div className="dialog-body">
          {/* Name & Code */}
          <div>
            <div className="section-label"><div className="section-bar" />ข้อมูลรายวิชา</div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">ชื่อวิชา *</label>
              <input className="form-input" placeholder="เช่น แคลคูลัส 1" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="meta-row">
              <div className="form-group">
                <label className="form-label">รหัสวิชา</label>
                <input className="form-input" placeholder="เช่น 01420117" value={code} onChange={e => setCode(e.target.value)} />
              </div>
              <div className="form-group" style={{ maxWidth: 80 }}>
                <label className="form-label">หมู่เรียน</label>
                <input className="form-input" placeholder="เช่น 711" value={section} onChange={e => setSection(e.target.value)} />
              </div>
              <div className="form-group" style={{ maxWidth: 80 }}>
                <label className="form-label">หน่วยกิต</label>
                <input className="form-input" type="number" min="0" max="12" value={credits} onChange={e => setCredits(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 8 }}>
              <label className="form-label">ผู้สอน</label>
              <input className="form-input" placeholder="ชื่อผู้สอน (ถ้ามี)" value={instructor} onChange={e => setInstructor(e.target.value)} />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <div className="section-label"><div className="section-bar" />สีรายวิชา</div>
            {/* Palette */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, padding: '4px 2px' }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setColor(c)} title={c} style={{
                  width: 32, height: 32, borderRadius: 9, background: c, cursor: 'pointer',
                  outline: color === c ? '3px solid var(--TEXT)' : '2px solid transparent',
                  outlineOffset: 3,
                  transform: color === c ? 'scale(1.18)' : 'scale(1)',
                  transition: 'transform .12s, outline .12s',
                  boxShadow: '0 2px 8px rgba(0,0,0,.2)'
                }} />
              ))}
            </div>
            {/* Wheel picker + hex input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ColorWheel color={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#b4d4ff'} onChange={setColor} />
              <input
                className="form-input"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="#rrggbb"
                style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}
              />
            </div>
          </div>

          {/* Slots */}
          <div>
            <div className="section-label"><div className="section-bar" />เวลาเรียน</div>
            <div className="slots-container">
              {slots.map((slot, i) => (
                <div className="slot-card" key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div className="slot-badge">คาบที่ {i + 1}</div>
                    {slots.length > 1 && (
                      <button className="btn-remove-slot" onClick={() => removeSlot(i)} title="ลบคาบนี้">✕</button>
                    )}
                  </div>
                  <div className="slot-row">
                    <span className="slot-label">วัน</span>
                    <select className="slot-select" value={slot.day} onChange={e => updateSlot(i, 'day', e.target.value)}>
                      {DAYS.map(d => <option key={d} value={d}>{DAY_FULL[d] || d} ({d})</option>)}
                    </select>
                    <label className="lab-check" style={{ marginLeft: 'auto' }}>
                      <input type="checkbox" checked={!!slot.isLab} onChange={e => updateSlot(i, 'isLab', e.target.checked)} />
                      Lab
                    </label>
                  </div>
                  <div className="slot-row">
                    <span className="slot-label">เริ่ม</span>
                    <select className="slot-select" value={slot.start} onChange={e => updateSlot(i, 'start', e.target.value)}>
                      {TIMES.map(tm => <option key={tm}>{tm}</option>)}
                    </select>
                    <span className="slot-label">สิ้นสุด</span>
                    <select className="slot-select" value={slot.end} onChange={e => updateSlot(i, 'end', e.target.value)}>
                      {TIMES.map(tm => <option key={tm}>{tm}</option>)}
                    </select>
                  </div>
                  <div className="slot-row">
                    <span className="slot-label">ห้อง</span>
                    <input className="slot-input" placeholder="เช่น ศร.4 ห้อง 303" value={slot.room}
                      onChange={e => updateSlot(i, 'room', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-add-slot" onClick={addSlot}>＋ เพิ่มคาบเรียน</button>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-cancel" onClick={onCancel}>ยกเลิก</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {initial ? 'บันทึกการแก้ไข' : 'เพิ่มรายวิชา'}
          </button>
        </div>
      </div>
    </div>
  )
}
