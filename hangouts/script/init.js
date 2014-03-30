function init() {
    gapi.hangout.onApiReady.add(
        function(eventObj) {
            if (eventObj.isApiReady) {
		initVideoCanvas(300,0);
            }
        });
}
gadgets.util.registerOnLoadHandler(init);
