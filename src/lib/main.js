'use strict';

var tabs = require('sdk/tabs');
var self = require('sdk/self');
var worker = null;
const regex = /http(s)?:\/\/(www|tagmanager)\.google\.com(\/tagmanager)?\/*/;
const contentScriptFiles = [self.data.url('gtm-preview-mode.js')];

tabs.on('ready', function(tab){

    if (regex.test(tab.url)){
        worker = tab.attach({
            contentScriptFile: contentScriptFiles
        });
    }

});

exports.main = function(options, callbacks){

    if (worker !== null) {
        worker.port.emit('load');
    }

};

exports.onUnload = function(reason){

    if (worker !== null){
        worker.port.emit('unload');
    }

};