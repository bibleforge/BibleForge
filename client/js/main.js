/**
 * BibleForge
 *
 * @date    10-30-08
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license The MIT License (MIT)
 */

/*!
 * The BibleForge motto:
 *
 * "all things whatsoever ye would that men should do to you, do ye even so to them."
 *     —Jesus (Matthew 7:12)
 */

/*!
 * Copyright (C) 2014
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// Declare globals for JSHint.
/* global BF */

/// Set JSHint options.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, evil:true, browser:true

/**
 * After the HTML has loaded, start BibleForge.
 */
document.addEventListener("DOMContentLoaded", function ()
{
    "use strict";
    
    ///NOTE: The global BF object is created by the first language file to load (currently en.js).
    
    /// Set the default language.
    ///TODO: Use the browser language settings and IP address to determine the default language.
    ///NOTE: Could use window.navigator.language (or perhaps navigator.userLanguage) to determine the user's language.
    ///NOTE: On the server side, the Accept-Language header could be used.
    BF.lang = BF.langs.en;
    
    ///NOTE: The elements in this object are overwritten if/when the code is actually downloaded.
    
    /// Created in the Forge on Mon, 29 Apr 2013 01:57:05 GMT.
    /// Language Loading Info
    if (!BF.lang.en_em) {
        BF.langs.en_em = {
            full_name: "Early Modern English (KJV)",
            hash: "3f99df048ca89c2edb5551b0695b19db",
            match_lang: /^x-early-modern-english$/i,
        };
    }
    if (!BF.lang.zh_s) {
        BF.langs.zh_s = {
            full_name: "简体中文 (CKJV)",
            hash: "d9382a406dc8564faf5b9ae2cdd2255f",
            match_lang: /^zh-c(?:n|hs)$/i,
        };
    }
    if (!BF.lang.zh_t) {
        BF.langs.zh_t = {
            full_name: "繁體中文 (CKJV)",
            hash: "4695f8e939b32ff9e65ccdfded968205",
            match_lang: /^zh(?:-c(?!n|hs))?$/i,
        };
    }
    /// End of Language Loading Info
    
    BF.consts = {
        /// Query type "constants"
        verse_lookup:       1,
        mixed_search:       2,
        standard_search:    3,
        grammatical_search: 4,
        lexical_lookup:     5,
        
        /// Direction "constants"
        additional: 1,
        previous:   2
    };
    
    /// Detect WebKit based browsers.
    ///NOTE: Since the user agent string can be modified by the user, it is not bulletproof.
    BF.is_WebKit = Boolean(window.chrome) || window.navigator.userAgent.indexOf("WebKit/") >= 0;
    
    ///NOTE: Since the user agent string can be modified by the user, it is not bulletproof.
    ///TODO: Test for more Mozilla-base browsers (like SeaMonkey).
    BF.is_Mozilla = window.navigator.userAgent.indexOf("Firefox/") >= 0;
    
    /// Create the object in which the following functions store key presses into.
    BF.keys_pressed = {};
    
    /**
     * Detect when the Shift, Ctrl, and/or Alt are pressed down so that that information can be used by functions not called by a keyboard event.
     *
     * @param e (event object) The keyboard event object.
     * @note  There is no good way to detect other key strokes, and even this may return false negatives, but it should not return false positives.
     */
    window.addEventListener("keydown", function (e)
    {
        /// 16 Shift (left or right)
        /// 17 Ctrl  (left or right)
        /// 18 Alt   (left or right)
        
        /// First, record how many times the keys have been pressed.
        if (e.keyCode >= 16 && e.keyCode <= 18) {
            if (!BF.keys_pressed[e.keyCode]) {
                BF.keys_pressed[e.keyCode] = 1;
            } else {
                /// This allows us to key track of how many of the same keys were pressed (for example, whether one or two shift keys were pressed).
                BF.keys_pressed[e.keyCode] += 1;
            }
        }
        
        /// Second, set the alt, ctrl, and shift properties accordingly.
        /// If the user held down a key when the page was not in focus, we can use shiftKey, ctrlKey, and altKey to detect those keys presses.
        ///NOTE: WebKit does not set shiftKey, ctrlKey, or altKey to true when they are first pressed, so keyCode must also be used.
        
        /// Is Shift pressed?
        if (e.keyCode === 16 || e.shiftKey) {
            BF.keys_pressed.shift = true;
            if (!BF.keys_pressed[16]) {
                BF.keys_pressed[16] = 1;
            }
        } else if (BF.keys_pressed.shift) {
            delete BF.keys_pressed.shift;
        }
        /// Is Ctrl pressed?
        if (e.keyCode === 17 || e.ctrlKey) {
            BF.keys_pressed.ctrl = true;
            if (!BF.keys_pressed[17]) {
                BF.keys_pressed[17] = 1;
            }
        } else if (BF.keys_pressed.ctrl) {
            delete BF.keys_pressed.ctrl;
        }
        /// Is Alt pressed?
        if (e.keyCode === 18 || e.altKey) {
            BF.keys_pressed.alt = true;
            if (!BF.keys_pressed[18]) {
                BF.keys_pressed[18] = 1;
            }
        } else if (BF.keys_pressed.alt) {
            delete BF.keys_pressed.alt;
        }
        
        ///NOTE: If both Shift and Ctrl are pressed, the Alt key often is wrongly interpreted as the Meta key;
        ///      therefore, if the Alt key was pressed before Shift or Ctrl, no Alt key onkeyup event will fire,
        ///      So, to eliminate false positive Alt key presses, we just delete any reference to the Alt key.
        if (BF.keys_pressed.shift && BF.keys_pressed.ctrl) {
            delete BF.keys_pressed[18];
            delete BF.keys_pressed.alt;
        }
    }, false);
    
    /**
     * Detect when Alt, Ctrl, and Shift are no longer being pressed down.
     *
     * @param e (event object) The keyboard event object.
     */
    window.addEventListener("keyup", function (e)
    {
        /// 16 Shift (left or right)
        /// 17 Ctrl  (left or right)
        /// 18 Alt   (left or right)
        
        if (BF.keys_pressed[e.keyCode]) {
            ///NOTE: WebKit only fires one onkeyup event if more than one of the same keys are pressed.
            ///      For example, if both shift keys are pressed, the onkeyup event will only fire when the first shift key is released, not the second.
            ///      So, to avoid false positives, on WebKit, we must delete the key code regardless of the value.
            if (BF.keys_pressed[e.keyCode] < 2 || BF.is_WebKit) {
                delete BF.keys_pressed[e.keyCode];
            } else {
                BF.keys_pressed[e.keyCode] -= 1;
            }
        }
        
        if (!BF.keys_pressed[16]) {
            delete BF.keys_pressed.shift;
        }
        if (!BF.keys_pressed[17]) {
            delete BF.keys_pressed.ctrl;
        }
        if (!BF.keys_pressed[18]) {
            delete BF.keys_pressed.alt;
        }
    }, false);
    
    /// Since onkeyup is not fired if the page is not in focus, clear all keys to avoid false positives.
    window.addEventListener("blur", function ()
    {
        BF.keys_pressed = {};
    }, false);
    
    /// Since onblur is not called when oncontextmenu (and onkeyup is not called as long as the menu is opened), we must clear the keys to avoid false positives.
    window.addEventListener("contextmenu", function ()
    {
        BF.keys_pressed = {};
    }, false);
    
    
    /// Declare helper function(s) attached to the global BibleForge object (BF).
    
    /**
     * Remove an element or a range of elements from an array.
     *
     * @example BF.remove([0,1,2,3],  1);       /// Converts array to [0,2,3]
     * @example BF.remove([0,1,2,3],  1, true); /// Converts array to [0,3,2] (note the messed up order)
     * @example BF.remove([0,1,2,3], -1);       /// Converts array to [0,1,2]
     * @example BF.remove([0,1,2,3], -1, true); /// Converts array to [0,1,2]
     * @param   arr (array)   The array to mutate.
     * @param   i   (integer) The index to remove.
     * @return  NULL.  It mutates the array.
     */
    BF.remove = function (arr, i, order_irrelevant)
    {
        var len = arr.length;
        
        /// Handle negative numbers.
        if (i < 0) {
            i = len + i;
        }
        
        /// If the last element is to be removed, then all we need to do is pop it off.
        ///NOTE: This is always the fastest method and it is orderly too.
        if (i === len - 1) {
            arr.pop();
        /// If the second to last element is to be removed, we can just pop off the last one and replace the second to last one with it.
        ///NOTE: This is always the fastest method and it is orderly too.
        } else if (i === len - 2) {
            arr[len - 2] = arr.pop();
        /// Can use we the faster (but unorderly) remove method?
        } else if (order_irrelevant || i === len - 2) {
            if (i >= 0 && i < len) {
                /// This works by popping off the last array element and using that to replace the element to be removed.
                arr[i] = arr.pop();
            }
        } else {
            /// The first element can be quickly shifted off.
            if (i === 0) {
                arr.shift();
            /// Ignore numbers that are still negative.
            ///NOTE: By default, if a number is below the total array count (e.g., BF.remove([0,1], -3)), splice() will remove the first element.
            ///      This behavior is undesirable because it is unexpected.
            } else if (i > 0) {
                /// Use the orderly, but slower, splice method.
                arr.splice(i, 1);
            }
        }
    };
    
    /**
     * Safely parse JSON.
     *
     * @param  str (string) The JSON encoded string to parse.
     * @return The parsed JSON or undefined if the JSON is invalid.
     */
    BF.parse_json = function (str)
    {
        try {
            return JSON.parse(str);
        } catch (e) {}
    };
    
    /**
     * Create the history object for handling browser history changes.
     *
     * @return An object that handles history events.
     */
    BF.history = (function ()
    {
        var cur_state = {},
            cur_url   = window.location.pathname,
            func_arr  = [];
        
        /**
         * Add an event to the window.onpopstate event cue.
         *
         * @param  func (function) The function to call when the window.onpopstate event is triggered.
         * @return NULL
         * @note   If func(e) calls e.stopPropagation(), it will stop further event propagation.
         * @note   Currently, there is no detach() function because it is not needed.
         */
        function attach(func)
        {
            if (typeof func === "function") {
                func_arr[func_arr.length] = func;
            }
        }
        
        /// If the browser supports the History API, use that; if it does not, create dummy functions so that no errors are thrown (and ignore session state).
        if (window.history) {
            /**
             * Run attached functions onpopstate.
             *
             * @param e (event object) The onpopstate event object.
             */
            window.addEventListener("popstate", function (e)
            {
                var event = {state: e.state},
                    func_arr_len = func_arr.length,
                    i,
                    stop_propagation;
                
                /**
                 * Prevent propogation to other attached functions.
                 */
                event.stopPropagation = function ()
                {
                    stop_propagation = true;
                };
                
                /// Update the current state and URL.
                cur_state = e.state;
                cur_url   = window.location.pathname;
                
                /// Run the attached functions.
                for (i = 0; i < func_arr_len; i += 1) {
                    func_arr[i](event);
                    if (stop_propagation) {
                        break;
                    }
                }
            }, false);
            
            
            return {
                attach: attach,
                /**
                 * Get the current history state.
                 *
                 * @note   If the current state is NULL (or falsey) an empty object will be returned.
                 * @return An object representing the current state.
                 */
                getState: function ()
                {
                    ///NOTE: Make sure that the session is an object.
                    return cur_state || {};
                },
                /**
                 * Push a new state to the history.
                 *
                 * @param url   (string) The new URL to put into the history.
                 * @param state (object) The state object to attach to the history.
                 */
                pushState: function (url, state)
                {
                    cur_state = state;
                    cur_url   = url;
                    window.history.pushState(state, "", url);
                },
                /**
                 * Replace the current state with a new one.
                 *
                 * @param url   (string) The new URL which will replace the current URL in the history.
                 * @param state (object) A new state object to attach to the history, which overrides the current one.
                 */
                replaceState: function (url, state)
                {
                    cur_state = state;
                    cur_url   = url;
                    window.history.replaceState(state, "", url);
                },
                /**
                 * Replace the current state object with a new one.
                 *
                 * @param state (object) A new state object to attach to the history, which overrides the current one.
                 * @note  This is essentially a shorthand for replaceState(), with the advantage of not needing to determine the current URL.
                 */
                updateState: function (state)
                {
                    this.replaceState(cur_url, state);
                }
            };
        }
        
        /// If the browser does not support the history API, just create dummy functions to prevent errors from being thrown.
        ///NOTE: The site will still work; just the back and forward buttons won't.
        return {
            attach: attach,
            getState: function ()
            {
                return {};
            },
            pushState: function () {},
            replaceState: function () {}
        };
    }());
    
    
    /**
     * Insert data into a string.
     *
     * @example BF.insert({"a": "text", num: 10}, "This is some {a}; {num} is a number. Here's more {a}.") /// Returns "This is some text; 10 is a number. Here's more text."
     * @param   obj      (object) An object representing the data to insert.
     * @param   template (string) The template string using curly brackets with a name to indicate placeholders.
     */
    BF.insert = function (obj, template)
    {
        /// Match all matching curly brackets, and send them to the function.
        return template.replace(/{([^{}]+)}/g, function (whole, inside)
        {
            var data = obj[inside];
            return typeof data !== "undefined" ? data : whole;
        });
    };
    
    /**
     * Escape a string to be safely added inside HTML.
     *
     * @example BF.escape_html('This is a "harmless" comment <script>...</script>'); /// Returns "This is a &quot;harmless&quot; comment &lt;script&gt;...&lt;/script&gt;"
     * @param   str (string) The string to be escaped
     * @note    This code only escapes the few dangerous symbols, not all of them.
     */
    BF.escape_html = function (str)
    {
        ///NOTE: It must first replace ampersands (&); otherwise, the other entities would be escaped twice.
        return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    
    /**
     * Create an easy to use Ajax object.
     *
     * @example var ajax = new BF.Create_easy_ajax();
     * @return  Returns an object that makes ajax easier.
     */
    BF.Create_easy_ajax = (function ()
    {
        /**
         * Create the global_retry object and closure.
         */
        var global_retry = (function ()
        {
            var func_arr = [],
                retrying  = false;
            
            /**
             * Loop through all of the attached functions to retry the pending queries.
             *
             * @note All functions are run approximately the same time, regardless of when they were cued.
             */
            function retry()
            {
                var i;
                
                for (i = func_arr.length - 1; i >= 0; i -= 1) {
                    ///NOTE: The functions are executed via setTimeout to ensure that no other functions will get attached in the mean time.
                    window.setTimeout(func_arr[i], 0);
                }
                
                /// After re-running all of the Ajax queries, clear the list.  If there is still a problem, they will get re-attached.
                func_arr = [];
                retrying  = false;
            }
            
            return {
                /**
                 * Attach a function to the retry cue.
                 *
                 * Also, set the retry timeout if is is not already pending.
                 *
                 * @param func (function) The function to add to the list of functions to run when retrying.
                 */
                attach: function (func)
                {
                    if (typeof func === "function") {
                        func_arr[func_arr.length] = func;
                        
                        if (!retrying) {
                            ///TODO: Adjust the delay according to how many times the queries have failed and perhaps other factors (like connection quality and speed).
                            window.setTimeout(retry, 2000);
                            retrying = true;
                        }
                    }
                },
                /**
                 * Remove a function from the retry cue.
                 *
                 * @param func (function) The function to remove from the list of functions to run when retrying.
                 */
                detach: function (func)
                {
                    var i;
                    
                    for (i = func_arr.length - 1; i >= 0; i -= 1) {
                        if (func_arr[i] === func) {
                            BF.remove(func_arr, i);
                            /// Since a function can (or at least should) only be cued once, it does not need to keep looping.
                            return;
                        }
                    }
                }
            };
        }());
        
        /**
         * Create the function that creates easy to use Ajax objects.
         */
        return function Create_easy_ajax()
        {
            var aborted,
                ajax = new window.XMLHttpRequest(),
                ajax_obj,
                ajax_timeout,
                retry_func,
                retrying = false;
            
            ajax_obj = {
                /**
                 * Stop the query if it is already in progress.
                 *
                 * Also, prevent it from retrying as well.
                 */
                abort: function ()
                {
                    /// If the query is waiting to be retried, it needs to be removed from the retrying cue.
                    if (retrying) {
                        retrying = false;
                        global_retry.detach(retry_func);
                    }
                    /// Is a query in progress?  If readyState > 0 and < 4, it needs to be aborted.
                    if (ajax.readyState % 4) {
                        /// Stop it from retrying from a timeout.
                        window.clearTimeout(ajax_timeout);
                        ajax.abort();
                        aborted = true;
                    }
                },
                /**
                 * Determines whether or not the Ajax object is busy preforming a query or waiting to retry a query.
                 */
                is_busy: function ()
                {
                    /// Even though the Ajax object is idle when retrying, it should still be considered busy since a query is still potentially coming.
                    ///NOTE: Any readyState not 0 or 4 is busy.
                    return retrying || Boolean(ajax.readyState % 4);
                },
                /**
                 * Create the closure to easily send Ajax queries to the server.
                 */
                query: (function ()
                {
                    /**
                     * Send the Ajax request and start timeout timer.
                     *
                     * @param  message (string)  The variables to send (URI format: "name1=value1&name2=value%202").
                     * @param  timeout (number)  How long to wait before giving up on the script to load (in milliseconds).
                     * @param  retry   (boolean) Whether or not to retry loading the script if a timeout occurs.
                     * @return NULL
                     * @note   This code is a separate function to reduce code duplication.
                     * @note   Called by the BF.Create_easy_ajax.query().
                     */
                    function send_query(message, timeout, retry)
                    {
                        ajax.send(message);
                        
                        if (timeout) {
                            /// Begin the timeout timer to ensure that the download does not freeze.
                            ///NOTE: ajax_timeout is cleared if the query completes before the timeout is fired (successfully or unsuccessfully).
                            ajax_timeout = window.setTimeout(function ()
                            {
                                ajax_obj.abort();
                                ///TODO: If it should not retry, it should return undefined to the callback.
                                if (retry) {
                                    retrying = true;
                                    ///NOTE: retry_func() was created in the query() function but initialized outside to give other functions access to it.
                                    global_retry.attach(retry_func);
                                }
                            }, timeout);
                        }
                    }
                    
                    /**
                     * Send an Ajax request to the server.
                     *
                     * @example .query("POST", "api", "q=search", function (data) {}, function (status, data) {}, 10000, true);
                     * @param   method    (string)              The HTTP method to use (GET || POST).
                     * @param   path      (string)              The URL to query.
                     * @param   message   (string)   (optional) The variables to send (URI format: "name1=value1&name2=value%202").
                     * @param   onsuccess (function) (optional) The function to run on a successful query.
                     * @param   onfailure (function) (optional) The function to run if the query fails.
                     * @param   timeout   (number)   (optional) How long to wait before giving up on the script to load (in milliseconds).
                     *                                          A falsey value (such as 0 or FALSE) disables timing out.         (Default is 30,000 milliseconds.)
                     * @param   retry     (boolean)  (optional) Whether or not to retry loading the script if a timeout occurs.  (Default is TRUE.)
                     * @return  NULL
                     * @todo    Determine if it should change a method from GET to POST if it exceeds 2,083 characters (IE's rather small limit).
                     */
                    return function query(method, path, message, onsuccess, onfailure, timeout, retry)
                    {
                        var post_message,
                            failed;
                        
                        /// Because queries could be stored in the global_retry and run later, we need to make sure any cued queries are aborted.
                        ajax_obj.abort();
                        /// Reset the aborted variable because we are starting a new query.
                        aborted = false;
                        
                        /// Determine if arguments were passed to the last two parameters.  If not, set the defaults.
                        if (typeof timeout === "undefined") {
                            /// Default to 30 seconds.
                            ///TODO: This should be dynamic based on the quality of the connection to the server.
                            timeout = 30000;
                        }
                        
                        if (typeof retry === "undefined") {
                            /// Set retry to TRUE by default.
                            retry = true;
                        }
                        
                        /**
                         * A function that can be called to resend the query.
                         *
                         * @note This function gets sent to global_retry.attach() if there is an error and the query needs to be resent.
                         * @note This must be created inside of query() but it is initiated outside so that it can be sent to global_retry.detach() if the query is aborted.
                         * @note Currently, this function is never cleared even when it is no longer needed.
                         */
                        retry_func = function ()
                        {
                            /// Set retrying to FALSE tells the Ajax object not to consider the query busy anymore when idle.
                            retrying = false;
                            query(method, path, message, onsuccess, onfailure, timeout, retry);
                        };
                        
                        if (method.toLowerCase() === "get") {
                            /// GET requests need the message appended to the path.
                            ajax.open(method, path + (message ? "?" + message : ""));
                        } else {
                            /// POST requests send the message later on (with .send()).
                            ajax.open(method, path);
                            post_message = message;
                        }
                        
                        /// Without the correct content-type, the data in the message will not become variables on the server.
                        ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                        
                        /**
                         * Handle Ajax failures.
                         */
                        failed = function failed()
                        {
                            if (onfailure) {
                                onfailure(ajax.status, ajax.responseText);
                            }
                            
                            /// Should it retry?
                            ///NOTE: Since 400 errors indicate a problem with the client, most 400 errors should not be repeated.
                            ///      Error 408 (Request Timeout) can be repeated by the client without modification.
                            if (retry && !aborted) {
                                retrying = true;
                                global_retry.attach(retry_func);
                            }
                        };
                        
                        ajax.onerror = failed;
                        
                        /**
                         * Handle the request once it has been completed.
                         */
                        ajax.onload = function onload()
                        {
                            /// Stop the timeout timer that may be running so it does not try again.
                            window.clearTimeout(ajax_timeout);
                            
                            /// HTTP status codes:
                            /// 1xx Informational
                            /// 2xx Success
                            /// 3xx Redirection
                            /// 4xx Client Error
                            /// 5xx Server Error
                            ///NOTE: If the status code is 0 that means that the server did not send back any response.
                            
                            /// Was the request successful?
                            ///NOTE: It may be good to accept other 200 level codes.
                            if (ajax.status === 200) {
                                if (onsuccess) {
                                    ///NOTE: It is not parsed here because it may not be parsed at all.
                                    onsuccess(ajax.responseText);
                                }
                            } else {
                                failed();
                            }
                        };
                        send_query(post_message, timeout, retry);
                    };
                }())
            };
            
            return ajax_obj;
        };
    }());
    
    /**
     * Load some Javascript and optionally send it some variables from the closure.
     *
     * @example BF.include("/path/to/script.js", {needed_var: var_from_the_closure}, 20000, false);
     * @param   path    (string)             The location of the JavaScript to load.
     * @param   context (object)             The variable to send to the included JavaScript.
     * @param   timeout (number)  (optional) How long to wait before giving up on the script to load (in milliseconds).
     *                                       A falsey value (such as 0 or FALSE) disables timing out.         (Default is 10,000 milliseconds.)
     * @param   retry   (boolean) (optional) Whether or not to retry loading the script if a timeout occurs.  (Default is TRUE.)
     * @return  NULL.  Executes code.
     * @todo    If the code has already been loaded, simply run the script without re-downloading anything.
     * @todo    Determine if it would be better to use a callback function rather than passing context.
     */
    BF.include = (function ()
    {
        /// Store the "this" variable to let the other functions access it.
        var that = this;
        
        /**
         * Eval code in a neutral scope.
         *
         * @param  code (string) The string to eval.
         * @return The result of the eval'ed code.
         * @note   Called when the Ajax request returns successfully.
         * @note   This function is used to prevent included code from having access to the variables inside of the function's scope.
         */
        this.evaler = function (code)
        {
            ///NOTE: Since the eval'ed code has access to the variables in this closure, we need to clear out the code variable both as a security caution and
            ///      to prevent memory leaks.  The following code does just that: (code = ""). However, this also messes up Firebug's debugger.
            return eval(code + (code = ""));
        };
        
        /// Prevent any eval'ed code from being able to modify the evaler() function.
        Object.freeze(this);
        
        return function (path, context, callback, timeout, retry)
        {
            (new BF.Create_easy_ajax()).query("GET", path, "", function (response)
            {
                /// Evaluate the code in a safe environment.
                /// Before evaluation, add the sourceURL so that debuggers can debug properly be matching the code to the correct file.
                /// See https://blog.getfirebug.com/2009/08/11/give-your-eval-a-name-with-sourceurl/.
                ///NOTE: The spec was recently changed to use //# to avoid complications with IE's conditional comments.
                ///      However, it doesn't work with older browsers (tried with Chromium 25), and the current form still works (albeit depreciated),
                ///      so for now, we'll keep //@ and change to //# at some point in the future.
                ///      See https://groups.google.com/forum/#!msg/mozilla.dev.js-sourcemap/4uo7Z5nTfUY/_YNQtSxdclkJ for details.
                var res = that.evaler(response + "//@ sourceURL=" + path);
                
                /// If the eval'ed code is a function, send it the context.
                if (typeof res === "function") {
                    res(context);
                }
                if (typeof callback === "function") {
                    callback();
                }
            }, null, timeout, retry);
        };
    ///NOTE: Since this anonymous function would have an undefined "this" variable, we need to use the call() function to specify an empty "this" object.
    ///      The "this" object is used to "secure" the code from the eval'ed code using Object.freeze().
    }).call({});
    
    /**
     * Gets the distance of an object from the top of the scroll.
     *
     * @example get_top_position(element);
     * @param   el (DOM element) An element in the DOM tree.
     * @return  Returns the distance of obj from the top of the scroll.
     * @note    Called by content_manager.scroll_to_verse() and wrench button onclick() in secondary.js.
     * @note    This does not take scroll position of nested elements.  Use getClientRects() to get the actual position on the viewport.
     */
    BF.get_position = function (el)
    {
        var left_pos = 0,
            top_pos  = 0;
        
        /// Does the element have another element above it (i.e., offsetParent) (it should at least have an HTMl element as a parent)?
        if (el.offsetParent) {
            do {
                left_pos += el.offsetLeft;
                top_pos  += el.offsetTop;
                
                el = el.offsetParent;
            ///NOTE: The variable el is falsey (NULL) when no more parents exist.
            } while (el);
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
        if (num < 1000) {
            /// Make sure that it is not undefined.
            ///NOTE: .toString() is faster.
            return num ? num.toString() : String(num);
        }
        
        return num.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
    };
        
    
    /**
     * Determine whether or not a psalm has a title.
     *
     * @param  c (integer) The psalm (i.e., chapter) to check.
     * @return A boolean indicating whether or not the psalm has a title
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
            v = verseID % 1000;
        
        c = ((verseID - v) % 1000000) / 1000;
        
        return {
            b: (verseID - v - c * 1000) / 1000000,
            c: c,
            v: v
        };
    };
    
    
    /**
     * Get the full verse reference (i.e., "title" (for Psalm titles), "subscription" (for Pauline subscriptions), or a number (for everything else)).
     *
     * @example BF.get_full_verse(0);       /// "title"
     * @example BF.get_full_verse(0, TRUE); /// 1
     * @example BF.get_full_verse(1);       /// 1
     * @example BF.get_full_verse(2);       /// 2
     * @example BF.get_full_verse(255);     /// "subscription"
     * @param   v               (number)             The verse to examine
     * @param   passover_titles (boolean) (optional) Whether to convert Psalm titles to 1 or to "title"
     * @return  A number or a string representing a verse
     */
    BF.get_full_verse = function (v, passover_titles)
    {
        /// The titles in the book of Psalms are referenced as verse zero (cf. Psalm 3).
        /// The subscriptions at the end of Paul's epistles are referenced as verse 255 (cf. Romans 16).
        return v === 0 ? (passover_titles ? 1 : BF.lang.title) : (v === 255 ? BF.lang.subscription : v);
    };
    
    
    /**
     * Create a properly formated verse reference from numbers.
     *
     * @example BF.create_ref({b:  1, c:  1, v:   1});                       /// "Genesis 1:1"
     * @example BF.create_ref({b: 19, c:  3, v:   0}, "en_em");              /// "Psalmes 3:title"
     * @example BF.create_ref({b: 19, c:  3, v:   0}, "en_em", true);        /// "Psalmes 3:1"
     * @example BF.create_ref({b: 19, c:  3, v:   0}, "zh_s",  true);        /// "诗3：1"
     * @example BF.create_ref({b: 45, c: 16, v: 255}, "en");                 /// "Romans 16:subscription"
     * @example BF.create_ref([{b: 45, c: 16, v: 1}, {b: 45, c: 16, v: 9}]); /// "Romans 16:1–9"
     * @example BF.create_ref([{b: 45, c: 16, v: 1}, {b: 46, c:  1, v: 1}]); /// "Romans 16:1–1 Corinthians 1:1"
     * @param   bcv             (object || array)            An object or array of objects containing the book, chapter, and verse to be converted: {b: book, c: chapter, v: verse}
     * @param   lang_id         (string)          (optional) The ID for a language (default: current language)
     * @param   passover_titles (boolean)         (optional) Whether to convert Psalm titles to 1 or to "title" (used by BF.get_full_verse())
     * @return  A string repersenting a verse reference or a blank string ("") if there was a problem
     * @note    Currently, it can only take up to two array elements.
     */
    BF.create_ref = function (bcv, lang_id, passover_titles)
    {
        var ref = "";
        
        if (bcv) {
            /// To make things consistent, convert an object into an array with one element.
            if (!Array.isArray(bcv)) {
                bcv = [bcv];
            }
            
            /// If there is no lang_id, use the current language.
            if (!lang_id) {
                lang_id = BF.lang.id;
            }
            
            /// Does the language and book exist?
            if (BF.langs[lang_id] && BF.langs[lang_id].books_short[bcv[0].b]) {
                /// Create the first part of the reference.
                ///NOTE: The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
                ref = (bcv[0].b === 19 ? BF.lang.psalm : BF.langs[lang_id].books_short[bcv[0].b]) + BF.langs[lang_id].space + (BF.lang.chapter_count[bcv[0].b] === 1 ? "" : bcv[0].c + BF.langs[lang_id].chap_separator) + BF.get_full_verse(bcv[0].v, passover_titles);
                
                /// Is this a verse range?
                if (bcv[1]) {
                    /// Are the books the same?
                    if (bcv[0].b === bcv[1].b) {
                        /// Are the chapters the same?
                        if (bcv[0].c === bcv[1].c) {
                            /// Are the verses different?
                            if (bcv[0].v !== bcv[1].v) {
                                /// Just add the verse number.
                                ref += BF.lang.ndash + BF.get_full_verse(bcv[1].v, passover_titles);
                            }
                        } else {
                            /// Add the chapter and verse number.
                            ref += BF.lang.ndash + (BF.lang.chapter_count[bcv[1].b] === 1 ? "" : bcv[1].c + BF.lang.chap_separator) + BF.get_full_verse(bcv[1].v, passover_titles);
                        }
                    } else {
                        /// Add the entire reference: book, chapter, and verse number.
                        ref += BF.lang.ndash + (bcv[1].b === 19 ? BF.lang.psalm : BF.langs[lang_id].books_short[bcv[1].b]) + BF.lang.space + (BF.lang.chapter_count[bcv[1].b] === 1 ? "" : bcv[1].c + BF.lang.chap_separator) + BF.get_full_verse(bcv[1].v, passover_titles);
                    }
                }
            }
        }
        
        return ref;
    };
    
    
    /// Determine if CSS transitions are supported by the browser.
    ///NOTE: All of these variables currently require vendor specific prefixes.
    BF.cssTransitions = typeof document.body.style.webkitTransition !== "undefined" || typeof document.body.style.MozTransition !== "undefined" || typeof document.body.style.OTransition !== "undefined";
    
    /**
     * Determine if a variable is really an object or not.
     *
     * @param  mixed (variable) The variable to analyze
     * @return TRUE if the variable is a real object (not including arrays), FALSE for all other types.
     * @note   Arrays inherit from Object, so they are a type of an object.
     * @note   Due to an old JavaScript bug (now a part of the standard), NULL is wrongly identified as an object when using typeof.
     */
    BF.is_object = function (mixed)
    {
        return typeof mixed === "object" && mixed !== null && !Array.isArray(mixed);
    };
    
    
    /**
     * Create a function that preloads fonts.
     *
     * @return A function that attempts to preload web fonts.
     */
    BF.preload_font = (function ()
    {
        /// Create an outer variable once that can be reused each time the function is called.
        var text_el;
        
        /**
         * Load web fonts by using a hidden element.
         *
         * @param className (string)            The CSS class to apply that contains the web font to load.
         * @param str       (string) (optional) An optional string to put into the element.
         * @note  The actual function is delayed to make sure that multiple calls to the function will all have time to let the browser start to download the font before the function is called again.
         * @note  The reason for the str parameter is that some fonts will only load if certain a character set is used (e.g., Hebrew or Greek letters).
         */
        return function preload_font(className, str)
        {
            /// Delay the function to make sure that there is a pause between each call to make sure that multiple calls will all take place.
            window.setTimeout(function ()
            {
                /// Has the element already been created?
                if (!text_el) {
                    text_el = document.createElement("div");
                    /// Make sure that it will not show up on the page anywhere by both moving it off the viewport and clipping it.
                    text_el.style.cssText = "position: absolute!important; top: -1000px!important; left: -1000px!important; clip: rect(0,0,0,0)!important";
                    ///NOTE: Because attaching elements to the DOM causes a reflow (which is slow) the element is left in the DOM.
                    ///      If there is a problem with doing this, it could be removed or hidden later via setTimeout(),
                    ///      but it needs to be in the DOM long enough for the font to begin downloading.
                    document.body.appendChild(text_el);
                }
                
                text_el.className = className;
                /// Set the string or default to "a" if none given.
                ///NOTE: textContent is essentially the same as innerText.
                text_el.textContent = str || "a";
            }, 0);
        };
    }());
    
    
    /**
     * Create both get_preferred_supported_lang() and get_acceptable_langs().
     */
    (function ()
    {
        var best_lang = "",
            all_langs;
        
        /**
         * Parse the string of languages.
         *
         * @param  str (string) The string to parse, which should be in accordance with the accept-language header format standardized by RFC 3282
         * @return A string representing the most preferred language from the client which is also supported language by BibleForge
         */
        function parse_langs(str)
        {
            var i,
                langs,
                langs_i,
                lang_id,
                langs_len,
                len,
                match,
                matches,
                res = [];
            
            /// Separate all languages from the header string.
            /// Example:
            ///     "en-US,en;q=0.8,en-CA;q=0.6,zh-CN;q=0.4,zh;q=0.2"
            ///     becomes
            ///     ["en-US", "en;q=0.8", "en-CA;q=0.6", "zh-CN;q=0.4", "zh;q=0.2"]
            matches = String(str).match(/[a-z]{1,3}(?:-[a-z-]+)?\s*(?:;\s*q\s*=\s*[\d.]+)?/ig);
            
            if (matches) {
                len = matches.length;
                langs = Object.keys(BF.langs);
                langs_len = langs.length;
                /// Loop through all languages.
                for (i = 0; i < len; i += 1) {
                    /// Isolate the language name and country code from the Q value.
                    /// Example: "en-CA;q=0.6" becomes "en-CA".
                    match = matches[i].match(/^[^;]+/i);
                    /// Loop through all of the languages to see if any match the language/country code.
                    for (langs_i = 0; langs_i < langs_len; langs_i += 1) {
                        /// If the language code matches, return the ID for that language.
                        /// Example: "en-US" will be matched by en.js, so it will return "en".
                        lang_id = langs[langs_i];
                        if (BF.langs[lang_id].match_lang.test(match[0]) && res.indexOf(lang_id) === -1) {
                            res[res.length] = lang_id;
                        }
                    }
                }
            }
            
            /// If nothing matches, just return a blank string.
            return res;
        }
        
        /**
         * Attempt to figure out all languages the client claims to support.
         *
         * @return UNDEFINED.  Any languages that it finds will be stored in the "all_langs" closure variable.
         * @note   This is done by first attempting to get the accept-language header and will fallback to parsing less accurate variables.
         */
        function get_all_langs()
        {
            ///NOTE: The most reliable way to check for language preference is to parse the accept-language header sent by the browser; however, JavaScript cannot access the browser's headers.
            ///      In order to get the accept-language header, the server is configured to bounce back the client's accept-language header to us in the X-client-accept-lang header.
            ///      In order to get the X-client-accept-lang header, we need to make a synchronous Ajax call to load the same page (i.e., "#").
            ///      There should not actually be any network delay since the browser should cache all requests.
            ///      This is far from ideal, but the language preference only needs to be checked the very first time the client accesses BibleForge.
            ///      Another option would be for the server to embed the header inside of the HTML when it first loads, but then it would no longer be a simple static page.
            
            /// Send a synchronous Ajax call in order to get the special header sent by the server.
            ///NOTE: Since all HTML requests are cached, there should be very little delay.
            ///TODO: Use a different file, like main.js (one that is actually cached).
            ///      Better yet, restructure the code so that this info is already received when loading main.js.
            var ajax = new window.XMLHttpRequest();
            ajax.open("GET", "#", false); ///NOTE: Setting the third parameter to FALSE makes it synchronous.
            ajax.send();
            
            ///NOTE: If, for some reason, the X-client-accept-lang header is unaccessible, we can fallback to checking the browser's navigator object.
            ///      However, FireFox and Chrome support window.navigator.language but they treat it very differently and both only return one language.
            ///      IE supports window.navigator.userLanguage but again only returns one language.
            ///      Each browser treats these language preferences differently and may send, for example, the browser's or OS's UI language.
            ///      In short, the navigator object is not to be trusted as accurately communicating the client's preference.
            ///      This is why we go through the trouble of capturing the accept-language header.
            /// Store the language so that it does not have to be looked up again if this function were called again.
            all_langs = parse_langs(ajax.getResponseHeader ? ajax.getResponseHeader("X-client-accept-lang") : window.navigator.language || window.navigator.userLanguage);
        }
        
        /**
         * Get (and store) the most preferred and supported language.
         *
         * @return A string representing the most preferred language from the client which is also supported language by BibleForge or a blank string if none found
         */
        BF.get_preferred_supported_lang = function get_preferred_supported_lang()
        {
            /// Has the most preferred and supported language already been found?
            if (!best_lang) {
                if (!all_langs) {
                    get_all_langs();
                }
                
                if (all_langs && all_langs.length > 0) {
                    best_lang = all_langs[0];
                }
            }
            
            return best_lang;
        };
        
        /**
         * Get a list of all languages the client claims to accept.
         *
         * @return An array of strings representing languages or UNDEFINED if none found
         */
        BF.get_acceptable_langs = function ()
        {
            if (!all_langs) {
                get_all_langs();
            }
            
            return all_langs;
        };
    }());
    
    
    /**
     * Create a DOM element (or fragment)
     *
     * @param type       (string)            The type of element or "documentFragment" to make a document fragment
     * @param attributes (object) (optional) An object containing the attributes and values of the new element
     * @param events     (object) (optional) An object containing the DOM events to attach, without the "on" prefix
     * @param children   (array)  (optional) An array of DOM elements and/or fragments to append to the element
     */
    BF.create_dom_el = function (type, attributes, events, children)
    {
        var el = type === "documentFragment" ? document.createDocumentFragment() : document.createElement(type);
        
        /// Set HTML attributes, if any.
        if (BF.is_object(attributes)) {
            Object.keys(attributes).forEach(function (prop)
            {
                /// Some properties are specially and must be set via el.setAttribute().
                if (prop === "list" || prop === "for") {
                    el.setAttribute(prop, attributes[prop]);
                } else {
                    el[prop] = attributes[prop];
                }
            });
        }
        
        /// Attach event functions, if any.
        if (typeof events === "object" && events instanceof Object) {
            Object.keys(events).forEach(function (prop)
            {
                el.addEventListener(prop, events[prop]);
            });
        }
        
        /// Append child elements/fragments, if any.
        if (Array.isArray(children)) {
            children.forEach(function (child)
            {
                el.appendChild(child);
            });
        }
        
        return el;
    };
    
    
    /**
     * Update the timestamp for the specific language.
     *
     * @param lang (string) The language to update
     */
    BF.upate_recent_langs = function (lang)
    {
        var recent_langs = BF.parse_json(window.localStorage.getItem("recent_langs")) || {};
        
        recent_langs[lang] = Date.now();
        
        window.localStorage.setItem("recent_langs", JSON.stringify(recent_langs));
    };
    
    /**
     * Get a list of recently used and acceptable languages
     *
     * @param first (string) (optional) The language to add to the beginning of the array
     */
    BF.get_recent_and_acceptable_langs = function (first)
    {
        var acceptable_langs,
            recent_langs = BF.parse_json(window.localStorage.getItem("recent_langs")) || {},
            langs = [];
        
        if (first) {
            langs[langs.length] = first;
        }
        
        /// Loop through the recently used languages and add them to the list, if they are not already there.
        Object.keys(recent_langs).forEach(function (lang)
        {
            if (langs.indexOf(lang) === -1) {
                langs[langs.length] = lang;
            }
        });
        
        acceptable_langs = BF.get_acceptable_langs();
        
        /// Loop through the languages the client claims are acceptable and add them to the list, if they are not already there.
        if (acceptable_langs) {
            acceptable_langs.forEach(function (lang)
            {
                if (langs.indexOf(lang) === -1) {
                    langs[langs.length] = lang;
                }
            });
        }
        
        return langs;
    };
    
    
    /**
     * Initialize the BibleForge environment.
     *
     * Load all of the JavaScript necessary to start BibleForge running,
     * and then load the remainder lazily.
     *
     * @param  viewPort     (object) The HTML element which encapsulates all of the other objects.
     * @param  doc_docEl    (object) The document.documentElement element (the <html> element).
     * @return NULL.  Some functions are attached to events and the rest accompany them via closure.
     */
    BF.create_viewport = function (viewPort, doc_docEl)
    {
        var run_new_query,
            
            /// DOM Elements
            bottomLoader,
            langEl,
            leftInfo,
            queryButton,
            page,
            qEl,
            searchForm,
            topBar,
            topLoader;
        
        /// Find the DOM elements relative to viewPort.
        /// Expected HTML Structure:
        ///     viewPort
        ///     ├─►topBar
        ///     │  ├─►searchBar
        ///     │  │  └─►searchForm
        ///     │  │     └─►label
        ///     │  │        └─►nobr
        ///     │  │           ├─►lang
        ///     │  │           ├─►q
        ///     │  │           └─►button
        ///     │  └─►infoBar
        ///     │     └─►leftInfo
        ///     ├─►topLoader
        ///     ├─►scroll
        ///     └─►bottomLoader
        
        topBar       = viewPort.firstChild;
        searchForm   = topBar.firstChild.firstChild;
        langEl       = searchForm.firstChild.firstChild.firstChild;
        qEl          = langEl.nextSibling;
        queryButton  = qEl.nextSibling;
        topLoader    = topBar.nextSibling;
        page         = topLoader.nextSibling;
        bottomLoader = page.nextSibling;
        leftInfo     = topBar.lastChild.firstChild;
        
        (function ()
        {
            var viewPort_num,
                
                /// Objects
                content_manager,
                query_manager,
                settings,
                system;
            
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
                /// Create settings object.
                settings = {
                    user: {},
                    view: {}
                };
                
                Object.defineProperty(settings, "add_property", {
                    /// Make sure it cannot be deleted (or the type changed).
                    configurable: false,
                    /// Make sure it will not be listed when using JSON.stringify().
                    enumerable:   false,
                    /// Make sure the function cannot be changed.
                    writable:     false,
                    ///NOTE: No get or set property is needed when using value.
                    /**
                     * Create an object with getter and setter abilities.
                     *
                     * @example add_property(settings.view, "red_letters", true, function onchange(values) {});
                     * @param   parent_obj (object)              The object to which the property will be attached.
                     * @param   name       (string)              The name of the property.
                     * @param   cur_val    (mixed)    (optional) The default value.
                     * @param   onchange   (function) (optional) The function to be called after the set method is called.
                     *                                           When the onchange is called, an object is passed to it containing the previous value (.old_val)
                     *                                           and the current value (.new_val).
                     * @return  NULL.  The property is attached to the object.
                     * @note    onchange() is called after the value is changed.
                     * @note    This is used to handle data in the settings object.
                     * @note    Could make parent_obj a string that refers to an element on the settings object, but then it could not accept nested properties.
                     * @todo    Determine if there should be a validate_change function as a parameter that can accept or reject a change.
                     */
                    value: function add_property(parent_obj, name, default_val, onchange)
                    {
                        var cur_val = (parent_obj[name] === undefined) ? default_val : parent_obj[name];
                        
                        Object.defineProperty(parent_obj, name, {
                            /**
                             * Get the property.
                             *
                             * @return The current value of the property.
                             */
                            get: function ()
                            {
                                return cur_val;
                            },
                            /**
                             * Set the property and trigger the onchange function.
                             *
                             * @param new_val (mixed) The value to set the property to.
                             */
                            set: function (new_val)
                            {
                                /// Temporarily store the original value to be sent to the onchange function.
                                var old_val = cur_val;
                                
                                /// Set the new value.
                                cur_val = new_val;
                                
                                if (window.localStorage) {
                                    /// Save the settings object so that the user's settings can be loaded the next time the page is accessed.
                                    window.localStorage.setItem("settings", JSON.stringify(settings));
                                }
                                
                                /// Optionally, run a function after the value is changed.
                                if (typeof onchange === "function") {
                                    onchange({old_val: old_val, new_val: new_val});
                                }
                            },
                            
                            /// Default property settings:
                            ///NOTE: The "writable" property is not used when using a get function.
                            
                            /// With configurable set to FALSE, these properties cannot be changed later.
                            ///NOTE: Since we use a get function, the value can be set to a different type of variable.
                            configurable: false,
                            /// Make sure that the property is retrieved when using JSON.stringify().
                            enumerable:   true
                        });
                    }
                });
                
                /// Create get/set pairs with Object.defineProperty, and load default settings.
                
                /**
                 * Reload the content when switching between paragraph modes.
                 *
                 * @todo Make sure this works even if the user has not preformed a query yet.
                 */
                settings.add_property(settings.view, "in_paragraphs", true, function ()
                {
                    /// Handle changing paragraph mode.
                    
                    /// If the last query was a search, nothing needs to be done since only verse lookups are affected by paragraph mode.
                    ///NOTE: Since this function will be called before query_manager is created when loading saved settings, check to make sure it exists.
                    if (typeof query_manager === "undefined" || query_manager.query_type !== BF.consts.verse_lookup) {
                        return;
                    }
                    
                    /// Are there any verses displayed on the scroll?
                    if (content_manager.top_verse !== false) {
                        /// Clear the scroll because the view is changing dramatically.
                        ///NOTE: It does not necessarily need to reload the verses if switching from paragraph mode to non-paragraph mode.
                        content_manager.clear_scroll();
                        
                        /// Reload verses to where the user left off.
                        ///TODO: Store url_suffix.
                        run_new_query(settings.user.last_query.real_query, false, true, settings.user.position);
                    }
                });
                
                /**
                 * Modify the CSS when switching between red- and black-letter mode.
                 *
                 * @param values (object) The previous and current values of the red_letters properties.
                 */
                settings.add_property(settings.view, "red_letters", true, function (values)
                {
                    /// Alternate between red and black letters.
                    ///TODO: Add other options, such as custom color, and (in the future) highlighting of other people's words (e.g., highlight the words of Paul in blue).
                    if (values.new_val) {
                        ///NOTE: Since red letter is probably most common, add a class if red letters is turned off (which should make parsing CSS a bit faster).
                        page.classList.remove("black_letter");
                    } else {
                        page.classList.add("black_letter");
                    }
                });
                
                /**
                 * Enable/disable night mode.
                 *
                 * @param values (object) The current (and previous) settings of the night mode option.
                 */
                settings.add_property(settings.view, "night_mode", false, (function ()
                {
                    var css_added;
                    
                    /**
                     * WebKit scrollbar styles do not apply to scrollbars already visible, so they need to be hidden briefly.
                     */
                    function webkit_scrollbar_hack()
                    {
                        ///TODO: Explain why overflowY needs to be changed.
                        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
                        /// Since hiding the scrollbar moves the page, we need to push the page back to the left half of the scrollbar width.
                        ///NOTE: The query box, however, does not get pushed back.
                        document.getElementsByTagName("html")[0].style.marginLeft = "-4px";
                        window.setTimeout(function ()
                        {
                            document.getElementsByTagName("html")[0].style.overflowY = "scroll";
                            document.getElementsByTagName("html")[0].style.marginLeft = "0";
                        }, 10);
                    }
                    
                    /**
                     * Change to/from night mode.
                     *
                     * @param values (object) An object containing the new value (.new_val) and the original value (.old_val).
                     */
                    return function onchange(values)
                    {
                        var link_tag;
                        
                        /// Should night mode be turned on?
                        if (values.new_val) {
                            /// Has the CSS not already been added (i.e., is this the first time to enable night mode)?
                            if (!css_added) {
                                /// Create a <style> element and add it to the DOM.
                                link_tag = document.createElement("link");
                                link_tag.href = "/styles/night.css?67ab37278173d0789a533907de977b89";
                                link_tag.rel  = "stylesheet";
                                
                                ///NOTE: WebKit needs some help to update the scroll bar colors.
                                if (BF.is_WebKit) {
                                    /// When the CSS loads, call the function that makes WebKit update the colors.
                                    link_tag.onload = webkit_scrollbar_hack;
                                }
                                ///TODO: Add a wait cursor since it can take a long time.
                                document.getElementsByTagName("head")[0].appendChild(link_tag);
                                css_added = true;
                            } else {
                                /// If the CSS has already been added, we'll need to manually call the function to update WebKit's colors.
                                if (BF.is_WebKit) {
                                    webkit_scrollbar_hack();
                                }
                            }
                            /// Add "night" to the HTML class list to make the CSS styles to take effect.
                            document.getElementsByTagName("html")[0].classList.add("night");
                        } else {
                            /// Remove "night" to the HTML class list to make the CSS styles go back to normal.
                            document.getElementsByTagName("html")[0].classList.remove("night");
                            /// Since the colors changed, we need to call the function to update WebKit's styles.
                            if (BF.is_WebKit) {
                                webkit_scrollbar_hack();
                            }
                        }
                    };
                }()));
                
                settings.add_property(settings.user, "last_query", {});
                
                settings.add_property(settings.user, "position", {});
                
                /// The entered_text property stores what the user last typed in to the query box, even if the user never actually submitted the query.
                settings.add_property(settings.user, "entered_text");
                
                /// Load user settings (if any).
                /// Does the browser support localStorage? (All modern browsers should.)
                ///NOTE: BibleForge does not prune unused settings from the localStorage (extension loaded later might use seemingly unused settings).
                if (window.localStorage) {
                    /**
                     * Recursively step through an object and load saved settings.
                     *
                     * @example load_settings({view:{in_paragraphs: false}}, settings);
                     * @example load_settings({in_paragraphs: false}, settings.view);
                     * @param   new_setting  (object) The new settings to load.
                     * @param   settings_obj (object) The part of the settings variable to change.
                     * @return  NULL
                     * @note    Because no other functions call this function, it is called immediately as a function statement.
                     */
                    (function load_settings(new_settings, settings_obj)
                    {
                        var prop;
                        
                        if (!BF.is_object(new_settings)) {
                            return;
                        }
                        
                        for (prop in new_settings) {
                            ///NOTE: According to Crockford (http://yuiblog.com/blog/2006/09/26/for-in-intrigue/), for in loops should be filtered.
                            if (new_settings.hasOwnProperty(prop)) {
                                if (BF.is_object(new_settings[prop])) {
                                    /// If the new_settings object is trying to load a setting that does not yet exist in the settings variable,
                                    /// create a new object and attach it to the settings variable.
                                    ///NOTE: The thought is that, in the future, extensions that are be loaded later could have their own settings,
                                    ///      so we need to load the saved settings, and when the extension later loads, it can check to see if
                                    ///      the settings have been already set.  If they are set, it would then grab the data and then create
                                    ///      get/set properties to handle changing the settings later on.
                                    if (!settings_obj[prop]) {
                                        settings_obj[prop] = {};
                                    }
                                    /// Recursively call itself to step through the object's objects.
                                    load_settings(new_settings[prop], settings_obj[prop]);
                                } else {
                                    /// Only set the property if it is different (i.e., not default).
                                    if (settings_obj[prop] !== new_settings[prop]) {
                                        settings_obj[prop] = new_settings[prop];
                                    }
                                }
                            }
                        }
                    }(BF.parse_json(window.localStorage.getItem("settings")), settings));
                }
                
                /// Create the configuration menu options.
                ///NOTE: This is done after loading saved settings to prevent the possibility of them overwritting them.
                Object.defineProperty(settings.view, "options", {
                    /// Make sure it cannot be deleted (or the type changed).
                    configurable: false,
                    /// Make sure it will not be listed when using JSON.stringify().
                    enumerable:   false,
                    /// More options may need to be added by code that loads later.
                    writable:     true,
                    ///NOTE: This array is used by secondary.js to create the configuration pane.
                    value: [
                            {
                                type:     "checkbox",
                                settings: "red_letters"
                            },
                            {
                                type:     "checkbox",
                                settings: "in_paragraphs"
                            },
                            {
                                type:     "checkbox",
                                settings: "night_mode"
                            }
                        ]
                    }
                );
            }());
            
            
            system = {
                event: (function ()
                {
                    var func_list = {};
                    
                    return {
                        /**
                         * Add one or more events to the event cue.
                         *
                         * @example system.event.attach("contentAddedAbove", function (e) {});
                         * @example system.event.attach("contentAddedAbove", function (e) {}, true);
                         * @example system.event.attach(["contentAddedAbove", "contentRemovedAbove"], function (e) {});
                         * @example system.event.attach(["contentAddedAbove", "contentRemovedAbove"], function (e) {}, true);
                         * @example system.event.attach(["contentAddedAbove", "contentRemovedAbove"], function (e) {}, [true, false]);
                         * @param   name (string || array)             The name of the event or an array of names of events.
                         * @param   func (function)                    The function to call when the event it triggered.
                         * @param   once (boolean || array) (optional) Whether or not to detach this function after being executed once. If "name" is an array, then "once" can also be an array of booleans.
                         * @return  NULL
                         * @note    If func(e) calls e.stopPropagation(), it will stop further event propagation.
                         * @todo    Determine the value of adding a run_once property that removes function after the first run.
                         */
                        attach: function (name, func, once)
                        {
                            var arr_len,
                                i;
                            
                            /// Should the function be attached to multiple events?
                            if (name instanceof Array) {
                                arr_len = name.length;
                                for (i = 0; i < arr_len; i += 1) {
                                    /// If "once" is an array, then use the elements of the array.
                                    /// If "once" is not an array, then just send the "once" variable each time.
                                    this.attach(name[i], func, once instanceof Array ? once[i] : once);
                                }
                            } else {
                                if (typeof func === "function") {
                                    /// Has a function been previously attached to this event? If not, create a function to handle them.
                                    if (!func_list[name]) {
                                        func_list[name] = [];
                                    }
                                    func_list[name][func_list[name].length] = {
                                        func: func,
                                        once: once
                                    };
                                }
                            }
                        },
                        /**
                         * Remove an event from the event cue.
                         *
                         * @example system.event.detach("contentAddedAbove", function (e) {});
                         * @example system.event.detach(["contentAddedAbove", "contentRemovedAbove"], function (e) {}, [true, false]);
                         * @example system.event.detach(["contentAddedAbove", "contentRemovedAbove"], function (e) {}, true);
                         * @param   name (string || array)             The name of the event or an array of names of events.
                         * @param   func (function)                    The function that was attached to the specified event.
                         * @param   once (boolean || array) (optional) Whether or not to detach this function after being executed once. If "name" is an array, then "once" can also be an array of booleans.
                         */
                        detach: function (name, func, once)
                        {
                            var i;
                            
                            /// Are there multiple events to remove?
                            if (name instanceof Array) {
                                for (i = name.length - 1; i >= 0; i -= 1) {
                                    /// If "once" is an array, then use the elements of the array.
                                    /// If "once" is not an array, then just send the "once" variable each time.
                                    this.detach(name[i], func, once instanceof Array ? once[i] : once);
                                }
                            } else if (func_list[name]) {
                                for (i = func_list[name].length - 1; i >= 0; i -= 1) {
                                    ///NOTE: Both func and once must match.
                                    if (func_list[name][i].func === func && func_list[name][i].once === once) {
                                        BF.remove(func_list[name], i);
                                        /// Since only one event should be removed at a time, we can end now.
                                        return;
                                    }
                                }
                            }
                        },
                        /**
                         * Trigger the functions attached to an event.
                         *
                         * @param  name (string) The name of the event to trigger.
                         * @param  e    (object) The event object sent to the called functions.
                         * @return NULL
                         */
                        trigger: function (name, e)
                        {
                            var func_arr_len,
                                i,
                                stop_propagation;
                            
                            /// Does this event have any functions attached to it?
                            if (func_list[name]) {
                                func_arr_len = func_list[name].length;
                                
                                if (!BF.is_object(e)) {
                                    /// If the event object was not specificed, it needs to be created in order to attach stopPropagation() to it.
                                    e = {};
                                }
                                
                                /// If an attached function runs this function, it will stop calling other functions.
                                e.stopPropagation = function ()
                                {
                                    stop_propagation = true;
                                };
                                
                                for (i = 0; i < func_arr_len; i += 1) {
                                    ///NOTE: It would be a good idea to use a try/catch to prevent errors in events from preventing the code that called the
                                    ///      event from firing.  However, there would need to be some sort of error handling. Sending a message back to the
                                    ///      server would be a good feature.
                                    /// Check to make sure the function actually exists.
                                    if (func_list[name][i]) {
                                        func_list[name][i].func(e);
                                    }
                                    
                                    /// Is this function only supposed to be executed once?
                                    if (!func_list[name][i] || func_list[name][i].once) {
                                        BF.remove(func_list[name], i);
                                    }
                                    
                                    /// Was e.stopPropagation() called?
                                    if (stop_propagation) {
                                        break;
                                    }
                                }
                            }
                        }
                    };
                }()),
                properties: {
                    ///TODO: Determine if these should be read only or a get/set function.
                    line_height: 19,
                    topBar_height: topLoader.offsetHeight,
                    viewport: {
                        height: doc_docEl.clientHeight,
                        width:  doc_docEl.clientWidth
                    }
                }
            };
            
            
            /**
             * Create the functions that handle the scrolling of the page and other related functions.
             *
             * @return Returns an object with functions for adding content, updating the verse range, and scrolling the view.
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
                     * @param  y                 (number)             The Y position to scroll to (i.e, vertical position)
                     * @param  trigger_scrolling (boolean) (optional) Whether or not to allow the onscroll event from attempting to lookup more verses
                     * @return NULL. Scrolls the view.
                     * @note   Called by remove_excess_content_top(), add_content_top_if_needed(), scroll_to_verse(), write_verses(), handle_new_verses() and occasionally (IE only) by remove_excess_content_bottom() and add_content_bottom_if_needed().
                     */
                    scroll_view_to = function (y, trigger_scrolling)
                    {
                        var padding_el,
                            padding_interval,
                            pixels_needed;
                        
                        /// Is the scroll position not the top of the page.
                        if (y > 0) {
                            /// Calculate how many pixels (if any) need to be added in order to be able to scroll to the specified position.
                            /// If the scroll position is near the bottom (e.g., Revelation 22:21 or Proverbs 28:28) there needs to be extra space on the bottom.
                            pixels_needed = system.properties.viewport.height - (document.body.clientHeight - y);
                            if (pixels_needed > 0) {
                                padding_el = document.createElement("div");
                                
                                padding_el.style.height = pixels_needed + "px";
                                /// Insert a blank element at the very end of the scroll to allow the user to be able to scroll down to the desired verse.
                                viewPort.insertBefore(padding_el, null);
                                
                                /// Create a timer to check to see if the padding is no longer needed.
                                padding_interval = window.setInterval(function ()
                                {
                                    /// If the user scrolls up or more text was loaded, the padding element can be removed.
                                    if (doc_docEl.scrollHeight - (window.pageYOffset + system.properties.viewport.height) > pixels_needed) {
                                        viewPort.removeChild(padding_el);
                                        window.clearInterval(padding_interval);
                                    }
                                }, 1000);
                            }
                        }
                        
                        /// Set the new scroll position to prevent the onscroll event from looking up more verses.
                        if (!trigger_scrolling) {
                            scroll_pos = y;
                        }
                        
                        window.scrollTo(window.pageXOffset, y);
                    };
                    
                    (function ()
                    {
                        var buffer_rem = 10000, /// In pixels
                            
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
                            if (child_height + buffer_rem < window.pageYOffset && child_height < doc_docEl.scrollHeight - window.pageYOffset - system.properties.viewport.height) {
                                /// Store the content in the cache, and then add 1 to the outer counter variable so that we know how much cache we have.
                                cached_verses_top[cached_count_top] = child.innerHTML;
                                cached_count_top += 1;
                                
                                page.removeChild(child);
                                
                                /// Calculate and set the new scroll position.
                                /// Because content is being removed from the top of the page, the rest of the content will be shifted upward.
                                /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was removed.
                                scroll_view_to(window.pageYOffset - child_height);
                                
                                system.event.trigger("contentRemovedAbove", {amount: -child_height});
                                
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
                         * @return NULL.  Removes content from the page if required.
                         * @note   Called by scrolling() via setTimeout().  May call itself, too.
                         */
                        function remove_excess_content_bottom()
                        {
                            var child = page.lastChild;
                            
                            if (child === null) {
                                return;
                            }
                            
                            /// Is the element is in the remove zone?
                            if (child.offsetTop > window.pageYOffset + system.properties.viewport.height + buffer_rem) {
                                /// Store the content in the cache, and then add 1 to the outer counter variable so that we know how much cache we have.
                                cached_verses_bottom[cached_count_bottom] = child.innerHTML;
                                cached_count_bottom += 1;
                                
                                page.removeChild(child);
                                
                                /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                                ///TODO: Determine if this is still an issue with IE9.
                                /*@cc_on
                                    scroll_view_to(window.pageYOffset);
                                @*/
                                
                                ///NOTE: The height of the element removed is not sent because it is not currently needed.
                                system.event.trigger("contentRemovedBelow");
                                
                                /// Indicates to the user that content will load if they scroll to the bottom of the screen.
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
                                    add_content_if_needed(BF.consts.additional);
                                    checking_excess_content_top = true;
                                } else {
                                    add_content_if_needed(BF.consts.previous);
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
                 * @example verse = get_verse_at_position(window.pageYOffset + topBar_height + 8, true, page); /// Could return {b: 1, c: 1, v: 1} for Genesis 1:1.
                 * @param   the_pos        (number)      The vertical position on the page.
                 * @param   looking_upward (boolean)     Whether the verses at the top or bottom of the page.
                 * @param   parent_el      (DOM element) The HTML element that ultimately contains the verse.
                 * @return  Returns an object containing the book, chapter, and verse of the verse element.  Format {b: BB, c: CCC, v: VVV}.
                 * @note    Called by update_verse_range() and itself.
                 */
                function get_verse_at_position(the_pos, looking_upward, parent_el)
                {
                    var el,
                        el_offset_height,
                        el_offset_top,
                        el_start_at,
                        looked_next,
                        looked_previous,
                        possible_el,
                        parent_el_children_count = parent_el.childNodes.length,
                        parent_el_top            = parent_el.offsetTop,
                        verse_id,
                        verse_obj;
                    
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
                        ///TODO: Rewrite this code to make it more straightforward.
                        while ((looking_upward ? (possible_el = el.previousSibling) : (possible_el = el.nextSibling)) !== null && the_pos >= possible_el.offsetTop && the_pos <= possible_el.offsetTop + possible_el.offsetHeight) {
                            el = possible_el;
                        }
                    /// These elements will never have another verse on the same line, so we can skip the above checking.
                    /* falls through */
                    case "chapter":
                    case "book":
                    case "short_book":
                    case "psalm_title":
                    case "subscription":
                    case "psalm_119_heading":
                        /// Found the verse, so calculate the verseID and call the success function.
                        verse_id = window.parseInt(el.id, 10);
                        
                        verse_obj = BF.get_b_c_v(verse_id);
                        verse_obj.verse_id = verse_id;
                        
                        return verse_obj;
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
                    var buffer_add = 800; /// In pixels
                    
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
                        if (child.offsetTop + child.clientHeight < window.pageYOffset + system.properties.viewport.height + buffer_add) {
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
                                add_content_if_needed(BF.consts.additional);
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
                                
                                system.event.trigger("contentAddedAbove", {amount: newEl.clientHeight});
                                
                                /// Check to see if we need to add more content.
                                add_content_if_needed(BF.consts.previous);
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
                     * @example add_content_if_needed(BF.consts.additional);
                     * @param   direction (integer) The direction that verses should be added: additional || previous.
                     * @return  Null.  A function is run after a delay that may add verses to the page.
                     * @note    Called by add_content_bottom_if_needed(), add_content_top_if_needed(), handle_new_verses(), window.onresize(), and scrolling().
                     * @todo    Get rid of this unnecessary function.
                     */
                    return function (direction)
                    {
                        var lookup_delay = 50; /// In milliseconds
                        
                        if (direction === BF.consts.additional) {
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
                    var looking_up_verse_range = false,
                        updating_state_timeout = false;
                    
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
                        verse1 = get_verse_at_position(window.pageYOffset + system.properties.topBar_height + 8,  true,  page);
                        
                        /// If a verse was found, check for the bottom verse.
                        ///NOTE: Check a few pixels (14) above what is actually in view so that it finds the verse that is actually readable.
                        ///NOTE: These are combined into one if statement to prevent code duplication.
                        if (verse1 === false || (verse2 = get_verse_at_position(window.pageYOffset + system.properties.viewport.height - 14, false, page)) === false) {
                            looking_up_verse_range = false;
                            
                            /// Since the entire verse range could not be found, remove stored verses.
                            content_manager.top_verse    = false;
                            content_manager.bottom_verse = false;
                            
                            ///TODO: Try again?
                            return;
                        }
                        
                        /// Store the query type in a variable because it may need to be accessed more than once.
                        query_type = query_manager.query_type;
                        
                        /// Begin creating the verse range text.  (The first book, chapter, and verse is always present).
                        ///NOTE: If the query was a verse lookup, we do not display "title" for Psalm titles; instead we just show "1." (That's what "query_type === BF.consts.verse_lookup" is for)
                        ///      I.e., Psalm 3:title is displayed as Psalm 3:1.
                        ref_range = BF.create_ref([verse1, verse2], BF.lang.id, query_type === BF.consts.verse_lookup);
                        
                        /// The verse range is displayed differently based on the type of search (i.e., a verse lookup or a search).
                        ///TODO: Set the date of the verse (or when it was written).
                        if (query_type === BF.consts.verse_lookup) {
                            new_title = ref_range + " - " + BF.lang.app_name;
                        } else {
                            new_title = query_manager.base_query + " (" + ref_range + ") - " + BF.lang.app_name;
                        }
                        
                        /// Is the new verse range the same as the old one?
                        /// If they are the same, updating it would just waste time.
                        ///NOTE: Comparing serveral object properties is a lot faster accessing the DOM to compare document.title with new_title.
                        if (!content_manager.top_verse || !content_manager.bottom_verse || content_manager.top_verse.b !== verse1.b || content_manager.top_verse.c !== verse1.c || content_manager.top_verse.v !== verse1.v || content_manager.bottom_verse.b !== verse2.b || content_manager.bottom_verse.c !== verse2.c || content_manager.bottom_verse.v !== verse2.v) {
                            document.title = new_title;
                            
                            /// Display the verse range on the page if looking up verses.
                            if (query_type === BF.consts.verse_lookup) {
                                leftInfo.textContent = ref_range;
                            }
                            
                            /// Store the verse range for future reference.
                            content_manager.top_verse    = verse1;
                            content_manager.bottom_verse = verse2;
                        }
                        
                        looking_up_verse_range = false;
                        
                        /// Make sure to save the last query type to ensure that BibleForge knows what type of query this is.
                        /// This is needed when a user switches between languages because the last query might be in a different language and therefore unintelligible in the new language.
                        /// E.g., Look up "Ieremiah" in en_em, switch to en, and then change the paragraph setting or load bibleforge.com again (without any query after it).
                        ///NOTE: This is added to verse1 because modifying the settings.user.position object later does not trigger the onchnage function to save the settings. 
                        verse1.type = settings.user.last_query.type;
                        /// When reloading the page, it is necessary to check what the original raw_query was.
                        /// For example, changing languages will change the actual query, but we want the original query to be saved so that we can tell when the user actually enters in a new query.
                        verse1.raw_query = settings.user.last_query.raw_query;
                        
                        /// Store the state in the settings so that if the user comes back later, we can take them back to where they left off.
                        settings.user.position = verse1;
                        
                        /// Is it already queued to save the state?
                        if (updating_state_timeout) {
                            /// Since there is no reason to update while scrolling, stop the timeout.
                            window.clearTimeout(updating_state_timeout);
                        }
                        
                        /**
                         * Update the state with the current position.
                         *
                         * @note Since the verse range may be called very frequently and updating the state is costly, this function needs to be delayed to prevent overwhelming the browser.
                         */
                        updating_state_timeout = window.setTimeout(function ()
                        {
                            var state = BF.history.getState();
                            
                            /// Update the history state so that using the back/forward buttons will take the user back to where they left off.
                            ///NOTE: verse1 is from the function that initiated the timeout, so it is not necessarily up to date; therefore, use settings.user.position.
                            if (state.verse_id !== settings.user.position.verse_id) {
                                state.position = settings.user.position;
                                ///NOTE: This causes Chromium's stop button to briefly change into the refresh button.  (Tested in Chromium 16.)
                                ///      See https://code.google.com/p/chromium/issues/detail?id=50298.
                                BF.history.updateState(state);
                            }
                            /// Set updating_state_timeout to FALSE to make sure that a new timeout can be created later.
                            updating_state_timeout = false;
                        }, 500);
                    }
                    
                    /**
                     * Prevent updating the state if the state changes.
                     */
                    BF.history.attach(function ()
                    {
                        window.clearTimeout(updating_state_timeout);
                        /// Set updating_state_timeout to FALSE to make sure that a new timeout can be created later.
                        updating_state_timeout = false;
                    });
                    
                    /**
                     * Return the small function to call update_verse_range_delayed().
                     *
                     * @param  sync (boolean) Whether or not to call update_verse_range_delayed() synchronously.
                     * @return NULL
                     */
                    return function update_verse_range(sync)
                    {
                        ///NOTE: sync is used to make sure that the content_manager.top_verse and content_manager.bottom_verse variables are current.
                        ///TODO: Determine if it is better to clearTimeout() the delayed function.
                        if (sync) {
                            update_verse_range_delayed();
                        } else {
                            /// Is it not already looking for the verse range?
                            if (!looking_up_verse_range) {
                                looking_up_verse_range = true;
                                
                                /// Run update_verse_range_delayed() after a brief delay.
                                window.setTimeout(update_verse_range_delayed, 300);
                            }
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
                 */
                window.addEventListener("resize", function ()
                {
                    add_content_if_needed(BF.consts.additional);
                    add_content_if_needed(BF.consts.previous);
                    
                    system.properties.viewport = {
                        height: doc_docEl.clientHeight,
                        width:  doc_docEl.clientWidth
                    };
                    
                    update_verse_range();
                }, false);
                
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
                        
                        bottomLoader.style.visibility = "hidden";
                        topLoader.style.visibility    = "hidden";
                        
                        has_reached_bottom = false;
                        has_reached_top    = false;
                        
                        page.innerHTML = "";
                        
                        system.event.trigger("scrollCleared");
                    },
                    
                    update_verse_range: update_verse_range,
                    
                    /**
                     * Indicate that the user has scrolled to the very end of the results.
                     *
                     * @todo Use a get/set pair instead.
                     */
                    reached_bottom: function ()
                    {
                        has_reached_bottom = true;
                    },
                    
                    /**
                     * Indicate that the user has scrolled to the very beginning of the results.
                     *
                     * @note Search queries currently always begins at the beginning, but verse lookups can start anywhere.
                     * @todo Use a get/set pair instead.
                     */
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
                     */
                    scroll_to_verse: function (verse_obj)
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
                        
                        /// Does the verse not exist?
                        if (!verse_el) {
                            return false;
                        }
                        
                        /// Calculate the verse's Y coordinate.
                        ///NOTE: "- topBar_height" subtracts off the height of the top bar.
                        scroll_view_to(BF.get_position(verse_el).top - system.properties.topBar_height, true);
                        
                        return true;
                    },
                    
                    scroll_view_to: scroll_view_to,
                    /**
                     * Indicate to the user that BibleForge is working.
                     *
                     * @param bottom (boolean) Whether or not to show the bottom loader.
                     * @param top    (boolean) Whether or not to show the top loader.
                     */
                    indicate_loading: function (bottom, top)
                    {
                        if (bottom) {
                            bottomLoader.style.visibility = "visible";
                        }
                        if (top) {
                            topLoader.style.visibility    = "visible";
                        }
                    }
                };
            }());
            /// **************************
            /// * End of content_manager *
            /// **************************
            
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
                     * @example write_verses(BF.consts.verse_lookup, additional, [1001001], ["<a id=1>In</a> <a id=2>the</a> <a id=3>beginning....</a>"]);
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
                        var end_paragraph_HTML   = "",
                            first_paragraph_HTML = "",
                            i,
                            hebrew_heading,
                            html_str             = "",
                            newEl,
                            start_key            = 0,
                            start_paragraph_HTML = "",
                            stop_key             = verse_ids.length,
                            verse_id,
                            verse_obj,
                            which_hebrew_letter;
                        
                        /**
                         * Compile the HTML for a normal verse.
                         *
                         * @return A string containing the verse encapsulated in HTML.
                         * @note   This is a separate function because it can be called from two different places.
                         */
                        function get_normal_verse_html()
                        {
                            ///NOTE: The trailing space adds a space between verses in a paragraph and does not effect paragraph final verses.
                            return "<div class=verse id=" + verse_id + "_verse><span class=verse_number>" + verse_obj.v + "&nbsp;</span>" + verse_html[i] + " </div>";
                        }
                        
                        ///NOTE: Currently only grammatical_search searches data at the word level, so it is the only type that might stop in the middle of a verse and find more words in the same verse as the user scrolls.
                        if (type === BF.consts.grammatical_search) {
                            if (direction === BF.consts.additional) {
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
                            first_paragraph_HTML = "<div class=\"paragraph first_paragraph\">";
                            end_paragraph_HTML   = "</div>";
                        }
                        
                        for (i = start_key; i < stop_key; i += 1) {
                            verse_id = verse_ids[i];
                            verse_obj = BF.get_b_c_v(verse_id);
                            
                            ///TODO: Determine if it would be better to have two for loops instead of the if statement inside of this one.
                            if (type === BF.consts.verse_lookup) {
                                
                                /// Is this the beginning of a stanza in Psalm 119?
                                ///NOTE: Each stanza has 8 verses.
                                if (verse_obj.b === 19 && verse_obj.c === 119 && verse_obj.v % 8 === 1) {
                                    /// Determine which stanza this is.
                                    which_hebrew_letter = Math.floor(verse_obj.v / 8);
                                    hebrew_heading = "<div class=psalm_119_heading id=" + verse_id + ">" + ["\u05d0", "\u05d1", "\u05d2", "\u05d3", "\u05d4", "\u05d5", "\u05d6", "\u05d7", "\u05d8", "\u05d9", "\u05db", "\u05dc", "\u05de", "\u05e0", "\u05e1", "\u05e2", "\u05e4", "\u05e6", "\u05e7", "\u05e8", "\u05e9", "\u05ea"][which_hebrew_letter] + " " + BF.lang.hebrew_alphabet[which_hebrew_letter] + "</div>";
                                } else {
                                    hebrew_heading = "";
                                }
                                
                                /// Is this the first verse or the Psalm title?
                                if (verse_obj.v < 2) {
                                    /// Is this not the beginning of the text?
                                    ///NOTE: The "start_key" variable is used for starting grammatical searches at the correct verse (since grammatical verses are word level, not verse level).
                                    if (i !== start_key) {
                                        html_str += end_paragraph_HTML;
                                    }
                                    /// Is this chapter 1?  (We need to know if we should display the book name.)
                                    if (verse_obj.c === 1) {
                                        html_str += "<div class=book id=" + verse_id + "_title><h2>" + BF.lang.books_long_pretitle[verse_obj.b] + "</h2><h1>" + BF.lang.books_long_main[verse_obj.b] + "</h1><h2>" + BF.lang.books_long_posttitle[verse_obj.b] + "</h2></div>";
                                    /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
                                    } else if (verse_obj.b !== 19 || verse_obj.v === 0 || !BF.psalm_has_title(verse_obj.c)) {
                                        /// Is this the book of Psalms?  (Psalms have a special name.)
                                        html_str += "<h3 class=chapter id=" + verse_id + "_chapter>" + BF.insert({num: verse_obj.c}, (verse_obj.b === 19 ? BF.lang.chapter_psalm : BF.lang.chapter)) + "</h3>";
                                    }
                                    
                                    html_str += hebrew_heading;
                                    
                                    /// Is this a Psalm title (i.e., verse 0)?  (Psalm titles are displayed specially.)
                                    if (verse_obj.v === 0) {
                                        html_str += "<div class=psalm_title id=" + verse_id + "_verse>" + verse_html[i] + "</div>";
                                    } else if (BF.lang.first_verse_normal) {
                                        ///NOTE: Even though the first verse should always the beginning of a paragraph, it doesn't to check.
                                        html_str += (in_paragraphs && paragraphs[i] ? start_paragraph_HTML : "") + get_normal_verse_html();
                                    } else {
                                        ///NOTE: The trailing space adds a space between verses in a paragraph and does not effect paragraph final verses.
                                        html_str += first_paragraph_HTML + "<div class=first_verse id=" + verse_id + "_verse>" + verse_html[i] + " </div>";
                                    }
                                } else {
                                    /// Is it a subscription?
                                    if (verse_obj.v === 255) {
                                        /// Is there an open paragraph?
                                        if (in_paragraphs && i !== start_key) {
                                            ///NOTE: Since subscriptions are already set off by themselves, they do not need special paragraph HTML, but they may need to close existing paragraphs.
                                            html_str += end_paragraph_HTML;
                                        }
                                        html_str += "<div class=subscription id=" + verse_id + "_verse>" + verse_html[i] + "</div>";
                                    } else {
                                        /// Is there a paragraph break here?
                                        if (in_paragraphs && paragraphs[i]) {
                                            /// Is this not the first paragraph?  (The first paragraph does not need to be closed.)
                                            if (i !== start_key) {
                                                html_str += end_paragraph_HTML;
                                            }
                                            html_str += hebrew_heading;
                                            html_str += start_paragraph_HTML;
                                        } else {
                                            html_str += hebrew_heading;
                                        }
                                        
                                        html_str += get_normal_verse_html();
                                    }
                                }
                                
                            /// Searching
                            } else {
                                /// Change verse 0 to indicate a Psalm title (e.g., change "Psalm 3:0" to "Psalm 3:title"),
                                /// and change verse 255 to indicate a Pauline subscription (e.g., change "Romans 16:255" to "Romans 16:subscription").
                                verse_obj.v = BF.get_full_verse(verse_obj.v);
                                
                                /// Is this verse from a different book than the last verse?
                                ///NOTE: This assumes that searches are always additional (which is correct, currently).
                                if (verse_obj.b !== verse_range.bottom_book) {
                                    /// We only need to print out the book if it is different from the last verse.
                                    verse_range.bottom_book = verse_obj.b;
                                    
                                    /// Convert the book number to text.
                                    html_str += "<h1 class=short_book id=" + verse_id + "_title>" + (BF.lang.use_main_title ? BF.lang.books_long_main[verse_obj.b] : BF.lang.books_short[verse_obj.b]) + "</h1>";
                                }
                                
                                html_str += "<div class=search_verse id=" + verse_id + "_search><span>" + (BF.lang.chapter_count[verse_obj.b] === 1 ? "" : verse_obj.c + BF.lang.chap_separator) + verse_obj.v + "</span> " + verse_html[i] + "</div>";
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
                        
                        if (direction === BF.consts.additional) {
                            page.appendChild(newEl);
                        } else {
                            page.insertBefore(newEl, page.childNodes[0]);
                            
                            /// The new content that was just added to the top of the page will push the other contents downward.
                            /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
                            content_manager.scroll_view_to(window.pageYOffset + newEl.clientHeight);
                            
                            system.event.trigger("contentAddedAbove", {amount: newEl.clientHeight});
                        }
                        content_manager.update_verse_range();
                    }
                    
                    function try_a_lookup(query, no_lookup_found)
                    {
                        ///TODO: Ignore the used language.
                        var langs = BF.get_recent_and_acceptable_langs() || [],
                            len,
                            should_stop;
                        
                        /**
                         * Stop further searching if the user submits a new query.
                         */
                        function on_query()
                        {
                            should_stop = true;
                        }
                        
                        /// Listen to see if the user submits another query.
                        system.event.attach("query", on_query, true);
                        
                        len = langs.length - 1;
                        
                        (function loop_through_langs(i)
                        {
                            var lang_id = langs[i],
                                verse_id;
                            
                            /// Stop if a new query has been sent.
                            if (should_stop) {
                                return;
                            }
                            
                            /// Have we reached the end of the recently used and suggested languages?
                            if (i > len) {
                                /// Detach the event since it didn't fire.
                                system.event.detach("query", on_query, true);
                                no_lookup_found();
                                return;
                            }
                            
                            if (BF.langs[lang_id].loaded) {
                                verse_id = Number(BF.langs[lang_id].determine_reference(query));
                                /// Did it find a valid verse?
                                if (verse_id) {
                                    /// Detach the event since it didn't fire.
                                    system.event.detach("query", on_query, true);
                                    /// Make sure to mark this language as recently used so that it does not get removed.
                                    BF.upate_recent_langs(lang_id);
                                    /// Let's re-run the query and look up that verse.
                                    ///TODO: There should be a way to ignore the state entirely (or re-run a query more excatly (e.g., keep url_suffix)).
                                    run_new_query(query, false, true, {raw_query: query, type: 1, verse_id: verse_id});
                                } else {
                                    /// No, the query does not look like a verse lookup in that language either.
                                    /// Let's try the next language (if any).
                                    loop_through_langs(i += 1);
                                }
                            } else {
                                /// Since this language has not loaded yet, we don't have access to that language's determine_reference() function.
                                /// So, we need to load it and try again.
                                /// If BF.load_language() has not been created by secondary.js, we must wait until that code has loaded.
                                if (BF.load_language) {
                                    BF.load_language(lang_id, function ()
                                    {
                                        loop_through_langs(i);
                                    });
                                } else {
                                    system.event.attach("secondaryLoaded", function ()
                                    {
                                        BF.load_language(lang_id, function ()
                                        {
                                            loop_through_langs(i);
                                        });
                                    }, true);
                                }
                            }
                        }(0));
                    }
                    
                    
                    /**
                     * Handles new verses from the server.
                     *
                     * Displays new verses, if any; asks if more content is needed; determines if more content is available;
                     * and writes initial information into the infoBar.
                     *
                     * @example handle_new_verses({n: [verse_ids, ...], v: [verse_html, ...], p: [paragraphs, ...], i: [word_ids, ...], t: total}, {direction: direction, ...});
                     * @example handle_new_verses({n: [1001001, 1001002], v: ["<a id=1>In</a> <a id=2>the</a> <a id=3>beginning....</a>", "<a id=12>And</a> <a id=13>the</a> <a id=14>earth....</a>"], t: 2}, options);
                     * @example handle_new_verses({n: [50004008], v: ["<a id=772635>Finally,</a> <a id=772636>brethren,</a> <a id=772637>whatsoever</a> <a id=772638>things....</a>"], i: [772638], t: 1}, options);
                     * @param   data    (object) The JSON object returned from the server.
                     * @param   options (object) The object containing the details of the query.
                     * @return  NULL
                     */
                    return function handle_new_verses(data, options)
                    {
                        var no_results,
                            
                            direction     = options.direction,
                            in_paragraphs = options.in_paragraphs,
                            initial_query = options.initial_query,
                            type          = options.type,
                            
                            /// The variables will be used to store properties from the data returned from the server. The full names just make them easier to understand.
                            total,
                            paragraphs,
                            verse_ids,
                            verse_html,
                            word_ids;
                        
                        /// Check to make sure the data returned from the server returned properly.
                        if (data) {
                            /// Data object structure:
                            /// i Word IDs      (array)  (optional) An array of integers containing word IDs indicating which words should be highlighted in grammatical searches
                            /// n Verse Numbers (array)             An array of integers containing verse IDs for each verse returned
                            /// p Paragraphs    (array)  (optional) An array of 1's and 0's corresponding to n array indicating which verses are at the beginning of a paragraph
                            /// t Total         (number) (optional) The total number of verses found in the initial search query or the number of verses being returned in this verse lookup
                            /// v Verse HTML    (array)             An array containing the HTML of the verses returned
                            total      = data.t;
                            paragraphs = data.p;
                            verse_ids  = data.n;
                            verse_html = data.v;
                            word_ids   = data.i;
                        }
                        
                        /**
                         * Tell the content manager not to look up more results based on the current direction of the query.
                         */
                        function prevent_further_queries()
                        {
                            if (direction === BF.consts.additional) {
                                /// The user has reached the bottom by scrolling down (either RETURNED_SEARCH or RETURNED_VERSES_PREVIOUS), so we need to hide the loading graphic.
                                /// This is caused by scrolling to Revelation 22:21 or end of search or there were no results.
                                content_manager.reached_bottom();
                                bottomLoader.style.visibility = "hidden";
                            }
                            
                            if (direction === BF.consts.previous) {
                                /// The user has reached the top of the page by scrolling up (either Genesis 1:1 or there were no search results), so we need to hide the loading graphic
                                content_manager.reached_top();
                                topLoader.style.visibility    = "hidden";
                            }
                        }
                        
                        
                        /// Were there any verses returned?
                        if (verse_ids && verse_ids.length) {
                            write_verses(type, direction, verse_ids, verse_html, paragraphs, in_paragraphs, options.verse_range);
                            
                            /// Because total number of verses is only returned on the first search query, we must calculate how many verses were returned are manually/.
                            ///NOTE: Lookups always return the number of verses returned in this lookup.
                            if (!total) {
                                total = verse_ids.length;
                            }
                            
                            if (options.highlight) {
                                ///TODO: Determine if these variables should be isolated.
                                (function ()
                                {
                                    /// In order to display the text as fast as possible, we add the text to the scroll and then highlight it later.
                                    ///NOTE: Because the highlighter is called via setTimeout, it is possible that the user might begin another query before the highlighter function runs.
                                    ///      This is especially true when using the back and forward buttons.
                                    ///      If the highlighter function attempts to run after another query has started, then the highlighter function with either throw an error when trying to highlight a word that is no longer present
                                    ///      or, even worse, it will highlight a word that should not be.
                                    ///      Therefore, the timeout must be stopped when the scroll is cleared.
                                    ///NOTE: There are other occasions when words are removed from the scroll (like when caching sections of text),
                                    ///      but it seems unlikely to cause an error with highlighting; however, the highlighter function should check to see if a word still exists.
                                    var highlight_timeout,
                                        /**
                                         * Prevent the highlighting code from running after the scroll is cleared.
                                         */
                                        onScrollCleared = function ()
                                        {
                                            window.clearTimeout(highlight_timeout);
                                        };
                                    
                                    highlight_timeout = window.setTimeout(function ()
                                    {
                                        /// Since the timeout executed before the scroll was cleared, the event can be detached.
                                        system.event.detach("scrollCleared", onScrollCleared, true);
                                        ///NOTE: Only standard and mixed searches need verse_html data to be sent.
                                        ///NOTE: word_ids is only needed for grammatical and mixed searches.
                                        options.highlight((options.extra_highlighting || type !== BF.consts.grammatical_search ? verse_html.join("") : false), word_ids);
                                    }, 0);
                                    
                                    system.event.attach("scrollCleared", onScrollCleared, true);
                                }());
                            }
                            
                            if (direction === BF.consts.additional) {
                                /// The last verse ID needs to be store so that the server knows where to start future queries.
                                options.verse_range.bottom_verse = verse_ids[verse_ids.length - 1];
                                
                                if (word_ids) {
                                    /// The last word ID also needs to be stored for future grammatical (and in the future, mixed) searches.
                                    options.verse_range.bottom_id = word_ids[word_ids.length - 1];
                                }
                                
                                /// Are there still more verses to be retreved?
                                if (verse_ids[verse_ids.length - 1] < 66022021) {
                                    /// Indicate to the user that more content may be loading, and check for more content.
                                    ///TODO: Make a separate function for this.
                                    bottomLoader.style.visibility = "visible";
                                    content_manager.add_content_if_needed(BF.consts.additional);
                                } else {
                                    /// Since the last verse is Revelation 22:21, there is no need to look for more.
                                    prevent_further_queries();
                                }
                            }
                            
                            ///NOTE: Since top_verse needs to be stored and previous queries may need to be run, make sure to include initial queries here.
                            if (direction === BF.consts.previous || initial_query) {
                                /// The first verse ID needs to be stored so that the server knows where to start future previous queries.
                                options.verse_range.top_verse = verse_ids[0];
                                
                                if (word_ids) {
                                    /// The first word ID also needs to be stored for future previous grammatical (and in the future, mixed) searches.
                                    options.verse_range.top_id = word_ids[0];
                                }
                                
                                /// Are there still more verses to be retreved?
                                if (verse_ids[0] > 1001001) {
                                    /// Indicate to the user that more content may be loading, and check for more content.
                                    ///TODO: Make a separate function for this.
                                    topLoader.style.visibility = "visible";
                                    content_manager.add_content_if_needed(BF.consts.previous);
                                /// Make sure the direction is previous (since it could be an intial query).
                                } else if (direction === BF.consts.previous) {
                                    /// Since the first verse is Genesis 1:1, there is no need to look for more.
                                    prevent_further_queries();
                                }
                            }
                            
                            /// Standard searches should always return BF.lang.minimum_desired_verses number of verses unless it reaches the end of the results.
                            /// Grammatical searches should always return BF.lang.minimum_desired_verses number words unless it reaches the end of the results.
                            /// However, mixed searches might not return BF.lang.minimum_desired_verses number of verses/words, even at the end of the results (at least in theory).
                            if ((options.type === BF.consts.standard_search && total < BF.lang.minimum_desired_verses) || (options.type === BF.consts.grammatical_search && word_ids.length < BF.lang.minimum_desired_verses)) {
                                prevent_further_queries();
                            }
                        } else {
                            /// Since total could be undefined, make sure the total is 0.
                            total = 0;
                        }
                        
                        /// Is this is the first results of a query?
                        if (initial_query) {
                            /// Are the results displayed in paragraphs, and is the verse looked up not at the beginning of a paragraph?
                            if (type === BF.consts.verse_lookup && in_paragraphs && verse_ids && verse_ids[0] !== options.verse) {
                                /// Because the verse the user is looking for is not at the beginning of a paragraph
                                /// the text needs to be scrolled so that the verse is at the top.
                                content_manager.scroll_to_verse(BF.get_b_c_v(options.verse));
                            }
                            
                            /// Since the first query is done, set the initial_query property to FALSE.
                            options.initial_query = false;
                            
                            leftInfo.innerHTML = "";
                            
                            if (type !== BF.consts.verse_lookup) {
                                /// Since some languages have differences between singular and plural, we need to choose the correct language string.
                                /// Since the query must be inserted into the string, using createTextNode() is not possible, so we have to escape the query manually.
                                leftInfo.innerHTML = BF.insert({num: BF.format_number(total), q: BF.escape_html(options.base_query)}, BF.lang["found_" + (total === 1 ? "singular" : "plural")]);
                            }
                            
                            if (!total) {
                                /// Is it a search?
                                if (type !== BF.consts.verse_lookup) {
                                    try_a_lookup(options.base_query, function no_lookup_found()
                                    {
                                        /// Hide the loaders graphics and tell the browser not to continue searching.
                                        prevent_further_queries();
                                        ///TODO: It should try to spell check (using the right language) and make suggestions (like did you mean "Godhead" if they enter "Trinity").
                                        /// Since no results were found, display a disappointing message.
                                        no_results = document.createElement("div");
                                        no_results.className = "no_results";
                                        /// Since the query must be inserted into the string, using createTextNode() is not possible, so we have to escape the query manually.
                                        no_results.innerHTML = BF.insert({q: BF.escape_html(options.base_query)}, BF.lang.no_results);
                                        page.appendChild(no_results);
                                    });
                                } else {
                                    /// Verse lookups should never return an empty result on the initial query; therefore, something went wrong.
                                    page.textContent = BF.lang.err_unknown;
                                }
                            }
                        } else {
                            /// If no results were returned, we need to stop looking up more verses.
                            ///NOTE: This will be triggered if a search query returns exactly the number of BF.lang.minimum_desired_verses.
                            ///      An example query in English is "Ith* | elisheba | jabez | Shepho | Masrekah", which returns exactly 40 verses.
                            if (!total) {
                                /// Hide the loaders graphics and tell the browser not to continue searching.
                                prevent_further_queries();
                            }
                        }
                    };
                }());
                
                /// Return the query_manager object.
                return {
                    /**
                     * Execute a query to retrieve additional verses.
                     *
                     * @note This is created by this.query() each time.
                     */
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
                            /// d Direction (number)  The direction of the query (1 = additional, 2 = previous) (lookup only)
                            /// f Find      (boolean) Whether or not to find a paragraph break to start at      (lookup only)
                            /// p Paragraph (boolean) Whether or not verses will be displayed in paragraphs     (lookup only)
                            /// q Query     (string)  The verse reference or search string to query
                            /// s Start At  (number)  The verse or word id at which to start the query          (search only)
                            /// t Type      (number)  The type of query (verse_lookup, mixed_search, standard_search, grammatical_search)
                            /// l Language  (string)  The language ID of the language to use; if not present, the server will default to English (optional)
                            
                            var query_str = "t=" + options.type;
                            
                            if (options.type === BF.consts.verse_lookup) {
                                query_str += "&q=" + options.verse;
                                
                                ///NOTE: Paragraph mode is default for verse lookups; therefore, p only needs to be set if it is not in paragraph mode.
                                if (!options.in_paragraphs) {
                                    query_str += "&p=0";
                                }
                                
                                ///NOTE: Queries are additional by default; therefore, d only needs to be set for previous lookups.
                                if (options.direction === BF.consts.previous) {
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
                            
                            if (options.lang_id !== "en") {
                                query_str += "&l=" + options.lang_id;
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
                                    
                                    in_paragraphs = settings.view.in_paragraphs && !BF.lang.no_paragraphs;
                                    
                                    if (options.type === BF.consts.verse_lookup || options.type === BF.consts.standard_search) {
                                        /// Determine which verse to start from for the next query.
                                        ///NOTE: It does not matter whether or not the verse exists.  The server will simply retrieve the next available verse.
                                        ///      For example, Romans 1:33 will retrieve verses starting at Romans 2:1 (when the direction is additional).
                                        if (direction === BF.consts.additional) {
                                            options.verse = options.verse_range.bottom_verse + 1;
                                        } else {
                                            options.verse = options.verse_range.top_verse    - 1;
                                        }
                                    } else {
                                        /// Determine which word to begin searching at for grammatical/mixed searches.
                                        if (direction === BF.consts.additional) {
                                            options.start_at = options.verse_range.bottom_id + 1;
                                        } else {
                                            ///NOTE: Currently, all searches are additional, so this code does not yet run.
                                            options.start_at = options.verse_range.top_id    - 1;
                                        }
                                    }
                                    
                                    options.direction = direction;
                                    /// Since these settings can be changed by the user at run time, it must be retrieved before each query.
                                    options.in_paragraphs = in_paragraphs;
                                    options.lang_id = BF.lang.id;
                                    
                                    ajax.query("GET", "/api", create_query_message(options), function success(data)
                                    {
                                        ///NOTE: The direction and in_paragraphs variables need to be set again because they could have been changed by another query in the mean time.
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
                                 * @return NULL
                                 * @note   This function is stored in query_manager.query().
                                 * @note   Called by run_new_query().
                                 */
                                return function query(options)
                                {
                                    ///TODO: At some point, there needs to be feedback to the user that the query is taking place.  Maybe have something in the infoBar.
                                    
                                    /// This event is used to stop looking up queries in other languages (and could possibly be used for much more).
                                    system.event.trigger("query", {query: options.query, type: options.type});
                                    
                                    /// Stop any old requests since we have a new one.
                                    ajax_additional.abort();
                                    ajax_previous.abort();
                                    
                                    /// Initial queries may need special options (e.g., the f variable (to find paragraph breaks) is only passed on initial queries).
                                    options.initial_query = true;
                                    /// Initial queries are always additional.
                                    ///TODO: Determine if it should not store direction in the options because it changes between previous and additional searches.
                                    options.direction     = BF.consts.additional;
                                    /// Since this settings can be changed by the user at run time, it must be retrieved before each query.
                                    options.in_paragraphs = settings.view.in_paragraphs && !BF.lang.no_paragraphs;
                                    /// Create an empty verse_range object, which will be filled in as verses are retrieved.
                                    options.verse_range   = {
                                        bottom_id:    0,
                                        bottom_verse: 0,
                                        top_id:       0,
                                        top_verse:    0
                                    };
                                    options.lang_id = BF.lang.id;
                                    
                                    /// Make the initial query with ajax_additional because all initial queries add more verses.
                                    ajax_additional.query("GET", "/api", create_query_message(options), function success(data)
                                    {
                                        handle_new_verses(BF.parse_json(data), options);
                                    });
                                    
                                    this.store_query_options(options);
                                    
                                    /// Create the additional and previous functions for the content_manager to call when needed.
                                    this.query_additional = next_query_maker(ajax_additional, BF.consts.additional, options);
                                    this.query_previous   = next_query_maker(ajax_previous,   BF.consts.previous,   options);
                                };
                            }());
                        }());
                    }()),
                    
                    /**
                     * Execute a query to retrieve previous verses.
                     *
                     * @note This is created by this.query() each time.
                     */
                    query_previous: function () {},
                    
                    /**
                     * Store the information from the query options for later use.
                     *
                     * @param options (object) The object containing the various aspects of the query.
                     */
                    store_query_options: function (options)
                    {
                        /// Store information about the current query to make it accessible to outer functions.
                        ///NOTE: raw_query is exactly what the user typed in.
                        ///      base_query is the query without the extra highlighting info (which is stored in extra_highlighting).
                        ///      prepared_query is the query terms after being prepared by the language specific code to conform to Sphinx syntax.
                        ///      E.g., with the query "For AND  God {{world}}", raw_query is "For AND  God {{world}}", base_query is "For AND  God", and prepared_query is "For & God".
                        this.query_type         = options.type;
                        this.raw_query          = options.raw_query;
                        this.base_query         = options.base_query;
                        this.prepared_query     = options.prepared_query;
                        this.is_default         = options.is_default;
                        this.extra_highlighting = options.extra_highlighting;
                        this.seo_query          = options.seo_query;
                        this.lang_id            = BF.lang.id;
                        
                        /// Store the user's position so that it can be retrieved when the user comes back later.
                        ///NOTE: Simply modifying the object (i.e., settings.user.last_query.lang_id = "...") does not trigger the setter callback.
                        settings.user.last_query = {
                            extra_highlighting: options.extra_highlighting,
                            lang_id:            BF.lang.id,
                            is_default:         options.is_default,
                            prepared_query:     options.prepared_query,
                            raw_query:          options.raw_query,
                            real_query:         options.is_default ? "" : options.raw_query,
                            seo_query:          options.seo_query,
                            type:               options.type
                        };
                    },
                    
                    /// Properties accessible to outer functions.
                    is_default: "",
                    query_type: "",
                    raw_query:  ""
                };
            }());
            /// ************************
            /// * End of query_manager *
            /// ************************
            
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
                 * @param   search_terms (string) The prepared terms to be examined.
                 * @return  An array filled with objects describing the type of search.
                 * @note    Called by run_new_query().
                 * @note    Only a partial implementation currently.  Mixed searching is lacking.
                 * @todo    Review this function.  It seems overly complicated and cryptic.
                 */
                function determine_search_type(search_terms)
                {
                    var exclude_json           = "", /// A comma separated binary list indicating if an attribute is to be present or not present
                        grammar_attribute_json = "", /// This holds the date until it is ready to be concatenated with the other parts into valid JSON.
                        grammar_attributes,          /// This temporarily holds the grammatical attributes.
                        grammar_json           = "", /// This holds the search term.
                        grammar_search_term,         /// This temporarily holds the search term.
                        split_start,
                        split_pos = search_terms.indexOf(BF.lang.grammar_marker);
                    
                    /// Did the user use the grammatical keyword in his search?
                    if (split_pos !== -1) {
                        ///NOTE: A JSON array is used to contain the information about the search.
                        ///      JSON format: '["WORD",[[GRAMMAR_TYPE1,VALUE1],...],[EXCLUDE1,...]]'
                        
                        /// Get the search term (e.g., in "go AS IMPERATIVE, -SINGULAR", grammar_search_term = "go").
                        grammar_search_term = search_terms.slice(0, split_pos);
                        
                        /// Is the user trying to find all words that match the grammatical attributes?
                        if (grammar_search_term === "*") {
                            /// Sphinx will find all words if no query is present, so we need to send a blank search request.
                            grammar_search_term = "";
                        }
                        
                        /// Prepare the first part of the JSON string.
                        /// If grammar_search_term is "go", grammar_json will equal '["go",['.
                        ///NOTE: .replace(/(["'])/g, "\\$1") adds slashes to sanitize the data.  (It is essentially the same as addslashes() in PHP.)
                        ///TODO: Determine if the entire query should be passed through encodeURIComponent().  It would make the text much longer.
                        grammar_json = "[\"" + window.encodeURIComponent(grammar_search_term.replace(/(["'])/g, "\\$1")) + "\",[";
                        
                        /// Isolate the grammatical attributes (e.g., in "go AS IMPERATIVE, -SINGULAR", grammar_attributes = "IMPERATIVE, -SINGULAR").
                        grammar_attributes = search_terms.slice(split_pos + BF.lang.grammar_marker_len);
                        
                        split_start = 0;
                        
                        ///NOTE: An infinite loop is used because the data is returned when it reaches the end of the string.
                        for (;;) {
                            /// Find where the attributes separate (e.g., "NOUN, GENITIVE" would separate at the comma, so split_pos would equal 4).
                            split_pos = grammar_attributes.indexOf(BF.lang.grammar_separator, split_start);
                            /// Trim any leading white space.
                            ///NOTE: Because the string was already prepared by BF.lang.prepare_search(), there should not be two spaces together.
                            if (grammar_attributes.slice(split_start, split_start + 1) === " ") {
                                split_start += 1;
                            }
                            
                            /// Is this grammatical feature to be excluded?
                            if (grammar_attributes.slice(split_start, split_start + 1) === "-") {
                                /// Skip the hyphen so that we just get the grammatical word (e.g., in "love AS -NOUN" we just want "NOUN").
                                split_start += 1;
                                exclude_json += "1,";
                            } else {
                                exclude_json += "0,";
                            }
                            
                            /// Are there more words to find? If so, concatenate the strings into grammar_attribute_json and loop again.
                            ///TODO: Remove the duplicated code.
                            if (split_pos > -1) {
                                /// Get the pre-constructed grammar keyword JSON string (e.g., if grammar_attributes equals "NOUN", grammar_attribute_json will become "[4,1],").
                                ///TODO: Determine if there should be error handling when a grammar keyword does not exist.
                                ///NOTE: The slice() function separates the various grammatical attributes and then that word is
                                ///      looked up in the grammar_keywords object in order to find the JSON code to send to the server.
                                grammar_attribute_json += BF.lang.grammar_keywords[grammar_attributes.slice(split_start, split_pos).trim()] + ",";
                                
                                split_start = split_pos + 1;
                            } else {
                                ///TODO: Determine if trim() is necessary or if there is a better implementation.
                                ///NOTE: exclude_json.slice(0, -1) is used to remove the trailing comma.
                                return [
                                    {
                                        /// Concatenate the last attribute found (like above) along with the exlude array.
                                        query: grammar_json + grammar_attribute_json + BF.lang.grammar_keywords[grammar_attributes.slice(split_start).trim()] + "],[" + exclude_json.slice(0, -1) + "]]",
                                        type:  BF.consts.grammatical_search
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
                            type:           BF.consts.standard_search
                        }
                    ];
                }
                
                
                /**
                 * Process a raw query.
                 *
                 * @example run_new_query("John 3:16"); /// Looks up John 3:16 (and following)
                 * @example run_new_query("love");      /// Searches for the word "love"
                 * @param   raw_query     (string)             The text from the user to query
                 * @param   is_default    (boolean) (optional) Whether or not this query is the default query (and therefore not entered by the user)
                 * @param   replace_state (boolean) (optional) Whether to push this query into the history as a new state or replace the current state
                 * @param   position      (object)  (optional) The actual position the user was at
                 * @param   url_suffix    (string)  (optional) Any extra pieces of URL that must be appended when saving the state (e.g., when the page loads to a maximized callout)
                 * @return  NULL
                 * @note    Called by searchForm.onsubmit() when a user submits a query.
                 */
                return function run_new_query(raw_query, is_default, replace_state, position, url_suffix)
                {
                    /// **********
                    /// * Step 1 *
                    /// **********
                    ///
                    /// Prepare query string, and check to see if we need to send a query.
                    ///
                    
                    var options = {
                            is_default: is_default,
                            raw_query:  raw_query
                        },
                        query,
                        ///NOTE: This is set to an empty string so that it can be concatenated with extra highlighting terms on lookups.
                        standard_terms = "", /// Search terms that are not grammatical.
                        using_position,
                        verse_id;
                    
                    /// Store/update the latest used languages for later use.
                    BF.upate_recent_langs(BF.lang.id);
                    
                    /// ***********
                    /// * Step 1a *
                    /// ***********
                    ///
                    /// First, find and remove text to be highlighted.
                    ///
                    
                    ///TODO: Auto highlighting while typing.  This should be done somewhere else.
                    
                    /// Text inside two curly brackets is to be highlighted, not searched for or looked up.
                    /// E.g., with the string "For God {{so loved}}", it will store "so loved" into options.extra_highlighting via the callback function,
                    /// and return "so loved ", which gets trimmed and turned into "so loved";
                    /// therefore, it will search for the terms "For" and "God," but highlight any occurrence of "so" and "loved."
                    ///NOTE: But search queries and verse lookups can have extra highlighted terms.
                    ///NOTE: Since the highlight string could be at the beginning or end, trim() is used to remove any extra space.
                    ///NOTE: Only one set of highlighted text is allowed, so only one set of curly brackets will be found.
                    query = raw_query.replace(/\s*\{\{(?!\}\})(.*?)\}\}\s*/, function ()
                    {
                        /// Store the text inside the curly brackets.
                        ///NOTE: If we use the g flag, there could be more than one, but currently this is not allowed.
                        /// Since the highlighting terms can be entered in by the user, we cannot assume they are already in the correct format, so they need to be prepared (e.g., convert hyphenated words to quoted words).
                        options.extra_highlighting = BF.lang.prepare_query(arguments[1]).trim();
                        
                        /// Replace the matching string with a space because it could appear between two words (i.e., "for {{God}} so" would turn into "for so").
                        return " ";
                    }).trim();
                    
                    options.base_query = query;
                    
                    /// ***********
                    /// * Step 1b *
                    /// ***********
                    ///
                    /// Prepare the string by normalizing special terms and symbols.
                    ///
                    
                    ///NOTE: Whitespace must be trimmed after this function because it may create excess whitespace.
                    query = BF.lang.prepare_query(query).trim();
                    
                    ///NOTE: Even if the query is blank, a query can be created from the position object.
                    ///      This occurs is the user clears the query box and then changes the language.
                    if (query === "" && typeof position === "undefined") {
                        /// TODO: Determine what else should be done to notify the user that no query will be preformed.
                        return;
                    }
                    
                    options.prepared_query = query;
                    
                    /// **********
                    /// * Step 2 *
                    /// **********
                    ///
                    /// Determine the type of query.
                    ///
                    
                    /// Determine if the user is preforming a search or looking up a verse.
                    /// We do this by checking if a query is a verse reference against the current language and every language that the user has recently used
                    /// or claims to understand (and is loaded).
                    (function ()
                    {
                        var i,
                            /// Make sure the current language is checked first by passing it as the first argument.
                            langs = BF.get_recent_and_acceptable_langs(BF.lang.id),
                            lang_id,
                            len,
                            tmp_query;
                        
                        len = langs.length;
                        
                        for (i = 0; i < len; i += 1) {
                            /// Make sure the language really exists and has been loaded.
                            ///NOTE: Since it could take a long time to download all of the language files, it does not make sense to check unloaded languages,
                            ///      since it would have to do that for a legitimate search.
                            ///      However, if no verses are found, handle_new_verses() will go ahead and download all of the language files of recently used
                            ///      and acceptable languages to check them before declaring no results found.
                            lang_id = langs[i];
                            ///TODO: This needs to be able to asynchronously load the languages and then continue one.
                            if (BF.langs[lang_id] && BF.langs[lang_id].loaded) {
                                /// Because each language's prepare_query() function is different, it needs to be run each time on the base query.
                                tmp_query = BF.langs[lang_id].prepare_query(options.base_query).trim();
                                /// If the query is a verse reference, a number is returned, if it is a search, then FALSE is returned.
                                verse_id = Number(BF.langs[lang_id].determine_reference(tmp_query));
                                /// Did it find a verse reference.
                                if (verse_id) {
                                    /// Make sure to mark this language as recently used so that it does not get removed, if it is not the current language.
                                    if (lang_id !== BF.lang.id) {
                                        BF.upate_recent_langs(lang_id);
                                        /// Since the query might have been changed by this language's prepare_query(), it needs to be replaced.
                                        options.prepared_query = tmp_query;
                                    }
                                    /// If it found a verse reference, stop here.
                                    break;
                                }
                            }
                        }
                    }());
                    
                    /// Is the query a verse lookup?  If so, let's make the URL look nice.
                    if (verse_id || (position && position.type === BF.consts.verse_lookup)) {
                        /// In order to keep a consistent URL for a verse (for better SEO among other reasons), change the query into a standard form.
                        /// E.g., The query "gen" becomes "Genesis 1:1".
                        ///NOTE: If the real query will actually be created by the position object, options.seo_query will be changed later;
                        ///      however, it is still necessary to create it now so that it can be used to create the URL for the new state below.
                        ///NOTE: If the position variable exists, use that to create the verse reference, not the query (i.e., verse_id).
                        options.seo_query = BF.create_ref(position || BF.get_b_c_v(verse_id)) + (options.extra_highlighting ? " {{" + options.extra_highlighting + "}}" : "");
                    }
                    
                    /// If the query is a verse lookup (e.g., verse_id is a number) then determine the proper verse reference (e.g., turn "1cor" into "1 Corinthians 1:1").
                    ///NOTE: Providing one URL for various verse spellings should improve SEO.
                    ///NOTE: If the user enters in a URL manually into the browser, it will not replace it with the proper verse reference.
                    ///NOTE: This must be done now, because the verse_id variable may change later based on the position object.
                    ///NOTE: Another reason this needs to be called now is because later the function may exit before querying the server and simply scroll to the verse.
                    ///NOTE: The trailing slash is necessary to make the meta redirect to preserve the entire URL and add the exclamation point to the end.
                    BF.history[replace_state ? "replaceState" : "pushState"]("/" + BF.lang.id + "/" + window.encodeURIComponent(options.seo_query || raw_query) + "/" + (url_suffix || ""), position ? {position: position} : undefined);
                    
                    /// After saving the state above, make sure that position is an object to make checking for its properties easier.
                    position = position || {};
                    
                    /// Is the query a verse lookup?
                    if (position.type === BF.consts.verse_lookup || (verse_id > 0 && !position.type)) {
                        /// Do we know what position the user should be brought to?
                        ///TODO: Make this work with searches as well.
                        if (position.verse_id) {
                            /// If the user is intended to be brought back to a particular passage, use that instead.
                            ///NOTE: This is used when the page first loads and the user is brought back to where they were last.
                            ///TODO: Make this work when moving back/forth through the history.
                            verse_id = position.verse_id;
                            using_position = true;
                            ///NOTE: position.raw_query should always exist (except for the time being because I just added position.raw_query).
                            ///      Later, this IF statement can be removed after all of the users load the newest version of the code (but make sure to keep setting options.raw_query).
                            if (position.raw_query) {
                                options.raw_query = position.raw_query;
                            }
                        }
                        
                        /// Is the lookup verse the beginning of a Psalm with a title?  If so, we need to start at the title.
                        if (verse_id % 1000 === 1 && Math.floor(verse_id / 1000000) === 19 && BF.psalm_has_title(BF.get_b_c_v(verse_id).c)) {
                            /// To get the titles of Psalms, go back one verse from 1 to 0.
                            verse_id -= 1;
                        }
                        
                        options.verse = verse_id;
                        options.type  = BF.consts.verse_lookup;
                        
                        /// If the query is a verse lookup (and the last query was too) and the verse is visible, just scroll to it.
                        ///TODO: If the user is already at that verse, nothing happens, so there may need to be some visual confirmation.
                        ///NOTE: If just the highlighting changes, the page does not need to reload.
                        if (options.extra_highlighting === query_manager.extra_highlighting && query_manager.lang_id === BF.lang.id && settings.user.last_query && settings.user.last_query.type === BF.consts.verse_lookup && content_manager.scroll_to_verse(BF.get_b_c_v(verse_id))) {
                            ///NOTE: Since the verse had already been loaded, and therefore no query needs to be made, store the query info now.
                            query_manager.store_query_options(options);
                            return;
                        }
                    } else {
                        /// Some languages need to preform additional transformations to search terms that should not be preformed on verse lookups.
                        /// E.g., Chinese words need to be segmented, but if they are segmented too early, it could mess up a verse number or book name.
                        if (BF.lang.prepare_search_terms && query) {
                            query = BF.lang.prepare_search_terms(query);
                        }
                        /// Break down the query string into separate components.
                        /// Mainly, this is used to determine the different parts of a grammatical search.
                        ///FIXME: Implement mixed searching (grammatical and standard together, e.g., "love AS NOUN & more").
                        query = determine_search_type(query);
                        
                        /// Is the query mixed (both standard and grammatical)?
                        if (query.length > 1) {
                            ///TODO: Implement mixed searching.
                            options.query = query;
                            options.type  = BF.consts.mixed_search;
                        } else {
                            ///NOTE: If it is not mixed, then there is currently only one array element, so get the variables out of it.
                            options.query  = query[0].query;
                            options.type   = query[0].type;
                            standard_terms = query[0].standard_terms;
                        }
                    }
                    
                    /// **********
                    /// * Step 3 *
                    /// **********
                    ///
                    /// Request results.
                    ///
                    
                    /// Prepare the initial query, create functions to handle additional and previous queries.
                    query_manager.query(options);
                    
                    /// **********
                    /// * Step 4 *
                    /// **********
                    ///
                    /// Prepare for new results (clear page, prepare highlighter if applicable).
                    ///
                    
                    content_manager.clear_scroll();
                    
                    /// Clear the old position since the page is now cleared.
                    ///NOTE: If no results are found, the position variable is not updated; therefore, it needs to be cleared now.
                    settings.user.position = {};
                    
                    /// Indicate that the lookup is in progress.
                    ///TODO: Determine if this should be done by a function.
                    bottomLoader.style.visibility = "visible";
                    
                    ///TODO: Determine if this should be done by a separate function.
                    document.title = raw_query + " - " + BF.lang.app_name;
                    
                    /// Was the query a search?  Searches need to have the highlight function prepared for the incoming results.
                    if (options.type !== BF.consts.verse_lookup || options.extra_highlighting) {
                        /// Some languages need to preform additional transformations to search terms that need to be preformed on highlighted terms too.
                        if (BF.lang.prepare_search_terms && options.extra_highlighting) {
                            options.extra_highlighting = BF.lang.prepare_search_terms(options.extra_highlighting);
                        }
                        /**
                         * Create the highlight function and closure and prepare the regular expression used to do the highlighting.
                         *
                         * @return A function that will do the highlighting.
                         * @note   Since this function gets attached to the options object, it is sent by reference to the query_manager and called there.
                         * @note   Called by handle_new_verses() in the query_manager.
                         * @todo   Determine a good way to cache the highlight function or regex array.
                         * @todo   Rewrite this so that it does not have to recreate the function every time.
                         */
                        options.highlight = (function ()
                        {
                            var highlight_re;
                            
                            /// TODO: Handle mixed searches.
                            if (options.type === BF.consts.standard_search || options.extra_highlighting) {
                                /// standard_terms is a string containing all of the terms in a standard search (i.e., excluding grammatical search terms when preforming a mixed search).
                                highlight_re = BF.lang.prepare_highlighter((standard_terms + (options.extra_highlighting ? " " + options.extra_highlighting : "")).trim());
                            }
                            
                            /**
                             * Highlight the search results.
                             *
                             * @example options.highlight("<a id=1>In</a> <a id=2>the</a> <a id=3>beginning</a> ...");
                             * @example options.highlight("", [1, 4002, ...]);
                             * @param   html     (string) A string containing the all of the verses in HTML format (only used by standard searches).
                             * @param   word_ids (array)  An array of word ids to be highlighted (only used by grammatical searches).
                             * @note    Only one parameter is needed.
                             */
                            return function highlight(html, word_ids)
                            {
                                var i,
                                    j,
                                    ids,
                                    re_id,
                                    tmp_found_ids = [];
                                
                                /**
                                 * Recursively replace hyphens with fake HTML tags.
                                 *
                                 * Because use can search for just part of a hyphenated word,
                                 * We must modify the HTML to make hyphenated words look like separate words.
                                 *
                                 * @example replace_hyphens("<a id=1234>El-beth-el</a>") /// Returns "<a id=1234>El<=1234>beth<=1234>el</a>"
                                 * @todo    Split hyphenated words in the premade HTML and delete this.
                                 */
                                function replace_hyphens(str)
                                {
                                    return str.replace(/(=(\d+)>[^<]+)-/g, function ()
                                    {
                                        /// arguments[0] = The entire string found.
                                        /// arguments[1] = Everything execpt the final hyphen.
                                        /// arguments[2] = The tag's ID.
                                        
                                        /// First, recursivly check the first part of the returned string for more hyphens to be replaced.
                                        /// Then replace the hyphen with a fake HTML tag.
                                        return replace_hyphens(arguments[1]) + "<=" + arguments[2] + ">";
                                    });
                                }
                                
                                /// Are there standard verses to highlight?
                                /// TODO: Handle mixed searches too.
                                if (html) {
                                    /// Does this language use ngram separation in Sphinx?
                                    ///NOTE: This is useful in languages such as Chinese that do no have distinct spacing between words.
                                    ///      This allows words to be highlighted even when only a part of the word is matched.
                                    if (BF.lang.separate_grams) {
                                        html = BF.lang.separate_grams(html);
                                    }
                                    /// Separate hyphenated words since they are stored in the database as only one word, but we want to be able to match part of a hyphenated word.
                                    /// E.g., searching for "Jehovah" should match "Jehovah" and hyphenated forms, like "Jehovah-jireh."
                                    html = replace_hyphens(html);
                                    /// Loop through all of the terms and highlight them.
                                    for (re_id = highlight_re.length - 1; re_id >= 0; re_id -= 1) {
                                        tmp_found_ids = html.split(highlight_re[re_id].regex);
                                        ids = tmp_found_ids.length;
                                        
                                        ///TODO: Document.
                                        i = 1;
                                        while (i < ids) {
                                            j = highlight_re[re_id].word_count;
                                            while (j > 0) {
                                                ///NOTE: Add classes via classList prevents the possibility to adding the same class twice to hyphenated words.
                                                document.getElementById(tmp_found_ids[i]).classList.add("f" + (re_id + 1));
                                                /// Move the tmp_found_ids array up one
                                                i += 1;
                                                /// Countdown until the end end of the number of words in the phrase.
                                                j -= 1;
                                            }
                                            /// Skip passed the HTML section of the split array.
                                            i += 1;
                                        }
                                        
                                    }
                                ///NOTE: In order to support mixed searches, this will have to be a separate IF statement.
                                }
                                
                                /// Are there grammatical words to highlight?
                                if (word_ids) {
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
                    if (options.type !== BF.consts.verse_lookup || options.verse === 1001001) {
                        /// There is no reason to look for previous verses when the results start at the beginning.
                        content_manager.reached_top();
                    }
                };
            }());
            /// ************************
            /// * End of run_new_query *
            /// ************************
        
            /// **************
            /// * Set events *
            /// **************
            
            /**
             * Capture certain key events, bringing focus to the query box.
             *
             * @param  e (object) The event object (normally supplied by the browser).
             * @return NULL
             * @note   This is not able to cancel query box drop down menu on page up and page down.  But that is intended to be removed eventually.
             * @todo   Determine if this viewport is selected (currently, there is only one viewport).
             * @todo   Determine how to use the keyPress event (since Mozilla only fires this event once when the button is held down).
             */
            document.addEventListener("keydown", function (e)
            {
                var activeEl = document.activeElement,
                    keyCode,
                    new_book,
                    new_chap,
                    line_height = system.properties.line_height;
                
                keyCode = e.keyCode;
                
                /// Is there an input box selected?  If so, this function should not be executed.
                /// Except for page up and page down (33 and 34 respectively); they should still scroll the page down.
                ///NOTE: If an <input> or <button> is selected, the enter and space bar keys still works like normal, but other key strokes are caught.
                if (((((activeEl.tagName === "INPUT" || activeEl.tagName === "BUTTON") && ((activeEl.type !== "submit" && activeEl.type !== "button" && activeEl.type !== "checkbox") || keyCode === 13 || keyCode === 32)) || activeEl.tagName === "TEXTAREA") && keyCode !== 33 && keyCode !== 34) || system.keyboard_busy) {
                    return;
                }
                
                /// If a special key is also pressed, do not capture the stroke.
                ///TODO: Determine if this works on Mac with the Command key.
                ///NOTE: It may be that the Command key is keyCode 91 and may need to be caught by another keydown event.
                ///NOTE: The meta key does not seem to be detected; this may need me manually checked for, like for the Mac.
                ///NOTE: However, it should not grab the key stroke if the user is pasting.  keyCode 86 === "V" (which is the standard shortcut for pasting).
                if ((e.ctrlKey && keyCode !== 86) || e.altKey || e.metaKey) {
                    return;
                }
                
                /// Is the user pressing a key that should probably be entered into the input box?  If so, bring focus to the query box so that the keystrokes will be captured.
                /// keyCode values:
                ///       8 = Backspace
                ///      13 = Enter
                ///      32 = Space
                ///      33 = Page Up
                ///      34 = Page Down
                ///      38 = Up
                ///      40 = Down
                ///   48-90 = Alphanumeric
                ///  96-111 = Numpad keys
                /// 186-254 = Punctuation
                if (keyCode === 8 || keyCode === 13 || keyCode === 32 || (keyCode > 47 && keyCode < 91) || (keyCode > 95 && keyCode < 112) || (keyCode > 185 && keyCode < 255)) {
                    qEl.focus();
                } else if (keyCode === 38 || keyCode === 40) {
                    /// Force browsers to scroll one line of text at a time.
                    ///NOTE: window.pageYOffset % line_height calculates the offset from the nearest line to snap the view to a line.
                    window.scrollBy(window.pageXOffset, (keyCode === 38 ? -window.pageYOffset % line_height || -line_height : line_height - (window.pageYOffset % line_height)));
                    e.preventDefault();
                } else if (keyCode === 33 || keyCode === 34) {
                    /// Scroll to the next/previous chapter on page down/up respectively.
                    
                    /// The verse range needs to be updated in order to make sure it selects the correct chapter.
                    ///NOTE: Sending TRUE makes the function synchronous.
                    content_manager.update_verse_range(true);
                    
                    new_book = content_manager.top_verse.b;
                    /// When paging up, go up one chapter if at the top of a chapter; otherwise go to the top of the current chapter.
                    /// When paging down, always go to the next chapter.
                    new_chap = content_manager.top_verse.c + (keyCode === 33 ? (content_manager.top_verse.v < 2 ? -1 : 0) : 1);
                    
                    /// Do we need to go back to the last chapter of the previous book?
                    if (new_chap < 1) {
                        new_book -= 1;
                        new_chap  = BF.lang.chapter_count[new_book];
                    /// If the chapter does not exist, go to the first chapter of the next book.
                    } else if (new_chap > BF.lang.chapter_count[new_book]) {
                        new_book += 1;
                        new_chap  = 1;
                    }
                    
                    /// If the new book is within valid range, try to scroll to it.  If not, just let the page scroll like normal.
                    if (new_book > 0 && new_book < 67) {
                        ///TODO:  Determine if this should skip a chapter if it is just a verse or two away.
                        ///TODO:  Determine if it should do something different when the chapter has not been loaded (like preform a lookup and then scroll).
                        ///FIXME: This does not work in Opera.
                        if (content_manager.top_verse && content_manager.scroll_to_verse({b: new_book, c: new_chap, v: 1})) {
                            /// Since it scrolled to the verses successfully, prevent the key press from scrolling the page like normal.
                            e.preventDefault();
                        }
                    }
                }
            }, false);
            
            (function ()
            {
                /**
                 * Handle change in the browser state.
                 *
                 * @param e (object) An object representing the state
                 * @note  The e object also expects the custom property "initial_page_load" when the page is first loaded.
                 * @note  This function is called manually when the page first loads and on popstate.
                 */
                function on_state_change(e)
                {
                    var url_suffix,
                        is_default = false,
                        lang_id,
                        position,
                        raw_query,
                        split_query,
                        using_url;
                    
                    /**
                     * Execute the query and possibly change the query box text.
                     *
                     * @return NULL
                     */
                    function do_query()
                    {
                        /// If the default query is empty, lookup the first verse (i.e., Genesis 1:1).
                        ///NOTE: This must be done after changing the language; otherwise, the book name will be wrong.
                        if (!raw_query) {
                            raw_query = BF.create_ref({b: 1, c: 1, v: 1});
                            is_default = true;
                        }
                        
                        run_new_query(raw_query, is_default, true, position, url_suffix);
                        
                        /// Only change the text in the query input if the user has not started typing and the user actually typed in the query.
                        if (!e.initial_page_load || qEl.value === "") {
                            if (e.initial_page_load && typeof settings.user.entered_text !== "undefined" && (!using_url || (position && position.raw_query === settings.user.entered_text))) {
                                /// Fill in the last query that the user typed in, which is not necessary the same as what the user lasted queried.
                                qEl.value = settings.user.entered_text;
                                /// Clear the placeholder text to allow for the user to clear the query box so that he is not distracted.
                                qEl.removeAttribute("placeholder");
                            } else if (!is_default) {
                                /// As long as it is not the default query, use the query the user entered in.
                                qEl.value = raw_query;
                                /// Clear the placeholder text to allow for the user to clear the query box so that he is not distracted.
                                qEl.removeAttribute("placeholder");
                            }
                        }
                        
                        ///NOTE: Showing/hiding callouts must be delayed shortly to let BibleForge first find the correct verse.
                        ///      Sometimes, pressing backward/forward will cause the page to momentarily jump (which is quickly fixed by BibleForge).
                        ///TODO: Determine if there needs to be a way to cancel this timeout if needed.
                        window.setTimeout(function ()
                        {
                            /// Is there a word ID?  If so, we need to show a maximized callout.
                            if (split_query && split_query[2]) {
                                /// Since BF.show_callout() is created by secondary.js (since it is often not needed immediately), check to see if it exists.
                                if (BF.callout_manager) {
                                    BF.callout_manager.show_callout({id: split_query[2], el: document.getElementById(split_query[2]), maximized: true, ignore_state: true});
                                } else {
                                    /// If BF.show_callout() has not yet been created, secondary.js must not have loaded yet,
                                    /// so we need to wait for that to load and they try again.
                                    system.event.attach("secondaryLoaded", function ()
                                    {
                                        BF.callout_manager.show_callout({id: split_query[2], el: document.getElementById(split_query[2]), maximized: true, ignore_state: true});
                                    }, true);
                                }
                            } else {
                                /// Possibly shrink any maximized callouts.
                                if (BF.callout_manager) {
                                    /// Since the state has already changed, set ignore_state to TRUE to make sure not to change again.
                                    BF.callout_manager.shrink_maximized_callout({ignore_state: true});
                                }
                            }
                        }, 0);
                    }
                    
                    /// Is the page loading (but the user has been here before) and the user did not specify a query in the URL? (E.g., the user loaded "bibleforge.com" and not something like "bibleforge.com/en/gen".)
                    if (e.initial_page_load && window.location.pathname === "/" && BF.is_object(settings.user.last_query) && settings.user.last_query.lang_id) {
                        /// Use the last query the user made instead of the default query.
                        lang_id   = settings.user.last_query.lang_id;
                        raw_query = settings.user.last_query.real_query;
                        /// Get the last position the user was at.
                        position = settings.user.position;
                        /// Change the current state to match the last query so that if the user presses the back button later, they will get to the right query.
                        ///NOTE: The query and language is stored in the state object so as not to cause the URL to change.
                        ///      This way, if the user clicks refresh, it will load back to the same position.
                        BF.history.replaceState("/", {position: position});
                    } else {
                        /// Try to load a query from the URL.
                        
                        /// URL structure:
                        ///     /[lang/][query/]
                        /// or
                        ///     /lang/query/word_id/
                        ///
                        /// Examples:
                        ///     /
                        ///     /en/
                        ///     /en/Genesis 1:1/
                        ///     /Genesis 1:1/
                        ///     /en_em/love/
                        ///     /love/
                        ///     /en/Matthew 1:1/621719/
                        ///
                        
                        /// window.location.pathname should always start with a slash (/); substr(1) removes it.
                        /// Since there should only be two parameters, anything after the second slash is ignored by limiting split() to two results.
                        ///TODO: Check if IE 10 has the leading slash (see http://trac.osgeo.org/openlayers/ticket/3478).
                        split_query = window.location.pathname.substr(1).split("/").map(window.decodeURIComponent);
                        
                        /// If the last parameter is empty (""), remove it.
                        /// E.g., "/en/" turns into ["en", ""], so make it just ["en"].
                        /// The reason for removing the last empty element is to make it easier to determine if the URL contains both a language ID and a query.
                        if (split_query.length && split_query[split_query.length - 1].trim() === "") {
                            split_query.pop();
                        }
                        
                        /// Does if have at least both a language ID and a query?
                        ///NOTE: There could be more than 2 parameters if there is a word ID at then end (e.g., /en/Matthew 1/621719/).
                        if (split_query.length >= 2) {
                            /// If the language has already been loaded, there is no need to change the language.
                            lang_id   = split_query[0];
                            raw_query = split_query[1];
                            using_url = true;
                            /// Get any extra pieces of the URL (such as word ID).
                            /// This extra URL string must be appended to the end of the URL when updating the state (in run_new_query()).
                            /// Otherwise, it would not store the entire URL in the state.
                            /// This occurs when moving back and forth between a maximized callout or loading the page to a maximized callout.
                            /// E.g., if window.location.pathname is "/en/John%201%3A1/691005/",
                            ///       "url_suffix" will equal "691005/".
                            ///NOTE: If the URL has no ending slash (e.g., "/en/love"), the regex will return NULL, so a blank array is used to prevent errors.
                            url_suffix = (window.location.pathname.match(/(?:\/[^\/]*){2}\/(.*)/) || ["",""])[1];
                        } else {
                            ///NOTE: If only one parameter is found, it could be either a language ID or a query.
                            /// Is the parameter a valid language ID?
                            if (BF.langs[split_query[0]]) {
                                lang_id = split_query[0];
                            } else {
                                /// If no language was specified, use the most preferred language BibleForge supports.
                                ///NOTE: An empty string is returned if no language which found.
                                lang_id   = BF.get_preferred_supported_lang();
                                raw_query = split_query[0];
                                using_url = true;
                            }
                        }
                        
                        /// Get the last position the user was at (if available).
                        /// On initial page loads, if a language is specified but no query or the query and language is the same as the last query made, try to load the last position as well.
                        ///NOTE: On verse lookups, the query may be modified to conform to a specific standard for SEO reasons; therefore, it may be necessary to compare raw_query to seo_query as well.
                        position = e.state ? e.state.position : e.initial_page_load && (!raw_query || ((raw_query === settings.user.last_query.raw_query || raw_query === settings.user.last_query.seo_query) && lang_id === settings.user.last_query.lang_id)) ? settings.user.position : undefined;
                    }
                    
                    /// If the requested language is the same as the current one, there is no need to change it.
                    if (lang_id === BF.lang.id) {
                        lang_id = "";
                    }
                    
                    /// Is the query in a different language?  If there is no language specified, just use the default language.
                    if (lang_id) {
                        /// If BF.change_language() has not been created by secondary.js, we must wait until that code has loaded.
                        if (BF.change_language) {
                            BF.change_language(lang_id, true, do_query);
                        } else {
                            system.event.attach("secondaryLoaded", function ()
                            {
                                BF.change_language(lang_id, true, do_query);
                            }, true);
                        }
                    } else if (!e.initial_page_load) {
                        do_query();
                    } else {
                        /// Since the page just loaded, wait for a moment before executing the query (to give the server a moment's rest).
                        window.setTimeout(function ()
                        {
                            /// If the user has not sent a query, execute the default query.
                            if (query_manager.raw_query === "") {
                                do_query();
                            }
                        }, 200);
                    }
                }
                
                on_state_change({initial_page_load: true});
                
                /// Because WebKit (unlike Gecko) fires the window.onpopstate event on page load, we must wait to attach the function.
                window.setTimeout(function ()
                {
                    BF.history.attach(on_state_change);
                }, 500);
            }());
            
            /// Set some default language specific text.
            queryButton.title = BF.lang.query_button_title;
            queryButton.alt   = BF.lang.query_button_alt;
            
            system.event.attach("languageChange", function ()
            {
                queryButton.title = BF.lang.query_button_title;
                queryButton.alt   = BF.lang.query_button_alt;
                
                /// If the placeholder still exists (i.e., the user has not typed anything) set it to the new language's.
                if (qEl.placeholder) {
                    qEl.placeholder = BF.lang.query_explanation;
                }
            });
            
            
            /**
             * Detect when a search verse reference was clicked and look up that verse.
             *
             * @param e (event object) The mouse event object.
             */
            page.addEventListener("click", function(e)
            {
                var bcv,
                    ///NOTE: IE/Chromium/Safari/Opera use srcElement, Firefox uses originalTarget.
                    clicked_el = e.srcElement || e.originalTarget,
                    clicked_parent,
                    highlighting,
                    query;
                
                ///TODO: Determine a faster way of determining if a search verse reference was clicked.
                ///      One option would be to try to attach an event to each element, but that might take up too many resources.
                if (clicked_el.tagName === "SPAN") {
                    clicked_parent = clicked_el.parentNode;
                    if (clicked_parent && clicked_parent.className === "search_verse") {
                        bcv = BF.get_b_c_v(window.parseInt(clicked_parent.id, 10));
                        query = BF.create_ref(bcv);
                        
                        /// Prepare to highlight the search terms on the verse lookup.
                        ///TODO: Figure out how to highlight grammatical (as well as mixed) searches.
                        if (query_manager.query_type !== BF.consts.grammatical_search) {
                            ///TODO: Instead of using prepared_query, it might be good to just use a simple list terms.
                            highlighting = (query_manager.prepared_query + (query_manager.extra_highlighting ? " " + query_manager.extra_highlighting : ""));
                            if (highlighting) {
                                query = query + " {{" + highlighting + "}}";
                            }
                        }
                        
                        /// If the Alt and/or Ctrl key is pressed, open in a new tab.
                        ///TODO: Determine if middle click should open in a new tab too.
                        if (BF.keys_pressed.alt || BF.keys_pressed.ctrl) {
                            ///BUG: Chromium only opens a new tab when clicking on the magnifying glass (not when pressing enter).
                            ///NOTE: In Chromium, holding Alt brings the new tab to the forefront but Ctrl opens it in the background.
                            window.open("/" + BF.lang.id + "/" + window.encodeURIComponent(query) + "/", "_blank");
                        } else {
                            /// Look up the clicked verse.
                            qEl.value = query;
                            run_new_query(query);
                        }
                    }
                }
            }, false);
            
            /**
             * Capture the text the user enters into the query box.
             *
             * This text is then put back in to the query box when the user next visits the page, regardless of whether or not the user submits the query.
             */
            qEl.onchange = function ()
            {
                settings.user.entered_text = qEl.value;
                this.removeAttribute("placeholder");
            };
            
            /**
             * Capture form submit events and begin a new query.
             *
             * @return FALSE.  It must always return false in order to prevent the form from submitting.
             * @note   Called when a user submits the form.
             */
            searchForm.onsubmit = function ()
            {
                var raw_query = qEl.value;
                
                /// If the user has not entered in a query, draw attention to the input box.
                if (!raw_query.trim()) {
                    qEl.focus();
                /// If the Alt and/or Ctrl key is pressed, open in a new tab.
                ///TODO: Determine if it would be good to indicate to the user somehow that it will open in a new tab (maybe change the magnifying glass icon).
                ///TODO: Open a new tab when the query box is empty.
                } else if (BF.keys_pressed.alt || BF.keys_pressed.ctrl) {
                    ///BUG: Chromium only opens a new tab when clicking on the magnifying glass (not when pressing enter).
                    ///NOTE: In Chromium, holding Alt brings the new tab to the forefront but Ctrl opens it in the background.
                    window.open("/" + BF.lang.id + "/" + window.encodeURIComponent(raw_query) + "/", "_blank");
                } else {
                    run_new_query(raw_query);
                }
                
                ///NOTE: Must return false in order to stop the form submission.
                return false;
            };
            
            /// *********************
            /// * End of set events *
            /// *********************
            
            /// Set the default placeholder text.
            qEl.placeholder = BF.lang.query_explanation;
            
            /// After a short delay, lazily load extra, nonessential (or at least not immediately essential) code, like the wrench menu.
            ///TODO: Determine if there is any problem hitting the server again so quickly.
            window.setTimeout(function ()
            {
                BF.include("/js/secondary.js?105857bc68dac4e3c783fb060e2e1c6c", {
                    content_manager: content_manager,
                    langEl:          langEl,
                    page:            page,
                    qEl:             qEl,
                    settings:        settings,
                    system:          system,
                    run_new_query:   run_new_query,
                    topBar:          topBar,
                    viewPort_num:    viewPort_num
                });
            }, 1000);
        }());
        /// ************************************************
        /// * End of main BibleForge initializing function *
        /// ************************************************
    };
    /// *******************************
    /// * End of Bf.create_viewport() *
    /// *******************************
    
    
    /// **********************************
    /// * Start of browser specific code *
    /// **********************************
    
    if (BF.is_WebKit) {
        /// Add "webkit" to the <html> element's class to allow for WebKit specific CSS.
        document.getElementsByTagName("html")[0].classList.add("webkit");
    }
    
    if (window.opera) {
        /// Add "opera" to the <html> element's class to allow for Opera specific CSS.
        document.getElementsByTagName("html")[0].classList.add("opera");
    }
    
    if (BF.is_Mozilla) {
        /// Add "moz" to the <html> element's class to allow for Mozilla specific CSS.
        document.getElementsByTagName("html")[0].classList.add("moz");
    }
    
    /**
     * Fix IE's String.split().
     *
     * @param  s     (regexp || string)            The regular expression or string with which to break the string.
     * @param  limit (number)           (optional) The number of times to split the string.
     * @return Returns an array of the string now broken into pieces.
     * @see    http://blog.stevenlevithan.com/archives/cross-browser-split
     * @todo   Determine if IE11 still needs this.
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
            
            s.lastIndex = origLastIndex;
            return output;
        };
        
        @if (@_jscript_version >= 10)
            /// Add "ie" to the <html> element's class to allow for IE specific CSS.
            document.getElementsByTagName("html")[0].classList.add("ie");
        @end
    @*/
    
    /// ********************************
    /// * End of browser specific code *
    /// ********************************
    
    /**
     * Remove languages that have not been used recently.
     */
    (function ()
    {
        var now = Date.now(),
            recent_langs = BF.parse_json(window.localStorage.getItem("recent_langs")) || {};
        
        Object.keys(recent_langs).forEach(function (lang) {
            /// Was the language last used more than 30 days ago?
            ///NOTE: 2592000000 = 30 * 24 * 60 * 60 * 1000
            if (now - recent_langs[lang] > 2592000000) {
                delete recent_langs[lang];
            }
        });
        
        /// Update the recently used languages in case some old ones were removed.
        window.localStorage.setItem("recent_langs", JSON.stringify(recent_langs));
    }());
    
    /**
     * Prime the browser and initialize BibleForge.
     */
    (function ()
    {
        /// If the user presses the refresh button, some browsers will try to scroll back to the user's last scroll position.
        /// However, since BibleForge does not display all of the text on the screen at the same time, this causes lots of problems.
        /// To prevent the browser from altering the starting scroll position, we have to manually scroll the browser.
        /// This is done by creating an element slightly larger than the viewport and scrolling up and down one pixel.
        var big_el    = document.createElement("div"),
            doc_docEl = document.documentElement;
        
        /// Make the elememt slightly larger than the viewport so that we can scroll.
        big_el.style.height = (doc_docEl.scrollHeight + 1) + "px";
        
        /// Prevent the browser from jumping if the user pressed refresh by scrolling the view now.
        document.body.appendChild(big_el);
        window.scrollTo(1, 0);
        window.scrollTo(0, 0);
        document.body.removeChild(big_el);
        
        /// Destroy the element since it is no longer needed.
        big_el = undefined;
        
        /// Initialize BibleForge.
        BF.create_viewport(document.getElementById("viewPort0"), doc_docEl);
    }());
});
