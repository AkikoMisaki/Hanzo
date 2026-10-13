// Web Speech API (Phát âm TTS & Nhận dạng Giọng nói Tiếng Trung zh-CN)

// 1. Phân mục phát âm Text-to-Speech (TTS)
export function speakChinese(text, rate = 0.85, onEndCallback = null) {
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn chưa hỗ trợ Web Speech Synthesis phát âm.');
    return;
  }

  // Hủy lời nói cũ nếu đang phát
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate; // Tốc độ phát âm (0.85 cho người học dễ nghe)
  utterance.pitch = 1.0;

  // Lấy danh sách giọng đọc tiếng Trung tốt nhất
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN') || v.name.includes('Chinese'));
  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
}

// 2. Phân mục Nhận dạng Giọng nói (Speech Recognition - Speaking Skill)
export class ChineseSpeechRecognizer {
  constructor(onResultCallback, onErrorCallback, onStatusChange) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = null;
    this.onResult = onResultCallback;
    this.onError = onErrorCallback;
    this.onStatus = onStatusChange;
    this.isListening = false;

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatus) this.onStatus('listening');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStatus) this.onStatus('stopped');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        if (this.onResult) {
          this.onResult({ transcript, confidence });
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.onError) {
          this.onError(event.error);
        }
      };
    }
  }

  start() {
    if (!this.isSupported) {
      if (this.onError) this.onError('Trình duyệt chưa hỗ trợ Nhận diện Giọng nói.');
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already started:', e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}

// 3. Hàm so sánh độ tương đồng giọng đọc với từ tiêu chuẩn (Chấm điểm phát âm)
export function evaluatePronunciation(spokenText, targetHanzi, targetPinyin) {
  if (!spokenText) return { score: 0, feedback: 'Chưa nghe thấy giọng đọc. Hãy thử lại!' };

  const cleanSpoken = spokenText.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim();
  const cleanTarget = targetHanzi.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim();

  if (cleanSpoken === cleanTarget) {
    return {
      score: 100,
      feedback: '🎉 Xuất sắc! Phát âm cực kỳ chuẩn xác!',
      isPass: true
    };
  }

  if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
    return {
      score: 85,
      feedback: `👍 Rất tốt! Bạn đọc: "${spokenText}". Gần như chính xác!`,
      isPass: true
    };
  }

  return {
    score: 50,
    feedback: `💡 Bạn đọc là "${spokenText}". Hãy nghe lại mẫu và thử phát âm rõ ràng hơn nhé!`,
    isPass: false
  };
}

const MIC_DEVICE_ID_STORAGE_KEY = 'hanzo_selected_mic_device_id';
let globalMicStream = null;

// Lấy Device ID của Microphone đã được cài đặt chọn
export function getSelectedMicrophoneDeviceId() {
  try {
    return localStorage.getItem(MIC_DEVICE_ID_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

// Lưu cài đặt Device ID của Microphone được chọn
export function setSelectedMicrophoneDeviceId(deviceId) {
  try {
    if (deviceId) {
      localStorage.setItem(MIC_DEVICE_ID_STORAGE_KEY, deviceId);
    } else {
      localStorage.removeItem(MIC_DEVICE_ID_STORAGE_KEY);
    }
  } catch (e) {}
}

// Liệt kê danh sách thiết bị Microphone đang kết nối
export async function getAvailableMicrophones() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    return audioInputs.map((d, index) => ({
      deviceId: d.deviceId,
      label: d.label || `Microphone ${index + 1} (${d.deviceId ? d.deviceId.slice(0, 8) + '...' : 'Thiết bị mặc định'})`
    }));
  } catch (err) {
    console.warn('Lỗi khi truy vấn danh sách Microphone:', err);
    return [];
  }
}

// 4. Hàm yêu cầu cấp quyền Micro chủ động & Duy trì Stream để trình duyệt cấp quyền mặc định liên tục
// Giúp người dùng khi truy cập trang Luyện Nói KHÔNG CẦN CẤP QUYỀN LẠI MỖI LẦN PHÁT ÂM
export async function requestMicrophonePermission(forceDeviceId = null) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { success: false, reason: 'Trình duyệt không hỗ trợ MediaDevices' };
  }

  const targetDeviceId = forceDeviceId !== null ? forceDeviceId : getSelectedMicrophoneDeviceId();

  // Nếu stream đang active và khớp với thiết bị yêu cầu, tái sử dụng trực tiếp
  if (globalMicStream && globalMicStream.active) {
    const activeTrack = globalMicStream.getAudioTracks()[0];
    if (activeTrack && activeTrack.readyState === 'live') {
      const settings = activeTrack.getSettings ? activeTrack.getSettings() : {};
      if (!targetDeviceId || settings.deviceId === targetDeviceId) {
        return { success: true, stream: globalMicStream };
      }
    }
    // Dừng track cũ để mở stream thiết bị mới
    globalMicStream.getTracks().forEach(track => track.stop());
    globalMicStream = null;
  }

  const audioConstraints = targetDeviceId
    ? { deviceId: { exact: targetDeviceId } }
    : true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
    globalMicStream = stream;
    window._globalActiveMicStream = stream;

    // Lưu thiết bị mặc định nếu chưa lưu
    const track = stream.getAudioTracks()[0];
    if (track && track.getSettings) {
      const settings = track.getSettings();
      if (settings.deviceId && !getSelectedMicrophoneDeviceId()) {
        setSelectedMicrophoneDeviceId(settings.deviceId);
      }
    }

    return { success: true, stream };
  } catch (err) {
    console.warn('Không thể mở micro với constraint thiết bị cụ thể, thử lại với micro mặc định:', err);
    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      globalMicStream = fallbackStream;
      window._globalActiveMicStream = fallbackStream;
      return { success: true, stream: fallbackStream };
    } catch (fallbackErr) {
      console.error('Yêu cầu quyền truy cập micro bị từ chối:', fallbackErr);
      return { success: false, error: fallbackErr };
    }
  }
}

// 5. Hàm kiểm tra âm lượng Micro trực tiếp (Visualizer Test)
export function testMicrophoneVolume(onVolumeCallback, durationMs = 5000) {
  return requestMicrophonePermission().then(res => {
    if (!res.success || !res.stream) return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(res.stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let isTesting = true;

      const checkVolume = () => {
        if (!isTesting) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((average / 128) * 100));
        if (onVolumeCallback) onVolumeCallback(volumePercent);
        requestAnimationFrame(checkVolume);
      };

      checkVolume();

      const stopTest = () => {
        isTesting = false;
        try { audioCtx.close(); } catch (e) {}
      };

      if (durationMs > 0) {
        setTimeout(stopTest, durationMs);
      }

      return stopTest;
    } catch (err) {
      console.warn('Lỗi khi kiểm tra âm lượng micro:', err);
      return null;
    }
  });
}




