# Kế hoạch Triển khai & Yêu cầu Phần mềm (SRS - Software Requirements Specification)
## Dự án: Ứng dụng Học Tiếng Trung Chuyên sâu (Hanzo / Hanzo Master)

Dự án **Hanzo** là một ứng dụng web hiện đại, trực quan và toàn diện dành cho người học tiếng Trung mọi trình độ (từ HSK 1 - 6 và Tiếng Trung Thương mại/Giao tiếp công sở). Ứng dụng tích hợp thuật toán lặp lại ngắt quãng (Spaced Repetition System - SRS), nhận dạng giọng nói, tập viết nét chữ Hán, phát âm chuẩn TTS và từ điển tra cứu chuyên sâu.

---

## 1. Tổng quan Kiến trúc & Thư viện

- **Frontend Framework:** React + Vite (nhanh, linh hoạt, quản lý state bài học & SRS mượt mà).
- **Styling:** CSS Modern / Glassmorphism + TailwindCSS (giao diện tối giản, sang trọng, hỗ trợ Dark/Light Mode).
- **Luyện Viết Nét Chữ Hán (Writing):** Tích hợp thư viện `hanzi-writer` để vẽ & chấm điểm thứ tự nét vẽ (Stroke order & Animation).
- **Luyện Nghe & Nói (Listening & Speaking):** Sử dụng Web Speech API (`SpeechSynthesisUtterance` cho giọng đọc chuẩn zh-CN và `webkitSpeechRecognition` để nhận diện & chấm điểm phát âm).
- **Lưu trữ dữ liệu:** LocalStorage / IndexedDB (giúp lưu bộ từ vựng tùy chỉnh, tiến độ học, thống kê SRS mà không cần server backend phức tạp).

---

## 2. Các Module Chức năng Chi tiết

### Module 1: Tạo bộ chủ đề từ vựng tùy chỉnh (`TopicsPage.jsx`)
- **Tạo & Quản lý chủ đề:** Cho phép người dùng tạo các Topic riêng (ví dụ: *"Từ vựng đi Du lịch"*, *"Từ vựng Đồ ăn"*, *"Từ vựng Ngành Logistics"*).
- **Thêm/Sửa/Xóa từ vựng:** Thêm Hán tự (Hanzi), phiên âm (Pinyin), nghĩa tiếng Việt, câu ví dụ, âm thanh mẫu, ghi chú.
- **Bộ từ vựng có sẵn (Pre-built Decks):** Cung cấp sẵn các bộ chủ đề HSK 1 - 6, Từ vựng giao tiếp hàng ngày, Từ vựng công sở.
- **Import/Export Excel & JSON:**
  - Tải file Excel mẫu (`.xlsx`) tiêu chuẩn.
  - Nhập trực tiếp danh sách từ vựng từ file Excel (`.xlsx`, `.xls`, `.csv`) để tạo bộ từ vựng mới hoặc chèn vào modal tạo/sửa.
  - Xuất toàn bộ từ vựng của bất kỳ chủ đề nào ra file Excel (`.xlsx`) hoặc JSON chuẩn.

### Module 2: Kiểm tra ôn tập 4 Kỹ năng Nghe - Nói - Đọc - Viết (`PracticePage.jsx`)
- **Hệ thống Spaced Repetition (SRS):** Tự động tính toán thời gian ôn tập tối ưu cho từng từ vựng dựa trên mức độ nhớ (Dễ, Trung bình, Khó, Quên).
- **Nghe (Listening):** 
  - Nghe phát âm chọn đáp án đúng (Hán tự / Pinyin / Nghĩa).
  - Dictation (Nghe và gõ lại Pinyin/Chữ Hán).
- **Nói (Speaking):**
  - Nghe mẫu và phát âm lại qua micro (Web Speech Recognition `zh-CN`).
  - Hệ thống so sánh phiên âm đọc được với phiên âm chuẩn và chấm điểm độ chính xác.
- **Đọc (Reading):**
  - Đọc đoạn văn ngắn hoặc câu giao tiếp có bật/tắt Pinyin linh hoạt.
  - Bài tập nối Hán tự với nghĩa tiếng Việt, bài tập điền từ vào khoảng trống.
- **Viết (Writing):**
  - Tích hợp `Hanzi Writer`: Hiển thị trực quan hoạt ảnh hướng dẫn thứ tự nét vẽ (Stroke Order Animation) chuẩn quy tắc cho từng Hán tự.

### Module 3: Tra cứu Trung-Việt & Ngữ cảnh Giao tiếp (`DictionaryPage.jsx`)
- **Tra cứu thông minh:** Tìm kiếm tức thì bằng Hán tự (漢字), Pinyin (như `nǐ hǎo` hoặc `ni3 hao`), hoặc từ khóa tiếng Việt.
- **Phân tích từ vựng chi tiết:**
  - Bộ thủ (Radicals), số nét, cấp độ HSK.
  - Giải thích ngữ nghĩa chuẩn xác & phân loại từ (Danh từ, Động từ, Tính từ,...).
  - **Trường hợp sử dụng thực tế (Practical Usage):** Ví dụ ngữ cảnh giao tiếp hàng ngày trong đời sống (Chào hỏi, Mua sắm, Đặt đồ ăn, Taxi, Khen ngợi,...).
  - **Từ đồng nghĩa / Trái nghĩa & Cụm từ hay đi kèm (Collocations).**

