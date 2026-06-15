import React, { useEffect } from 'react'

const TIPS = [
  {
    icon: '＋',
    color: '#6c63ff',
    bg: 'rgba(108,99,255,0.12)',
    title: 'เพิ่มวิชา',
    desc: 'กดปุ่ม + หรือแตะช่องว่างในตารางตรงวันและเวลาที่ต้องการ',
  },
  {
    icon: '✕',
    color: '#e05a7a',
    bg: 'rgba(224,90,122,0.12)',
    title: 'ลบวิชา',
    desc: 'แตะวิชาในตาราง 1 ครั้ง (เป็นสีแดง) แล้วแตะอีกครั้งเพื่อลบ',
  },
  {
    icon: '↓',
    color: '#28a870',
    bg: 'rgba(40,168,112,0.12)',
    title: 'บันทึก',
    desc: 'กด "บันทึก" เก็บข้อมูล หรือ "บันทึกรูปภาพ" ส่งออกเป็น PNG',
  },
  {
    icon: '◀',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    title: 'ดูตารางเต็มจอ',
    desc: 'กดปุ่มลูกศร ‹ มุมบนเพื่อพับแผงซ้าย แล้วดูตารางแบบเต็มจอ',
  },
]

export default function TutorialModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="tut-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tut-modal">

        {/* Header */}
        <div className="tut-header">
          <div className="tut-header-left">
            <div className="tut-app-icon">📅</div>
            <div>
              <div className="tut-title">วิธีใช้งาน</div>
              <div className="tut-subtitle">Schedule Planner</div>
            </div>
          </div>
          <button className="tut-close" onClick={onClose} title="ปิด (ESC)">✕</button>
        </div>

        {/* Tips */}
        <div className="tut-body">
          {TIPS.map((tip, i) => (
            <div className="tut-tip-row" key={i}>
              <div className="tut-tip-dot" style={{ background: tip.bg, color: tip.color }}>
                <span>{tip.icon}</span>
              </div>
              <div className="tut-tip-text">
                <div className="tut-tip-title" style={{ color: tip.color }}>{tip.title}</div>
                <div className="tut-tip-desc">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="tut-footer">
          <span className="tut-hint">กด ESC เพื่อปิด</span>
          <button className="tut-btn-start" onClick={onClose}>เริ่มใช้งาน →</button>
        </div>

      </div>
    </div>
  )
}
