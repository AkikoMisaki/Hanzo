export const dictionaryData = [
  {
    id: 'dict_1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    pinyinNoTone: 'ni hao',
    hanviet: 'Nễ Hảo',
    meaning: 'Xin chào',
    hskLevel: 1,
    radical: '亻 (Nhân đứng)',
    strokeCount: 13,
    type: 'Cụm từ giao tiếp',
    tags: ['Giao tiếp hàng ngày', 'Chào hỏi', 'HSK1'],
    usageContext: 'Dùng để chào hỏi một người trong lần đầu gặp mặt hoặc giao tiếp thông thường.',
    examples: [
      {
        zh: '你好！很高兴认识你。',
        py: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
        vi: 'Xin chào! Rất vui được quen biết bạn.',
        scenario: 'Giao tiếp lần đầu gặp mặt'
      },
      {
        zh: '王经理，你好！',
        py: 'Wáng jīnglǐ, nǐ hǎo!',
        vi: 'Giám đốc Vương, xin chào ông!',
        scenario: 'Chào hỏi trong công sở'
      }
    ],
    synonyms: ['您好 (trọng thị)', '嗨 (thân mật)'],
    collocations: ['你好吗 (Bạn khỏe không)', '你好呀 (Chào nhé)']
  },
  {
    id: 'dict_2',
    hanzi: '谢谢',
    pinyin: 'xiè xie',
    pinyinNoTone: 'xie xie',
    hanviet: 'Tạ Tạ',
    meaning: 'Cảm ơn',
    hskLevel: 1,
    radical: '讠 (Ngôn)',
    strokeCount: 24,
    type: 'Động từ / Cụm từ',
    tags: ['Giao tiếp hàng ngày', 'Lịch sự', 'HSK1'],
    usageContext: 'Dùng để bày tỏ sự cảm ơn khi ai đó giúp đỡ hoặc tặng quà.',
    examples: [
      {
        zh: '非常感谢你的帮助！',
        py: 'Fēicháng gǎnxiè nǐ de bāngzhù!',
        vi: 'Rất cảm ơn sự giúp đỡ của bạn!',
        scenario: 'Cảm ơn sự giúp đỡ nhiệt tình'
      },
      {
        zh: '谢谢你送我的礼物。',
        py: 'Xièxiè nǐ sòng wǒ de lǐwù.',
        vi: 'Cảm ơn bạn đã tặng tôi món quà.',
        scenario: 'Nhận quà tặng'
      }
    ],
    synonyms: ['感谢', '多谢'],
    collocations: ['谢谢你', '太谢谢了', '不用谢 (Không có gì)']
  },
  {
    id: 'dict_3',
    hanzi: '工作',
    pinyin: 'gōng zuò',
    pinyinNoTone: 'gong zuo',
    hanviet: 'Công Tác',
    meaning: 'Công việc / Làm việc',
    hskLevel: 1,
    radical: '工 (Công)',
    strokeCount: 10,
    type: 'Danh từ / Động từ',
    tags: ['Công sở', 'Đời sống', 'HSK1'],
    usageContext: 'Vừa là động từ (đi làm, làm việc) vừa là danh từ (nghề nghiệp, công việc).',
    examples: [
      {
        zh: '你在哪儿工作？',
        py: 'Nǐ zài nǎr gōngzuò?',
        vi: 'Bạn làm việc ở đâu?',
        scenario: 'Hỏi thăm công việc'
      },
      {
        zh: '最近工作很忙，但是很有 ý 义。',
        py: 'Zuìjìn gōngzuò hěn máng, dànshì hěn yǒu yìyì.',
        vi: 'Dạo này công việc rất bận nhưng rất có ý nghĩa.',
        scenario: 'Chia sẻ tiến độ công việc'
      }
    ],
    synonyms: ['上班 (đi làm)', '职业 (nghề nghiệp)'],
    collocations: ['找工作 (Tìm việc)', '工作安排 (Phân công công việc)', '工作效率 (Hiệu suất làm việc)']
  },
  {
    id: 'dict_4',
    hanzi: '会议',
    pinyin: 'huì yì',
    pinyinNoTone: 'hui yi',
    hanviet: 'Hội Nghị',
    meaning: 'Cuộc họp / Hội nghị',
    hskLevel: 3,
    radical: '人 (Nhân)',
    strokeCount: 12,
    type: 'Danh từ',
    tags: ['Công sở', 'Họp hành', 'HSK3'],
    usageContext: 'Dùng trong môi trường văn phòng để chỉ buổi họp nội bộ hoặc hội nghị đối tác.',
    examples: [
      {
        zh: '我们下午两点在三楼会议室开会。',
        py: 'Wǒmen xiàwǔ liǎng diǎn zài sān lóu huìyìshì kāihuì.',
        vi: 'Chúng ta 2 giờ chiều họp ở phòng họp tầng 3.',
        scenario: 'Thông báo lịch họp công ty'
      },
      {
        zh: '请把会议纪要发给大家。',
        py: 'Qǐng bǎ huìyì jìyào fā gěi dàjiā.',
        vi: 'Xin hãy gửi biên bản cuộc họp cho mọi người.',
        scenario: 'Giao việc sau cuộc họp'
      }
    ],
    synonyms: ['开会', '研讨会'],
    collocations: ['开会议 (Mở cuộc họp)', '会议纪要 (Biên bản họp)', '主持会议 (Chủ trì cuộc họp)']
  },
  {
    id: 'dict_5',
    hanzi: '邮件',
    pinyin: 'yóu jiàn',
    pinyinNoTone: 'you jian',
    hanviet: 'Bưu Kiện',
    meaning: 'Thư bưu điện / Email công việc',
    hskLevel: 4,
    radical: '阝 (Phụ/Ấp)',
    strokeCount: 15,
    type: 'Danh từ',
    tags: ['Công sở', 'Email', 'HSK4'],
    usageContext: 'Trong giao tiếp công sở modern, 邮件 thường dùng chỉ Email công việc.',
    examples: [
      {
        zh: '我已经把报价单通过邮件发送给客户了。',
        py: 'Wǒ yǐjīng bǎ bàojià dān tōngguò yóujiàn fāsòng gěi kèhù le.',
        vi: 'Tôi đã gửi bảng báo giá qua email cho khách hàng rồi.',
        scenario: 'Báo cáo công việc qua Email'
      },
      {
        zh: '请查收我发给您的电子邮件。',
        py: 'Qǐng cháluō wǒ fā gěi nín de diànzǐ yóujiàn.',
        vi: 'Vui lòng kiểm tra email tôi đã gửi cho ông/bà.',
        scenario: 'Nhắc khách hàng check mail'
      }
    ],
    synonyms: ['电子邮件 (Email)', '信件'],
    collocations: ['发邮件 (Gửi email)', '查收邮件 (Kiểm tra email)', '邮件附件 (Tệp đính kèm email)']
  },
  {
    id: 'dict_6',
    hanzi: '合作',
    pinyin: 'hé zuò',
    pinyinNoTone: 'he zuo',
    hanviet: 'Hợp Tác',
    meaning: 'Hợp tác / Cùng làm việc',
    hskLevel: 4,
    radical: '口 (Khẩu)',
    strokeCount: 14,
    type: 'Động từ / Danh từ',
    tags: ['Công sở', 'Thương lượng', 'HSK4'],
    usageContext: 'Dùng khi bàn luận về mối quan hệ kinh doanh, đối tác hoặc phối hợp nhóm.',
    examples: [
      {
        zh: '祝我们合作愉快！',
        py: 'Zhù wǒmen hézuò yúkuài!',
        vi: 'Chúc hợp tác giữa chúng ta thành công tốt đẹp!',
        scenario: 'Ký kết hợp đồng / Kết thúc đàm phán'
      },
      {
        zh: '我们公司非常期待与贵公司的合作。',
        py: 'Wǒmen gōngsī fēicháng qīdài yǔ guì gōngsī de hézuò.',
        vi: 'Công ty chúng tôi rất mong chờ được hợp tác với quý công ty.',
        scenario: 'Chào hàng & Kết nối kinh doanh'
      }
    ],
    synonyms: ['协作 (Phối hợp)', '联合'],
    collocations: ['合作愉快 (Hợp tác vui vẻ)', '合作伙伴 (Đối tác hợp tác)', '深化合作 (Đẩy mạnh hợp tác)']
  },
  {
    id: 'dict_7',
    hanzi: '学习',
    pinyin: 'xué xí',
    pinyinNoTone: 'xue xi',
    hanviet: 'Học Tập',
    meaning: 'Học tập / Học hỏi',
    hskLevel: 1,
    radical: '子 (Tử)',
    strokeCount: 11,
    type: 'Động từ',
    tags: ['Giao tiếp hàng ngày', 'Giáo dục', 'HSK1'],
    usageContext: 'Dùng khi nói về việc tiếp thu kiến thức, ngoại ngữ hoặc kỹ năng mới.',
    examples: [
      {
        zh: '我每天坚持学习汉语。',
        py: 'Wǒ měitiān jiānchí xuéxí hànyǔ.',
        vi: 'Tôi kiên trì học tiếng Trung mỗi ngày.',
        scenario: 'Chia sẻ mục tiêu cá nhân'
      },
      {
        zh: '向优秀同事学习，提升自我。',
        py: 'Xiàng yōuxiù tóngshì xuéxí, tíshēng zìwǒ.',
        vi: 'Học hỏi từ các đồng nghiệp xuất sắc để nâng cao bản thân.',
        scenario: 'Tinh thần làm việc công sở'
      }
    ],
    synonyms: ['研读', '请教'],
    collocations: ['学习汉语 (Học tiếng Trung)', '学习态度 (Thái độ học tập)', '终身学习 (Học tập suốt đời)']
  },
  {
    id: 'dict_8',
    hanzi: '面试',
    pinyin: 'miàn shì',
    pinyinNoTone: 'mian shi',
    hanviet: 'Diện Thí',
    meaning: 'Phỏng vấn xin việc',
    hskLevel: 4,
    radical: '面 (Diện)',
    strokeCount: 18,
    type: 'Động từ / Danh từ',
    tags: ['Công sở', 'Phỏng vấn', 'HSK4'],
    usageContext: 'Dùng trong ngữ cảnh tuyển dụng, xin việc hoặc đánh giá nhân sự.',
    examples: [
      {
        zh: '明天上午九点我有一个重要面试。',
        py: 'Míngtiān shàngwǔ jiǔ diǎn wǒ yǒu yí gè zhòngyào miànshì.',
        vi: 'Sáng mai 9 giờ tôi có một buổi phỏng vấn quan trọng.',
        scenario: 'Xin việc làm'
      },
      {
        zh: '面试官对我提出的专业问题很满意。',
        py: 'Miànshìguān duì wǒ tíchū de zhuānyè wèntí hěn mǎnyì.',
        vi: 'Người phỏng vấn rất hài lòng với các câu trả lời chuyên môn của tôi.',
        scenario: 'Chia sẻ trải nghiệm phỏng vấn'
      }
    ],
    synonyms: ['应聘 (Ứng tuyển)', '笔试 (Thi viết)'],
    collocations: ['参加面试 (Tham gia phỏng vấn)', '面试官 (Người phỏng vấn)', 'Passing miànshì (Đỗ phỏng vấn)']
  },
  {
    id: 'dict_9',
    hanzi: '项目',
    pinyin: 'xiàng mù',
    pinyinNoTone: 'xiang mu',
    hanviet: 'Hạng Mục',
    meaning: 'Dự án / Hạng mục công việc',
    hskLevel: 4,
    radical: '页 (Hiệt)',
    strokeCount: 14,
    type: 'Danh từ',
    tags: ['Công sở', 'Quản lý dự án', 'HSK4'],
    usageContext: 'Rất phổ biến trong công ty để chỉ nhiệm vụ, kế hoạch hoặc hợp đồng đang thực hiện.',
    examples: [
      {
        zh: '这个项目必须在月底前完成。',
        py: 'Zhè ge xiàngmù bìxū zài yuèdǐ qián wánchéng.',
        vi: 'Dự án này bắt buộc phải hoàn thành trước cuối tháng.',
        scenario: 'Quản lý tiến độ dự án'
      },
      {
        zh: '他是我们软件开发项目的负责人。',
        py: 'Tā shì wǒmen ruǎnjiān kāifā xiàngmù de fùzérén.',
        vi: 'Anh ấy là người phụ trách dự án phát triển phần mềm của chúng tôi.',
        scenario: 'Giới thiệu nhân sự dự án'
      }
    ],
    synonyms: ['工程 (Công trình)', '课题'],
    collocations: ['项目经理 (Quản lý dự án)', '项目进度 (Tiến độ dự án)', '负责项目 (Phụ trách dự án)']
  },
  {
    id: 'dict_10',
    hanzi: '合同',
    pinyin: 'hé tong',
    pinyinNoTone: 'he tong',
    hanviet: 'Hợp Đồng',
    meaning: 'Hợp đồng thương mại',
    hskLevel: 4,
    radical: '口 (Khẩu)',
    strokeCount: 12,
    type: 'Danh từ',
    tags: ['Công sở', 'Pháp lý / Thương lượng', 'HSK4'],
    usageContext: 'Dùng khi giao dịch mua bán, hợp tác kinh doanh, ký kết văn bản pháp lý.',
    examples: [
      {
        zh: '双方代表正式签署了商务合同。',
        py: 'Shuāngfāng dàibiǎo zhèngshì qiānshǔ le shāngwù hétong.',
        vi: 'Đại diện hai bên đã chính thức ký kết hợp đồng thương mại.',
        scenario: 'Lễ ký kết hợp đồng'
      },
      {
        zh: '在签合同之前，请仔细核对各项条款。',
        py: 'Zài qiān hétong zhīqián, qǐng zǐxì héduì gè xiàng tiáokuǎn.',
        vi: 'Trước khi ký hợp đồng, vui lòng đối soát kỹ từng điều khoản.',
        scenario: 'Cảnh báo pháp lý công sở'
      }
    ],
    synonyms: ['协议 (Hiệp nghị/Thỏa thuận)'],
    collocations: ['签合同 (Ký hợp đồng)', '合同条款 (Điều khoản hợp đồng)', '违反合同 (Vi phạm hợp đồng)']
  },
  {
    id: 'dict_11',
    hanzi: '咖啡',
    pinyin: 'kā fēi',
    pinyinNoTone: 'ka fei',
    hanviet: 'Cà Phê',
    meaning: 'Cà phê',
    hskLevel: 2,
    radical: '口 (Khẩu)',
    strokeCount: 16,
    type: 'Danh từ',
    tags: ['Giao tiếp hàng ngày', 'Ẩm thực', 'HSK2'],
    usageContext: 'Dùng khi gọi đồ uống, nghỉ giải lao giữa giờ hoặc hẹn hò bạn bè.',
    examples: [
      {
        zh: '下午茶时间，我们要不要喝杯咖啡？',
        py: 'Xiàwǔchá shíjiān, wǒmen yào bú yào hē bēi kāfēi?',
        vi: 'Giờ trà chiều, chúng ta uống một ly cà phê nhé?',
        scenario: 'Nghỉ giải lao văn phòng'
      }
    ],
    synonyms: [],
    collocations: ['美式咖啡 (Americano)', '拿铁 (Latte)', '冰咖啡 (Cà phê đá)']
  },
  {
    id: 'dict_12',
    hanzi: '出差',
    pinyin: 'chū chāi',
    pinyinNoTone: 'chu chai',
    hanviet: 'Xuất Sai',
    meaning: 'Đi công tác',
    hskLevel: 4,
    radical: '凵 (Khảm)',
    strokeCount: 15,
    type: 'Động từ',
    tags: ['Công sở', 'Hành chính', 'HSK4'],
    usageContext: 'Chỉ việc nhân viên di chuyển đến thành phố hoặc quốc gia khác để làm việc.',
    examples: [
      {
        zh: '张经理下周要去上海出差三天。',
        py: 'Zhāng jīnglǐ xià zhōu yào qù Shànghǎi chūchāi sān tiān.',
        vi: 'Giám đốc Trương tuần sau sẽ đi công tác Thượng Hải 3 ngày.',
        scenario: 'Lịch trình làm việc'
      }
    ],
    synonyms: ['公干'],
    collocations: ['出差补贴 (Phụ cấp công tác)', '出差计划 (Kế hoạch công tác)']
  }
];
