<?xml version="1.0" encoding="UTF-8"?>
        <!-- Copyright 2012 Google Inc. All Rights Reserved -->
        <Module>
          <ModulePrefs title="Face Movement" height="200" width="550">
          <Require feature="dynamic-height"/>
          <Require feature="rpc"/>
          <Require feature="views" />
      </ModulePrefs>
        <Content type="html"><![CDATA[
<!DOCTYPE html>
<link href='https://fonts.googleapis.com/css?family=Open+Sans&subset=latin,latin-ext' rel='stylesheet' type='text/css' />
<style type="text/css" "https://wolffexperiments.appspot.com/static/style.css" />
<script src="https://talkgadget.google.com/hangouts/_/api/hangout.js?v=1.4"></script>

<script>
function init() {
    gapi.hangout.onApiReady.add(
	function(eventObj) {
            if (eventObj.isApiReady) {
		//location.href="https://rawgithub.com/start-jsk/telemba/mainapp/hangouts/controller.html?" + gapi.hangout.getHangoutUrl() ;
		location.href="https://rawgithub.com/start-jsk/telemba/mainapp/hangouts/controller.html"
            }
	});
}
gadgets.util.registerOnLoadHandler(init);
</script>

]]></Content></Module>
