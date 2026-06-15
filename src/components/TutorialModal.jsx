import React, { useEffect } from 'react'

const TIPS = [
  { icon: '➕', title: 'เพิ่มวิชา', desc: 'กดปุ่ม + หรือคลิกช่องว่างในตารางตรงวันและเวลาที่ต้องการ' },
  { icon: '🗑️', title: 'ลบวิชา', desc: 'คลิกวิชาในตาราง 1 ครั้ง (จะเป็นสีแดง) แล้วคลิกอีกครั้งเพื่อลบ' },
  { icon: '💾', title: 'บันทึก', desc: 'กด "บันทึก" เพื่อเก็บข้อมูล หรือ "บันทึกรูปภาพ" เพื่อส่งออกเป็น PNG' },
  { icon: '◀', title: 'ดูตารางเต็มจอ', desc: 'กดปุ่มลูกศรมุมบนของแผงซ้ายเพื่อพับเครื่องมือ' },
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
        <div className="tut-header">
          <div className="tut-icon">📅</div>
          <button className="tut-close" onClick={onClose} title="ปิด (ESC)">✕</button>
        </div>
        <div className="tut-body">
          <div className="tut-title">วิธีใช้งานเบื้องต้น</div>
          <div className="tut-subtitle">Schedule Planner · by น้องดรีม · ม.เกษตรศาสตร์ กำแพงแสน</div>
          <div className="tut-tips-grid">
            {TIPS.map((tip, i) => (
              <div className="tut-tip-card" key={i}>
                <span className="tut-tip-icon">{tip.icon}</span>
                <div className="tut-tip-title">{tip.title}</div>
                <div className="tut-tip-desc">{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="tut-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="tut-btn-start" onClick={onClose}>เริ่มเลย</button>
        </div>
      </div>
    </div>
  )
}
