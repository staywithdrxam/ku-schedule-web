import React, { useState, useEffect } from 'react'

const STEPS = [
  {
    icon: '📅',
    title: 'ยินดีต้อนรับ',
    subtitle: 'Schedule Planner — by น้องดรีม · วิทย์คอม ปี 2 · ม.เกษตรศาสตร์ กำแพงแสน',
    content: (
      <div className="tut-welcome">
        <p>แอปนี้ช่วยให้จัดตารางเรียนได้ง่ายขึ้น ไม่ว่าจะเปิดบนคอมหรือมือถือก็ใช้ได้เลย ลองดูวิธีใช้คร่าวๆ ก่อนเริ่มนะ</p>
        <div className="tut-feature-grid">
          <div className="tut-feature-item"><span>📋</span><span>จัดการรายวิชา</span></div>
          <div className="tut-feature-item"><span>🎨</span><span>ธีมสีหลากแบบ</span></div>
          <div className="tut-feature-item"><span>📸</span><span>บันทึกเป็นรูป</span></div>
          <div className="tut-feature-item"><span>⚡</span><span>แจ้งเตือนคาบซ้อน</span></div>
        </div>
      </div>
    )
  },
  {
    icon: '➕',
    title: 'เพิ่มรายวิชา',
    subtitle: 'มีสองวิธี เลือกแบบที่สะดวกได้เลย',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-num">1</div>
          <div className="tut-step-body">
            <div className="tut-step-title">กดปุ่ม "+"</div>
            <div className="tut-step-desc">กดปุ่มบวกที่แถบด้านล่าง (มือถือ) หรือที่แผงซ้ายบน (คอม) แล้วกรอกข้อมูลวิชาได้เลย</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-num">2</div>
          <div className="tut-step-body">
            <div className="tut-step-title">คลิกช่องว่างในตาราง</div>
            <div className="tut-step-desc">แตะหรือคลิกที่ช่องวันและเวลาที่ต้องการในตาราง ระบบจะใส่วันและเวลานั้นให้อัตโนมัติ ประหยัดเวลามากขึ้น</div>
          </div>
        </div>
        <div className="tut-hint">
          <span>💡</span> กรอกรหัสวิชา ชื่อ เวลา และห้องเรียน แล้วกด "เพิ่มรายวิชา" ได้เลย
        </div>
      </div>
    )
  },
  {
    icon: '🗑️',
    title: 'ลบรายวิชา',
    subtitle: 'ระบบให้ยืนยัน 2 ครั้งเพื่อป้องกันลบผิด',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-num tut-step-red">1</div>
          <div className="tut-step-body">
            <div className="tut-step-title">แตะหรือคลิกวิชาในตารางครั้งแรก</div>
            <div className="tut-step-desc">บล็อกวิชาจะเปลี่ยนเป็น<strong style={{color:'#ff4444'}}>สีแดง</strong> พร้อมข้อความ "กดอีกครั้งเพื่อลบ"</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-num tut-step-red">2</div>
          <div className="tut-step-body">
            <div className="tut-step-title">แตะหรือคลิกซ้ำเพื่อยืนยัน</div>
            <div className="tut-step-desc">วิชานั้นจะถูกลบออกจากตาราง หากใจหายแตะที่ช่องว่างก็ยกเลิกได้</div>
          </div>
        </div>
        <div className="tut-hint">
          <span>💡</span> แตะที่อื่นในตารางเพื่อยกเลิกการลบได้ตลอด
        </div>
      </div>
    )
  },
  {
    icon: '💾',
    title: 'บันทึกและส่งออก',
    subtitle: 'เก็บข้อมูลและแชร์ตารางให้เพื่อน',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-icon">💾</div>
          <div className="tut-step-body">
            <div className="tut-step-title">บันทึกข้อมูล</div>
            <div className="tut-step-desc">กด "บันทึก" เพื่อเก็บตารางไว้ในเครื่อง ปิดแล้วเปิดใหม่ข้อมูลก็ยังอยู่</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">🖼️</div>
          <div className="tut-step-body">
            <div className="tut-step-title">บันทึกรูปภาพตาราง</div>
            <div className="tut-step-desc">ได้ไฟล์ PNG คมชัดพร้อมส่งให้เพื่อน หรือบันทึกลงแกลเลอรีมือถือ</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">📋</div>
          <div className="tut-step-body">
            <div className="tut-step-title">คัดลอกรหัสวิชา</div>
            <div className="tut-step-desc">กด "คัดลอกรหัสวิชา" เพื่อคัดลอกรหัสทุกวิชาในคราวเดียว ใช้ตอนลงทะเบียนได้เลย</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: '🎨',
    title: 'ปรับธีมและการแสดงผล',
    subtitle: 'ตั้งค่าให้เหมาะกับตัวเองได้',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-icon">🌗</div>
          <div className="tut-step-body">
            <div className="tut-step-title">โหมดอัตโนมัติ</div>
            <div className="tut-step-desc">เลือก "อัตโนมัติ" แล้วแอปจะเปลี่ยนธีมตาม Dark/Light Mode ของเครื่องเอง ไม่ต้องตั้งเองทุกครั้ง</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">✨</div>
          <div className="tut-step-body">
            <div className="tut-step-title">เลือกธีมเอง</div>
            <div className="tut-step-desc">มีให้เลือกกว่า 10 ธีม เปลี่ยนได้จาก dropdown ด้านซ้าย (คอม) หรือแท็บ "วิชา" (มือถือ)</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">☀️</div>
          <div className="tut-step-body">
            <div className="tut-step-title">ปุ่มสลับธีมด่วน (มือถือ)</div>
            <div className="tut-step-desc">กดปุ่มกลมมุมขวาบนในหน้าตาราง วนสลับได้เลยไม่ต้องเข้าเมนู</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: '🚀',
    title: 'พร้อมแล้ว เริ่มได้เลย!',
    subtitle: 'ลองสร้างตารางเรียนของตัวเองดูนะ',
    content: (
      <div className="tut-welcome">
        <p>ถ้ามีอะไรติดขัดหรืออยากแนะนำฟีเจอร์เพิ่ม ทักมาได้ที่ <strong>staywithdrxam</strong> ได้เลย</p>
        <div className="tut-feature-grid" style={{marginTop: 16}}>
          <div className="tut-feature-item"><span>👆</span><span>คลิกช่องเพิ่มวิชา</span></div>
          <div className="tut-feature-item"><span>2×</span><span>คลิก 2 ครั้งลบวิชา</span></div>
          <div className="tut-feature-item"><span>Esc</span><span>ปิด popup</span></div>
          <div className="tut-feature-item"><span>◀</span><span>พับแผงซ้ายดูตาราง</span></div>
        </div>
      </div>
    )
  }
]

export default function TutorialModal({ onClose }) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="tut-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tut-modal">
        <div className="tut-header">
          <div className="tut-icon">{s.icon}</div>
          <button className="tut-close" onClick={onClose} title="ปิด (ESC)">✕</button>
        </div>
        <div className="tut-body">
          <div className="tut-title">{s.title}</div>
          <div className="tut-subtitle">{s.subtitle}</div>
          <div className="tut-content">{s.content}</div>
        </div>
        <div className="tut-dots">
          {STEPS.map((_, i) => (
            <button key={i} className={`tut-dot${i === step ? ' active' : ''}`} onClick={() => setStep(i)} />
          ))}
        </div>
        <div className="tut-footer">
          <button className="tut-btn-prev" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            ← ย้อนกลับ
          </button>
          {isLast ? (
            <button className="tut-btn-start" onClick={onClose}>เริ่มใช้งาน</button>
          ) : (
            <button className="tut-btn-next" onClick={() => setStep(s => s + 1)}>ถัดไป →</button>
          )}
        </div>
      </div>
    </div>
  )
}
