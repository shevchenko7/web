/**
 * Accordion
 * @author BanseokYang
 * @see http://confluence.wemakeprice.com/pages/viewpage.action?pageId=9332918
 */
(function(root, $) {

    'use strict';

    var EVENT_NAMESPACE = '.wmpaccordion';

    /**
     * utils
     * @private
     */
    var utils = (function() {
        var _utils = {},
            _types = [],
            _name = '';

        // prototypes
        var protoArray = Array.prototype,
            protoObject = Object.prototype;

        // ECMAScript 5
        var nativeIndexOf = protoArray.indexOf;

        _utils.slice = protoArray.slice;
        _utils.hasOwn = protoObject.hasOwnProperty;
        _utils.toString = protoObject.toString;

        _utils.indexOf = function(array, item) {
            if (!array) { return -1; }
            if (nativeIndexOf && array.indexOf === nativeIndexOf) { return array.indexOf(item); }
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === item) { return i; }
            }
            return -1;
        };

        // detect object class
        _types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];

        for (var i = 0, len = _types.length; i < len; i++) {
            _name = _types[i];
            _utils['is' + _name] = (function(str) {
                return function(obj) {
                    return (_utils.toString.call(obj) == '[object ' + str + ']');
                };
            }(_name));
        }

        return _utils;
    }());

    /**
     * Accordion
     * @constructor
     */
    function Accordion(elem, opts) {
        this.version = '1.0.0';
        this.element = elem;
        this.singleOpen = true;
        this.collapsingTimeout = 250;
        this.inProgress = false;

        this.customHandler = {
            activateSection: null,
            deactivateSection: null,
            expandPanel: null,
            collapsePanel: null
        };

        this.prefixes = {
            section: 'sidemenu-section',
            active: 'sidemenu-active',
            toggle: 'sidemenu-toggle',
            panel: 'sidemenu-panel',
            clss: 'sidemenu-class'
        };

        this.$elements = {
            sections: null,
            toggles: null,
            panels: null
        };

        this.initialize(opts);
    }

    Accordion.prototype = {
        /**
         * initialize
         * @param  {object} [opts] options
         */
        initialize: function(opts) {
            // set options
            this.setOptions(opts);

            // set elements
            this.setElements();

            // bind events
            this.bindToggleEvents();

            // activate sections by active of attributes
            this.activates(this.getActiveSections());
        },

        /**
         * 옵션 설정
         * 
         * @param {object} opts 옵션
         * @property {boolean} [opts.singleOpen]
         * @property {number} [opts.collapsingTimeout]
         * @property {object} [opts.customHandler]
         * @property {function} [opts.customHandler.section]
         * @property {function} [opts.customHandler.panel]
         * @property {object} [opts.prefixes]
         * @property {string} [opts.prefixes.section]
         * @property {string} [opts.prefixes.toggle]
         * @property {string} [opts.prefixes.panel]
         */
        setOptions: function(opts) {
            opts = opts || {};

            this.singleOpen = utils.hasOwn.call(opts, 'singleOpen') ? opts.singleOpen : this.singleOpen;
            this.collapsingTimeout = utils.hasOwn.call(opts, 'collapsingTimeout') ? opts.collapsingTimeout : this.collapsingTimeout;

            $.extend(this.customHandler, opts.customHandler || {})
            $.extend(this.prefixes, opts.prefixes || {});
        },

        setElements: function() {
            var self = this,
                prefixes = self.prefixes;

            var $elem = $(self.element),
                $elems = self.$elements;

            $elems.sections = $elem.findDataElements(prefixes.section);
            $elems.toggles = $elem.findDataElements(prefixes.toggle);
            $elems.panels = $elem.findDataElements(prefixes.panel);
        },

        getActiveSections: function() {
            return this.$elements.sections.filterDataElements(this.prefixes.active, '');
        },

        getPanelBySection: function(element) {
            var sidemenuId = $(element).attrByData(this.prefixes.section);

            return this.$elements.panels.filterDataElements(this.prefixes.panel, sidemenuId);
        },

        activateSection: function(element, checkActive) {
            var self = this,
                prefixes = self.prefixes,
                customHandler = self.customHandler,
                checkActive = checkActive || false,
                isActivate = $(element).hasDataAttr(prefixes.active);

            if (checkActive && isActivate) { return; }

            // add active
            $(element).attrByData(prefixes.active, '');

            // add class
            self.addClassByDataAttr(element);

            // if using custom handler
            utils.isFunction(customHandler.activateSection) && customHandler.activateSection.call(element);

            // expand panel
            self.expandPanel(self.getPanelBySection(element));
        },

        deactivateSection: function(element, checkActive) {
            var self = this,
                prefixes = self.prefixes,
                customHandler = self.customHandler,
                checkActive = checkActive || false,
                isActivate = $(element).hasDataAttr(prefixes.active);

            if (checkActive && !isActivate) { return; }

            // remove active
            $(element).removeAttrByData(prefixes.active, '');

            // remove class
            self.removeClassByDataAttr(element);

            // if using custom handler
            utils.isFunction(customHandler.deactivateSection) && customHandler.deactivateSection.call(element);

            // collapse panel
            self.collapsePanel(self.getPanelBySection(element));
        },

        expandPanel: function(element) {
            var self = this,
                customHandler = self.customHandler;

            // if using custom handler
            if (utils.isFunction(customHandler.expandPanel)) {

                customHandler.expandPanel.call(element);

            // base processing
            } else {

                var childHeight = $(element).children(':first').outerHeight();

                $(element).removeClass('collapse').addClass('collapsing').height(childHeight);

                self.inProgress = true;

                setTimeout(function() {
                    $(element).removeClass('collapsing').addClass('collapse in');

                    self.inProgress = false;
                }, self.collapsingTimeout);

            }
        },

        collapsePanel: function(element) {
            var self = this,
                customHandler = self.customHandler;

            // if using custom handler
            if (utils.isFunction(customHandler.collapsePanel)) {

                customHandler.collapsePanel.call(element);

            // base processing
            } else {

                $(element).removeClass('collapse in').addClass('collapsing').height(0);

                self.inProgress = true;

                setTimeout(function() {
                    $(element).removeClass('collapsing').addClass('collapse');

                    self.inProgress = false;
                }, self.collapsingTimeout);

            }
        },

        activates: function($elements) {
            var self = this;
            var $sections = self.$elements.sections;

            $.each($elements || $sections, function() {
                self.activateSection(this, ($elements ? false : true));
            });
        },

        deactivates: function($elements) {
            var self = this;
            var $sections = self.$elements.sections;

            $.each($elements || $sections, function() {
                self.deactivateSection(this, ($elements ? false : true));
            });
        },

        activatesAll: function() {
            this.inProgress || this.activates();
        },

        deactivatesAll: function() {
            this.inProgress || this.deactivates();
        },

        toggle: function(element) {
            var self = this,
                prefixes = self.prefixes,
                sidemenuId = $(element).attrByData(prefixes.toggle);

            var $elems = self.$elements,
                $section = $elems.sections.filterDataElements(prefixes.section, sidemenuId);

            if (self.isActivated(sidemenuId)) {
                self.deactivates($section);
            } else {
                self.deactivates(self.singleOpen ? self.getActiveSections() : $section);
                self.activates($section);
            }
        },

        isActivated: function(sidemenuId) {
            var self = this,
                prefixes = self.prefixes;

            var $sections = self.$elements.sections,
                $section = $sections.filterDataElements(prefixes.section, sidemenuId);

            return $section.hasDataAttr(prefixes.active);
        },

        addClassByDataAttr: function(element) {
            var $elem = $(element);

            if ($elem.hasDataAttr(this.prefixes.clss)) {
                var clss = $elem.attrByData(this.prefixes.clss);

                $elem.addClass(clss);
            }
        },

        removeClassByDataAttr: function(element) {
            var $elem = $(element);

            if ($elem.hasDataAttr(this.prefixes.clss)) {
                var clss = $elem.attrByData(this.prefixes.clss);

                $elem.removeClass(clss);
            }
        },

        bindToggleEvents: function() {
            var self = this;

            $.each(self.$elements.toggles, function() {
                $(this).bind('click' + EVENT_NAMESPACE, function(e) {
                    if (self.inProgress) { return; }
                    self.toggle(this);
                });
            });
        },

        terminate: function() {
            this.$elements.toggles.unbind(EVENT_NAMESPACE);
        }
    };

    $.fn.extend({
        /**
         * Find elements by data attribute
         * @param  {string} key data attribute id
         * @param  {string|number} [val] is optional, data attribute value
         * @return {object}
         */
        findDataElements: function(key, val) {
            var attr = (typeof val === 'undefined') ? key : key + '=' + val;

            return $(this).find('[data-' + attr + ']');
        },
        /**
         * Filter elements by data attribute
         * @param  {string} key data attribute id
         * @param  {string|number} val data attribute value
         * @return {object}
         */
        filterDataElements: function(key, val) {
            return $(this).filter('[data-' + key + '=' + val + ']');
        },
        /**
         * Get/Set data attribute value
         * @param  {string} key data attribute id
         * @param  {string|number} [val] is optional, value
         * @return {object|string|number}
         */
        attrByData: function(key, val) {
            if (typeof val === 'undefined') {
                return $(this).attr('data-' + key);
            } else {
                return $(this).attr('data-' + key, val);
            }
        },
        /**
         * has data attribute
         * @param  {string}  key data attribute name
         * @return {Boolean}
         */
        hasDataAttr: function(key) {
            return (typeof $(this).attr('data-' + key) !== 'undefined');
        },
        /**
         * Remove Attribute
         * @param  {string} key
         * @return {object}
         */
        removeAttrByData: function(key) {
            return $(this).removeAttr('data-' + key);
        },
        /**
         * WMP Accordion
         * @param  {object|string} opts options
         * @param  {object|string|number|undefined} [args] arguments
         * @return {object}
         */
        wmpAccordion: function(opts, args) {
            return this.each(function() {
                var instanceKey = 'wmp_accordion',
                    instance = $(this).data(instanceKey);

                if (typeof opts === 'string') {
                    if (instance instanceof Accordion && typeof instance[opts] === 'function') {
                        instance[opts](args);
                    }
                } else {
                    (instance instanceof Accordion && instance.terminate) && instance.terminate();

                    instance = new Accordion(this, opts);

                    $(this).data(instanceKey, instance);
                }
            });
        }
    });

}(window, jQuery));