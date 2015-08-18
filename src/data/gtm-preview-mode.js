'use strict';

(function(){

    var APP_NAME = 'gtm.application';
    var PREVIEW_CONTAINER = 'QUICK_PREVIEW';
    var PAGE_CONTROLLER = 'containerPageCtrl';
    var ANGULAR_APP_ATTRIBUTES = [
        'np-app',
        'data-ng-app'
    ];
    var DEBUG = {
        on: 'x',
        off: ''
    };

    function setup(){

        self.port.on('load', onLoad);
        self.port.on('unload', onUnload);

        unsafeWindow.addEventListener('load', onLoad, false);

        onLoad();

    }

    function onLoad(){

    }

    function onUnload(){

    }

    function getAngularScope(app, property){

        var result = null;

        if (typeof angular !== 'undefined'){

            for (var i = 0, i_ = ANGULAR_APP_ATTRIBUTES.length; i < i_; i++){

                var element = document.querySelector('[' + ANGULAR_APP_ATTRIBUTES[i] + '="' + app + '"');

                if (element !== null){

                    element = angular.element(element);

                    if (typeof property === 'undefined'){
                        result = element.scope();
                    } else {
                        var temp = element.scope();
                        while (!temp.hasOwnProperty(property) && temp.$$childTail){
                            temp = temp.$$childTail;
                        }
                        if (temp.hasOwnProperty(property)){
                            result = temp;
                        }
                    }
                    break;
                }
            }
        }

        return result;

    }

    function createService(key, debug){

        var self = this;
        debug = debug || false;

        return (key.containerVersionId ? this.containerVersionService_.getHeader(key) : this.models_.create(key, key)).then(function(result){

            self.$window_.location = [
                self.setCookieUrlPrefix_,
                '?',
                self.ctuiv2PreviewQueryParam_,
                '&id=' + result.publicId,
                '&gtm_auth=' + result.previewAuthCode,
                '&gtm_debug=' + (debug ? DEBUG.on : DEBUG.off),
                '&gtm_preview=' + (key.containerVersionId || PREVIEW_CONTAINER),
                '&redirect=' + encodeURIComponent(self.$window_.location)
            ].join('');

        }).catch(this.handlePreviewError_.bind(this));

    }

    function enterPreviewMode(debug){

        var scope = getAngularScope(APP_NAME, PAGE_CONTROLLER);
        var controller = scope && scope[PAGE_CONTROLLER];

        controller && controller.container && createService.call(controller.containerPreviewDebugService_, controller.container.key, debug);

    }

    setup();

})();


/*<div class="bubble-row ng-scope" ng-if="!isMobileContainer">
 <div class="gtm-container-page-publish-dropdown-description">
 <h4>
 Preview Only
 </h4>
 Verify and check for problems before publishing your tags without the overlay.
 </div>
 <div class="gtm-container-page-publish-dropdown-button-wrapper">
 <button data-ng-click="containerPageCtrl.preview()" class="btn-action gtm-container-page-publish-dropdown-button">
 Preview Only
 </button>
 </div>
 </div>*/