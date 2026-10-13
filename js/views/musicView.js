// Module 5: Học Bài Hát Tiếng Trung qua Video YouTube & Lời Bài Hát (musicView.js)
import { initialMusicData } from '../data/musicData.js';
import { speakChinese } from '../utils/speech.js';
import { normalizePinyin, lookupPinyinForHanzi } from '../utils/pinyinUtils.js';
import { getScopedStorageKey } from '../utils/accountManager.js';

function getSongsKey() {
  return typeof getScopedStorageKey === 'function' ? getScopedStorageKey('hanzo_custom_songs') : 'hanzo_custom_songs';
}

function getDeletedSongsKey() {
  return typeof getScopedStorageKey === 'function' ? getScopedStorageKey('hanzo_deleted_preset_songs') : 'hanzo_deleted_preset_songs';
}

function getSavedSongs() {
  try {
    const data = localStorage.getItem(getSongsKey());
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function getDeletedPresetIds() {
  try {
    const data = localStorage.getItem(getDeletedSongsKey());
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function getAllSongsList() {
  const savedSongs = getSavedSongs();
  const deletedIds = getDeletedPresetIds();
  
  const activePresets = initialMusicData.filter(p => !deletedIds.includes(p.id));
  
  const mergedList = activePresets.map(preset => {
    const editedVersion = savedSongs.find(s => s.id === preset.id);
    return editedVersion ? { ...editedVersion, isEditedPreset: true } : preset;
  });

  savedSongs.forEach(saved => {
    if (!saved.id.startsWith('song_')) {
      mergedList.push(saved);
    }
  });

  return mergedList;
}

function saveSongToStorage(song) {
  const songs = getSavedSongs();
  const idx = songs.findIndex(s => s.id === song.id);
  if (idx >= 0) songs[idx] = song;
  else songs.push(song);
  localStorage.setItem(getSongsKey(), JSON.stringify(songs));
}

function deleteSongFromStorage(songId) {
  if (songId.startsWith('song_')) {
    const deletedIds = getDeletedPresetIds();
    if (!deletedIds.includes(songId)) {
      deletedIds.push(songId);
      localStorage.setItem(getDeletedSongsKey(), JSON.stringify(deletedIds));
    }
    const songs = getSavedSongs().filter(s => s.id !== songId);
    localStorage.setItem(getSongsKey(), JSON.stringify(songs));
  } else {
    const songs = getSavedSongs().filter(s => s.id !== songId);
    localStorage.setItem(getSongsKey(), JSON.stringify(songs));
  }
}

export function parseYouTubeVideoId(url) {
  if (!url) return '';
  url = url.trim();
  if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : '';
}

export function formatLyricsForEditing(lyrics) {
  if (!lyrics || !Array.isArray(lyrics) || lyrics.length === 0) return '';
  return lyrics.map((l, idx) => {
    let block = `${idx + 1}. ${l.hanzi || ''}`;
    if (l.pinyin) block += `\n${l.pinyin}`;
    if (l.meaning) block += `\n${l.meaning}`;
    return block;
  }).join('\n\n');
}

export function parseLyricsInput(lyricsRaw) {
  if (!lyricsRaw || !lyricsRaw.trim()) return [];

  const lines = lyricsRaw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const results = [];

  let currentHanzi = '';
  let currentPinyin = '';
  let currentMeaning = '';

  const pushCurrent = () => {
    if (currentHanzi) {
      let py = normalizePinyin(currentPinyin);
      if (!py && currentHanzi && typeof lookupPinyinForHanzi === 'function') {
        py = lookupPinyinForHanzi(currentHanzi);
      }
      results.push({
        hanzi: currentHanzi,
        pinyin: py || currentHanzi,
        meaning: currentMeaning
      });
      currentHanzi = '';
      currentPinyin = '';
      currentMeaning = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if line has pipe separators: "1. 后来 | Hòu lái | Sau này" or "后来 | Hòu lái | Sau này"
    if (line.includes('|')) {
      pushCurrent();
      line = line.replace(/^\d+[\.\)\/]\s*/, '');
      const parts = line.split('|').map(p => p.trim());
      const hanzi = parts[0] || '';
      const pinyin = normalizePinyin(parts[1] || '');
      const meaning = parts[2] || '';
      if (hanzi) {
        results.push({
          hanzi,
          pinyin: pinyin || (typeof lookupPinyinForHanzi === 'function' ? lookupPinyinForHanzi(hanzi) : hanzi),
          meaning
        });
      }
      continue;
    }

    // Check if line starts with a number prefix like "1. 后来" or "1) 后来" or "1. 后来"
    const numMatch = line.match(/^(\d+)[\.\)\/]\s*(.*)/);
    if (numMatch) {
      pushCurrent();
      currentHanzi = numMatch[2].trim();
      continue;
    }

    // If we have a currentHanzi but no currentPinyin:
    if (currentHanzi && !currentPinyin) {
      const hasChineseChar = /[\u4e00-\u9fa5]/.test(line);
      if (hasChineseChar && !/^\d+/.test(line)) {
        pushCurrent();
        currentHanzi = line;
      } else {
        currentPinyin = line;
      }
      continue;
    }

    // If we have currentHanzi and currentPinyin, but no currentMeaning:
    if (currentHanzi && currentPinyin && !currentMeaning) {
      const hasChineseChar = /[\u4e00-\u9fa5]/.test(line);
      if (hasChineseChar) {
        pushCurrent();
        currentHanzi = line;
      } else {
        currentMeaning = line;
        pushCurrent();
      }
      continue;
    }

    // Default fallback: new Hanzi line
    pushCurrent();
    currentHanzi = line.replace(/^\d+[\.\)\/]\s*/, '');
  }

  pushCurrent();
  return results;
}

export function renderMusicView(container, activeSongId = null) {
  let allSongs = getAllSongsList();
  let currentSong = allSongs.find(s => s.id === activeSongId) || allSongs[0] || null;

  let showPinyin = true;
  let showMeaning = true;
  let fontSizeScale = localStorage.getItem('hanzo_music_font_size') || 'base'; // 'sm', 'base', 'lg'
  let searchQuery = '';
  let isDrawerOpen = false;
  let editingSong = null;

  const renderView = () => {
    allSongs = getAllSongsList();
    if (!currentSong && allSongs.length > 0) {
      currentSong = allSongs[0];
    }

    const filteredSongs = allSongs.filter(s => 
      (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.pinyin || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.titleVi || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const videoId = parseYouTubeVideoId(currentSong?.youtubeUrl);
    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (currentSong?.youtubeUrl || '');

    const htmlContent = `
      <div class="space-y-6 pb-12 animate-fade-in relative">
        
        <!-- HEADER TITLE BAR & ACTION BUTTON -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-rose-200">
              🎵
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Học bài hát tiếng Trung
              </h1>
              <p class="text-xs text-slate-500 font-medium">
                Vừa nghe nhạc, vừa học tiếng Trung một cách thú vị!
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <button id="btn-toggle-add-song" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-crimson hover:bg-red-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer">
              <span class="text-sm font-black">+</span>
              <span>Thêm bài hát mới</span>
            </button>
          </div>
        </div>

        <!-- MAIN GRID CONTAINER -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT AREA: PLAYER, INFO, SONG LIST (Cols 7 or 12) -->
          <div class="${isDrawerOpen ? 'lg:col-span-7' : 'lg:col-span-7'} space-y-6 transition-all duration-300">
            
            <!-- CARD 1: TOP SONG SELECTOR -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 shrink-0">
                  <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">🎵</div>
                  <span class="font-extrabold text-slate-800 text-sm whitespace-nowrap">Chọn bài hát</span>
                </div>

                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div class="relative flex-1 min-w-0">
                    <select id="select-active-song" class="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2 pr-8 appearance-none outline-none focus:border-crimson cursor-pointer truncate">
                      ${allSongs.map(song => `
                        <option value="${song.id}" ${currentSong && currentSong.id === song.id ? 'selected' : ''}>
                          ${escapeHtml(song.title)} (${escapeHtml(song.pinyin || '')}) - ${escapeHtml(song.titleVi || '')}
                        </option>
                      `).join('')}
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-slate-400 pointer-events-none">▼</div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    <button id="btn-prev-song" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs transition cursor-pointer" title="Bài trước">&lt;</button>
                    <button id="btn-next-song" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs transition cursor-pointer" title="Bài tiếp">&gt;</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 2: SONG INFO -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">📇</div>
                <h3 class="font-extrabold text-slate-800 text-sm">Thông tin bài hát</h3>
              </div>

              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-200/60 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                  ${currentSong?.coverIcon || '🎵'}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1 min-w-0">
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Tên bài hát (Trung):</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.title || '')} ${currentSong?.pinyin ? `<span class="font-pinyin">(${escapeHtml(currentSong.pinyin)})</span>` : ''}</span>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Thể loại:</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.category || 'Pop, Ballad')}</span>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Tên bài hát (Việt):</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.titleVi || '')}</span>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Thời lượng:</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.duration || '5:19')}</span>
                  </div>
                  <div class="sm:col-span-2 truncate">
                    <span class="text-slate-400 font-medium">Ca sĩ:</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.artist || 'Không rõ')}</span>
                  </div>
                  <div class="sm:col-span-2 truncate">
                    <span class="text-slate-400 font-medium">Link YouTube:</span>
                    <a href="${watchUrl}" target="_blank" class="font-bold text-crimson hover:underline ml-1.5 truncate inline-block max-w-[260px] align-bottom">${watchUrl}</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 3: SONG LIST TABLE -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">🎵</div>
                  <h3 class="font-extrabold text-slate-800 text-sm">Danh sách bài hát</h3>
                </div>

                <div class="relative w-full sm:w-60">
                  <input type="text" id="song-search-input" class="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 pl-8 outline-none focus:border-crimson" placeholder="Tìm bài hát..." value="${escapeHtml(searchQuery)}" />
                  <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-slate-100 text-slate-400 font-bold text-2xs uppercase tracking-wider">
                      <th class="py-2.5 px-2 text-center w-8">#</th>
                      <th class="py-2.5 px-2">Tên bài hát (Trung)</th>
                      <th class="py-2.5 px-2">Pinyin</th>
                      <th class="py-2.5 px-2">Tên bài hát (Việt)</th>
                      <th class="py-2.5 px-2">Ca sĩ</th>
                      <th class="py-2.5 px-2 text-center">Thời lượng</th>
                      <th class="py-2.5 px-2 text-center w-16">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                    ${filteredSongs.length > 0 ? filteredSongs.map((song, idx) => {
                      const isActive = currentSong && currentSong.id === song.id;
                      return `
                        <tr class="song-table-row hover:bg-rose-50/50 transition cursor-pointer ${isActive ? 'bg-rose-50/80 font-bold text-crimson' : ''}" data-song-id="${song.id}">
                          <td class="py-3 px-2 text-center text-slate-400 font-bold">${idx + 1}</td>
                          <td class="py-3 px-2 font-black ${isActive ? 'text-crimson' : 'text-slate-900'}">${escapeHtml(song.title)}</td>
                          <td class="py-3 px-2 text-emerald-600 font-bold font-pinyin">${escapeHtml(song.pinyin || '')}</td>
                          <td class="py-3 px-2 text-slate-700 font-semibold">${escapeHtml(song.titleVi || '')}</td>
                          <td class="py-3 px-2 text-slate-500">${escapeHtml(song.artist || '')}</td>
                          <td class="py-3 px-2 text-center text-slate-400 font-semibold">${escapeHtml(song.duration || '4:00')}</td>
                          <td class="py-3 px-2 text-center">
                            <div class="flex items-center justify-center gap-1.5">
                              <button class="btn-edit-song text-rose-600 hover:text-red-700 p-1 rounded transition cursor-pointer" data-id="${song.id}" title="Chỉnh sửa">✏️</button>
                              <button class="btn-delete-song text-rose-600 hover:text-red-700 p-1 rounded transition cursor-pointer" data-id="${song.id}" title="Xóa">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('') : `
                      <tr>
                        <td colspan="7" class="py-6 text-center text-slate-400 font-medium">Không tìm thấy bài hát nào phù hợp</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- RIGHT AREA: SYNCHRONIZED LYRICS (Cols 5) -->
          <div class="${isDrawerOpen ? 'lg:col-span-5' : 'lg:col-span-5'} bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">📄</div>
                <h3 class="font-extrabold text-slate-800 text-sm">Lời bài hát</h3>
              </div>

              <!-- CONTROLS ROW -->
              <div class="flex flex-wrap items-center gap-3 text-xs">
                <button id="btn-toggle-pinyin" class="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none">
                  <div class="w-3 h-3 rounded-full border border-rose-300 ${showPinyin ? 'bg-crimson' : 'bg-slate-200'}"></div>
                  <span>Hiển thị Pinyin</span>
                </button>

                <button id="btn-toggle-meaning" class="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none">
                  <div class="w-3 h-3 rounded-full border border-rose-300 ${showMeaning ? 'bg-crimson' : 'bg-slate-200'}"></div>
                  <span>Hiển thị nghĩa tiếng Việt</span>
                </button>

                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-bold text-2xs text-slate-600">
                  <span class="px-1 text-slate-400">Cỡ chữ</span>
                  <button class="btn-font-size px-2 py-0.5 rounded-lg transition cursor-pointer ${fontSizeScale === 'sm' ? 'bg-crimson text-white font-black shadow-2xs' : 'hover:bg-slate-200'}" data-size="sm">A-</button>
                  <button class="btn-font-size px-2 py-0.5 rounded-lg transition cursor-pointer ${fontSizeScale === 'base' ? 'bg-crimson text-white font-black shadow-2xs' : 'hover:bg-slate-200'}" data-size="base">A</button>
                  <button class="btn-font-size px-2 py-0.5 rounded-lg transition cursor-pointer ${fontSizeScale === 'lg' ? 'bg-crimson text-white font-black shadow-2xs' : 'hover:bg-slate-200'}" data-size="lg">A+</button>
                </div>
              </div>
            </div>

            <!-- SCROLLABLE LYRICS CONTAINER WITH LINE NUMBERS -->
            <div id="lyrics-lines-container" class="space-y-4 max-h-[640px] overflow-y-auto pr-2 flex-1">
              ${(currentSong?.lyrics || []).map((line, idx) => {
                const fs = {
                  sm: { hanzi: 'font-size: 15px;', sub: 'font-size: 11.5px;' },
                  base: { hanzi: 'font-size: 20px;', sub: 'font-size: 13.5px;' },
                  lg: { hanzi: 'font-size: 26px;', sub: 'font-size: 16.5px;' }
                }[fontSizeScale] || { hanzi: 'font-size: 20px;', sub: 'font-size: 13.5px;' };

                return `
                  <div class="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-rose-50/40 transition group cursor-pointer lyric-line-item" data-hanzi="${escapeHtml(line.hanzi)}" title="Bấm để nghe đọc giọng đọc câu này">
                    <div class="w-6 h-6 rounded-full bg-rose-50 text-crimson font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                      ${idx + 1}
                    </div>

                    <div class="space-y-1 min-w-0 flex-1">
                      <div class="font-extrabold text-red-600 leading-snug" style="${fs.hanzi}">
                        ${escapeHtml(line.hanzi)}
                      </div>
                      ${showPinyin ? `
                        <div class="font-pinyin font-bold text-emerald-600 leading-snug tracking-wide" style="${fs.sub}">
                          ${escapeHtml(line.pinyin || lookupPinyinForHanzi(line.hanzi))}
                        </div>
                      ` : ''}
                      ${showMeaning && line.meaning ? `
                        <div class="font-medium text-slate-800 leading-snug" style="${fs.sub}">
                          ${escapeHtml(line.meaning)}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- CENTERED MODAL / POPUP FOR "Thêm bài hát mới" / "Chỉnh sửa bài hát" -->
        <div id="panel-add-song-modal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-all ${isDrawerOpen ? '' : 'hidden'}">
          <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden transform transition-all my-auto animate-scale-up">
            
            <!-- Modal Header (Tông màu đỏ Hán Ngữ) -->
            <div class="px-6 py-4 bg-gradient-to-r from-red-700 via-rose-600 to-red-600 text-white flex items-center justify-between border-b border-rose-800 shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg font-black shadow-inner border border-white/30">
                  🎵
                </div>
                <div>
                  <h3 id="drawer-form-title" class="font-black text-sm sm:text-base tracking-wide text-white drop-shadow-xs">
                    ${editingSong ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}
                  </h3>
                  <p class="text-2xs text-rose-100 font-medium">Cập nhật thông tin bài hát và tự động đánh số câu lời bài hát</p>
                </div>
              </div>
              <button id="btn-close-song-drawer" class="text-white/80 hover:text-white w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center font-bold text-sm transition cursor-pointer" title="Đóng">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 max-h-[82vh] overflow-y-auto">
              <form id="song-form" class="space-y-4 text-xs font-bold text-slate-700">
                <input type="hidden" id="form-song-id" value="${editingSong?.id || ''}" />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Tên bài hát (Tiếng Trung) <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-title" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: 后来" value="${escapeHtml(editingSong?.title || '')}" required />
                  </div>

                  <div>
                    <label class="block mb-1">Pinyin <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-pinyin" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: Hòu lái" value="${escapeHtml(editingSong?.pinyin || '')}" required />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Tên bài hát (Tiếng Việt) <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-title-vi" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: Sau này" value="${escapeHtml(editingSong?.titleVi || '')}" required />
                  </div>

                  <div>
                    <label class="block mb-1">Ca sĩ</label>
                    <input type="text" id="form-song-artist" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: 刘若英 (Lưu Nhược Anh)" value="${escapeHtml(editingSong?.artist || '')}" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Thể loại</label>
                    <input type="text" id="form-song-category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: Pop, Ballad" value="${escapeHtml(editingSong?.category || 'Pop, Ballad')}" />
                  </div>

                  <div>
                    <label class="block mb-1">Link video YouTube <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-youtube" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="https://www.youtube.com/watch?v=..." value="${escapeHtml(editingSong?.youtubeUrl || '')}" required />
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block font-extrabold text-slate-800">Lời bài hát <span class="text-crimson">*</span></label>
                    <button type="button" id="btn-auto-format-lyrics" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-crimson text-2xs font-extrabold transition cursor-pointer border border-rose-200">
                      <span>🪄 Tự động đánh số & định dạng câu</span>
                    </button>
                  </div>
                  <textarea id="form-song-lyrics-raw" rows="9" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-800 outline-none focus:border-crimson leading-relaxed" placeholder="Nhập lời bài hát theo định dạng:&#10;1. 后来 我总算学会了如何去爱&#10;Hòu lái wǒ zǒng suàn xué huì le rú hé qù ài&#10;Sau này, cuối cùng em cũng đã học được cách để yêu&#10;&#10;2. 可惜 你早已远去 消失在人海&#10;Kě xī nǐ zǎo yǐ yuǎn qù xiāo shī zài rén hǎi&#10;Chỉ tiếc rằng anh đã sớm rời xa...">${editingSong ? formatLyricsForEditing(editingSong.lyrics) : ''}</textarea>
                  <div class="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 font-medium text-slate-600">
                    <div class="font-extrabold text-slate-800">📌 Định dạng câu bài hát (Tự động đánh số theo thứ tự 3 dòng):</div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-2xs">
                      <div class="p-2 rounded-xl bg-white border border-slate-200">
                        <span class="text-red-600 font-extrabold">1. Dòng 1:</span> Câu tiếng Trung
                      </div>
                      <div class="p-2 rounded-xl bg-white border border-slate-200">
                        <span class="text-emerald-600 font-extrabold">Dòng 2:</span> Pinyin
                      </div>
                      <div class="p-2 rounded-xl bg-white border border-slate-200">
                        <span class="text-slate-800 font-extrabold">Dòng 3:</span> Nghĩa tiếng Việt
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" id="btn-cancel-song-form" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition text-xs cursor-pointer">Hủy</button>
                  <button type="submit" class="px-6 py-2.5 rounded-xl bg-crimson hover:bg-red-700 text-white font-extrabold shadow-md hover:shadow-lg transition text-xs cursor-pointer">Lưu bài hát</button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    `;

    container.innerHTML = htmlContent;
    bindEvents();
  };

  function bindEvents() {
    // Open Popup Mini Player button
    container.querySelectorAll('.btn-open-popup-player').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = e.currentTarget.dataset.url || watchUrl;
        if (url) openYouTubePopup(url);
      });
    });

    // Dropdown song select
    const selectSong = container.querySelector('#select-active-song');
    selectSong?.addEventListener('change', (e) => {
      const songId = e.target.value;
      const found = allSongs.find(s => s.id === songId);
      if (found) {
        currentSong = found;
        renderView();
      }
    });

    // Prev / Next song buttons
    container.querySelector('#btn-prev-song')?.addEventListener('click', () => {
      const currentIdx = allSongs.findIndex(s => s.id === currentSong?.id);
      if (currentIdx > 0) {
        currentSong = allSongs[currentIdx - 1];
        renderView();
      }
    });

    container.querySelector('#btn-next-song')?.addEventListener('click', () => {
      const currentIdx = allSongs.findIndex(s => s.id === currentSong?.id);
      if (currentIdx >= 0 && currentIdx < allSongs.length - 1) {
        currentSong = allSongs[currentIdx + 1];
        renderView();
      }
    });

    // Song Table Row click
    container.querySelectorAll('.song-table-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit-song') || e.target.closest('.btn-delete-song')) return;
        const songId = row.dataset.songId;
        const found = allSongs.find(s => s.id === songId);
        if (found) {
          currentSong = found;
          renderView();
        }
      });
    });

    // Search input
    const searchInput = container.querySelector('#song-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderView();
    });

    // Toggle Pinyin
    container.querySelector('#btn-toggle-pinyin')?.addEventListener('click', () => {
      showPinyin = !showPinyin;
      renderView();
    });

    // Toggle Meaning
    container.querySelector('#btn-toggle-meaning')?.addEventListener('click', () => {
      showMeaning = !showMeaning;
      renderView();
    });

    // Font size buttons
    container.querySelectorAll('.btn-font-size').forEach(btn => {
      btn.addEventListener('click', (e) => {
        fontSizeScale = e.currentTarget.dataset.size || 'base';
        try { localStorage.setItem('hanzo_music_font_size', fontSizeScale); } catch (err) {}
        renderView();
      });
    });

    // Open Drawer button
    container.querySelector('#btn-toggle-add-song')?.addEventListener('click', () => {
      editingSong = null;
      isDrawerOpen = true;
      renderView();
    });

    // Close Drawer button
    container.querySelector('#btn-close-song-drawer')?.addEventListener('click', () => {
      isDrawerOpen = false;
      editingSong = null;
      renderView();
    });

    container.querySelector('#btn-cancel-song-form')?.addEventListener('click', () => {
      isDrawerOpen = false;
      editingSong = null;
      renderView();
    });

    // Close Modal on backdrop click
    container.querySelector('#panel-add-song-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'panel-add-song-modal') {
        isDrawerOpen = false;
        editingSong = null;
        renderView();
      }
    });

    // Edit song
    container.querySelectorAll('.btn-edit-song').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.currentTarget.dataset.id;
        const found = allSongs.find(s => s.id === songId);
        if (found) {
          editingSong = found;
          isDrawerOpen = true;
          renderView();
        }
      });
    });

    // Delete song
    container.querySelectorAll('.btn-delete-song').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.currentTarget.dataset.id;
        const found = allSongs.find(s => s.id === songId);
        if (found && confirm(`Bạn có chắc chắn muốn xóa bài hát "${found.title}" không?`)) {
          deleteSongFromStorage(songId);
          allSongs = getAllSongsList();
          currentSong = allSongs.find(s => s.id !== songId) || allSongs[0] || null;
          renderView();
        }
      });
    });

    // Speech TTS on Lyric line click
    container.querySelectorAll('.lyric-line-item').forEach(item => {
      item.addEventListener('click', () => {
        const hanzi = item.dataset.hanzi;
        if (hanzi) speakChinese(hanzi, 0.85);
      });
    });

    // Auto format lyrics button
    container.querySelector('#btn-auto-format-lyrics')?.addEventListener('click', () => {
      const textarea = container.querySelector('#form-song-lyrics-raw');
      if (textarea && textarea.value) {
        const parsed = parseLyricsInput(textarea.value);
        if (parsed.length > 0) {
          textarea.value = formatLyricsForEditing(parsed);
        }
      }
    });

    // Save Song Form Submit
    const form = container.querySelector('#song-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const songId = container.querySelector('#form-song-id').value;
      const id = songId || `music_${Date.now()}`;
      const title = container.querySelector('#form-song-title').value.trim();
      const pinyin = container.querySelector('#form-song-pinyin').value.trim();
      const titleVi = container.querySelector('#form-song-title-vi').value.trim();
      const artist = container.querySelector('#form-song-artist').value.trim();
      const category = container.querySelector('#form-song-category').value.trim() || 'Pop, Ballad';
      const youtubeUrl = container.querySelector('#form-song-youtube').value.trim();
      const lyricsRaw = container.querySelector('#form-song-lyrics-raw').value;

      const parsedLyrics = parseLyricsInput(lyricsRaw);

      if (parsedLyrics.length === 0) {
        alert('Vui lòng nhập lời bài hát tiếng Trung!');
        return;
      }

      const songObj = {
        id,
        title,
        pinyin,
        titleVi,
        artist,
        category,
        duration: editingSong?.duration || '4:15',
        youtubeUrl,
        coverIcon: editingSong?.coverIcon || '🎵',
        lyrics: parsedLyrics
      };

      saveSongToStorage(songObj);
      isDrawerOpen = false;
      editingSong = null;
      currentSong = songObj;
      renderView();
    });
  } // end bindEvents

  renderView();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
