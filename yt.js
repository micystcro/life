// 改為「每頁顯示多個卡片（預設每頁 2 張）」的滾動邏輯
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('timelineWrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const events = document.querySelectorAll('.timeline-event');
    const cards = document.querySelectorAll('.event-card');

    // 可調：每頁顯示幾張卡片（會根據視窗與卡片寬度自動調整）
    let itemsPerPage = 2;

    // 取得單個卡片的完整寬度（含 margin）
    function getItemFullWidth(el) {
        const style = window.getComputedStyle(el);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        return el.offsetWidth + marginLeft + marginRight;
    }

    function scrollTimeline(direction) {
        if (!wrapper || events.length === 0) return;

        const example = events[0];
        const itemFullW = getItemFullWidth(example);
        const scrollAmount = itemFullW * itemsPerPage;

        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        let target = wrapper.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
        target = Math.max(0, Math.min(maxScroll, target));

        wrapper.scrollTo({ left: target, behavior: 'smooth' });

        // 可選：避免頁面本身跟著跳動（若之前已遇到此問題）
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // 根據 wrapper 可視寬度與單一項目的寬度，自動調整每頁顯示數量
    function updateItemsPerPage() {
        if (!wrapper || events.length === 0) return;
        const example = events[0];
        const itemFullW = getItemFullWidth(example);
        // 計算一頁可以放幾個完整卡片
        const fit = Math.floor(wrapper.clientWidth / itemFullW) || 1;
        // 限制最大為 2（如需更大可改這個值）
        itemsPerPage = Math.min(2, Math.max(1, fit));
    }

    // 綁定按鈕事件
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); scrollTimeline('left'); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); scrollTimeline('right'); });

    // 初始：滾回開頭
    if (wrapper) wrapper.scrollLeft = 0;

    // 初次設定每頁顯示張數，並在視窗變動時更新
    updateItemsPerPage();

    // --- 將 navigation 固定在視窗，但位置貼齊 wrapper（確保右按鈕可見） ---
    const nav = document.querySelector('.timeline-navigation');
    function positionNav() {
        if (!nav || !wrapper) return;
        // 水平偏移量（像素），用來把按鈕往外推
        const H_OFFSET = 60; // 可調整，正值會把按鈕往外側推

        // 優先使用時間軸線 (.timeline-line) 的可視區間來對齊按鈕
        const line = document.querySelector('.timeline-line');
        const wrapRect = wrapper.getBoundingClientRect();
        if (line) {
            const lineRect = line.getBoundingClientRect();
            // 計算時間軸線與 wrapper 的可視交集（避免用整條超長線造成 nav 過寬）
            const visLeft = Math.max(lineRect.left, wrapRect.left);
            const visRight = Math.min(lineRect.right, wrapRect.right);
            let visWidth = visRight - visLeft;
            if (visWidth < 0) visWidth = 0;

            // 擴展寬度以把按鈕推向外側，但不要超出視窗左右
            const winW = window.innerWidth || document.documentElement.clientWidth;
            let left = Math.max(0, visLeft - H_OFFSET);
            let width = Math.min(winW - left, visWidth + H_OFFSET * 2);

            nav.style.left = left + 'px';
            nav.style.width = width + 'px';

            // 垂直置中到時間軸線的中間位置
            const centerY = lineRect.top + (lineRect.height / 2);
            nav.style.top = centerY + 'px';
            nav.style.transform = 'translateY(-50%)';
            return;
        }

        // fallback：若沒找到 .timeline-line，使用 wrapper 位置
        const rect = wrapRect;
        const left = Math.max(0, rect.left - 28);
        const width = Math.min(window.innerWidth - left, rect.width + 56);
        nav.style.left = left + 'px';
        nav.style.width = width + 'px';
        const topPx = rect.top + rect.height * 0.35;
        nav.style.top = topPx + 'px';
        nav.style.transform = 'translateY(-50%)';
    }

    // 初次定位與 resize 時更新
    positionNav();
    window.addEventListener('resize', positionNav);

    // 根據 wrapper 與視窗寬度決定按鈕放置方式（側邊 or 下方）
    function updateNavPlacement() {
        if (!nav || !wrapper) return;
        // 加一點容差（左右各 20px）避免緊貼邊緣
        const fits = wrapper.clientWidth <= (window.innerWidth - 40);
        if (fits) {
            // 在視窗可容納 timeline 時，按鈕放在兩側
            nav.classList.remove('below');
            nav.classList.add('side');
            nav.style.position = 'fixed';
            positionNav();
        } else {
              // 當 timeline 比視窗寬，按鈕放在時間軸下方
              nav.classList.remove('side');
              nav.classList.add('below');
              // 使用 fixed 並把按鈕放在 wrapper 正下方（避免被 overflow:hidden 剪裁）
              const rect = wrapper.getBoundingClientRect();
              nav.style.position = 'fixed';
              nav.style.left = rect.left + 'px';
            // 放在 wrapper 底部下方（往上移一點，避免太遠）
            nav.style.top = (rect.bottom - 8) + 'px';
              nav.style.width = rect.width + 'px';
              nav.style.transform = 'none';
        }
    }

    // 初次決定與 resize 更新
    updateNavPlacement();
    window.addEventListener('resize', updateNavPlacement);

    // 卡片淡入效果：使用 IntersectionObserver 檢查卡片是否進入 wrapper 的可視範圍
    // 這比使用 window 的 bounding rect 更穩定，能正確處理水平滾動容器
    if ('IntersectionObserver' in window && wrapper) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, {
            root: wrapper,
            rootMargin: '0px',
            threshold: 0.1
        });

        cards.forEach(card => observer.observe(card));
    } else {
        // fallback: 使用簡單的檢查函式（若沒有 IntersectionObserver 或 wrapper 為 null）
        function checkCards() {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (rect.left < window.innerWidth - 50 && rect.right > 50) {
                    card.classList.add('show');
                }
            });
        }
        checkCards();
        if (wrapper) wrapper.addEventListener('scroll', checkCards);
    }

    // --- 在窄螢幕時禁止使用者以滑鼠/手勢左右拖動，仍保留按鈕可程式滾動 ---
    // 決定何時視為「窄螢幕」，可以調整此閾值
    const SMALL_WIDTH = 768;

    // 處理函式需為命名函式以便 add/remove
    function wheelHandler(e) {
        // 若是水平滾動或按住 shift 造成水平滾動，阻止預設行為
        if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
            e.preventDefault();
        }
    }

    function touchMoveHandler(e) {
        // 阻止橫向觸控滾動
        // 允許少量垂直捲動 (如果需要可以更進一步判斷手勢方向)
        e.preventDefault();
    }

    function updateUserScrollBehavior() {
        if (!wrapper) return;
        const isSmall = window.innerWidth <= SMALL_WIDTH;
        if (isSmall) {
            // 加上 listener（use passive: false 以便 preventDefault 有效）
            wrapper.addEventListener('wheel', wheelHandler, { passive: false });
            wrapper.addEventListener('touchmove', touchMoveHandler, { passive: false });
            // 也可禁止觸控的 pan 行為（部分瀏覽器）
            wrapper.style.touchAction = 'none';
        } else {
            wrapper.removeEventListener('wheel', wheelHandler);
            wrapper.removeEventListener('touchmove', touchMoveHandler);
            wrapper.style.touchAction = '';
        }
    }

    // 初次設定，並在視窗大小改變時更新（包含每頁顯示數量與使用者滾動行為）
    updateUserScrollBehavior();
    updateItemsPerPage();
    window.addEventListener('resize', () => {
        updateUserScrollBehavior();
        updateItemsPerPage();
    });
});
