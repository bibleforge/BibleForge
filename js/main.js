/**
 * BibleForge
 *
 * @date	10-30-08
 * @version	0.2 alpha
 * @link	http://BibleForge.com
 * @license	Reciprocal Public License 1.5 (RPL1.5)
 * @author	BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

/**
 * Initialize the BibleForge environment.
 *
 * This function is used to house all of the code used by BibleForge,
 * expect for language specific code, which is stored in js/lang/LOCALE.js.
 *
 * @param	viewPort		(object) The HTML object which encapsulates all of the other objects.
 * @param	searchForm		(object) The <form> object which contains the text box and button.
 * @param	q_obj			(object) The <input> object the user types into.
 * @param	infoBar			(object) The HTML object that displays information about the lookups and searches.
 * @param	topLoader		(object) The HTML object which displays the loading image above the text.
 * @param	bottomLoader	(object) The HTML object which displays the loading image below the text.
 * @param	doc_docEl		(object) The document.documentElement element (the HTML element).
 * @return	NULL.  Some functions are attached to events and the rest accompany them via closure.
 */
(function (viewPort, searchForm, q_obj, page, infoBar, topLoader, bottomLoader, doc_docEl)
{	
    var create_viewport = arguments.callee,
        
        /// Query type "constants"
        verse_lookup			= 1,
        mixed_search			= 2,
        standard_search			= 3,
        grammatical_search		= 4,
        
        /// Direction "constants"
        additional	= 1,
        previous	= 2,
        
        highlight_limit				= 20,	/// Currently, we limit the unique number of search words to highlight.
        highlight_re				= [],	/// Highlighter regex array
        last_book					= 0,	/// The number of the last book of the Bible that was returned
        last_search					= "",
        last_search_encoded			= "",	/// A cache of the last search query
        last_type,							/// The type of lookup performed last (verse_lookup || mixed_search || standard_search || grammatical_search)
        waiting_for_first_search	= false,
        
        /// Ajax objects
        ajax_additional	= new XMLHttpRequest(),
        ajax_previous	= new XMLHttpRequest(),
        
        /// Verse variables
        /// top_verse and bottom_verse are the last verses displayed on the screen so that the same verse is not displayed twice when more search data is returned (currently just used for grammatical_search).
        bottom_verse	= 0,
        top_verse		= 0,
        
        /// top_id and bottom_id are the last ids (either verse or word id) returned from a search or verse lookup.
        /// These are the same as bottom_id and top_id for verse_lookup and standard_search since these deal with entire verses as a whole, not individual words.
        /// For grammatical_search, the last word id is stored.
        bottom_id,
        top_id,
        
        /// Cache
        cached_count_bottom				= 0,
        cached_count_top				= 0,
        cached_verses_bottom			= [],
        cached_verses_top				= [],
        
        /// Scrolling
        ///TODO: Determine if these can be placed in the scrolling closure.
        scroll_maxed_bottom				= false,
        scroll_maxed_top				= true,
        scroll_pos						= 0,
        
        /// Objects
        content_manager;
    
    /// Simple Event Registration
    /// Capture form submit event.
    searchForm.onsubmit = prepare_new_search;
    
    
    /*******************************
     * Start of Suggestion Closure *
     *******************************/
    
    /// Create suggest and attach it to the keypress event.
    ///TODO: Determine if using closure here is helpful.
    /**
     *
     */
    q_obj.onkeypress = (function ()
    {
        /// Auto Suggest variables
        var ajax_suggestions		= new XMLHttpRequest(),
            last_suggestion_text	= "",
            suggest_cache			= {},
            suggest_delay			= 250,
            suggest_timeout;
        
        /**
         * Gets the suggestion from cache or the server.
         *
         * @return	NULL.
         * @note	Called by the anonymous function returned into the onkeypress event via setTimeout().
         */
        function request_suggestions()
        {
            if (q_obj.value == last_suggestion_text) {
                return;
            }
            ///TODO: Determine if there is a better way to write this code so that we don't need to use q_obj twice.
            last_suggestion_text = q_obj.value.trim();
            
            if (last_suggestion_text == "") {
                return;
            }
            
            /// Stop a previous, unfinished request.
            if (ajax_suggestions.readyState % 4) {
                ajax_suggestions.abort();
            }
            
            /// Check to see if we already have this in the cache.
            /// Do we need to request the suggestions from the server?
            if (typeof suggest_cache[last_suggestion_text] == "undefined") {
                post_to_server("suggest.php", "q=" + encodeURIComponent(last_suggestion_text), ajax_suggestions, handle_suggest);
            } else {
                show_suggestions(suggest_cache[last_suggestion_text]);
            }
        }
        
        /**
         * Display suggestions to the users.
         *
         * @param	res	(array)	JSON array from the server.
         *						Array format: ???
         * @note	Called by post_to_server() after an Ajax request.
         */
        function handle_suggest(res)
        {
            
        }
        
        
        /**
         * Handle keyboard events (onkeypress).
         *
         * This function is called as the user types in the input box.
         * It then analyzes the type of key strokes and determines if
         * BibleForge needs to look up suggestions for the user.
         *
         * @param	event (event object) (optional) The event object (Mozilla/Safari/Opera).
         * @return	TRUE. ///TODO: Determine if this is the correct value to return.
         * @note	This function is returned into the global onkeypress event.
         */
        return function (e)
        {
            if (!e) {
                e = event; /// IE does not send the event object.
            }
            
            /// keyCode meanings:
            /// 0	(any letter)
            ///	8	backspace
            ///	13	enter
            /// 38	up
            /// 40	down
            switch (e.keyCode) {
            case 38:
                ///TODO: Move the highlighting up.
                break;
            case 40:
                ///TODO: Move the highlighting down.
                break;
            default:
                clearTimeout(suggest_timeout);
                suggest_timeout = setTimeout(request_suggestions, suggest_delay);
                break;
            }
            return true;
        };
    }());
    
    
    /******************************
     * Start of Scrolling Closure *
     ******************************/
    
    content_manager = (function ()
    {
        var buffer_add						= 1000,
            buffer_rem						= 10000,
            checking_excess_content_bottom	= false,
            checking_excess_content_top		= false,
            looking_up_verse_range			= false,
            lookup_delay					= 200,
            lookup_range_speed				= 300,	/// In milliseconds
            lookup_speed_scrolling			= 50,
            lookup_speed_sitting			= 100,
            remove_content_bottom_timeout,
            remove_content_top_timeout,
            remove_speed					= 3000,
            scroll_check_count				= 0;
        
        /**
         * The onscroll event.
         *
         * When the page scrolls this figures out the direction of the scroll and
         * calls specific functions to determine whether content should be added or removed.
         *
         * @return	NULL.  May call other functions via setTimeout().
         * @note	Called when the window scrolls.
         * @note	Set by  the onscroll event.
         */
        function scrolling()
        {
            /// Trick IE into understanding pageYOffset.
            ///NOTE: pageYOffset is a browser-created, global variable.
            /*@cc_on
                pageYOffset = doc_docEl.scrollTop;
            @*/
            var new_scroll_pos	= pageYOffset,
                scrolling_down;
            
            if (new_scroll_pos == scroll_pos) {
                /// IE/Opera sometimes don't update page.scrollTop until after this function is run.
                /// Mozilla/WebKit can get stuck here too.
                if (++scroll_check_count < 10) {
                    setTimeout(scrolling, 30);
                } else { /// Stop it if it is stuck looping.
                    scroll_check_count = 0;
                }
                return null;
            }
            scroll_check_count = 0;
            
            update_verse_range();
            
            scrolling_down = (new_scroll_pos > scroll_pos);
            
            /// This keeps track of the current scroll position so we can tell the direction of the scroll.
            scroll_pos = new_scroll_pos;
            
            /// Don't look up more data until the first results come.
            if (waiting_for_first_search) {
                return null;
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
                clearTimeout(remove_content_top_timeout);
                remove_content_top_timeout = setTimeout(remove_excess_content_top, remove_speed);
            }
            if (checking_excess_content_bottom) {
                clearTimeout(remove_content_bottom_timeout);
                remove_content_bottom_timeout = setTimeout(remove_excess_content_bottom, remove_speed);
            }
        }
        
        
        ///TODO: Determine if remove_excess_content_top and remove_excess_content_bottom can be combind.
        /**
         * Remove content that is past the top of screen and store in cache.
         *
         * @example	remove_excess_content_top();
         * @return	NULL.  Removes content from the page if required.
         * @note	Called by scrolling() via setTimeout().
         */
        function remove_excess_content_top()
        {
            var child			= page.firstChild,
                child_height;
            
            if (child === null) {
                return null;
            }
            
            ///NOTE: Mozilla ignores .clientHeight, .offsetHeight, .scrollHeight for some objects (not <div> however) when in standards mode (i.e., a doctype is present).
            ///      If Mozilla has problems in the future, you can use this as a replacement:
            ///      child_height = parseInt(getComputedStyle(child, null).getPropertyValue("height"));
            
            ///NOTE: Opera wrongly subtracts the scroll position from .offsetTop.
            
            child_height = child.clientHeight;
            
            ///NOTE: Mozilla also has scrollMaxY, which is slightly different from document.documentElement.scrollHeight (document.body.scrollHeight should work too).
            
            /// Is the object in the remove zone, and is its height less than the remaining space to scroll to prevent jumping?
            if (child_height + buffer_rem < scroll_pos && child_height < doc_docEl.scrollHeight - scroll_pos - doc_docEl.clientHeight) {
                /// Store the content in the cache, and then add 1 to the outer counter variable so that we know how much cache we have.
                cached_verses_top[cached_count_top++] = child.innerHTML;
                ///TODO: Determine if setting the display to "none" actually helps at all.
                /// Remove quickly from the page.
                child.style.display = "none";
                /// Calculate and set the new scroll position.
                /// Because content is being removed from the top of the page, the rest of the content will be shifted upward.
                /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was removed.
                ///NOTE: scrollTo() is a browser-created, global function.
                ///NOTE: pageYOffset is a browser-created, global variable.
                scrollTo(0, scroll_pos = (pageYOffset - child_height));
                
                page.removeChild(child);
                
                /// Indicates to the user that content will load if they scroll to the top of the screen.
                topLoader.style.visibility = "visible";
                
                /// Check again soon for more content to be removed.
                remove_content_top_timeout = setTimeout(remove_excess_content_top, remove_speed);
            } else {
                checking_excess_content_top = false;
            }
        }
        
        
        /**
         * Remove content from below the screen and store in cache.
         *
         * @example	remove_excess_content_bottom();
         * @return	NULL.  Removes content from the page if required.
         * @note	Called by scrolling() via setTimeout().
         */
        function remove_excess_content_bottom()
        {
            var child			= page.lastChild,
                child_position,
                page_height;
            
            if (child === null) {
                return null;
            }
            
            child_position	= child.offsetTop;
            page_height		= doc_docEl.clientHeight;
            
            /// Is the element is in the remove zone?
            if (child_position > scroll_pos + page_height + buffer_rem) {
                /// Store the content in the cache, and then add 1 to the outer counter variable so that we know how much cache we have.
                cached_verses_bottom[cached_count_bottom++] = child.innerHTML;
                
                page.removeChild(child);
                
                /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                ///NOTE: scrollTo() is a browser-created, global function.
                /*@cc_on
                    scrollTo(0, scroll_pos);
                @*/
                /// End execution to keep the checking_content_top_interval running because there might be even more content that should be removed.
                bottomLoader.style.visibility = "visible";
                
                /// Check again soon for more content to be removed.
                remove_content_bottom_timeout = setTimeout(remove_excess_content_bottom, remove_speed);
            } else {
                checking_excess_content_bottom = false;
            }
        }
        
        
        /**
         * Add content to bottom of the page (off the screen)
         *
         * @example	add_content_bottom_if_needed();
         * @return	NULL.  Adds content to the page if needed.
         * @note	Called by scrolling() via setTimeout().
         */
        function add_content_bottom_if_needed()
        {
            var child			= page.lastChild,
                child_position,
                newEl,
                page_height;
            
            if (child === null) {
                return null;
            }
            
            child_position	= child_position = child.offsetTop + child.clientHeight;
            page_height		= page_height = doc_docEl.clientHeight;
            /// Is the user scrolling close to the bottom of the page?
            if (child_position < scroll_pos + page_height + buffer_add) {
                /// Can the content be grabbed from cache?
                if (cached_count_bottom > 0) {
                    newEl = document.createElement("div");
                    /// First subtract 1 from the outer counter variable to point to the last cached passage, and then retrieve the cached content.
                    newEl.innerHTML = cached_verses_bottom[--cached_count_bottom];
                    ///NOTE: This is actually works like insertAfter() (if such a function existed).
                    ///      By using "null" as the second parameter, it tells it to add the element to the end.
                    page.insertBefore(newEl, null);
                    
                    /// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
                    ///NOTE: scrollTo() is a browser-created, global function.
                    /*@cc_on
                        scrollTo(0, scroll_pos);
                    @*/
                    /// Better check to see if we need to add more content.
                    setTimeout(add_content_bottom_if_needed, lookup_speed_scrolling);
                } else {
                    /// Did the user scroll all the way to the very bottom?  (If so, then there is no more content to be gotten.)
                    if (scroll_maxed_bottom) {
                        bottomLoader.style.visibility = "hidden";
                        return null;
                    }
                    /// Get more content.
                    run_search(additional);
                }
            }
        }
        
        
        /**
         * Add content to top of the page (off the screen)
         *
         * @example	setTimeout(add_content_top_if_needed, lookup_speed_scrolling);
         * @return	NULL.  Adds content to the page if needed.
         * @note	Called by add_content_if_needed() via setTimeout().
         */
        function add_content_top_if_needed()
        {
            var child			= page.firstChild,
                child_height,
                child_position,
                newEl;
            
            if (child === null) {
                return null;
            }
            
            child_height = child.clientHeight;
            
            child_position = child_height;
            
            /// Is the user scrolling close to the top of the page?
            if (child_position + buffer_add > scroll_pos) {
                /// Can the content be grabbed from cache?
                if (cached_count_top > 0) {
                    newEl = document.createElement("div");
                    
                    /// First subtract 1 from the outer counter variable to point to the last cached passage, and then retrieve the cached content.
                    newEl.innerHTML = cached_verses_top[--cached_count_top];
                    
                    page.insertBefore(newEl, child);
                    
                    /// The new content that was just added to the top of the page will push the other contents downward.
                    /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
                    ///NOTE: scrollTo() is a browser-created, global function.
                    ///NOTE: pageYOffset is a browser-created, global variable.
                    scrollTo(0, scroll_pos = (pageYOffset + newEl.clientHeight));
                    
                    /// Check to see if we need to add more content.
                    add_content_if_needed(previous);
                } else {
                    /// Did the user scroll all the way to the very top?  (If so, then there is no more content to be gotten.)
                    if (scroll_maxed_top) {
                        topLoader.style.visibility = "hidden";
                        return null;
                    }
                    /// Get more content.
                    run_search(previous);
                }
            }
        }
        
        
        /**
         * Finds and displays the range of verses visible on the screen.
         *
         * Find the verse that is at the top of the page and at the bottom of the page window and
         * display that range on the page and change the page title to indicate the verse range as well.
         *
         * @example	setTimeout(find_current_range, lookup_range_speed);
         * @return	NULL.  The page is modified to reflect the verse range.
         * @note	Called by scrolling(), resizing(), write_verses(), or itself via setTimeout().
         * @note	This function should be called every time the page is resized or scrolled or when visible content is added.
         */
        function find_current_range()
        {	
            ///TODO: Determine if there is a better way to calculate the topBar offset.
            var b1,
                b2,
                bottom_pos			= scroll_pos + doc_docEl.clientHeight - 14,
                bottom_verse_block,
                c1,
                c2,
                new_title,
                ref_range,
                top_pos				= scroll_pos + topLoader.offsetHeight + 8,
                top_verse_block,
                v1,
                v2,
                verse1_el,
                verse1,
                verse2_el,
                verse2;
            
            /// Allow for this function to be called again via setTimeout().  See scrolling().
            looking_up_verse_range = false;
            
            top_verse_block = find_element_at_scroll_pos(top_pos, page);
            
            /// Is the top verse block not found?
            if (top_verse_block === null) {
                ///NOTE: There appears to be no verses displayed on the screen.
                ///      Since they may still be being retrieved, so run this function again a little later.
                looking_up_verse_range = true;
                setTimeout(find_current_range, lookup_range_speed);
                return null;
            }
            
            bottom_verse_block = find_element_at_scroll_pos(bottom_pos, null, top_verse_block);
            
            /// Is the bottom verse block not found?
            if (bottom_verse_block === null) {
                ///NOTE: There are no verses at the bottom of the screen.
                ///      Since they may still be being retrieved, so run this function again a little later.
                looking_up_verse_range = true;
                setTimeout(find_current_range, lookup_range_speed);
                return null;
            }
            
            /// Find the verse elements.
            verse1_el = find_element_at_scroll_pos(top_pos, top_verse_block);
            verse2_el = find_element_at_scroll_pos(bottom_pos, bottom_verse_block);
            
            /// Are either of the verses not found?
            if (verse1_el === null || verse2_el === null) {
                ///NOTE: It is possible for some padding to separate the verses.
                ///      This is probably a temporary issue, so run this function again a little later.
                looking_up_verse_range = true;
                setTimeout(find_current_range, lookup_range_speed);
                return null;
            }
            
            /// parseInt() is used to keep the number and remove the trailing string from the id.  See write_verses().
            verse1 = parseInt(verse1_el.id);
            v1 = verse1 % 1000;
            c1 = ((verse1 - v1) % 1000000) / 1000;
            b1 = (verse1 - v1 - c1 * 1000) / 1000000;
            verse2 = parseInt(verse2_el.id);
            v2 = verse2 % 1000;
            c2 = ((verse2 - v2) % 1000000) / 1000;
            b2 = (verse2 - v2 - c2 * 1000) / 1000000;
            
            /// The titles in the book of Psalms are referenced as verse zero (cf. Psalm 3).
            v1 = v1 === 0 ? BF_LANG.title : v1;
            v2 = v2 === 0 ? BF_LANG.title : v2;
            
            ///NOTE: \u2013 is Unicode for the en dash (–) (HTML: &ndash;).
            ///TODO: Determine if the colons should be language specified.
            /// Are the books the same?
            if (b1 == b2) {
                /// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
                b1 = b1 == 19 ? BF_LANG.psalm : BF_LANG.books_short[b1];
                /// Are the chapters the same?
                if (c1 == c2) {
                    /// Are the verses the same?
                    if (v1 == v2) {
                        ref_range = b1 + " " + c1 + ":" + v1;
                    } else {
                        ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + v2;
                    }
                } else {
                    ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + c2 + ":" + v2;
                }
            } else {
                /// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
                b1 = b1 == 19 ? BF_LANG.psalm : BF_LANG.books_short[b1];
                b2 = b2 == 19 ? BF_LANG.psalm : BF_LANG.books_short[b2];
                
                ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + b2 + " " + c2 + ":" + v2;
            }
            
            /// last_type is set in prepare_new_search().
            /// The verse range is displayed differently based on the type of search (i.e., a verse look up or a regular search).
            if (last_type == verse_lookup) {
                new_title = ref_range + " - " + BF_LANG.app_name;
            } else {
                new_title = last_search + " (" + ref_range + ") - " + BF_LANG.app_name;
            }
            
            /// Is the new verse range the same as the old one?
            /// If they are the same, updating it would just waste resources.
            if (document.title != new_title) {
                document.title = new_title;
                
                /// Display the verse range on the page if looking up verses.
                ///FIXME: There should be a variable that shows the current view mode and not rely on last_type.
                if (last_type == verse_lookup) {
                    ///TODO: Find a better way to clear infoBar than innerHTML.
                    infoBar.innerHTML = "";
                    infoBar.appendChild(document.createTextNode(ref_range));
                }
            }
            
            return null;
        }
        
        
        /**
         * Find an element that is within a certain Y position on the page.
         *
         * @example	element = find_element_at_scroll_pos(scroll_pos, page);
         * @param	the_pos		(number) The vertical position on the page.
         * @param	parent_el	(object) The DOM element to search inside of.
         * @return	DOM element that is within the specified position of the page.
         * @note	Called by find_current_range().
         * @note	This is a helper function to find_current_range().
         */
        function find_element_at_scroll_pos(the_pos, parent_el, el)
        {
            var el_offset_height,
                el_offset_top,
                el_start_at,
                looked_next,
                looked_previous;
            
            /// Is the starting element unknown?
            if (!el) {
                /// Make an educated guess as to which element to start with to save time.
                el_start_at = Math.round(parent_el.childNodes.length * (the_pos / doc_docEl.scrollHeight));
                if (el_start_at < 1) {
                    el_start_at = 1;
                }
                el = parent_el.childNodes[el_start_at - 1];
            } else {
                /// We may need the parent_el if the_pos is below all of the elements.
                parent_el = el.parentNode;
            }
            
            /// Were no elements found?  (If so, then there is nothing to do.)
            if (!el) {
                return null;
            }
            
            looked_next		= false;
            looked_previous	= false;
            
            do {
                el_offset_top		= el.offsetTop;
                el_offset_height	= el.offsetHeight + el_offset_top;
                
                /// Is the element somewhere between the position in question?
                if (the_pos >= el_offset_top && the_pos <= el_offset_height) {
                    /// The element was found.
                    return el;
                } else {
                    /// Is the position in question lower?
                    if (the_pos > el_offset_top) {
                        el			= el.nextSibling;
                        looked_next	= true;
                    } else {
                        el				= el.previousSibling;
                        looked_previous	= true;
                    }
                    /// Is it stuck in an infinite loop?  (If so, then give up.)
                    if (looked_next && looked_previous) {
                        return null;
                    }
                }
            } while (el !== null);
            
            /// Was the position in question to high for all of the elements?
            if (looked_next) {
                /// If there are no elements left (e.g., by scrolling all the way to the bottom) return the last element.
                return parent_el.lastChild;
            }
            
            ///TODO: Determine if we should return parent_el.firstChild if looked_previous or if that might cause bugs.
            return null;
        }
        
        
        /**
         * The onresize event.
         *
         * When the page is resized, check to see if more content should be loaded.
         *
         * @return	NULL.  Calls other functions
         * @note	Called when the window is resized.
         * @note	Set by the onresize event.
         */
        function resizing()
        {
            add_content_if_needed(additional);
            add_content_if_needed(previous);
            
            update_verse_range();
        }
        
        
        ///TODO: Document.
        function add_content_if_needed(direction)
        {
            if (direction === additional) {
                setTimeout(add_content_bottom_if_needed, lookup_speed_sitting);
            } else {
                setTimeout(add_content_top_if_needed, lookup_speed_scrolling);
            }
        }
        
        
        ///TODO: Document.
        ///NOTE: Old text: If it is not going to already, figure out which verses are presently displayed on the screen.
        function update_verse_range()
        {
            if (!looking_up_verse_range) {
                looking_up_verse_range = true;
                setTimeout(find_current_range, lookup_range_speed);
            }
        }
        
        
        ///NOTE: These events could be attached as anonymous functions (lambdas),
        ///      but scrolling() calls itself, so it would need to store arguments.callee.
        ///NOTE: Could use wheel if the scroll bars are invisible.
        ///FIXME: These events need to be localized to the objects passed to the function.
        onscroll = scrolling;
        onresize = resizing;
        
        return {add_content_if_needed: add_content_if_needed, update_verse_range: update_verse_range};
    }());
    /****************************
     * End of Scrolling Closure *
     ****************************/
    
    
    /*******************************
     * End of Suggestion functions *
     *******************************/
    
    /// Disable autocomplete for Javascript enabled browsers because they can use the auto suggestions.
    q_obj.setAttribute("autocomplete", "off");
    
    /// Prototypes
    ///NOTE: Adds trim() to Strings for IE/Opera/WebKit/Mozilla 3.0-.
    if (!"".trim) {
        /**
         * Removes leading and trailing spaces.
         *
         * @example	trimmed = trim("  God is   good  "); /// Returns "God is   good"
         * @param	str (string) The string to trim.
         * @return	A String with leading and trailing spaces removed.
         * @note	This does not remove all types of whitespace.  It actually removes anything under character code 33.
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
     * Make split() work correctly in IE.
     *
     * @param	s		(regexp || string)	The regular expression or string with which to break the string.
     * @param	limit	(int) (optional)	The number of times to split the string.
     * @return	Returns an array of the string now broken into pieces.
     * @see		http://blog.stevenlevithan.com/archives/cross-browser-split.
     */
    ///NOTE: The following conditional compilation code blocks only executes in IE.
    /*@cc_on
        String.prototype._$$split	= String.prototype._$$split || String.prototype.split;
        String.prototype.split		= function (s, limit)
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
            
            if (!(s instanceof RegExp)) return String.prototype._$$split.apply(this, arguments);
            
            flags			= (s.global ? "g" : "") + (s.ignoreCase ? "i" : "") + (s.multiline ? "m" : "");
            s2				= new RegExp("^" + s.source + "$", flags);
            output			= [];
            origLastIndex	= s.lastIndex;
            lastLastIndex	= 0;
            i = 0;
            
            if (limit === undefined || +limit < 0) {
                limit = false;
            } else {
                limit = Math.floor(+limit);
                if (!limit) return [];
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
                                if (arguments[j] === undefined) {
                                    match[j] = undefined;
                                }
                            }
                        });
                    }
                    
                    output = output.concat(this.slice(lastLastIndex, match.index));
                    if (1 < match.length && match.index < this.length) {
                        output = output.concat(match.slice(1));
                    }
                    lastLength		= match[0].length;
                    lastLastIndex	= s.lastIndex;
                }
                if (emptyMatch) ++s.lastIndex;
            }
            output = lastLastIndex === this.length ? (s.test("") && !lastLength ? output : output.concat("")) : (limit ? output : output.concat(this.slice(lastLastIndex)));
            s.lastIndex = origLastIndex; /// TODO: Determine if this line of code is necessary.
            return output;
        };
        
        
        /// Trick IE into understanding pageYOffset.
        /// Set the initial value, so that it is not undefined.
        /// See scrolling().
        ///NOTE: pageYOffset is a browser-created, global variable.
        pageYOffset = doc_docEl.scrollTop;
    @*/
    
    
    /*****************************
     * Start of search functions *
     *****************************/
    
    /**
     * Prepare for the search.
     *
     * Evaluates the query from the user and deterim the search query from the input box.
     *
     * @example	prepare_new_search();
     * @return	FALSE to prevent the form from submitting.
     * @note	Called when clicking the submit button on the search bar in index.php.
     * @note	Outer variables used: waiting_for_first_search, ajax_additional, ajax_previous, last_type, bottom_id, last_search_encoded, last_search.
     */
    function prepare_new_search()
    {
        var last_search_prepared,
            raw_search_terms		= q_obj.value,
            search_type_array,
            verse_id;
        
        waiting_for_first_search = true;
        
        last_search_prepared = BF_LANG.prepare_search(raw_search_terms);
        
        if (last_search_prepared.length === 0) {
            return false;
        }
        
        /// Stop any old requests since we have a new one.
        /// Is readyState > 0 and < 4?  (Anything 1-3 needs to be aborted.)
        if (ajax_additional.readyState % 4) {
            ajax_additional.abort();
        }
        if (ajax_previous.readyState % 4) {
            ajax_previous.abort();
        }
        
        /// Determine if the user is preforming a search or looking up a verse.
        /// If the query is a verse reference, a number is returned, if it is a search, then FALSE is returned.
        verse_id = BF_LANG.determine_reference(last_search_prepared);
        
        /// Is the user looking up a verse? (verse_id is false when the user is preforming a search.)
        if (verse_id !== false) {
            /// To get the titles of Psalms, select verse 0 instead of verse 1.
            if (verse_id < 19145002 && verse_id > 19003000 && verse_id % 1000 == 1) {
                --verse_id;
            }
            
            last_type = verse_lookup;
            ///TODO: Determine if there is a better way of doing this.
            ///NOTE: Subtract 1 because run_search() adds one.
            bottom_id = verse_id - 1;
            
        /// The user is submitting a search request.
        } else {
            /// The type of search must be determined (i.e., mixed_search or standard_search or grammatical_search).
            search_type_array = determine_search_type(last_search_prepared);
            
            /// The type of search is stored in the first index of the array.
            last_type = search_type_array[0];
            
            if (last_type == grammatical_search) {
                /// grammatical_search uses a JSON array which is stored as text in the second index of the array.
                last_search_prepared = search_type_array[1];
            }
            last_search_encoded = encodeURIComponent(last_search_prepared);
            bottom_id = 0;
        }
        
        run_search(additional);
        
        /// Prepare for the new results.
        if (last_type == verse_lookup) {
            scroll_maxed_top	= false;
            scroll_maxed_bottom	= false;
        } else {
            scroll_maxed_top	= true;
            scroll_maxed_bottom	= false;
            /// We immediately prepare the highlighter so that when the results are returned via Ajax.
            /// the highlighter array will be ready to go.
            /// Do we already have the regex array or do we not need because the highlighted words will be returned (e.g., grammatical searching)?
            if (raw_search_terms != last_search) {
                prepare_highlighter(last_search_prepared);
                /// This outer variable is used to display the last search on the info bar.
                last_search = raw_search_terms;
            }
        }
        
        clean_up_page();
        last_book = 0;
        
        /// Clear cache.
        ///TODO: Determine a way to store the cache in a way that it can be used later.
        cached_verses_top		= [];
        cached_count_top		= 0;
        cached_verses_bottom	= [];
        cached_count_bottom		= 0;
        
        document.title = raw_search_terms + " - " + BF_LANG.app_name;
        return false;
    }
    
    
    /**
     * Figure out what type of search is being attempted by the user.
     *
     * @example	determine_search_type("God & love");							/// Returns [standard_search]
     * @example	determine_search_type("love AS NOUN");							/// Returns [grammatical_search,'["love",[[1,1]],[1]]']
     * @example	determine_search_type("go AS IMPERATIVE, -SINGULAR");			/// Returns [grammatical_search,'["go",[[9,3],[5,1]],[0,1]]']
     * @example	determine_search_type("go* AS PASSIVE, -PERFECT,INDICATIVE");	/// Returns [grammatical_search,'["go*",[[8,3],[7,5],[9,1]],[0,1,0]]']
     * @example	determine_search_type("* AS RED, IMPERATIVE");					/// Returns [grammatical_search,'["",[[3,1],[9,3]],[0,0]]']
     * //@example determine_search_type("love AS NOUN & more | less -good AS ADJECTIVE"); /// Returns [grammatical_search, [0, "love", "NOUN"], standard_search, "& more | less -good", grammatical_search, [0, "good", "ADJECTIVE"]]
     * @param	search_terms (string) The prepared terms to be examined.
     * @return	An array describing the type of search.  Format: [(int)Type of search, (optional)(string)JSON array describing the search].
     * @note	Called by run_search().
     * @note	Only a partial implementation currently.  Mixed searching is lacking.
     */
    function determine_search_type(search_terms)
    {
        var exclude_json			= "",	/// Used to concatenate data. TODO: Make description better.
            grammar_attribute_json	= "",	/// Used to concatenate data. TODO: Make description better.
            grammar_attributes,
            grammar_json			= "",	/// Used to concatenate data. TODO: Make description better.
            grammar_search_term,
            split_start,
            split_pos;
        
        /// Did the user use the grammatical keyword in his search?
        if ((split_pos = search_terms.indexOf(BF_LANG.grammar_marker)) != -1) {
            ///TODO: Determine what is better: a JSON array or POST/GET string (i.e., word1=word&grammar_type1=1&value1=3&include1=1&...).
            /// A JSON array is used to contain the information about the search.
            /// JSON format: '["WORD",[[GRAMMAR_TYPE1,VALUE1],[...]],[INCLUDE1,...]]'
            /// replace(/(["'])/g, "\\$1") adds slashes to sanitize the data.
            grammar_search_term = search_terms.slice(0, split_pos);
            
            /// Is the user trying to find all words that match the grammatical attributes?
            if (grammar_search_term == "*") {
                /// Sphinx will find all words if no query is present, so we need to send a blank search request.
                grammar_search_term = "";
            }
            
            grammar_json		= '["' + grammar_search_term.replace(/(["'])/g, "\\$1") + '",[';
            grammar_attributes	= search_terms.slice(split_pos + BF_LANG.grammar_marker_len);
            split_start			= 0;
            
            ///TODO: Determine if there is a benefit to using do() over while().
            ///NOTE: An infinite loop is used because the data is returned when it reaches the end of the string.
            do {
                /// Find where the attributes separate (e.g., "NOUN, GENITIVE" would separate at character 4).
                split_pos = grammar_attributes.indexOf(BF_LANG.grammar_separator, split_start);
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
                    grammar_attribute_json += BF_LANG.grammar_keywords[grammar_attributes.slice(split_start, split_pos).trim()] + ",";
                    split_start = split_pos + 1;
                } else {
                    ///TODO: Determine if trim() is necessary or if there is a better implementation.
                    ///NOTE: exclude_json.slice(0, -1) is used to remove the trailing comma.  This could be unnecessary.
                    return [grammatical_search, grammar_json + grammar_attribute_json + BF_LANG.grammar_keywords[grammar_attributes.slice(split_start).trim()] + "],[" + exclude_json.slice(0, -1) + "]]"];
                }
            } while (true);
        }
        /// The search is just a standard search.
        return [standard_search];
    }
    
    
    /**
     * Submits a query via Ajax.
     *
     * @example	run_search(additional);	/// Will add verses to the bottom.
     * @example	run_search(previous);	/// Will add verses to the top.
     * @param	direction (integer) The direction of the verses to be retrieved: additional || previous.
     * @return	NULL.  Query is sent via Ajax.
     * @note	Called by prepare_new_search() when the user submits a search.
     * @note	Called by add_content_bottom_if_needed() and add_content_top_if_needed() when scrolling.
     * @note	Outer variables used: last_type and bottom_id, top_id, last_search_encoded.
     */
    function run_search(direction)
    {
        /// last_type set in prepare_new_search().
        var ajax,
            query = "t=" + last_type;
        
        if (direction == additional) {
            ajax = ajax_additional;
        } else {
            ajax = ajax_previous;
            query += "&d=" + direction;
        }
        
        /// Is the server already working on this request?
        ///NOTE: readyState is between 0-4, and anything 1-3 means that the server is already working on this request.
        if (ajax.readyState % 4) {
            return null;
        }
        
        if (last_type == verse_lookup) {
            if (direction == additional) {
                query += "&q=" + (bottom_id + 1);
            } else {
                query += "&q=" + (top_id - 1);
            }
        } else {
            query += "&q=" + last_search_encoded;
            if (direction == additional) {
                /// Continue starting on the next verse.
                if (bottom_id > 0) {
                    query += "&s=" + (bottom_id + 1);
                }
            } else {
                /// Continue starting backwards on the previous verse.
                query += "&s=" + (top_id + -1);
            }
        }
        post_to_server("search.php", query, ajax, handle_new_verses, {action: last_type, "direction": direction});
    }
    
    
    /**
     * Handles new verses from the server.
     *
     * Writes new verses to the page, determines if more content is needed or available,
     * and writes initial information to the info bar.
     *
     * @example	handle_new_verses([[1001001, 1001002], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning....</b>", "<b id="12">And</b> <b id="13">the</b> <b id="14">earth....</b>"], 2]);
     * @example	handle_new_verses([[1001001], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning....</b>"], 1]);
     * @example	handle_new_verses([[50004008], ["<b id=772635>Finally,</b> <b id=772636>brethren,</b> <b id=772637>whatsoever</b> <b id=772638>things....</b>"], 1, [772638]]);
     * @param	res			(array)		JSON array from the server.
     *									Array format: [verse_ids, ...], [verse_HTML, ...], number_of_matches, [word_id, ...]] ///NOTE: word_id is optional.
     * @param	extra_data	(object)	An object containing the type of action that was preformed and the direction the verses are displayed in.
     *									Format: {action: (int), direction: (int)}
     * @return	NULL.  The function writes HTML to the page.
     * @note	Called by prepare_verses() after an Ajax request.
     */
    function handle_new_verses(res, extra_data)
    {
        ///TODO: On a verse lookup that does not start with Genesis 1:1, scroll_maxed_top must be set to FALSE. (Has this been taken care of?)
        var action		= extra_data.action,
            b_tag,
            count,
            direction	= extra_data.direction,
            i,
            total		= res[2];
        
        if (total > 0) {
            ///FIXME: When looking up the last few verses of Revelation (i.e., Revelation 22:21), the page jumps when more content is loaded above.
            write_verses(action, direction, res[0], res[1]);
            
            ///FIXME: Highlighting needs to be in its own function where each type and mixed highlighting will be done correctly.
            if (action == standard_search) {
                /// Highlight the verse after 100 milliseconds.
                /// The delay is so that the verse is displayed as quickly as possible.
                ///TODO: Determine if it would be better to put this in an array and send it all at once, preferably without the implied eval().
                ///TODO: Determine if it is bad to convert the array to a string like this
                setTimeout(function ()
                {
                    highlight_search_results(res[1].join(""));
                }, 100);
            } else if (action == grammatical_search) {
                count = res[3].length;
                for (i = 0; i < count; ++i) {
                    ///TODO: Determine if there is a downside to having a space at the start of the className.
                    ///TODO: Determine if we ever need to replace an existing f* className.
                    document.getElementById(res[3][i]).className += " f" + 1;
                }
                /// Record the last id found from the search so that we know where to start from for the next search as the user scrolls.
                /// Do we need to record the bottom id?
                if (direction == additional) {
                    bottom_id = res[3][count - 1];
                } else {
                    top_id = res[3][0];
                }
            }
            
            /// Indicate to the user that more content may be loading, and check for more content.
            if (direction === additional && res[0][res[0].length - 1] < 66022021) {
                bottomLoader.style.visibility = "visible";
                content_manager.add_content_if_needed(direction)
            }
            if ((direction === previous || waiting_for_first_search) && res[0][0] > 1001001) {
                topLoader.style.visibility = "visible";
                /// A delay is added on to space out the requests.
                ///FIXME: This used to use lookup_delay.  Nothing else does.  Is it necessary?  If so, how should it be implamented?
                //setTimeout(add_content_top_if_needed, lookup_speed_sitting + lookup_delay);
                content_manager.add_content_if_needed(previous);
            }
        } else {
            if (direction == additional) {
                /// The user has reached the bottom by scrolling down (either RETURNED_SEARCH or RETURNED_VERSES_previous), so we need to hide the loading graphic.
                /// This is cause by scrolling to Revelation 22:21 or end of search or there were no results.
                scroll_maxed_bottom = true;
                bottomLoader.style.visibility = "hidden";
            }
            if (direction == previous || waiting_for_first_search) {
                /// The user has reached the top of the page by scrolling up (either Genesis 1:1 or there were no search results), so we need to hide the loading graphic
                scroll_maxed_top = true;
                topLoader.style.visibility = "hidden";
            }
        }
        
        /// If this is the first results, update the info bar.
        if (waiting_for_first_search) {
            /// If the user had scrolled down the page and then pressed the refresh button,
            /// the page will keep scrolling down as content is loaded, so to prevent this, force the window to scroll to the top of the page.
            ///NOTE: scrollTo() is a browser-created, global function.
            scrollTo(0, 0);
            
            waiting_for_first_search = false;
            
            infoBar.innerHTML = "";
            
            if (action != verse_lookup) {
                /// Create the inital text.
                infoBar.appendChild(document.createTextNode(format_number(total) + BF_LANG["found_" + (total === 1 ? "singular" : "plural")]));
                /// Create a <b> for the search terms.
                b_tag = document.createElement("b");
                ///NOTE: We use this method instead of straight innerHTML to prevent HTML elements from appearing inside the <b></b>.
                b_tag.appendChild(document.createTextNode(last_search));
                infoBar.appendChild(b_tag);
            }
            
            /// Store the first verse reference for later.
            top_id = res[0][0];
        }
    }
    
    
    /**
     * Writes new verses to page.
     *
     * @example	write_verses(action, direction, [verse_ids, ...], [verse_HTML, ...]);
     * @example	write_verses(verse_lookup, additional, [1001001], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning....</b>"]);
     * @param	action		(integer)	The type of query: verse_lookup || mixed_search || standard_search || grammatical_search.
     * @param	direction	(integer)	The direction of the verses to be retrieved: additional || previous.
     * @param	verse_ids	(array)		An array of integers representing Bible verse references.
     * @param	verse_HTML	(array)		An array of strings containing verses in HTML.
     * @return	NULL.  Writes HTML to the page.
     * @note	Called by handle_new_verses().
     * @note	verse_ids contains an array of verses in the following format: [B]BCCCVVV (e.g., Genesis 1:1 == 1001001).
     */
    function write_verses(action, direction, verse_ids, verse_HTML)
    {
        var b,
            c,
            chapter_text	= "",
            i,
            HTML_str		= "",
            newEl,
            num,
            start_key		= 0,
            stop_key		= verse_ids.length,
            v;
        
        /// Currently only grammatical_search searches data at the word level, so it is the only action that might stop in the middle of a verse and find more words in the same verse as the user scrolls.
        if (action == grammatical_search) {
            if (direction == additional) {
                /// Is the first verse returned the same as the bottom verse on the page?
                if (bottom_verse == verse_ids[0]) {
                    start_key = 1;
                }
            } else {
                /// Is the last verse returned the same as the top verse on the page?
                if (top_verse == verse_ids[stop_key - 1]) {
                    --start_key;
                }
            }
        }
        
        for (i = start_key; i < stop_key; ++i) {
            num	= verse_ids[i];
            v	= num % 1000;						/// Calculate the verse.
            c	= ((num - v) % 1000000) / 1000;		/// Calculate the chapter.
            b	= (num - v - c * 1000) / 1000000;	/// Calculate the book by number (e.g., Genesis == 1).
            
            ///TODO: Determine if it would be better to have two for loops instead of the if statement inside of this one.
            if (action == verse_lookup) {
                /// Is this the first verse or the Psalm title?
                if (v < 2) {
                    /// Is this chapter 1?  (We need to know if we should display the book name.)
                    if (c === 1) {
                        HTML_str += "<div class=book id=" + num + "_title>" + BF_LANG.books_long_pretitle[b] + "<h1>" + BF_LANG.books_long_main[b] + "</h1>" + BF_LANG.books_long_posttitle[b] + "</div>";
                    /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
                    } else if (b !== 19 || v === 0 || ((c <= 2) || (c === 10) || (c === 33) || (c === 43) || (c === 71) || (c === 91) || (c >= 93 && c <= 97) || (c === 99) || (c >= 104 && c <= 107) || (c >= 111 && c <= 119) || (c >= 135 && c <= 137) || (c >= 146))) {
                        /// Is this the book of Psalms?  (Psalms have a special name.)
                        if (b === 19) {
                            chapter_text = BF_LANG.psalm;
                        } else {
                            chapter_text = BF_LANG.chapter;
                        }
                        HTML_str += "<h3 class=chapter id=" + num + "_chapter>" + chapter_text + " " + c + "</h3>";
                    }
                    /// Is this a Psalm title (i.e., verse 0)?  (Psalm titles are displayed specially.)
                    if (v === 0) {
                        HTML_str += "<div class=pslam_title id=" + num + "_verse>" + verse_HTML[i] + "</div>";
                    } else {
                        HTML_str += "<div class=first_verse id=" + num + "_verse>" + verse_HTML[i] + "</div>";
                    }
                } else {
                    HTML_str += "<div class=verse id=" + num + "_verse>" + v + " " + verse_HTML[i] + "</div>";
                }
                
            /// Searching
            } else {
                /// Change verse 0 to "title" (i.e., Psalm titles).  (Display Psalm 3:title instead of Psalm 3:0.)
                if (v === 0) {
                    v = BF_LANG.title;
                }
                
                /// Is this verse from a different book than the last verse?
                if (b !== last_book) {
                    /// We only need to print out the book if it is different from the last verse.
                    last_book = b;
                    
                    HTML_str += "<h1 class=book id=" + num + "_title>" + BF_LANG.books_short[b] + "</h1>"; /// Convert the book number to text.
                }
                
                HTML_str += "<div class=search_verse id=" + num + "_search>" + c + ":" + v + " " + verse_HTML[i] + "</div>";
            }
        }
        
        newEl = document.createElement("div");
        ///NOTE: If innerHTML disappears in the future (because it is not (yet) in the "standards"),
        ///      a simple (but slow) alternative is to use the innerDOM script from http://innerdom.sourceforge.net/ or BetterInnerHTML from http://www.optimalworks.net/resources/betterinnerhtml/.
        ///      Also using "range = document.createRange(); newEl = range.createContextualFragment(HTML_str); is also a possibility.
        newEl.innerHTML = HTML_str;
        
        if (direction === additional) {
            page.appendChild(newEl);
            
            /// Record the bottom most verse reference and id so that we know where to start from for the next search or verse lookup as the user scrolls.
            ///NOTE: For verse_lookup and standard_search, the bottom_id and bottom_verse are the same because the search is preformed at the verse level.
            ///      grammatical_search is performed at the word level, so the id is different from the verse.
            ///      The id for grammatical_search is recorded in handle_new_verses(), currently.
            ///TODO: Determine the pros/cons of using an if statement to prevent grammatical searches from recording the id here, since it is overwritten later.
            bottom_id = bottom_verse = num;
        } else {
            page.insertBefore(newEl, page.childNodes[0]);
            
            /// The new content that was just added to the top of the page will push the other contents downward.
            /// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
            ///NOTE: scrollTo() is a browser-created, global function.
            ///NOTE: pageYOffset is a browser-created, global variable.
            scrollTo(0, scroll_pos = pageYOffset + newEl.clientHeight);
            
            /// Record the top most verse reference and id so that we know where to start from for the next search or verse lookup as the user scrolls.
            ///NOTE: For verse_lookup and standard_search, the top_id and top_verse are the same because the search is preformed at the verse level.
            ///      grammatical_search is performed at the word level, so the id is different from the verse.
            ///      The id for grammatical_search is recorded in handle_new_verses(), currently.
            ///TODO: Determine the pros/cons of using an if statement to prevent grammatical searches from recording the id here, since it is overwritten later.
            top_id = top_verse = verse_ids[0];
        }
        
        content_manager.update_verse_range();
    }
    
    
    /**
     * Prepares the page for new verses.
     *
     * @example	clean_up_page();
     * @return	NULL.  The page is prepared for new verses.
     * @note	Called by prepare_new_search().
     */
    function clean_up_page() {
        ///TODO: This should have smooth scrolling effects, etc.
        bottomLoader.style.visibility	= "hidden";
        topLoader.style.visibility		= "hidden";
        page.innerHTML					= "";
    }
    
    
    /**
     * Highlight the verses.
     *
     * Highlights the words in the verses that match the search terms.
     * Highlighting is done by adding/changing the className of a word.
     *
     * @example	setTimeout(function () {highlight_search_results(res[1]join("");}, 100);
     * @example	highlight_search_results("<b id=1>In</b> <b id=2>the</b> <b id=3>beginning...</b>");
     * @param	search_str (string) The HTML to examine and highlight.
     * @return	NULL.  Modifies objects className.
     * @note	Called by write_verses() via setTimeout() with a short delay.
     */
    function highlight_search_results(search_str)
    {
        var i,
            ids,
            regex_id,
            regex_length	= highlight_re.length,
            tmp_found_ids	= [];
        
        for (regex_id = 0; regex_id < regex_length; ++regex_id) {
            tmp_found_ids = search_str.split(highlight_re[regex_id]);
            
            ids = tmp_found_ids.length;
            ///NOTE: search_str.split() creates an array of the HTML with the correct ids every third one.
            for (i = 1; i < ids; i += 2) {
                ///TODO: Determine if there is a downside to having a space at the start of the className.
                ///TODO: Determine if we ever need to replace an existing f* className.
                document.getElementById(tmp_found_ids[i]).className += " f" + (regex_id + 1);
            }
        }
    }
    
    
    ///TODO: Determine if this whole function should be in a language specific file.
    /**
     * Prepare search terms for highlighting.
     *
     * Create regex array to search through the verses that will soon be returned by the server.
     *
     * @example	prepare_highlighter(q_obj.value);
     * @example	prepare_highlighter("search terms");
     * @param	search_terms (string) The terms to look for.
     * @return	NULL.  A regex array is created and stored in the outer variable highlight_re[].
     * @note	Called by run_search().
     */
    function prepare_highlighter(search_terms)
    {
        var count				= 0,
            i,
            j,
            len_before,
            len_after,
            no_morph,
            term,
            stemmed_arr			= [],
            search_terms_arr,
            stemmed_word;
        
        highlight_re = [];
        
        search_terms_arr = BF_LANG.filter_terms_for_highlighter(search_terms);
        
        ///TODO: Determine if a normal for loop would be better.
        first_loop:
        for (i in search_terms_arr) {
            term		= search_terms_arr[i];
            len_before	= term.length;
            
            ///FIXME: Move this to the language specific file because it is language dependent.
            /// Fix special/unique words that the stemmer won't stem correctly.
            switch (term) {
            case "does":
            case "doth":
            case "do":
            case "doeth":
            case "doest":
                stemmed_word = "do[esth]*";
                no_morph = true;
                break;
            case "haste":
            case "hasted":
                stemmed_word = "haste";
                no_morph = false;
                break;
            case "shalt":
            case "shall":
                stemmed_word = "shal[lt]";
                no_morph = true;
                break;
            case "wilt":
            case "will":
                stemmed_word = "wil[lt]";
                no_morph = true;
                break;
            case "have":
            case "hast":
            case "hath":
                stemmed_word = "ha[vesth]+";
                no_morph = true;
                break;
            case "the":
                stemmed_word = "the";
                no_morph = true;
                break;
            case "for":
                stemmed_word = "for";
                no_morph = true;
                break;
            case "not":
                stemmed_word = "not";
                no_morph = true;
                break;
            default:
                /// Does the word contain a wildcard symbol (*)?
                if (term.indexOf("*") != -1) {
                    /// Don't stem; change it to a regex compatible form.
                    ///NOTE: Word breaks are found by looking for tag openings (<) or closings (>).
                    stemmed_word = term.replace(/\*/g, "[^<>]*");
                    no_morph = true;
                } else {
                    /// A normal word without a wildcard gets stemmed.
                    stemmed_word = BF_LANG.stem_word(term);
                    no_morph = false;
                }
            }
            len_after = stemmed_word.length;
            
            /// Skip words that are the same after stemming or regexing (e.g., "joy joyful" becomes "joy joy").
            for (j = 0; j < count; ++j) {
                if (stemmed_word == stemmed_arr[j]) {
                    continue first_loop; ///NOTE: This is the same as "continue 2" in PHP.
                }
            }
            
            stemmed_arr[count] = stemmed_word;
            
            ///NOTE: [<-] finds either the beginning of the close tag (</b>) or a hyphen (-).
            ///      The hyphen is to highlight hyphenated words that would otherwise be missed (matching first word only) (i.e., "Beth").
            ///      ([^>]+-)? finds words where the match is not the first of a hyphenated word (i.e., "Maachah").
            ///      The current English version (KJV) does not use square brackets ([]).
            ///FIXME: The punctuation ,.?!;:)( could be considered language specific.
            ///TODO: Bench mark different regex (creation and testing).
            if (no_morph || (len_after == len_before && len_after < 3)) {
                highlight_re[count++] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[),.?!;:]*[<-]", "i");
            } else {
                /// Find most words based on stem morphology, but also can have false hits.
                ///TODO: Compare different regexes.
                //highlight_re[count++] = new RegExp("id=([0-9]+)>[(]*([^<]+-)?" + stemmed_word + "[a-z']{0,7}[),.?!;:]*[<-]", "i");
                highlight_re[count++] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[^<]{0,7}[),.?!;:]*[<-]", "i");
            }
        }
    }
    
    
    /**
     * Format a positive number with appropriate commas.
     *
     * @example	format_number(1000); /// Returns "1,000"
     * @param	num (positive number) The number to format.
     * @return	A formatted number as a string.
     * @note	To be faster, this will not format a negative number.
     */
    function format_number(num)
    {
        var rgx;
        if (num < 1000) {
            return num;
        }
        /// Quickly converts a number to a string quickly.
        num += "";
        rgx = /^([0-9]+)([0-9][0-9][0-9])/;
        
        while (rgx.test(num)) {
            num = num.replace(rgx, "$1,$2");
        }
        return num;
    }
    
    /***************************
     * End of search functions *
     ***************************/
    
    
    /**
     * Send an Ajax request to the server.
     *
     * @example	post_to_server("search.php", "q=search", ajax, {action: last_type, "direction": direction});
     * @example	post_to_server("search.php", "q=search&s=48003027", ajax, {action: 1, "direction": 1});
     * @param	server_URL	(string)			The file on the server to run.
     * @param	message		(string)			The variables to send.
     *											URI format: "name1=value1&name2=value%202"
     * @param	ajax		(object)			The Ajax object that preforms the query.
     * @param	extra_data	(mixed) (optional)	Any data to send to the handler function.
     * @return	NULL.  Queries server and then performs an action with the received JSON array.
     * @note	Called by run_search().
     */
    function post_to_server(server_URL, message, ajax, handler, extra_data)
    {
        ///TODO: Consider whether GET could be better than POST.
        ajax.open("POST", server_URL, true);
        ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        ajax.onreadystatechange = function ()
        {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    /// This is run when the results are returned properly.
                    ///NOTE: JSON.parse() is at least currently (November 2009) twice as slow as eval(), and it does not work because of problems parsing the character combination slash plus single quote (\').  Two slashes may work.
                    ///TODO: Add error handling for parsing.
                    handler(eval(ajax.responseText), extra_data);
                } else {
                    /// Was the abort unintentional?
                    if (ajax.status !== 0) {
                        ///FIXME: Do meaningful error handling.
                        alert("Error " + ajax.status + ":\n" + ajax.responseText);
                    }
                }
            }
        };
        ajax.send(message);
    }
}(document.getElementById("viewPort1"), document.getElementById("searchForm1"), document.getElementById("q1"), document.getElementById("scroll1"), document.getElementById("infoBar1"), document.getElementById("topLoader1"), document.getElementById("bottomLoader1"), document.documentElement));
