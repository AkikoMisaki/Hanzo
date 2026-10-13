// Utility Chuyển Đổi & Chuẩn Hóa Pinyin Tiếng Trung (js/utils/pinyinUtils.js)

// Bảng tra từ vựng Hán tự -> Pinyin mở rộng
export const HANZI_PINYIN_DICT = {
  '你好': 'nǐ hǎo',
  '谢谢': 'xiè xie',
  '再见': 'zài jiàn',
  '中国': 'zhōng guó',
  '汉语': 'hàn yǔ',
  '朋友': 'péng you',
  '老师': 'lǎo shī',
  '学生': 'xué sheng',
  '高兴': 'gāo xìng',
  '学习': 'xué xí',
  '家': 'jiā',
  '爸爸': 'bà ba',
  '妈妈': 'mā ma',
  '医生': 'yī shēng',
  '医院': 'yī yuàn',
  '学校': 'xué xiào',
  '商店': 'shāng diàn',
  '北京': 'běi jīng',
  '猫': 'māo',
  '狗': 'gǒu',
  '水': 'shuǐ',
  '茶': 'chá',
  '米饭': 'mǐ fàn',
  '苹果': 'píng guǒ',
  '衣服': 'yī fu',
  '漂亮': 'piào liang',
  '钱': 'qián',
  '买': 'mǎi',
  '卖': 'mài',
  '打电话': 'dǎ diàn huà',
  '看书': 'kàn shū',
  '听': 'tīng',
  '写': 'xiě',
  '说话': 'shuō huà',
  '睡觉': 'shuì jiào',
  '喜欢': 'xǐ huan',
  '准备': 'zhǔn bèi',
  '已经': 'yǐ jīng',
  '咖啡': 'kā fēi',
  '运动': 'yùn dòng',
  '时间': 'shí jiān',
  '希望': 'xī wàng',
  '意思': 'yì si',
  '问题': 'wèn tí',
  '会议': 'huì yì',
  '选择': 'xuǎn zé',
  '方便': 'fāng biàn',
  '环境': 'huán jìng',
  '机会': 'jī huì',
  '根据': 'gēn jù',
  '清楚': 'qīng chu',
  '工作': 'gōng zuò',
  '邮件': 'yóu jiàn',
  '合作': 'hé zuò',
  '护照': 'hù zhào',
  '机场': 'jī chǎng',
  '酒店': 'jiǔ diàn',
  '出租车': 'chū zū chē',
  '多少钱': 'duō shao qián',
  '行李': 'xíng li',
  '订房': 'dìng fáng',
  '服务员': 'fú wù yuán',
  '买单': 'mǎi dān',
  '菜单': 'cài dān',
  '饺子': 'jiǎo zi',
  '好吃的': 'hǎo chī de',
  '辣的': 'là de',
  '同事': 'tóng shì',
  '领导': 'lǐng dǎo',
  '打卡': 'dǎ kǎ',
  '加班': 'jiā bān',
  '请假': 'qǐng jià',
  '主持人': 'zhǔ chí rén',
  '议程': 'yì chéng',
  '面试': 'miàn shì',
  '项目': 'xiàng mù',
  '合同': 'hé tong',
  '出差': 'chū chāi',
  '你': 'nǐ',
  '好': 'hǎo',
  '谢': 'xiè',
  '再': 'zài',
  '见': 'jiàn',
  '中': 'zhōng',
  '国': 'guó',
  '汉': 'hàn',
  '语': 'yǔ',
  '朋': 'péng',
  '友': 'you',
  '老': 'lǎo',
  '师': 'shī',
  '学': 'xué',
  '生': 'shēng',
  '高': 'gāo',
  '兴': 'xìng',
  '习': 'xí',
  '爸': 'bà',
  '妈': 'mā',
  '医': 'yī',
  '院': 'yuàn',
  '校': 'xiào',
  '商': 'shāng',
  '店': 'diàn',
  '北': 'běi',
  '京': 'jīng',
  '做': 'zuò',
  '吃': 'chī',
  '喝': 'hē',
  '去': 'qù',
  '来': 'lái',
  '想': 'xiǎng',
  '要': 'yào',
  '能': 'néng',
  '会': 'huì',
  '多': 'duō',
  '少': 'shǎo',
  '大': 'dà',
  '小': 'xiǎo',
  '是': 'shì',
  '不': 'bù',
  '有': 'yǒu',
  '没': 'méi',
  '人': 'rén',
  '我': 'wǒ',
  '他': 'tā',
  '她': 'tā',
  '们': 'men'
};

