function init() {
    gapi.hangout.onApiReady.add(
        function(eventObj) {
            if (eventObj.isApiReady) {
		var rc = document.getElementById("right_column") ;
		var bc = document.getElementById("bottom_column") ;
		var w = 230 , h = 80 ;
		console.log("[init]") ;
		if ( rc ) {
		    console.log("  right_column: " +rc.offsetWidth) ;
		    w = Math.max(w,rc.offsetWidth) ;
		}
		if ( bc ) {
		    console.log("  bottom_column: " +bc.offsetHeight) ;
		    h = Math.max(h.bc.offsetHeight) ;
		}
		initVideoCanvas(w,h);
		
		// 所有者を決めるための枠組みの初期化
		initOwnerFramework();
            }
        });
}
gadgets.util.registerOnLoadHandler(init);
