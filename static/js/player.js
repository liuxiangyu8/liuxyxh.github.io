let currentMovie = null;
let allMovies = [];
let videoPlayer = null;

// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 加载电影数据
async function loadMovieData() {
    try {
        const response = await fetch('data/movies.json');
        const data = await response.json();
        allMovies = data.movies;
        
        const movieId = getUrlParam('id');
        const videoUrl = getUrlParam('url');
        const videoTitle = getUrlParam('title');
        const videoPoster = getUrlParam('poster');
        
        if (movieId) {
            currentMovie = allMovies.find(movie => movie.id === movieId);
            if (currentMovie) {
                renderMovieInfo();
                renderRecommendedMovies();
            } else {
                document.getElementById('movieInfo').innerHTML = '<div class="loading">电影不存在</div>';
            }
        } else if (videoUrl && videoTitle) {
            currentMovie = {
                title: decodeURIComponent(videoTitle),
                video: decodeURIComponent(videoUrl),
                cover: videoPoster ? decodeURIComponent(videoPoster) : '',
                description: '',
                synopsis: ''
            };
            renderMovieInfo();
            document.getElementById('recommendedContainer').innerHTML = '<div class="loading">暂无推荐</div>';
        } else {
            document.getElementById('movieInfo').innerHTML = '<div class="loading">请选择电影</div>';
        }
    } catch (error) {
        console.error('加载电影数据失败:', error);
        document.getElementById('movieInfo').innerHTML = '<div class="loading">加载失败，请稍后重试</div>';
    }
}

// 渲染电影信息
function renderMovieInfo() {
    let movieInfoHtml = `
        <h1 class="movie-title">${currentMovie.title}</h1>
    `;
    
    if (currentMovie.originalTitle) {
        movieInfoHtml += `<p class="movie-subtitle">${currentMovie.originalTitle}</p>`;
    }
    
    if (currentMovie.rating || currentMovie.year || currentMovie.duration || currentMovie.genre) {
        movieInfoHtml += '<div class="movie-meta">';
        if (currentMovie.rating) {
            movieInfoHtml += `
                <div class="meta-item">
                    <span class="rating"><i class="bi bi-star-fill"></i> ${currentMovie.rating}</span>
                </div>
            `;
        }
        if (currentMovie.year) {
            movieInfoHtml += `
                <div class="meta-item">
                    <span>${currentMovie.year}</span>
                </div>
            `;
        }
        if (currentMovie.duration) {
            movieInfoHtml += `
                <div class="meta-item">
                    <span>${currentMovie.duration}</span>
                </div>
            `;
        }
        if (currentMovie.genre) {
            movieInfoHtml += `
                <div class="meta-item">
                    ${currentMovie.genre.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                </div>
            `;
        }
        movieInfoHtml += '</div>';
    }
    
    if (currentMovie.director || currentMovie.actors) {
        movieInfoHtml += '<div class="cast-list">';
        if (currentMovie.director) {
            movieInfoHtml += `
                <div class="meta-item">
                    <strong>导演：</strong>
                    <span>${currentMovie.director}</span>
                </div>
            `;
        }
        if (currentMovie.actors) {
            movieInfoHtml += `
                <div class="meta-item">
                    <strong>主演：</strong>
                    ${currentMovie.actors.map(actor => `
                        <div class="cast-item">
                            <div class="cast-avatar">${actor.charAt(0)}</div>
                            <span>${actor}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        movieInfoHtml += '</div>';
    }
    
    if (currentMovie.description) {
        movieInfoHtml += `<p class="movie-description">${currentMovie.description}</p>`;
    }
    
    document.getElementById('movieInfo').innerHTML = movieInfoHtml;
    
    if (currentMovie.synopsis) {
        document.getElementById('synopsisContent').innerHTML = `<p>${currentMovie.synopsis}</p>`;
    } else {
        document.getElementById('synopsisContent').innerHTML = '<p>暂无简介</p>';
    }
    
    // 设置视频源 - 使用iframe和解析接口
    setupIframeVideoSource();
}

// 渲染推荐电影
function renderRecommendedMovies() {
    // 过滤出同类型的电影作为推荐
    const recommendedMovies = allMovies
        .filter(movie => movie.id !== currentMovie.id && 
            movie.genre.some(genre => currentMovie.genre.includes(genre)))
        .slice(0, 4);
    
    if (recommendedMovies.length === 0) {
        document.getElementById('recommendedContainer').innerHTML = '<div class="loading">暂无推荐</div>';
        return;
    }

    const recommendedHtml = recommendedMovies.map(movie => `
        <div class="col-md-3 mb-4">
            <div class="recommended-card" onclick="playMovie('${movie.id}')">
                <img src="${movie.poster}" alt="${movie.title}" class="recommended-poster">
                <div class="recommended-info">
                    <h5 class="recommended-title">${movie.title}</h5>
                    <p class="recommended-year">${movie.year}</p>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('recommendedContainer').innerHTML = recommendedHtml;
}

// 播放电影
function playMovie(movieId) {
    window.location.href = `player.html?id=${movieId}`;
}

// 搜索电影
function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// 键盘搜索
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});


 async function loadConfig() {
            try {
                const response = await fetch('data/config.json');
                const config = await response.json();
                
                // 设置SEO信息
                document.title = config.seo.player.title;
                document.querySelector('meta[name="description"]').content = config.seo.player.description;
                document.querySelector('meta[name="keywords"]').content = config.seo.player.keywords;
                
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

// 设置iframe视频源
async function setupIframeVideoSource() {
    try {
        // 从parse_apis.json获取默认接口
        const response = await fetch('data/parse_apis.json');
        const apis = await response.json();
        
        // 获取默认接口（第一个接口）
        const defaultApi = apis.find(api => api.id === 'default');
        const apiUrl = defaultApi.url;
        
        // 获取视频URL
        const videoUrl = currentMovie.url;
        
        // 组合视频URL和接口
        const iframeSrc = apiUrl.replace('{url}', encodeURIComponent(videoUrl));
        
        // 设置iframe的src属性
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = iframeSrc;
        
        // 监听iframe加载完成事件
        videoPlayer.addEventListener('load', () => {
            // console.log('视频加载完成');
            saveVideoHistory();
        });
        
        // 监听页面关闭事件
        window.addEventListener('beforeunload', () => {
            saveVideoHistory();
        });
    } catch (error) {
        console.error('设置视频源失败:', error);
        document.getElementById('movieInfo').innerHTML = '<div class="loading">视频加载失败，请稍后重试</div>';
    }
}

// 保存视频播放历史
function saveVideoHistory() {
    if (!currentMovie) return;
    
    // 获取视频URL
    const videoUrl = currentMovie.url ;
    
    const historyItem = {
        id: currentMovie.id,
        title: currentMovie.title,
        url: videoUrl,
        poster:  currentMovie.poster,
        source: "website",
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

// 页面加载完成后加载电影数据

document.addEventListener('DOMContentLoaded', function () {
    loadConfig();
    loadMovieData();

});