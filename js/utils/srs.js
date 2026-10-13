// Thuật toán Spaced Repetition System (SuperMemo SM-2) & Lưu trữ LocalStorage (Hanzo)

import { getScopedStorageKey, getActiveUser } from './accountManager.js';

function getKey(baseKey) {
  return getScopedStorageKey(baseKey);
}

/**
 * Thuật toán SM-2 tính toán khoảng thời gian ôn tập tiếp theo
 * @param {number} quality - Điểm chất lượng trả lời (0: Quên hoàn toàn, 3: Nhớ hơi khó, 4: Nhớ tốt, 5: Rất dễ)
 * @param {number} repetitions - Số lần đã ôn đúng liên tiếp
 * @param {number} previousInterval - Khoảng thời gian ôn trước đó (ngày)
 * @param {number} previousEaseFactor - Hệ số dễ nhớ trước đó (Mặc định 2.5)
 */
export function calculateSM2(quality, repetitions = 0, previousInterval = 1, previousEaseFactor = 2.5) {
  let nextRepetitions = repetitions;
  let nextInterval = previousInterval;
  let nextEaseFactor = previousEaseFactor;

  // Tính Ease Factor mới
  nextEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  if (quality >= 3) {
    // Trả lời đúng
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(previousInterval * nextEaseFactor);
    }
    nextRepetitions += 1;
  } else {
    // Trả lời sai/Quên -> reset chuỗi
    nextRepetitions = 0;
    nextInterval = 1;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + nextInterval);

  return {
    repetitions: nextRepetitions,
    interval: nextInterval,
    easeFactor: parseFloat(nextEaseFactor.toFixed(2)),
    dueDate: nextDueDate.toISOString()
  };
}

import { normalizePinyin, lookupPinyinForHanzi, lookupHanVietForHanzi } from './pinyinUtils.js';
import { initialTopicsData } from '../data/hskTopicsData.js';
import { dictionaryData } from '../data/dictionaryData.js';

