<div align="center">

# Schedule Planner

**จัดตารางเรียนออนไลน์ — สำหรับนิสิต ม.เกษตรศาสตร์ ก**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)](https://ku-schedule-web.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**(https://ku-schedule-web.vercel.app)**

</div>

---

## ✨ Features

- 🎨 **10 Themes** — Dark, Light, Ocean, Sakura, Forest, Sunset, Midnight, Lavender, Neon, Coffee
- 📊 **Timetable Canvas** — ตารางเรียนแบบ visual พร้อมสีพาสเทลแต่ละวัน
- ⚡ **Conflict Detection** — ตรวจจับวิชาที่เวลาตีกันแบบ real-time
- 💾 **localStorage** — บันทึกข้อมูลในเบราว์เซอร์ ไม่ต้องล็อกอิน
- 🖼️ **Export PNG** — ส่งออกตารางเรียนเป็นรูปภาพ A3 ความละเอียดสูง
- 📋 **Copy Codes** — คัดลอกรหัสวิชาสำหรับลงทะเบียนได้เลย
- 🎨 **Color Wheel** — เลือกสีวิชาด้วย color wheel แบบ custom
- 📱 **Responsive** — ใช้งานได้บนมือถือ, iPad, และ Desktop

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | CSS Variables + Custom Properties |
| Canvas | HTML5 Canvas API |
| Storage | localStorage |
| Deploy | Vercel |

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/staywithdrxam/ku-schedule-web.git
cd ku-schedule-web

# Install
npm install

# Dev server
npm run dev

# Build
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── SplashScreen.jsx     # Intro animation
│   ├── LeftPanel.jsx        # Sidebar — credits, days, course list
│   ├── RightPanel.jsx       # Stats + timetable + table
│   ├── TimetableCanvas.jsx  # HTML Canvas timetable renderer
│   ├── CourseDialog.jsx     # Add/edit course modal
│   └── ColorWheel.jsx       # Custom HSL color picker
├── utils/
│   └── exportTimetable.js   # PNG export (4200×2970px)
├── themes.js                # 10 theme definitions
├── constants.js             # Days, times, colors
└── App.jsx                  # Root state + conflict detection
```

---

## 🎨 Themes Preview

| Theme | Style |
|-------|-------|
| Dark | Deep purple night |
| Light | Clean white |
| Ocean | Deep sea blue |
| Sakura | Soft pink blossom |
| Forest | Earthy green |
| Sunset | Warm orange |
| Midnight | Electric blue |
| Lavender | Soft violet |
| Neon | Cyberpunk purple |
| Coffee | Warm brown |

---

<div align="center">

Made with ❤️ by **น้องดรีม** · วิทย์คอม ปี 2 · ม.เกษตรศาสตร์ กำแพงแสน

</div>
