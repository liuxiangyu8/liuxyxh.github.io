async function loadConfig() {
    try {
        const response = await fetch('data/config.json');
        const config = await response.json();

        // 设置SEO信息
        document.title = config.seo.record.title;
        document.querySelector('meta[name="description"]').content = config.seo.record.description;
        document.querySelector('meta[name="keywords"]').content = config.seo.record.keywords;

        // 设置导航栏
        const navbarBrand = document.getElementById('navbarBrand');
        navbarBrand.innerHTML = config.site.logo;

        const navbarMenu = document.getElementById('navbarMenu');
        navbarMenu.innerHTML = '';
        config.navigation.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                        <a class="nav-link" href="${item.url}">${item.name}</a>
                    `;
            navbarMenu.appendChild(li);
        });

        // 设置页脚
        document.getElementById('footerName').textContent = config.footer.name;
        document.getElementById('footerDescription').textContent = config.footer.description;
        document.getElementById('footerCopyright').textContent = config.footer.copyright;
    } catch (error) {
        console.error('加载配置失败:', error);
    }
}

// 搜索电影
function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// 键盘搜索
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('videoHistory') || '[]');

        const historyContainer = document.getElementById('historyContainer');
        const emptyState = document.getElementById('emptyState');

        if (history.length === 0) {
            historyContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        // 按日期分组历史记录
        const groupedHistory = groupHistoryByDay(history);

        // 创建时间轴容器
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';

        // 添加时间轴线
        const timelineLine = document.createElement('div');
        timelineLine.className = 'timeline-line';
        timelineContainer.appendChild(timelineLine);

        // 按天渲染历史记录
        Object.keys(groupedHistory).forEach(dateKey => {
            const dayItems = groupedHistory[dateKey];

            // 创建每天的时间轴项
            const timelineDay = document.createElement('div');
            timelineDay.className = 'timeline-day';

            // 创建日期标题
            const dayHeader = document.createElement('div');
            dayHeader.className = 'timeline-day-header';
            dayHeader.textContent = formatDate(dateKey);
            timelineDay.appendChild(dayHeader);

            // 创建内容容器
            const timelineContent = document.createElement('div');
            timelineContent.className = 'timeline-content';

            // 添加当天的历史记录
            dayItems.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                const videoPlatform = getVideoPlatform(item.url);
                timelineItem.innerHTML = `
                            <div class="card h-100" style="background: rgba(255, 255, 255, 0.05); border: none; border-radius: 12px; overflow: hidden;">
                                <img src="${item.poster || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=movie%20poster%20placeholder&image_size=square'}" 
                                     alt="${item.title}" class="card-img-top" style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title" style="color: white; font-size: 1rem; margin-bottom: 10px;">${item.title || 'VIP解析'}</h5>
                                    <p class="text-white" style="font-size: 0.8rem;">来源：<a href="${item.url}" target="_blank">${ videoPlatform }</a></p>
                                    <p class="text-white" style="font-size: 0.7rem;">${new Date(item.timestamp).toLocaleTimeString('zh-CN')}</p>
                                    <button class="btn btn-warning btn-sm w-100 mt-2" onclick="playVideo('${item.source}','${item.url}', '${item.id}')">
                                        <i class="bi bi-play-circle-fill"></i> 继续观看
                                    </button>
                                </div>
                            </div>
                        `;
                timelineContent.appendChild(timelineItem);
            });

            timelineDay.appendChild(timelineContent);
            timelineContainer.appendChild(timelineDay);
        });

        historyContainer.innerHTML = '';
        historyContainer.appendChild(timelineContainer);
        emptyState.style.display = 'none';
    } catch (error) {
        console.error('加载历史记录失败:', error);
    }
}

//根据视频url判断来源视频平台
function getVideoPlatform(url) {
    if (url.includes('iqiyi.com')) {
        return '爱奇艺';
    } 
    else if (url.includes('v.qq.com')) {
        return '腾讯视频';
    }
    else if (url.includes('youku.com')) {
        return '优酷';
    }
    else if (url.includes('mgtv.com')) {
        return '芒果TV';
    }
    else if (url.includes('bilibili.com')) {
        return '哔哩哔哩';
    }
    else {
        return '未知';
    }
}

// 按日期分组历史记录
function groupHistoryByDay(history) {
    const grouped = {};

    history.forEach(item => {
        const date = new Date(item.timestamp);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(item);
    });

    return grouped;
}

// 格式化日期显示
function formatDate(dateKey) {
    const date = new Date(dateKey);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    if (dateKey === today) {
        return '今天';
    } else if (dateKey === yesterdayKey) {
        return '昨天';
    } else {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    }
}

function playVideo(source, url, id) {
    // 检查来源是否为网站
    if (source === "website") {
        location.href = `player.html?id=${encodeURIComponent(id)}`;
    } else {
        location.href = `vip.html?url=${encodeURIComponent(url)}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadHistory();
});