// Bảng tra từ vựng / Hán tự -> Từ Hán Việt
export const HANZI_HANVIET_DICT = {
  '你好': 'Nễ Hảo',
  '谢谢': 'Tạ Tạ',
  '再见': 'Tái Kiến',
  '中国': 'Trung Quốc',
  '汉语': 'Hán Ngữ',
  '朋友': 'Bằng Hữu',
  '老师': 'Lão Sư',
  '学生': 'Học Sinh',
  '高兴': 'Cao Hứng',
  '学习': 'Học Tập',
  '家': 'Gia',
  '爸爸': 'Bả Bả',
  '妈妈': 'Mã Mã',
  '医生': 'Y Sinh',
  '医院': 'Y Viện',
  '学校': 'Học Hiệu',
  '商店': 'Thương Điếm',
  '北京': 'Bắc Kinh',
  '猫': 'Miêu',
  '狗': 'Cẩu',
  '水': 'Thủy',
  '茶': 'Trà',
  '米饭': 'Mễ Phạn',
  '苹果': 'Tần Quả',
  '衣服': 'Y Phục',
  '漂亮': 'Phiêu Lượng',
  '钱': 'Tiền',
  '买': 'Mãi',
  '卖': 'Mại',
  '打电话': 'Đả Điện Thoại',
  '看书': 'Khán Thư',
  '听': 'Thính',
  '写': 'Tả',
  '说话': 'Thuyết Thoại',
  '睡觉': 'Thụy Giác',
  '喜欢': 'Hỷ Hoan',
  '准备': 'Chuẩn Bị',
  '已经': 'Dĩ Kinh',
  '咖啡': 'Cà Phê',
  '运动': 'Vận Động',
  '时间': 'Thời Gian',
  '希望': 'Hy Vọng',
  '意思': 'Ý Tư',
  '问题': 'Vấn Đề',
  '会议': 'Hội Nghị',
  '选择': 'Tuyển Trạch',
  '方便': 'Phương Tiện',
  '环境': 'Hoàn Cảnh',
  '机会': 'Cơ Hội',
  '根据': 'Căn Cứ',
  '清楚': 'Thanh Sở',
  '工作': 'Công Tác',
  '邮件': 'Bưu Kiện',
  '合作': 'Hợp Tác',
  '护照': 'Hộ Chiếu',
  '机场': 'Cơ Trường',
  '酒店': 'Tửu Điếm',
  '出租车': 'Xuất Tô Xa',
  '多少钱': 'Đa Thiểu Tiền',
  '行李': 'Hành Lý',
  '订房': 'Đặt Phòng',
  '服务员': 'Phục Vụ Viên',
  '买单': 'Mãi Đơn',
  '菜单': 'Thái Đơn',
  '饺子': 'Giảo Tử',
  '好吃的': 'Hảo Chinh',
  '辣的': 'Lạt',
  '同事': 'Đồng Sự',
  '领导': 'Lãnh Đạo',
  '打卡': 'Đả Tạp',
  '加班': 'Gia Ban',
  '请假': 'Thỉnh Giả',
  '主持人': 'Chủ Trì Nhân',
  '议程': 'Nghị Trình',
  '面试': 'Diện Thí',
  '项目': 'Hạng Mục',
  '合同': 'Hợp Đồng',
  '出差': 'Xuất Sai',
  '你': 'Nễ',
  '好': 'Hảo',
  '谢': 'Tạ',
  '再': 'Tái',
  '见': 'Kiến',
  '中': 'Trung',
  '国': 'Quốc',
  '汉': 'Hán',
  '语': 'Ngữ',
  '朋': 'Bằng',
  '友': 'Hữu',
  '老': 'Lão',
  '师': 'Sư',
  '学': 'Học',
  '生': 'Sinh',
  '高': 'Cao',
  '兴': 'Hứng',
  '习': 'Tập',
  '爸': 'Bả',
  '妈': 'Mã',
  '医': 'Y',
  '院': 'Viện',
  '校': 'Hiệu',
  '商': 'Thương',
  '店': 'Điếm',
  '北': 'Bắc',
  '京': 'Kinh',
  '做': 'Tố',
  '吃': 'Khiết',
  '喝': 'Hát',
  '去': 'Khứ',
  '来': 'Lai',
  '想': 'Tưởng',
  '要': 'Yếu',
  '能': 'Năng',
  '会': 'Hội',
  '多': 'Đa',
  '少': 'Thiểu',
  '大': 'Đại',
  '小': 'Tiểu',
  '是': 'Thị',
  '不': 'Bất',
  '有': 'Hữu',
  '没': 'Một',
  '人': 'Nhân',
  '我': 'Ngã',
  '他': 'Tha',
  '她': 'Tha',
  '们': 'Môn'
};

