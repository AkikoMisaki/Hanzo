/* ==========================================================================
   Hanzo - Vocabulary Game View (Game từ vựng)
   Matching the reference layout & aesthetics
   ========================================================================== */

import { getAllTopicsList, getRealTimeStats, updateWordSRS } from '../utils/srs.js';

function getWordCardIllustration(word) {
  if (!word) return '';
  const hanzi = String(word.hanzi || '').trim();
  const meaning = String(word.meaning || '').trim().toLowerCase();
  
  const exactMap = {
    // Apologies & Polite Greetings
    '对不起': { from: 'from-purple-600', to: 'to-indigo-800', icon: '🙇‍♂️', glow: 'bg-purple-400/20' },
    '抱歉': { from: 'from-purple-600', to: 'to-indigo-800', icon: '🙏', glow: 'bg-purple-400/20' },
    '没关系': { from: 'from-emerald-500', to: 'to-teal-700', icon: '👌', glow: 'bg-emerald-400/20' },
    '不客气': { from: 'from-teal-500', to: 'to-emerald-700', icon: '😊', glow: 'bg-teal-400/20' },
    '你': { from: 'from-violet-600', to: 'to-indigo-800', icon: '🙋‍♂️', glow: 'bg-violet-400/20' },
    '您': { from: 'from-violet-600', to: 'to-indigo-800', icon: '🧑‍💼', glow: 'bg-violet-400/20' },
    '你好': { from: 'from-rose-500', to: 'to-pink-600', icon: '👋', glow: 'bg-rose-400/20' },
    '谢谢': { from: 'from-amber-500', to: 'to-orange-600', icon: '🙏', glow: 'bg-amber-400/20' },
    '再见': { from: 'from-sky-500', to: 'to-blue-600', icon: '👋', glow: 'bg-sky-400/20' },
    '请': { from: 'from-teal-600', to: 'to-cyan-800', icon: '🤲', glow: 'bg-teal-400/20' },

    // Numbers
    '一': { from: 'from-blue-500', to: 'to-indigo-700', icon: '1️⃣', glow: 'bg-blue-400/20' },
    '二': { from: 'from-blue-500', to: 'to-indigo-700', icon: '2️⃣', glow: 'bg-blue-400/20' },
    '两': { from: 'from-blue-500', to: 'to-indigo-700', icon: '2️⃣', glow: 'bg-blue-400/20' },
    '三': { from: 'from-blue-500', to: 'to-indigo-700', icon: '3️⃣', glow: 'bg-blue-400/20' },
    '四': { from: 'from-blue-500', to: 'to-indigo-700', icon: '4️⃣', glow: 'bg-blue-400/20' },
    '五': { from: 'from-blue-500', to: 'to-indigo-700', icon: '5️⃣', glow: 'bg-blue-400/20' },
    '六': { from: 'from-blue-500', to: 'to-indigo-700', icon: '6️⃣', glow: 'bg-blue-400/20' },
    '七': { from: 'from-blue-500', to: 'to-indigo-700', icon: '7️⃣', glow: 'bg-blue-400/20' },
    '八': { from: 'from-blue-500', to: 'to-indigo-700', icon: '8️⃣', glow: 'bg-blue-400/20' },
    '九': { from: 'from-blue-500', to: 'to-indigo-700', icon: '9️⃣', glow: 'bg-blue-400/20' },
    '十': { from: 'from-blue-500', to: 'to-indigo-700', icon: '🔟', glow: 'bg-blue-400/20' },
    '百': { from: 'from-amber-500', to: 'to-orange-700', icon: '💯', glow: 'bg-amber-400/20' },
    '千': { from: 'from-amber-500', to: 'to-orange-700', icon: '🔢', glow: 'bg-amber-400/20' },

    // Tech & Accessories
    '耳机': { from: 'from-cyan-600', to: 'to-blue-800', icon: '🎧', glow: 'bg-cyan-400/20' },
    '电脑': { from: 'from-blue-600', to: 'to-indigo-800', icon: '💻', glow: 'bg-blue-400/20' },
    '手机': { from: 'from-sky-500', to: 'to-blue-700', icon: '📱', glow: 'bg-sky-400/20' },
    '电视': { from: 'from-slate-600', to: 'to-slate-800', icon: '📺', glow: 'bg-slate-400/20' },
    '手表': { from: 'from-amber-600', to: 'to-orange-800', icon: '⌚', glow: 'bg-amber-400/20' },

    // Places & Countries
    '中国': { from: 'from-red-600', to: 'to-rose-800', icon: '🇨🇳', glow: 'bg-red-400/20' },
    '北京': { from: 'from-rose-600', to: 'to-red-800', icon: '🏯', glow: 'bg-rose-400/20' },
    '汉语': { from: 'from-red-500', to: 'to-rose-700', icon: '🗣️', glow: 'bg-red-400/20' },
    '中文': { from: 'from-red-500', to: 'to-rose-700', icon: '💬', glow: 'bg-red-400/20' },

    // People & Education
    '朋友': { from: 'from-purple-500', to: 'to-indigo-700', icon: '🧑‍🤝‍🧑', glow: 'bg-purple-400/20' },
    '老师': { from: 'from-blue-600', to: 'to-indigo-800', icon: '🧑‍🏫', glow: 'bg-blue-400/20' },
    '学生': { from: 'from-teal-500', to: 'to-emerald-700', icon: '🧑‍🎓', glow: 'bg-teal-400/20' },
    '高兴': { from: 'from-amber-400', to: 'to-orange-500', icon: '😊', glow: 'bg-amber-300/20' },
    '学习': { from: 'from-blue-500', to: 'to-indigo-700', icon: '📚', glow: 'bg-blue-400/20' },
    '准备': { from: 'from-slate-600', to: 'to-slate-800', icon: '📋', glow: 'bg-slate-400/20' },
    '已经': { from: 'from-emerald-500', to: 'to-teal-700', icon: '✅', glow: 'bg-emerald-400/20' },
    '咖啡': { from: 'from-amber-800', to: 'to-stone-900', icon: '☕', glow: 'bg-amber-400/20' },
    '运动': { from: 'from-emerald-500', to: 'to-green-700', icon: '🏃', glow: 'bg-emerald-400/20' },
    '时间': { from: 'from-slate-700', to: 'to-slate-900', icon: '⏰', glow: 'bg-slate-400/20' },
    '希望': { from: 'from-sky-400', to: 'to-blue-600', icon: '🌟', glow: 'bg-sky-300/20' },
    '意思': { from: 'from-amber-400', to: 'to-orange-500', icon: '💡', glow: 'bg-amber-300/20' },
    '问题': { from: 'from-indigo-500', to: 'to-purple-700', icon: '❓', glow: 'bg-indigo-400/20' },
    '会议': { from: 'from-slate-700', to: 'to-gray-900', icon: '👔', glow: 'bg-slate-400/20' },
    '选择': { from: 'from-purple-600', to: 'to-indigo-800', icon: '🔀', glow: 'bg-purple-400/20' },
    '方便': { from: 'from-teal-500', to: 'to-cyan-700', icon: '⚡', glow: 'bg-teal-400/20' },
    '环境': { from: 'from-emerald-500', to: 'to-green-700', icon: '🌿', glow: 'bg-emerald-400/20' },
    '机会': { from: 'from-blue-600', to: 'to-sky-700', icon: '🚪', glow: 'bg-blue-400/20' },
    '根据': { from: 'from-indigo-600', to: 'to-blue-800', icon: '📊', glow: 'bg-indigo-400/20' },
    '清楚': { from: 'from-cyan-500', to: 'to-blue-600', icon: '🔍', glow: 'bg-cyan-400/20' },
    '护照': { from: 'from-blue-700', to: 'to-indigo-900', icon: '🛂', glow: 'bg-blue-400/20' },
    '机场': { from: 'from-sky-600', to: 'to-blue-800', icon: '✈️', glow: 'bg-sky-400/20' },
    '酒店': { from: 'from-indigo-600', to: 'to-purple-800', icon: '🏨', glow: 'bg-indigo-400/20' },
    '出租车': { from: 'from-yellow-400', to: 'to-amber-600', icon: '🚕', glow: 'bg-yellow-300/20' },
    '多少钱': { from: 'from-emerald-500', to: 'to-green-700', icon: '💵', glow: 'bg-emerald-400/20' },
    '钱': { from: 'from-emerald-500', to: 'to-green-700', icon: '💵', glow: 'bg-emerald-400/20' },
    '行李': { from: 'from-amber-600', to: 'to-orange-800', icon: '🧳', glow: 'bg-amber-400/20' },
    '订房': { from: 'from-rose-600', to: 'to-red-800', icon: '🔑', glow: 'bg-rose-400/20' },
    '服务员': { from: 'from-pink-500', to: 'to-rose-600', icon: '🧑‍🍳', glow: 'bg-pink-400/20' },
    '买单': { from: 'from-emerald-600', to: 'to-teal-800', icon: '💳', glow: 'bg-emerald-400/20' },
    '菜单': { from: 'from-indigo-500', to: 'to-purple-700', icon: '📜', glow: 'bg-indigo-400/20' },
    '饺子': { from: 'from-amber-500', to: 'to-orange-600', icon: '🥟', glow: 'bg-amber-400/20' },
    '米饭': { from: 'from-amber-500', to: 'to-orange-600', icon: '🍚', glow: 'bg-amber-400/20' },
    '好吃的': { from: 'from-rose-500', to: 'to-red-600', icon: '😋', glow: 'bg-rose-400/20' },
    '辣的': { from: 'from-red-600', to: 'to-rose-800', icon: '🌶️', glow: 'bg-red-400/20' },
    '水': { from: 'from-cyan-500', to: 'to-blue-600', icon: '💧', glow: 'bg-cyan-400/20' },
    '面包': { from: 'from-amber-600', to: 'to-yellow-700', icon: '🍞', glow: 'bg-amber-400/20' },
    '苹果': { from: 'from-red-500', to: 'to-rose-600', icon: '🍎', glow: 'bg-red-400/20' },
    '茶': { from: 'from-emerald-500', to: 'to-teal-700', icon: '🍵', glow: 'bg-emerald-400/20' },
    '鸡肉': { from: 'from-rose-500', to: 'to-red-600', icon: '🍗', glow: 'bg-rose-400/20' },
    '猪肉': { from: 'from-rose-600', to: 'to-red-700', icon: '🥩', glow: 'bg-rose-400/20' },
    '牛肉': { from: 'from-amber-700', to: 'to-red-800', icon: '🥩', glow: 'bg-amber-400/20' },
    '鱼': { from: 'from-sky-500', to: 'to-blue-600', icon: '🐟', glow: 'bg-sky-400/20' },
    '猫': { from: 'from-orange-500', to: 'to-amber-600', icon: '🐱', glow: 'bg-orange-400/20' },
    '狗': { from: 'from-lime-600', to: 'to-green-700', icon: '🐶', glow: 'bg-lime-400/20' },
    '看书': { from: 'from-sky-500', to: 'to-blue-700', icon: '📖', glow: 'bg-sky-400/20' },
    '医院': { from: 'from-cyan-600', to: 'to-blue-700', icon: '🏥', glow: 'bg-cyan-400/20' },
    '学校': { from: 'from-violet-500', to: 'to-purple-700', icon: '🏫', glow: 'bg-violet-400/20' },
    '商店': { from: 'from-amber-500', to: 'to-orange-700', icon: '🏪', glow: 'bg-amber-400/20' },
    '衣服': { from: 'from-purple-500', to: 'to-indigo-700', icon: '👕', glow: 'bg-purple-400/20' },
    '工作': { from: 'from-slate-600', to: 'to-slate-800', icon: '💼', glow: 'bg-slate-400/20' }
  };

  if (exactMap[hanzi]) {
    const t = exactMap[hanzi];
    return renderVisualCard(t.from, t.to, t.icon, t.glow);
  }

  // Semantic Keyword Matching
  // 1. Apologies, Forgiveness, Thanks & Politeness
  if (meaning.includes('xin lỗi') || meaning.includes('tạ lỗi') || meaning.includes('bất quá') || meaning.includes('thông cảm') || meaning.includes('xin thứ')) {
    return renderVisualCard('from-purple-600', 'to-indigo-800', '🙇‍♂️', 'bg-purple-400/20');
  }
  if (meaning.includes('không sao') || meaning.includes('đừng khách') || meaning.includes('không có gì') || meaning.includes('được rồi')) {
    return renderVisualCard('from-emerald-500', 'to-teal-700', '👌', 'bg-emerald-400/20');
  }
  if (meaning.includes('cảm ơn') || meaning.includes('tạ ơn') || meaning.includes('cảm tạ')) {
    return renderVisualCard('from-amber-500', 'to-orange-600', '🙏', 'bg-amber-400/20');
  }
  if (meaning.includes('xin chào') || meaning.includes('chào')) {
    return renderVisualCard('from-rose-500', 'to-pink-600', '👋', 'bg-rose-400/20');
  }

  // 2. Audio & Tech Accessories
  if (meaning.includes('tai nghe') || meaning.includes('âm thanh')) {
    return renderVisualCard('from-cyan-600', 'to-blue-800', '🎧', 'bg-cyan-400/20');
  }
  if (meaning.includes('máy tính') || meaning.includes('điện thoại') || meaning.includes('tivi') || meaning.includes('máy ảnh')) {
    return renderVisualCard('from-blue-600', 'to-indigo-800', '💻', 'bg-blue-400/20');
  }

  // 3. Numbers & Quantities
  if (meaning.includes('số 1') || meaning.includes('một') || meaning.includes('nhất')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '1️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 2') || meaning.includes('hai') || meaning.includes('nhị') || meaning.includes('lưỡng')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '2️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 3') || meaning.includes('ba') || meaning.includes('tam')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '3️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 4') || meaning.includes('bốn') || meaning.includes('tứ')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '4️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 5') || (meaning.includes('năm') && !meaning.includes('năm ngoái') && !meaning.includes('năm nay'))) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '5️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 6') || meaning.includes('sáu') || meaning.includes('lục')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '6️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 7') || meaning.includes('bảy') || meaning.includes('thất')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '7️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 8') || meaning.includes('tám') || meaning.includes('bát')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '8️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 9') || meaning.includes('chín') || meaning.includes('cửu')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '9️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 10') || meaning.includes('mười') || meaning.includes('thập')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '🔟', 'bg-blue-400/20');
  }
  if (meaning.includes('trăm') || meaning.includes('nghìn') || meaning.includes('vạn')) {
    return renderVisualCard('from-amber-500', 'to-orange-700', '💯', 'bg-amber-400/20');
  }

  // 4. Family & People
  if (meaning.includes('bố') || meaning.includes('mẹ') || meaning.includes('cha') || meaning.includes('ông') || meaning.includes('bà') || meaning.includes('con')) {
    return renderVisualCard('from-indigo-500', 'to-purple-700', '👨‍👩‍👧', 'bg-indigo-400/20');
  }
  if (meaning.includes('bạn') || meaning.includes('anh') || meaning.includes('chị') || meaning.includes('người') || meaning.includes('tôi') || meaning.includes('nễ') || meaning.includes('bằng hữu')) {
    return renderVisualCard('from-violet-600', 'to-indigo-800', '🙋‍♂️', 'bg-violet-400/20');
  }

  // 5. Learning & Books
  if (meaning.includes('học') || meaning.includes('sách') || meaning.includes('viết') || meaning.includes('đọc') || meaning.includes('bài') || meaning.includes('ngôn ngữ') || meaning.includes('hán') || meaning.includes('chữ')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '📚', 'bg-blue-400/20');
  }

  // 6. Food & Drinks
  if (meaning.includes('ăn') || meaning.includes('uống') || meaning.includes('cơm') || meaning.includes('thịt') || meaning.includes('bánh') || meaning.includes('trái') || meaning.includes('quả') || meaning.includes('món') || meaning.includes('ngon') || meaning.includes('vị')) {
    return renderVisualCard('from-amber-500', 'to-orange-600', '🍽️', 'bg-amber-400/20');
  }

  // 7. Travel & Transport
  if (meaning.includes('xe') || meaning.includes('máy bay') || meaning.includes('sân bay') || meaning.includes('du lịch') || meaning.includes('hộ chiếu') || meaning.includes('khách sạn') || meaning.includes('hành lý') || meaning.includes('đi') || meaning.includes('đến')) {
    return renderVisualCard('from-sky-500', 'to-blue-700', '✈️', 'bg-sky-400/20');
  }

  // 8. Money & Shopping
  if (meaning.includes('tiền') || meaning.includes('giá') || meaning.includes('thanh toán') || meaning.includes('mua') || meaning.includes('bán') || meaning.includes('mãi đơn') || meaning.includes('tính tiền')) {
    return renderVisualCard('from-emerald-500', 'to-green-700', '💵', 'bg-emerald-400/20');
  }

  // 9. Time & Calendar
  if (meaning.includes('thời gian') || meaning.includes('giờ') || meaning.includes('phút') || meaning.includes('ngày') || meaning.includes('tháng') || meaning.includes('năm') || meaning.includes('tuần') || meaning.includes('sáng') || meaning.includes('tối')) {
    return renderVisualCard('from-slate-600', 'to-slate-800', '⏰', 'bg-slate-400/20');
  }

  // 10. Buildings & Places
  if (meaning.includes('nhà') || meaning.includes('bệnh viện') || meaning.includes('trường') || meaning.includes('cửa hàng') || meaning.includes('công ty')) {
    return renderVisualCard('from-indigo-600', 'to-purple-800', '🏠', 'bg-indigo-400/20');
  }

  // 11. Feelings & Emotions
  if (meaning.includes('vui') || meaning.includes('thích') || meaning.includes('yêu') || meaning.includes('chúc')) {
    return renderVisualCard('from-rose-500', 'to-pink-600', '😊', 'bg-rose-400/20');
  }

  // 12. Sports & Fitness
  if (meaning.includes('thể thao') || meaning.includes('chạy') || meaning.includes('vận động')) {
    return renderVisualCard('from-emerald-500', 'to-teal-700', '🏃', 'bg-emerald-400/20');
  }

  // 13. Questions & Doubts
  if (meaning.includes('câu hỏi') || meaning.includes('vấn đề') || meaning.includes('hỏi') || meaning.includes('gì') || meaning.includes('đâu') || meaning.includes('ai') || meaning.includes('sao')) {
    return renderVisualCard('from-purple-500', 'to-indigo-700', '❓', 'bg-purple-400/20');
  }

  // Deterministic Dynamic Fallback for any unknown word:
  // Uses string character sum to assign a unique gradient + symbol so no word looks generic
  let charCodeSum = 0;
  for (let i = 0; i < hanzi.length; i++) {
    charCodeSum += hanzi.charCodeAt(i);
  }
  const dynamicPalettes = [
    { from: 'from-rose-500', to: 'to-red-700', icon: '🌟', glow: 'bg-rose-400/20' },
    { from: 'from-purple-600', to: 'to-indigo-800', icon: '💡', glow: 'bg-purple-400/20' },
    { from: 'from-emerald-600', to: 'to-teal-800', icon: '🍀', glow: 'bg-emerald-400/20' },
    { from: 'from-amber-500', to: 'to-orange-700', icon: '🔖', glow: 'bg-amber-400/20' },
    { from: 'from-cyan-500', to: 'to-blue-700', icon: '💠', glow: 'bg-cyan-400/20' },
    { from: 'from-fuchsia-600', to: 'to-pink-700', icon: '✨', glow: 'bg-fuchsia-400/20' },
    { from: 'from-blue-600', to: 'to-sky-800', icon: '🎯', glow: 'bg-blue-400/20' }
  ];
  const p = dynamicPalettes[charCodeSum % dynamicPalettes.length];
  return renderVisualCard(p.from, p.to, p.icon, p.glow);
}

