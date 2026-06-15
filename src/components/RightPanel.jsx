import React, { useState } from 'react'
import TimetableCanvas from './TimetableCanvas'
import { DAYS } from '../constants'

const toTimeStr = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export default function RightPanel({
  className = '',
  schedule, conflicts, selectedIdx, setSelectedIdx,
  onEdit, onDelete, onAddAt, onMoveSlot, theme, semester, tooltip, setTooltip
}) {
  const totalCr = schedule.reduce((s, c) => s + (Number(c.credits) || 0), 0)
  const totalSlots = schedule.reduce((s, c) => s + (c.slots || []).length, 0)
  const [tableCollapsed, setTableCollapsed] = useState(false)
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(null)

  function handleSlotHover(hit) {
    if (!hit) { setTooltip(null); return }
    const c = hit.course
    setTooltip({
      x: hit.x + 12, y: hit.y - 10,
      content: [
        c.name || c.code,
        c.code && c.name ? `รหัส: ${c.code}` : '',
        `เวลา: ${hit.slot.start} - ${hit.slot.end}`,
        hit.slot.room ? `ห้อง: ${hit.slot.room}` : '',
        c.instructor ? `ผู้สอน: ${c.instructor}` : '',
        hit.slot.isLab ? 'ปฏิบัติการ (Lab)' : '',
      ].filter(Boolean)
    })
  }

  function handleSlotClick(ci) {
    setSelectedIdx(selectedIdx === ci ? null : ci)
  }

  function handleEmptyClick({ di, minM }) {
    setSelectedIdx(null)
    const day = DAYS[di]
    const snapped = Math.round(minM / 30) * 30
    const startM = Math.max(7 * 60, Math.min(19 * 60, snapped))
    const endM   = Math.min(20 * 60, startM + 60)
    onAddAt && onAddAt(day, toTimeStr(startM), toTimeStr(endM))
  }

  return (
    <div className={`right-panel ${className}`}>
      {/* Stats bar */}
      <div className="stats-bar">
        <div>
          <div className="stats-label">รายวิชา</div>
          <div className="stats-main">{schedule.length} วิชา</div>
        </div>
        <div className="stats-divider" />
        <div>
          <div className="stats-label">หน่วยกิต</div>
          <div className="stats-main">{totalCr} หน่วยกิต</div>
        </div>
        <div className="stats-divider" />
        <div>
          <div className="stats-label">คาบ/สัปดาห์</div>
          <div className="stats-main">{totalSlots} คาบ</div>
        </div>
        {conflicts.size > 0 && (
          <>
            <div className="stats-divider" />
            <div>
              <div className="stats-label" style={{ color: 'var(--DANGER)' }}>ตีกัน</div>
              <div className="stats-conflict" style={{ color: 'var(--DANGER)', fontWeight: 700 }}>
                ⚠ {conflicts.size} วิชา
              </div>
            </div>
          </>
        )}
        <div className="stats-clock">{semester}</div>
      </div>

      {/* Canvas — scrollable horizontally on mobile */}
      <div className="canvas-wrap">
        <div className="canvas-scroll">
          <TimetableCanvas
            schedule={schedule}
            conflicts={conflicts}
            theme={theme}
            selectedIdx={selectedIdx}
            onSlotHover={handleSlotHover}
            onSlotClick={handleSlotClick}
            onSlotEdit={onEdit}
            onEmptyClick={handleEmptyClick}
            onSlotMove={onMoveSlot}
          />
        </div>
        {selectedIdx !== null && (
          <div className="canvas-action-bar">
            <button className="cab-btn cab-edit" onClick={() => onEdit(selectedIdx)}>
              ✎ แก้ไข
            </button>
            <button className="cab-btn cab-delete" onClick={() => setDeleteConfirmIdx(selectedIdx)}>
              🗑 ลบ
            </button>
            <button className="cab-btn cab-close" onClick={() => setSelectedIdx(null)}>
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Course table */}
      <div className="course-table-wrap">
        <div className="table-header">
          <button onClick={() => setTableCollapsed(c => !c)} style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: 'var(--MUTED)', display: 'flex', alignItems: 'center', flexShrink: 0
          }} title={tableCollapsed ? 'ขยาย' : 'ย่อ'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform .2s', transform: tableCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <span className="table-title">รายวิชาที่ลงทะเบียน</span>
        </div>
        <div style={{ maxHeight: 150, overflowY: 'auto', display: tableCollapsed ? 'none' : undefined }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 28 }}>#</th>
                <th>รหัส</th>
                <th>ชื่อวิชา</th>
                <th>หน่วยกิต</th>
                <th>คาบ</th>
                <th>ผู้สอน</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--MUTED)', padding: '14px' }}>
                  ยังไม่มีรายวิชา — กด "+" เพื่อเพิ่มวิชา
                </td></tr>
              ) : schedule.map((c, i) => (
                <tr key={i}
                  className={`${conflicts.has(i) ? 'conflict-row' : ''} ${selectedIdx === i ? 'selected' : ''}`}
                  onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                >
                  <td>
                    <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: c.color, marginRight: 4 }} />
                    {i + 1}
                  </td>
                  <td>{c.code || '-'}</td>
                  <td>{c.name || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{c.credits || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{(c.slots || []).length}</td>
                  <td style={{ color: 'var(--MUTED)' }}>{c.instructor || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.content.map((line, i) => (
            <div key={i} style={{ fontWeight: i === 0 ? 700 : 400 }}>{line}</div>
          ))}
        </div>
      )}

      {deleteConfirmIdx !== null && (
        <div className="dialog-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirmIdx(null)}>
          <div className="confirm-modal">
            <div className="confirm-icon">⚠️</div>
            <div className="confirm-title">ลบวิชานี้?</div>
            <div className="confirm-desc">
              <strong>{schedule[deleteConfirmIdx]?.name || schedule[deleteConfirmIdx]?.code || 'วิชานี้'}</strong>
              <br />จะถูกลบออกจากตาราง สามารถกด Ctrl+Z เพื่อย้อนกลับได้
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel confirm-cancel" onClick={() => setDeleteConfirmIdx(null)}>ยกเลิก</button>
              <button className="btn-danger-confirm" onClick={() => {
                onDelete(deleteConfirmIdx)
                setDeleteConfirmIdx(null)
                setSelectedIdx(null)
              }}>ลบวิชา</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
