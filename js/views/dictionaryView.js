// Module 3: Tra Cứu Từ Điển Trung - Việt / Việt - Trung & Trường Hợp Sử Dụng Giao Tiếp (dictionaryView.js)
import { dictionaryData } from '../data/dictionaryData.js';
import { speakChinese } from '../utils/speech.js';
import { getSavedCustomTopics, saveCustomTopic, getAllTopicsList, getEffectiveDictionaryData, syncTopicWordsToDictionary } from '../utils/srs.js';
import { lookupHanVietForHanzi, lookupPinyinForHanzi } from '../utils/pinyinUtils.js';
import { getFavoriteDictWords, toggleFavoriteDictWord, getScopedStorageKey } from '../utils/accountManager.js';


function syncWordEditToTopics(oldHanzi, newWordData) {
  try {
    const allTopics = getAllTopicsList();
    let updatedTopicCount = 0;

    allTopics.forEach(topic => {
      if (!topic.words || !Array.isArray(topic.words)) return;
      let topicModified = false;

      topic.words.forEach(w => {
        if (w.hanzi === oldHanzi || (newWordData.hanzi && w.hanzi === newWordData.hanzi)) {
          if (newWordData.hanzi) w.hanzi = newWordData.hanzi;
          if (newWordData.pinyin) w.pinyin = newWordData.pinyin;
          if (newWordData.hanviet !== undefined) w.hanviet = newWordData.hanviet;
          if (newWordData.meaning) w.meaning = newWordData.meaning;
          topicModified = true;
        }
      });

      if (topicModified) {
        updatedTopicCount++;
        saveCustomTopic(topic);
      }
    });

    return updatedTopicCount;
  } catch (e) {
    console.error('Lỗi khi đồng bộ từ vựng sang các bộ chủ đề:', e);
    return 0;
  }
}

function updateDictionaryWord(wordId, oldHanzi, updatedFields) {
  const edits = getCustomDictionaryEdits();
  edits[wordId] = {
    ...(edits[wordId] || {}),
    ...updatedFields
  };
  saveCustomDictionaryEdits(edits);

  const wordIdx = dictionaryData.findIndex(w => w.id === wordId);
  if (wordIdx !== -1) {
    Object.assign(dictionaryData[wordIdx], updatedFields);
  }

  const syncedCount = syncWordEditToTopics(oldHanzi, updatedFields);
  return syncedCount;
}

