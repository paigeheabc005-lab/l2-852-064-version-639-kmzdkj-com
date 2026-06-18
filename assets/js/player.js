(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('.movie-video');
        var playLayer = document.querySelector('.play-layer');
        if (!video || !streamUrl) return;

        var hls;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        } else {
            video.src = streamUrl;
        }

        var start = function () {
            if (playLayer) playLayer.classList.add('hidden');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        };

        if (playLayer) {
            playLayer.addEventListener('click', start);
        }

        video.addEventListener('play', function () {
            if (playLayer) playLayer.classList.add('hidden');
        });
    };
})();
