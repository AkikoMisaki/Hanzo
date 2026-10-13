// Hanzi Writer & Canvas Tracing Pad (Luyện viết nét Hán tự - Module Viết)

export class HanziPracticePad {
  constructor(canvasContainerId, writerContainerId) {
    this.canvasContainerId = canvasContainerId;
    this.writerContainerId = writerContainerId;
    this.canvasContainer = typeof canvasContainerId === 'string' ? document.getElementById(canvasContainerId) : canvasContainerId;
    this.writerContainer = typeof writerContainerId === 'string' ? document.getElementById(writerContainerId) : writerContainerId;
    this.writerInstance = null;
    this.writerInstances = [];
    this.isDrawing = false;
    this.canvas = null;
    this.ctx = null;
    this.drawnStrokes = 0;
  }

  // Khởi tạo Hanzi Writer xem thứ tự nét vẽ (Stroke Order Animation) cho 1 hoặc nhiều chữ Hán
  renderWriter(characterString, width = 180, height = 180, retryCount = 0) {
    if (!this.writerContainer && this.writerContainerId) {
      this.writerContainer = document.getElementById(this.writerContainerId);
    }
    if (!this.writerContainer) return;

    // Nếu script CDN HanziWriter chưa tải xong, đợi và thử lại tối đa 3 lần
    if (!window.HanziWriter && retryCount < 3) {
      setTimeout(() => {
        this.renderWriter(characterString, width, height, retryCount + 1);
      }, 400);
      return;
    }

    this.writerContainer.innerHTML = '';
    this.writerInstances = [];

    if (!characterString) return;

    // Tách chuỗi thành các chữ Hán đơn lẻ (loại bỏ khoảng trắng thừa)
    const chars = Array.from(String(characterString).trim()).filter(c => c.trim().length > 0);
    if (chars.length === 0) return;

    // Tạo flex container chứa các ô chữ Hán
    const flexWrapper = document.createElement('div');
    flexWrapper.className = 'hanzi-writer-multi-wrapper flex flex-wrap items-center justify-center gap-4 py-2 w-full';
    this.writerContainer.appendChild(flexWrapper);

    chars.forEach((char) => {
      // Ô chứa cho từng ký tự
      const charCard = document.createElement('div');
      charCard.className = 'char-writer-card bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative transition-transform hover:scale-102';

      const targetBox = document.createElement('div');
      targetBox.className = 'writer-char-target flex items-center justify-center';
      targetBox.style.width = `${width}px`;
      targetBox.style.height = `${height}px`;

      const charLabel = document.createElement('div');
      charLabel.className = 'char-label text-xs font-bold text-slate-500 mt-2 tracking-widest';
      charLabel.textContent = char;

      charCard.appendChild(targetBox);
      charCard.appendChild(charLabel);
      flexWrapper.appendChild(charCard);

      if (window.HanziWriter) {
        try {
          const writer = window.HanziWriter.create(targetBox, char, {
            width: width,
            height: height,
            padding: 12,
            strokeColor: '#C41E24', // Màu đỏ Hán ngữ chuẩn sắc nét
            radicalColor: '#C41E24', // Nét vẽ chữ Hán hiển thị toàn bộ màu đỏ
            outlineColor: '#CBD5E1', // Viền nét xám nhạt Mễ tự cách
            showOutline: true,
            showCharacter: true, // HIỂN THỊ CHỮ NGAY KHI TẢI (TRÁNH BỊ TRẮNG KHUNG)
            strokeAnimationSpeed: 1.2,
            delayBetweenStrokes: 200,
            onLoadCharDataSuccess: () => {
              // Tự động phát hoạt ảnh nét vẽ ngay khi dữ liệu JSON nét chữ tải xong
              try { writer.animateCharacter(); } catch (err) {}
            },
            onLoadCharDataError: (err) => {
              console.warn(`Không tải được nét vẽ cho chữ "${char}":`, err);
              this.renderFallbackBox(targetBox, char, width, height);
            }
          });
          this.writerInstances.push({ writer, char, targetBox });
        } catch (e) {
          console.warn('HanziWriter create exception:', e);
          this.renderFallbackBox(targetBox, char, width, height);
        }
      } else {
        // Fallback nếu không có thư viện HanziWriter CDN
        this.renderFallbackBox(targetBox, char, width, height);
      }
    });
  }