export function renderDictionaryView(container) {
  let searchQuery = '';
  let selectedHsk = 'all';

  const filterWords = () => {
    const q = searchQuery.toLowerCase().trim();
    const currentList = getEffectiveDictionaryData();
    const favList = getFavoriteDictWords();

    return currentList.filter(word => {
      const hanviet = (word.hanviet || lookupHanVietForHanzi(word.hanzi) || '').toLowerCase();
      let matchHsk = false;

      if (selectedHsk === 'fav') {
        matchHsk = favList.includes(word.id);
      } else if (selectedHsk === 'topic') {
        matchHsk = word.isSyncedFromTopic || !!word.sourceTopicId;
      } else {
        matchHsk = selectedHsk === 'all' || String(word.hskLevel) === selectedHsk;
      }

      const matchQuery = !q || 
        word.hanzi.includes(q) ||
        word.pinyin.toLowerCase().includes(q) ||
        (word.pinyinNoTone && word.pinyinNoTone.toLowerCase().includes(q)) ||
        word.meaning.toLowerCase().includes(q) ||
        hanviet.includes(q) ||
        (word.tags && word.tags.some(t => t.toLowerCase().includes(q)));
      return matchHsk && matchQuery;
    });
  };

  const renderContent = () => {
    const filtered = filterWords();
    const favList = getFavoriteDictWords();
    const currentData = getEffectiveDictionaryData();
    const topicSyncedCount = currentData.filter(w => w.isSyncedFromTopic || w.sourceTopicId).length;

    container.innerHTML = `
      <div class="view-header mb-6 flex flex-col md:flex-row justify-between align-start md:align-center gap-3">
        <div>
          <h1 class="text-gradient">🔍 Từ Điển Tra Cứu HSK</h1>
          <p class="subtitle">Tra cứu Hán tự, Pinyin, Hán Việt, nghĩa tiếng Việt, tự động đồng bộ 2 chiều giữa Từ điển HSK và Các bộ chủ đề từ vựng.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-sync-topics-to-dict" class="btn btn-secondary font-bold text-xs bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer transition shadow-xs">
            <span>🔄 Cập Nhật Từ Bộ Chủ Đề</span>
          </button>
        </div>
      </div>

      <!-- Search Controls Bar -->
      <div class="search-bar-wrapper glass-panel p-4 mb-6 flex flex-col md:flex-row gap-3 align-center">
        <div class="relative flex-1" style="width: 100%;">
          <input type="text" id="dict-search-input" class="form-control form-control-lg pl-10" placeholder="Gõ Hán tự (你好), Pinyin (ni hao / nǐ hǎo), Hán Việt (nhĩ hảo) hoặc từ tiếng Việt (Xin chào)..." value="${escapeHtml(searchQuery)}" />
          <span class="absolute left-3 top-3 text-slate-400 text-lg">🔍</span>
        </div>
        <div class="flex gap-2">
          <select id="hsk-filter-select" class="form-control" style="width: 180px;">
            <option value="all" ${selectedHsk === 'all' ? 'selected' : ''}>Tất cả HSK (${currentData.length})</option>
            <option value="fav" ${selectedHsk === 'fav' ? 'selected' : ''}>⭐ Yêu Thích (${favList.length})</option>
            <option value="topic" ${selectedHsk === 'topic' ? 'selected' : ''}>📂 Bộ Chủ Đề (${topicSyncedCount})</option>
            <option value="1" ${selectedHsk === '1' ? 'selected' : ''}>HSK 1</option>
            <option value="2" ${selectedHsk === '2' ? 'selected' : ''}>HSK 2</option>
            <option value="3" ${selectedHsk === '3' ? 'selected' : ''}>HSK 3</option>
            <option value="4" ${selectedHsk === '4' ? 'selected' : ''}>HSK 4</option>
          </select>
        </div>
      </div>

      <!-- Dictionary Grid Results -->
      <div class="dict-results-count flex justify-between items-center text-xs text-muted mb-3">
        <span>Tìm thấy ${filtered.length} kết quả từ vựng HSK.</span>
        <span class="text-2xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-200">
          💡 Bấm nút ✏️ trên từ để sửa & đồng bộ bộ từ vựng
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="dict-grid">
        ${filtered.map(w => renderDictWordCard(w)).join('')}
      </div>

      <!-- Detail Modal -->
      <div id="dict-detail-modal" class="modal-overlay hidden">
        <div class="modal-card max-w-2xl" id="dict-modal-content">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- Edit Modal -->
      <div id="dict-edit-modal" class="modal-overlay hidden">
        <div class="modal-card max-w-lg bg-white border border-slate-200/90 text-slate-800 p-6 rounded-3xl shadow-2xl relative">
          <div class="modal-header flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <div class="flex items-center gap-2 font-bold text-xl text-slate-900">
              <span>✏️</span> <span>Chỉnh Sửa Từ Vựng HSK</span>
            </div>
            <button class="btn-close text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer" id="dict-edit-modal-close">&times;</button>
          </div>

          <form id="dict-edit-form" class="space-y-4">
            <input type="hidden" id="edit-word-id" />
            <input type="hidden" id="edit-word-old-hanzi" />

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">Chữ Hán (Tiếng Trung) *</label>
                <input type="text" id="edit-word-hanzi" class="form-control font-extrabold text-red-600 text-lg border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" required placeholder="v.d. 你好" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Cấp độ HSK</label>
                <select id="edit-word-hsk" class="form-control font-bold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 w-full focus:border-red-500 focus:outline-none">
                  <option value="1">HSK 1</option>
                  <option value="2">HSK 2</option>
                  <option value="3">HSK 3</option>
                  <option value="4">HSK 4</option>
                  <option value="5">HSK 5</option>
                  <option value="6">HSK 6</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Phiên âm (Pinyin)</label>
                <input type="text" id="edit-word-pinyin" class="form-control font-pinyin font-medium text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" placeholder="v.d. nǐ hǎo" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Hán Việt</label>
                <input type="text" id="edit-word-hanviet" class="form-control font-bold text-slate-800 tracking-wide border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" placeholder="v.d. NHĨ HẢO" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ý nghĩa Tiếng Việt *</label>
              <input type="text" id="edit-word-meaning" class="form-control font-bold text-emerald-600 border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-emerald-500 focus:outline-none" required placeholder="v.d. Xin chào" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Giải thích & Trường hợp sử dụng</label>
              <textarea id="edit-word-usage" class="form-control text-slate-700 text-sm border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" rows="3" placeholder="Từ vựng HSK 1 phổ biến trong giao tiếp."></textarea>
            </div>

            <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-red-900 font-semibold flex items-start gap-2.5 leading-relaxed">
              <span class="bg-blue-500 text-white rounded p-1 text-xs shrink-0 mt-0.5 flex items-center justify-center w-5 h-5">🔄</span>
              <span>Dữ liệu vừa chỉnh sửa (Chữ Hán, Pinyin, Hán Việt, Nghĩa tiếng Việt) sẽ được <strong>tự động đồng bộ cập nhật ngược lại</strong> tất cả các bộ chủ đề từ vựng chứa từ này.</span>
            </div>

            <div class="modal-footer flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" class="px-5 py-2 rounded-full border border-red-500 text-red-600 font-bold hover:bg-red-50 transition cursor-pointer text-sm" id="dict-edit-cancel-btn">Hủy</button>
              <button type="submit" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer text-sm">
                <span>💾</span> <span>Lưu & Đồng Bộ Bộ Chủ Đề</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupDictEvents();
  };

  function setupDictEvents() {
    const searchInput = container.querySelector('#dict-search-input');
    const hskSelect = container.querySelector('#hsk-filter-select');

    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderContent();
      const newInp = container.querySelector('#dict-search-input');
      if (newInp) {
        newInp.focus();
        newInp.setSelectionRange(newInp.value.length, newInp.value.length);
      }
    });

    hskSelect?.addEventListener('change', (e) => {
      selectedHsk = e.target.value;
      renderContent();
    });

    // Speak audio
    container.querySelectorAll('.btn-speak-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = e.currentTarget.dataset.text;
        speakChinese(text);
      });
    });

    // Manual Sync Topics to Dictionary
    container.querySelector('#btn-sync-topics-to-dict')?.addEventListener('click', () => {
      const res = syncTopicWordsToDictionary();
      renderContent();
      alert(`🎉 Đã tự động đồng bộ & cập nhật từ vựng từ tất cả Bộ chủ đề vào Từ điển HSK!\n\n✨ Thêm mới vào từ điển: ${res.addedCount} từ vựng\n✨ Cập nhật thông tin: ${res.updatedCount} từ vựng\n✨ Tổng số từ vựng chủ đề đã đồng bộ: ${res.totalSynced} từ.`);
    });

    // Toggle Favorite
    container.querySelectorAll('.btn-fav-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        toggleFavoriteDictWord(id);
        renderContent();
      });
    });

    // Edit Word Button
    container.querySelectorAll('.btn-edit-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const currentData = getEffectiveDictionaryData();
        const word = currentData.find(w => w.id === id);
        if (word) openEditWordModal(word);
      });
    });

    // View detail modal
    container.querySelectorAll('.dict-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-speak-word') || e.target.closest('.btn-fav-word') || e.target.closest('.btn-edit-word')) return;
        const wordId = card.dataset.id;
        const currentData = getEffectiveDictionaryData();
        const word = currentData.find(w => w.id === wordId);
        if (word) openWordDetailModal(word);
      });
    });

    // Setup Edit Modal Form
    const editModal = container.querySelector('#dict-edit-modal');
    const editCloseBtn = container.querySelector('#dict-edit-modal-close');
    const editCancelBtn = container.querySelector('#dict-edit-cancel-btn');
    const editForm = container.querySelector('#dict-edit-form');
    const hanziInp = container.querySelector('#edit-word-hanzi');
    const pinyinInp = container.querySelector('#edit-word-pinyin');
    const hanvietInp = container.querySelector('#edit-word-hanviet');

    const closeEditModal = () => editModal?.classList.add('hidden');
    editCloseBtn?.addEventListener('click', closeEditModal);
    editCancelBtn?.addEventListener('click', closeEditModal);

    hanziInp?.addEventListener('input', () => {
      const val = hanziInp.value.trim();
      if (val) {
        if (!pinyinInp.value.trim() || pinyinInp.dataset.autoFilled === 'true') {
          const autoPy = lookupPinyinForHanzi(val);
          if (autoPy) {
            pinyinInp.value = autoPy;
            pinyinInp.dataset.autoFilled = 'true';
          }
        }
        if (!hanvietInp.value.trim() || hanvietInp.dataset.autoFilled === 'true') {
          const autoHv = lookupHanVietForHanzi(val);
          if (autoHv) {
            hanvietInp.value = autoHv;
            hanvietInp.dataset.autoFilled = 'true';
          }
        }
      }
    });

    editForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const wordId = container.querySelector('#edit-word-id').value;
      const oldHanzi = container.querySelector('#edit-word-old-hanzi').value;
      const hanzi = container.querySelector('#edit-word-hanzi').value.trim();
      let pinyin = container.querySelector('#edit-word-pinyin').value.trim();
      let hanviet = container.querySelector('#edit-word-hanviet').value.trim();
      const meaning = container.querySelector('#edit-word-meaning').value.trim();
      const hskLevel = parseInt(container.querySelector('#edit-word-hsk').value, 10) || 1;
      const usageContext = container.querySelector('#edit-word-usage').value.trim();

      if (!hanzi || !meaning) {
        alert('Vui lòng nhập đầy đủ Chữ Hán và Nghĩa tiếng Việt!');
        return;
      }

      if (!pinyin) pinyin = lookupPinyinForHanzi(hanzi) || hanzi;
      if (!hanviet) hanviet = lookupHanVietForHanzi(hanzi) || '';

      const updatedFields = { hanzi, pinyin, hanviet, meaning, hskLevel, usageContext };
      const syncedCount = updateDictionaryWord(wordId, oldHanzi, updatedFields);

      closeEditModal();
      renderContent();

      alert(`🎉 Đã cập nhật thành công từ vựng "${hanzi}"!\n\n✨ Đã đồng bộ thông tin mới (Chữ Hán, Pinyin, Hán Việt, Nghĩa) ngược lại ${syncedCount} bộ chủ đề từ vựng.`);
    });
  }

  function openEditWordModal(word) {
    const editModal = container.querySelector('#dict-edit-modal');
    const hanviet = word.hanviet || lookupHanVietForHanzi(word.hanzi);

    container.querySelector('#edit-word-id').value = word.id;
    container.querySelector('#edit-word-old-hanzi').value = word.hanzi;
    container.querySelector('#edit-word-hanzi').value = word.hanzi;
    container.querySelector('#edit-word-pinyin').value = word.pinyin || '';
    container.querySelector('#edit-word-hanviet').value = hanviet || '';
    container.querySelector('#edit-word-meaning').value = word.meaning || '';
    container.querySelector('#edit-word-hsk').value = String(word.hskLevel || 1);
    container.querySelector('#edit-word-usage').value = word.usageContext || '';

    editModal.classList.remove('hidden');
  }

  function openWordDetailModal(word) {
    const modal = container.querySelector('#dict-detail-modal');
    const content = container.querySelector('#dict-modal-content');
    const customTopics = getSavedCustomTopics();
    const hanviet = word.hanviet || lookupHanVietForHanzi(word.hanzi);

    content.innerHTML = `
      <div class="modal-header flex justify-between align-center border-b border-slate-700 pb-3">
        <div class="flex align-center gap-3">
          <span class="text-4xl font-extrabold text-amber-400">${escapeHtml(word.hanzi)}</span>
          <div>
            <div class="flex align-center gap-2 mb-1">
              <span class="text-lg font-bold text-slate-200">${escapeHtml(word.pinyin)}</span>
              ${hanviet ? `<span class="badge badge-purple text-xs font-semibold">[${escapeHtml(hanviet)}]</span>` : ''}
              <span class="badge badge-red">HSK ${word.hskLevel}</span>
            </div>
            <p class="text-sm text-emerald-400 font-semibold">${escapeHtml(word.meaning)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-secondary text-xs font-bold" id="btn-modal-trigger-edit" data-id="${word.id}">
            ✏️ Chỉnh sửa từ này
          </button>
          <button class="btn-close" id="dict-modal-close">&times;</button>
        </div>
      </div>

      <div class="modal-body py-4 max-h-96 overflow-y-auto pr-1">
        <div class="grid grid-cols-2 gap-2 p-3 bg-slate-900/60 rounded-xl mb-4 text-xs">
          <div><span class="text-muted">Hán Việt:</span> <span class="text-purple-300 font-semibold">${escapeHtml(hanviet || 'N/A')}</span></div>
          <div><span class="text-muted">Bộ thủ:</span> <span class="text-slate-200">${escapeHtml(word.radical || 'N/A')}</span></div>
          <div><span class="text-muted">Số nét:</span> <span class="text-slate-200">${word.strokeCount || 5} nét</span></div>
          <div><span class="text-muted">Từ loại:</span> <span class="text-slate-200">${escapeHtml(word.type || 'Từ vựng HSK')}</span></div>
          <div><span class="text-muted">Phát âm:</span> <button class="btn-link text-amber-400" onclick="window.speakZh('${escapeHtml(word.hanzi)}')">🔊 Nghe TTS</button></div>
        </div>

        <div class="mb-4">
          <h4 class="font-bold text-amber-400 text-sm mb-1">💡 Giải thích & Trường hợp sử dụng hàng ngày:</h4>
          <p class="text-sm text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            ${escapeHtml(word.usageContext || 'Được sử dụng phổ biến trong giao tiếp hàng ngày và môi trường học tập công sở.')}
          </p>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    content.querySelector('#dict-modal-close')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#btn-modal-trigger-edit')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      openEditWordModal(word);
    });
  }

  renderContent();
}

