'use strict';

(function(){

    var APP_NAME = 'gtm.application';
    var PREVIEW_CONTAINER = 'QUICK_PREVIEW';
    var PAGE_CONTROLLER = 'pageCtrl';
    var ANGULAR_APP_ATTRIBUTES = [
        'ng-app',
        'data-ng-app'
    ];
    var DEBUG = {
        on: 'x',
        off: ''
    };
    var CHECKBOX_DEBUG_ID = 'greg-gtm-checkbox-debug';
    var GTM_CHECKBOX_CHECKED = 'material-checked';

    var $oldButtonContainer = null;
    var $previewCheckboxContent = null;
    var $chkDebug = null;
    var observer = null;
    var storage = {
        get: function(key){
            return localStorage && localStorage.getItem(key);
        },
        set: function(key, value){
            localStorage && localStorage.setItem(key, value);
        },
        remove: function(key){
            localStorage && localStorage.removeItem(key);
        }
    };

    function enable(){

        observer = new MutationObserver(function(mutations){

            var element = __$('#bubble-2 .gtm-container-page-publish-dropdown-button-wrapper');

            if (element && !$previewCheckboxContent){
                createElements();
            }

            if (typeof window.gregGtmPageController === 'undefined'){
                var scope = getAngularScope(APP_NAME, PAGE_CONTROLLER);
                scope && (window.gregGtmPageController = scope[PAGE_CONTROLLER]);
            }

        });

        var config = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        };

        observer.observe(document.body, config);

    }

    function disable(){

        observer && observer.disconnect();
        observer = null;

        storage.remove(CHECKBOX_DEBUG_ID);

        removeElements();

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

        //var scope = getAngularScope(APP_NAME, PAGE_CONTROLLER);
        //var controller = scope && scope[PAGE_CONTROLLER];

        window.gregGtmPageController.container && createService.call(
            window.gregGtmPageController.containerPreviewDebugService_,
            window.gregGtmPageController.container.key,
            debug
        );

    }

    function __$(selector, attributes, content){

        var element = null;

        if (typeof selector === 'string'){
            if (selector.indexOf('.') > -1 || selector.indexOf('#') > -1){
                element = document.querySelector(selector);
            } else {
                element = document.createElement(selector);
            }
        } else {
            if (selector instanceof __$){
                return null;
            }
            element = selector;
        }

        if (element === null){
            return null;
        }

        if (typeof attributes !== 'undefined'){
            for (var prop in attributes){
                if (attributes.hasOwnProperty(prop)){
                    element.setAttribute(prop, attributes[prop]);
                }
            }
        }

        _append(content);

        function _append(content){

            switch (typeof content){
                case 'string':
                case 'number':
                case 'boolean':
                    element.appendChild(document.createTextNode(content));
                    break;
                case 'object':
                    element.appendChild(typeof content.element !== 'undefined' ? content.element : content);
                    break;
                case 'function':
                    content(element);
                    break;
                default:
            }

        }

        return Object.create({
            element: element,
            append: function(el){
                _append(el);
                return this;
            }.bind(this),
            clear: function(){
                while (element.firstChild){
                    element.removeChild(element.firstChild);
                }
                return this;
            }.bind(this),
            select: function(selector){
                return element.querySelector(selector);
            }.bind(this),
            selectAll: function(selector){
                return [].slice.call(element.querySelectorAll(selector));
            }.bind(this),
            remove: function(){
                element.parentNode.removeChild(element);
                return this;
            }.bind(this)
        });

    }

    function createCheckBoxContent(id, text, callback){

        var div = __$('div', {
            'class': 'gtm-field-group',
            'style': 'margin: 10px 0 0 0; padding: 0;'
        });
        var label = __$('label', {
            'for': id,
            'style': 'cursor: pointer;'
        });
        var checkbox = __$('gtm-checkbox', {
            'class': 'ng-scope ng-pristine ng-untouched ng-valid',
            'id': id,
            'name': id,
            'style': 'margin: -5px 5px 0 0'
        });
        var div2 = __$('div', {'class': 'material-container'});
        var div3 = __$('div', {'class': 'material-icon'});

        if (typeof callback === 'function'){
            label.element.addEventListener('click', callback, false);
            checkbox.element.addEventListener('click', callback, false);
        }

        div2.append(div3);
        checkbox.append(div2);
        label.append(checkbox);
        label.append(text || '');
        div.append(label);

        return {
            container: div,
            checkbox: checkbox,
            label: label
        };

    }

    function checkCheckbox(element, persist){

        persist = persist || true;

        if (element.className.indexOf(GTM_CHECKBOX_CHECKED) > -1){
            element.className = element.className.replace(GTM_CHECKBOX_CHECKED, '').trim();
            persist && storage.set(element.id, 0);
        } else {
            element.className += ' ' + GTM_CHECKBOX_CHECKED;
            persist && storage.set(element.id, 1);
        }

    }

    function createElements(){

        var $container = __$('#bubble-2');
        var $wrapper = $container && $container.selectAll('.gtm-container-page-publish-dropdown-button-wrapper');

        if ($wrapper && $wrapper.length > 1){

            var $button = __$('button', {'class': 'btn-action gtm-container-page-publish-dropdown-button'}, 'Preview');

            $button.element.addEventListener('click', function(event){
                event.stopPropagation();
                enterPreviewMode($chkDebug.element.className.indexOf(GTM_CHECKBOX_CHECKED) > -1);
            }, false);

            $wrapper = __$($wrapper[1]);

            // Angular removes the style if we try to set the button style,
            // so wrap the old button in a div, and hide that instead.
            var $oldButton = __$($wrapper.select('button'));
            $oldButton.remove();
            $oldButtonContainer = __$('div', {'style': 'display: none;'}, $oldButton);

            var content = createCheckBoxContent(CHECKBOX_DEBUG_ID, ' Debug', function(event){
                event.stopPropagation();
                checkCheckbox($chkDebug.element);
            });
            $previewCheckboxContent = content.container;
            $chkDebug = content.checkbox;

            if (storage.get(CHECKBOX_DEBUG_ID) === 1){
                checkCheckbox($chkDebug.element, false);
            }

            $wrapper.append($oldButtonContainer);
            $wrapper.append($button);
            $wrapper.append($previewCheckboxContent);

        }

    }

    function removeElements(){

        $oldButtonContainer && $oldButtonContainer.remove();
        $oldButtonContainer = null;

        $previewCheckboxContent && $previewCheckboxContent.remove();
        $previewCheckboxContent = null;

    }

    window.gregGtmPreviewMode = {
        enable: enable,
        disable: disable,
        getAngularScope: getAngularScope
    };

    enable();

})();