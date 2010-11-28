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
/*global window, BF */
/*jslint white: true, browser: true, devel: true, evil: true, onevar: true, undef: true, nomen: true, bitwise: true, newcap: true, immed: true */

/// Declare helper function(s) attached to the global BibleForge object (BF).

/// Detect WebKit based browsers.
///NOTE: Since the user agent string can be modified by the user, it is not bulletproof.
BF.is_WebKit = !!window.chrome || window.navigator.userAgent.indexOf("WebKit/") >= 0;

/// NOTE: Usually, eval() and JSON.parse() are similar in speed and the Function Constructor is really slow.
///       However, in Chrome, eval() is really fast, the Function Constructor is even faster, and JSON.parse() is ridiculously slow.
///       Therefore, use the Function Constructor for Chrome and JSON.parse() for all others.
///NOTE: It could also check to make sure that the string starts with a curly bracket ({) straight bracket ([) double quote (") or number (hyphen (-) or digit)to attempt to ensure that it is valid JSON.
BF.parse_json = window.chrome ? function (str)
{
	return str === "" ? "" : (new Function("return " + str))();
} : function (str)
{
    return str === "" ? "" : JSON.parse(str);
};

BF.create_simple_ajax = function ()
{
    var ajax = new window.XMLHttpRequest(),
        ajax_timeout;
    
    return {
        abort: function ()
        {
            /// Is a query in progress?  If readyState > 0 and < 4, it needs to be aborted.
            if (ajax.readyState % 4) {
                /// Stop it from retrying first.
                clearTimeout(ajax_timeout);
                ajax.abort();
            }
            
            return this;
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
             * @note   Called by the BF.create_simple_ajax.query().
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
             * @example query("POST", "query.php", "q=search", function () {/// success}, function () {/// failure}, 10000, true);
             * @param   method    (string)              The HTTP method to use (GET || POST).
             * @param   path      (string)              The URL to query.
             * @param   message   (string)   (optional) The variables to send (URI format: "name1=value1&name2=value%202").
             * @param   onsuccess (function) (optional) The function to run on a successful query.
             * @param   onfailure (function) (optional) The function to run if the query fails.
             * @param   timeout   (number)   (optional) How long to wait before giving up on the script to load (in milliseconds).
             *                                          A falsey value (such as 0 or FALSE) disables timing out.         (Default is 10,000 milliseconds.)
             * @param   retry     (boolean)  (optional) Whether or not to retry loading the script if a timeout occurs.  (Default is TRUE.)
             * @return  NULL.
             * @note    Called by ???.
             * @todo    Determine if it should change a method from GET to POST if it exceeds 2,083 characters (IE's rather small limit).
             */
            return function (method, path, message, onsuccess, onfailure, timeout, retry)
            {
                /// Determine if arguments were passed to the last two parameters.  If not, set the defaults.
                if (typeof timeout == "undefined") {
                    /// Default to 10 seconds.
                    ///TODO: This should be dynamic based on the quality of the connection to the server.
                    timeout = 10000;
                }
                
                if (typeof retry == "undefined") {
                    retry = true;
                }
                
                ///TODO: determine if the first parameter should be different.
                ajax.open(method, path);
                /// Without the correct content-type, the data in the message will not become variables on the server.
                ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                ajax.onreadystatechange = function ()
                {
                    if (ajax.readyState == 4) {
                        /// Stop the timeout timer that may be running so it does not try again.
                        clearTimeout(ajax_timeout);
                        
                        /// Was the request successful?
                        if (ajax.status == 200) {
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
 */
BF.include = (function ()
{
    /**
     * Eval code in a neutral scope.
     *
     * @param  code (string) The string to eval.
     * @return The result of the eval'ed code.
     * @note   Called by ajax.onreadystatechange().
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
            var ajax = BF.create_simple_ajax();
            
            ajax.query("GET", path, "", function (response)
            {
                files[path] = evaler(response);
                ///TODO: Determine what kind of error handling should be done.
                if (typeof files[path] == "function") {
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
 * @note    Called by scroll_to_verse() and wrench button onclick() in secondary.js.
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
        ///NOTE: The condition intentionally assigns obj.offsetParent to obj, which is falsey (null) when no more parents exist.
        } while ((obj = obj.offsetParent));
    }
    
    return {
        left: left_pos,
        top:  top_pos
    };
};


/**
 * Formats a positive number with appropriate commas.
 *
 * @example	format_number(1000); /// Returns "1,000"
 * @param	num (positive number) The number to format.
 * @return	A formatted number as a string.
 * @note	To be faster, this will not format a negative number.
 */
BF.format_number = function (num)
{
    var rgx;
    
    if (num < 1000) {
        return num;
    }
    
    /// Quickly converts a number to a string quickly.
    num += "";
    rgx  = /^([0-9]+)([0-9][0-9][0-9])/;
    
    while (rgx.test(num)) {
        num = num.replace(rgx, "$1,$2");
    }
    
    return num;
};


/**
 * Change an existing CSS rule.
 *
 * @example BF.changeCSS(".q", "color: #000;")); /// Changes the ".q" rule (i.e., the "q" class) to have a text color of black.
 * @param   selector   (string)             The name of the rule to replace.
 * @param   new_CSS    (string)             The CSS to use for the specified selector.
 * @param   change_all (boolean) (optional) Whether or not to check every rule.  If falsey, it will stop after finding one rule that matches selector.
 * @return  NULL.  Possibly changes the CSS.
 * @note    Called when the user changes the red_letters setting.
 * @todo    Test in IE.
 */
BF.changeCSS = function (selector, new_CSS, change_all)
{
    var CSS_rules,
        CSS_rules_len,
        i = 0,
        ///TODO: Determine if it should loop through all styles sheets.
        style_sheet = document.styleSheets[0];
    
    /// Get the styles (cssRules) for Mozilla/WebKit/Opera/IE9 and (rules) for IE8-.
    CSS_rules     = style_sheet.cssRules ? style_sheet.cssRules : style_sheet.rules;
    CSS_rules_len = CSS_rules.length;
    
    while (i < CSS_rules_len) {
        if (CSS_rules[i].selectorText == selector) {
            CSS_rules[i].style.cssText = new_CSS;
            if (!change_all) {
                return;
            }
        }
        ++i;
    }
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
        ++BF.viewPort_count;
        
        
        /**
         * Load settings.
         *
         * @todo Document
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
                    in_paragraphs: create_get_set(true, function (values)
                    {
                        var cur_verse;
                        
                        if (last_type != verse_lookup) {
                            return;
                        }
                        
                        ///FIXME: There should be a dedicated function for getting the current verse (or better yet, a variable that stores that information).
                        cur_verse = content_manager.get_verse_at_position(window.pageYOffset + topLoader.offsetHeight + 8, true, page);
                        
                        if (cur_verse !== false) {
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
                }
            };
        }());
        
        /******************************
        * Start of Scrolling Closure *
        ******************************/
        
        /**
         * The functions that handle the scrolling of the page and other related functions.
         *
         * @return Returns an object with functions for adding content, updating the verse range, and scrollng the view.
         * @todo   Restructure this closure more.
         */
        content_manager = (function ()
        {
            var add_content_if_needed,
                
                buffer_add                     = 1000,  /// In milliseconds
                buffer_rem                     = 10000, /// In milliseconds
                
                cached_count_bottom            = 0,
                cached_count_top               = 0,
                cached_verses_bottom           = [],
                cached_verses_top              = [],
                
                checking_excess_content_bottom = false,
                checking_excess_content_top    = false,
                
                has_reached_top,
                has_reached_bottom,
                
                looking_up_verse_range         = false,
                lookup_delay                   = 200,
                lookup_range_speed             = 300,   /// In milliseconds
                lookup_speed_scrolling         = 50,    /// In milliseconds
                lookup_speed_sitting           = 100,   /// In milliseconds
                
                remove_content_bottom_timeout,
                remove_content_top_timeout,
                remove_speed                   = 3000,  /// In milliseconds
                
                scroll_pos                     = 0,
                
                ///TODO: Determine if these should have default values and what they should be.
                update_verse_range;
            
            /**
             * The scrolling closure
             *
             * @todo Determine if any variables can be placed in here.
             */
            (function ()
            {
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
                        cached_verses_top[cached_count_top++] = child.innerHTML;
                        ///TODO: Determine if setting the display to "none" actually helps at all.
                        /// Remove quickly from the page.
                        child.style.display = "none";
                        /// Calculate and set the new scroll position.
                        /// Because content is being removed from the top of the page, the rest of the content will be shifted upward.
                        /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was removed.
                        scrollViewTo(window.pageYOffset - child_height);
                        
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
                        cached_verses_bottom[cached_count_bottom++] = child.innerHTML;
                        
                        page.removeChild(child);
                        
                        /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                        ///TODO: Determine if this is still an issue with IE9.
                        /*@cc_on
                            scrollViewTo(window.pageYOffset);
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
                    ///TODO: Perhaps move scroll_pos in here too.
                    
                    /**
                     * The onscroll event.
                     *
                     * When the page scrolls this figures out the direction of the scroll and
                     * calls specific functions to determine whether content should be added or removed.
                     *
                     * @return NULL.  May call other functions via setTimeout().
                     * @note   Called when the window scrolls.  It may also call itself.
                     * @note   Set by the onscroll event.
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
                        if (new_scroll_pos == scroll_pos) {
                            /// Should we wait a moment and see if the scroll position changes.
                            if (++scroll_check_count < 10) {
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
                        
                        /// Don't look up more data until the first results come.
                        if (waiting_for_first_search) {
                            return;
                        }
                        
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
                    
                    ///NOTE: Could use the wheel event if the scroll bars need to be invisible.
                    ///TODO: Determine how to handle scrolling if there were multiple viewports (i.e., split view).
                    window.onscroll = scrolling;
                }());
            }());
            
            
            /**
             * Find a verse element that is within a certain Y coordinate on the screen.
             *
             * @example verse = get_verse_at_position(window.pageYOffset + topLoader.offsetHeight + 8,  true,  page); /// Could return {b: 1, c: 1, v: 1} for Genesis 1:1.
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
                
                looked_next		= false;
                looked_previous	= false;
                
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
                            looked_next	    = true;
                        } else {
                            el = el.previousSibling;
                            looked_previous	= true;
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
                    while ((looking_upward ? possible_el = el.previousSibling : possible_el = el.nextSibling) !== null && the_pos >= possible_el.offsetTop && the_pos <= possible_el.offsetTop + possible_el.offsetHeight) {
                        el = possible_el;
                    }
                    ///NOTE: Intentional fall through.
                case "chapter":
                case "book":
                case "short_book":
                    /// Found the verse, so calculate the verseID and call the success function.
                    ///NOTE: No radix is used because the number should never begin with a leading 0 and suppling the radix slows Mozilla (Firefox 3.6-) down tremendously.
                    verse_id = window.parseInt(el.id);
                    
                    v = verse_id % 1000;
                    c = ((verse_id - v) % 1000000) / 1000;
                    b = (verse_id - v - c * 1000) / 1000000;
                    
                    return {b: b, c: c, v: v};
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
                            newEl.innerHTML = cached_verses_bottom[--cached_count_bottom];
                            ///NOTE: This is actually works like insertAfter() (if such a function existed).
                            ///      By using "null" as the second parameter, it tells it to add the element to the end.
                            page.insertBefore(newEl, null);
                            
                            /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                            /*@cc_on
                                scrollViewTo(window.pageYOffset);
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
                            run_search(additional);
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
                    if (child.clientHeight + buffer_add > window.pageYOffset) {
                        /// Can the content be grabbed from cache?
                        if (cached_count_top > 0) {
                            newEl = document.createElement("div");
                            
                            /// First subtract 1 from the outer counter variable to point to the last cached passage, and then retrieve the cached content.
                            newEl.innerHTML = cached_verses_top[--cached_count_top];
                            
                            page.insertBefore(newEl, child);
                            
                            /// The new content that was just added to the top of the page will push the other contents downward.
                            /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
                            scrollViewTo(window.pageYOffset + newEl.clientHeight);
                            
                            /// Check to see if we need to add more content.
                            add_content_if_needed(previous);
                        } else {
                            /// Did the user scroll all the way to the very top?  (If so, then there is no more content to be gotten.)
                            if (has_reached_top) {
                                topLoader.style.visibility = "hidden";
                                return;
                            }
                            /// Get more content.
                            run_search(previous);
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
                 */
                return function (direction)
                {
                    if (direction === additional) {
                        window.setTimeout(add_content_bottom_if_needed, lookup_speed_sitting);
                    } else {
                        window.setTimeout(add_content_top_if_needed,    lookup_speed_scrolling);
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
                /**
                 * Determine and set the range of verses currently visible on the screen.
                 *
                 * @return Null.  The verse range is updated if need be.
                 * @note   Called by update_verse_range().
                 */
                function update_verse_range_delayed()
                {
                    var new_title,
                        ref_range,
                        verse1,
                        verse2;
                    
                    ///TODO: Make a variable that clearly represents the height of the topBar, not topLoader.offsetHeight).
                    ///NOTE: Check a few pixels (8) below what is actually in view so that it finds the verse that is actually readable.
                    verse1 = get_verse_at_position(window.pageYOffset + topLoader.offsetHeight + 8,  true,  page);
                    if (verse1 === false) {
                        looking_up_verse_range = false;
                        ///TODO: Try again?
                        return;
                    }
                    
                    ///NOTE: Check a few pixels (14) above what is actually in view so that it finds the verse that is actually readable.
                    verse2 = get_verse_at_position(window.pageYOffset + doc_docEl.clientHeight - 14, false, page);
                    if (verse2 === false) {
                        looking_up_verse_range = false;
                        ///TODO: Try again?
                        return;
                    }
                    
                    /// The titles in the book of Psalms are referenced as verse zero (cf. Psalm 3).
                    verse1.v = verse1.v === 0 ? BF.lang.title : verse1.v;
                    verse2.v = verse2.v === 0 ? BF.lang.title : verse2.v;
                    
                    ///NOTE: \u2013 is Unicode for the en dash (–) (HTML: &ndash;).
                    ///TODO: Determine if the colons should be language specified.
                    /// Are the books the same?
                    if (verse1.b == verse2.b) {
                        /// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
                        verse1.b = verse1.b == 19 ? BF.lang.psalm : BF.lang.books_short[verse1.b];
                        /// Are the chapters the same?
                        if (verse1.c == verse2.c) {
                            /// Are the verses the same?
                            if (verse1.v == verse2.v) {
                                ref_range = verse1.b + " " + verse1.c + ":" + verse1.v;
                            } else {
                                ref_range = verse1.b + " " + verse1.c + ":" + verse1.v + "\u2013" + verse2.v;
                            }
                        } else {
                            ref_range = verse1.b + " " + verse1.c + ":" + verse1.v + "\u2013" + verse2.c + ":" + verse2.v;
                        }
                    } else {
                        /// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
                        verse1.b = verse1.b == 19 ? BF.lang.psalm : BF.lang.books_short[verse1.b];
                        verse2.b = verse2.b == 19 ? BF.lang.psalm : BF.lang.books_short[verse2.b];
                        
                        ref_range = verse1.b + " " + verse1.c + ":" + verse1.v + "\u2013" + verse2.b + " " + verse2.c + ":" + verse2.v;
                    }
                    
                    /// last_type is set in prepare_new_search().
                    /// The verse range is displayed differently based on the type of search (i.e., a verse lookup or a search).
                    ///TODO: Set the date of the verse (or when it was written).
                    if (last_type == verse_lookup) {
                        new_title = ref_range + " - " + BF.lang.app_name;
                    } else {
                        new_title = last_search + " (" + ref_range + ") - " + BF.lang.app_name;
                    }
                    
                    /// Is the new verse range the same as the old one?
                    /// If they are the same, updating it would just waste time.
                    if (document.title != new_title) {
                        document.title = new_title;
                        
                        /// Display the verse range on the page if looking up verses.
                        ///FIXME: There should be a variable that shows the current view mode and not rely on last_type.
                        if (last_type == verse_lookup) {
                            ///TODO: Find a better way to clear infoBar than using innerHTML.
                            infoBar.innerHTML = "";
                            infoBar.appendChild(document.createTextNode(ref_range));
                        }
                    }
                    
                    looking_up_verse_range = false;
                }
                
                /// Return the small function to call update_verse_range_delayed().
                return function ()
                {
                    /// Is it not already looking for the verse range?
                    if (!looking_up_verse_range) {
                        looking_up_verse_range = true;
                        
                        /// Run update_verse_range_delayed() after a brief delay.
                        window.setTimeout(update_verse_range_delayed, lookup_range_speed);
                    }
                };
            }());
            
            
            /**
             * Scroll the page to a specific point.
             *
             * @param y      (number)             The Y position to scroll to (i.e, vertical position).
             * @param x      (number)  (optional) The X position to scroll to (i.e, horizontal position).  If left undefined, it will maintin the current Y position.
             * @param smooth (boolean) (optional) Whether or not to scroll smoothly.  By default, or if fasely, it will scroll instantaneously.
             * @note  The y value is first because x value is rarely used.
             * @todo  Indicate where used.
             */
            function scrollViewTo(y, x, smooth)
            {
                /// A small amount of extra padding is added just to ensure that the padding element will be large enough.
                var extra_padding = 10,
                    padding_el,
                    padding_interval,
                    pixels_needed;
                
                if (typeof x == "undefined") {
                    x = window.pageXOffset;
                }
                
                if (!smooth) {
                    scroll_pos = y;
                    
                    /// Is the scroll position not the top of the page.
                    if (scroll_pos > 0) {
                        /// Calculate how many pixels (if any) need to be added in order to be able to scroll to the specified position.
                        /// If the scroll position is near the bottom (e.g., Revelation 22:21 or Proverbs 28:28) there needs to be extra space on the bottom.
                        pixels_needed = doc_docEl.clientHeight - (document.body.clientHeight - scroll_pos);
                        if (pixels_needed > 0) {
                            padding_el              = document.createElement("div");
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
                } else {
                    ///TODO: Do smooth scrolling.
                }
            }
            
            
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
            
            ///NOTE: get_verse_at_position is temporary.
            return {
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
                    page.innerHTML                = "";
                },
                get_verse_at_position: get_verse_at_position, /// TEMP
                update_verse_range:    update_verse_range,
                reached_bottom: function ()
                {
                    has_reached_bottom = true;
                },
                reached_top: function ()
                {
                    has_reached_top = true;
                },
                reset_scroll: function ()
                {
                    has_reached_bottom = false;
                    has_reached_top    = false;
                },
                scrollViewTo: scrollViewTo
            };
        }());
        
        /****************************
        * End of Scrolling Closure *
        ****************************/

        
        query_manager = (function ()
        {
            var ajax_additional = BF.create_simple_ajax(),
                ajax_previous   = BF.create_simple_ajax();
            
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
                    if (options.direction == previous) {
                        query_str += "&d=" + options.direction;
                        
                    /// Is it possible that this query does not begin at a paragraph break?
                    ///NOTE: This can only be initial verse lookups (which are always additional; hence the else if) that do not start at verse 1 or 0.
                    } else if (options.initial_query && options.in_paragraphs && options.verse % 1000 > 1) {
                        query_str += "&f=1";
                    }
                } else {
                    query_str += "&q=" + options.query;
                    
                    if (options.verse) {
                        query_str += "&s=" + options.verse;
                    }
                }
                
                return query_str;
            }
            
            return (function ()
            {
                function handle_new_verses(data, options)
                {
                    /// Data object format:
                    /// i Word IDs      (array)  (optional) An array containing word IDs indicating which words should be highlighted in grammatical searches
                    /// n Verse Numbers (array)             An array containing verse IDs for each verse returned
                    /// p Paragraphs    (array)             An array of 1's and 0's corresponding to n array indicating which verses are at the beginning of a paragraph
                    /// t Total         (number)            The total number of verses returned
                    /// v Verse HTML    (array)             An array containing the HTML of the verses returned
                    var type          = options.type,
                        b_tag,
                        count,
                        direction     = options.direction,
                        i,
                        total         = data.t,
                        paragraphs    = data.p,
                        verse_numbers = data.n,
                        verse_html    = data.v,
                        word_ids      = data.i;
                    
                    /// Where there any verses returned?
                    ///FIXME: Lookups always return 1 for success instead of the number of verses.  See functions/verse_lookup.php.
                    if (total) {
                        write_verses(type, direction, verse_numbers, verse_html, paragraphs, options.in_paragraphs);
                        
                        if (type != verse_lookup) {
                            ///TODO: Implement
                            ///TODO: Determine if it should send an object?
                            ///NOTE: Only standard and mixed searches need verse_html data to be sent.
                            options.highlight((type != grammatical_search ? verse_html.join("") : ""), word_ids);
                        }
                        
                        /// Indicate to the user that more content may be loading, and check for more content.
                        ///TODO: Make a separate function for this.
                        if (direction === additional && verse_numbers[verse_numbers.length - 1] < 66022021) {
                            bottomLoader.style.visibility = "visible";
                            content_manager.add_content_if_needed(direction);
                        }
                        if ((direction == previous || options.initial_query) && verse_numbers[0] > 1001001) {
                            topLoader.style.visibility    = "visible";
                            content_manager.add_content_if_needed(previous);
                        }

                    } else {
                        ///TODO: Make a separate function for this.
                        if (direction === additional) {
                            /// The user has reached the bottom by scrolling down (either RETURNED_SEARCH or RETURNED_VERSES_PREVIOUS), so we need to hide the loading graphic.
                            /// This is cause by scrolling to Revelation 22:21 or end of search or there were no results.
                            content_manager.reached_bottom();
                            bottomLoader.style.visibility = "hidden";
                        }
                        ///BUG: there can be no results if looking up beyond rev 22.21 (e.g., rev 23). FIX: Prevent lookingup past 66022021
                        if (direction == previous || options.initial_query) {
                            /// The user has reached the top of the page by scrolling up (either Genesis 1:1 or there were no search results), so we need to hide the loading graphic
                            content_manager.reached_top();
                            topLoader.style.visibility    = "hidden";
                        }
                    }
                    
                    
                }
                
                return {
                    query_additional: function ()
                    {
                        
                    },
                    query: function (options)
                    {
                        ///TODO: At some point, there needs to be feedback to the user that the query is taking place.  Maybe have something in the infoBar.
                        
                        /// Stop any old requests since we have a new one.
                        ajax_additional.abort();
                        ajax_previous.abort();
                        
                        /// Initial queries may need special options (e.g., the f variable (to find paragraph breaks) is only passed on initial queries).
                        options.initial_query = true;
                        /// Initial queries are always additional.
                        options.direction     = additional;
                        /// Since this settings can be changed by the user at run time, it must be retrieved before each query.
                        options.in_paragraphs = settings.view.in_paragraphs.get();
                        
                        ajax_additional.query("post", "query.php", create_query_message(options), function (data)
                        {
                            /// On Success
                            ///TODO: What should be done from here?  Should it be sent to a function, like handle_new_verses()?
                            ///TODO: Removed unnecessary slashes from verse data.
                            handle_new_verses(BF.parse_json(data), options);
                        });
                    },
                    query_previous: function ()
                    {
                        
                    }
                };
            }());
        }());
        
        run_new_query = (function ()
        {
            /**
             * Figure out what type of search is being attempted by the user.
             *
             * @example determine_search_type("God & love");							/// Returns [{type: standard_search,    query: '"God & love"'}]
             * @example determine_search_type("love AS NOUN");							/// Returns [{type: grammatical_search, query: '["love",[[4,1]],[0]]'}]
             * @example determine_search_type("go AS IMPERATIVE, -SINGULAR");			/// Returns [{type: grammatical_search, query: '["go",[[9,3],[5,1]],[0,1]]'}]
             * @example determine_search_type("go* AS PASSIVE, -PERFECT,INDICATIVE");	/// Returns [{type: grammatical_search, query: '["go*",[[8,3],[7,5],[9,1]],[0,1,0]]'}]
             * @example determine_search_type("* AS RED, IMPERATIVE");					/// Returns [{type: grammatical_search, query: '["",[[3,1],[9,3]],[0,0]]'}]
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
                if ((split_pos = search_terms.indexOf(BF.lang.grammar_marker)) != -1) {
                    ///TODO: Determine what is better: a JSON array or POST/GET string (i.e., word1=word&grammar_type1=1&value1=3&include1=1&...).
                    ///NOTE: A JSON array is used to contain the information about the search.
                    ///      JSON format: '["WORD",[[GRAMMAR_TYPE1,VALUE1],[...]],[INCLUDE1,...]]'
                    
                    /// Get the search term (e.g., in "go AS IMPERATIVE, -SINGULAR", grammar_search_term = "go").
                    grammar_search_term = search_terms.slice(0, split_pos);
                    
                    /// Is the user trying to find all words that match the grammatical attributes?
                    if (grammar_search_term == "*") {
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
                    do {
                        /// Find where the attributes separate (e.g., "NOUN, GENITIVE" would separate at character 4).
                        split_pos = grammar_attributes.indexOf(BF.lang.grammar_separator, split_start);
                        /// Trim leading white space.
                        if (grammar_attributes.slice(split_start, split_start + 1) === " ") {
                            ++split_start;
                        }
                        /// Is this grammatical feature to be excluded?
                        if (grammar_attributes.slice(split_start, split_start + 1) == "-") {
                            /// Skip the hyphen so that we just get the grammatical word (e.g., "love AS -NOUN" we just want "NOUN").
                            ++split_start;
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
                    } while (true);
                }
                
                /// The search is just a standard search, so just return the type and the original query.
                return [
                    {
                        query: window.encodeURIComponent(search_terms),
                        type:  standard_search
                    }
                ];
            }
            
            return function (raw_query)
            {
                /// Step 1: Prepare string and check to see if we need to search (not empty)
                
                ///NOTE: Whitespace must be trimmed after this function because it may create excess whitespace.
                var options = {raw_query: raw_query},
                    query   = BF.lang.prepare_search(raw_query).trim(),
                    verse_id;
                
                if (query === "") {
                    /// TODO: Determine what else should be done to notifiy the user that no query will be preformed.
                    return;
                }
                
                /// Step 2: Determine type of query
                
                /// Determine if the user is preforming a search or looking up a verse.
                /// If the query is a verse reference, a number is returned, if it is a search, then FALSE is returned.
                verse_id = BF.lang.determine_reference(query);
                
                /// Is the query a verse lookup?
                if (verse_id !== false) {
                    /// Is the lookup verse possibly the beginning of a Psalm with a title?  If so, we need to start at the title, so go back one verse.
                    ///NOTE: To get the titles of Psalms, select verse 0 instead of verse 1.
                    if (verse_id > 19003000 && verse_id < 19145002 && verse_id % 1000 === 1) {
                        --verse_id;
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
                        options.query = query;
                        options.type  = mixed_search;
                    } else {
                        ///NOTE: If it is not mixed, then there is currently only one array element, so get the variables out of it.
                        options.query = query[0].query;
                        options.type  = query[0].type;
                    }
                }
                
                /// Step 3: Request results
                
                /// Prepare the initial query, create functions to handle additional and previous queries.
                query_manager.query(options);
                
                
                
                /// Step 4: Prepare for new results (clear page(?), prepare highlighter if applicable)
                
                ///NOTE: Do we need to keep track of the last book?  I.e., last_book = 0;
                content_manager.clear_scroll();
                
                ///TODO: Determine if this should be done by a separate function.
                document.title = raw_query + " - " + BF.lang.app_name;
                
                /// Stop filling in the explanation text so that the user can make the query box blank.  (Text in the query box can be distracting while reading.)
                q_obj.onblur = function () {};
                
                /// Was the query a search?  Searches need to have the highlighter function prepared for the incoming results.
                if (options.type != verse_lookup) {
                    ///TODO: Implement
                    options.highlight = BF.prepare_highlighter(query);
                }
                
                /// Is there any chance that there are verses above the starting verse?
                /// Or, in other words, is the query a search or a verse lookup starting at Genesis 1:1?
                ///NOTE: In the future, it may be possible for searches to start midway.
                if (options.type != verse_lookup || options.verse == "1001001") {
                    /// There is no reason to look for previous verses when the results start at the beginning.
                    content_manager.reached_top();
                }
            };
        }());
        
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
     
    /// Capture form submit event.
    searchForm.onsubmit = function ()
    {
        var raw_query = q_obj.value;
        
        /// Is the query is the same as the explanation?  If so, do not submit the query; just draw attention to the query box.
        if (raw_query == BF.lang.query_explanation) {
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
        if (this.value == BF.lang.query_explanation) {
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
        var end		= this.length,
            start	= -1;
        while (this.charCodeAt(--end) < 33) {}
        while (++start < end && this.charCodeAt(start) < 33) {}
        return this.slice(start, end + 1);
    };
}


/**
 * Capture certain key events, bringing focus to the query box.
 *
 * @param  e (object) The event object (normally supplied by the browser).
 * @return NULL.
 * @note   Called on all keydown events.
 */
document.onkeydown = function (e)
{
    var activeEl = document.activeElement,
        keyCode;
    
    /// Are there input boxes selected (not including images)?  If so, this function should not be executed.
    ///NOTE: In the future, other elements, such as, TEXTAREA or buttons, may also need to be detected.
    if (activeEl.tagName == "INPUT" && activeEl.type != "image") {
        return;
    }
    
    /// Get the global event object for IE compatibility.
    /*@cc_on
        e = event;
    @*/
    
    keyCode = e.keyCode;
    
    /// If a special key is also pressed, do not capture the stroke.
    ///TODO: Determine if this works on Mac with the Command key.
    ///NOTE: It may be that the Command key is keyCode 91 and may need to be caught by another keydown event.
    ///NOTE: The meta key does not seem to be detected; this may need me manually checked for, like for the Mac.
    ///NOTE: However, it does want to grab the stroke if the user is pasting.  keyCode 86 == "V," which is the standard shortcut for Paste.
    if ((e.ctrlKey && keyCode != 86) || e.altKey || e.metaKey) {
        return;
    }
    
    /// Is the user pressing a key that should probably be entered into the input box?  If so, bring focus to the query box so that the keystrokes will be captured.
    ///NOTE:  8 = Backspace
    ///      13 = Enter
    ///      32 = Space
    ///   48-90 = Alphanumeric
    ///  96-111 = Numpad keys
    /// 186-254 = Punctuation
    ///TODO: Determine if capturing Backspace and/Space is confusing because they have alternate functions (the back button and page down, respectively).
    ///      One possible solution is to allow Shift, Ctrl, or Alt + Backspace or Space to be the normal action.
    if (keyCode == 8 || keyCode == 13 || keyCode == 32 || (keyCode > 47 && keyCode < 91) || (keyCode > 95 && keyCode < 112) || (keyCode > 185 && keyCode < 255)) {
        ///TODO: Determine which input box to select when split screen mode is implemented.
        ///      One option would be to have a value in the global BF object.
        document.getElementById("q0").focus();
    }
};

///TODO: Move browser specific code to external files.

/******************************
 * Start WebKit specific code *
 ******************************/

/// Is the browser Chromium or WebKit based?
if (BF.is_WebKit) {
    /// Inject CSS to make the drop caps aligned with the second line of text and add an inset shadow to the input box.
    ///NOTE: Needed for at least Chromium 8.
    ///TODO: Determine if this would be better as a function.
    document.body.appendChild(document.createElement("style").appendChild(document.createTextNode(".first_verse:first-letter, .first_paragraph:first-letter { padding-top: 5px; } .queryInput { background: url('data:image/gif;base64,R0lGODlhAQADAKEDAN3d3eTk5PLy8v///yH5BAEKAAMALAAAAAABAAMAAAICRFQAOw==') top repeat-x rgba(255, 255, 255, .5); }")).parentNode);
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
 * @param	s		(regexp || string)	The regular expression or string with which to break the string.
 * @param	limit	(int) (optional)	The number of times to split the string.
 * @return	Returns an array of the string now broken into pieces.
 * @see		http://blog.stevenlevithan.com/archives/cross-browser-split
 * @todo    Determine if IE9 still needs this.
 */
///NOTE: The following conditional compilation code blocks only executes in IE.
/*@cc_on
    String.prototype._$$split = String.prototype._$$split || String.prototype.split;
    String.prototype.split    = function (s, limit)
    {
        var flags,
            emptyMatch,
            i,
            j,
            lastLastIndex,
            lastLength,
            match,
            origLastIndex,
            output,
            s2;
        
        if (!(s instanceof RegExp)) {
            return String.prototype._$$split.apply(this, arguments);
        }
        
        flags			= (s.global ? "g" : "") + (s.ignoreCase ? "i" : "") + (s.multiline ? "m" : "");
        s2				= new RegExp("^" + s.source + "$", flags);
        output			= [];
        origLastIndex	= s.lastIndex;
        lastLastIndex	= 0;
        i = 0;
        
        if (typeof limit == "undefined" || +limit < 0) {
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
                --s.lastIndex;
            }
            if (s.lastIndex > lastLastIndex) {
                if (match.length > 1) {
                    match[0].replace(s2, function ()
                    {
                        for (j = 1; j < arguments.length - 2; ++j) {
                            if (typeof arguments[j] == "undefined") {
                                match[j] = undefined;
                            }
                        }
                    });
                }
                
                output = output.concat(this.slice(lastLastIndex, match.index));
                if (match.length > 1 && match.index < this.length) {
                    output = output.concat(match.slice(1));
                }
                lastLength		= match[0].length;
                lastLastIndex	= s.lastIndex;
            }
            if (emptyMatch) {
                ++s.lastIndex;
            }
        }
        output = lastLastIndex === this.length ? (s.test("") && !lastLength ? output : output.concat("")) : (limit ? output : output.concat(this.slice(lastLastIndex)));
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
BF.create_viewport(document.getElementById("viewPort0"), document.getElementById("searchForm0"), document.getElementById("q0"), document.getElementById("scroll0"), document.getElementById("infoBar0"), document.getElementById("topLoader0"), document.getElementById("bottomLoader0"), document.documentElement);