### Module 4: Tiếng Trung Công Sở (`OfficeChinesePage.jsx`)
- **6 Chủ đề chuyên biệt công sở:**
  1. **Giao tiếp văn phòng & Văn hóa công sở (Office Small Talk & Etiquette):** Chào hỏi đồng nghiệp, sếp, quy tắc ứng xử, văn hóa làm việc với đối tác Trung Quốc.
  2. **Viết Email & Văn bản hành chính (Business Email Templates):** Mẫu email chào hàng, báo cáo công việc, xin nghỉ phép, xác nhận cuộc họp.
  3. **Phỏng vấn xin việc (Job Interview):** Giới thiệu bản thân, trả lời câu hỏi về kinh nghiệm, mức lương, thế mạnh bằng tiếng Trung.
  4. **Họp hành & Báo cáo (Meetings & Presentations):** Cụm từ mở đầu cuộc họp, trình bày slide, phát biểu ý kiến, thảo luận tiến độ.
  5. **Đàm phán & Thương lượng (Workplace Negotiation):** Báo giá, thương lượng chiết khấu, chốt hợp đồng, điều khoản thanh toán.
  6. **Bộ từ vựng chuyên ngành:** IT/Software, Marketing & Sales, HR & Nhân sự, Tài chính - Kế toán, Chuỗi cung ứng & Logistics.
- **Kịch bản hội thoại tương tác (Interactive Roleplay Dialogue):** Cho phép người học đóng vai (Roleplay) luyện hội thoại đối đáp với audio mẫu.

---

## 3. Cấu trúc Dự án (Directory Structure)

```
c:\Users\pc\.gemini\antigravity\scratch\dctHanyu\
├── SRS/
│   └── implementation_plan.md       # File kế hoạch SRS này
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Thanh điều hướng chính (Chủ đề, Luyện tập, Tra cứu, Tiếng Trung công sở)
│   │   ├── CustomTopicModal.jsx     # Modal tạo/chỉnh sửa bộ từ vựng tùy chỉnh
│   │   ├── HanziWriterCanvas.jsx    # Component luyện viết nét chữ Hán tương tác
│   │   ├── SpeechPractice.jsx       # Component nhận dạng giọng nói & thu âm phát âm
│   │   ├── DictionaryModal.jsx      # Chi tiết từ vựng & ví dụ ngữ cảnh giao tiếp
│   │   └── SRSProgressCard.jsx      # Thống kê tiến trình học ngắt quãng
│   ├── data/
│   │   ├── dictionary.js            # Ngân hàng từ vựng Trung - Việt / Việt - Trung phong phú
│   │   ├── hskTopics.js             # Bộ chủ đề từ vựng mẫu theo cấp độ HSK
│   │   └── officeModules.js         # Dữ liệu module Tiếng Trung Công sở (Email, Phỏng vấn, Họp hành, Đàm phán)
│   ├── pages/
│   │   ├── TopicsPage.jsx           # Quản lý & Tạo bộ từ vựng tùy chỉnh (Chức năng 1)
│   │   ├── PracticePage.jsx         # Luyện tập 4 kỹ năng Nghe - Nói - Đọc - Viết (Chức năng 2)
│   │   ├── DictionaryPage.jsx       # Tra cứu từ điển & ngữ cảnh sử dụng (Chức năng 3)
│   │   └── OfficeChinesePage.jsx    # Module Tiếng Trung Công sở (Chức năng 4)
│   ├── utils/
│   │   ├── srsAlgorithm.js          # Thuật toán lặp lại ngắt quãng SM-2
│   │   ├── speechUtils.js           # Xử lý TTS phát âm & Speech Recognition
│   │   └── storage.js               # Quản lý lưu trữ LocalStorage/IndexedDB
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 4. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

### Kiểm thử Tự động (Automated Verification)
- Chạy lệnh `npm run build` để đảm bảo dự án biên dịch React/Vite thành công không có lỗi syntax hay JSX.

### Kiểm thử Thủ công (Manual Verification)
- **Tạo Bộ Từ Vựng:** Tạo bộ chủ đề mới, thêm từ vựng, lưu trữ thành công trong LocalStorage.
- **Luyện Tập 4 Kỹ Năng:** Test TTS Nghe, Micro Nói, Pinyin Đọc, và Hanzi Canvas Viết.
- **Tra Cứu Từ Điển:** Tra cứu Hán tự/Pinyin/Tiếng Việt.
- **Module Công Sở:** Trải nghiệm các mẫu Email, Phỏng vấn, Đàm phán công sở.
