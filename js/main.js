/**
 * BibleForge
 *
 * @date    10-30-08
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/// Set JSLint options.
/*global document, window, BF */
/*jslint newcap: true, undef: true, onevar: true, evil: true, plusplus: true, bitwise: true, nomen: true, strict: true, continue: true, indent: 4, white: false */

(function ()
{
    "use strict";
    
    /// Declare helper function(s) attached to the global BibleForge object (BF).
    
    /// Detect WebKit based browsers.
    ///NOTE: Since the user agent string can be modified by the user, it is not bulletproof.
    ///NOTE: !! converts data to a boolean.
    BF.is_WebKit = !!window.chrome || window.navigator.userAgent.indexOf("WebKit/") >= 0;
    
    ///NOTE: Usually, eval() and JSON.parse() are similar in speed and the Function Constructor is really slow.
    ///      However, in Chrome, eval() is really fast, the Function Constructor is even faster, and JSON.parse() is ridiculously slow.
    ///      Therefore, use the Function Constructor for Chrome and JSON.parse() for all others.
    ///NOTE: It could also check to make sure that the string starts with a curly bracket ({) straight bracket ([) double quote (") or number (hyphen (-) or digit) to attempt to ensure that it is valid JSON.
    /**
     * Safely (and quickly) parse JSON.
     *
     * A cross browser JSON parsing solution.
     *
     * @param  str (string) The string to parse.
     * @return Returns the value of the JSON or "" if an empty string.
     */
    BF.parse_json = window.chrome ? function (str)
    {
        return str === "" ? "" : (new Function("return " + str))();
    } : function (str)
    {
        return str === "" ? "" : JSON.parse(str);
    };
    
    /**
     * Create an easy to use Ajax object.
     *
     * @example var ajax = new BF.Create_easy_ajax();
     * @return  Returns an object that makes ajax easier.
     */
    BF.Create_easy_ajax = function ()
    {
        var ajax = new window.XMLHttpRequest(),
            ajax_timeout;
    
        return {
            abort: function ()
            {
                /// Is a query in progress?  If readyState > 0 and < 4, it needs to be aborted.
                if (ajax.readyState % 4) {
                    /// Stop it from retrying first.
                    window.clearTimeout(ajax_timeout);
                    ajax.abort();
                }
            },
            is_busy: function ()
            {
                ///NOTE: Anything not 0 or 4 is busy.
                return ajax.readyState % 4;
            },
            query: (function ()
            {
                /**
                 * Send the Ajax request and start timeout timer.
                 *
                 * @return NULL.
                 * @note   This code is a separate function to reduce code duplication.
                 * @note   Called by the BF.Create_easy_ajax.query().
                 */
                function send_query(message, timeout, retry)
                {
                    ajax.send(message);
                    
                    if (timeout) {
                        /// Begin the timeout timer to ensure that the download does not freeze.
                        ajax_timeout = window.setTimeout(function ()
                        {
                            ajax.abort();
                            if (retry) {
                                send_query(message, timeout, retry);
                            }
                        }, timeout);
                    }
                }
                
                /**
                 * Send an Ajax request to the server.
                 *
                 * @example query("POST", "query.php", "q=search", function (data) {}, function (status, data) {}, 10000, true);
                 * @param   method    (string)              The HTTP method to use (GET || POST).
                 * @param   path      (string)              The URL to query.
                 * @param   message   (string)   (optional) The variables to send (URI format: "name1=value1&name2=value%202").
                 * @param   onsuccess (function) (optional) The function to run on a successful query.
                 * @param   onfailure (function) (optional) The function to run if the query fails.
                 * @param   timeout   (number)   (optional) How long to wait before giving up on the script to load (in milliseconds).
                 *                                          A falsey value (such as 0 or FALSE) disables timing out.         (Default is 10,000 milliseconds.)
                 * @param   retry     (boolean)  (optional) Whether or not to retry loading the script if a timeout occurs.  (Default is TRUE.)
                 * @return  NULL.
                 * @todo    Determine if it should change a method from GET to POST if it exceeds 2,083 characters (IE's rather small limit).
                 */
                return function (method, path, message, onsuccess, onfailure, timeout, retry)
                {
                    /// Determine if arguments were passed to the last two parameters.  If not, set the defaults.
                    if (typeof timeout === "undefined") {
                        /// Default to 10 seconds.
                        ///TODO: This should be dynamic based on the quality of the connection to the server.
                        timeout = 10000;
                    }
                    
                    if (typeof retry === "undefined") {
                        retry = true;
                    }
                    
                    ///TODO: determine if the first parameter should be different.
                    ajax.open(method, path);
                    /// Without the correct content-type, the data in the message will not become variables on the server.
                    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    ajax.onreadystatechange = function ()
                    {
                        if (ajax.readyState === 4) {
                            /// Stop the timeout timer that may be running so it does not try again.
                            window.clearTimeout(ajax_timeout);
                            
                            /// Was the request successful?
                            if (ajax.status === 200) {
                                ///NOTE: It is not eval'ed here because it may be needed to be eval'ed in a different (and safer) context or not be parsed at all.
                                if (onsuccess) {
                                    onsuccess(ajax.responseText);
                                }
                            } else {
                                if (onfailure) {
                                    onfailure(ajax.status, ajax.responseText);
                                }
                                
                                /// Should it retry?
                                ///NOTE: ajax.status !== 0 prevents it from retrying when it was aborted intentionally.
                                if (retry && ajax.status !== 0) {
                                    send_query(message, timeout, retry);
                                }
                            }
                        }
                    };
                    send_query(message, timeout, retry);
                };
            }())
        };
    };
    
    /**
     * Load some Javascript and optionally send it some variables from the closure.
     *
     * @example BF.include("path/to/script.js", {needed_var: var_from_the_closure}, 20000, false);
     * @example BF.include("js/secondary.js",   {topBar: viewPort.firstChild, viewPort_num: viewPort_num});
     * @param   path    (string)             The location of the JavaScript to load.
     * @param   context (object)             The variable to send to the included JavaScript.
     * @param   timeout (number)  (optional) How long to wait before giving up on the script to load (in milliseconds).
     *                                       A falsey value (such as 0 or FALSE) disables timing out.         (Default is 10,000 milliseconds.)
     * @param   retry   (boolean) (optional) Whether or not to retry loading the script if a timeout occurs.  (Default is TRUE.)
     * @return  NULL.   Runs code.
     * @todo    If the code has already been loaded, simply run the script without re-downloading anything.
     * @todo    Determine if it would be better to use a callback function rather than passing context.
     */
    BF.include = (function ()
    {
        /**
         * Eval code in a neutral scope.
         *
         * @param  code (string) The string to eval.
         * @return The result of the eval'ed code.
         * @note   Called when the Ajax request returns successfully.
         * @note   This is used to prevent included code from having access to the variables inside of the function's scope.
         */
        function evaler(code)
        {
            return eval(code);
        }
        
        return (function ()
        {
            /// Stores files that have already been loaded so that they do not have to be downloaded more than once.
            ///TODO: Use the data in this variable and maybe make a way to ignore the cache is needed.
            var files = {};
            
            return function (path, context, timeout, retry)
            {
                var ajax = new BF.Create_easy_ajax();
                
                ajax.query("GET", path, "", function (response)
                {
                    files[path] = evaler(response);
                    ///TODO: Determine what kind of error handling should be done.
                    if (typeof files[path] === "function") {
                        files[path](context);
                    }
                }, null, timeout, retry);
            };
        }());
    }());
    
    
    /**
     * Gets the distance of an object from the top of the scroll.
     *
     * @example get_top_position(element);
     * @param   obj (element) An element on the page.
     * @return  Returns the distance of obj from the top of the scroll.
     * @note    Called by content_manager.scroll_to_verse() and wrench button onclick() in secondary.js.
     */
    BF.get_position = function (obj)
    {
        var left_pos = 0,
            top_pos  = 0;
        
        /// Does the object have an element above it (i.e., offsetParent)?
        if (obj.offsetParent) {
            do {
                left_pos += obj.offsetLeft;
                top_pos  += obj.offsetTop;
                
                obj = obj.offsetParent;
            ///NOTE: The variable obj is falsey (null) when no more parents exist.
            } while (obj);
        }
        
        return {
            left: left_pos,
            top:  top_pos
        };
    };
    
    
    /**
     * Formats a positive number with appropriate commas.
     *
     * @example format_number(1000); /// Returns "1,000"
     * @param   num (positive number) The number to format.
     * @return  A formatted number as a string.
     * @note    To be faster, this will not format a negative number.
     */
    BF.format_number = function (num)
    {
        var re;
        
        if (num < 1000) {
            return num;
        }
        
        num = String(num);
        re  = /^([0-9]+)([0-9][0-9][0-9])/;
        
        while (re.test(num)) {
            num = num.replace(re, "$1,$2");
        }
        
        return num;
    };
    
    
    /**
     * Change an existing CSS rule.
     *
     * @example BF.changeCSS(".q", "color: #000;")); /// Changes the ".q" rule (i.e., the "q" class) to have a text color of black.
     * @param   selector   (string)             The name of the rule to replace.
     * @param   new_CSS    (string)             The CSS to use for the specified selector.
     * @param   insert     (boolean) (optional) Whether or not to insert a new css rule or change an existing one.
     * @param   change_all (boolean) (optional) Whether or not to check every rule.  If falsey, it will stop after finding one rule that matches selector.
     * @return  NULL.  Possibly changes the CSS.
     * @note    Called when the user changes the red_letters setting.
     */
    BF.changeCSS = function (selector, new_CSS, insert, change_all)
    {
        var CSS_rules,
            CSS_rules_len,
            i = 0,
            ///TODO: Determine if it should loop through all styles sheets.
            style_sheet = document.styleSheets[0];
        
        if (insert) {
            /// Mozilla/WebKit/Opera/IE9
            ///NOTE: IE8- uses addRule(selector, declaration, [index]).
            style_sheet.insertRule(selector + "{" + new_CSS + "}", 0);
        } else {
            /// Get the styles (cssRules) for Mozilla/WebKit/Opera/IE9 and (rules) for IE8-.
            CSS_rules     = style_sheet.cssRules ? style_sheet.cssRules : style_sheet.rules;
            CSS_rules_len = CSS_rules.length;
            while (i < CSS_rules_len) {
                if (CSS_rules[i].selectorText === selector) {
                    CSS_rules[i].style.cssText = new_CSS;
                    if (!change_all) {
                        return;
                    }
                }
                i += 1;
            }
        }
    };
    
    
    /**
     * Determine whether or not a psalm has a title.
     *
     * @param  c (number) The psalm (i.e., chapter) to check.
     * @return A boolean indicating if the psalm has a title
     */
    BF.psalm_has_title = function (c)
    {
        return !(c <= 2 || c === 10 || c === 33 || c === 43 || c === 71 || c === 91 || (c >= 93 && c <= 97) || c === 99 || (c >= 104 && c <= 107) || (c >= 111 && c <= 119) || (c >= 135 && c <= 137) || c >= 146);
    };
    
    
    /**
     * Create a verse ID from the book, chapter, and verse reference.
     *
     * @example BF.create_verse_id({b: 1, c: 2, v: 3}); /// Returns 1002003
     * @param   verse_obj (object) An object containing the book, chapter, and verse to be converted: {b: book, c: chapter, v: verse}
     * @return  A formatted string representing the verse ID: [B]BCCCVVV
     */
    BF.create_verse_id = function (verse_obj)
    {
        var zeros = ["", "00", "0", ""];
        
        return verse_obj.b + zeros[String(verse_obj.c).length] + verse_obj.c + zeros[String(verse_obj.v).length] + verse_obj.v;
    };
    
    
    /**
     * Get the book, chapter, and verse numbers from a verse ID.
     *
     * @example BF.get_b_c_v(1002003); /// Returns {b: 1, c: 2, v: 3}
     * @param   verseID (number || string) The verse ID to convert.
     * @return  An object containing the book, chapter, and verse numbers: {b: book, c: chapter, v: verse}
     */
    BF.get_b_c_v = function (verseID)
    {
        var c,
            v;
        
        v = verseID % 1000;
        c = ((verseID - v) % 1000000) / 1000;
        
        return {
            b: (verseID - v - c * 1000) / 1000000,
            c: c,
            v: v
        };
    };
    
    
    /// Determine if CSS transitions are supported by the browser.
    ///NOTE: All of these variables currently require vendor specific prefixes.
    BF.cssTransitions = typeof document.body.style.webkitTransition !== "undefined" || typeof document.body.style.MozTransition !== "undefined" || typeof document.body.style.OTransition !== "undefined";
    
    
    /**
     * Initialize the BibleForge environment.
     *
     * This function is used to house all of the code used by BibleForge,
     * expect for language specific code, which is stored in js/lang/LOCALE.js.
     *
     * @param  viewPort     (object) The HTML element which encapsulates all of the other objects.
     * @param  searchForm   (object) The <form> element which contains the text box and button.
     * @param  q_obj        (object) The <input> element the user types into.
     * @param  page         (object) The HTML element which contains all of the Bible contents.
     * @param  infoBar      (object) The HTML element that displays information about the lookups and searches.
     * @param  topLoader    (object) The HTML element which displays the loading image above the text.
     * @param  bottomLoader (object) The HTML element which displays the loading image below the text.
     * @param  doc_docEl    (object) The document.documentElement element (the HTML element).
     * @return NULL.  Some functions are attached to events and the rest accompany them via closure.
     */
    BF.create_viewport = function (viewPort, searchForm, q_obj, page, infoBar, topLoader, bottomLoader, doc_docEl)
    {
        var run_new_query;
        
        (function ()
        {
            var viewPort_num,
                
                /// Query type "constants"
                verse_lookup       = 1,
                mixed_search       = 2,
                standard_search    = 3,
                grammatical_search = 4,
                
                /// Direction "constants"
                additional = 1,
                previous   = 2,
                
                topBar_height = topLoader.offsetHeight,
                
                /// Objects
                content_manager,
                settings,
                query_manager;
            
            /// Keep track of which view port this is.
            ///NOTE: In the future, there may be a split view mode.  Currently, this is NOT used.
            if (!BF.viewPort_count) {
                BF.viewPort_count = 0;
            }
            
            viewPort_num = BF.viewPort_count;
            BF.viewPort_count += 1;
            
            /**
             * Load settings.
             */
            (function ()
            {
                /**
                 * Create an object with getter and setter abilities.
                 *
                 * @param  cur_val  (mixed)    (optional) The default value.
                 * @param  onchange (function) (optional) The function to be called after the set method is called.
                 * @return An object containing get and set methods.
                 * @note   This is used to handle data in the settings object.
                 * @todo   Determine if there should be a validate_change function as a parameter that can accept or reject a change.
                 * @todo   Determine if it is a good idea to delete this and other functions after they are no longer needed.
                 */
                function create_get_set(cur_val, onchange)
                {
                    return {
                        get: function ()
                        {
                            return cur_val;
                        },
                        set: function (new_val)
                        {
                            /// Temporarily store the original value to be sent to the onchange function.
                            var old_val = cur_val;
                            
                            cur_val = new_val;
                            
                            /// Optionally, run a function after the value is changed.
                            if (onchange) {
                                window.setTimeout(function ()
                                {
                                    onchange({old_val: old_val, new_val: new_val});
                                }, 0);
                            }
                        }
                    };
                }
                
                ///TODO: Determine how this should be created.
                settings = {
                    view: {
                        in_paragraphs: create_get_set(true, function ()
                        {
                            /// Handle changing paragraph mode.
                            
                            /// If the last query was a search, nothing needs to be done Since only verse lookups are affected by paragraph mode.
                            if (query_manager.query_type !== verse_lookup) {
                                return;
                            }
                            
                            /// Are there any verses displayed on the scroll?
                            if (content_manager.top_verse !== false) {
                                /// Clear the scroll because the view is changing dramatically.
                                ///FIXME: This should reload the verses.
                                ///FIXME: It does not necessarily need to reload the verses if switching from paragraph mode to non-paragraph mode.
                                content_manager.clear_scroll();
                            }
                        }),
                        red_letters: create_get_set(true, function (values)
                        {
                            /// Alternate between red and black letters.
                            ///TODO: Add other options, such as custom color, and (in the future) highlighting of other people's words (e.g., highlight the words of Paul in blue).
                            BF.changeCSS(".q", "color: " + (values.new_val ? "#D00;" : "#000;"));
                        })
                    },
                    system: {
                        line_height: create_get_set(19, function () {})
                    }
                };
            }());
            
            /******************************
             * Start of Scrolling Closure *
             ******************************/
            
            /**
             * Create the functions that handle the scrolling of the page and other related functions.
             *
             * @return Returns an object with functions for adding content, updating the verse range, and scrollng the view.
             */
            content_manager = (function ()
            {
                var cached_count_bottom  = 0,
                    cached_count_top     = 0,
                    cached_verses_bottom = [],
                    cached_verses_top    = [],
                    
                    has_reached_top,
                    has_reached_bottom,
                    
                    /// Create functions that need to be declared in a different scope or with functions in their closure.
                    add_content_if_needed,
                    scroll_view_to,
                    update_verse_range;
                
                /**
                 * The scrolling closure
                 */
                (function ()
                {
                    var scroll_pos = 0;
                    
                    /**
                     * Scroll the page to a specific point.
                     *
                     * @param  y      (number)             The Y position to scroll to (i.e, vertical position).
                     * @param  x      (number)  (optional) The X position to scroll to (i.e, horizontal position).  If left undefined, it will maintain the current Y position.
                     * @param  smooth (boolean) (optional) Whether or not to scroll smoothly.  By default, or if falsey, it will scroll instantaneously.
                     * @return NULL.
                     * @note   The y value is first because x value is rarely used.
                     * @note   Called by remove_excess_content_top(), add_content_top_if_needed(), scroll_to_verse(), write_verses(), handle_new_verses() and occasionally (IE only) by remove_excess_content_bottom() and add_content_bottom_if_needed().
                     */
                    scroll_view_to = function (y, x, smooth, allow_scroll_event)
                    {
                        /// A small amount of extra padding is added just to ensure that the padding element will be large enough.
                        var extra_padding = 10,
                            padding_el,
                            padding_interval,
                            pixels_needed;
                        
                        if (typeof x === "undefined" || x === null) {
                            /// IE8- does not set pageXOffset.
                            /*@cc_on
                                @if (@_jscript_version < 9)
                                    window.pageXOffset = document.documentElement.scrollLeft;
                                @end
                            @*/
                            /// Preserve the current x position by default.
                            x = window.pageXOffset;
                        }
                        
                        if (!smooth) {
                            if (!allow_scroll_event) {
                                scroll_pos = y;
                            }
                            
                            /// Is the scroll position not the top of the page.
                            if (scroll_pos > 0) {
                                /// Calculate how many pixels (if any) need to be added in order to be able to scroll to the specified position.
                                /// If the scroll position is near the bottom (e.g., Revelation 22:21 or Proverbs 28:28) there needs to be extra space on the bottom.
                                pixels_needed = doc_docEl.clientHeight - (document.body.clientHeight - scroll_pos);
                                if (pixels_needed > 0) {
                                    padding_el = document.createElement("div");
                                    
                                    padding_el.style.height = (pixels_needed + extra_padding) + 'px';
                                    viewPort.insertBefore(padding_el, null);
                                    
                                    /// Create a timer to check to see if the padding is no longer needed.
                                    ///NOTE: The padding element should be removed when more text loaded or the user scrolls up.
                                    padding_interval = window.setInterval(function ()
                                    {
                                        ///TODO: Document what scrollHeight, pageYOffset, and clientHeight actually measure.
                                        if (doc_docEl.scrollHeight - (window.pageYOffset + doc_docEl.clientHeight) > pixels_needed + extra_padding) {
                                            viewPort.removeChild(padding_el);
                                            window.clearInterval(padding_interval);
                                        }
                                    }, 1000);
                                }
                            }
                            
                            window.scrollTo(x, y);
                        }
                    };
                    
                    (function ()
                    {
                        var buffer_rem = 10000, /// In milliseconds
                            
                            checking_excess_content_bottom = false,
                            checking_excess_content_top    = false,
                            
                            remove_content_bottom_timeout,
                            remove_content_top_timeout,
                            remove_speed = 3000; /// In milliseconds
                        
                        ///TODO: Determine if remove_excess_content_top and remove_excess_content_bottom can be combined.
                        /**
                         * Remove content that is past the top of screen and store in cache.
                         *
                         * @return NULL.  Removes content from the page if required.
                         * @note   Called by scrolling() via setTimeout().  May call itself, too.
                         */
                        function remove_excess_content_top()
                        {
                            var child = page.firstChild,
                                child_height;
                            
                            if (child === null) {
                                return;
                            }
                            
                            ///NOTE: Mozilla ignores .clientHeight, .offsetHeight, .scrollHeight for some objects (not <div> tags, however) when in standards mode (i.e., a doctype is present).
                            ///      If Mozilla has problems in the future, you can use this as a replacement:
                            ///      child_height = parseInt(getComputedStyle(child, null).getPropertyValue("height"));
                            
                            ///NOTE: Opera wrongly subtracts the scroll position from .offsetTop.
                            
                            child_height = child.clientHeight;
                            
                            ///NOTE: Mozilla also has scrollMaxY, which is slightly different from document.documentElement.scrollHeight (document.body.scrollHeight should work too).
                            
                            /// Is the object in the remove zone, and is its height less than the remaining space to scroll to prevent jumping?
                            if (child_height + buffer_rem < window.pageYOffset && child_height < doc_docEl.scrollHeight - window.pageYOffset - doc_docEl.clientHeight) {
                                /// Store the content in the cache, and then add 1 to the outer counter variable so that we know how much cache we have.
                                cached_verses_top[cached_count_top] = child.innerHTML;
                                cached_count_top += 1;
                                ///TODO: Determine if setting the display to "none" actually helps at all.
                                /// Remove quickly from the page.
                                child.style.display = "none";
                                /// Calculate and set the new scroll position.
                                /// Because content is being removed from the top of the page, the rest of the content will be shifted upward.
                                /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was removed.
                                scroll_view_to(window.pageYOffset - child_height);
                                
                                page.removeChild(child);
                                
                                /// Indicates to the user that content will load if they scroll to the top of the screen.
                                topLoader.style.visibility = "visible";
                                
                                /// Check again soon for more content to be removed.
                                remove_content_top_timeout = window.setTimeout(remove_excess_content_top, remove_speed);
                            } else {
                                checking_excess_content_top = false;
                            }
                        }
                        
                        
                        /**
                         * Remove content from below the screen and store in cache.
                         *
                         * @return  NULL.  Removes content from the page if required.
                         * @note    Called by scrolling() via setTimeout().  May call itself, too.
                         */
                        function remove_excess_content_bottom()
                        {
                            var child = page.lastChild;
                            
                            if (child === null) {
                                return;
                            }
                            
                            /// Is the element is in the remove zone?
                            if (child.offsetTop > window.pageYOffset + doc_docEl.clientHeight + buffer_rem) {
                                /// Store the content in the cache, and then add 1 to the outer counter variable so that we know how much cache we have.
                                cached_verses_bottom[cached_count_bottom] = child.innerHTML;
                                cached_count_bottom += 1;
                                
                                page.removeChild(child);
                                
                                /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                                ///TODO: Determine if this is still an issue with IE9.
                                /*@cc_on
                                    scroll_view_to(window.pageYOffset);
                                @*/
                                
                                /// End execution to keep the checking_content_top_interval running because there might be even more content that should be removed.
                                bottomLoader.style.visibility = "visible";
                                
                                /// Check again soon for more content to be removed.
                                remove_content_bottom_timeout = window.setTimeout(remove_excess_content_bottom, remove_speed);
                            } else {
                                checking_excess_content_bottom = false;
                            }
                        }
                        
                        
                        (function ()
                        {
                            var scroll_check_count = 0;
                            
                            /**
                             * The onscroll event.
                             *
                             * When the page scrolls this figures out the direction of the scroll and
                             * calls specific functions to determine whether content should be added or removed.
                             *
                             * @return NULL.  May call other functions via setTimeout().
                             * @note   Called when the window scrolls.  It may also call itself.
                             * @note   Called by the onscroll event.
                             * @note   Could use the wheel event if the scroll bars need to be invisible.
                             * @todo   Determine how to handle scrolling if there were multiple viewports (i.e., split view).
                             */
                            function scrolling()
                            {
                                /// Trick IE 8- into understanding pageYOffset.
                                /*@cc_on
                                    @if (@_jscript_version < 9)
                                        window.pageYOffset = doc_docEl.scrollTop;
                                    @end
                                @*/
                                var new_scroll_pos = window.pageYOffset,
                                    scrolling_down;
                                
                                /// Has the scroll position actually not changed?
                                ///NOTE: IE/Opera sometimes don't update scroll position until after this function is run.
                                ///      Mozilla/WebKit can have the same problem.
                                if (new_scroll_pos === scroll_pos) {
                                    /// Should we wait a moment and see if the scroll position changes.
                                    scroll_check_count += 1;
                                    if (scroll_check_count < 10) {
                                        window.setTimeout(scrolling, 30);
                                    } else {
                                        /// Reset the counter and do not check anymore.
                                        scroll_check_count = 0;
                                    }
                                    return;
                                }
                                scroll_check_count = 0;
                                
                                
                                scrolling_down = (new_scroll_pos > scroll_pos);
                                
                                /// This keeps track of the current scroll position so we can tell the direction of the scroll.
                                scroll_pos = new_scroll_pos;
                                
                                /// Find and indicate the range of verses displayed on the screen.
                                update_verse_range();
                                
                                ///TODO: Determine if this function stop if the initial query is still being loaded?  How often would this occur?
                                
                                /// Since the page is scrolling, we need to determine if more content needs to be added or if some content should be hidden.
                                
                                if (scrolling_down) {
                                    add_content_if_needed(additional);
                                    checking_excess_content_top = true;
                                } else {
                                    add_content_if_needed(previous);
                                    checking_excess_content_bottom = true;
                                }
                                
                                if (checking_excess_content_top) {
                                    window.clearTimeout(remove_content_top_timeout);
                                    remove_content_top_timeout    = window.setTimeout(remove_excess_content_top,    remove_speed);
                                }
                                if (checking_excess_content_bottom) {
                                    window.clearTimeout(remove_content_bottom_timeout);
                                    remove_content_bottom_timeout = window.setTimeout(remove_excess_content_bottom, remove_speed);
                                }
                            }
                            
                            ///NOTE: The reason why scrolling() not anonymous is because it can be recursive.
                            window.addEventListener("scroll", scrolling, false);
                        }());
                    }());
                }());
                
                /**
                 * Find a verse element that is within a certain Y coordinate on the screen.
                 *
                 * @example verse = get_verse_at_position(window.pageYOffset + topBar_height + 8,  true,  page); /// Could return {b: 1, c: 1, v: 1} for Genesis 1:1.
                 * @param   the_pos        (number)  The vertical position on the page.
                 * @param   looking_upward (boolean) Whether the verses at the top or bottom of the page.
                 * @param   parent_el      (element) The HTML element that ultimately contains the verse.
                 * @return  Returns an object containing the book, chapter, and verse of the verse element.  Format {b: BB, c: CCC, v: VVV}.
                 * @note    Called by update_verse_range() and itself.
                 */
                function get_verse_at_position(the_pos, looking_upward, parent_el)
                {
                    var b,
                        c,
                        el,
                        el_offset_height,
                        el_offset_top,
                        el_start_at,
                        looked_next,
                        looked_previous,
                        possible_el,
                        parent_el_children_count = parent_el.childNodes.length,
                        parent_el_top            = parent_el.offsetTop,
                        v,
                        verse_id;
                    
                    ///TODO: Rewrite this function to use document.elementFromPoint(clientX, clientY).
                    ///NOTE: Old versions of WebKit use pageX and pageY.
                    
                    /// Make an educated guess as to which element to start with to save time.
                    ///TODO: Determine if page.height could be used instead of doc_docEl.scrollHeight.
                    el_start_at = Math.round(parent_el_children_count * ((the_pos - parent_el_top) / parent_el.offsetHeight));
                    
                    if (el_start_at < 1) {
                        el_start_at = 1;
                    }
                    
                    if (el_start_at > parent_el_children_count) {
                        el = parent_el.lastChild;
                    } else {
                        el = parent_el.childNodes[el_start_at - 1];
                    }
                    
                    /// Were no elements found?  (If so, then there is nothing to do.)
                    if (!el) {
                        return false;
                    }
                    
                    looked_next     = false;
                    looked_previous = false;
                    
                    do {
                        el_offset_top    = el.offsetTop;
                        el_offset_height = el.offsetHeight + el_offset_top;
                        
                        /// Is the element somewhere between the position in question?
                        if (the_pos >= el_offset_top && the_pos <= el_offset_height) {
                            /// The element was found.
                            break;
                        } else {
                            /// Is the position in question lower?
                            if (the_pos > el_offset_top) {
                                el = el.nextSibling;
                                looked_next     = true;
                            } else {
                                el = el.previousSibling;
                                looked_previous = true;
                            }
                            /// Is it stuck in an infinite loop?  (If so, then give up.)
                            if (looked_next && looked_previous) {
                                return false;
                            }
                        }
                    } while (el !== null);
                    
                    /// Were no appropriate elements found?
                    if (el === null) {
                        /// If we found some elements, but not enough, just use the last element (e.g., when scrolling to the very end of the Bible, all of the verses are past the bottom).
                        if (looked_next) {
                            el = parent_el.lastChild;
                        } else {
                            return false;
                        }
                    }
                    
                    /// An element was found.
                    
                    /// Does the element contain a verse, or do we need to look inside the element?
                    switch (el.className) {
                    case "verse":
                    case "search_verse":
                    case "first_verse":
                        /// Check to see if other verses in the paragraph are also visible.
                        ///NOTE: When in paragraph form, multiple verses could share the same Y coordinates; therefore, we need to keep checking for more verses that may also be at the same Y coordinate.
                        ///NOTE: Only verses can be on the same line.  Chapter and book elements may have sibling elements that are not verses (like paragraph elements).
                        while ((looking_upward ? (possible_el = el.previousSibling) : (possible_el = el.nextSibling)) !== null && the_pos >= possible_el.offsetTop && the_pos <= possible_el.offsetTop + possible_el.offsetHeight) {
                            el = possible_el;
                        }
                        ///NOTE: Intentional fall through
                    /// These elements will never have another verse on the same line, so we can skip the above checking.
                    case "chapter":
                    case "book":
                    case "short_book":
                    case "psalm_title":
                    case "subscription":
                        /// Found the verse, so calculate the verseID and call the success function.
                        ///NOTE: No radix is used because the number should never begin with a leading 0 and suppling the radix slows down Mozilla (Firefox 3.6-) tremendously.
                        verse_id = window.parseInt(el.id);
                        
                        v = verse_id % 1000;
                        c = ((verse_id - v) % 1000000) / 1000;
                        b = (verse_id - v - c * 1000) / 1000000;
                        
                        return {b: b, c: c, v: v, verse_id: verse_id};
                    default:
                        /// The verse has not yet been found.
                        return get_verse_at_position(the_pos, looking_upward, el);
                    }
                    
                    ///TODO: Determine if we should return parent_el.firstChild if looked_previous or if that might cause bugs.
                }
                
                
                /**
                 * Create add_content_if_needed().
                 *
                 * @return A function that checks if more content is needed.
                 * @note   Called immediately.
                 * @todo   This should be done better.
                 */
                add_content_if_needed = (function ()
                {
                    var buffer_add = 1000; /// In milliseconds
                    
                    /**
                     * Add content to bottom of the page (off the screen)
                     *
                     * @example add_content_bottom_if_needed();
                     * @return  NULL.  Adds content to the page if needed.
                     * @note    Called by scrolling() via setTimeout().
                     */
                    function add_content_bottom_if_needed()
                    {
                        var child = page.lastChild,
                            newEl;
                        
                        if (child === null) {
                            return;
                        }
                        
                        /// Is the user scrolling close to the bottom of the page?
                        if (child.offsetTop + child.clientHeight < window.pageYOffset + doc_docEl.clientHeight + buffer_add) {
                            /// Can the content be grabbed from cache?
                            if (cached_count_bottom > 0) {
                                newEl = document.createElement("div");
                                /// First subtract 1 from the outer counter variable to point to the last cached passage, and then retrieve the cached content.
                                cached_count_bottom -= 1;
                                newEl.innerHTML = cached_verses_bottom[cached_count_bottom];
                                ///NOTE: This is actually works like insertAfter() (if such a function existed).
                                ///      By using "null" as the second parameter, it tells it to add the element to the end.
                                page.insertBefore(newEl, null);
                                
                                /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                                /*@cc_on
                                    scroll_view_to(window.pageYOffset);
                                @*/
                                
                                /// Check to see if we need to add more content.
                                add_content_if_needed(additional);
                            } else {
                                /// Did the user scroll all the way to the very bottom?  (If so, then there is no more content to be gotten.)
                                if (has_reached_bottom) {
                                    bottomLoader.style.visibility = "hidden";
                                    return;
                                }
                                /// Get more content.
                                query_manager.query_additional();
                            }
                        }
                    }
                    
                    
                    /**
                     * Add content to top of the page (off the screen)
                     *
                     * @example setTimeout(add_content_top_if_needed, lookup_speed_scrolling);
                     * @return  NULL.  Adds content to the page if needed.
                     * @note    Called by add_content_if_needed() via setTimeout().
                     */
                    function add_content_top_if_needed()
                    {
                        var child = page.firstChild,
                            newEl;
                        
                        if (child === null) {
                            return;
                        }
                        
                        /// Is the user scrolling close to the top of the page?
                        if (buffer_add > window.pageYOffset) {
                            /// Can the content be grabbed from cache?
                            if (cached_count_top > 0) {
                                newEl = document.createElement("div");
                                
                                /// First subtract 1 from the outer counter variable to point to the last cached passage, and then retrieve the cached content.
                                cached_count_top -= 1;
                                newEl.innerHTML = cached_verses_top[cached_count_top];
                                
                                page.insertBefore(newEl, child);
                                
                                /// The new content that was just added to the top of the page will push the other contents downward.
                                /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
                                scroll_view_to(window.pageYOffset + newEl.clientHeight);
                                
                                /// Check to see if we need to add more content.
                                add_content_if_needed(previous);
                            } else {
                                /// Did the user scroll all the way to the very top?  (If so, then there is no more content to be gotten.)
                                if (has_reached_top) {
                                    topLoader.style.visibility = "hidden";
                                    return;
                                }
                                /// Get more content.
                                query_manager.query_previous();
                            }
                        }
                    }
                    
                    /**
                     * Find a verse element that is within a certain Y coordinate on the screen.
                     *
                     * @example add_content_if_needed(additional);
                     * @param   direction (integer) The direction that verses should be added: additional || previous.
                     * @return  Null.  A function is run after a delay that may add verses to the page.
                     * @note    Called by add_content_bottom_if_needed(), add_content_top_if_needed(), handle_new_verses(), window.onresize(), and scrolling().
                     * @todo    Get rid of this unnecessary function.
                     */
                    return function (direction)
                    {
                        var lookup_delay = 50; /// In milliseconds
                        
                        if (direction === additional) {
                            window.setTimeout(add_content_bottom_if_needed, lookup_delay);
                        } else {
                            window.setTimeout(add_content_top_if_needed,    lookup_delay);
                        }
                    };
                }());
                
                
                /**
                 * Creates update_verse_range().
                 *
                 * @return A function that runs update_verse_range_delayed() after a short delay if needed.
                 * @note   Called by window.onresize(), scrolling(), and write_verses().
                 * @note   The anonymous function runs once and returns a small function with the bigger update_verse_range_delayed() in the closure.
                 */
                update_verse_range = (function ()
                {
                    var looking_up_verse_range = false;
                    
                    /**
                     * Determine and set the range of verses currently visible on the screen.
                     *
                     * @return Null.  The verse range is updated if need be.
                     * @note   Called by update_verse_range().
                     */
                    function update_verse_range_delayed()
                    {
                        var new_title,
                            query_type,
                            ref_range,
                            verse1,
                            verse2;
                        
                        ///NOTE: Check a few pixels (8) below what is actually in view so that it finds the verse that is actually readable.
                        verse1 = get_verse_at_position(window.pageYOffset + topBar_height + 8,  true,  page);
                        
                        /// If a verse was found, check for the bottom verse.
                        ///NOTE: Check a few pixels (14) above what is actually in view so that it finds the verse that is actually readable.
                        ///NOTE: These are combined into one if statement to prevent code duplication.
                        if (verse1 === false || (verse2 = get_verse_at_position(window.pageYOffset + doc_docEl.clientHeight - 14, false, page)) === false) {
                            looking_up_verse_range = false;
                            
                            /// Since the entire verse range could not be found, remove stored verses.
                            content_manager.top_verse    = false;
                            content_manager.bottom_verse = false;
                            
                            ///TODO: Try again?
                            return;
                        }
                        
                        /// The titles in the book of Psalms are referenced as verse zero (cf. Psalm 3).
                        /// The subscriptions at the end of Paul's epistles are referenced as verse 255 (cf. Romans 16).
                        verse1.full_verse = (verse1.v === 0 ? BF.lang.title : (verse1.v === 255 ? BF.lang.subscription : verse1.v));
                        verse2.full_verse = (verse2.v === 0 ? BF.lang.title : (verse2.v === 255 ? BF.lang.subscription : verse2.v));
                        
                        /// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
                        ///NOTE: verse2.full_book is set here even though it is not always needed now,
                        ///      but since these variables are stored as top_verse and bottom_verse it might be used later.
                        verse1.full_book = (verse1.b === 19 ? BF.lang.psalm : BF.lang.books_short[verse1.b]);
                        verse2.full_book = (verse2.b === 19 ? BF.lang.psalm : BF.lang.books_short[verse2.b]);
                        
                        ///NOTE: \u2013 is Unicode for the en dash (–) (HTML: &ndash;).
                        ///TODO: Determine if the colons should be language specified.
                        /// Are the books the same?
                        if (verse1.b === verse2.b) {
                            /// Are the chapters the same?
                            if (verse1.c === verse2.c) {
                                /// Are the verses the same?
                                if (verse1.v === verse2.v) {
                                    ref_range = verse1.full_book + " " + verse1.c + ":" + verse1.full_verse;
                                } else {
                                    ref_range = verse1.full_book + " " + verse1.c + ":" + verse1.full_verse + "\u2013" + verse2.full_verse;
                                }
                            } else {
                                ref_range = verse1.full_book + " " + verse1.c + ":" + verse1.full_verse + "\u2013" + verse2.c + ":" + verse2.full_verse;
                            }
                        } else {
                            ref_range = verse1.full_book + " " + verse1.c + ":" + verse1.full_verse + "\u2013" + verse2.full_book + " " + verse2.c + ":" + verse2.full_verse;
                        }
                        
                        /// Store the query type in a variable because it may need to be accessed more than once.
                        query_type = query_manager.query_type;
                        /// The verse range is displayed differently based on the type of search (i.e., a verse lookup or a search).
                        ///TODO: Set the date of the verse (or when it was written).
                        if (query_type === verse_lookup) {
                            new_title = ref_range + " - " + BF.lang.app_name;
                        } else {
                            new_title = query_manager.raw_query + " (" + ref_range + ") - " + BF.lang.app_name;
                        }
                        
                        /// Is the new verse range the same as the old one?
                        /// If they are the same, updating it would just waste time.
                        ///TODO: Could use top_verse and bottom_verse to compare too, but since they are objects, there is no good way to do that.
                        if (document.title !== new_title) {
                            document.title = new_title;
                            
                            /// Display the verse range on the page if looking up verses.
                            if (query_type === verse_lookup) {
                                ///TODO: Find a better way to clear infoBar than using innerHTML.
                                infoBar.innerHTML = "";
                                infoBar.appendChild(document.createTextNode(ref_range));
                            }
                            
                            /// Store the verse range for future reference.
                            content_manager.top_verse    = verse1;
                            content_manager.bottom_verse = verse2;
                        }
                        
                        looking_up_verse_range = false;
                    }
                    
                    /// Return the small function to call update_verse_range_delayed().
                    return function ()
                    {
                        ///TODO: Determine if this variable is useful since it is only used once.
                        var lookup_range_speed = 300; /// In milliseconds
                        
                        /// Is it not already looking for the verse range?
                        if (!looking_up_verse_range) {
                            looking_up_verse_range = true;
                            
                            /// Run update_verse_range_delayed() after a brief delay.
                            window.setTimeout(update_verse_range_delayed, lookup_range_speed);
                        }
                    };
                }());
                
                
                /**
                 * The onresize event.
                 *
                 * When the page is resized, check to see if more content should be loaded.
                 *
                 * @return NULL.  Calls other functions.
                 * @note   Called when the window is resized.
                 * @note   Set by the onresize event.
                 * @todo   Make a function that allows for adding and removing more global events.
                 */
                window.onresize = function ()
                {
                    add_content_if_needed(additional);
                    add_content_if_needed(previous);
                    
                    update_verse_range();
                };
                
                /// Return the content_manager object.
                return {
                    ///NOTE: It may be better to make these variables accessible only via a get function.
                    bottom_verse: false,
                    top_verse:    false,
                    
                    add_content_if_needed: add_content_if_needed,
                    
                    /**
                     * Prepares the page for new verses.
                     *
                     * @return NULL.  The page is prepared for new verses.
                     * @note   Called by prepare_new_search().
                     * @todo   Determine if this is a good place for this function.
                     */
                    clear_scroll: function ()
                    {
                        /// Clear cache.
                        ///TODO: Determine a way to store the cache in a way that it can be used later.
                        cached_verses_top    = [];
                        cached_verses_bottom = [];
                        cached_count_top     = 0;
                        cached_count_bottom  = 0;
                        
                        ///TODO: This should have smooth scrolling effects, etc.
                        bottomLoader.style.visibility = "hidden";
                        topLoader.style.visibility    = "hidden";
                        
                        has_reached_bottom = false;
                        has_reached_top    = false;
                        
                        page.innerHTML = "";
                    },
                    
                    update_verse_range:    update_verse_range,
                    
                    reached_bottom: function ()
                    {
                        has_reached_bottom = true;
                    },
                    
                    reached_top: function ()
                    {
                        has_reached_top = true;
                    },
                    
                    /**
                     * Scrolls that page to make the specified verse at the top of the viewable area.
                     *
                     * @example content_manager.scroll_to_verse({b: 45, c: 1, v: 14}); /// Scrolls to Romans 1:14 if that verse element is in the DOM.
                     * @param   verse_obj (object) An object containing the book, chapter, and verse references: {b: book, c: chapter, v: verse}
                     * @return  Returns TRUE on success and FALSE if the verse cannot be found on the scroll.
                     * @note    Called by handle_new_verses() after the first Ajax request of a particular verse lookup.
                     * @note    Also called when scrolling via the page up and page down buttons.
                     * @todo    Determine if there needs to be an option to override looking for Psalm titles and chapter headings.
                     */
                    scroll_to_verse: function (verse_obj, smooth, allow_lookup)
                    {
                        ///FIXME: This will not get the correct element if the verse is verse 1 (i.e., is at the beginning of a chapter or book).
                        var verse_el,
                            verse_id;
                        
                        /// Is the verse the first verse in a chapter or a Psalm title (i.e., verse 0)?
                        if (verse_obj.v <= 1) {
                            /// Is there a Psalm title?
                            if (verse_obj.b === 19 && BF.psalm_has_title(verse_obj.c)) {
                                ///NOTE: The reason why the verse must be set to 0 is because the chapter element's ID uses 0 in the verse reference (e.g., "19003000_chapter" as opposed to "19002001_chapter").
                                verse_obj.v = 0;
                            }
                            
                            verse_id = BF.create_verse_id(verse_obj);
                            
                            if (verse_obj.c === 1) {
                                verse_el = document.getElementById(verse_id + "_title");
                            } else {
                                verse_el = document.getElementById(verse_id + "_chapter");
                            }
                            
                        } else {
                            verse_id = BF.create_verse_id(verse_obj);
                            verse_el = document.getElementById(verse_id + "_verse");
                        }
                        
                        if (!verse_el) {
                            return false;
                        }
                        
                        /// Calculate the verse's Y coordinate.
                        ///NOTE: "- topBar_height" subtracts off the height of the top bar.
                        scroll_view_to(BF.get_position(verse_el).top - topBar_height, null, smooth, allow_lookup);
                        
                        return true;
                    },
                    
                    scroll_view_to: scroll_view_to
                };
            }());
            
            /****************************
             * End of Scrolling Closure *
             ****************************/
            
            /**
             * Create the functions that handle querying the server and displaying the results.
             *
             * @return Returns an object with functions for querying data from the server.
             */
            query_manager = (function ()
            {   
                var handle_new_verses = (function ()
                {
                    /**
                     * Writes new verses to page.
                     *
                     * @example write_verses(type, direction, [verse_ids, ...], [verse_html, ...]);
                     * @example write_verses(verse_lookup, additional, [1001001], ["<a id=1>In</a> <a id=2>the</a> <a id=3>beginning....</a>"]);
                     * @param   type        (integer) The type of query: verse_lookup || mixed_search || standard_search || grammatical_search.
                     * @param   direction   (integer) The direction of the verses to be retrieved: additional || previous.
                     * @param   verse_ids   (array)   An array of integers representing Bible verse references.
                     * @param   verse_html  (array)   An array of strings containing verses in HTML.
                     * @param   verse_range (object)  An object containing the top and bottom verses, word IDs, and books.
                     * @return  NULL.  Writes HTML to the page.
                     * @note    Called by handle_new_verses().
                     * @note    verse_ids contains an array of verses in the following format: [B]BCCCVVV (e.g., Genesis 1:1 == 1001001).
                     */
                    function write_verses(type, direction, verse_ids, verse_html, paragraphs, in_paragraphs, verse_range)
                    {
                        var b,
                            c,
                            chapter_text         = "",
                            end_paragraph_HTML   = "",
                            first_paragraph_HTML = "",
                            i,
                            html_str             = "",
                            newEl,
                            num,
                            start_key            = 0,
                            start_paragraph_HTML = "",
                            stop_key             = verse_ids.length,
                            v;
                        
                        ///NOTE: Currently only grammatical_search searches data at the word level, so it is the only type that might stop in the middle of a verse and find more words in the same verse as the user scrolls.
                        if (type === grammatical_search) {
                            if (direction === additional) {
                                /// Is the first verse returned the same as the bottom verse on the page?
                                if (verse_range.bottom_verse === verse_ids[0]) {
                                    start_key = 1;
                                }
                            /// Is the last verse returned the same as the top verse on the page?
                            ///NOTE: Currently, searches are always additional, so this cannot happen yet.
                            } else if (verse_range.top_verse === verse_ids[stop_key - 1]) {
                                /// Stop one verse early because the last verse is already on the page.
                                stop_key -= 1;
                            }
                        }
                        
                        if (in_paragraphs) {
                            start_paragraph_HTML = "<div class=paragraph>";
                            first_paragraph_HTML = '<div class="paragraph first_paragraph">';
                            end_paragraph_HTML   = "</div>";
                        }
                        
                        for (i = start_key; i < stop_key; i += 1) {
                            num = verse_ids[i];
                            v   = num % 1000;                     /// Calculate the verse.
                            c   = ((num - v) % 1000000) / 1000;   /// Calculate the chapter.
                            b   = (num - v - c * 1000) / 1000000; /// Calculate the book by number (e.g., Genesis == 1).
                            
                            ///TODO: Determine if it would be better to have two for loops instead of the if statement inside of this one.
                            if (type === verse_lookup) {
                                /// Is this the first verse or the Psalm title?
                                if (v < 2) {
                                    if (i !== start_key) {
                                        html_str += end_paragraph_HTML;
                                    }
                                    /// Is this chapter 1?  (We need to know if we should display the book name.)
                                    if (c === 1) {
                                        html_str += "<div class=book id=" + num + "_title><h2>" + BF.lang.books_long_pretitle[b] + "</h2><h1>" + BF.lang.books_long_main[b] + "</h1><h2>" + BF.lang.books_long_posttitle[b] + "</h2></div>";
                                    /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
                                    } else if (b !== 19 || v === 0 || !BF.psalm_has_title(c)) {
                                        /// Is this the book of Psalms?  (Psalms have a special name.)
                                        if (b === 19) {
                                            chapter_text = BF.lang.psalm;
                                        } else {
                                            chapter_text = BF.lang.chapter;
                                        }
                                        html_str += "<h3 class=chapter id=" + num + "_chapter>" + chapter_text + " " + c + "</h3>";
                                    }
                                    /// Is this a Psalm title (i.e., verse 0)?  (Psalm titles are displayed specially.)
                                    if (v === 0) {
                                        html_str += "<div class=psalm_title id=" + num + "_verse>" + verse_html[i] + "</div>";
                                    } else {
                                        ///NOTE: The trailing space adds a space between verses in a paragraph and does not effect paragraph final verses.
                                        html_str += first_paragraph_HTML + "<div class=first_verse id=" + num + "_verse>" + verse_html[i] + " </div>";
                                    }
                                } else {
                                    /// Is it a subscription?
                                    if (v === 255) {
                                        /// Is there an open paragraph?
                                        if (in_paragraphs && i !== start_key) {
                                            ///NOTE: Since subscriptions are already set off by themselves, they do not need special paragraph HTML, but they may need to close existing paragraphs.
                                            html_str += end_paragraph_HTML;
                                        }
                                        html_str += "<div class=subscription id=" + num + "_verse>" + verse_html[i] + "</div>";
                                    } else {
                                        /// Is there a paragraph break here?
                                        if (in_paragraphs && paragraphs[i]) {
                                            /// Is this not the first paragraph?  (The first paragraph does not need to be closed.)
                                            if (i !== start_key) {
                                                html_str += end_paragraph_HTML;
                                            }
                                            
                                            html_str += start_paragraph_HTML;
                                        }
                                        
                                        ///NOTE: The trailing space adds a space between verses in a paragraph and does not effect paragraph final verses.
                                        ///TODO: Determine if "class=verse_number" is needed.
                                        html_str += "<div class=verse id=" + num + "_verse><span class=verse_number>" + v + "&nbsp;</span>" + verse_html[i] + " </div>";
                                    }
                                }
                                
                            /// Searching
                            } else {
                                if (v === 0) {
                                    /// Change verse 0 to indicate a Psalm title (e.g., change "Psalm 3:0" to "Psalm 3:title").
                                    v = BF.lang.title;
                                } else if (v === 255) {
                                    /// Change verse 255 to indicate a Pauline subscription (e.g., change "Romans 16:255" to "Romans 16:subscription").
                                    v = BF.lang.subscription;
                                }
                                
                                /// Is this verse from a different book than the last verse?
                                ///NOTE: This assumes that searches are always additional (which is correct, currently).
                                if (b !== verse_range.bottom_book) {
                                    /// We only need to print out the book if it is different from the last verse.
                                    verse_range.bottom_book = b;
                                    
                                    /// Convert the book number to text.
                                    html_str += "<h1 class=short_book id=" + num + "_title>" + BF.lang.books_short[b] + "</h1>";
                                }
                                
                                html_str += "<div class=search_verse id=" + num + "_search><span>" + c + ":" + v + "</span> " + verse_html[i] + "</div>";
                            }
                        }
                        
                        if (in_paragraphs) {
                            html_str += end_paragraph_HTML;
                        }
                        
                        newEl = document.createElement("div");
                        ///NOTE: If innerHTML disappears in the future (because it is not (yet) in the "standards"),
                        ///      a simple (but slow) alternative is to use the innerDOM script from http://innerdom.sourceforge.net/ or BetterInnerHTML from http://www.optimalworks.net/resources/betterinnerhtml/.
                        ///      Also using "range = document.createRange(); newEl = range.createContextualFragment(html_str)" is also a possibility.
                        newEl.innerHTML = html_str;
                        
                        if (direction === additional) {
                            page.appendChild(newEl);
                        } else {
                            page.insertBefore(newEl, page.childNodes[0]);
                            
                            /// The new content that was just added to the top of the page will push the other contents downward.
                            /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
                            content_manager.scroll_view_to(window.pageYOffset + newEl.clientHeight);
                        }
                        content_manager.update_verse_range();
                    }
                    
                    /**
                     * Handles new verses from the server.
                     *
                     * Displays new verses, if any; asks if more content is needed; determines if more content is available;
                     * and writes initial information to the infoBar.
                     *
                     * @example handle_new_verses({n: [verse_ids, ...], v: [verse_html, ...], p: [paragraphs, ...], i: [word_ids, ...], t: total}, {direction: direction, ...});
                     * @example handle_new_verses({n: [1001001, 1001002], v: ["<a id=1>In</a> <a id=2>the</a> <a id=3>beginning....</a>", "<a id=12>And</a> <a id=13>the</a> <a id=14>earth....</a>"], t: 2}, options);
                     * @example handle_new_verses({n: [50004008], v: ["<a id=772635>Finally,</a> <a id=772636>brethren,</a> <a id=772637>whatsoever</a> <a id=772638>things....</a>"], i: [772638], t: 1}, options);
                     * @param   data    (object) The JSON object returned from the server.
                     * @param   options (object) The object containing the details of the query.
                     * @return  NULL.
                     */
                    return function (data, options)
                    {
                        var b_tag,
                            
                            direction     = options.direction,
                            in_paragraphs = options.in_paragraphs,
                            initial_query = options.initial_query,
                            type          = options.type,
                            
                            /// Data object format:
                            /// i Word IDs      (array)  (optional) An array containing word IDs indicating which words should be highlighted in grammatical searches
                            /// n Verse Numbers (array)             An array containing verse IDs for each verse returned
                            /// p Paragraphs    (array)  (optional) An array of 1's and 0's corresponding to n array indicating which verses are at the beginning of a paragraph
                            /// t Total         (number)            The total number of verses returned
                            /// v Verse HTML    (array)             An array containing the HTML of the verses returned
                            total      = data.t,
                            paragraphs = data.p,
                            verse_ids  = data.n,
                            verse_html = data.v,
                            word_ids   = data.i;
                        
                        /// Were there any verses returned?
                        ///FIXME: Lookups always return 1 for success instead of the number of verses.  See functions/verse_lookup.php.
                        if (total) {
                            write_verses(type, direction, verse_ids, verse_html, paragraphs, in_paragraphs, options.verse_range);
                            
                            if (type !== verse_lookup) {
                                window.setTimeout(function ()
                                {
                                    ///NOTE: Only standard and mixed searches need verse_html data to be sent.
                                    ///NOTE: word_ids is only needed for grammatical and mixed searches.
                                    options.highlight((type !== grammatical_search ? verse_html.join("") : false), word_ids);
                                }, 0);
                            }
                            
                            if (direction === additional) {
                                /// The last verse ID need to be store so that the server knowns where to start future queries.
                                options.verse_range.bottom_verse = verse_ids[verse_ids.length - 1];
                                
                                if (word_ids) {
                                    /// The last word ID also need to be stored for future grammatical (and in the future, mixed) searches.
                                    options.verse_range.bottom_id = word_ids[word_ids.length - 1];
                                }
                                
                                /// Are there still more verses to be retreved?
                                if (verse_ids[verse_ids.length - 1] < 66022021) {
                                    /// Indicate to the user that more content may be loading, and check for more content.
                                    ///TODO: Make a separate function for this.
                                    bottomLoader.style.visibility = "visible";
                                    content_manager.add_content_if_needed(additional);
                                } else {
                                    /// Since the last verse is Revelation 22:21, there is no need to look for more.
                                    content_manager.reached_bottom();
                                    bottomLoader.style.visibility = "hidden";
                                }
                            }
                            
                            if (direction === previous || initial_query) {
                                /// The first verse ID need to be store so that the server knowns where to start future previous queries.
                                options.verse_range.top_verse = verse_ids[0];
                                
                                if (word_ids) {
                                    /// The first word ID also need to be stored for future previous grammatical (and in the future, mixed) searches.
                                    options.verse_range.top_id = word_ids[0];
                                }
                                
                                /// Are there still more verses to be retreved?
                                if (verse_ids[0] > 1001001) {
                                    /// Indicate to the user that more content may be loading, and check for more content.
                                    ///TODO: Make a separate function for this.
                                    topLoader.style.visibility = "visible";
                                    content_manager.add_content_if_needed(previous);
                                } else {
                                    /// Since the first verse is Genesis 1:1, there is no need to look for more.
                                    content_manager.reached_top();
                                    topLoader.style.visibility = "hidden";
                                }
                            }
                        } else {
                            /// Since total could be undefined, make sure the total is 0.
                            total = 0;
                            
                            ///TODO: Make a separate function for this.
                            if (direction === additional) {
                                /// The user has reached the bottom by scrolling down (either RETURNED_SEARCH or RETURNED_VERSES_PREVIOUS), so we need to hide the loading graphic.
                                /// This is cause by scrolling to Revelation 22:21 or end of search or there were no results.
                                content_manager.reached_bottom();
                                bottomLoader.style.visibility = "hidden";
                            }
                            ///BUG: there can be no results if looking up beyond rev 22.21 (e.g., rev 23). FIX: Prevent looking up past 66022021
                            if (direction === previous || initial_query) {
                                /// The user has reached the top of the page by scrolling up (either Genesis 1:1 or there were no search results), so we need to hide the loading graphic
                                content_manager.reached_top();
                                topLoader.style.visibility    = "hidden";
                            }
                        }
                        
                        /// Is this is the first results of a query?
                        if (initial_query) {
                            /// Are the results displayed in paragraphs, and is the verse looked up not at the beginning of a paragraph?
                            if (type === verse_lookup && in_paragraphs && verse_ids[0] !== options.verse) {
                                /// Because the verse the user is looking for is not at the beginning of a paragraph
                                /// the text needs to be scrolled so that the verse is at the top.
                                content_manager.scroll_to_verse(BF.get_b_c_v(options.verse));
                            } else {
                                /// If the user had scrolled down the page and then pressed the refresh button,
                                /// the page will keep scrolling down as content is loaded, so to prevent this, force the window to scroll to the top of the page.
                                ///FIXME: This does not always prevent the issue (especially in Chromium).  Perhaps this should also be called via setTimeout().
                                content_manager.scroll_view_to(0);
                            }
                            
                            /// Since the first query is done, set the initial_query property to FALSE.
                            options.initial_query = false;
                            
                            infoBar.innerHTML = "";
                            
                            if (type !== verse_lookup) {
                                /// Create the inital text.
                                infoBar.appendChild(document.createTextNode(BF.format_number(total) + BF.lang["found_" + (total === 1 ? "singular" : "plural")]));
                                /// Create a <b> for the search terms.
                                b_tag = document.createElement("b");
                                ///NOTE: We use this method instead of straight innerHTML to prevent HTML injection inside the <b> tag.
                                b_tag.appendChild(document.createTextNode(options.raw_query));
                                infoBar.appendChild(b_tag);
                            }
                        }
                    };
                }());
                
                /// Return the query_manager object.
                return {
                    query_additional: function () {},
                    
                    /**
                     * Create the query function.
                     */
                    query: (function ()
                    {
                        /**
                         * Create the URL query string from the options object.
                         *
                         * @return A string representing the URL query.
                         * @param  options (object) The object containing the various aspects of the query.
                         */
                        function create_query_message(options)
                        {
                            /// Query Variables:
                            /// d Direction (number)  The direction of the query (additional, previous)      (lookup only)
                            /// f Find      (boolean) Whether or not to find a paragraph break to start at   (lookup only)
                            /// p Paragraph (boolean) Whether or not verses will be displayed in paragraphs  (lookup only)
                            /// q Query     (string)  The verse reference or search string to query
                            /// s Start At  (string)  The verse or word id at which to start the query       (search only)
                            /// t Type      (number)  The type of query (verse_lookup, mixed_search, standard_search, grammatical_search)
                            
                            var query_str = "t=" + options.type;
                            
                            if (options.type === verse_lookup) {
                                query_str += "&q=" + options.verse;
                                
                                ///NOTE: Paragraph mode is default for verse lookups; therefore, p only needs to be set if it is not in paragraph mode.
                                if (!options.in_paragraphs) {
                                    query_str += "&p=0";
                                }
                                
                                ///NOTE: Queries are additional by default; therefore, d only needs to be set for previous lookups.
                                if (options.direction === previous) {
                                    query_str += "&d=" + options.direction;
                                    
                                /// Is it possible that this query does not begin at a paragraph break?
                                ///NOTE: This can only be initial verse lookups (which are always additional; hence the else if) that do not start at verse 1 or 0.
                                } else if (options.initial_query && options.in_paragraphs && options.verse % 1000 > 1) {
                                    query_str += "&f=1";
                                }
                            } else {
                                query_str += "&q=" + options.query;
                                
                                /// Grammatical and mixed searches set start_at (except for initial searches).
                                if (options.start_at) {
                                    query_str += "&s=" + options.start_at;
                                /// Standard searches set the verse (except for initial searches).
                                } else if (options.verse) {
                                    query_str += "&s=" + options.verse;
                                }
                            }
                            
                            return query_str;
                        }
                        
                        return (function ()
                        {
                            /**
                             * Create a function to handle future queries.
                             *
                             * @param  ajax      (object) The Ajax object (created via BF.Create_easy_ajax()).
                             * @param  direction (number) The direction the query should load verses (additional || previous).
                             * @param  options   (object) The object containing the various aspects of the query.
                             * @return A function that will handle querying for more verses.
                             */
                            function next_query_maker(ajax, direction, options)
                            {
                                /**
                                 * The function that handles querying for new verses.
                                 */
                                return function ()
                                {
                                    var in_paragraphs;
                                    
                                    /// If the initial query has not finished or if the query has already begun, prevent the query.
                                    if (options.initial_query || ajax.is_busy()) {
                                        return;
                                    }
                                    
                                    in_paragraphs = settings.view.in_paragraphs.get();
                                    
                                    if (options.type === verse_lookup || options.type === standard_search) {
                                        /// Determine which verse to start from for the next query.
                                        ///NOTE: It does not matter whether or not the verse exists.  The server will simply retrieve the next available verse.
                                        ///      For example, Romans 1:33 will retrieve verses starting at Romans 2:1 (when the direction is additional).
                                        if (direction === additional) {
                                            options.verse = options.verse_range.bottom_verse + 1;
                                        } else {
                                            options.verse = options.verse_range.top_verse    - 1;
                                        }
                                    } else {
                                        /// Determine which word to begin searching at for grammatical/mixed searches.
                                        if (direction === additional) {
                                            options.start_at = options.verse_range.bottom_id + 1;
                                        } else {
                                            ///NOTE: Currently, all searches are additional, so this code does not yet run.
                                            options.start_at = options.verse_range.top_id    - 1;
                                        }
                                    }
                                    
                                    options.direction     = direction;
                                    /// Since this settings can be changed by the user at run time, it must be retrieved before each query.
                                    options.in_paragraphs = in_paragraphs;
                                    
                                    ajax.query("post", "query.php", create_query_message(options), function (data)
                                    {
                                        /// On Success
                                        ///NOTE: direction and in_paragraphs need to be set again because they could have been changed by another query in the mean time.
                                        ///      options.verse and options.start_at could also be changed but they are not needed in handle_new_verses().
                                        ///      options.verse is used in handle_new_verses() for initial queries, but it will not be changed until after the initial query loads.
                                        ///TODO: Determine if there is a better way to store variables that change, like direction, in_paragraphs, verse, and start_at.
                                        options.direction     = direction;
                                        options.in_paragraphs = in_paragraphs;
                                        
                                        handle_new_verses(BF.parse_json(data), options);
                                    });
                                };
                            }
                            
                            
                            return (function ()
                            {
                                var ajax_additional = new BF.Create_easy_ajax(),
                                    ajax_previous   = new BF.Create_easy_ajax();
                                
                                /**
                                 * Initiate a new query and prepare for future queries.
                                 *
                                 * @param  options (object) The object containing the various aspects of the query.
                                 * @return NULL.
                                 * @note   This function is stored in query_manager.query().
                                 * @note   Called by run_new_query().
                                 */
                                return function (options)
                                {
                                    ///TODO: At some point, there needs to be feedback to the user that the query is taking place.  Maybe have something in the infoBar.
                                    
                                    /// Stop any old requests since we have a new one.
                                    ajax_additional.abort();
                                    ajax_previous.abort();
                                    
                                    /// Initial queries may need special options (e.g., the f variable (to find paragraph breaks) is only passed on initial queries).
                                    options.initial_query = true;
                                    /// Initial queries are always additional.
                                    ///TODO: Determine if it should not store direction in the options because it changes between previous and additional searches.
                                    options.direction     = additional;
                                    /// Since this settings can be changed by the user at run time, it must be retrieved before each query.
                                    options.in_paragraphs = settings.view.in_paragraphs.get();
                                    /// Create an empty verse_range object, which will be filled in as verses are retrieved.
                                    options.verse_range   = {
                                        bottom_id:    0,
                                        bottom_verse: 0,
                                        top_id:       0,
                                        top_verse:    0
                                    };
                                    
                                    /// Make the initial query with ajax_additional because all initial queries add more verses.
                                    ajax_additional.query("post", "query.php", create_query_message(options), function (data)
                                    {
                                        /// On Success
                                        handle_new_verses(BF.parse_json(data), options);
                                    });
                                    
                                    /// Store the current query type so that outer functions can access this information.
                                    this.query_type = options.type;
                                    /// Store the current query so that outer functions can access this information.
                                    this.raw_query  = options.raw_query;
                                    
                                    /// Create the additional and previous functions for the content_manager to call when needed.
                                    this.query_additional = next_query_maker(ajax_additional, additional, options);
                                    this.query_previous   = next_query_maker(ajax_previous,   previous,   options);
                                };
                            }());
                        }());
                    }()),
                    
                    query_previous: function () {},
                    
                    /// Variables accessible to outer functions.
                    query_type: "",
                    raw_query:  ""
                };
            }());
            
            /**
             * Create the run_new_query() function and closure.
             */
            run_new_query = (function ()
            {
                /**
                 * Figure out what type of search is being attempted by the user.
                 *
                 * @example determine_search_type("God & love");                          /// Returns [{type: standard_search,    query: '"God & love"'}]
                 * @example determine_search_type("love AS NOUN");                        /// Returns [{type: grammatical_search, query: '["love",[[4,1]],[0]]'}]
                 * @example determine_search_type("go AS IMPERATIVE, -SINGULAR");         /// Returns [{type: grammatical_search, query: '["go",[[9,3],[5,1]],[0,1]]'}]
                 * @example determine_search_type("go* AS PASSIVE, -PERFECT,INDICATIVE"); /// Returns [{type: grammatical_search, query: '["go*",[[8,3],[7,5],[9,1]],[0,1,0]]'}]
                 * @example determine_search_type("* AS RED, IMPERATIVE");                /// Returns [{type: grammatical_search, query: '["",[[3,1],[9,3]],[0,0]]'}]
                 * //@example determine_search_type("love AS NOUN & more | less -good AS ADJECTIVE"); /// Returns [{type: grammatical_search, query: '["love",[[4,1]],[0]]'}, {type: standard_search, query: "& more | less -good"}, {type: grammatical_search, query: '["good",[[4,3]],[1]]'}]
                 * @param   search_terms (string) The prepared terms to be examined.
                 * @return  An array filled with objects describing the type of search.
                 * @note    Called by run_new_query().
                 * @note    Only a partial implementation currently.  Mixed searching is lacking.
                 */
                function determine_search_type(search_terms)
                {
                    var exclude_json           = "", /// Used to concatenate data. TODO: Make description better.
                        grammar_attribute_json = "", /// Used to concatenate data. TODO: Make description better.
                        grammar_attributes,
                        grammar_json           = "", /// Used to concatenate data. TODO: Make description better.
                        grammar_search_term,
                        split_start,
                        split_pos;
                    
                    /// Did the user use the grammatical keyword in his search?
                    if ((split_pos = search_terms.indexOf(BF.lang.grammar_marker)) !== -1) {
                        ///TODO: Determine what is better: a JSON array or POST/GET string (i.e., word1=word&grammar_type1=1&value1=3&include1=1&...).
                        ///NOTE: A JSON array is used to contain the information about the search.
                        ///      JSON format: '["WORD",[[GRAMMAR_TYPE1,VALUE1],[...]],[INCLUDE1,...]]'
                        
                        /// Get the search term (e.g., in "go AS IMPERATIVE, -SINGULAR", grammar_search_term = "go").
                        grammar_search_term = search_terms.slice(0, split_pos);
                        
                        /// Is the user trying to find all words that match the grammatical attributes?
                        if (grammar_search_term === "*") {
                            /// Sphinx will find all words if no query is present, so we need to send a blank search request.
                            grammar_search_term = "";
                        }
                        
                        ///NOTE: .replace(/(["'])/g, "\\$1") adds slashes to sanitize the data.  (It is essentially the same as addslashes() in PHP.)
                        ///TODO: Determine if the entire query should be passed through encodeURIComponent().  It would make the text much longer.
                        grammar_json = '["' + window.encodeURIComponent(grammar_search_term.replace(/(["'])/g, "\\$1")) + '",[';
                        
                        /// Get the grammatical attributes (e.g., in "go AS IMPERATIVE, -SINGULAR", grammar_attributes = IMPERATIVE, -SINGULAR").
                        grammar_attributes = search_terms.slice(split_pos + BF.lang.grammar_marker_len);
                        
                        split_start = 0;
                        
                        ///TODO: Determine if there is a benefit to using do() over while().
                        ///NOTE: An infinite loop is used because the data is returned when it reaches the end of the string.
                        for (;;) {
                            /// Find where the attributes separate (e.g., "NOUN, GENITIVE" would separate at character 4).
                            split_pos = grammar_attributes.indexOf(BF.lang.grammar_separator, split_start);
                            /// Trim leading white space.
                            if (grammar_attributes.slice(split_start, split_start + 1) === " ") {
                                split_start += 1;
                            }
                            /// Is this grammatical feature to be excluded?
                            if (grammar_attributes.slice(split_start, split_start + 1) === "-") {
                                /// Skip the hyphen so that we just get the grammatical word (e.g., "love AS -NOUN" we just want "NOUN").
                                split_start += 1;
                                exclude_json += "1,";
                            } else {
                                exclude_json += "0,";
                            }
                            
                            if (split_pos > -1) {
                                ///TODO: Determine if there should be error handling when a grammar keyword does not exist.
                                ///NOTE: The slice() function separates the various grammatical attributes and then that word is
                                ///      looked up in the grammar_keywords object in order to find the JSON code to send to the server.
                                grammar_attribute_json += BF.lang.grammar_keywords[grammar_attributes.slice(split_start, split_pos).trim()] + ",";
                                
                                split_start = split_pos + 1;
                            } else {
                                ///TODO: Determine if trim() is necessary or if there is a better implementation.
                                ///NOTE: exclude_json.slice(0, -1) is used to remove the trailing comma.  This could be unnecessary.
                                return [
                                    {
                                        ///TODO: Document what is going on here.
                                        query: grammar_json + grammar_attribute_json + BF.lang.grammar_keywords[grammar_attributes.slice(split_start).trim()] + "],[" + exclude_json.slice(0, -1) + "]]",
                                        type:  grammatical_search
                                    }
                                ];
                            }
                        }
                    }
                    
                    /// The search is just a standard search, so just return the type and the original query.
                    return [
                        {
                            query:          window.encodeURIComponent(search_terms),
                            standard_terms: search_terms,
                            type:           standard_search
                        }
                    ];
                }
                
                /**
                 * Process a raw query.
                 *
                 * @example run_new_query("John 3:16"); /// Looks up John 3:6 (and following)
                 * @example run_new_query("love");      /// Searches for the word "love"
                 * @param   raw_query (string) The text from the user to query.
                 * @return  NULL.
                 * @note    Called by searchForm.onsubmit() when a user submits a query.
                 */
                return function (raw_query)
                {
                    /// Step 1: Prepare string and check to see if we need to search (not empty)
                    
                    ///NOTE: Whitespace must be trimmed after this function because it may create excess whitespace.
                    var options = {raw_query: raw_query},
                        query   = BF.lang.prepare_search(raw_query).trim(),
                        /// Search terms that are not grammatical.
                        standard_terms,
                        verse_id;
                    
                    if (query === "") {
                        /// TODO: Determine what else should be done to notifiy the user that no query will be preformed.
                        return;
                    }
                    
                    /// Step 2: Determine type of query
                    
                    /// Determine if the user is preforming a search or looking up a verse.
                    /// If the query is a verse reference, a number is returned, if it is a search, then FALSE is returned.
                    ///NOTE: The + is to convert the verse reference to a number.
                    verse_id = (+BF.lang.determine_reference(query));
                    
                    /// Is the query a verse lookup?
                    if (verse_id > 0) {
                        /// Is the lookup verse possibly the beginning of a Psalm with a title?  If so, we need to start at the title, so go back one verse.
                        ///NOTE: To get the titles of Psalms, select verse 0 instead of verse 1.
                        if (verse_id > 19003000 && verse_id < 19145002 && verse_id % 1000 === 1) {
                            verse_id -= 1;
                        }
                        options.verse = verse_id;
                        options.type  = verse_lookup;
                    } else {
                        /// Break down the query string into separate components.
                        /// Mainly, this is used to determine the different parts of a grammatical search.
                        ///FIXME: Implement mixed searching (grammatical and standard together, e.g., "love AS NOUN & more").
                        query = determine_search_type(query);
                        
                        /// Is the query mixed (both standard and grammatical)?
                        if (query.length > 1) {
                            ///TODO: Implement mixed searching.
                            options.query = query;
                            options.type  = mixed_search;
                        } else {
                            ///NOTE: If it is not mixed, then there is currently only one array element, so get the variables out of it.
                            options.query  = query[0].query;
                            options.type   = query[0].type;
                            standard_terms = query[0].standard_terms;
                        }
                    }
                    
                    /// Step 3: Request results
                    
                    /// Prepare the initial query, create functions to handle additional and previous queries.
                    query_manager.query(options);
                    
                    /// Step 4: Prepare for new results (clear page(?), prepare highlighter if applicable)
                    
                    content_manager.clear_scroll();
                    
                    /// Indicate that the lookup is in progress.
                    ///TODO: Determine if this should be done by a function.
                    bottomLoader.style.visibility = "visible";
                    
                    ///TODO: Determine if this should be done by a separate function.
                    document.title = raw_query + " - " + BF.lang.app_name;
                    
                    /// Stop filling in the explanation text so that the user can make the query box blank.  (Text in the query box can be distracting while reading.)
                    q_obj.onblur = function () {};
                    
                    /// Was the query a search?  Searches need to have the highlight function prepared for the incoming results.
                    if (options.type !== verse_lookup) {
                        /**
                         * Create the highlight function and closure and prepare the regular expression used to do the highlighting.
                         *
                         * @return A function that will do the highlighting.
                         * @note   Since this function gets attached to the options object, it is sent by reference to the query_manager and called there.
                         * @note   Called by handle_new_verses() in the query_manager.
                         * @todo   Determine a good way to cache the highlight function or regex array.
                         */
                        options.highlight = (function ()
                        {
                            var highlight_re,
                                highlight_re_length;
                            
                            /// TODO: Handle mixed searches.
                            if (options.type === standard_search) {
                                /// standard_terms is a string containing all of the terms in a standard search (i.e., excluding grammatical search terms when preforming a mixed search).
                                highlight_re        = BF.lang.prepare_highlighter(standard_terms);
                                highlight_re_length = highlight_re.length;
                            }
                            
                            /**
                             * Highlight the search results.
                             *
                             * @example options.highlight("<a id=1>In</a> <a id=2>the</a> <a id=3>beginning</a> <a>...</a>");
                             * @example options.highlight("", [1, 4002, ...]);
                             * @param   html     (string) A string containing the all of the verses in HTML format (only used by standard searches).
                             * @param   word_ids (array)  An array of word ids to be highlighted (only used by grammatical searches).
                             * @note    Only one parameter is needed.
                             */
                            return function (html, word_ids)
                            {
                                var i,
                                    ids,
                                    re_id,
                                    tmp_found_ids = [];
                                
                                /// Are there standard verses to 
                                /// TODO: Handle mixed searches too.
                                if (options.type === standard_search) {
                                    re_id = 0;
                                    while (re_id < highlight_re_length) {
                                        tmp_found_ids = html.split(highlight_re[re_id]);
                                        
                                        ids = tmp_found_ids.length;
                                        ///NOTE: search_str.split() creates an array of the HTML with the correct ids every third one.
                                        for (i = 1; i < ids; i += 2) {
                                            ///TODO: Determine if there is a downside to having a space at the start of the className.
                                            ///TODO: Determine if we ever need to replace an existing f* className.
                                            document.getElementById(tmp_found_ids[i]).className += " f" + (re_id + 1);
                                        }
                                        re_id += 1;
                                    }
                                ///NOTE: In order to support mixed searches, this will have to be a separate IF statement.
                                } else {
                                    ids = word_ids.length;
                                    for (i = 0; i < ids; i += 1) {
                                        ///TODO: Determine if there is a downside to having a space at the start of the className.
                                        ///TODO: Determine if we ever need to replace an existing f* className.
                                        document.getElementById(word_ids[i]).className += " f" + 1;
                                    }
                                }
                            };
                        }());
                    }
                    
                    /// Is there any chance that there are verses above the starting verse?
                    /// Or, in other words, is the query a search or a verse lookup starting at Genesis 1:1?
                    ///NOTE: In the future, it may be possible for searches to start midway.
                    if (options.type !== verse_lookup || options.verse === 1001001) {
                        /// There is no reason to look for previous verses when the results start at the beginning.
                        content_manager.reached_top();
                    }
                };
            }());
            
            
            /**
             * Capture certain key events, bringing focus to the query box.
             *
             * @param  e (object) The event object (normally supplied by the browser).
             * @return NULL.
             * @note   Called on all keydown events.
             * @todo   Determine if this viewport is selected (currently, there is only one viewport).
             * @todo   Determine how to use the keyPress event (since Mozilla only fires this event once when the button is held down).
             */
            document.addEventListener("keydown", function (e)
            {
                var activeEl = document.activeElement,
                    keyCode,
                    
                    line_height = settings.system.line_height.get();
                
                /// Are there input boxes selected (not including images)?  If so, this function should not be executed.
                ///NOTE: In the future, other elements, such as, TEXTAREA or buttons, may also need to be detected.
                if (activeEl.tagName === "INPUT" && activeEl.type !== "image") {
                    return;
                }
                
                keyCode = e.keyCode;
                
                /// If a special key is also pressed, do not capture the stroke.
                ///TODO: Determine if this works on Mac with the Command key.
                ///NOTE: It may be that the Command key is keyCode 91 and may need to be caught by another keydown event.
                ///NOTE: The meta key does not seem to be detected; this may need me manually checked for, like for the Mac.
                ///NOTE: However, it does want to grab the stroke if the user is pasting.  keyCode 86 == "V," which is the standard shortcut for Paste.
                if ((e.ctrlKey && keyCode !== 86) || e.altKey || e.metaKey) {
                    return;
                }
                
                /// Is the user pressing a key that should probably be entered into the input box?  If so, bring focus to the query box so that the keystrokes will be captured.
                ///NOTE:  8 = Backspace
                ///      13 = Enter
                ///      32 = Space
                ///      33 = Page Up
                ///      34 = Page Down
                ///      38 = Up
                ///      40 = Down
                ///   48-90 = Alphanumeric
                ///  96-111 = Numpad keys
                /// 186-254 = Punctuation
                ///TODO: Determine if capturing Backspace and/Space is confusing because they have alternate functions (the back button and page down, respectively).
                ///      One possible solution is to allow Shift, Ctrl, or Alt + Backspace or Space to be the normal action.
                if (keyCode === 8 || keyCode === 13 || keyCode === 32 || (keyCode > 47 && keyCode < 91) || (keyCode > 95 && keyCode < 112) || (keyCode > 185 && keyCode < 255)) {
                    q_obj.focus();
                } else if (keyCode === 38 || keyCode === 40) {
                    /// Force browsers to scroll one line of text at a time.
                    ///NOTE: window.pageYOffset % line_height calculates the offset from the nearest line to snap the view to a line.
                    ///TODO: Make this optional (maybe).
                    window.scrollBy(window.pageXOffset, (line_height - (window.pageYOffset % line_height)) * (keyCode === 38 ? -1 : 1));
                    e.preventDefault();
                } else if (keyCode === 33 || keyCode === 34) {
                    /// Scroll to the next/previous chapter on page down/up (respectively).
                    ///FIXME: Since this just adds or subtracts one chapter, it does not work over book boundaries.
                    ///TODO:  Determine if it should use smooth scrolling.
                    ///FIXME: This should skip a chapter if it is just a verse or two away.
                    ///TODO:  Determine if it should does something different when the chapter has not been loaded (like preform a lookup).
                    ///FIXME: This doesn't work on Opera.
                    ///BUG:   Sometimes, nothing happens.  It is probably attempting to scroll to the same chapter.
                    if (content_manager.top_verse && content_manager.scroll_to_verse({b: content_manager.top_verse.b, c: content_manager.top_verse.c + (keyCode === 33 ? -1 : 1), v: 1}, false, true)) {
                        e.preventDefault();
                    }
                }
            }, false);
            
            /// After a short delay, lazily load extra, nonessential (or at least not immediately essential) code, like the wrench menu.
            ///TODO: Determine if there is any problem hitting the server again so quickly.
            window.setTimeout(function ()
            {
                BF.include("js/secondary.js", {
                    settings:     settings,
                    topBar:       viewPort.firstChild,
                    viewPort_num: viewPort_num,
                    page:         page
                });
            }, 1000);
        }());
        
        
        /**************
         * Set Events *
         **************/
        
        /**
         * Capture form submit events and begin a new query.
         *
         * @return FALSE.  It must always return false in order to prevent the form from submitting.
         * @note Called when a user submits the form.
         */
        searchForm.onsubmit = function ()
        {
            var raw_query = q_obj.value;
            
            /// Is the query is the same as the explanation?  If so, do not submit the query; just draw attention to the query box.
            if (raw_query === BF.lang.query_explanation) {
                q_obj.focus();
            } else {
                run_new_query(raw_query);
            }
            
            ///NOTE: Must return false in order to stop the form submission.
            return false;
        };
        
        /**
         * Set the query input box text with an explanation of what the user can enter in.
         *
         * @return NULL.
         * @note   Called on q_obj blur.
         * @note   This function is removed after the user submits a search by prepare_new_search() because the user no longer needs the instructions.
         */
        q_obj.onblur = function ()
        {
            if (this.value.trim() === "") {
                this.value = BF.lang.query_explanation;
            }
        };
        
        
        /**
         * Remove the explanation text so that the user can type.
         *
         * @return NULL.
         * @note   Called on q_obj focus.
         */
        q_obj.onfocus = function ()
        {
            if (this.value === BF.lang.query_explanation) {
                this.value = "";
            }
        };
        
        q_obj.onblur();
    };
    
    
    /// Prototypes
    ///NOTE: Adds trim() to Strings for IE 8-/Opera 10.1-/Safari 4-/Mozilla 3.0-.
    ///TODO: Remove this as soon as a non-JavaScript version of BibleForge is ready.
    if (!"".trim) {
        /**
         * Extend the String Prototype to remove leading and trailing spaces.
         *
         * @example trimmed = "  God is   good  ".trim(); /// Returns "God is   good"
         * @return  A string with leading and trailing spaces removed.
         * @note    This does not remove all types of whitespace.  It actually removes anything under character code 33.
         */
        String.prototype.trim = function ()
        {
            var end   = this.length - 1,
                start = 0;
            
            while (this.charCodeAt(end) < 33) {
                end -= 1;
            }
            
            while (start < end && this.charCodeAt(start) < 33) {
                start += 1;
            }
            
            return this.slice(start, end + 1);
        };
    }
    
    ///TODO: Move browser specific code to external files.
    
    /******************************
     * Start WebKit specific code *
     ******************************/
    
    if (BF.is_WebKit) {
        /// Inject CSS to make the drop caps aligned with the second line of text and add an inset shadow to the input box.
        ///NOTE: Needed for at least Chromium 9.
        ///TODO: Determine if this would be better as a function.
        document.body.appendChild(document.createElement("style").appendChild(document.createTextNode(".first_verse:first-letter, .first_paragraph:first-letter { margin-bottom: 0; margin-top: 5px; padding: 1px;  } .queryInput { background: url('data:image/gif;base64,R0lGODlhAQADAKEDAN3d3eTk5PLy8v///yH5BAEKAAMALAAAAAABAAMAAAICRFQAOw==') top repeat-x rgba(255, 255, 255, .5); }")).parentNode);
    }
    
    /****************************
     * End WebKit specific code *
     ****************************/
    
    /*****************************
     * Start Opera specific code *
     *****************************/
    
    if (window.opera) {
        /// Inject CSS to make the drop caps take up two lines, so that wrapping text is not placed over it.  (See John 4:1.)
        /// Also removes extra padding on buttons (this emulates button clicks on other browsers).
        ///NOTE: Needed for at least Opera 10.63.
        ///TODO: Determine if this would be better as a function.
        document.body.appendChild(document.createElement("style").appendChild(document.createTextNode(".first_verse:first-letter, .first_paragraph:first-letter { margin-bottom: 0; margin-top: 13px; padding: 1px; } button:active { padding: 5px 14px; }")).parentNode);
    }
    
    /***************************
     * End Opera specific code *
     ***************************/
    
    /*****************************
     * Start of IE Specific Code *
     *****************************/
    
    /**
     * Fix IE's string.split.
     *
     * @param  s     (regexp || string) The regular expression or string with which to break the string.
     * @param  limit (int) (optional)   The number of times to split the string.
     * @return Returns an array of the string now broken into pieces.
     * @see    http://blog.stevenlevithan.com/archives/cross-browser-split
     * @todo   Determine if IE9 still needs this.
     */
    ///NOTE: The following conditional compilation code blocks only executes in IE.
    /*@cc_on
        String.prototype.split_orig = String.prototype.split_orig || String.prototype.split;
        
        String.prototype.split = function (s, limit)
        {
            var flags,
                emptyMatch,
                i             = 0,
                j,
                lastLastIndex = 0,
                lastLength,
                match,
                origLastIndex,
                output        = [],
                s2;
            
            if (!(s instanceof RegExp)) {
                return String.prototype.split_orig.apply(this, arguments);
            }
            
            flags         = (s.global ? "g" : "") + (s.ignoreCase ? "i" : "") + (s.multiline ? "m" : "");
            s2            = new RegExp("^" + s.source + "$", flags);
            origLastIndex = s.lastIndex;
            
            if (typeof limit === "undefined" || +limit < 0) {
                limit = false;
            } else {
                limit = Math.floor(+limit);
                if (!limit) {
                    return [];
                }
            }
            if (s.global) {
                s.lastIndex = 0;
            } else {
                s = new RegExp(s.source, "g" + flags);
            }
            while ((!limit || i++ <= limit) && (match = s.exec(this))) {
                emptyMatch = !match[0].length;
                if (emptyMatch && s.lastIndex > match.index) {
                    s.lastIndex -= 1;
                }
                if (s.lastIndex > lastLastIndex) {
                    if (match.length > 1) {
                        match[0].replace(s2, function ()
                        {
                            for (j = 1; j < arguments.length - 2; j += 1) {
                                if (typeof arguments[j] === "undefined") {
                                    match[j] = undefined;
                                }
                            }
                        });
                    }
                    
                    output = output.concat(this.slice(lastLastIndex, match.index));
                    if (match.length > 1 && match.index < this.length) {
                        output = output.concat(match.slice(1));
                    }
                    lastLength    = match[0].length;
                    lastLastIndex = s.lastIndex;
                }
                if (emptyMatch) {
                    s.lastIndex += 1;
                }
            }
            output = (lastLastIndex === this.length ? (s.test("") && !lastLength ? output : output.concat("")) : (limit ? output : output.concat(this.slice(lastLastIndex))));
            /// TODO: Determine if this next line of code is necessary.
            s.lastIndex = origLastIndex;
            return output;
        };
        
        /// Trick IE 8- into understanding pageYOffset.
        /// Set the initial value, so that it is not undefined.
        /// See scrolling().
        @if (@_jscript_version < 9)
            var pageYOffset = document.documentElement.scrollTop;
        @end
        
        /// IE9+ CSS: Make the inputIcon appear next to the queryInput.
        ///NOTE: The query box is slightly off centered in IE9 with this CSS.
        @if (@_jscript_version >= 9)
            document.body.appendChild(document.createElement("style").appendChild(document.createTextNode(".inputIcon { position: relative; } .first_verse:first-letter, .first_paragraph:first-letter { margin-top: 5px; }")).parentNode);
        @end
    @*/
    
    /***************************
     * End of IE Specific Code *
     ***************************/
    
    /// Initialize BibleForge.
    ///TODO: Require just one element and find the rest dynamically.
    BF.create_viewport(document.getElementById("viewPort0"), document.getElementById("searchForm0"), document.getElementById("q0"), document.getElementById("scroll0"), document.getElementById("infoBar0"), document.getElementById("topLoader0"), document.getElementById("bottomLoader0"), document.documentElement);
}());
