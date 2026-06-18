import { H as Hls } from './hls-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-player-status]');
    var source = shell.getAttribute('data-video-src');
    var hls = null;
    var ready = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachSource() {
        if (ready || !video || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
            setStatus('播放源已就绪。');
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
                setStatus('播放源已就绪。');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源暂时无法加载，请稍后重试。');
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                    ready = false;
                }
            });
            return;
        }

        setStatus('当前浏览器不支持 HLS 播放。');
    }

    function playVideo() {
        attachSource();
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setStatus('请再次点击播放器开始播放。');
                shell.classList.remove('is-playing');
            });
        }
    }

    attachSource();

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setStatus('正在播放。');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            setStatus('已暂停。');
        }
    });

    video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        setStatus('播放结束。');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
