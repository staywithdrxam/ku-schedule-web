import React, { useState } from 'react'
import TimetableCanvas from './TimetableCanvas'

export default function RightPanel({
  className = '',
  schedule, conflicts, selectedIdx, setSelectedIdx,
  onEdit, onDelete, theme, semester, tooltip, setTooltip
}) {
  const totalCr = schedule.reduce((s, c) => s + (Number(c.credits) || 0), 0)
  const totalSlots = schedule.reduce((s, c) => s + (c.slots || []).length, 0)

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
            onSlotHover={handleSlotHover}
            onSlotClick={setSelectedIdx}
          />
        </div>
      </div>

      {/* Course table */}
      <div className="course-table-wrap">
        <div className="table-header">
          <span className="table-title">รายวิชาที่ลงทะเบียน</span>
          {selectedIdx !== null && (
            <>
              <button className="btn-sm btn-edit" onClick={() => onEdit(selectedIdx)}>แก้ไข</button>
              <button className="btn-sm btn-delete"
                onClick={() => {
                  if (window.confirm(`ลบวิชา "${schedule[selectedIdx]?.name}" หรือไม่?`))
                    onDelete(selectedIdx)
                }}>ลบ</button>
            </>
          )}
        </div>
        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
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
    </div>
  )
}