export function getCustomDictionaryEdits() {
  try {
    const key = getKey('hanzo_custom_dict_edits');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomDictionaryEdits(edits) {
  try {
    const key = getKey('hanzo_custom_dict_edits');
    localStorage.setItem(key, JSON.stringify(edits));
  } catch (e) {
    console.error('Lỗi khi lưu chỉnh sửa từ điển:', e);
  }
}

export function getCustomDictionaryWords() {
  try {
    const key = getKey('hanzo_custom_dict_words');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomDictionaryWords(customWords) {
  try {
    const key = getKey('hanzo_custom_dict_words');
    localStorage.setItem(key, JSON.stringify(customWords));
  } catch (e) {
    console.error('Lỗi khi lưu từ mới vào từ điển:', e);
  }
}

export function syncTopicWordsToDictionary(targetTopics = null) {
  try {
    const allTopics = targetTopics || getAllTopicsList();
    const edits = getCustomDictionaryEdits();
    const customWordsMap = getCustomDictionaryWords();

    let addedCount = 0;
    let updatedCount = 0;
    let totalSynced = 0;

    const baseHanziMap = new Map();
    dictionaryData.forEach(w => baseHanziMap.set(w.hanzi, w));

    allTopics.forEach(topic => {
      if (!topic || !Array.isArray(topic.words)) return;

      let defaultHsk = 1;
      const topicIdLower = (topic.id || '').toLowerCase();
      const topicNameLower = (topic.name || '').toLowerCase();

      if (topicIdLower.includes('hsk2') || topicNameLower.includes('hsk 2') || topicNameLower.includes('hsk2')) defaultHsk = 2;
      else if (topicIdLower.includes('hsk3') || topicNameLower.includes('hsk 3') || topicNameLower.includes('hsk3')) defaultHsk = 3;
      else if (topicIdLower.includes('hsk4') || topicNameLower.includes('hsk 4') || topicNameLower.includes('hsk4')) defaultHsk = 4;
      else if (topicIdLower.includes('hsk5') || topicNameLower.includes('hsk 5') || topicNameLower.includes('hsk5')) defaultHsk = 5;
      else if (topicIdLower.includes('hsk6') || topicNameLower.includes('hsk 6') || topicNameLower.includes('hsk6')) defaultHsk = 6;

      topic.words.forEach(w => {
        if (!w || !w.hanzi || !w.hanzi.trim()) return;
        const hanzi = w.hanzi.trim();
        totalSynced++;

        let pinyin = normalizePinyin(w.pinyin || '');
        if ((!pinyin || pinyin === hanzi) && hanzi) {
          pinyin = lookupPinyinForHanzi(hanzi);
        }
        let hanviet = w.hanviet || lookupHanVietForHanzi(hanzi) || '';
        const meaning = w.meaning || hanzi;
        const pinyinNoTone = (pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        const hskLevel = w.hskLevel || defaultHsk;

        if (baseHanziMap.has(hanzi)) {
          const baseWord = baseHanziMap.get(hanzi);
          const currentEdits = edits[baseWord.id] || {};
          const newEdits = { ...currentEdits };
          let changed = false;

          if (pinyin && pinyin !== baseWord.pinyin && !currentEdits.pinyin) { newEdits.pinyin = pinyin; changed = true; }
          if (hanviet && hanviet !== baseWord.hanviet && !currentEdits.hanviet) { newEdits.hanviet = hanviet; changed = true; }
          if (meaning && meaning !== baseWord.meaning && !currentEdits.meaning) { newEdits.meaning = meaning; changed = true; }

          if (changed) {
            edits[baseWord.id] = newEdits;
            updatedCount++;
          }
        } else {
          const dictId = `dict_custom_${encodeURIComponent(hanzi)}`;
          if (!customWordsMap[dictId]) {
            customWordsMap[dictId] = {
              id: dictId,
              hanzi: hanzi,
              pinyin: pinyin || hanzi,
              pinyinNoTone: pinyinNoTone,
              hanviet: hanviet,
              meaning: meaning,
              hskLevel: hskLevel,
              radical: 'Bộ thủ từ Chủ đề',
              strokeCount: hanzi.length * 5,
              type: topic.category || 'Từ vựng Chủ đề',
              tags: [topic.name, topic.category || 'Chủ đề', `HSK${hskLevel}`],
              usageContext: `Từ vựng được tự động cập nhật từ bộ chủ đề "${topic.name}".`,
              sourceTopicId: topic.id,
              sourceTopicName: topic.name,
              isSyncedFromTopic: true
            };
            addedCount++;
          } else {
            const existing = customWordsMap[dictId];
            let changed = false;
            if (pinyin && pinyin !== existing.pinyin) { existing.pinyin = pinyin; changed = true; }
            if (hanviet && hanviet !== existing.hanviet) { existing.hanviet = hanviet; changed = true; }
            if (meaning && meaning !== existing.meaning) { existing.meaning = meaning; changed = true; }
            if (changed) {
              existing.pinyinNoTone = pinyinNoTone;
              customWordsMap[dictId] = existing;
              updatedCount++;
            }
          }
        }
      });
    });

    saveCustomDictionaryEdits(edits);
    saveCustomDictionaryWords(customWordsMap);

    return { addedCount, updatedCount, totalSynced };
  } catch (e) {
    console.error('Lỗi khi tự động cập nhật từ vựng vào từ điển HSK:', e);
    return { addedCount: 0, updatedCount: 0, totalSynced: 0 };
  }
}

export function getEffectiveDictionaryData() {
  const edits = getCustomDictionaryEdits();
  const customWordsMap = getCustomDictionaryWords();

  const baseList = dictionaryData.map(word => {
    if (edits[word.id]) {
      return { ...word, ...edits[word.id] };
    }
    return word;
  });

  const existingHanziSet = new Set(baseList.map(w => w.hanzi));
  const customList = [];

  Object.values(customWordsMap).forEach(cWord => {
    if (cWord && cWord.hanzi) {
      let wordObj = cWord;
      if (edits[cWord.id]) {
        wordObj = { ...cWord, ...edits[cWord.id] };
      }
      if (!existingHanziSet.has(wordObj.hanzi)) {
        existingHanziSet.add(wordObj.hanzi);
        customList.push(wordObj);
      }
    }
  });

  const allTopics = getAllTopicsList();
  allTopics.forEach(topic => {
    if (!topic.words || !Array.isArray(topic.words)) return;
    let topicHsk = 1;
    if (topic.id.includes('hsk2') || topic.name.includes('HSK 2')) topicHsk = 2;
    else if (topic.id.includes('hsk3') || topic.name.includes('HSK 3')) topicHsk = 3;
    else if (topic.id.includes('hsk4') || topic.name.includes('HSK 4')) topicHsk = 4;
    else if (topic.id.includes('hsk5') || topic.name.includes('HSK 5')) topicHsk = 5;

    topic.words.forEach(w => {
      if (w && w.hanzi && !existingHanziSet.has(w.hanzi)) {
        existingHanziSet.add(w.hanzi);
        const pinyin = w.pinyin || lookupPinyinForHanzi(w.hanzi) || w.hanzi;
        const hanviet = w.hanviet || lookupHanVietForHanzi(w.hanzi) || '';
        const meaning = w.meaning || w.hanzi;
        const dictId = `dict_custom_${encodeURIComponent(w.hanzi)}`;

        customList.push({
          id: dictId,
          hanzi: w.hanzi,
          pinyin: pinyin,
          pinyinNoTone: (pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
          hanviet: hanviet,
          meaning: meaning,
          hskLevel: w.hskLevel || topicHsk,
          radical: 'Bộ thủ từ Chủ đề',
          strokeCount: w.hanzi.length * 5,
          type: topic.category || 'Từ vựng Chủ đề',
          tags: [topic.name, topic.category || 'Chủ đề', `HSK${w.hskLevel || topicHsk}`],
          usageContext: `Từ vựng được tự động cập nhật từ bộ chủ đề "${topic.name}".`,
          sourceTopicId: topic.id,
          sourceTopicName: topic.name,
          isSyncedFromTopic: true
        });
      }
    });
  });

  return [...baseList, ...customList];
}


// Lưu trữ & Quản lý LocalStorage (Scoped cho từng tài khoản)
export function getSavedCustomTopics() {
  try {
    const key = getKey('hanzo_custom_topics');
    const data = localStorage.getItem(key);
    let topics = [];
    if (data) {
      topics = JSON.parse(data);
    } else {
      const activeUser = getActiveUser();
      if (activeUser.id === 'usr_minhanh') {
        const fallback = localStorage.getItem('hanzo_custom_topics') || localStorage.getItem('dcthanyu_custom_topics');
        if (fallback) topics = JSON.parse(fallback);
      }
    }
    topics.forEach(t => {
      if (t && Array.isArray(t.words)) {
        t.words.forEach(w => {
          if (w) {
            let clean = normalizePinyin(w.pinyin || '');
            if ((!clean || clean === w.hanzi) && w.hanzi) {
              clean = lookupPinyinForHanzi(w.hanzi);
            }
            if (clean) w.pinyin = clean;
            if (!w.hanviet && w.hanzi) {
              w.hanviet = lookupHanVietForHanzi(w.hanzi);
            }
          }
        });
      }
    });
    return topics;
  } catch (e) {
    console.error('Lỗi khi đọc Custom Topics từ LocalStorage:', e);
    return [];
  }
}

export function getDeletedPresetIds() {
  try {
    const data = localStorage.getItem(getKey('hanzo_deleted_preset_ids'));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function markPresetDeleted(presetId) {
  const deleted = new Set(getDeletedPresetIds());
  deleted.add(presetId);
  localStorage.setItem(getKey('hanzo_deleted_preset_ids'), JSON.stringify(Array.from(deleted)));
  deleteCustomTopic(presetId);
}

export function resetPresetTopic(presetId) {
  const deleted = new Set(getDeletedPresetIds());
  deleted.delete(presetId);
  localStorage.setItem(getKey('hanzo_deleted_preset_ids'), JSON.stringify(Array.from(deleted)));
  deleteCustomTopic(presetId);
}

export function getAllTopicsList() {
  const savedTopics = getSavedCustomTopics();
  const savedMap = new Map(savedTopics.map(t => [t.id, t]));
  const deletedPresetIds = new Set(getDeletedPresetIds());

  const result = [];

  initialTopicsData.forEach(preset => {
    if (deletedPresetIds.has(preset.id)) {
      return;
    }
    if (savedMap.has(preset.id)) {
      const edited = savedMap.get(preset.id);
      result.push({ ...preset, ...edited, isEdited: true });
      savedMap.delete(preset.id);
    } else {
      result.push({ ...preset });
    }
  });

  savedMap.forEach(customTopic => {
    result.push(customTopic);
  });

  return result;
}

export function saveCustomTopic(topic) {
  const topics = getSavedCustomTopics();
  const existingIdx = topics.findIndex(t => t.id === topic.id);
  if (existingIdx >= 0) {
    topics[existingIdx] = topic;
  } else {
    topics.push(topic);
  }
  localStorage.setItem(getKey('hanzo_custom_topics'), JSON.stringify(topics));
  return topics;
}

export function deleteCustomTopic(topicId) {
  const topics = getSavedCustomTopics().filter(t => t.id !== topicId);
  localStorage.setItem(getKey('hanzo_custom_topics'), JSON.stringify(topics));
  return topics;
}

export function getSRSProgress() {
  try {
    const key = getKey('hanzo_srs_progress');
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    const activeUser = getActiveUser();
    if (activeUser.id === 'usr_minhanh') {
      const fallback = localStorage.getItem('hanzo_srs_progress') || localStorage.getItem('dcthanyu_srs_progress');
      return fallback ? JSON.parse(fallback) : {};
    }
    return {};
  } catch (e) {
    return {};
  }
}

export function getRealTimeWeekDays() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distToMonday);

  const daysInfo = [
    { day: 'Thứ 2', defaultTime: '08:00 - 08:30' },
    { day: 'Thứ 3', defaultTime: '19:00 - 19:50' },
    { day: 'Thứ 4', defaultTime: '19:30 - 20:15' },
    { day: 'Thứ 5', defaultTime: '08:00 - 08:45' },
    { day: 'Thứ 6', defaultTime: '19:00 - 19:40' },
    { day: 'Thứ 7', defaultTime: '09:00 - 09:45' },
    { day: 'Chủ Nhật', defaultTime: '10:00 - 10:30' }
  ];

  return daysInfo.map((item, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dayStr = d.getDate().toString().padStart(2, '0');
    const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
    const yearStr = d.getFullYear();
    return {
      day: item.day,
      date: `${dayStr}/${monthStr}/${yearStr}`,
      defaultTime: item.defaultTime
    };
  });
}

export function getDefaultScheduleItems(allTopics = []) {
  if (!allTopics || allTopics.length === 0) {
    allTopics = getAllTopicsList();
  }

  const colors = ['#22C55E', '#F97316', '#3B82F6', '#EC4899', '#22C55E'];
  const statuses = ['in_progress', 'not_started', 'completed', 'not_started', 'completed'];
  const realWeekDays = getRealTimeWeekDays();

  return allTopics.slice(0, 5).map((t, idx) => {
    const dayInfo = realWeekDays[idx % realWeekDays.length];
    const status = statuses[idx % 5];
    const firstWord = (t.words && t.words.length > 0) ? t.words[0] : { hanzi: '学习', pinyin: 'xuéxí' };

    return {
      id: `sch_${t.id}`,
      accentColor: colors[idx % 5],
      day: dayInfo.day,
      date: dayInfo.date,
      time: dayInfo.defaultTime,
      topicId: t.id,
      topicName: t.name,
      hanzi: firstWord.hanzi,
      pinyin: firstWord.pinyin,
      vocabCount: (t.words || []).length,
      skills: ['quiz', 'speak', 'read', 'write'],
      targetReps: status === 'completed' ? 3 : (status === 'in_progress' ? 3 : 5),
      currentReps: status === 'completed' ? 3 : (status === 'in_progress' ? 2 : 0),
      status: status
    };
  });
}

export function getStoredScheduleItems(allTopics = []) {
  try {
    const activeUser = typeof getActiveUser === 'function' ? getActiveUser() : { id: 'usr_minhanh' };
    const schKey = getKey('hanzo_custom_schedule_list');
    const data = localStorage.getItem(schKey);
    const stored = data ? JSON.parse(data) : [];
    if (!stored || stored.length === 0) {
      if (activeUser.id === 'usr_minhanh') {
        return getDefaultScheduleItems(allTopics);
      }
      return [];
    }

    const realWeekDays = getRealTimeWeekDays();
    stored.forEach((item, idx) => {
      const dateToCheck = item.startDate || item.date;
      if (dateToCheck && dateToCheck.includes('/')) {
        const parts = dateToCheck.split('/').map(s => s.trim());
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
          item.day = dayNames[d.getDay()];
        }
      }
    });

    return stored;
  } catch (e) {
    return [];
  }
}

export function isScheduleOverdue(item) {
  if (!item || item.status === 'completed') return false;
  if (item.status === 'overdue') return true;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDateStr = item.endDate || item.date;
    if (checkDateStr && checkDateStr.includes('-') && checkDateStr.includes('/')) {
      const parts = checkDateStr.split('-').map(s => s.trim());
      if (parts.length === 2 && parts[1].includes('/')) {
        checkDateStr = parts[1];
      }
    }

    if (checkDateStr && checkDateStr.includes('/')) {
      const p = checkDateStr.split('/');
      if (p.length === 3) {
        const itemDate = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        return today > itemDate;
      }
    }
  } catch (e) {}

  return false;
}

export function recordTopicPracticeProgress(target) {
  try {
    if (!target) return;
    const targetIdStr = typeof target === 'object' ? String(target.id || target.name || '') : String(target);
    const targetNameStr = typeof target === 'object' ? String(target.name || target.id || '') : String(target);

    const targetIdLower = targetIdStr.trim().toLowerCase();
    const targetNameLower = targetNameStr.trim().toLowerCase();

    const schKey = getKey('hanzo_custom_schedule_list');
    const raw = localStorage.getItem(schKey);
    let scheduleItems = [];
    if (raw) {
      try { scheduleItems = JSON.parse(raw); } catch (e) { scheduleItems = []; }
    }
    
    if (!scheduleItems || scheduleItems.length === 0) {
      scheduleItems = getStoredScheduleItems();
    }

    if (!scheduleItems || scheduleItems.length === 0) return;

    let updated = false;

    const now = new Date();
    const dStr = now.getDate().toString().padStart(2, '0');
    const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const yStr = now.getFullYear();
    const todayFormatted = `${dStr}/${mStr}/${yStr}`;

    scheduleItems.forEach(item => {
      const itemTopicId = String(item.topicId || '').trim().toLowerCase();
      const itemTopicName = String(item.topicName || '').trim().toLowerCase();

      const isMatch = (
        itemTopicId === targetIdLower ||
        itemTopicName === targetNameLower ||
        (targetIdLower && itemTopicId && itemTopicId.includes(targetIdLower)) ||
        (targetNameLower && itemTopicName && itemTopicName.includes(targetNameLower)) ||
        (targetIdLower && itemTopicName && itemTopicName.includes(targetIdLower)) ||
        (targetNameLower && itemTopicId && itemTopicId.includes(targetNameLower))
      );

      if (isMatch) {
        const wasOverdue = isScheduleOverdue(item) || item.status === 'overdue' || item.wasOverdue;

        item.currentReps = (item.currentReps || 0) + 1;
        if (item.currentReps >= item.targetReps) {
          item.currentReps = item.targetReps;
          item.status = 'completed';
          item.completedDate = todayFormatted;
          if (wasOverdue) {
            item.wasOverdue = true;
          }
        } else {
          if (wasOverdue) {
            item.status = 'overdue';
            item.wasOverdue = true;
          } else {
            item.status = 'in_progress';
          }
        }
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(schKey, JSON.stringify(scheduleItems));
    }

    recordPracticeSession(targetNameStr, 'speak', '1/1 lần');
  } catch (e) {
    console.error('Error updating topic practice progress:', e);
  }
}

export function updateWordSRS(wordKey, quality) {
  const progressMap = getSRSProgress();
  const current = progressMap[wordKey] || {
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    history: []
  };

  const updated = calculateSM2(quality, current.repetitions, current.interval, current.easeFactor);
  updated.lastReviewed = new Date().toISOString();
  updated.history = [...(current.history || []), { date: updated.lastReviewed, quality }];

  progressMap[wordKey] = updated;
  localStorage.setItem(getKey('hanzo_srs_progress'), JSON.stringify(progressMap));

  // Cập nhật thống kê Streak & Nhật ký học tập hàng ngày
  updateUserStreak();
  recordDailyActivity(wordKey);

  // Sync with schedule list progress
  try {
    const allTopics = getAllTopicsList();
    const matchedTopic = allTopics.find(t => t.words && t.words.some(w => w.hanzi === wordKey || `${t.id}_${w.hanzi}` === wordKey));
    if (matchedTopic) {
      recordTopicPracticeProgress(matchedTopic.id);
    }
  } catch (e) {}

  return updated;
}

export function getScheduleGoals() {
  try {
    const activeUser = getActiveUser();
    const data = localStorage.getItem(getKey('hanzo_schedule_goals'));
    const defaultGoals = {
      dailyTargetWords: activeUser.dailyTargetWords || 10,
      weeklyTargetDays: 5,
      targetSkills: ['listening', 'speaking', 'reading', 'writing'],
      reminderTime: '20:00',
      enabledReminder: true
    };
    return data ? { ...defaultGoals, ...JSON.parse(data) } : defaultGoals;
  } catch (e) {
    const activeUser = getActiveUser();
    return {
      dailyTargetWords: activeUser.dailyTargetWords || 10,
      weeklyTargetDays: 5,
      targetSkills: ['listening', 'speaking', 'reading', 'writing'],
      reminderTime: '20:00',
      enabledReminder: true
    };
  }
}

export function saveScheduleGoals(goals) {
  localStorage.setItem(getKey('hanzo_schedule_goals'), JSON.stringify(goals));
}

export function getDailyLogs() {
  try {
    const data = localStorage.getItem(getKey('hanzo_daily_study_logs'));
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function recordDailyActivity(wordKey, skill = null) {
  const goals = getScheduleGoals();
  const logs = getDailyLogs();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayLog = logs[todayStr] || {
    wordsReviewedSet: [],
    wordsCount: 0,
    skillsPracticed: [],
    isTargetMet: false
  };

  if (!todayLog.wordsReviewedSet) todayLog.wordsReviewedSet = [];
  if (!todayLog.wordsReviewedSet.includes(wordKey)) {
    todayLog.wordsReviewedSet.push(wordKey);
    todayLog.wordsCount = todayLog.wordsReviewedSet.length;
  }

  if (!todayLog.skillsPracticed) todayLog.skillsPracticed = [];
  if (skill && !todayLog.skillsPracticed.includes(skill)) {
    todayLog.skillsPracticed.push(skill);
  }

  todayLog.isTargetMet = todayLog.wordsCount >= goals.dailyTargetWords;
  todayLog.lastUpdated = new Date().toISOString();

  logs[todayStr] = todayLog;
  localStorage.setItem(getKey('hanzo_daily_study_logs'), JSON.stringify(logs));
}

function calculateStreakFromHistory(datesArray) {
  if (!Array.isArray(datesArray) || datesArray.length === 0) return 1;
  const set = new Set(datesArray);
  const now = new Date();
  let count = 0;
  
  let checkDate = new Date(now);
  let dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  
  if (!set.has(dateStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  }

  while (set.has(dateStr)) {
    count++;
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  }

  return Math.max(1, count);
}

export function recordAccountLoginStreak() {
  try {
    const key = getKey('hanzo_user_stats');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let stats = null;
    const raw = localStorage.getItem(key);
    if (raw) {
      try { stats = JSON.parse(raw); } catch (e) {}
    }

    if (!stats) {
      stats = { streak: 1, lastLoginDate: todayStr, loginDatesHistory: [todayStr] };
    }

    if (!Array.isArray(stats.loginDatesHistory)) {
      stats.loginDatesHistory = [];
    }

    if (!stats.loginDatesHistory.includes(todayStr)) {
      stats.loginDatesHistory.push(todayStr);
    }

    stats.lastLoginDate = todayStr;
    stats.streak = calculateStreakFromHistory(stats.loginDatesHistory);

    const srsMap = getSRSProgress();
    stats.totalWordsMastered = Object.values(srsMap).filter(item => item && item.repetitions >= 3).length;

    localStorage.setItem(key, JSON.stringify(stats));
    return stats;
  } catch (e) {
    return { streak: 1, lastLoginDate: '', loginDatesHistory: [] };
  }
}

export function getUserStats() {
  return recordAccountLoginStreak();
}

export function updateUserStreak() {
  return recordAccountLoginStreak();
}

export function getCompletedTopicsCount() {
  try {
    const allTopics = getAllTopicsList();
    const srsProgress = getSRSProgress();
    const scheduleItems = getStoredScheduleItems(allTopics);

    const completedTopicIds = new Set();

    if (Array.isArray(scheduleItems)) {
      scheduleItems.forEach(item => {
        if (item && item.status === 'completed') {
          if (item.topicId) completedTopicIds.add(String(item.topicId));
          if (item.topicName) {
            const matched = allTopics.find(t => t.name === item.topicName || t.id === item.topicId);
            if (matched) completedTopicIds.add(String(matched.id));
          }
        }
      });
    }

    if (Array.isArray(allTopics)) {
      allTopics.forEach(t => {
        if (t && t.words && t.words.length > 0) {
          const allDone = t.words.every(w => {
            const keyWithTopic = `${t.id}_${w.hanzi}`;
            const keyHanzi = w.hanzi;
            const recTopic = srsProgress[keyWithTopic];
            const recHanzi = srsProgress[keyHanzi];
            return (recTopic && recTopic.repetitions > 0) || (recHanzi && recHanzi.repetitions > 0);
          });
          if (allDone) {
            completedTopicIds.add(String(t.id));
          }
        }
      });
    }

    return completedTopicIds.size;
  } catch (e) {
    return 0;
  }
}

export function getRealTimeStats() {
  const srsProgress = getSRSProgress();
  const userStats = getUserStats();
  const goals = getScheduleGoals();
  const logs = getDailyLogs();

  const learnedWordsCount = Object.keys(srsProgress).length;
  const completedTopicsCount = getCompletedTopicsCount();
  const streak = (userStats && typeof userStats.streak === 'number' && userStats.streak > 0) ? userStats.streak : 1;

  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  let weeklyMinutes = 0;
  let activeDaysThisWeek = 0;

  for (let i = 0; i < dayOfWeek; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs[dateStr];
    if (log && log.wordsCount > 0) {
      activeDaysThisWeek++;
      weeklyMinutes += log.wordsCount * 2;
    }
  }

  if (weeklyMinutes === 0 && learnedWordsCount > 0) {
    weeklyMinutes = learnedWordsCount * 2;
  }
  if (activeDaysThisWeek === 0 && learnedWordsCount > 0) {
    activeDaysThisWeek = 1;
  }

  const hours = Math.floor(weeklyMinutes / 60);
  const mins = weeklyMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}g ${mins}p` : `${mins}p`;
  const timeFormattedLong = hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`;

  const targetDays = goals.weeklyTargetDays || 5;
  const progressPercent = Math.min(100, Math.round((activeDaysThisWeek / targetDays) * 100));

  return {
    learnedWords: learnedWordsCount,
    completedTopics: completedTopicsCount,
    streak: streak,
    weeklyMinutes: weeklyMinutes,
    timeFormatted: timeFormatted,
    timeFormattedLong: timeFormattedLong,
    progressPercent: progressPercent,
    activeDaysThisWeek: activeDaysThisWeek,
    targetDays: targetDays
  };
}

export function recordPracticeSession(topicName, skillType = 'speak', repsStr = '1/1 lần') {
  try {
    if (!topicName) return [];
    const key = getKey('hanzo_recent_practice_history');
    const raw = localStorage.getItem(key);
    let list = [];
    if (raw) {
      try { list = JSON.parse(raw); } catch (e) {}
    }
    const now = new Date();
    const timeStr = `Hôm nay ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    let title = String(topicName).trim();
    if (!title.startsWith('Luyện tập')) {
      title = `Luyện tập - ${title}`;
    }

    const icon = skillType === 'listen' ? '🎧' : skillType === 'read' ? '📖' : '🎙️';

    const newSession = {
      id: `session_${Date.now()}`,
      title: title,
      time: timeStr,
      status: '✓ Hoàn thành',
      reps: repsStr,
      icon: icon,
      timestamp: Date.now()
    };

    list = [newSession, ...list.filter(item => item.title !== title)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Error recording practice session:', e);
    return [];
  }
}

export function getRecentPracticeHistory() {
  try {
    const key = getKey('hanzo_recent_practice_history');
    const raw = localStorage.getItem(key);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
    
    const scheduleItems = getStoredScheduleItems();
    const completedSchedule = (scheduleItems || []).filter(s => s && (s.status === 'completed' || s.isCompleted || (s.currentReps && s.currentReps > 0)));
    if (completedSchedule.length > 0) {
      return completedSchedule.slice(-5).reverse().map(item => ({
        title: item.title && item.title.startsWith('Luyện tập') ? item.title : `Luyện tập - ${item.topicName || item.title || 'Bộ từ vựng'}`,
        time: item.completedDate ? `Hôm nay ${item.completedDate.split('T')[1]?.slice(0, 5) || '20:00'}` : 'Gần đây',
        status: '✓ Hoàn thành',
        reps: `${item.currentReps || item.repetitionCount || 1}/${item.targetReps || item.targetRepetitions || item.repetitionCount || 1} lần`,
        icon: item.type === 'audio' ? '🎧' : item.type === 'doc' ? '📖' : '🎙️'
      }));
    }

    return [
      { title: 'Luyện tập - HSK1.2', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 3 - Trung Cấp Đời Sống', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 2 - Giao Tiếp Thông Dụng', time: 'Hôm nay 20:00', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' }
    ];
  } catch (e) {
    return [
      { title: 'Luyện tập - HSK1.2', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 3 - Trung Cấp Đời Sống', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 2 - Giao Tiếp Thông Dụng', time: 'Hôm nay 20:00', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' }
    ];
  }
}
