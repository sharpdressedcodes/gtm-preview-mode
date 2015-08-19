'use strict';

(function(){

    self.on('load', function(){
        injectScript();
    });

    self.on('unload', function(){
        unsafeWindow.gregGtmPreviewMode && unsafeWindow.gregGtmPreviewMode.disable();
    });

    function injectScript(){

        var id = 'gtm-preview-mode-script';
        var script = document.getElementById(id);

        if (script === null){
            script = document.createElement('script');
            document.body.appendChild(script);
            script.async = 'async';
            script.id = id;
            script.type = 'text/javascript';
            script.src = 'chrome://gtm-preview-mode/content/gtm-preview-mode.js';
        } else {
            unsafeWindow.gregGtmPreviewMode && unsafeWindow.gregGtmPreviewMode.enable();
        }

    }

    injectScript();

})();