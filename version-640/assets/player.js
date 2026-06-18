async function setupHls(video, source, message) {
    if (!video || !source) {
        return false;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return true;
    }

    try {
        var module = await import('./hls-vendor-dru42stk.js');
        var Hls = module.H;

        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            window.__activeHlsPlayer = hls;
            return true;
        }
    } catch (error) {
        console.error('HLS 初始化失败:', error);
    }

    if (message) {
        message.textContent = '当前浏览器暂不支持 HLS 播放，请换用支持 M3U8 的浏览器访问。';
    }
    return false;
}

function initPlayer() {
    var shell = document.querySelector('[data-player-shell]');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video[data-hls-src]');
    var overlay = shell.querySelector('[data-play-overlay]');
    var message = shell.querySelector('[data-player-message]');
    var source = video ? video.getAttribute('data-hls-src') : '';
    var isReady = false;

    async function play() {
        if (message) {
            message.textContent = '正在初始化高清播放源...';
        }

        if (!isReady) {
            isReady = await setupHls(video, source, message);
        }

        if (!isReady) {
            return;
        }

        try {
            await video.play();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (message) {
                message.textContent = '播放源已加载';
                setTimeout(function () {
                    message.textContent = '';
                }, 1800);
            }
        } catch (error) {
            if (message) {
                message.textContent = '请再次点击播放按钮开始播放。';
            }
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', initPlayer);
