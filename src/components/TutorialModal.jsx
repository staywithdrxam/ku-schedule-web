import React, { useEffect } from 'react'

const TIPS = [
  {
    icon: '➕',
    color: '#6c63ff',
    title: 'เพิ่มวิชา',
    desc: 'กดปุ่ม + หรือคลิกช่องว่างในตารางตรงวันและเวลาที่ต้องการได้เลย',
  },
  {
    icon: '🗑️',
    color: '#e05a7a',
    title: 'ลบวิชา',
    desc: 'คลิกวิชาในตาราง 1 ครั้ง (จะเป็นสีแดง) แล้วคลิกอีกครั้งเพื่อยืนยันลบ',
  },
  {
    icon: '💾',
    color: '#28a870',
    title: 'บันทึก',
    desc: 'กด "บันทึก" เพื่อเก็บข้อมูล หรือ "บันทึกรูปภาพ" เพื่อส่งออกเป็น PNG',
  },
  {
    icon: '◀',
    color: '#f59e0b',
    title: 'ดูตารางเต็มจอ',
    desc: 'กดปุ่มลูกศรมุมบนของแผงซ้ายเพื่อพับเครื่องมือ แล้วดูตารางแบบเต็มหน้าจอ',
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
        <div className="tut-top-bar" />
        <div className="tut-header">
          <div>
            <div className="tut-title">วิธีใช้งาน</div>
            <div className="tut-subtitle">Schedule Planner · KU กำแพงแสน</div>
          </div>
          <button className="tut-close" onClick={onClose} title="ปิด (ESC)">✕</button>
        </div>

        {/* Tips list */}
        <div className="tut-body">
          {TIPS.map((tip, i) => (
            <div className="tut-tip-row" key={i}>
              <div className="tut-tip-dot" style={{ background: tip.color + '22', color: tip.color }}>
                {tip.icon}
              </div>
              <div className="tut-tip-text">
                <div className="tut-tip-title">{tip.title}</div>
                <div className="tut-tip-desc">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="tut-footer">
          <button className="tut-btn-start" onClick={onClose}>เริ่มใช้งาน</button>
        </div>

      </div>
    </div>
  )
}