function renderVisualCard(fromClass, toClass, iconSymbol, glowClass) {
  return `
    <div class="w-full h-full bg-gradient-to-br ${fromClass} ${toClass} flex items-center justify-center p-4 text-center select-none relative overflow-hidden group shadow-inner">
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full ${glowClass} blur-lg group-hover:scale-125 transition-transform duration-500"></div>
      <div class="absolute -left-8 -bottom-8 w-32 h-32 rounded-full ${glowClass} blur-lg group-hover:scale-125 transition-transform duration-500"></div>
      <span class="text-7xl md:text-8xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xl leading-none z-10">${iconSymbol}</span>
    </div>
  `;
}

const DEFAULT_GAME_IMAGE = 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80';

export function renderGameView(container, backHandler = null) {
  if (!container) return;

  let allTopics = getAllTopicsList();

  // Create default fallback topic "Nhà hàng & Đồ ăn" matching reference photo if not present
  const restaurantWords = [
    { hanzi: '米饭', pinyin: 'mǐfàn', hanviet: 'Mễ Phạn', meaning: 'cơm' },
    { hanzi: '鸡肉', pinyin: 'jīròu', hanviet: 'Kê Nhục', meaning: 'thịt gà' },
    { hanzi: '水', pinyin: 'shuǐ', hanviet: 'Thủy', meaning: 'nước' },
    { hanzi: '面包', pinyin: 'miànbāo', hanviet: 'Miến Bao', meaning: 'bánh mì' },
    { hanzi: '苹果', pinyin: 'píngguǒ', hanviet: 'Tần Quả', meaning: 'quả táo' },
    { hanzi: '茶', pinyin: 'chá', hanviet: 'Trà', meaning: 'trà' },
    { hanzi: '咖啡', pinyin: 'kāfēi', hanviet: 'Cà Phê', meaning: 'cà phê' },
    { hanzi: '饺子', pinyin: 'jiǎozi', hanviet: 'Giảo Tử', meaning: 'bánh há cảo / sủi cảo' },
    { hanzi: '菜单', pinyin: 'càidān', hanviet: 'Thái Đơn', meaning: 'thực đơn / menu' },
    { hanzi: '买单', pinyin: 'mǎidān', hanviet: 'Mãi Đơn', meaning: 'tính tiền / thanh toán' },
    { hanzi: '服务员', pinyin: 'fúwùyuán', hanviet: 'Phục Vụ Viên', meaning: 'nhân viên phục vụ' }
  ];

  let selectedTopicId = 'restaurant';
  let gameWordsPool = getWordsForTopic(selectedTopicId, allTopics, restaurantWords);

  // Game state
  let maxQuestions = 20;
  let questions = generateQuestions(gameWordsPool, maxQuestions);
  let currentIndex = 0;
  let score = 30; // Matches reference image starting state
  let lives = 3;  // 3 hearts max
  let timerMax = 15;
  let timerCurrent = timerMax;
  let timerInterval = null;
  let isAnswered = false;
  let selectedOptionIndex = -1;
  let hintUsed = false;
  let hintText = '';
  let userAnswersHistory = new Array(maxQuestions).fill(null);

  // Stats
  const realStats = getRealTimeStats();
  const streakDays = realStats.streak || 7;

  function getWordsForTopic(topicId, topics, fallbackWords) {
    if (topicId === 'restaurant') {
      return fallbackWords;
    }
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.words && topic.words.length >= 4) {
      return topic.words;
    }
    // Aggregate all words across topics
    let aggregated = [];
    topics.forEach(t => {
      if (t.words) aggregated = aggregated.concat(t.words);
    });
    if (aggregated.length < 4) aggregated = aggregated.concat(fallbackWords);
    return aggregated;
  }

  function generateQuestions(pool, count) {
    const qList = [];
    const poolSize = pool.length;
    for (let i = 0; i < count; i++) {
      const targetWord = pool[i % poolSize];
      const distractors = [];
      
      // Select 3 random distractors
      const otherWords = pool.filter(w => w.hanzi !== targetWord.hanzi && w.meaning !== targetWord.meaning);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      
      const optionTexts = [targetWord.meaning];
      shuffledOthers.forEach(w => {
        if (optionTexts.length < 4 && !optionTexts.includes(w.meaning)) {
          optionTexts.push(w.meaning);
        }
      });

      // Fill in generic distractors if needed
      const genericDistractors = ['thịt gà', 'cơm', 'nước', 'bánh mì', 'trà sữa', 'cà phê', 'hoa quả', 'canh', 'bánh ngọt'];
      genericDistractors.forEach(gd => {
        if (optionTexts.length < 4 && !optionTexts.includes(gd)) {
          optionTexts.push(gd);
        }
      });

      // Shuffle options A, B, C, D
      const shuffledOptions = [...optionTexts].sort(() => 0.5 - Math.random());
      const correctIdx = shuffledOptions.indexOf(targetWord.meaning);

      qList.push({
        id: i + 1,
        word: targetWord,
        options: shuffledOptions,
        correctIndex: correctIdx,
        imageUrl: ''
      });
    }
    return qList;
  }

  function startTimer() {
    stopTimer();
    timerCurrent = timerMax;
    updateTimerUI();
    timerInterval = setInterval(() => {
      timerCurrent--;
      updateTimerUI();
      if (timerCurrent <= 0) {
        stopTimer();
        handleTimeOut();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerUI() {
    const timerTextEl = document.getElementById('game-timer-text');
    const timerBarEl = document.getElementById('game-timer-bar');
    if (timerTextEl) timerTextEl.innerText = `${timerCurrent}s`;
    if (timerBarEl) {
      const pct = Math.max(0, Math.min(100, (timerCurrent / timerMax) * 100));
      timerBarEl.style.width = `${pct}%`;
    }
  }

  function handleTimeOut() {
    if (isAnswered) return;
    isAnswered = true;
    selectedOptionIndex = -1;
    lives = Math.max(0, lives - 1);
    userAnswersHistory[currentIndex] = { answered: true, isCorrect: false, selectedIdx: -1 };
    renderGameCard();
    renderRightWidgets();
    checkGameOver();
  }

  function checkGameOver() {
    if (lives <= 0) {
      stopTimer();
      showGameOverModal();
    }
  }

  function selectOption(idx) {
    if (isAnswered) return;
    stopTimer();
    isAnswered = true;
    selectedOptionIndex = idx;
    
    const currentQ = questions[currentIndex];
    const isCorrect = (idx === currentQ.correctIndex);

    if (isCorrect) {
      score += 10;
      updateWordSRS(currentQ.word.hanzi, 5);
      if (window.speakZh) window.speakZh(currentQ.word.hanzi);
    } else {
      lives = Math.max(0, lives - 1);
      updateWordSRS(currentQ.word.hanzi, 1);
    }

    userAnswersHistory[currentIndex] = { answered: true, isCorrect, selectedIdx: idx };

    renderGameCard();
    renderRightWidgets();
    checkGameOver();
  }

  function showHint() {
    if (hintUsed || isAnswered) return;
    if (score < 2) {
      alert('Bạn cần ít nhất 2 điểm để dùng gợi ý!');
      return;
    }
    score -= 2;
    hintUsed = true;
    const currentQ = questions[currentIndex];
    hintText = `Gợi ý: Chữ cái đầu của đáp án là "${currentQ.word.meaning.charAt(0).toUpperCase()}"`;
    renderGameCard();
    renderRightWidgets();
  }

  function nextQuestion() {
    if (currentIndex < maxQuestions - 1) {
      currentIndex++;
      loadCurrentQuestion();
    } else {
      stopTimer();
      showVictoryModal();
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      loadCurrentQuestion();
    }
  }

  function shuffleCurrentQuestion() {
    const pool = gameWordsPool;
    const randWord = pool[Math.floor(Math.random() * pool.length)];
    const distractors = pool.filter(w => w.hanzi !== randWord.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.meaning);
    const optionTexts = [randWord.meaning, ...distractors];
    while (optionTexts.length < 4) optionTexts.push('khác');
    const shuffled = optionTexts.sort(() => 0.5 - Math.random());
    
    questions[currentIndex] = {
      id: currentIndex + 1,
      word: randWord,
      options: shuffled,
      correctIndex: shuffled.indexOf(randWord.meaning),
      imageUrl: ''
    };
    loadCurrentQuestion();
  }

  function loadCurrentQuestion() {
    const existing = userAnswersHistory[currentIndex];
    if (existing) {
      isAnswered = existing.answered;
      selectedOptionIndex = existing.selectedIdx;
      stopTimer();
    } else {
      isAnswered = false;
      selectedOptionIndex = -1;
      hintUsed = false;
      hintText = '';
      startTimer();
    }
    renderGameCard();
    renderRightWidgets();
  }

  function renderGameCard() {
    const cardContainer = document.getElementById('vocab-game-card-root');
    if (!cardContainer) return;

    const q = questions[currentIndex];
    const pctProgress = Math.round(((currentIndex + 1) / maxQuestions) * 100);

    const letters = ['A', 'B', 'C', 'D'];

    let optionsHtml = q.options.map((optText, idx) => {
      let btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white text-slate-800 border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 shadow-xs';
      let badgeClass = 'game-option-letter w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-sm transition';
      let iconRight = '';

      if (isAnswered) {
        if (idx === q.correctIndex) {
          btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm';
          badgeClass = 'game-option-letter w-9 h-9 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-xs';
          iconRight = `<span class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">✓</span>`;
        } else if (idx === selectedOptionIndex) {
          btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-sm';
          badgeClass = 'game-option-letter w-9 h-9 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-sm shadow-xs';
          iconRight = `<span class="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">✕</span>`;
        } else {
          btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-slate-50/70 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed';
        }
      }

      return `
        <button class="${btnClass}" data-index="${idx}" ${isAnswered ? 'disabled' : ''}>
          <div class="flex items-center gap-3.5">
            <span class="${badgeClass}">${letters[idx]}</span>
            <span class="font-extrabold text-base tracking-tight">${escapeHtml(optText)}</span>
          </div>
          ${iconRight}
        </button>
      `;
    }).join('');

    let resultBannerHtml = '';
    if (isAnswered) {
      if (selectedOptionIndex === q.correctIndex) {
        resultBannerHtml = `
          <div class="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between animate-fade-in shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                ✓
              </div>
              <div>
                <h4 class="font-black text-base text-emerald-900 leading-tight">Chính xác!</h4>
                <p class="text-xs text-emerald-800 mt-0.5"><span class="font-bold hanzi-font">${q.word.hanzi}</span> (${q.word.pinyin}) nghĩa là <strong class="text-emerald-950 underline decoration-emerald-400 decoration-2">${q.word.meaning}</strong>.</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-extrabold text-xs shadow-2xs whitespace-nowrap">+10 điểm</span>
          </div>
        `;
      } else {
        resultBannerHtml = `
          <div class="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between animate-fade-in shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                ✕
              </div>
              <div>
                <h4 class="font-black text-base text-rose-900 leading-tight">Chưa chính xác!</h4>
                <p class="text-xs text-rose-800 mt-0.5"><span class="font-bold hanzi-font">${q.word.hanzi}</span> (${q.word.pinyin}) đúng nghĩa là <strong class="text-rose-950 underline decoration-rose-400 decoration-2">${q.word.meaning}</strong>.</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-rose-200/80 text-rose-900 font-extrabold text-xs shadow-2xs whitespace-nowrap">-1 mạng</span>
          </div>
        `;
      }
    }

    cardContainer.innerHTML = `
      <!-- Question Progress Header -->
      <div class="flex items-center justify-between mb-4 gap-4">
        <div class="flex items-center gap-3 flex-1">
          <span class="font-black text-sm text-rose-600 whitespace-nowrap">Câu ${currentIndex + 1} / ${maxQuestions}</span>
          <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shadow-inner">
            <div class="bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 h-3 rounded-full transition-all duration-300" style="width: ${pctProgress}%"></div>
          </div>
          <span class="font-extrabold text-xs text-slate-400 min-w-[32px]">${pctProgress}%</span>
        </div>
        <button id="btn-game-settings" class="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition" title="Cài đặt trò chơi">
          ⚙️
        </button>
      </div>

      <!-- Hint Banner -->
      <div class="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-center gap-2 text-xs text-amber-900 font-extrabold shadow-2xs">
        <span>💡</span>
        <span>${hintText || 'Chọn đáp án đúng cho nghĩa của từ dưới đây!'}</span>
      </div>

      <!-- Main Game Card Content Split -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <!-- Left: Word Display & Audio & Photo -->
        <div class="md:col-span-6 flex flex-col items-center justify-center text-center space-y-3">
          <button class="btn-play-word-audio w-14 h-14 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center text-2xl transition shadow-sm border border-rose-200 active:scale-95 cursor-pointer" title="Nghe phát âm">
            🔊
          </button>

          <div>
            <h2 class="hanzi-font text-5xl md:text-6xl font-black text-red-600 tracking-tight drop-shadow-xs">${escapeHtml(q.word.hanzi)}</h2>
            <div class="flex items-center justify-center gap-1.5 mt-1">
              <span class="pinyin-font text-lg font-bold text-slate-600">${escapeHtml(q.word.pinyin)}</span>
              <button class="btn-play-word-audio text-rose-500 hover:text-rose-700 text-base" title="Phát âm">🔊</button>
            </div>
          </div>

          <div class="w-full max-w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md border-2 border-slate-200/80">
            ${getWordCardIllustration(q.word)}
          </div>
        </div>

        <!-- Right: Multiple Choice Options A, B, C, D -->
        <div class="md:col-span-6 space-y-3">
          ${optionsHtml}
        </div>
      </div>

      <!-- Answer Result Banner -->
      ${resultBannerHtml}

      <!-- Bottom Navigation Action Bar -->
      <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
        <button id="btn-game-prev" class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 shadow-2xs ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
          🔄 Câu trước
        </button>

        <button id="btn-game-next" class="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95">
          <span>${currentIndex === maxQuestions - 1 ? 'Hoàn thành lượt chơi 🎉' : 'Câu tiếp theo ➔'}</span>
        </button>

        <button id="btn-game-shuffle" class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 shadow-2xs" title="Đổi câu hỏi khác">
          🔀 Đổi câu hỏi
        </button>
      </div>
    `;

    // Attach card event handlers
    cardContainer.querySelectorAll('.btn-play-word-audio').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.speakZh) window.speakZh(q.word.hanzi);
      });
    });

    cardContainer.querySelectorAll('.game-option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        selectOption(idx);
      });
    });

    const prevBtn = document.getElementById('btn-game-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevQuestion);

    const nextBtn = document.getElementById('btn-game-next');
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);

    const shuffleBtn = document.getElementById('btn-game-shuffle');
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCurrentQuestion);
  }

  function renderRightWidgets() {
    const widgetsContainer = document.getElementById('vocab-game-widgets-root');
    if (!widgetsContainer) return;

    // Hearts visualization
    let heartsHtml = '';
    for (let i = 0; i < 3; i++) {
      if (i < lives) {
        heartsHtml += `<span class="text-rose-500 text-xl animate-pulse">❤️</span>`;
      } else {
        heartsHtml += `<span class="text-slate-300 text-xl">🖤</span>`;
      }
    }

    // Days of week streak visualization
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const daysHtml = days.map((d, idx) => {
      const isDone = idx < 6; // Active streak simulation
      return `
        <div class="flex flex-col items-center gap-1">
          <div class="w-6 h-6 rounded-full ${isDone ? 'bg-rose-500 text-white font-extrabold' : 'bg-slate-100 text-slate-400 font-medium'} flex items-center justify-center text-2xs shadow-2xs">
            ${isDone ? '✓' : ''}
          </div>
          <span class="text-3xs text-slate-400 font-bold">${d}</span>
        </div>
      `;
    }).join('');

    widgetsContainer.innerHTML = `
      <!-- Card 1: Score Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner border border-amber-200">
            🏆
          </div>
          <div>
            <span class="text-xs font-bold text-slate-500 block">Điểm hiện tại</span>
            <span class="text-3xl font-black text-rose-600 tracking-tight" id="game-score-text">${score}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Lives Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <span>❤️</span> Mạng sống
          </span>
          <div class="flex items-center gap-1.5">
            ${heartsHtml}
          </div>
        </div>
      </div>

      <!-- Card 3: Answer Timer Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <span>⏱️</span> Thời gian trả lời
          </span>
          <span class="text-xl font-black text-slate-800" id="game-timer-text">${timerCurrent}s</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div id="game-timer-bar" class="bg-gradient-to-r from-red-500 to-rose-600 h-2.5 rounded-full transition-all duration-300" style="width: 100%"></div>
        </div>
      </div>

      <!-- Card 4: Hint Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
            <span>💡</span> Gợi ý
          </span>
          <span class="text-slate-300 text-xs font-bold hover:text-slate-500 cursor-pointer">✕</span>
        </div>
        <p class="text-2xs text-slate-500 leading-snug">Xem gợi ý về hình ảnh hoặc chữ cái đầu tiên của từ.</p>
        <button id="btn-use-hint" class="w-full py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-extrabold text-xs transition shadow-2xs active:scale-98 ${hintUsed ? 'opacity-50 cursor-not-allowed' : ''}">
          ${hintUsed ? 'Đã dùng gợi ý' : 'Dùng gợi ý (-2 điểm)'}
        </button>
      </div>

      <!-- Card 5: Win Streak Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔥</span>
            <div>
              <span class="text-2xs font-bold text-slate-400 block uppercase tracking-wider">Chuỗi thắng</span>
              <span class="text-sm font-black text-slate-900">${streakDays} ngày</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pt-1">
          ${daysHtml}
        </div>
      </div>
    `;

    const hintBtn = document.getElementById('btn-use-hint');
    if (hintBtn) hintBtn.addEventListener('click', showHint);
  }

  function showGameOverModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-rose-200">
        <div class="w-20 h-20 rounded-full bg-rose-100 text-rose-600 text-4xl font-black flex items-center justify-center mx-auto shadow-inner border border-rose-200">
          💔
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900">Hết Mạng Sống!</h3>
          <p class="text-xs text-slate-500 mt-1">Đừng nản lòng! Bạn đã đạt được <strong class="text-rose-600 font-extrabold text-sm">${score} điểm</strong> trong lượt chơi này.</p>
        </div>
        <div class="pt-2 flex gap-3">
          <button id="btn-restart-game" class="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md transition">
            🔄 Thử lại ngay
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-restart-game')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      score = 30;
      lives = 3;
      currentIndex = 0;
      userAnswersHistory = new Array(maxQuestions).fill(null);
      questions = generateQuestions(gameWordsPool, maxQuestions);
      loadCurrentQuestion();
    });
  }

  function showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-amber-200">
        <div class="w-20 h-20 rounded-full bg-amber-100 text-amber-500 text-4xl font-black flex items-center justify-center mx-auto shadow-inner border border-amber-200">
          🏆
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900">Xuất Sắc! Hoàn Thành Lượt Chơi!</h3>
          <p class="text-xs text-slate-500 mt-1">Tổng điểm tích lũy: <strong class="text-amber-600 font-extrabold text-base">${score} điểm</strong> ⭐⭐⭐</p>
        </div>
        <div class="pt-2 flex gap-3">
          <button id="btn-new-round" class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm shadow-md transition">
            🎉 Lượt chơi mới
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-new-round')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      score = 30;
      lives = 3;
      currentIndex = 0;
      userAnswersHistory = new Array(maxQuestions).fill(null);
      questions = generateQuestions(gameWordsPool, maxQuestions);
      loadCurrentQuestion();
    });
  }

  // Render Full View Frame
  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <!-- Sub-Header Bar (Back button, Topic selector, Stats summary) -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center gap-3">
          <button id="btn-game-back" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 font-extrabold text-xs text-slate-700 transition flex items-center gap-1.5">
            ❮ Quay lại
          </button>
          
          <div class="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
            <span class="text-2xs font-extrabold text-slate-500 uppercase tracking-wider">Chủ đề hiện tại:</span>
            <select id="select-game-topic" class="bg-transparent font-black text-xs text-slate-800 focus:outline-none cursor-pointer">
              <option value="restaurant">🍱 Nhà hàng & Đồ ăn</option>
              ${allTopics.map(t => `<option value="${t.id}">📚 ${escapeHtml(t.name)}</option>`).join('')}
              <option value="all">⚡ Tất cả từ vựng (Tổng hợp)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs flex items-center gap-1.5">
            <span>🔥</span> ${streakDays} ngày
          </div>
          <button class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition" title="Thông báo">
            🔔
          </button>
        </div>
      </div>

      <!-- Main Game Arena Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left 8/12: Central Question & Options Card -->
        <div class="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm" id="vocab-game-card-root">
          <!-- Rendered dynamically by renderGameCard() -->
        </div>

        <!-- Right 4/12: Game Status Widgets & Power-ups -->
        <div class="lg:col-span-4 space-y-4" id="vocab-game-widgets-root">
          <!-- Rendered dynamically by renderRightWidgets() -->
        </div>
      </div>
    </div>
  `;

  // Attach Top Bar Handlers
  const backBtn = container.querySelector('#btn-game-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      stopTimer();
      if (typeof backHandler === 'function') {
        backHandler();
      } else if (window.appInstance) {
        window.appInstance.switchTab('dashboard');
      }
    });
  }

  const topicSelect = container.querySelector('#select-game-topic');
  if (topicSelect) {
    topicSelect.addEventListener('change', (e) => {
      selectedTopicId = e.target.value;
      gameWordsPool = getWordsForTopic(selectedTopicId, allTopics, restaurantWords);
      questions = generateQuestions(gameWordsPool, maxQuestions);
      currentIndex = 0;
      userAnswersHistory = new Array(maxQuestions).fill(null);
      loadCurrentQuestion();
    });
  }

  // Initial render launch
  loadCurrentQuestion();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