  animateStrokes() {
    if (!this.writerInstances || this.writerInstances.length === 0) return;

    // Chạy hoạt ảnh vẽ nét tuần tự cho từng chữ Hán
    let chain = Promise.resolve();
    this.writerInstances.forEach(item => {
      if (item.writer && typeof item.writer.animateCharacter === 'function') {
        chain = chain.then(() => {
          return new Promise(resolve => {
            item.writer.animateCharacter({
              onComplete: resolve
            });
          });
        });
      }
    });
  }

  showHint() {
    if (this.writerInstances && this.writerInstances.length > 0) {
      this.writerInstances.forEach(item => {
        if (item.writer && typeof item.writer.quiz === 'function') {
          item.writer.quiz();
        }
      });
    }
  }

  // Tạo Canvas tập vẽ bằng nét cọ màu đỏ/vàng trên lưới chữ Mễ (米字格)
  initCanvas(width = 260, height = 260) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'hanzi-canvas-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;

    // Canvas hiển thị khung chữ Mễ (米字格)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    bgCanvas.style.position = 'absolute';
    bgCanvas.style.top = '0';
    bgCanvas.style.left = '0';
    bgCanvas.style.pointerEvents = 'none';
    this.drawMiZiGeGrid(bgCanvas.getContext('2d'), width, height);

    // Canvas chính cho người dùng vẽ
    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = width;
    drawCanvas.height = height;
    drawCanvas.style.position = 'absolute';
    drawCanvas.style.top = '0';
    drawCanvas.style.left = '0';
    drawCanvas.style.cursor = 'crosshair';
    drawCanvas.style.borderRadius = '12px';

    wrapper.appendChild(bgCanvas);
    wrapper.appendChild(drawCanvas);
    this.canvasContainer.appendChild(wrapper);

    this.canvas = drawCanvas;
    this.ctx = drawCanvas.getContext('2d');
    this.setupEvents();
  }

  drawMiZiGeGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.25)'; // Màu khung đỏ Mễ tự cách
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Đường chéo chính & phụ
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Khung viền ngoài
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
    ctx.strokeRect(0, 0, w, h);
  }

  setupEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.strokeStyle = '#F59E0B'; // Nét cọ màu hổ phách / vàng kim
      this.ctx.lineWidth = 8;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const stopDraw = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.drawnStrokes += 1;
      }
    };

    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mouseup', stopDraw);
    this.canvas.addEventListener('mouseleave', stopDraw);

    this.canvas.addEventListener('touchstart', startDraw);
    this.canvas.addEventListener('touchmove', draw);
    this.canvas.addEventListener('touchend', stopDraw);
  }

  clearCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawnStrokes = 0;
    }
  }

  // Khung vẽ MiZiGe (米字格) fallback hiển thị chữ khi không tải được nét động
  renderFallbackBox(containerEl, char, width, height) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    containerEl.style.position = 'relative';

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    bgCanvas.style.position = 'absolute';
    bgCanvas.style.top = '0';
    bgCanvas.style.left = '0';
    this.drawMiZiGeGrid(bgCanvas.getContext('2d'), width, height);

    const textEl = document.createElement('div');
    textEl.style.position = 'absolute';
    textEl.style.top = '0';
    textEl.style.left = '0';
    textEl.style.width = `${width}px`;
    textEl.style.height = `${height}px`;
    textEl.style.display = 'flex';
    textEl.style.alignItems = 'center';
    textEl.style.justifyContent = 'center';
    textEl.style.fontSize = `${width * 0.55}px`;
    textEl.style.fontFamily = '"Noto Sans SC", "KaiTi", "SimSun", sans-serif';
    textEl.style.fontWeight = 'bold';
    textEl.style.color = '#C41E24';
    textEl.textContent = char;

    containerEl.appendChild(bgCanvas);
    containerEl.appendChild(textEl);
  }

  renderFallbackCharacter(char, width, height) {
    if (!this.writerContainer) return;
    this.renderFallbackBox(this.writerContainer, char, width, height);
  }
}

