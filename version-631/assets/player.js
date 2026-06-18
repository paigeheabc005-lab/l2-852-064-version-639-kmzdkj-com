(function () {
    window.setupMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var startButton = document.querySelector("[data-player-start]");
        var hlsInstance = null;
        var attached = false;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function startPlayback() {
            attachStream();
            video.controls = true;

            if (startButton) {
                startButton.classList.add("is-hidden");
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (startButton) {
                        startButton.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (startButton) {
            startButton.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
}());