function renderDictWordCard(word) {
  const hanviet = word.hanviet || lookupHanVietForHanzi(word.hanzi);
  const isFav = getFavoriteDictWords().includes(word.id);
  const hanvietFormatted = hanviet ? hanviet.toUpperCase() : '';
  const usageText = word.usageContext || `Từ vựng HSK ${word.hskLevel || 1} phổ biến trong giao tiếp.`;

  return `
    <div class="dict-card hsk-word-card bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-red-300/80 transition-all cursor-pointer relative" data-id="${word.id}">
      <div>
        <!-- Top Row: Hanzi + Hán Việt & 3 Top-Right Action Icon Buttons -->
        <div class="flex justify-between items-start mb-1">
          <div class="flex items-baseline gap-2 flex-wrap pr-2">
            <h3 class="text-3xl font-extrabold text-red-600 hanzi-font leading-tight">${escapeHtml(word.hanzi)}</h3>
            ${hanvietFormatted ? `<span class="text-sm font-bold text-slate-800 tracking-wide">[${escapeHtml(hanvietFormatted)}]</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button class="btn-fav-word w-8 h-8 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-rose-50 hover:border-rose-300 text-rose-500 transition flex items-center justify-center cursor-pointer shadow-2xs" data-id="${word.id}" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích từ này'}">
              <span class="text-sm leading-none" style="color: #e11d48;">${isFav ? '★' : '☆'}</span>
            </button>
            <button class="btn-speak-word w-8 h-8 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50 hover:border-blue-300 text-blue-500 transition flex items-center justify-center cursor-pointer shadow-2xs" data-text="${escapeHtml(word.hanzi)}" title="Phát âm">
              <svg class="w-4 h-4 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            <button class="btn-edit-word w-8 h-8 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-amber-50 hover:border-amber-300 text-amber-600 transition flex items-center justify-center cursor-pointer shadow-2xs" data-id="${word.id}" title="Chỉnh sửa từ vựng này">
              <svg class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Pinyin row -->
        <div class="mb-2">
          <span class="pinyin-text font-pinyin text-sm font-medium text-slate-800">${escapeHtml(word.pinyin)}</span>
        </div>

        <!-- Vietnamese Meaning -->
        <h4 class="text-base font-bold text-emerald-600 mb-1 leading-snug">${escapeHtml(word.meaning)}</h4>

        <!-- Usage context snippet -->
        <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">${escapeHtml(usageText)}</p>
      </div>

      <!-- Footer: HSK badge left, Edit & Detail right -->
      <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <span class="badge-hsk-level inline-block bg-amber-50 border border-amber-300 text-amber-700 font-bold px-3 py-1 rounded-lg text-xs">
          HSK ${word.hskLevel || 1}
        </span>
        <div class="flex items-center gap-3">
          <button class="btn-edit-word text-slate-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition cursor-pointer" data-id="${word.id}">
            <span>✏️</span> <span>Chỉnh sửa</span>
          </button>
          <span class="text-red-600 font-bold flex items-center gap-0.5 hover:underline cursor-pointer">
            Chi tiết ➔
          </span>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
