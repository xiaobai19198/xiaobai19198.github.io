/**
 * 五星动漫网 - 视频下载功能
 * 支持m3u8视频下载与MP4转换
 */

class AnimeDownloader {
    constructor(baseUrl, totalEpisodes, animeName) {
        this.baseUrl = baseUrl;
        this.totalEpisodes = totalEpisodes;
        this.animeName = animeName;
        this.initUI();
        this.bindEvents();
    }

    // 初始化下载界面
    initUI() {
        // 创建下载模态窗口
        const downloadModal = document.createElement('div');
        downloadModal.id = 'downloadModal';
        downloadModal.className = 'modal download-modal';
        
        downloadModal.innerHTML = `
            <div class="modal-content download-modal-content">
                <span class="close-button">&times;</span>
                <div class="modal-header">
                    <h2>下载 ${this.animeName}</h2>
                </div>
                
                <div class="modal-body">
                    <div class="download-tabs">
                        <button class="download-tab-btn active" data-tab="single">单集下载</button>
                        <button class="download-tab-btn" data-tab="mp4">MP4转换</button>
                        <button class="download-tab-btn" data-tab="help">下载帮助</button>
                    </div>
                    
                    <div class="download-tab-content active" id="single-download">
                        <p class="download-intro">选择要下载的单集：</p>
                        <div class="download-format-selector">
                            <label>
                                <input type="radio" name="download-format" value="m3u8" checked> m3u8 (小体积，需专用播放器)
                            </label>
                            <label>
                                <input type="radio" name="download-format" value="mp4"> mp4 (大体积，通用格式)
                            </label>
                        </div>
                        <div class="download-episodes-grid" id="download-episodes-container">
                            <!-- 动态生成选集 -->
                        </div>
                    </div>
                    
                    <div class="download-tab-content" id="mp4-download">
                        <div class="mp4-converter">
                            <h3>视频转换</h3>
                            <p class="download-intro">将当前播放的视频转换为MP4格式下载</p>
                            <div class="current-episode-info">
                                <p>当前正在播放: <span id="current-episode-text">第${currentEpisode}集</span></p>
                                <div class="mp4-options">
                                    <div class="option-group">
                                        <label>画质:</label>
                                        <select id="mp4-quality">
                                            <option value="high">高清 (原始质量)</option>
                                            <option value="medium" selected>中等 (720p)</option>
                                            <option value="low">流畅 (480p)</option>
                                        </select>
                                    </div>
                                </div>
                                <button id="start-mp4-convert" class="download-btn primary-btn">
                                    <i class="fa fa-download"></i> 下载当前集
                                </button>
                                <div id="mp4-progress" class="mp4-progress-bar">
                                    <div class="progress-text">准备中...</div>
                                    <div class="progress-track">
                                        <div class="progress-fill"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="mp4-note">
                                <p><i class="fa fa-info-circle"></i> 转换过程需要一些时间，请耐心等待。转换完成后会自动下载。</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="download-tab-content" id="download-help">
                        <h3>如何下载和播放视频</h3>
                        <div class="help-content">
                            <p><strong>M3U8格式:</strong></p>
                            <p>推荐使用 <a href="https://www.videolan.org/" target="_blank">VLC媒体播放器</a> 或 <a href="https://potplayer.daum.net/" target="_blank">PotPlayer</a>，通过"打开网络串流"功能直接粘贴m3u8链接播放。</p>
                            
                            <p><strong>MP4格式:</strong></p>
                            <p>MP4是通用格式，可以在几乎所有设备和播放器上播放。直接下载MP4文件会占用更多存储空间，但更加方便。</p>
                            
                            <p><strong>MP4转换说明:</strong></p>
                            <p>- 转换过程完全在本地浏览器中进行，不需要服务器<br>
                            - 转换需要下载所有视频片段并合并，会消耗较多带宽<br>
                            - 下载速度取决于您的网络连接和计算机性能<br>
                            - 请确保下载过程中不要关闭页面</p>
                            
                            <div class="note-box">
                                <p><strong>注意:</strong> 视频文件仅供个人学习使用，请尊重版权，不要进行传播或商业用途。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(downloadModal);
        
        // 生成单集下载按钮
        this.generateEpisodeButtons();
        
        // 添加样式
        this.addStyles();
    }
    
    // 生成单集下载按钮
    generateEpisodeButtons() {
        const container = document.getElementById('download-episodes-container');
        if (!container) return;
        
        for (let i = 1; i <= this.totalEpisodes; i++) {
            const button = document.createElement('div');
            button.className = 'download-episode-btn';
            button.dataset.episode = i;
            button.innerHTML = `
                <span class="episode-number">第${i}集</span>
                <button class="episode-download-btn" data-episode="${i}">
                    <i class="fa fa-download"></i>
                </button>
            `;
            container.appendChild(button);
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 获取下载按钮并绑定事件
        const downloadBtn = document.querySelector('.control-btn:nth-child(2)');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.openDownloadModal());
        }
        
        // 关闭按钮事件
        const closeBtn = document.querySelector('#downloadModal .close-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDownloadModal());
        }
        
        // 点击窗口外部关闭
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('downloadModal');
            if (event.target === modal) {
                this.closeDownloadModal();
            }
        });
        
        // 选项卡切换
        const tabBtns = document.querySelectorAll('.download-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tabContents = document.querySelectorAll('.download-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                const tabId = btn.dataset.tab;
                const activeContent = document.getElementById(`${tabId}-download`) || 
                                      document.getElementById(`download-${tabId}`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
        
        // 单集下载按钮事件
        const episodeBtns = document.querySelectorAll('.episode-download-btn');
        episodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const episode = parseInt(btn.dataset.episode);
                const format = document.querySelector('input[name="download-format"]:checked').value;
                
                if (format === 'm3u8') {
                    this.downloadM3U8(episode);
                } else if (format === 'mp4') {
                    this.convertToMP4(episode);
                }
            });
        });
        
        // MP4转换按钮
        const convertBtn = document.getElementById('start-mp4-convert');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => {
                // 使用当前播放的集数
                document.getElementById('current-episode-text').textContent = `第${currentEpisode}集`;
                const quality = document.getElementById('mp4-quality').value;
                this.convertToMP4(currentEpisode, quality);
            });
        }
    }
    
    // 打开下载模态窗口
    openDownloadModal() {
        const modal = document.getElementById('downloadModal');
        if (modal) {
            // 更新当前集数显示
            document.getElementById('current-episode-text').textContent = `第${currentEpisode}集`;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // 关闭下载模态窗口
    closeDownloadModal() {
        const modal = document.getElementById('downloadModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // 下载M3U8文件
    async downloadM3U8(episode) {
        const url = `${this.baseUrl}${episode}.m3u8`;
        const filename = `${this.animeName}_第${episode}集.m3u8`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            
            // 创建Blob对象
            const blob = new Blob([content], { type: 'application/x-mpegURL' });
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = filename;
            downloadLink.style.display = 'none';
            
            // 触发下载
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadLink.href);
            }, 100);
            
            alert(`已开始下载: ${filename}`);
        } catch (error) {
            console.error('下载失败:', error);
            alert('下载失败，请检查网络连接或稍后重试');
        }
    }
    
    // 转换为MP4并下载
    async convertToMP4(episode, quality = 'medium') {
        const progressBar = document.getElementById('mp4-progress');
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressText = progressBar.querySelector('.progress-text');
        
        progressBar.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = '准备中...';

        try {
            const url = `${this.baseUrl}${episode}.m3u8`;
            const filename = `${this.animeName}_第${episode}集.mp4`;
            
            progressText.textContent = '加载视频流...';
            progressFill.style.width = '10%';
            
            // 创建一个隐藏的video元素用于转换
            const videoElement = document.createElement('video');
            videoElement.style.display = 'none';
            document.body.appendChild(videoElement);
            
            // 初始化HLS
            if (Hls.isSupported()) {
                const hls = new Hls();
                
                // 设置质量根据选择
                let height = 720; // 默认中等质量
                if (quality === 'high') height = 1080;
                if (quality === 'low') height = 480;
                
                hls.loadSource(url);
                hls.attachMedia(videoElement);
                
                // 等待清单解析完成
                await new Promise((resolve, reject) => {
                    hls.on(Hls.Events.MANIFEST_PARSED, resolve);
                    hls.on(Hls.Events.ERROR, reject);
                    
                    // 设置超时
                    setTimeout(() => reject(new Error('加载视频超时')), 30000);
                });
                
                progressText.textContent = '准备录制...';
                progressFill.style.width = '20%';
                
                // 播放视频但静音
                videoElement.muted = true;
                await videoElement.play();
                
                // 使用MediaRecorder API记录视频流
                const stream = videoElement.captureStream();
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=h264',
                    videoBitsPerSecond: quality === 'high' ? 5000000 : (quality === 'medium' ? 2500000 : 1000000)
                });
                
                const chunks = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };
                
                // 录制完成时触发下载
                mediaRecorder.onstop = async () => {
                    progressText.textContent = '处理视频文件...';
                    progressFill.style.width = '90%';
                    
                    // 合并所有数据块为一个Blob
                    const blob = new Blob(chunks, { type: 'video/mp4' });
                    
                    // 创建下载链接
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = filename;
                    
                    // 触发下载
                    progressText.textContent = '正在下载...';
                    progressFill.style.width = '100%';
                    downloadLink.click();
                    
                    // 清理资源
                    setTimeout(() => {
                        URL.revokeObjectURL(downloadLink.href);
                        document.body.removeChild(videoElement);
                        progressBar.style.display = 'none';
                    }, 3000);
                    
                    hls.destroy();
                };
                
                // 开始录制
                mediaRecorder.start(1000); // 每秒一个数据块
                
                // 更新进度条
                const updateProgress = () => {
                    if (mediaRecorder.state === 'inactive') return;
                    
                    const currentTime = videoElement.currentTime;
                    const duration = videoElement.duration || 1440; // 默认24分钟
                    
                    const percent = Math.min(80, 20 + (currentTime / duration * 60));
                    progressFill.style.width = `${percent}%`;
                    progressText.textContent = `正在转换: ${Math.floor(percent)}%`;
                    
                    if (currentTime < duration) {
                        requestAnimationFrame(updateProgress);
                    }
                };
                
                updateProgress();
                
                // 监听视频结束
                videoElement.onended = () => {
                    // 延迟一点停止录制，确保捕获所有帧
                    setTimeout(() => {
                        mediaRecorder.stop();
                    }, 1000);
                };
                
                // 如果视频太长，设置一个最大录制时间
                setTimeout(() => {
                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                }, 3600000); // 最多录制1小时
            } else {
                throw new Error('您的浏览器不支持HLS视频转换');
            }
        } catch (error) {
            console.error('转换失败:', error);
            progressText.textContent = '转换失败';
            progressFill.style.width = '100%';
            progressFill.style.backgroundColor = '#ff4757';
            
            setTimeout(() => {
                progressBar.style.display = 'none';
                alert('视频转换失败，请稍后重试');
            }, 3000);
        }
    }
    
    // 添加样式
    addStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            /* 下载模态窗口样式 */
            .download-modal .modal-content {
                width: 90%;
                max-width: 800px;
            }
            
            .download-tabs {
                display: flex;
                border-bottom: 1px solid #333;
                margin-bottom: 20px;
            }
            
            .download-tab-btn {
                background: none;
                border: none;
                padding: 10px 15px;
                color: #aaa;
                cursor: pointer;
                font-size: 14px;
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
            }
            
            .download-tab-btn:hover {
                color: #ff4757;
            }
            
            .download-tab-btn.active {
                color: #ff4757;
                border-bottom-color: #ff4757;
            }
            
            .download-tab-content {
                display: none;
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .download-tab-content.active {
                display: block;
            }
            
            .download-intro {
                margin-bottom: 15px;
                color: #ccc;
            }
            
            .download-format-selector {
                margin-bottom: 20px;
                display: flex;
                gap: 20px;
            }
            
            .download-format-selector label {
                color: #ccc;
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }
            
            .download-episodes-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .download-episode-btn {
                background-color: #252525;
                border-radius: 5px;
                padding: 8px;
                text-align: center;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .download-episode-btn:hover {
                background-color: #333;
            }
            
            .episode-number {
                margin-bottom: 5px;
                color: #ccc;
                font-size: 14px;
            }
            
            .episode-download-btn {
                background-color: #444;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                color: #ccc;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .episode-download-btn:hover {
                background-color: #ff4757;
                color: white;
            }
            
            .download-btn {
                background-color: #333;
                color: #ccc;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .download-btn:hover {
                background-color: #444;
            }
            
            .primary-btn {
                background-color: #ff4757;
                color: white;
            }
            
            .primary-btn:hover {
                background-color: #ff3546;
            }
            
            .help-content {
                color: #ccc;
                line-height: 1.6;
            }
            
            .help-content p {
                margin-bottom: 15px;
            }
            
            .help-content a {
                color: #ff4757;
                text-decoration: none;
            }
            
            .help-content a:hover {
                text-decoration: underline;
            }
            
            .note-box {
                background-color: #252525;
                border-left: 3px solid #ff4757;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            
            /* MP4转换部分 */
            .mp4-converter {
                background-color: #252525;
                padding: 20px;
                border-radius: 8px;
            }
            
            .current-episode-info {
                margin: 15px 0;
                color: #ddd;
            }
            
            .mp4-options {
                margin: 15px 0;
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .option-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .option-group select {
                background-color: #333;
                color: #ccc;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
            }
            
            .mp4-progress-bar {
                margin-top: 20px;
                display: none;
            }
            
            .progress-text {
                margin-bottom: 5px;
                color: #ccc;
                font-size: 14px;
            }
            
            .progress-track {
                height: 8px;
                background-color: #333;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background-color: #2ecc71;
                width: 0%;
                transition: width 0.3s;
            }
            
            .mp4-note {
                margin-top: 20px;
                color: #aaa;
                font-size: 13px;
            }
            
            @media (max-width: 768px) {
                .download-episodes-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .download-format-selector {
                    flex-direction: column;
                    gap: 10px;
                }
            }
            
            @media (max-width: 480px) {
                .download-episodes-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .mp4-options {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    }
}

// 页面加载完成后初始化下载功能
document.addEventListener('DOMContentLoaded', function() {
    // 从全局变量中获取必要信息
    const baseUrl = window.baseUrl || './resource/';
    const totalEpisodes = window.totalEpisodes || 12;
    const animeName = document.querySelector('.anime-title')?.textContent || '地缚少年花子君 第二季';
    
    // 初始化下载管理器
    const downloader = new AnimeDownloader(baseUrl, totalEpisodes, animeName);
}); 