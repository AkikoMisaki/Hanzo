// Bộ chủ đề từ vựng mẫu có sẵn và cấu trúc quản lý topic tùy chỉnh (dctHanyu)

export const initialTopicsData = [
  {
    id: 'topic_hsk1',
    name: 'HSK 1 - Từ Vựng Căn Bản',
    description: '150 từ vựng nền tảng HSK 1 cho người mới bắt đầu học tiếng Trung.',
    icon: '🌱',
    category: 'HSK',
    isPreset: true,
    words: [
      { hanzi: '你好', pinyin: 'nǐ hǎo', hanviet: 'Nễ Hảo', meaning: 'Xin chào', audio: '' },
      { hanzi: '谢谢', pinyin: 'xiè xie', hanviet: 'Tạ Tạ', meaning: 'Cảm ơn', audio: '' },
      { hanzi: '再见', pinyin: 'zài jiàn', hanviet: 'Tái Kiến', meaning: 'Tạm biệt', audio: '' },
      { hanzi: '中国', pinyin: 'zhōng guó', hanviet: 'Trung Quốc', meaning: 'Trung Quốc', audio: '' },
      { hanzi: '汉语', pinyin: 'hàn yǔ', hanviet: 'Hán Ngữ', meaning: 'Tiếng Trung', audio: '' },
      { hanzi: '朋友', pinyin: 'péng you', hanviet: 'Bằng Hữu', meaning: 'Bạn bè', audio: '' },
      { hanzi: '老师', pinyin: 'lǎo shī', hanviet: 'Lão Sư', meaning: 'Thầy / Cô giáo', audio: '' },
      { hanzi: '学生', pinyin: 'xué sheng', hanviet: 'Học Sinh', meaning: 'Học sinh / Sinh viên', audio: '' },
      { hanzi: '高兴', pinyin: 'gāo xìng', hanviet: 'Cao Hứng', meaning: 'Vui vẻ', audio: '' },
      { hanzi: '学习', pinyin: 'xué xí', hanviet: 'Học Tập', meaning: 'Học tập', audio: '' }
    ]
  },
  {
    id: 'topic_hsk2',
    name: 'HSK 2 - Giao Tiếp Thông Dụng',
    description: '300 từ vựng nâng cao nhẹ cho giao tiếp đời sống hàng ngày.',
    icon: '🌿',
    category: 'HSK',
    isPreset: true,
    words: [
      { hanzi: '准备', pinyin: 'zhǔn bèi', hanviet: 'Chuẩn Bị', meaning: 'Chuẩn bị', audio: '' },
      { hanzi: '已经', pinyin: 'yǐ jīng', hanviet: 'Dĩ Kinh', meaning: 'Đã / Đã rồi', audio: '' },
      { hanzi: '咖啡', pinyin: 'kā fēi', hanviet: 'Cà Phê', meaning: 'Cà phê', audio: '' },
      { hanzi: '运动', pinyin: 'yùn dòng', hanviet: 'Vận Động', meaning: 'Thể thao / Vận động', audio: '' },
      { hanzi: '时间', pinyin: 'shí jiān', hanviet: 'Thời Gian', meaning: 'Thời gian', audio: '' },
      { hanzi: '希望', pinyin: 'xī wàng', hanviet: 'Hy Vọng', meaning: 'Hy vọng', audio: '' },
      { hanzi: '意思', pinyin: 'yì si', hanviet: 'Ý Tư', meaning: 'Ý nghĩa / Ý định', audio: '' },
      { hanzi: '问题', pinyin: 'wèn tí', hanviet: 'Vấn Đề', meaning: 'Vấn đề / Câu hỏi', audio: '' }
    ]
  },
  {
    id: 'topic_hsk3',
    name: 'HSK 3 - Trung Cấp Đời Sống',
    description: 'Từ vựng trung cấp giúp bạn tự tin làm việc và đi du lịch.',
    icon: '🌳',
    category: 'HSK',
    isPreset: true,
    words: [
      { hanzi: '会议', pinyin: 'huì yì', hanviet: 'Hội Nghị', meaning: 'Cuộc họp', audio: '' },
      { hanzi: '选择', pinyin: 'xuǎn zé', hanviet: 'Tuyển Trạch', meaning: 'Lựa chọn', audio: '' },
      { hanzi: '方便', pinyin: 'fāng biàn', hanviet: 'Phương Tiện', meaning: 'Thuận tiện', audio: '' },
      { hanzi: '环境', pinyin: 'huán jìng', hanviet: 'Hoàn Cảnh', meaning: 'Môi trường', audio: '' },
      { hanzi: '机会', pinyin: 'jī huì', hanviet: 'Cơ Hội', meaning: 'Cơ hội', audio: '' },
      { hanzi: '根据', pinyin: 'gēn jù', hanviet: 'Căn Cứ', meaning: 'Căn cứ vào', audio: '' },
      { hanzi: '清楚', pinyin: 'qīng chu', hanviet: 'Thanh Sở', meaning: 'Rõ ràng', audio: '' }
    ]
  },
  {
    id: 'topic_travel',
    name: 'Du Lịch & Phương Tiện',
    description: 'Từ vựng và câu giao tiếp khi đi máy bay, khách sạn, di chuyển.',
    icon: '✈️',
    category: 'Giao tiếp',
    isPreset: true,
    words: [
      { hanzi: '护照', pinyin: 'hù zhào', hanviet: 'Hộ Chiếu', meaning: 'Hộ chiếu (Passport)', audio: '' },
      { hanzi: '机场', pinyin: 'jī chǎng', hanviet: 'Cơ Trường', meaning: 'Sân bay', audio: '' },
      { hanzi: '酒店', pinyin: 'jiǔ diàn', hanviet: 'Tửu Điếm', meaning: 'Khách sạn', audio: '' },
      { hanzi: '出租车', pinyin: 'chū zū chē', hanviet: 'Xuất Tô Xa', meaning: 'Xe Taxi', audio: '' },
      { hanzi: '多少钱', pinyin: 'duō shao qián', hanviet: 'Đa Thiểu Tiền', meaning: 'Bao nhiêu tiền', audio: '' },
      { hanzi: '行李', pinyin: 'xíng li', hanviet: 'Hành Lý', meaning: 'Hành lý', audio: '' },
      { hanzi: '订房', pinyin: 'dìng fáng', hanviet: 'Đặt Phòng', meaning: 'Đặt phòng', audio: '' }
    ]
  },
  {
    id: 'topic_dining',
    name: 'Ẩm Thực & Nhà Hàng',
    description: 'Từ vựng gọi món, thanh toán, tên các món ăn Trung Hoa nổi tiếng.',
    icon: '🥟',
    category: 'Giao tiếp',
    isPreset: true,
    words: [
      { hanzi: '服务员', pinyin: 'fú wù yuán', hanviet: 'Phục Vụ Viên', meaning: 'Phục vụ viên', audio: '' },
      { hanzi: '买单', pinyin: 'mǎi dān', hanviet: 'Mãi Đơn', meaning: 'Thanh toán tiền', audio: '' },
      { hanzi: '菜单', pinyin: 'cài dān', hanviet: 'Thái Đơn', meaning: 'Thực đơn (Menu)', audio: '' },
      { hanzi: '饺子', pinyin: 'jiǎo zi', hanviet: 'Giảo Tử', meaning: 'Bánh há cảo / Bánh xếp', audio: '' },
      { hanzi: '米饭', pinyin: 'mǐ fàn', hanviet: 'Mễ Phạn', meaning: 'Cơm trắng', audio: '' },
      { hanzi: '好吃的', pinyin: 'hǎo chī de', hanviet: 'Hảo Chinh', meaning: 'Món ăn ngon', audio: '' },
      { hanzi: '辣的', pinyin: 'là de', hanviet: 'Lạt', meaning: 'Vị cay', audio: '' }
    ]
  }
];