/**
 * Chuyển Pinyin có số (vd: ni3 hao3, xue2 xi2, xie4xie, lv4) thành Pinyin có dấu thanh chuẩn Unicode.
 */
export function convertToneNumbersToDiacritics(str) {
  if (!str || typeof str !== 'string') return '';

  const toneMap = {
    a: ['ā', 'á', 'ǎ', 'à'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    v: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    A: ['Ā', 'Á', 'Ǎ', 'À'],
    E: ['Ē', 'É', 'Ě', 'È'],
    I: ['Ī', 'Í', 'Ǐ', 'Ì'],
    O: ['Ō', 'Ó', 'Ǒ', 'Ò'],
    U: ['Ū', 'Ú', 'Ǔ', 'Ù'],
    Ü: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ'],
    V: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ']
  };

  let text = str.replace(/u:/gi, 'ü').replace(/v/gi, 'ü');

  return text.replace(/([a-zA-ZüÜ]+)([1-5])/g, (match, syllable, toneNumStr) => {
    const tone = parseInt(toneNumStr, 10);
    if (tone === 5) return syllable;

    let lower = syllable.toLowerCase();
    let targetIdx = -1;

    if (lower.indexOf('a') !== -1) targetIdx = lower.indexOf('a');
    else if (lower.indexOf('e') !== -1) targetIdx = lower.indexOf('e');
    else if (lower.indexOf('ou') !== -1) targetIdx = lower.indexOf('ou');
    else {
      for (let i = syllable.length - 1; i >= 0; i--) {
        if ('aeiouüAEIOUÜ'.indexOf(syllable[i]) !== -1) {
          targetIdx = i;
          break;
        }
      }
    }

    if (targetIdx !== -1) {
      const origChar = syllable[targetIdx];
      const replacements = toneMap[origChar];
      if (replacements && replacements[tone - 1]) {
        const replacement = replacements[tone - 1];
        return syllable.substring(0, targetIdx) + replacement + syllable.substring(targetIdx + 1);
      }
    }
    return syllable;
  });
}

/**
 * Chuẩn hóa chuỗi Pinyin:
 * - Chuyển tone dạng số (ni3 hao3 -> nǐ hǎo)
 * - Xử lý dấu thanh bị tách (ni ˇ ha ˇ o -> nǐ hǎo)
 * - Xóa khoảng trắng thừa, chuẩn hóa Unicode NFC
 */
export function normalizePinyin(pinyinStr) {
  if (!pinyinStr || typeof pinyinStr !== 'string') return '';
  let str = pinyinStr.trim();

  try { str = str.normalize('NFC'); } catch (e) {}

  str = str
    .replace(/a\s*[\u02C7\u030Cˇ^]/g, 'ǎ').replace(/A\s*[\u02C7\u030Cˇ^]/g, 'Ǎ')
    .replace(/e\s*[\u02C7\u030Cˇ^]/g, 'ě').replace(/E\s*[\u02C7\u030Cˇ^]/g, 'Ě')
    .replace(/i\s*[\u02C7\u030Cˇ^]/g, 'ǐ').replace(/I\s*[\u02C7\u030Cˇ^]/g, 'Ǐ')
    .replace(/o\s*[\u02C7\u030Cˇ^]/g, 'ǒ').replace(/O\s*[\u02C7\u030Cˇ^]/g, 'Ǒ')
    .replace(/u\s*[\u02C7\u030Cˇ^]/g, 'ǔ').replace(/U\s*[\u02C7\u030Cˇ^]/g, 'Ǔ')
    .replace(/ü\s*[\u02C7\u030Cˇ^]/g, 'ǚ').replace(/Ü\s*[\u02C7\u030Cˇ^]/g, 'Ǚ')
    .replace(/v\s*[\u02C7\u030Cˇ^]/g, 'ǚ').replace(/V\s*[\u02C7\u030Cˇ^]/g, 'Ǚ')
    .replace(/a\s*[\u0304\u00AF]/g, 'ā').replace(/A\s*[\u0304\u00AF]/g, 'Ā')
    .replace(/e\s*[\u0304\u00AF]/g, 'ē').replace(/E\s*[\u0304\u00AF]/g, 'Ē')
    .replace(/i\s*[\u0304\u00AF]/g, 'ī').replace(/I\s*[\u0304\u00AF]/g, 'Ī')
    .replace(/o\s*[\u0304\u00AF]/g, 'ō').replace(/O\s*[\u0304\u00AF]/g, 'Ō')
    .replace(/u\s*[\u0304\u00AF]/g, 'ū').replace(/U\s*[\u0304\u00AF]/g, 'Ū')
    .replace(/a\s*['\u0301]/g, 'á').replace(/A\s*['\u0301]/g, 'Á')
    .replace(/e\s*['\u0301]/g, 'é').replace(/E\s*['\u0301]/g, 'É')
    .replace(/i\s*['\u0301]/g, 'í').replace(/I\s*['\u0301]/g, 'Í')
    .replace(/o\s*['\u0301]/g, 'ó').replace(/O\s*['\u0301]/g, 'Ó')
    .replace(/u\s*['\u0301]/g, 'ú').replace(/U\s*['\u0301]/g, 'Ú')
    .replace(/a\s*[`\u0300]/g, 'à').replace(/A\s*[`\u0300]/g, 'À')
    .replace(/e\s*[`\u0300]/g, 'è').replace(/E\s*[`\u0300]/g, 'È')
    .replace(/i\s*[`\u0300]/g, 'ì').replace(/I\s*[`\u0300]/g, 'Ì')
    .replace(/o\s*[`\u0300]/g, 'ò').replace(/O\s*[`\u0300]/g, 'Ò')
    .replace(/u\s*[`\u0300]/g, 'ù').replace(/U\s*[`\u0300]/g, 'Ù');

  str = convertToneNumbersToDiacritics(str);
  try { str = str.normalize('NFC'); } catch (e) {}
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Tra cứu Pinyin từ chữ Hán (Hanzi) tự động.
 */
export function lookupPinyinForHanzi(hanzi) {
  if (!hanzi || typeof hanzi !== 'string') return '';
  const cleanHanzi = hanzi.trim();
  if (!cleanHanzi) return '';

  if (HANZI_PINYIN_DICT[cleanHanzi]) {
    return HANZI_PINYIN_DICT[cleanHanzi];
  }

  const chars = Array.from(cleanHanzi);
  const pinyinParts = [];
  let allFound = true;

  for (const c of chars) {
    if (HANZI_PINYIN_DICT[c]) {
      pinyinParts.push(HANZI_PINYIN_DICT[c]);
    } else if (/[\u4e00-\u9fa5]/.test(c)) {
      allFound = false;
    } else {
      pinyinParts.push(c);
    }
  }

  if (pinyinParts.length > 0 && (allFound || pinyinParts.length === chars.length)) {
    return pinyinParts.join(' ');
  }

  return '';
}

/**
 * Tra cứu âm Hán Việt từ chữ Hán (Hanzi) tự động.
 */
export function lookupHanVietForHanzi(hanzi) {
  if (!hanzi || typeof hanzi !== 'string') return '';
  const cleanHanzi = hanzi.trim();
  if (!cleanHanzi) return '';

  if (HANZI_HANVIET_DICT[cleanHanzi]) {
    return HANZI_HANVIET_DICT[cleanHanzi];
  }

  const chars = Array.from(cleanHanzi);
  const parts = [];
  let allFound = true;

  for (const c of chars) {
    if (HANZI_HANVIET_DICT[c]) {
      parts.push(HANZI_HANVIET_DICT[c]);
    } else if (/[\u4e00-\u9fa5]/.test(c)) {
      allFound = false;
    } else {
      parts.push(c);
    }
  }

  if (parts.length > 0 && (allFound || parts.length === chars.length)) {
    return parts.join(' ');
  }

  return '';
}

