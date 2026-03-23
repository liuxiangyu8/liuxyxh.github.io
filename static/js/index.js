let movies = [];
let filteredMovies = [];
let currentCategory = 'all';

// 加载电影数据
async function loadMovies() {
    try {
        const response = await fetch('data/movies.json');
        const data = await response.json();
        movies = data.movies;
        filteredMovies = movies;
        //增加URL参数判断，从Url获取的搜索关键词
        const searchParams = new URLSearchParams(window.location.search);
        const searchKeywords = searchParams.get('search');
        if (searchKeywords) {
            document.getElementById('searchInput').value = searchKeywords;
            searchMovies();
        }
        else {
            renderMovies();
        }
    } catch (error) {
        console.error('加载电影数据失败:', error);
        document.getElementById('moviesContainer').innerHTML = '<div class="loading">加载失败，请稍后重试</div>';
    }
}

// 渲染电影列表
function renderMovies() {
    const container = document.getElementById('moviesContainer');

    if (filteredMovies.length === 0) {
        container.innerHTML = '<div class="loading">没有找到相关电影</div>';
        return;
    }

    const movieCards = filteredMovies.map(movie => `
        <div class="col-md-3 mb-4">
            <div class="movie-card" onclick="playMovie('${movie.id}')">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h5 class="movie-title">${movie.title}</h5>
                    <p class="movie-year">${movie.year} · ${movie.genre.join(' / ')}</p>
                    <div class="movie-rating">
                        <i class="bi bi-star-fill"></i>
                        <span>${movie.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = movieCards;
}

// 搜索电影
function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (searchTerm.trim() === '') {
        filteredMovies = movies;
    } else {
        filteredMovies = movies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.originalTitle.toLowerCase().includes(searchTerm) ||
            movie.director.toLowerCase().includes(searchTerm) ||
            movie.actors.some(actor => actor.toLowerCase().includes(searchTerm))
        );
    }
    renderMovies();
}

// 按分类筛选电影
function filterMovies(category) {
    // 更新标签状态
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    currentCategory = category;

    if (category === 'all') {
        filteredMovies = movies;
    } else {
        filteredMovies = movies.filter(movie => movie.genre.includes(category));
    }

    renderMovies();
}

// 播放电影
function playMovie(movieId) {
    window.location.href = `player.html?id=${movieId}`;
}
async function loadConfig() {
    try {
        const response = await fetch('data/config.json');
        const config = await response.json();

        // 设置SEO信息
        document.title = config.seo.index.title;
        document.querySelector('meta[name="description"]').content = config.seo.index.description;
        document.querySelector('meta[name="keywords"]').content = config.seo.index.keywords;

        // 设置导航栏
        const navbarBrand = document.getElementById('navbarBrand');
        navbarBrand.innerHTML = config.site.logo;

        const navbarMenu = document.getElementById('navbarMenu');
        navbarMenu.innerHTML = '';
        config.navigation.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            const isActive = item.url === 'index.html';
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


// 键盘搜索
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// 页面加载完成后加载电影数据

document.addEventListener('DOMContentLoaded', function () {
    loadConfig();
    loadMovies();

});

