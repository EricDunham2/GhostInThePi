var player;

window['__onGCastApiAvailable'] = function (isAvailable, reason) {
    if (!isAvailable) {
        $('castDiv').style.display = 'none';
        $('playerControl').style.display = 'none';
        $('castError').innerText = reason;
        return;
    }

    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    player = new cast.framework.RemotePlayer();;
    playerController = new cast.framework.RemotePlayerController(player);
    $('playerControl').hidden = true;
}

function playRemote(path, currentTime, isPaused) {
    path = `http://${self.ipAddress}` + path
    var session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (session) {
        var content = path;
        var mediaInfo = new chrome.cast.media.MediaInfo(
            path, "video/mp4");

        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.title = "";
        mediaInfo.metadata.subtitle = "";
        mediaInfo.metadata.images = [];
        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.currentTime = currentTime;
        request.autoplay = !isPaused;
        session.loadMedia(request).then(
            function () { console.log('Load succeed'); },
            function (e) { console.log('Load failed ' + e); });
    }
}