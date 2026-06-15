import React, { useState } from 'react'

const STEPS = [
  {
    icon: '🎓',
    title: 'ยินดีต้อนรับสู่ Schedule Planner',
    subtitle: 'by น้องดรีม · วิทย์คอม ปี 2 · ม.เกษตรศาสตร์ กำแพงแสน',
    content: (
      <div className="tut-welcome">
        <p>แอปช่วย<strong>จัดตารางเรียน</strong>ที่ใช้งานง่าย รองรับทั้งคอมพิวเตอร์และมือถือ</p>
        <div className="tut-feature-grid">
          <div className="tut-feature-item"><span>📋</span><span>จัดการรายวิชา</span></div>
          <div className="tut-feature-item"><span>🎨</span><span>10+ ธีมสี</span></div>
          <div className="tut-feature-item"><span>📸</span><span>บันทึกเป็นรูป</span></div>
          <div className="tut-feature-item"><span>⚡</span><span>ตรวจจับคาบซ้อน</span></div>
        </div>
      </div>
    )
  },
  {
    icon: '➕',
    title: 'วิธีเพิ่มรายวิชา',
    subtitle: 'มี 2 วิธีในการเพิ่มวิชา',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-num">1</div>
          <div className="tut-step-body">
            <div className="tut-step-title">กดปุ่ม "+"</div>
            <div className="tut-step-desc">กดปุ่มเพิ่มรายวิชาที่แถบด้านล่าง (มือถือ) หรือปุ่มด้านซ้าย (คอม) เพื่อเปิดหน้ากรอกข้อมูล</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-num">2</div>
          <div className="tut-step-body">
            <div className="tut-step-title">คลิกช่องว่างในตาราง</div>
            <div className="tut-step-desc">คลิก หรือแตะ ช่องว่างในตารางตรงวันและเวลาที่ต้องการ ระบบจะ pre-fill วัน/เวลาให้อัตโนมัติ</div>
          </div>
        </div>
        <div className="tut-hint">
          <span>💡</span> กรอกรหัสวิชา ชื่อวิชา เวลา และห้องเรียน แล้วกด "เพิ่มรายวิชา"
        </div>
      </div>
    )
  },
  {
    icon: '🗑️',
    title: 'วิธีลบรายวิชา',
    subtitle: 'ระบบยืนยันก่อนลบ 2 ขั้นตอน',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-num tut-step-red">1</div>
          <div className="tut-step-body">
            <div className="tut-step-title">คลิก/แตะวิชาในตารางครั้งแรก</div>
            <div className="tut-step-desc">วิชาจะเปลี่ยนเป็น<strong style={{color:'#ff4444'}}>สีแดง</strong> และแสดงข้อความ "กดอีกครั้งเพื่อลบ"</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-num tut-step-red">2</div>
          <div className="tut-step-body">
            <div className="tut-step-title">คลิก/แตะอีกครั้งเพื่อยืนยัน</div>
            <div className="tut-step-desc">วิชาจะถูกลบออกจากตาราง</div>
          </div>
        </div>
        <div className="tut-hint">
          <span>💡</span> คลิกที่ช่องว่างในตารางเพื่อ<strong>ยกเลิก</strong>การลบ
        </div>
      </div>
    )
  },
  {
    icon: '💾',
    title: 'บันทึกและส่งออก',
    subtitle: 'เก็บข้อมูลและแชร์ตารางของคุณ',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-icon">💾</div>
          <div className="tut-step-body">
            <div className="tut-step-title">บันทึกข้อมูล</div>
            <div className="tut-step-desc">กด "บันทึก" เพื่อเก็บตารางลงในเครื่อง ข้อมูลจะยังอยู่เมื่อปิดแล้วเปิดใหม่</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">🖼️</div>
          <div className="tut-step-body">
            <div className="tut-step-title">บันทึกรูปภาพตาราง</div>
            <div className="tut-step-desc">บันทึกตารางเรียนเป็นไฟล์ PNG คมชัด พร้อมแชร์ให้เพื่อนหรือบันทึกลงแกลเลอรี</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">📋</div>
          <div className="tut-step-body">
            <div className="tut-step-title">คัดลอกรหัสวิชา</div>
            <div className="tut-step-desc">กด "คัดลอกรหัสวิชา" เพื่อคัดลอกรหัสทุกวิชาพร้อมกัน สะดวกตอนลงทะเบียน</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: '🎨',
    title: 'ธีมและการแสดงผล',
    subtitle: 'ปรับแต่งให้ถูกใจ',
    content: (
      <div className="tut-steps-list">
        <div className="tut-step-item">
          <div className="tut-step-icon">🌗</div>
          <div className="tut-step-body">
            <div className="tut-step-title">โหมดอัตโนมัติ</div>
            <div className="tut-step-desc">เลือก "อัตโนมัติ" เพื่อให้เว็บเปลี่ยนธีมตาม Dark/Light mode ของโทรศัพท์หรือคอม</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">✨</div>
          <div className="tut-step-body">
            <div className="tut-step-title">เลือกธีมเอง (10+ แบบ)</div>
            <div className="tut-step-desc">เลือกธีมจาก dropdown ด้านซ้าย (คอม) หรือแท็บ "วิชา" (มือถือ)</div>
          </div>
        </div>
        <div className="tut-step-item">
          <div className="tut-step-icon">☀️</div>
          <div className="tut-step-body">
            <div className="tut-step-title">ปุ่มธีมด่วน (มือถือ)</div>
            <div className="tut-step-desc">กดปุ่มกลมมุมขวาบนในหน้าตาราง เพื่อสลับ อัตโนมัติ → Light → Dark ได้เลย</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: '🚀',
    title: 'พร้อมใช้งานแล้ว!',
    subtitle: 'เริ่มสร้างตารางเรียนของคุณได้เลย',
    content: (
      <div className="tut-welcome">
        <p>หากพบปัญหาหรือต้องการแนะนำฟีเจอร์ใหม่<br/>สามารถติดต่อได้ที่ <strong>staywithdrxam</strong></p>
        <div className="tut-feature-grid" style={{marginTop: 16}}>
          <div className="tut-feature-item"><span>👆</span><span>คลิกช่องว่างเพิ่มวิชา</span></div>
          <div className="tut-feature-item"><span>2x</span><span>คลิก 2 ครั้งลบวิชา</span></div>
          <div className="tut-feature-item"><span>⌨️</span><span>ESC ปิด popup</span></div>
          <div className="tut-feature-item"><span>📱</span><span>ใช้ได้ทุกอุปกรณ์</span></div>
        </div>
      </div>
    )
  }
]

export default function TutorialModal({ onClose }) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  return (
    <div className="tut-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tut-modal">

        {/* Header */}
        <div className="tut-header">
          <div className="tut-icon">{s.icon}</div>
          <button className="tut-close" onClick={onClose} title="ปิด (ESC)">✕</button>
        </div>

        {/* Content */}
        <div className="tut-body">
          <div className="tut-title">{s.title}</div>
          <div className="tut-subtitle">{s.subtitle}</div>
          <div className="tut-content">{s.content}</div>
        </div>

        {/* Progress dots */}
        <div className="tut-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tut-dot${i === step ? ' active' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="tut-footer">
          <button
            className="tut-btn-prev"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            ← ย้อนกลับ
          </button>
          {isLast ? (
            <button className="tut-btn-start" onClick={onClose}>
              เริ่มใช้งาน!
            </button>
          ) : (
            <button className="tut-btn-next" onClick={() => setStep(s => s + 1)}>
              ถัดไป →
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
