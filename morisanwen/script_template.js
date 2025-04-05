// 生成选集按钮
const episodesContainer = document.getElementById('episodes-container');
const video = document.getElementById('video');

// ===修改这里：动漫集数===
const totalEpisodes = 12; // 修改为动漫的总集数

let currentEpisode = 1;
let hls = null; // 创建全局Hls实例变量

// ===修改这里：视频资源路径===
const baseUrl = './resource/【资源文件夹名】/'; // 修改为动漫资源所在的目录

// 将变量暴露给全局作用域，供下载功能使用
window.baseUrl = baseUrl;
window.totalEpisodes = totalEpisodes;

// 生成选集按钮
for (let i = 1; i <= totalEpisodes; i++) {
    const button = document.createElement('div');
    button.className = 'episode-btn';
    button.textContent = `第${i}集`;
    button.dataset.episode = i;
    
    // 默认第一集为激活状态
    if (i === 1) {
        button.classList.add('active');
    }
    
    // 点击事件 - 切换视频
    button.addEventListener('click', function() {
        // 如果点击当前集数，不做任何操作
        if (currentEpisode === parseInt(this.dataset.episode)) {
            return;
        }
        
        // 移除所有激活状态
        document.querySelectorAll('.episode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 设置当前按钮激活
        this.classList.add('active');
        
        // 更新当前集数
        currentEpisode = parseInt(this.dataset.episode);
        
        // 加载视频
        loadVideo(currentEpisode);
    });
    
    episodesContainer.appendChild(button);
}

// 加载视频函数
function loadVideo(episode) {
    console.log(`加载第${episode}集...`); // 调试信息
    const videoUrl = `${baseUrl}${episode}.m3u8`;
    
    // 使用 Hls.js 播放 m3u8 视频
    if (Hls.isSupported()) {
        // 销毁之前的hls实例，防止内存泄漏和冲突
        if (hls) {
            hls.destroy();
        }
        
        // 创建新的hls实例
        hls = new Hls({
            debug: false,
            // 添加额外的加载重试配置
            maxLoadingRetry: 4,
            maxBufferLength: 30
        });
        
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            // 确保视频开始播放
            video.play().catch(e => console.error('自动播放失败:', e));
        });
        
        // 错误处理
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('视频加载错误:', data);
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('网络错误, 尝试恢复...');
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('媒体错误, 尝试恢复...');
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error('无法恢复的错误');
                        hls.destroy();
                        hls = null;
                        break;
                }
            }
        });
    } 
    // 对于原生支持HLS的浏览器（如Safari）
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.load(); // 确保重新加载
        video.addEventListener('loadedmetadata', function() {
            video.play().catch(e => console.error('自动播放失败:', e));
        });
    } else {
        console.error('您的浏览器不支持HLS视频播放');
    }
    
    // 更新页面标题
    const animeTitle = document.querySelector('.anime-title').textContent;
    document.title = `第${episode}集 - ${animeTitle} - 五星动漫网`;
}

// 初始加载第一集
loadVideo(currentEpisode);

// 视频结束后自动播放下一集
video.addEventListener('ended', function() {
    if (currentEpisode < totalEpisodes) {
        currentEpisode++;
        
        // 更新按钮状态
        document.querySelectorAll('.episode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.episode) === currentEpisode) {
                btn.classList.add('active');
            }
        });
        
        // 加载下一集
        loadVideo(currentEpisode);
    }
});

// 模态窗口控制
const modal = document.getElementById("detailsModal");
const detailsButton = document.getElementById("detailsButton");
const closeButton = document.querySelector(".close-button");

// 点击详情按钮打开模态窗口
detailsButton.addEventListener("click", function(e) {
    e.preventDefault();
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // 防止背景滚动
});

// 点击关闭按钮关闭模态窗口
closeButton.addEventListener("click", function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // 恢复背景滚动
});

// 点击模态窗口外部关闭
window.addEventListener("click", function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

// 按ESC键关闭模态窗口
window.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && modal.style.display === "block") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}); 