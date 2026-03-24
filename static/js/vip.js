let parseApis = [];


// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function loadParseApis() {
    fetch('data/parse_apis.json')
        .then(response => response.json())
        .then(data => {
            parseApis = data;
            populateApiSelect();
        })
        .catch(error => {
            console.error('加载解析接口失败:', error);
            alert('加载解析接口失败，请刷新页面重试');
        });
}

function populateApiSelect() {
    const select = document.getElementById('parseApi');
    select.innerHTML = '<option value="">请选择解析接口</option>';

    parseApis.forEach(api => {
        const option = document.createElement('option');
        option.value = api.id;
        option.textContent = api.name;
        // 默认选中默认接口
        if (api.id === 'default') {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function setupParseButton() {
    const parseBtn = document.getElementById('parseBtn');
    parseBtn.addEventListener('click', function () {
        const videoUrl = document.getElementById('videoUrl').value.trim();
        const apiId = document.getElementById('parseApi').value;

        if (!videoUrl) {
            alert('请输入视频链接');
            return;
        }

        if (!apiId) {
            alert('请选择解析接口');
            return;
        }

        parseVideo(videoUrl, apiId);
    });
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

function parseVideo(videoUrl, apiId) {
    const api = parseApis.find(a => a.id === apiId);
    // console.log(api);
    if (!api) return;

    const modal = new bootstrap.Modal(document.getElementById('parseModal'));
    modal.show();

    document.getElementById('parseLoading').style.display = 'block';
    document.getElementById('parseResult').style.display = 'none';
    document.getElementById('parseError').style.display = 'none';

    setTimeout(() => {
        const encodedUrl = encodeURIComponent(videoUrl);
        const playerUrl = api.url.replace('{url}', encodedUrl);

        document.getElementById('videoPlayer').src = playerUrl;
        document.getElementById('parseLoading').style.display = 'none';
        document.getElementById('parseResult').style.display = 'block';

        // 监听iframe加载完成事件
        document.getElementById('videoPlayer').addEventListener('load', () => {
            // console.log('视频加载完成');
            saveVideoHistory(videoUrl);
        });

        // 监听页面关闭事件
        window.addEventListener('beforeunload', () => {
            saveVideoHistory(videoUrl);
        });
    }, 1000);
}


// 保存视频播放历史
function saveVideoHistory(videoUrl) {
    if (!videoUrl) return;

    const historyItem = {
        url: videoUrl,
        source: "vip",
        timestamp: new Date().getTime()
    };

    // 获取现有历史记录
    let history = JSON.parse(localStorage.getItem('videoHistory') || '[]');

    // 添加到历史记录开头
    history.unshift(historyItem);

    // 最多保存50条记录
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    // 保存到localStorage
    localStorage.setItem('videoHistory', JSON.stringify(history));
}

function setupCopyLinkButton() {
    const copyBtn = document.getElementById('copyLinkBtn');
    copyBtn.addEventListener('click', function () {
        const playerUrl = document.getElementById('videoPlayer').src;
        navigator.clipboard.writeText(playerUrl).then(() => {
            alert('播放链接已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        });
    });
}

function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
    }
}
async function loadConfig() {
    try {
        const response = await fetch('data/config.json');
        const config = await response.json();

        // 设置SEO信息
        document.title = config.seo.vip.title;
        document.querySelector('meta[name="description"]').content = config.seo.vip.description;
        document.querySelector('meta[name="keywords"]').content = config.seo.vip.keywords;

        // 设置导航栏
        const navbarBrand = document.getElementById('navbarBrand');
        navbarBrand.innerHTML = config.site.logo;

        const navbarMenu = document.getElementById('navbarMenu');
        navbarMenu.innerHTML = '';
        config.navigation.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            const isActive = item.url === 'vip.html';
            li.innerHTML = `
                        <a class="nav-link ${isActive ? 'active' : ''}" href="${item.url}">${item.name}</a>
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

async function loadVideoUrl() {
    let url = getUrlParam('url');
    // console.log(url);

    if (url) {
        document.getElementById('videoUrl').value = url.trim();
        parseVideo(url, 'default');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadConfig();
    loadParseApis();
    setupParseButton();
    setupCopyLinkButton();
    //自动加载视频url
    setTimeout(() => {
        loadVideoUrl();
    }, 500);
});
