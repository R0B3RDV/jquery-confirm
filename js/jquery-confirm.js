/*!
 * jquery-confirm v3.0.3 (http://craftpip.github.io/jquery-confirm/)
 * Author: Boniface Pereira
 * Website: www.craftpip.com
 * Contact: hey@craftpip.com
 *
 * Copyright 2013-2016 jquery-confirm
 * Licensed under MIT (https://github.com/craftpip/jquery-confirm/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
    throw new Error('jquery-confirm requires jQuery');
}

var jconfirm, Jconfirm;
(function ($, window) {
    "use strict";

    $.fn.confirm = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false
            };

        /*
         *  Alias of $.confirm to emulate native confirm()
         */
        $(this).each(function () {
            var $this = $(this);
            $this.on('click', function (e) {
                e.preventDefault();
                var jcOption = $.extend({}, options);
                if ($this.attr('data-title'))
                    jcOption['title'] = $this.attr('data-title');
                if ($this.attr('data-content'))
                    jcOption['content'] = $this.attr('data-content');
                if (typeof jcOption['buttons'] == 'undefined')
                    jcOption['buttons'] = {};

                jcOption['$target'] = $this;
                if ($this.attr('href') && Object.keys(jcOption['buttons']).length == 0) {
                    var buttons = $.extend(true, {}, jconfirm.pluginDefaults.defaultButtons, (jconfirm.defaults || {}).defaultButtons || {});
                    var firstBtn = Object.keys(buttons)[0];
                    jcOption['buttons'] = buttons;
                    jcOption.buttons[firstBtn].action = function () {
                        location.href = $this.attr('href');
                    };
                }
                jcOption['closeIcon'] = false;
                $.confirm(jcOption);
            });
        });
        return $(this);
    };
    $.confirm = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false,
            };

        if (typeof options['buttons'] != 'object')
            options['buttons'] = {};

        if (Object.keys(options['buttons']).length == 0) {
            var buttons = $.extend(true, {}, jconfirm.pluginDefaults.defaultButtons, (jconfirm.defaults || {}).defaultButtons || {});
            options['buttons'] = buttons;
        }

        /*
         *  Alias of jconfirm
         */
        return jconfirm(options);
    };
    $.alert = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false,
            };

        if (typeof options.buttons != 'object')
            options.buttons = {};

        if (Object.keys(options['buttons']).length == 0) {
            var buttons = $.extend(true, {}, jconfirm.pluginDefaults.defaultButtons, (jconfirm.defaults || {}).defaultButtons || {});
            var firstBtn = Object.keys(buttons)[0];
            options['buttons'][firstBtn] = buttons[firstBtn];
        }
        /*
         *  Alias of jconfirm
         */
        return jconfirm(options);
    };
    $.dialog = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false,
                closeIcon: function () {
                    // Just close the modal
                }
            };

        options['buttons'] = {}; // purge buttons

        if (typeof options['closeIcon'] == 'undefined') {
            // Dialog must have a closeIcon.
            options['closeIcon'] = function () {
            }
        }
        /*
         *  Alias of jconfirm
         */
        options.confirmKeys = [13];
        return jconfirm(options);
    };

    jconfirm = function (options) {
        if (typeof options === 'undefined') options = {};
        /*
         * initial function for calling.
         */
        var pluginOptions = $.extend(true, {}, jconfirm.pluginDefaults);
        if (jconfirm.defaults) {
            pluginOptions = $.extend(true, pluginOptions, jconfirm.defaults);
        }

        /*
         * merge options with plugin defaults.
         */
        pluginOptions = $.extend(true, {}, pluginOptions, options);
        var instance = new Jconfirm(pluginOptions);
        jconfirm.instances.push(instance);
        return instance;
    };
    Jconfirm = function (options) {
        /*
         * constructor function Jconfirm,
         * options = user options.
         */
        $.extend(this, options);
        this._init();
    };
    Jconfirm.prototype = {
        _init: function () {
            var that = this;

            this._lastFocused = $('body').find(':focus');
            this._id = Math.round(Math.random() * 99999);
            setTimeout(function () {
                that.open();
            }, 0);
        },
        _buildHTML: function () {
            var that = this;

            // prefix the animation string and store in animationParsed
            this._parseAnimation(this.animation, 'o');
            this._parseAnimation(this.closeAnimation, 'c');
            this._parseBgDismissAnimation(this.backgroundDismissAnimation);
            this._parseColumnClass(this.columnClass);
            this._parseTheme(this.theme);
            this._parseType(this.type);

            /*
             * Append html.
             */
            var template = $(this.template);
            template.find('.jconfirm-box').addClass(this.animationParsed).addClass(this.backgroundDismissAnimationParsed).addClass(this.typeParsed);

            if (this.typeAnimated)
                template.find('.jconfirm-box').addClass('jconfirm-type-animated');

            if (this.useBootstrap) {
                template.find('.jc-bs3-row').addClass(this.bootstrapClasses.row);
                template.find('.jc-bs3-row').addClass('justify-content-md-center justify-content-sm-center justify-content-xs-center justify-content-lg-center');

                template.find('.jconfirm-box-container').addClass(this.columnClassParsed);

                if (this.containerFluid)
                    template.find('.jc-bs3-container').addClass(this.bootstrapClasses.containerFluid);
                else
                    template.find('.jc-bs3-container').addClass(this.bootstrapClasses.container);
            } else {
                template.find('.jconfirm-box').css('width', this.boxWidth);
            }

            if (this.titleClass)
                template.find('.jconfirm-title-c').addClass(this.titleClass);

            template.addClass(this.themeParsed);
            var ariaLabel = 'jconfirm-box' + this._id;
            template.find('.jconfirm-box').attr('aria-labelledby', ariaLabel).attr('tabindex', -1);
            template.find('.jconfirm-content').attr('id', ariaLabel);
            if (this.bgOpacity != null)
                template.find('.jconfirm-bg').css('opacity', this.bgOpacity);
            if (this.rtl)
                template.addClass('jconfirm-rtl');

            this.$el = template.appendTo(this.container);
            this.$jconfirmBoxContainer = this.$el.find('.jconfirm-box-container');
            this.$jconfirmBox = this.$body = this.$el.find('.jconfirm-box');
            this.$jconfirmBg = this.$el.find('.jconfirm-bg');
            this.$title = this.$el.find('.jconfirm-title');
            this.$titleContainer = this.$el.find('.jconfirm-title-c');
            this.$content = this.$el.find('div.jconfirm-content');
            this.$contentPane = this.$el.find('.jconfirm-content-pane');
            this.$icon = this.$el.find('.jconfirm-icon-c');
            this.$closeIcon = this.$el.find('.jconfirm-closeIcon');
            // this.$content.css(this._getCSS(this.animationSpeed, this.animationBounce));
            this.$btnc = this.$el.find('.jconfirm-buttons');
            this.$scrollPane = this.$el.find('.jconfirm-scrollpane');

            // for loading content via URL
            this._contentReady = $.Deferred();
            this._modalReady = $.Deferred();

            this.setTitle();
            this.setIcon();
            this._setButtons();
            this._parseContent();
            this.initDraggable();

            if (this.isAjax)
                this.showLoading(false);

            $.when(this._contentReady, this._modalReady).then(function () {
                if (that.isAjaxLoading)
                    setTimeout(function () {
                        that.isAjaxLoading = false;
                        that.setContent();
                        that.setTitle();
                        that.setIcon();
                        setTimeout(function () {
                            that.hideLoading(false);
                        }, 100);
                        if (typeof that.onContentReady == 'function')
                            that.onContentReady();
                    }, 50);
                else {
                    that.setContent();
                    that.setTitle();
                    that.setIcon();
                    if (typeof that.onContentReady == 'function')
                        that.onContentReady();
                }

                // start countdown after content has loaded.
                if (that.autoClose)
                    that._startCountDown();
            });

            // initial hash for comparison
            that._contentHash = this._hash(that.$content.html());
            that._contentHeight = this.$content.height();

            this._watchContent();
            this.setDialogCenter();

            if (this.animation == 'none') {
                this.animationSpeed = 1;
                this.animationBounce = 1;
            }

            this.$body.css(this._getCSS(this.animationSpeed, this.animationBounce));
            this.$contentPane.css(this._getCSS(this.animationSpeed, 1));
            this.$jconfirmBg.css(this._getCSS(this.animationSpeed, 1));
        },
        _typePrefix: 'jconfirm-type-',
        typeParsed: '',
        _parseType: function (type) {
            this.typeParsed = this._typePrefix + type;
        },
        setType: function (type) {
            var oldClass = this.typeParsed;
            this._parseType(type);
            this.$jconfirmBox.removeClass(oldClass).addClass(this.typeParsed);
        },
        themeParsed: '',
        _themePrefix: 'jconfirm-',
        setTheme: function (theme) {
            var previous = this.theme;
            this.theme = theme || this.theme;
            this._parseTheme(this.theme);
            if (previous)
                this.$el.removeClass(previous);
            this.$el.addClass(this.themeParsed);
            this.theme = theme;
        },
        _parseTheme: function (theme) {
            var that = this;
            theme = theme.split(',');
            $.each(theme, function (k, a) {
                if (a.indexOf(that._themePrefix) == -1)
                    theme[k] = that._themePrefix + $.trim(a);
            });
            this.themeParsed = theme.join(' ').toLowerCase();
        },
        backgroundDismissAnimationParsed: '',
        _bgDismissPrefix: 'jconfirm-hilight-',
        _parseBgDismissAnimation: function (bgDismissAnimation) {
            var animation = bgDismissAnimation.split(',');
            var that = this;
            $.each(animation, function (k, a) {
                if (a.indexOf(that._bgDismissPrefix) == -1)
                    animation[k] = that._bgDismissPrefix + $.trim(a);
            });
            this.backgroundDismissAnimationParsed = animation.join(' ').toLowerCase();
        },
        animationParsed: '',
        closeAnimationParsed: '',
        _animationPrefix: 'jconfirm-animation-',
        setAnimation: function (animation) {
            this.animation = animation || this.animation;
            this._parseAnimation(this.animation, 'o');
        },
        _parseAnimation: function (animation, which) {
            which = which || 'o'; // parse what animation and store where. open or close?
            var animations = animation.split(',');
            var that = this;
            $.each(animations, function (k, a) {
                if (a.indexOf(that._animationPrefix) == -1)
                    animations[k] = that._animationPrefix + $.trim(a);
            });
            var a_string = animations.join(' ').toLowerCase();
            if (which == 'o')
                this.animationParsed = a_string;
            else
                this.closeAnimationParsed = a_string;

            return a_string;
        },
        setCloseAnimation: function (closeAnimation) {
            this.closeAnimation = closeAnimation || this.closeAnimation;
            this._parseAnimation(this.closeAnimation, 'c');
        },
        setAnimationSpeed: function (speed) {
            this.animationSpeed = speed || this.animationSpeed;
            // this.$body.css(this._getCSS(this.animationSpeed, this.animationBounce));
        },
        columnClassParsed: '',
        setColumnClass: function (colClass) {
            this.columnClass = colClass || this.columnClass;
            this._parseColumnClass(this.columnClass);
            this.$jconfirmBoxContainer.addClass(this.columnClassParsed);
        },
        _parseColumnClass: function (colClass) {
            colClass = colClass.toLowerCase();
            var p;
            switch (colClass) {
                case 'xl':
                case 'xlarge':
                    p = 'col-md-12';
                    break;
                case 'l':
                case 'large':
                    p = 'col-md-8 col-md-offset-2';
                    break;
                case 'm':
                case 'medium':
                    p = 'col-md-6 col-md-offset-3';
                    break;
                case 's':
                case 'small':
                    p = 'col-md-4 col-md-offset-4';
                    break;
                case 'xs':
                case 'xsmall':
                    p = 'col-md-2 col-md-offset-5';
                    break;
                default:
                    p = colClass;
            }
            this.columnClassParsed = p;
        },
        initDraggable: function () {
            var that = this;
            var $t = this.$titleContainer;

            this.resetDrag();
            if (this.draggable) {
                $t.addClass('jconfirm-hand');
                $t.on('mousedown', function (e) {
                    that.mouseX = e.clientX;
                    that.mouseY = e.clientY;
                    that.isDrag = true;
                });
                $(window).on('mousemove.' + this._id, function (e) {
                    if (that.isDrag) {
                        that.movingX = e.clientX - that.mouseX + that.initialX;
                        that.movingY = e.clientY - that.mouseY + that.initialY;
                        that.setDrag();
                    }
                });

                $(window).on('mouseup.' + this._id, function () {
                    if (that.isDrag) {
                        that.isDrag = false;
                        that.initialX = that.movingX;
                        that.initialY = that.movingY;
                    }
                })
            }
        },
        resetDrag: function () {
            this.isDrag = false;
            this.initialX = 0;
            this.initialY = 0;
            this.movingX = 0;
            this.movingY = 0;
            this.movingXCurrent = 0;
            this.movingYCurrent = 0;
            this.mouseX = 0;
            this.mouseY = 0;
            this.$jconfirmBoxContainer.css('transform', 'translate(' + 0 + 'px, ' + 0 + 'px)');
        },
        setDrag: function () {
            if (!this.draggable)
                return;

            this.alignMiddle = false;
            this._boxWidth = this.$jconfirmBox.outerWidth();
            var ww = $(window).width();
            var that = this;
            if (that.movingX % 2 == 0 || that.movingY % 2 == 0) {
                var tb = that._boxTopMargin - that.dragWindowGap;
                console.log('mouse move', that.movingX, that.movingY);

                if (tb + that.movingY < 0) {
                    that.movingY = -tb;
                } else {
                    that.movingYCurrent = that.movingY;
                }
                var lb = (ww / 2) - that._boxWidth / 2;
                var rb = (ww / 2) + (that._boxWidth / 2) - that._boxWidth;
                rb -= that.dragWindowGap;
                lb -= that.dragWindowGap;

                if (lb + that.movingX < 0) {
                    that.movingX = -lb;
                } else if (rb - that.movingX < 0) {
                    that.movingX = rb;
                } else {
                    that.movingXCurrent = that.movingX;
                }

                that.$jconfirmBoxContainer.css('transform', 'translate(' + that.movingX + 'px, ' + that.movingY + 'px)');
            }
        },
        _hash: function (a) {
            return btoa((encodeURIComponent(a)));
        },
        _watchContent: function () {
            var that = this;
            if (this._timer) clearInterval(this._timer);
            this._timer = setInterval(function () {
                var now = that._hash(that.$content.html());
                var nowHeight = that.$content.height();
                if (that._contentHash != now || that._contentHeight != nowHeight) {
                    that._contentHash = now;
                    that._contentHeight = nowHeight;
                    that.setDialogCenter();
                    that._imagesLoaded();
                }
            }, this.watchInterval);
        },
        _hilightAnimating: false,
        _hiLightModal: function () {
            var that = this;
            if (this._hilightAnimating)
                return;

            that.$body.addClass('hilight');
            // var duration = parseFloat(that.$body.css('animation-duration')) || 0;
            var duration = 2; // 2 seconds default
            this._hilightAnimating = true;
            setTimeout(function () {
                that._hilightAnimating = false;
                that.$body.removeClass('hilight');
            }, duration * 1000);
        },
        _bindEvents: function () {
            var that = this;
            this.boxClicked = false;

            this.$scrollPane.click(function (e) { // Ignore propagated clicks
                if (!that.boxClicked) { // Background clicked
                    /*
                     If backgroundDismiss is a function and its return value is truthy
                     proceed to close the modal.
                     */
                    var buttonName = false;
                    var shouldClose = false;
                    var str;

                    if (typeof that.backgroundDismiss == 'function')
                        str = that.backgroundDismiss();
                    else
                        str = that.backgroundDismiss;

                    if (typeof str == 'string' && typeof that.buttons[str] != 'undefined') {
                        buttonName = str;
                        shouldClose = false;
                    } else if (typeof str == 'undefined' || !!(str) == true) {
                        shouldClose = true;
                    } else {
                        shouldClose = false;
                    }

                    if (buttonName) {
                        var btnResponse = that.buttons[buttonName].action.apply(that);
                        shouldClose = (typeof btnResponse == 'undefined') || !!(btnResponse);
                    }

                    if (shouldClose)
                        that.close();
                    else
                        that._hiLightModal();
                }
                that.boxClicked = false;
            });

            this.$jconfirmBox.click(function (e) {
                that.boxClicked = true;
            });

            setTimeout(function () {
                $(window).on('keyup.' + that._id, function (e) {
                    that.reactOnKey(e);
                });
            }, 10);

            $(window).on('resize.' + this._id, function () {
                that.setDialogCenter(true);
                setTimeout(function () {
                    that.resetDrag();
                }, 100);
            });
        },
        _cubic_bezier: '0.36, 0.55, 0.19',
        _getCSS: function (speed, bounce) {
            return {
                '-webkit-transition-duration': speed / 1000 + 's',
                'transition-duration': speed / 1000 + 's',
                '-webkit-transition-timing-function': 'cubic-bezier(' + this._cubic_bezier + ', ' + bounce + ')',
                'transition-timing-function': 'cubic-bezier(' + this._cubic_bezier + ', ' + bounce + ')'
            };
        },
        _imagesLoaded: function () {
            // detect if the image is loaded by checking on its height.
            var that = this;
            if (that.imageLoadInterval)
                clearInterval(that.imageLoadInterval);

            $.each(this.$content.find('img:not(.loaded)'), function (i, a) {
                that.imageLoadInterval = setInterval(function () {
                    var h = $(a).css('height');
                    if (h !== '0px') {
                        $(a).addClass('loaded');
                        clearInterval(that.imageLoadInterval);
                        that.setDialogCenter();
                    }
                }, 40);
            });
        },
        _setButtons: function () {
            var that = this;
            /*
             * Settings up buttons
             */

            var total_buttons = 0;
            if (typeof this.buttons !== 'object')
                this.buttons = {};

            $.each(this.buttons, function (key, button) {
                total_buttons += 1;
                if (typeof button === 'function') {
                    that.buttons[key] = button = {
                        action: button
                    };
                }

                that.buttons[key].text = button.text || key;
                that.buttons[key].btnClass = button.btnClass || 'btn-default';
                that.buttons[key].action = button.action || function () {
                    };
                that.buttons[key].keys = button.keys || [];

                $.each(that.buttons[key].keys, function (i, a) {
                    that.buttons[key].keys[i] = a.toLowerCase();
                });

                var button_element = $('<button type="button" class="btn ' + that.buttons[key].btnClass + '">' + that.buttons[key].text + '</button>').click(function (e) {
                    e.preventDefault();
                    var res = that.buttons[key].action.apply(that);
                    that.onAction(key);
                    that._stopCountDown();
                    if (typeof res === 'undefined' || res)
                        that.close();
                });
                that.buttons[key].el = button_element;
                that.buttons[key].setText = function (text) {
                    button_element.html(text);
                };
                that.buttons[key].addClass = function (className) {
                    button_element.addClass(className);
                };
                that.buttons[key].removeClass = function (className) {
                    button_element.removeClass(className);
                };
                that.buttons[key].disable = function () {
                    button_element.prop('disabled', true);
                };
                that.buttons[key].enable = function () {
                    button_element.prop('disabled', false);
                };
                that.buttons[key].show = function () {
                    button_element.css('display', '');
                    that.setDialogCenter();
                };
                that.buttons[key].hide = function () {
                    button_element.css('display', 'none');
                    that.setDialogCenter();
                };
                /*
                 Buttons are prefixed with $_ or $$ for quick access
                 */
                that['$_' + key] = that['$$' + key] = button_element;
                that.$btnc.append(button_element);
            });

            if (total_buttons === 0) this.$btnc.hide();
            if (this.closeIcon === null && total_buttons === 0) {
                /*
                 in case when no buttons are present & closeIcon is null, closeIcon is set to true,
                 set closeIcon to true to explicitly tell to hide the close icon
                 */
                this.closeIcon = true;
            }

            if (this.closeIcon) {
                if (this.closeIconClass) {
                    // user requires a custom class.
                    var closeHtml = '<i class="' + this.closeIconClass + '"></i>';
                    this.$closeIcon.html(closeHtml);
                }

                this.$closeIcon.click(function (e) {
                    e.preventDefault();

                    var buttonName = false;
                    var shouldClose = false;
                    var str;

                    if (typeof that.closeIcon == 'function') {
                        str = that.closeIcon();
                    } else {
                        str = that.closeIcon;
                    }

                    if (typeof str == 'string' && typeof that.buttons[str] != 'undefined') {
                        buttonName = str;
                        shouldClose = false;
                    } else if (typeof str == 'undefined' || !!(str) == true) {
                        shouldClose = true;
                    } else {
                        shouldClose = false;
                    }
                    if (buttonName) {
                        var btnResponse = that.buttons[buttonName].action.apply(that);
                        shouldClose = (typeof btnResponse == 'undefined') || !!(btnResponse);
                    }
                    if (shouldClose) {
                        that.close();
                    }
                });
                this.$closeIcon.show();
            } else {
                this.$closeIcon.hide();
            }
        },
        setTitle: function (string, force) {
            force = force || false;

            if (typeof string !== 'undefined')
                if (typeof string == 'string')
                    this.title = string;
                else if (typeof string == 'function') {
                    if (typeof string.promise == 'function')
                        console.error('Promise was returned from title function, this is not supported.');

                    var response = string();
                    if (typeof response == 'string')
                        this.title = response;
                    else
                        this.title = false;
                } else
                    this.title = false;

            if (this.isAjaxLoading && !force)
                return;

            this.$title.html(this.title || '');
        },
        setIcon: function (iconClass, force) {
            force = force || false;

            if (typeof iconClass !== 'undefined')
                if (typeof iconClass == 'string')
                    this.icon = iconClass;
                else if (typeof iconClass === 'function') {
                    var response = iconClass();
                    if (typeof response == 'string')
                        this.icon = response;
                    else
                        this.icon = false;
                }
                else
                    this.icon = false;

            if (this.isAjaxLoading && !force)
                return;

            this.$icon.html(this.icon ? '<i class="' + this.icon + '"></i>' : '');
        },
        setContentPrepend: function (string, force) {
            this.contentParsed = string + this.contentParsed;
            if (this.isAjaxLoading && !force)
                return;

            this.$content.prepend(string);
        },
        setContentAppend: function (string, force) {
            this.contentParsed = this.contentParsed + string;
            if (this.isAjaxLoading && !force)
                return;

            this.$content.append(string);
        },
        setContent: function (string, force) {
            force = force || false;
            var that = this;
            this.contentParsed = (typeof string == 'undefined') ? this.contentParsed : string;
            if (this.isAjaxLoading && !force)
                return;

            this.$content.html(this.contentParsed);
            this.setDialogCenter();
            setTimeout(function () {
                that.$body.find('input[autofocus]:visible:first').focus();
            }, 100);
        },
        loadingSpinner: false,
        showLoading: function (disableButtons) {
            this.loadingSpinner = true;
            this.$jconfirmBox.addClass('loading');
            if (disableButtons)
                this.$btnc.find('button').prop('disabled', true);

            this.setDialogCenter();
        },
        hideLoading: function (enableButtons) {
            this.loadingSpinner = false;
            this.$jconfirmBox.removeClass('loading');
            if (enableButtons)
                this.$btnc.find('button').prop('disabled', false);

            this.setDialogCenter();
        },
        ajaxResponse: false,
        contentParsed: '',
        isAjax: false,
        isAjaxLoading: false,
        _parseContent: function () {
            var that = this;
            var e = '&nbsp;';

            if (typeof this.content == 'function') {
                var res = this.content.apply(this);
                if (typeof res == 'string') {
                    this.content = res;
                }
                else if (typeof res == 'object' && typeof res.always == 'function') {
                    // this is ajax loading via promise
                    this.isAjax = true;
                    this.isAjaxLoading = true;
                    res.always(function (data, status, xhr) {
                        that.ajaxResponse = {
                            data: data,
                            status: status,
                            xhr: xhr
                        };
                        that._contentReady.resolve(data, status, xhr);
                        if (typeof that.contentLoaded == 'function')
                            that.contentLoaded(data, status, xhr);
                    });
                    this.content = e;
                } else {
                    this.content = e;
                }
            }

            if (typeof this.content == 'string' && this.content.substr(0, 4).toLowerCase() === 'url:') {
                this.isAjax = true;
                this.isAjaxLoading = true;
                var u = this.content.substring(4, this.content.length);
                $.get(u).done(function (html) {
                    that.contentParsed = html;
                }).always(function (data, status, xhr) {
                    that.ajaxResponse = {
                        data: data,
                        status: status,
                        xhr: xhr
                    };
                    that._contentReady.resolve(data, status, xhr);
                    if (typeof that.contentLoaded == 'function')
                        that.contentLoaded(data, status, xhr);
                });
            }

            if (!this.content)
                this.content = e;

            if (!this.isAjax) {
                this.contentParsed = this.content;
                this.setContent(this.contentParsed);
                that._contentReady.resolve();
            }
        },
        _stopCountDown: function () {
            clearInterval(this.autoCloseInterval);
            if (this.$cd)
                this.$cd.remove();
        },
        _startCountDown: function () {
            var that = this;
            var opt = this.autoClose.split('|');
            if (opt.length !== 2) {
                console.error('Invalid option for autoClose. example \'close|10000\'');
                return false;
            }

            var button_key = opt[0];
            var time = parseInt(opt[1]);
            if (typeof this.buttons[button_key] === 'undefined') {
                console.error('Invalid button key \'' + button_key + '\' for autoClose');
                return false;
            }

            var seconds = time / 1000;
            this.$cd = $('<span class="countdown"> (' + seconds + ')</span>')
                .appendTo(this['$_' + button_key]);

            this.autoCloseInterval = setInterval(function () {
                that.$cd.html(' (' + (seconds -= 1) + ') ');
                if (seconds === 0) {
                    that['$$' + button_key].trigger('click');
                    that._stopCountDown();
                }
            }, 1000);
        },
        _getKey: function (key) {
            // very necessary keys.
            switch (key) {
                case 192:
                    return 'tilde';
                case 13:
                    return 'enter';
                case 16:
                    return 'shift';
                case 9:
                    return 'tab';
                case 20:
                    return 'capslock';
                case 17:
                    return 'ctrl';
                case 91:
                    return 'win';
                case 18:
                    return 'alt';
                case 27:
                    return 'esc';
                case 32:
                    return 'space';
            }

            // only trust alphabets with this.
            var initial = String.fromCharCode(key);
            if (/^[A-z0-9]+$/.test(initial))
                return initial.toLowerCase();
            else
                return false;
        },
        reactOnKey: function (e) {
            var that = this;

            /*
             Prevent keyup event if the dialog is not last!
             */
            var a = $('.jconfirm');
            if (a.eq(a.length - 1)[0] !== this.$el[0])
                return false;

            var key = e.which;
            /*
             Do not react if Enter or Space is pressed on input elements
             */
            if (this.$content.find(':input').is(':focus') && /13|32/.test(key))
                return false;

            var keyChar = this._getKey(key);

            // If esc is pressed
            if (keyChar === 'esc' && this.escapeKey) {
                if (this.escapeKey === true) {
                    this.$scrollPane.trigger('click');
                }
                else if (typeof this.escapeKey === 'string' || typeof this.escapeKey === 'function') {
                    var buttonKey;
                    if (typeof this.escapeKey === 'function') {
                        buttonKey = this.escapeKey();
                    } else {
                        buttonKey = this.escapeKey;
                    }

                    if (buttonKey)
                        if (typeof this.buttons[buttonKey] === 'undefined') {
                            console.warn('Invalid escapeKey, no buttons found with key ' + buttonKey);
                        } else {
                            this['$_' + buttonKey].trigger('click');
                        }
                }
            }

            // check if any button is listening to this key.
            $.each(this.buttons, function (key, button) {
                if (button.keys.indexOf(keyChar) != -1) {
                    that['$_' + key].trigger('click');
                }
            });
        },
        _boxTopMargin: 0,
        _boxBottomMargin: 0,
        _boxWidth: 0,
        setDialogCenter: function () {
            var contentHeight;
            var paneHeight;
            var style;
            contentHeight = 0;
            paneHeight = 0;
            if (this.$contentPane.css('display') != 'none') {
                contentHeight = this.$content.outerHeight() || 0;
                paneHeight = this.$contentPane.height() || 0;
            }

            // if the child has margin top
            var children = this.$content.children();
            if (children.length != 0) {
                var marginTopChild = parseInt(children.eq(0).css('margin-top'));
                if (marginTopChild)
                    contentHeight += marginTopChild;
            }

            if (paneHeight == 0)
                paneHeight = contentHeight;

            var windowHeight = $(window).height();
            var boxHeight;

            boxHeight = (this.$body.outerHeight() - paneHeight) + contentHeight;

            var topMargin = (windowHeight - boxHeight) / 2;
            if (boxHeight > (windowHeight - (this.offsetTop + this.offsetBottom)) || !this.alignMiddle) {
                style = {
                    'margin-top': this.offsetTop,
                    'margin-bottom': this.offsetBottom
                };
                this._boxTopMargin = this.offsetTop;
                this._boxBottomMargin = this.offsetBottom;
                $('body').addClass('jconfirm-no-scroll-' + this._id);
            } else {
                style = {
                    'margin-top': topMargin,
                    'margin-bottom': this.offsetBottom,
                };
                this._boxTopMargin = topMargin;
                this._boxBottomMargin = this.offsetBottom;
                $('body').removeClass('jconfirm-no-scroll-' + this._id);
            }

            this.$contentPane.css({
                'height': contentHeight
            }).scrollTop(0);
            this.$body.css(style);

            this.setDrag();
        },
        _unwatchContent: function () {
            clearInterval(this._timer);
        },
        close: function () {
            var that = this;

            if (typeof this.onClose === 'function')
                this.onClose();

            this._unwatchContent();
            clearInterval(this.imageLoadInterval);

            /*
             unbind the window resize & keyup event.
             */
            $(window).unbind('resize.' + this._id);
            $(window).unbind('keyup.' + this._id);
            if (this.draggable) {
                $(window).unbind('mousemove.' + this._id);
                $(window).unbind('mouseup.' + this._id);
                this.$titleContainer.unbind('mousedown');
            }
            $('body').removeClass('jconfirm-no-scroll-' + this._id);
            this.$body.addClass(this.closeAnimationParsed);
            this.$jconfirmBg.addClass('jconfirm-bg-h');
            var closeTimer = (this.closeAnimation == 'none') ? 1 : this.animationSpeed;
            setTimeout(function () {
                that.$el.remove();

                if (that._lastFocused.length && $.contains(document, that._lastFocused[0])) {
                    var st = $(window).scrollTop();
                    var ot = that._lastFocused.offset().top;
                    var wh = $(window).height();
                    if (!(ot > st && ot < (st + wh))) {
                        var scrollTo = (ot - Math.round((wh / 3)));

                        if (that.scrollToPreviousElement && that.scrollToPreviousElementAnimate) {
                            $('html, body').animate({
                                scrollTop: scrollTo,
                            }, that.animationSpeed, 'swing', function () {
                                that._lastFocused.focus();
                            });
                        } else if (that.scrollToPreviousElement) {
                            $('html, body').scrollTop(scrollTo);
                        } else {
                            // do nothing.
                        }
                    } else {
                        that._lastFocused.focus();
                    }
                }

                if (typeof that.onDestroy == 'function')
                    that.onDestroy();

            }, closeTimer * 0.40);

            return true;
        },
        open: function () {
            // var that = this;
            this._buildHTML();
            this._bindEvents();
            this._open();

            return true;
        },
        _open: function () {
            var that = this;
            if (typeof that.onOpenBefore == 'function')
                that.onOpenBefore();
            this.$body.removeClass(this.animationParsed);
            this.$jconfirmBg.removeClass('jconfirm-bg-h');
            this.$body.focus();
            setTimeout(function () {
                that.$body.css(that._getCSS(that.animationSpeed, 1));
                that.$body.css({
                    'transition-property': that.$body.css('transition-property') + ', margin'
                });
                that._modalReady.resolve();
                if (typeof that.onOpen === 'function')
                    that.onOpen();
            }, this.animationSpeed);
        },
        isClosed: function () {
            return this.$el.css('display') === '';
        },
        isOpen: function () {
            return !this.isClosed();
        },
        toggle: function () {
            if (!this.isOpen())
                this.open();
            else
                this.close();
        }
    };

    jconfirm.instances = [];
    jconfirm.pluginDefaults = {
        template: '' +
        '<div class="jconfirm">' +
        '<div class="jconfirm-bg jconfirm-bg-h"></div>' +
        '<div class="jconfirm-scrollpane">' +
        '<div class="jc-bs3-container">' +
        '<div class="jc-bs3-row">' +
        '<div class="jconfirm-box-container">' +
        '<div class="jconfirm-box" role="dialog" aria-labelledby="labelled" tabindex="-1">' +
        '<div class="jconfirm-closeIcon">&times;</div>' +
        '<div class="jconfirm-title-c">' +
        '<span class="jconfirm-icon-c"></span>' +
        '<span class="jconfirm-title"></span></div>' +
        '<div class="jconfirm-content-pane">' +
        '<div class="jconfirm-content"></div>' +
        '</div>' +
        '<div class="jconfirm-buttons">' +
        '</div>' +
        '<div class="jconfirm-clear">' +
        '</div></div></div></div></div></div></div>',
        title: 'Hello',
        titleClass: '',
        type: 'default',
        typeAnimated: true,
        draggable: true,
        alignMiddle: true,
        content: 'Are you sure to continue?',
        buttons: {},
        defaultButtons: {
            ok: {
                action: function () {
                }
            },
            close: {
                action: function () {
                }
            },
        },
        contentLoaded: function () {
        },
        icon: '',
        bgOpacity: null,
        theme: 'light',
        animation: 'zoom',
        closeAnimation: 'scale',
        animationSpeed: 400,
        animationBounce: 1.2,
        escapeKey: true,
        rtl: false,
        container: 'body',
        containerFluid: false,
        backgroundDismiss: false,
        backgroundDismissAnimation: 'shake',
        autoClose: false,
        closeIcon: null,
        closeIconClass: false,
        watchInterval: 100,
        columnClass: 'col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1',
        boxWidth: '50%',
        scrollToPreviousElement: true,
        scrollToPreviousElementAnimate: true,
        useBootstrap: true,
        offsetTop: 50,
        offsetBottom: 50,
        dragWindowGap: 15,
        bootstrapClasses: {
            container: 'container',
            containerFluid: 'container-fluid',
            row: 'row',
        },
        onContentReady: function () {

        },
        onOpenBefore: function () {

        },
        onOpen: function () {

        },
        onClose: function () {

        },
        onDestroy: function () {

        },
        onAction: function () {

        }
    };
})(jQuery, window);
