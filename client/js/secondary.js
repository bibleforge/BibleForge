/**
 * BibleForge
 *
 * @date    09-28-10
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
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, browser:true

(function ()
{
    "use strict";
    
    /**
     * Load secondary, nonessential code, such as the wrench button.
     *
     * @param  context (object) An object containing necessary variables from the parent closure.
     * @note   This code is eval'ed inside of main.js.  The anonymous function is then called and data from the BibleForge closure is passed though the context object.
     * @note   Even though this function is not called immediately, it needs to be wrapped in parentheses to make it a function expression.
     * @return NULL
     */
    return function (context)
    {
        var page = context.page,
            show_context_menu,
            show_panel;
        
        /// **************************
        /// * Start of BF extentions *
        /// **************************
        
        /**
         * Create the transition() function and its closure.
         *
         * @return The transition function.
         */
        BF.transition = (function ()
        {
            /**
             * Parse the CSS transition string to enumerate the comma concatenated styles.
             *
             * @example parse_transition(""); /// Returns []
             * @example parse_transition("top 300ms ease 0s, left 300ms ease 0s, height 300ms ease 0s"); /// Returns ["top 300ms ease 0s", "left 300ms ease 0s", "height 300ms ease 0s"]
             * @param   str (string) The CSS transition string to parse.
             * @return  An array of styles (if any).
             */
            function parse_transition(str)
            {
                if (typeof str === "undefined" || str.trim() === "") {
                    return [];
                }
                
                return str.split(/\s*,\s*/g);
            }
            
            /**
             * Initiate the transition.
             *
             * @param el   (DOM element) The element to transition.
             * @param data (object) An object describing the transition.
             *                      Object structure:
             *                      {prop:      "(string) The property to transition in the JavaScript naming convention (possibly the same as CSS)",
             *                       css_prop:  "(string) The property to transition in the CSS naming convention (if different from 'prop') (optional)",
             *                       duration:  "(string) The length of time the transition should take (in CSS notation) (optional) (default: '1s')",
             *                       start_val: "(string) The value to begin with before the transition begins (optional)",
             *                       end_val:   "(string) The final value the transition should end at",
             *                       timing:    "(string) The CSS timing function to use (optional) (default: 'ease')",
             *                       delay:     "(string) The length of time to pass before the transition starts (optional) (default: '0s')"}
             * @param on_finish (function) (optional) The function to call after the transition completes.
             * @note  If the CSS property is different from the JavaScript property (e.g., "background-color" (CSS) vs. "backgroundColor" (JavaScript)), make sure to include css_prop.
             * @note  Make sure to use the most specific CSS property available.
             *        E.g., changing the background color with {prop: "background", end_val: "red"} will not work because it will be interrupted as background-color.
             *        So the proper way would be {prop: "backgroundColor", css_prop: "background-color", end_val: "red"}.
             */
            function preform_transition(el, data, on_finish)
            {
                var ended,
                    failsafe_timeout,
                    on_transition_end,
                    start_timeout,
                    started,
                    terminate,
                    transition_name,
                    transition_name_end;
                
                if (typeof data.start_val !== "undefined") {
                    el.style[data.prop] = data.start_val;
                }
                
                if (typeof el.style.transition === "string") {
                    /// Mozilla 16+ and IE 10+ use the unprefixed version.
                    transition_name     = "transition";
                    ///NOTE: The suffix "end" is lower case in the offical form only.
                    transition_name_end = "transitionend";
                } else if (typeof el.style.MozTransition === "string") {
                    /// Mozilla 4-15 use the prefixed version.
                    transition_name     = "MozTransition";
                    transition_name_end = "MozTransitionEnd";
                /// Even though WebKit seems to have WebkitTransitionEnd, it apparently needs to use webkitTransitionEnd (notice the case difference).
                } else if (typeof el.style.webkitTransition === "string") {
                    transition_name     = "webkitTransition";
                    transition_name_end = "webkitTransitionEnd";
                }
                ///NOTE: Checking for oTransition does not work.
                ///NOTE: If transition_name remains undefined, it will have no adverse effects. The style will just take place without a transition.
                
                /**
                 * Remove the transition style from the element and execute the callback (if any).
                 *
                 * @param e (object) An object containing which CSS property completed (via the "propertyName" property).
                 * @note  The data object is sent to the callback.
                 * @note  Called either when the animation finishes or when the failsafe triggers.
                 */
                on_transition_end = function (e)
                {
                    var i,
                        transition_arr;
                    
                    /// Prevent terminate() from calling this function and triggering the callback twice.
                    ended = true;
                    
                    /// Clear any failsafe timeout since the transition finished properly.
                    window.clearTimeout(failsafe_timeout);
                    
                    /// Is the current property that just finished transitioning the same one as this one?
                    if (e.propertyName === (data.css_prop || data.prop)) {
                        /// If so, stop listening.
                        el.removeEventListener(transition_name_end, on_transition_end);
                        
                        /// Now, we need to remove the transition CSS from the element so that future changes to that property will not cause a transition.
                        /// To do that, we have to find the different CSS properties that are set to transition and then remove the correct one.
                        
                        /// First, get all of the transitions atached to the element.
                        transition_arr = parse_transition(el.style[transition_name]);
                        
                        /// Then remove the matching transition.
                        for (i = transition_arr.length - 1; i >= 0; i -= 1) {
                            /// Do the properties match?
                            /// The space (" ") is used to make sure to match the entire property, not just part of it:
                            /// e.g., "background 1s ease" would match "background-color 1s ease" without the space.
                            if (transition_arr[i].indexOf((data.css_prop || data.prop) + " ") === 0) {
                                BF.remove(transition_arr, i);
                            }
                        }
                        
                        /// Finally, put the remaining styles back.
                        el.style[transition_name] = transition_arr.join(",");
                        
                        if (typeof on_finish === "function") {
                            on_finish(data);
                            /// Prevent this from triggering again.
                            ///NOTE: If the transition is terminated, this function might try to be triggered twice.
                            on_finish = null;
                        }
                    }
                };
                
                start_timeout = window.setTimeout(function ()
                {
                    var no_transition;
                    
                    /// Prevent terminate() from calling this function and setting the end value twice.
                    started = true;
                    
                    /// Set the style now, after a delay, so that it dose not try to transition to the start value.
                    ///NOTE: Times must have a unit in Mozilla (i.e., "0" will cause the transition to fail, but "0s" will work).
                    el.style[transition_name] = parse_transition(el.style[transition_name]).concat((data.css_prop || data.prop) + " " + (data.duration || "1s") + " " + (data.timing || "ease") + " " + (data.delay || "0s")).join(",");
                    
                    el.addEventListener(transition_name_end, on_transition_end);
                    
                    if (el.style[data.prop] !== data.end_val) {
                        el.style[data.prop] = data.end_val;
                    } else {
                        no_transition = true;
                    }
                    
                    if (data.failsafe && typeof data.failsafe === "number") {
                        failsafe_timeout = window.setTimeout(function ()
                        {
                            on_transition_end({propertyName: (data.css_prop || data.prop)});
                        }, data.failsafe);
                    }
                    
                    /// If transitions are not working, call the ontransitionend function immediately.
                    ///NOTE: Even if there is no on_finish() function, it is still necessary to run func() in order to (possibly) remove the CSS transition.
                    if ((no_transition || typeof transition_name === "undefined")) {
                        /// Make sure to send the correct propertyName.
                        on_transition_end({propertyName: (data.css_prop || data.prop)});
                    }
                }, 0);
                
                /**
                 * Terminate the CSS transition.
                 */
                terminate = function ()
                {
                    /// If this function is called really quickly, it is possible that the transition hasn't event started at all.
                    /// So, we need to stop if from starting, set the ending value, and trigger the 
                    if (!started) {
                        window.clearTimeout(start_timeout);
                        el.style[data.prop] = data.end_val;
                    }
                    if (!ended) {
                        on_transition_end({propertyName: (data.css_prop || data.prop)});
                    }
                };
                
                return terminate;
            }
            
            /**
             * Transition an element's CSS.
             *
             * @example BF.transition(element, {prop: "height", end_val: "100px", duration: "300ms"}, function callback() {})
             * @example BF.transition(element, [{prop: "top", duration: "300ms", end_val: "0"}, {prop: "fontSize", css_prop: "font-size", duration: "300ms", end_val: "30px"}, {prop: "height", duration: "300ms", start_val: "100%", end_val: "12em", delay: "1s"}, {prop: "width", end_val: "200px", timing: "steps(3, start)"}]);
             * @param   el        (DOM element)         The element to transition.
             * @param   data      (array || object)     An object describing the transition or an array of objects (See preform_transition() for more details.)
             * @param   on_finish (function) (optional) The function to call after the transition completes.
             */
            return function transition(el, data, on_finish)
            {
                var check_finished,
                    i,
                    terminate_arr = [],
                    transitions_to_complete;
                
                if (Array.isArray(data)) {
                    if (typeof on_finish === "function") {
                        /**
                         * Keep track of how many transitions have completed, and execute the callback after the last transition completes.
                         */
                        check_finished = function ()
                        {
                            transitions_to_complete -= 1;
                            if (transitions_to_complete === 0) {
                                on_finish(data);
                            }
                        };
                    }
                    
                    transitions_to_complete = data.length;
                    for (i = 0; i < transitions_to_complete; i += 1) {
                        /// Collect the terminate functions so that they can all be called later, if necessary.
                        terminate_arr[terminate_arr.length] = preform_transition(el, data[i], check_finished);
                    }
                    
                    /**
                     * Terminate all transitions.
                     */
                    return function terminate_all()
                    {
                        terminate_arr.forEach(function (terminate)
                        {
                            terminate();
                        });
                    };
                } else {
                    /// If only one property is to be transitioned, just send it directly to preform_transition().
                    return preform_transition(el, data, on_finish);
                }
            };
        }());
        
        
        /**
         * Handel sets of transitions as a unit.
         */
        BF.create_transition_cue = function (callback, failsafe)
        {
            var async_remove_tracker = {},
                count = 0,
                cue,
                failsafe_timeout,
                terminate_arr = [];
            
            function done()
            {
                window.clearTimeout(failsafe_timeout);
                /// Clear the array to possibly help garbage collection.
                terminate_arr = [];
                
                /// Make sure it is easy to detect when a cue is done.
                cue.done = true;
                
                /// These functions should never be allowed to fire after a transition is completed, so let's enforce that.
                delete cue.add;
                delete cue.remove;
                delete cue.terminate;
                
                if (typeof callback === "function") {
                    callback();
                    callback = null;
                }
            }
            
            function remove()
            {
                count -= 1;
                
                if (count === 0) {
                    done();
                }
            }
            
            cue = {
                add: function (options)
                {
                    var timeout,
                        sync_wrapper;
                    
                    if (options.sync) {
                        sync_wrapper = (function (which)
                        {
                            return function ()
                            {
                                options.sync();
                                delete options.sync;
                                delete terminate_arr[which];
                                remove();
                            };
                        }(count));
                        
                        timeout = window.setTimeout(sync_wrapper, options.delay);
                        
                        options.terminator = function ()
                        {
                            if (options.sync) {
                                window.clearTimeout(timeout);
                                sync_wrapper();
                            }
                        };
                    } else {
                        async_remove_tracker[options.id] = count;
                    }
                    
                    terminate_arr[count] = options.terminator;
                    count += 1;
                },
                async_remove: function (id)
                {
                    delete terminate_arr[async_remove_tracker[id]];
                    remove();
                },
                terminate: function ()
                {
                    var i;
                    
                    ///NOTE: Each terminate function in the array should remove itself from terminate_arr.
                    for (i = terminate_arr.length - 1; i >= 0; i -= 1) {
                        if (typeof terminate_arr[i] === "function") {
                            terminate_arr[i]();
                        }
                    }
                    ///NOTE: Terminating all of the functions should trigger done().
                }
            };
            
            if (typeof failsafe === "number") {
                failsafe_timeout = window.setTimeout(cue.terminate, failsafe);
            }
            
            return cue;
        };
        
        /**
         * Create an element that can expand and collapse.
         *
         * This is similar to HTML5's <details><summary>...</summary>...</details> but cross browser and better looking.
         *
         * @param  data (object) An object describing the elements to make expandable.
         *                       Object structure:
         *                       {summary_el:    (DOM element) The DOM element to use for the summary,
         *                        summary_text: "(string) Text to place in the summary element (only used if "summary_el" is falsey) (optional)",
         *                        details_el:    (DOM element) The DOM element to use for the details,
         *                        details_text: "(string) Text to place in the details element (only used if "details_el" is falsey) (optional)",
         *                        open:          (boolean) Set TRUE to make it open initially (optional) (default: FALSE),
         *                        onstateChange: (function) function (open)
         *                                       {
         *                                           /// Callback function when opening or closing.
         *                                           /// The "open" variable is a boolean indicating the current state
         *                                       }}
         * @note   The element that is created contains two <div> tags: the first for the summary, and the second for the details.
         * @return The new expandable element.
         */
        BF.create_expander = function (data)
        {
            var container  = document.createElement("div"),
                details_el = document.createElement("div"),
                open,
                summary_el = document.createElement("div");
            
            /// Add the elements or text.
            
            if (data.summary_el) {
                summary_el.appendChild(data.summary_el);
            } else {
                summary_el.textContent = data.summary_text;
            }
            
            /// Indicate to the user that the summary is clickable.
            summary_el.style.cursor = "pointer";
            summary_el.className = "expandable_summary";
            
            if (data.details_el) {
                details_el.appendChild(data.details_el);
            } else {
                details_el.textContent = data.details_text;
            }
            details_el.className = "expandable_details";
            
            /**
             * Expand or collapse the element.
             *
             * @todo Make keyboard accessible.
             */
            summary_el.addEventListener("click", function ()
            {
                var full_height;
                
                if (open) {
                    details_el.style.height = window.getComputedStyle(details_el).height;
                    /// Firefox needs a pause here; otherwise there is no transition.
                    window.setTimeout(function ()
                    {
                        BF.transition(details_el, {prop: "height", end_val: 0, duration: "270ms"});
                        open = false;
                        summary_el.classList.remove("expanded");
                        
                        /// Call the onstateChange callback, if any.
                        if (typeof data.onstateChange === "function") {
                            data.onstateChange(open);
                        }
                    }, 30);
                } else {
                    /// First, we need to figure out the actual height of the element so that we know what to set the height to.
                    /// We can do this by removing the height property from the CSS because that will make the element display its natural height.
                    /// This is will by pass any CSS transition since the CSS is being removed.
                    details_el.style.removeProperty("height");
                    full_height = window.getComputedStyle(details_el).height;
                    details_el.style.height = 0;
                    
                    /// Now we can make the element transition to the desired height.
                    BF.transition(details_el, {prop: "height", end_val: full_height, duration: "300ms"}, function ()
                    {
                        /// The callback only fires after the transitioning stops completely, and since the user could have clicked to hide the details while the details were transitioning,
                        /// we need to check whether or not the details are expanded now.
                        if (open) {
                            /// If we leave the height property set, the element cannot expand it's height naturally,
                            /// but we can make the element be able to change it's height naturally by removing the CSS height property.
                            /// When the height property is removed, if something effects the height now (like text wrapping when resized), it will change the element's height.
                            details_el.style.removeProperty("height");
                        }
                    });
                    
                    open = true;
                    summary_el.classList.add("expanded");
                    
                    /// Call the onstateChange callback, if any.
                    if (typeof data.onstateChange === "function") {
                        data.onstateChange(open);
                    }
                }
            }, false);
            
            /// Make the element by able to have its height change without displaying the content or a scroll bar.
            details_el.style.overflowY = "hidden";
            
            /// Set the default state.
            if (data.open) {
                open = true;
                summary_el.classList.add("expanded");
            } else {
                details_el.style.height = 0;
            }
            
            container.appendChild(summary_el);
            container.appendChild(details_el);
            
            return container;
        };
        
        /**
         * Determine the verse reference of a word that is on the page.
         *
         * @param  id (string || number) The word ID to lookup.
         * @return A string representing a verse reference or a blank string ("") if there was a problem
         * @note   If there is no element on the page that matches this ID, then and empty string ("") is returned.
         * @note   If a verse reference is needed even if the word is not present, a new API would need to be created.
         */
        BF.get_ref_from_word_id = function (id)
        {
            var bcv,
                el  = document.getElementById(id),
                ref = "";
            
            /// Is the word on the page?
            if (el) {
                bcv = BF.get_b_c_v(window.parseInt(el.parentNode.id));
                /// Was the verse data calculated correctly?
                if (bcv) {
                    ///NOTE: In the future, the chapter and verse separator may need to be language specific.
                    ref = BF.create_ref(bcv);
                }
            }
            
            return ref;
        };
        
        /**
         * Get any and all terms from the last query that are highlighted.
         *
         * @return A string containing terms or a blank string ("") if none
         */
        BF.get_highlighted_terms = function ()
        {
            var terms = "";
            
            /// If the last query was a search, the search terms need to be highlighted.
            if (context.settings.user.last_query.type !== BF.consts.verse_lookup) {
                terms = context.settings.user.last_query.prepared_query;
            }
            
            /// If the user/query specified additional terms to be highlighted, add those as well.
            if (context.settings.user.last_query.extra_highlighting) {
                terms += " " + context.settings.user.last_query.extra_highlighting;
            }
            
            return terms.trim();
        };
        
        /// ************************
        /// * End of BF extentions *
        /// ************************
        
    
        /// TODO: Reevaluate combining show_context_menu() and show_panel() into a single function that takes the open and close functions as parameters and creates the respective functions.
        /**
         * Create the show_context_menu() function with closure.
         *
         * @note   This function is called immediately.
         * @return The function for that is used to create the menu.
         */
        show_context_menu = (function ()
        {
            var align_menu,
                close_menu,
                context_menu = document.createElement("div"),
                is_open = false,
                key_handler,
                onclose;
            
            ///NOTE: The default style does has "display" set to "none" and "position" set to "fixed."
            context_menu.className = "contextMenu";
            context_menu.style.display = "none";
            
            /// Attach the element to the DOM now so that it does not have to be done each time it is displayed.
            document.body.insertBefore(context_menu, null);
            
            /**
             * Close the context menu.
             *
             * @example close_menu(open_menu); /// Closes the menu and then runs the open_menu() function.
             * @example close_menu();          /// Closes the menu and does nothing else.
             * @param   callback (function) (optional) The function to run after the menu is closed.
             * @note    Called by show_context_menu() and document.onclick().
             * @todo    It would be nice to make the menu item that was clicked fade out slowly.
             * @return  NULL
             */
            close_menu = (function ()
            {
                var is_closing;
                
                return function close_menu(callback)
                {
                    /// Because this function could be called multiple times (e.g., a user holds down enter), make sure it does not run more than needed.
                    if (!is_closing) {
                        is_closing = true;
                        
                        /// First, stop the element from being displayed.
                        context_menu.style.display = "none";
                        /// Then reset the opacity so that it will fade in when the menu is re-displayed later.
                        context_menu.style.opacity = 0;
                        
                        /// Detach menu aligning function.
                        context.system.event.detach(["contentAddedAbove", "contentRemovedAbove"], align_menu);
                        document.removeEventListener("resize", align_menu, false);
                        
                        /// Release control of the keyboard.
                        context.system.keyboard_busy = false;
                        document.removeEventListener("keydown", key_handler, true);
                        
                        /// A delay is needed so that if there is a callback, it will run after the menu has been visually removed from the page.
                        window.setTimeout(function ()
                        {
                            is_closing = false;
                            
                            /// Set the menu's is_open status to false after the delay to prevent the menu from being re-opened in the meantime.
                            is_open = false;
                            
                            if (typeof onclose === "function") {
                                ///NOTE: This function was is open_menu()'s close_callback() function.
                                onclose();
                            }
                            
                            if (typeof callback === "function") {
                                callback();
                            }
                        }, 0);
                    }
                };
            }());
            
            
            /**
             * Display the context menu.
             *
             * @example open_menu(leftOffset, topOffset, [{text: "Menu Item 1", link: "http://link.com"}, [text: "Menu Item 2", link: some_function, line: true}]); /// Creates a menu with one external link and one link that runs a function with a line break separating the two.
             * @param   get_pos        (function)            A function that returns an object describing the context menu's X and Y and optionally the CSS position style.
             *                                               Object format: {x: (number), y: (number)[, absolute: (boolean)]}
             * @param   menu_items     (array)               An array containing object(s) specifying the text of the menu items, the corresponding links, whether or not to add a line break, and an optional ID.
             *                                               Either .text or .html must be present, and .text is prefered to .html because it will inject HTML.
             *                                               Array format: [{text: (string), html: (string), link: (string or function), line: (truthy or falsey (optional)), id: (variable (optional)), title: (string) (optional)}, ...]
             * @param   selected       (variable)            The ID of the menu item that should be selected by default.  Sending FALSE will ignore all IDs.
             * @param   open_callback  (function) (optional) The function to run when the menu opens.
             * @param   close_callback (function) (optional) The function to send to close_menu() as a callback when the menu closes.
             * @note    Called by show_context_menu() and close_menu() (as the callback function).
             * @note    In order to display multiple columns, the menu_items array .html property can contain elements with the table-cell CSS display attribute.
             */
            function open_menu(get_pos, menu_items, selected, open_callback, close_callback)
            {
                var cur_item = -1,
                    i,
                    item_container,
                    menu_container = document.createElement("div"),
                    menu_count = menu_items.length,
                    menu_item;
                
                function highlight_item(old_item)
                {
                    if (old_item !== cur_item) {
                        if (old_item > -1) {
                            menu_container.childNodes[old_item].classList.remove("menu_item_selected");
                        }
                        menu_container.childNodes[cur_item].classList.add("menu_item_selected");
                    }
                }
                
                /**
                 * Wraps a function with the code to prevent the default action.
                 *
                 * @param  func (function) The function to call.
                 * @return NULL
                 * @note   This function is needed because functions cannot be created properly in loops.
                 */
                function make_onclick(func)
                {
                    return function (e)
                    {
                        func(e);
                        
                        /// Close the context menu if the user clicks a link.
                        ///NOTE: This is only needed if the e.stopPropagation() function was called by func().
                        close_menu(close_callback);
                        
                        e.preventDefault();
                        ///TODO: Determine if returning FALSE is necessary.
                        return false;
                    };
                }
                
                /**
                 * Makes the function that fires when the cursor moves over a menu item.
                 *
                 * @param  id (integer) The number representing the menu item that is being hovered over.
                 * @return The function to be attached to the onmousemove even.
                 * @note   This function must be created outside of the loop in order for the id variable to be correct.
                 */
                function make_onmousemove(id)
                {
                    return function ()
                    {
                        var old_item = cur_item;
                        cur_item = id;
                        highlight_item(old_item);
                    };
                }
                
                is_open = true;
                
                /// Set the onclose event that will be called by close_menu().
                ///NOTE: Because the menu can be closed by other functions (i.e., if show_context_menu() is run again), we must set the onclose event to a variable that is outside of this closure.
                onclose = close_callback;
                
                for (i = 0; i < menu_count; i += 1) {
                    menu_item = document.createElement("a");
                    
                    /// Select the default menu item, if any.
                    ///NOTE: cur_item === -1 is used to make sure that at most one item is selected.
                    if (selected !== false && cur_item === -1 && menu_items[i].id === selected) {
                        menu_item.className = "menu_item_selected";
                        cur_item = i;
                    }
                    
                    /// If the link is a function, then execute that function when clicked; otherwise, it should be a string, which is simply a URL.
                    if (typeof menu_items[i].link === "function") {
                        ///NOTE: Possibly could add something to the href to make the link open in a new window.
                        menu_item.onclick = make_onclick(menu_items[i].link);
                    } else {
                        menu_item.href   = menu_items[i].link;
                        /// Force links to open in a new tab.
                        menu_item.target = "_blank";
                    }
                    /// Should there be a line break before this item?
                    if (menu_items[i].line) {
                        menu_item.classList.add("menu_item_line");
                    }
                    
                    /// Add a title if present.
                    if (menu_items[i].title) {
                        menu_item.title = menu_items[i].title;
                    }
                    
                    /// In order to allow for both mouse and keyboard interaction, a menu item must be selected when the mouse moves over it.
                    menu_item.onmousemove = make_onmousemove(i);
                    
                    /// If there is text, use that; otherwise, use HTML.
                    if (menu_items[i].text) {
                        item_container = document.createElement("div");
                        item_container.className = "cell";
                        ///NOTE: textContent is akin to innerText.  It does not inject HTML.
                        item_container.textContent = menu_items[i].text;
                        menu_item.appendChild(item_container);
                    } else {
                        menu_item.innerHTML = menu_items[i].html;
                    }
                    menu_container.appendChild(menu_item);
                }
                
                /// The menu needs to be cleared first.
                ///TODO: Determine if there is a better way to do this.  Since the items are contained in a single <div> tag, it should not be slow.
                context_menu.innerHTML = "";
                
                /// Add the DOM element containing the menu items to the menu.
                ///TODO: See if document.createDocumentFragment() would work better since it would not create an extra DOM element.
                context_menu.appendChild(menu_container);
                
                /// Create the align function that can be use when the window is resized or content is added to keep the menu in the right spot.
                /**
                 * Position the context menu on the page.
                 *
                 * @note This function is called immediately and on various events.
                 */
                align_menu = function ()
                {
                    var pos = get_pos(),
                        window_bottom,
                        ///NOTE: A small amount of buffer room (about 22 pixels) seems to be necessary to place the menu properly aligned on the right edge.
                        window_right  = window.innerWidth - 22;
                    
                    /// If there is a problem with getting the position, just stop, don't throw an error that will kill the rest of the code.
                    ///NOTE: Because this is called via a event trigger, a critical error here could cause devastating effects elsewhere.
                    if (pos === undefined) {
                        return;
                    }
                    
                    ///NOTE: The position attribute must be set first because it effects the way offsetWidth is measured.
                    context_menu.style.position = (pos.absolute ? "absolute" : "fixed");
                    
                    pos.width = context_menu.offsetWidth;
                    
                    /// Prevent the menu from going too far right.
                    if (pos.x + pos.width > window_right) {
                        pos.x = window_right - pos.width;
                    }
                    /// Prevent the menu from going to far left.
                    ///NOTE: Since the code above could move the menu too far left, this much be checked for second.
                    if (pos.x < 0) {
                        pos.x = 0;
                    }
                    
                    pos.bottom = pos.y + context_menu.offsetHeight;
                    
                    if (pos.absolute) {
                        window_bottom = window.pageYOffset + window.innerHeight;
                        
                        /// Prevent the menu from going off the bottom of the page (unless the menu is far enough below the fold).
                        ///NOTE: If both the top and bottom of the menu would not be visible, then ignore it because the user apparently scroll away from the menu; therefore, we do not need to bring it back into view.
                        if (pos.bottom > window_bottom && pos.y < window_bottom + 20) {
                            pos.y = window_bottom - context_menu.offsetHeight;
                        }
                        
                        /// Prevent the menu from going off the top of the page (unless the menu is far enough above).
                        ///NOTE: If both the top and bottom of the menu would not be visible, then ignore it because the user apparently scroll away from the menu; therefore, we do not need to bring it back into view.
                        if (pos.y < window.pageYOffset && pos.bottom > window.pageYOffset) {
                            pos.y = window.pageYOffset;
                        }
                    }
                    
                    context_menu.style.left = pos.x + "px";
                    context_menu.style.top  = pos.y + "px";
                };
                
                /// Make the element displayable so that the offsetWidth (in align_menu(), which will be called shortly) will be measured correctly.
                context_menu.style.display = "block";
                /// Because it needs to be displayable before it is aligned, make it invisible.
                context_menu.style.visibility = "hidden";
                
                /// A short timeout is needed for the CSS above to take effect.
                /**
                 * Position the context menu the first time and make it visible.
                 */
                window.setTimeout(function ()
                {
                    align_menu();
                    /// Since the menu is now aligned, make it visible.
                    context_menu.style.visibility = "visible";
                }, 0);
                
                /// Attach event listeners to events that could cause the menu to need to be moved.
                /// These will be detached by close_menu().
                context.system.event.attach(["contentAddedAbove", "contentRemovedAbove"], align_menu);
                window.addEventListener("resize", align_menu, false);
                
                ///TODO: Determine if it would be good to also close the menu on document blur.
                /**
                 * Catch mouse clicks in order to close the menu.
                 *
                 * @note   Called on the mouse click event anywhere on the page (unless the event is canceled).
                 * @return NULL
                 */
                document.addEventListener("click", function ()
                {
                    /// Close the context menu if the user clicks the page.
                    close_menu();
                }, false);
                
                /// Take control of the keyboard (primarily, prevent the view from scrolling when the arrow keys are used).
                context.system.keyboard_busy = true;
                
                /**
                 * Intercept keystrokes to manipulate the menu.
                 *
                 * @param e (event object) The keyboard event object.
                 */
                key_handler = function (e)
                {
                    var fake_event,
                        old_item = cur_item;
                    
                    /// Check to make sure that the menu is still being displayed.
                    /// Although this function should be detached when the menu is removed from view, it is possible for that to fail.  It happened once, but does not appear to be repeatable.
                    if (menu_container.parentNode.style.display === "block") {
                        /// Up
                        if (e.keyCode === 38) {
                            /// If at the top, loop to the bottom.
                            if (cur_item < 1) {
                                cur_item = menu_count - 1;
                            } else {
                                cur_item -= 1;
                            }
                            highlight_item(old_item);
                        /// Down
                        } else if (e.keyCode === 40) {
                            /// If at the bottom, loop to the top.
                            if (cur_item === menu_count - 1) {
                                cur_item = 0;
                            } else {
                                cur_item += 1;
                            }
                            highlight_item(old_item);
                        /// Enter
                        } else if (e.keyCode === 13) {
                            if (cur_item > -1) {
                                if (typeof menu_container.childNodes[cur_item].click === "function") {
                                    /// Firefox
                                    ///NOTE: Sadly, opening new tabs this way (or with the simulated event) trigger's the pop-up blocker.
                                    menu_container.childNodes[cur_item].click();
                                } else {
                                    /// Simulate a mouse click.
                                    fake_event = document.createEvent("MouseEvents");
                                    fake_event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                                    menu_container.childNodes[cur_item].dispatchEvent(fake_event);
                                }
                            }
                        /// Escape
                        } else if (e.keyCode === 27) {
                            close_menu();
                        } else {
                            /// Allow all other keys to pass to the rest of the page like normal.
                            return;
                        }
                        
                        /// Stop other event hooks from being triggered (such as closing callouts).
                        ///NOTE: e.stopPropagation() does not work because other events are also attached to the document object.
                        e.stopPropagation();
                        
                        /// Chromium somtimes does not have preventDefault().
                        if (typeof e.preventDefault === "function") {
                            e.preventDefault();
                        }
                        return false;
                    }
                };
                
                /// This will be detached by close_menu().
                ///NOTE: Settings useCapture to true allows this event to be triggered before bubbling events,
                ///      which allows stopImmediatePropagation() to prevent all other events, even those added earlier (such as closing the callouts).
                document.addEventListener("keydown", key_handler, true);
                
                /// A delay is needed in order for the CSS transition to occur.
                window.setTimeout(function ()
                {
                    context_menu.style.opacity = 1;
                    
                    if (typeof open_callback === "function") {
                        open_callback();
                    }
                }, 0);
            }
            
            
            /**
             * Handle opening the context menu, even if one is already open.
             *
             * @example show_context_menu({x: leftOffset, y: topOffset, fixed: true}, [{text: "Menu Item 1", link: "http://link.com"}, [text: "Menu Item 2", link: some_function, line: true}]); /// Creates a menu with one external link and one link that runs a function with a line break separating the two.
             * @param   get_pos        (function)            A function that returns an object describing the context menu's X and Y and optionally the CSS position style.
             *                                               Object format: {x: (number), y: (number)[, absolute: (boolean)]}
             * @param   menu_items     (array)               An array containing object(s) specifying the text of the menu items, the corresponding links, whether or not to add a line break, and an optional ID.
             *                                               Array format: [{text: (string), link: (string or function), line: (truthy or falsey (optional)), id: (variable (optional))}, ...]
             * @param   selected       (variable)            The ID of the menu item that should be selected by default.  Sending FALSE will ignore all IDs.
             * @param   open_callback  (function) (optional) The function to send to open_menu() as a callback when the menu opens.
             * @param   close_callback (function) (optional) The function to send to close_menu() as a callback when the menu closes.
             * @note    This is the function stored in the show_context_menu variable.
             * @note    Called by the wrench menu onclick event.
             * @return  NULL
             */
            return function show_context_menu(pos, menu_items, selected, open_callback, close_callback)
            {
                /// If it is already open, close it and then re-open it with the new menu.
                ///TODO: Determine if this can (or should) ever happen.
                if (is_open) {
                    close_menu(function ()
                    {
                        if (typeof close_callback === "function") {
                            close_callback();
                        }
                        open_menu(pos, menu_items, selected, open_callback, close_callback);
                    });
                } else {
                    open_menu(pos, menu_items, selected, open_callback, close_callback);
                }
            };
        }());
        
        
        /**
         * Display the panel window.
         *
         * @return NULL
         */
        show_panel = (function ()
        {
            var center_hor,
                is_open = false,
                panel   = document.createElement("div");
            
            ///NOTE: The default style does has "display" set to "none" and "position" set to "fixed."
            panel.className = "panel";
            
            /// Attach the element to the DOM now so that it does not have to be done each time it is displayed.
            document.body.insertBefore(panel, null);
            
            /**
             * Close a panel, if it is open already.
             *
             * @param callback (function) The function to call after the panel is closed or (asynchronously) as fast as possible if it is already closed
             */
            function close_panel(callback)
            {
                /**
                 * Prepare the panel and (possibly) trigger the callback.
                 */
                function on_panel_close()
                {
                    /// Set the panel's is_open status to false after the delay to prevent the menu from being re-opened in the meantime.
                    is_open = false;
                    
                    if (BF.cssTransitions) {
                        /// Make sure that this function will not fire again when the panel opens.
                        panel.removeEventListener("transitionend",       on_panel_close, false);
                        panel.removeEventListener("oTransitionEnd",      on_panel_close, false);
                        panel.removeEventListener("webkitTransitionEnd", on_panel_close, false);
                    }
                    
                    /// Ensure that the display is set to none (even though it might already be if this is the first time or if no CSS transitions were used).
                    panel.style.display = "none";
                    
                    window.removeEventListener("resize", center_hor);
                    
                    if (callback) {
                        callback();
                    }
                }
                
                /// Is the panel already open and are CSS transitions supported by the browser?
                if (is_open && BF.cssTransitions) {
                    panel.addEventListener("transitionend",       on_panel_close, false);
                    panel.addEventListener("oTransitionEnd",      on_panel_close, false);
                    panel.addEventListener("webkitTransitionEnd", on_panel_close, false);
                    
                    /// Make the panel retract upwards.
                    panel.style.top = -panel.offsetHeight + "px";
                } else {
                    panel.style.display = "none";
                    /// A delay is needed so that if there is a callback, it will run after the menu has been visually removed from the page.
                    window.setTimeout(on_panel_close, 0);
                }
            }
            
            /**
             * Display the panel and make it slide down.
             *
             * @param panel_el (DOM element)         The DOM element to place into the container
             * @param buttons  (array)    (optional) An array of the buttons to display at the bottom of the panel
             * @param onpress  (function) (optional) The function to call when a button is pressed
             *                                       If the onpress() function returns FALSE (not just falsey), the panel will not close.
             *                                       If onpress() returns anything else, the panel will close.
             *                                       This could be used, for example, to validate a form and prevent the closing of the panel if the submission was invalid.
             */
            function open_panel(panel_el, buttons, onpress)
            {
                var button_count,
                    done_button     = document.createElement("button"),
                    panel_container = document.createElement("div");
                
                /**
                 * Check to see if onpress cancles the button press event.
                 *
                 * @param which    (number)   Which button was pressed
                 * @param callback (function) The function to call if onpress() does not cancel it
                 * @note  If onpress() returns anything other than FALSE, the callback function will be called.
                 */
                function button_press(which, callback)
                {
                    var cancel;
                    
                    if (onpress) {
                        /// If onpress() returns FALSE, do not call the callback.
                        cancel = (onpress(which) === false);
                    }
                    
                    if (!cancel) {
                        callback();
                    }
                }
                
                /**
                 * Center the panel horizontally
                 *
                 * @note This is a separate function because it called both when the panel is created and on client resize.
                 */
                center_hor = function ()
                {
                    ///NOTE: document.body.clientWidth does not include the scroll bars.
                    var clientWidth = document.body.clientWidth,
                        left = panel.style.left;
                    
                    /// Set the max with and height to get a little smaller than the screen so that the contents will always be visible.
                    ///NOTE: document.body.clientHeight will not work right because it takes into account the entire page height, not just the viewable region.
                    panel.style.maxHeight = (window.innerHeight - 80) + "px";
                    
                    panel.style.left = ((clientWidth / 2) - (panel.offsetWidth / 2)) + "px";
                    
                    /// For an unknown reason, the panel seems to change sizes when the left value is changed, so if the left value changes, it needs to realign the panel.
                    if (panel.style.left !== left) {
                        center_hor();
                    }
                };
                
                is_open = true;
                
                /// Add the panel to the container.
                ///NOTE: The reason why panel_container is used is to provide a single element that can be attached to the DOM so that the page does not have to reflow multiple times.
                ///      Also, clearing innerHTML works much better when there is just one element to clear.
                panel_container.appendChild(panel_el);
                
                /// Add buttons to the container.
                if (buttons) {
                    button_count = buttons.length;
                    /**
                     * Create buttons from the buttons array.
                     */
                    buttons.forEach(function (button, i)
                    {
                        /// Create and add the button to the panel container.
                        /// A class attribute is given that indicates which button this is in order to properly align the buttons.
                        panel_container.appendChild(BF.create_dom_el("button", {textContent: button, className: "button button" + (i + 1) + "of" + button_count}, {click: function ()
                        {
                            /// Close the panel if the event is not canceled by onpress().
                            button_press(i, close_panel);
                        }}));
                    });
                } else {
                    done_button.innerHTML = BF.lang.done;
                    done_button.className = "button doneButton";
                    /// Check to see if the button press event is canceled.
                    /// An anonymous function must be used because we do not want to send the event object to close_panel().
                    done_button.onclick = function ()
                    {
                        button_press(0, close_panel);
                    };
                    
                    panel_container.appendChild(done_button);
                }
                
                /// Remove the old panel.
                ///TODO: Figure out if it is better not to clear the panel if the panel is the same as the previous one.
                panel.innerHTML = "";
                panel.appendChild(panel_container);
                
                /// Remove CSS Transitions so that the element will immediately be moved just outside of the visible area so that it can slide in nicely (if CSS transitions are supported).
                panel.className = "panel";
                /// Ensure that the element is visible (display is set to "none" when it is closed).
                panel.style.display = "block";
                /// Quickly move the element to just above of the visible area.
                panel.style.top = -panel.offsetHeight + "px";
                
                /// Set the style.left and style.maxHeight properties.
                center_hor();
                /// Attach the centering function to onresize so that the panel always stays centered.
                window.addEventListener("resize", center_hor);
                /// Restore CSS transitions (if supported by the browser).
                panel.className = "panel slide";
                /// Move the panel to the very top of the page.
                /// The element has enough padding on the top to ensure that everything inside of it is visible to the user.
                ///NOTE: Opera needs a short delay in order for the transition to take effect.
                window.setTimeout(function ()
                {
                    panel.style.top = 0;
                    /// Center the element on the page again, just to make sure.
                    center_hor();
                }, 0);
            }
            
            /**
             * Close an open panel (if any) and open the new one.
             *
             * @param panel_el (DOM element)         The DOM element to place into the container
             * @param buttons  (array)    (optional) An array of the buttons to display at the bottom of the panel
             * @param onpress  (function) (optional) The function to call when a button is pressed
             * @note  See open_panel() for details.
             */
            return function show_panel(panel_el, buttons, onpress)
            {
                /// First, try to close any open panel, and then open the new one.
                close_panel(function ()
                {
                    open_panel(panel_el, buttons, onpress);
                });
            };
        }());
        
        
        /// *********************************
        /// * Start of Mouse Hiding Closure *
        /// *********************************
        
        /**
         * Register events to manage the cursor for better readability.
         */
        (function ()
        {
            var hidden_css = "hidden_cursor",
                hide_cursor_timeout,
                is_cursor_visible = true;
            
            /**
             * Set the mouse cursor back to its default state.
             *
             * @return NULL
             * @note   Called by hide_cursor_delayed(), page.onmousedown(), and page.onmouseout() window.onresize().
             */
            function show_cursor()
            {
                /// Prevent the cursor from being hidden.
                window.clearTimeout(hide_cursor_timeout);
                if (!is_cursor_visible) {
                    page.classList.remove(hidden_css);
                    is_cursor_visible = true;
                }
            }
            
            /**
             * Hide the cursor after a short delay.
             *
             * @return NULL
             * @note   Called by page.onmousedown() and page.onmousemove().
             */
            function hide_cursor_delayed()
            {
                window.clearTimeout(hide_cursor_timeout);
                
                hide_cursor_timeout = window.setTimeout(function ()
                {
                    /// Opera (at least 10.53) has no alternate cursor support whatsoever.
                    page.classList.add(hidden_css);
                    
                    is_cursor_visible = false;
                }, 2000);
            }
            
            /**
             * Handle cursor hiding when a mouse button is clicked.
             *
             * @param  e (object) The event object (normally supplied by the browser).
             * @return NULL
             * @note   This does not work in WebKit/Blink.
             * @see    https://code.google.com/p/chromium/issues/detail?id=26723
             */
            page.addEventListener("mousedown", function (e)
            {
                /// Was the right mouse button clicked?
                ///TODO: Determine how to detect when the menu comes up on a Mac?
                ///NOTE: In the future, it may be necessary to map the mouse buttons to variables because most are different on IE; however, the right mouse button is always 2.
                if (e.button === 2) {
                    /// Since the right mouse button usually brings up a menu, the user will likely want to see the cursor indefinitely.
                    show_cursor();
                } else {
                    /// Other types of clicks should show the mouse cursor briefly but still hide it again.
                    show_cursor();
                    hide_cursor_delayed();
                }
            }, false);
            
            /**
             * Prevent hiding the cursor when cursor moves off the scroll.
             *
             * @param  e (object) The event object (normally supplied by the browser).
             * @return NULL
             * @note   Called by page.onmouseout().
             */
            page.onmouseout = function (e)
            {
                ///NOTE: For future IE compatibility, currentTarget is this and relatedTarget is event.toElement.  (Currently, IE cannot handle custom cursors yet.)
                var curTarget = e.currentTarget,
                    relTarget = e.relatedTarget;
                
                ///NOTE: onmouseout does not work as expected.  It fires when the cursor moves over any element, even if it is still over the parent element.
                ///      Therefore, we must check all of the parent elements to see if it is still over the element in question.
                ///      IE actually supports the correct behavior with onmouseleave.
                while (curTarget !== relTarget && relTarget !== null && relTarget.nodeName !== "BODY") {
                    relTarget = relTarget.parentNode;
                }
                
                /// Did the mouse cursor leave the parent element?
                if (curTarget !== relTarget) {
                    show_cursor();
                }
            };
            
            
            (function ()
            {
                /// WebKit/Blink wrongly trigger the window.onmousemove too many times, but we can use this varible to prevent show_cursor() from being triggered wrongly.
                var mouse_moved,
                    /// This variable is used to stop immediate propagation (instead of using e.stopImmediatePropagation()) because we only want to stop
                    /// window.onmousemove(), not all other onmousemove events.
                    stop_immediate_propagation;
                
                /**
                 * Trigger cursor hiding.
                 *
                 * @param e (object) The event object
                 */
                page.addEventListener("mousemove", function (e)
                {
                    /// Since sometimes onmousemove is called when the cursor does not actually move (e.g., scrolling), we need to check to see if the mouse really moved.
                    if (BF.mouse_x !== e.clientX && BF.mouse_y !== e.clientY) {
                        if (!is_cursor_visible) {
                            show_cursor();
                        }
                        hide_cursor_delayed();
                        
                        /// Keep track of the cursor's position so that we can tell if the mouse really moved.
                        BF.mouse_x = e.clientX;
                        BF.mouse_y = e.clientY;
                        /// Setting "mouse_moved" as TRUE tells window.onmousemove that the mouse really moved.
                        mouse_moved = true;
                    } else {
                        /// Setting "mouse_moved" as FALSE tells window.onmousemove that the mouse didn't actually move.
                        mouse_moved = false;
                    }
                    
                    /// Tell window.onmousemove() that we don't want it to fire like normal because the cursor is over the text.
                    stop_immediate_propagation = true;
                });
                
                /**
                 * Show the cursor when the mouse moves on other parts of the screen.
                 *
                 * @note This is useful, for example, if the user changes tabs when the cursor is over the text area because page.onmouseout() does not get called.
                 */
                window.addEventListener("mousemove", function ()
                {
                    ///NOTE: If the mouse is also over the text area, stop_immediate_propagation will be set to TRUE.
                    if (stop_immediate_propagation) {
                        stop_immediate_propagation = false;
                    /// Did the mouse actually move or was this event wrongly triggered.
                    /// WebKit/Blink particularly trigger this function wrongly.
                    } else if (mouse_moved) {
                        /// If the mouse is off of the text area, show the cursor.
                        show_cursor();
                    }
                });
            }());
            
            /**
             * Possibly hide the cursor on resize.
             *
             * If the cursor is not hovering over the text area but it is after a resize (very common when going into full screen mode)
             * the cursor will not be hidden unless the hide_cursor_delayed() function is triggered on resize.
             *
             * @return NULL
             */
            window.addEventListener("resize", function ()
            {
                ///NOTE: Does not work on Chromium 12/Firefox 3.6 because the element that the mouse is hovering over does not update on resize.
                hide_cursor_delayed();
            }, false);
            
            /// Hide the mouse cursor after switching between tabs or windows.
            ///NOTE: Could use the new Page Visibility API, such as onvisibilitychange.
            window.onfocus = hide_cursor_delayed;
        }());
        
        /// *******************************
        /// * End of Mouse Hiding Closure *
        /// *******************************
        
        
        /// *******************************
        /// * Start of Wrench Button/Menu *
        /// *******************************
        
        /**
         * Add the rest of the BibleForge user interface (currently, just the wrench menu).
         *
         * @note   This function is called immediately.
         * @return NULL
         */
        (function ()
        {
            var show_about_bible_panel,
                show_configure_panel,
                show_contact_panel,
                wrench_button = document.createElement("input"),
                wrench_label  = document.createElement("label");
            
            ///NOTE: An IE 8 bug(?) prevents modification of the type attribute after an element is attached to the DOM, so it must be done earlier.
            wrench_button.type  = "button";
            wrench_button.id    = "wrenchIcon" + context.viewPort_num;
            wrench_button.title = BF.lang.wrench_title;
            wrench_button.alt   = BF.lang.wrench_title;
            
            context.system.event.attach("languageChange", function ()
            {
                wrench_button.title = BF.lang.wrench_title;
                wrench_button.alt   = BF.lang.wrench_title;
            });
            
            wrench_label.htmlFor = wrench_button.id;
            
            /// A label is used to allow the cursor to be all the way in the corner and still be able to click on the button.
            ///NOTE: Because of a bug in WebKit, the elements have to be attached to the DOM before setting the className value.
            ///TODO: Report the WebKit (or Chrome?) bug.
            wrench_label.appendChild(wrench_button);
            context.topBar.insertBefore(wrench_label, context.topBar.childNodes[0]);
            
            /// Make the elements transparent at first and fade in (using a CSS transition).
            wrench_label.style.opacity = 0;
            wrench_label.className     = "wrenchPadding";
            ///NOTE: In order for the CSS transition to occur, there needs to be a slight delay.  Mozilla 4.0 seems to need at least 20 milliseconds.
            window.setTimeout(function ()
            {
                wrench_label.style.opacity = 1;
            }, 20);
            
            wrench_button.className = "wrenchIcon";
            
            
            /**
             * Prepare the configuration panel.
             *
             * @return A function that shows the panel.
             * @note   Called immediately in order to create another function that shows the panel.
             */
            show_configure_panel = (function ()
            {
                ///FIXME: Make it so that this text can be updated onLanguageChange.
                var panel_element = document.createElement("div");
                
                /**
                 * Create a DOM element to display the configuration menu.
                 *
                 * @param pane (string) The name of the settings pane to display initially.
                 * @note  Currently, only one pane is used.
                 * @todo  Create tabs for each section of the settings and dynamically display the sections when clicked.
                 */
                function create_element_from_config(pane)
                {
                    var apply_change,
                        config       = context.settings[pane],
                        container_el = document.createElement("fieldset"),
                        cur_option   = 0,
                        input_el,
                        label_el,
                        legend_el    = document.createElement("legend"),
                        option_count,
                        table_el     = document.createElement("table"),
                        table_row,
                        table_cell;
                    
                    /**
                     * Create the function that changes the settings.
                     *
                     * @return A function.
                     * @note   Called immediately.
                     */
                    function make_apply_change(settings_obj, option_name)
                    {
                        /**
                         * Implement the change in setting.
                         *
                         * @return NULL
                         * @note   Called when the user changes a setting.
                         */
                        return function (new_value)
                        {
                            settings_obj[option_name] = new_value;
                        };
                    }
                    
                    /**
                     * Create the function that sends the new value to the settings.
                     *
                     * @return A function.
                     * @note   Called immediately.
                     */
                    function make_checkbox_onclick(this_apply_change)
                    {
                        /**
                         * Run the specific function to make the change.
                         *
                         * @return NULL
                         * @note   Called when the user clicks a checkbox.
                         * @note   Keyboard actions (such as pressing Space Bar) counts as a click.
                         */
                        return function ()
                        {
                            this_apply_change(this.checked);
                        };
                    }
                    
                    /**
                     * Create the function that sends the new value to the settings.
                     *
                     * @return A function.
                     * @note   Called immediately.
                     */
                    function make_textbox_onchange(this_apply_change)
                    {
                        /**
                         * Run the specific function to make the change.
                         *
                         * @return NULL
                         * @note   Called after a user changes a textbox.
                         * @todo   It should fire immediately, not just onblur.
                         */
                        return function ()
                        {
                            this_apply_change(this.value);
                        };
                    }
                    
                    
                    ///NOTE: textContent is esentially the same as innerText.
                    legend_el.textContent = BF.lang[pane];
                    container_el.appendChild(legend_el);
                    option_count = context.settings[pane].options.length;
                    
                    /// Create the input items in the table.
                    ///FIXME: Only create the selected pane and create the other panes when they are clicked on.
                    while (cur_option < option_count) {
                        ///NOTE: Passing -1 to insertRow() and insertCell() adds a row/cell to the end of the table.
                        table_row = table_el.insertRow(-1);
                        
                        /// Insert a <td> for the name of the setting.
                        table_cell = table_row.insertCell(-1);
                        label_el   = document.createElement("label");
                        
                        /// The label identifies with the input element via a unique id.
                        label_el.htmlFor = pane + "_" + config.options[cur_option].settings;
                        label_el.textContent = BF.lang[config.options[cur_option].settings];
                        table_cell.appendChild(label_el);
                        
                        /// Insert a <td> for the input element.
                        table_cell = table_row.insertCell(-1);
                        
                        /// Create the function that changes the proper settings before the switch statement so that it can be used multiple times inside of it.
                        apply_change = make_apply_change(context.settings[pane], config.options[cur_option].settings);
                        
                        switch (config.options[cur_option].type) {
                        case "checkbox":
                            input_el      = document.createElement("input");
                            input_el.type = "checkbox";
                            
                            /// Set the current value.
                            input_el.checked = context.settings[pane][config.options[cur_option].settings];
                            
                            input_el.onclick = make_checkbox_onclick(apply_change);
                            break;
                        ///NOTE: Not yet used.
                        case "text":
                            input_el      = document.createElement("input");
                            input_el.type = "text";
                            
                            /// Set the current value.
                            input_el.value = context.settings[pane][config.options[cur_option].settings];
                            
                            input_el.onchange = make_textbox_onchange(apply_change);
                            break;
                        }
                        /// Give the input element an id that matches the label so that clicking the label will interact with the input field.
                        input_el.id = label_el.htmlFor;
                        
                        table_cell.appendChild(input_el);
                        
                        cur_option += 1;
                    }
                    
                    container_el.appendChild(table_el);
            
                    return container_el;
                }
                
                /**
                 * Create the settings_config variable when the language changes and re-create the element.
                 */
                context.system.event.attach("languageChange", function ()
                {
                    ///TODO: Display the last pane the user selected, not just View.
                    panel_element = create_element_from_config("view");
                });
                
                ///TODO: Determine which settings pane to create first (based on the last one the user used). (But currently, there is only one pane.)
                ///TODO: Display the last pane the user selected, not just View.
                panel_element = create_element_from_config("view");
                
                return function show_configure_panel()
                {
                    show_panel(panel_element);
                };
            }());
            
            
            /**
             * Create the contact panel.
             */
            show_contact_panel = function ()
            {
                var email = BF.create_dom_el("div", {textContent: BF.lang.form_email}, null, [BF.create_dom_el("a", {href: "mailto:hello@bibleforge.com", textContent: "hello@bibleforge.com"})]),
                    submitter_name  = BF.create_dom_el("input",    {"placeholder": BF.lang.form_your_name,  type: "text"}),
                    submitter_email = BF.create_dom_el("input",    {"placeholder": BF.lang.form_your_email, type: "text"}),
                    message         = BF.create_dom_el("textarea", {"placeholder": BF.lang.form_message});
                
                ///TODO: Remember the user's info.
                ///TODO: Warn about leaving email blank. (Could be done on validation.)
                show_panel(BF.create_dom_el("form", {className: "emailForm"}, null, [email, submitter_name, submitter_email, message]),
                    /// Show two buttons.
                    [BF.lang.cancel, BF.lang.send],
                    /**
                     * Validate the form and (possibly) send the message
                     */
                    function onpress(which)
                    {
                        var message_text;
                        
                        /// If the second button was pressed ("Send"), send the message.
                        if (which === 1) {
                            message_text = message.value.trim();
                            if (message_text) {
                                ///TODO: Use POST instead of GET (bibleforge.js currently does not handle POST data).
                                (new BF.Create_easy_ajax()).query("GET", "/api", "t=email&submitter_name=" + window.encodeURIComponent(submitter_name.value) + "&submitter_email=" + window.encodeURIComponent(submitter_email.value) + "&message=" + window.encodeURIComponent(message_text), function success(data)
                                {
                                    /// Was the message sent properly?
                                    if (BF.parse_json(data) !== true) {
                                        ///TODO: Warn the user in a nicer way.
                                        window.alert(BF.lang.form_error);
                                    }
                                });
                            } else {
                                /// If there is no message, do not attempt to send a message or close the panel.
                                return false;
                            }
                        }
                    }
                );
            };
            
            /**
             * Create the about Bible version panel.
             */
            show_about_bible_panel = function ()
            {
                show_panel(BF.create_dom_el("div", {className: "aboutBible"}, null, [
                    BF.create_dom_el("legend", {textContent: BF.insert({v: BF.lang.abbreviation}, BF.lang.about_version)}),
                    BF.create_dom_el("div", {innerHTML: BF.lang.credits})
                ]));
            };
            
            
            /**
             * Prepare to display the context menu near the wrench button.
             *
             * @param  e (object) (optional) The event object optionally sent by the browser.
             * @note   Called when the user clicks on the wrench button.
             * @return NULL
             */
            wrench_button.onclick = function (e)
            {
                /// Create the configuration menu.
                show_context_menu(function get_pos()
                {
                    var wrench_pos = BF.get_position(wrench_button);
                    
                    return {x: wrench_pos.left, y: wrench_pos.top + wrench_button.offsetHeight};
                },
                /// Create the menu items.
                [
                    {
                        text: BF.lang.configure,
                        link: show_configure_panel
                    },
                    {
                        line: true,
                        text: BF.lang.blog,
                        link: "http://blog.bibleforge.com/"
                    },
                    {
                        text: BF.insert({v: BF.lang.abbreviation}, BF.lang.about_version),
                        link: show_about_bible_panel
                    },
                    {
                        text: BF.lang.about,
                        link: "http://bibleforge.wordpress.com/about/"
                    },
                    {
                        text: BF.lang.contact,
                        link: show_contact_panel
                    }
                ],
                /// Make sure no items are selected by default.
                false,
                function open()
                {
                    /// Because the context menu is open, keep the icon dark.
                    wrench_button.classList.add("activeWrenchIcon");
                },
                function close()
                {
                    /// When the menu closes, the wrench button should be lighter.
                    wrench_button.classList.remove("activeWrenchIcon");
                });
            
                /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
                e.stopPropagation();
            };
        }());
        
        /// *******************************
        /// * Start of Wrench Button/Menu *
        /// *******************************
        
        /**
         * Snap mouse wheel scrolling.
         */
        (function ()
        {
            /**
             * Control the amount of scrolling when the mouse wheel turns.
             *
             * @param e (event object) The wheel event object.
             */
            var mousewheel_scroller = function (e)
            {
                /// Mozilla's DOMMouseScroll event supports event.details.
                ///NOTE: e.details differs from e.wheelDelta in the amount and sign.
                var delta = (typeof e.wheelDelta !== "undefined" ? e.wheelDelta : -e.detail),
                    line_height = context.system.properties.line_height;
                
                /// Force the browser to scroll three lines of text up or down.
                ///NOTE: window.pageYOffset % line_height calculates the offset from the nearest line to snap the view to a line.
                ///NOTE: If between lines, this actually scrolls up more than 3 lines and down less than 3, but it is simple and doesn't seem to impede usability.
                window.scrollBy(window.pageXOffset, (line_height * (delta > 0 ? -3 : 3)) - (window.pageYOffset % line_height));
                e.preventDefault();
            };
            
            /// WebKit/Opera/IE9(?)
            window.addEventListener("mousewheel",     mousewheel_scroller, false);
            /// Mozilla
            window.addEventListener("DOMMouseScroll", mousewheel_scroller, false);
        }());
        
        /// ****************************
        /// * Start of Callout Manager *
        /// ****************************
        
        BF.callout_manager = {};
        
        (function ()
        {
            var callout_maker,
                callouts = {},
                lex_cache = {},
                maximized_callout;
            
            /// Create the user.expanad_def property to be able to save the settings when changed.
            context.settings.add_property(context.settings.user, "expand_def", typeof context.settings.user.expanad_def === "undefined" ? true : context.settings.user.expanad_def);
            
            /// Since this is not styled by initially, it needs to be set now.
            if (BF.lang.linked_to_orig) {
                /// Show a hand cursor over words.
                page.classList.add("linked");
            }
            
            function walk_callouts(callback)
            {
                Object.keys(callouts).forEach(function (i)
                {
                    callback(callouts[i], i);
                });
            }
            
            callout_maker = (function ()
            {
                /**
                 * The closure for creating callouts.
                 */
                var cue,
                    create_callout,
                    display_callout;
                
                create_callout = (function ()
                {                
                    /**
                     * Determine where the callout should be positioned in order to be able to point to the correct word.
                     *
                     * @param callout    (element) The DOM element representing the callout.
                     * @param point_to   (element) The element the callout should point to.
                     * @param split_info (object)  An object containing information about where the user originally clicked and possibly which part of the word the user clicked.
                     *                             Object structure: {mouse_x: number, mouse_y: number, which_rect: number}
                     * @note  For now at least, this function is placed outside of the callout object so that it does not have to be created each time a callout is made.
                     * @note  This function will not calculate the proper position if the callout is maximized.
                     */
                    function calculate_pos(callout, point_to, split_info)
                    {
                        var callout_offsetHeight = callout.offsetHeight,
                            callout_offsetWidth  = callout.offsetWidth,
                            distance_from_right, /// The distance (in pixels) from the right edge of the viewport to middle_x
                            i,
                            middle_x, /// The middle (horizontally) of the word being pointed to.
                            point_to_offsetTop,
                            /// Get the rectangles that represent the object.
                            ///NOTE: If a word is wrapped (specifically a hyphenated word), there will be multiple rectangles.
                            point_to_rects = point_to.getClientRects(),
                            pointer_length   = 12, /// Essentially from the tip of the pointer to the callout
                            pointer_distance = 28, /// The optimal distance from the left of the callout to the middle of the pointer.
                            res = {},
                            which_rect = 0;
                        
                        /// Does the word wrap? (See Judges 1:11 "Kirjath-sepher").
                        if (point_to_rects.length > 1) {
                            /// Did it already figure out which part of the word was clicked on?
                            if (split_info.which_rect) {
                                /// Does the rectangle that the user first clicked exist?
                                ///NOTE: For example, if the viewport is very small, the word "Jonath-elem-rechokim" in Psalm 56:title may wrap twice times, and if the user clicked on the third part,
                                ///      and then the user resized the viewport so that now it only wraps once, there will be just two rectangles, not three.
                                ///      So in this case, when the viewport is resized, it will select the second section.
                                if (split_info.which_rect < point_to_rects.length) {
                                    /// Since the rectangle exists, use that.
                                    which_rect = split_info.which_rect;
                                } else {
                                    /// Since the rectangle does not exist, use the last one.
                                    which_rect = point_to_rects.length - 1;
                                }
                            } else {
                                /// Loop through each rectangle, and try to find which part the use clicked on.
                                for (i = point_to_rects.length - 1; i >= 0; i -= 1) {
                                    /// Did the user click on this rectangle?
                                    if (split_info.mouse_x >= point_to_rects[i].left && split_info.mouse_x <= point_to_rects[i].right && split_info.mouse_y >= point_to_rects[i].top && split_info.mouse_y <= point_to_rects[i].bottom) {
                                        which_rect = i;
                                        split_info.which_rect = i;
                                        break;
                                    }
                                }
                                /// If the user clicked on the word before it wrapped and then the view was resized so that it now wraps, it will not find a matching rectangle.
                                /// If it cannot find the part of the word that it should point to, it will default to the first rectangle because which_rect defaults to 0.
                                /// Store which_rect so that it does not try to find it again in vain.
                                split_info.which_rect = which_rect;
                            }
                        } else if (point_to_rects.length < 1) {
                            /// If the element gets removed from the page, it will have a length of 0.
                            /// In this case, we can do nothing and the callout should be removed shortly.
                            /// This can occur if a callout is opened and then a new query is sent (common when using the back/forward buttons).
                            return;
                        }
                        
                        ///NOTE: Since getClientRects() does not take into account the page offset, we need to add it in.
                        middle_x           = point_to_rects[which_rect].left + window.pageXOffset + (point_to_rects[which_rect].width / 2);
                        point_to_offsetTop = point_to_rects[which_rect].top  + window.pageYOffset;
                        
                        /// Try to put the callout above the word.
                        if (callout_offsetHeight + pointer_length < point_to_offsetTop - context.system.properties.topBar_height - window.pageYOffset) {
                            res.top = point_to_offsetTop - callout_offsetHeight - pointer_length;
                            res.pointerClassName = "pointer-down";
                        /// Else, put the callout below the word.
                        } else {
                            res.top = point_to_offsetTop + point_to_rects[which_rect].height + pointer_length;
                            res.pointerClassName = "pointer-up";
                        }
                        
                        distance_from_right = window.innerWidth - middle_x;
                        /// Can the pointer fit on the far left?
                        if (distance_from_right > callout_offsetWidth) {
                            res.left = middle_x - pointer_distance;
                        } else {
                            /// If the pointer will move off of callout on the right side (distance_from_right < 50),
                            /// the callout needs to be moved to the left a little further (pushing the callout off the page a little).
                            res.left = (window.innerWidth - callout_offsetWidth - pointer_distance + 8) + (distance_from_right < 50 ? 50 - (distance_from_right) : 0);
                        }
                        
                        res.pointer_left = (middle_x - res.left - pointer_length);
                        
                        return res;
                    }
                    
                    /**
                     * Create the callout element and attach it to a word.
                     *
                     * @param  id         (number)  The word ID
                     * @param  point_to   (element) The element the callout should point to.
                     * @param  ajax       (object)  The ajax object created by BF.Create_easy_ajax().
                     * @param  split_info (object)  An object containing information about where the user originally clicked and possibly which part of the word the user clicked.
                     *                              Object structure: {mouse_x: number, mouse_y: number, which_rect: number}
                     * @return A object that manages the callout.
                     */
                    return function create_callout(id, point_to, ajax, split_info, detailed, ignore_state)
                    {
                        var callout = document.createElement("div"),
                            inside  = document.createElement("div"),
                            pointer = document.createElement("div"),
                            transparent_el,
                            
                            callout_obj,
                            loading_timer,
                            pos = {};
                        
                        callout.className = "callout";
                        inside.className  = "inside";
                        
                        /// Prevent the page from scrolling when scrolling the content in the callout.
                        /// WebKit/Opera/IE9(?)
                        inside.addEventListener("mousewheel", function (e)
                        {
                            e.stopPropagation();
                        }, false);
                        /// Mozilla
                        inside.addEventListener("DOMMouseScroll", function (e)
                        {
                            e.stopPropagation();
                        }, false);
                        
                        callout.appendChild(inside);
                        callout.appendChild(pointer);
                        
                        /**
                         * Add a loading indicator if the content does not load very quickly.
                         *
                         * @note Delay the creation of the loading graphic because the data could load quickly enough as to make it unnecessary.
                         */
                        loading_timer = window.setTimeout(function ()
                        {
                            var loader = document.createElement("div");
                            
                            loader.style.opacity = "0";
                            loader.className = "loaders fade";
                            /// By default, loaders are invisible.
                            loader.style.visibility = "visible";
                            /// Center the graphic vertically.
                            loader.style.height = "100%";
                            inside.appendChild(loader);
                            /// Change the opacity after a delay to make it fade in (if the browser supports CSS transitions; otherwise the change is instant).
                            loading_timer = window.setTimeout(function () {
                                loader.style.opacity = ".6";
                            }, 0);
                        }, 500);
                        
                        /// Because callouts are closed when the user clicks off,
                        /// we notify the document.onclick() function that a callout was clicked on so it will ignore the click.
                        callout.addEventListener("click", function ()
                        {
                            BF.callout_manager.callout_clicked = true;
                        }, false);
                        
                        /// The element must be in the DOM tree in order for it to have a height and width.
                        document.body.appendChild(callout);
                        
                        callout_obj = {
                            /// Methods
                            /**
                             * Adjust the size of a callout as needed.
                             *
                             * Small callouts should not scroll, so they may need to be resized to fit the content.
                             *
                             * @note Called after replacing the HTML and changing the pronunciation style.
                             */
                            adjust_height: function ()
                            {
                                var diff;
                                
                                /// Is the callout small?  Only small callouts should be resized.
                                if (!this.maximized) {
                                    /// Determine if the callout needs to be resized to fit all of the content.
                                    /// E.g., go to Jeremiah 33 and click on "he" in the first verse.
                                    diff = inside.scrollHeight - inside.offsetHeight;
                                    if (diff > 0) {
                                        /// If the pointer is pointing down, the top position must also be changed.
                                        if (pointer.className === "pointer-down") {
                                            this.move(-diff);
                                        }
                                        
                                        /// Because of the padding, .clientHeight and .clientOffsetHeight do not return the right value,
                                        /// so to calculate the new height correctly, we calculate the visible area of the "inner" element,
                                        /// which is the same as the height of the callout minus the padding.
                                        callout.style.height = (inside.getClientRects()[0].height + diff) + "px";
                                        
                                        /// Because when the size changes, it could go off the top of the page, make sure to re-align it.
                                        /// E.g., go to Jeremiah 33 and click on "Chaldeans."
                                        this.align();
                                    }
                                }
                            },
                            /**
                             * Using outer variables, call the aligning function.
                             *
                             * @param smooth              (boolean)  (optional) Whether or not to transition the alignment. This is used only when transitioning between small and large callout sizes.
                             * @param transition_callback (function) (optional) A callback after the smooth transition completes.  Requires the smooth parameter to be TRUE.
                             */
                            align: function (smooth, transition_callback)
                            {
                                var height,
                                    left,
                                    new_pos,
                                    top,
                                    width;
                                
                                if (!callout || !pointer) {
                                    return;
                                }
                                
                                /// If the callout is showing details, it should be made to fill most of the screen.
                                if (this.maximized) {
                                    /// Place the callout just below the bottom of the top bar.
                                    top    = (context.system.properties.topBar_height + 10);
                                    height = ((context.system.properties.viewport.height - top) * 0.85);
                                    /// Since 800 pixels is the max width of the scroll, make sure to make the callout no bigger.
                                    ///NOTE: It might be good to have this number set in a variable.
                                    width = (context.system.properties.viewport.width > 800 ? 800 : context.system.properties.viewport.width) * 0.85;
                                    left  = (context.system.properties.viewport.width / 2) - (width / 2);
                                    
                                    /// This is used the first time to transition from small to large.
                                    if (smooth) {
                                        BF.transition(callout, [
                                            ///NOTE: This is not the best place to calculate start_val. This only works when assuming it used to have position absolute.
                                            ///NOTE: Could use transform: translate(x, y) to possibly optimize the transition.
                                            ///      The easiest way to do that would be to set the top and left to 0 and translate from there.
                                            {prop: "top",    duration: "300ms", end_val: top    + "px", failsafe: 500},
                                            {prop: "left",   duration: "300ms", end_val: left   + "px", failsafe: 500},
                                            {prop: "height", duration: "300ms", end_val: height + "px", failsafe: 500},
                                            {prop: "width",  duration: "300ms", end_val: width  + "px", failsafe: 500}
                                        ], transition_callback);
                                    } else {
                                        /// When the screen changes size after the callout is already large, just resize the callout as quickly as possible.
                                        callout.style.top    = top    + "px";
                                        callout.style.left   = left   + "px";
                                        callout.style.height = height + "px";
                                        callout.style.width  = width  + "px";
                                    }
                                } else {
                                    /// Align the callout to a specific word.
                                    new_pos = calculate_pos(callout, point_to, split_info);
                                    if (new_pos) {
                                        pos.top  = new_pos.top;
                                        pos.left = new_pos.left;
                                        callout.style.top  = pos.top  + "px";
                                        callout.style.left = pos.left + "px";
                                        pointer.className = new_pos.pointerClassName;
                                        pointer.style.left = new_pos.pointer_left + "px";
                                    }
                                }
                            },
                            /**
                             * Delete the callout and stop the query, if it has not already.
                             */
                            remove: function (callback, options)
                            {
                                /**
                                 * Actually remove the callout from the HTML tree.
                                 *
                                 * @note This is a separate function to prevent code reduplication.
                                 */
                                function remove_this_callout()
                                {
                                    ///NOTE: The .remove() function might be called multiple times.
                                    ///      For example, the .shrink() function, which can be called below could also trigger the .remove() function
                                    ///      if there is no word for the callout to be linked back to.
                                    if (callout) {
                                        document.body.removeChild(callout);
                                        callout = null;
                                    }
                                    
                                    if (typeof callback === "function") {
                                        callback();
                                    }
                                }
                                
                                /// In case the data is still loading, try to abort the request.
                                ajax.abort();
                                
                                /// If the callout is transitioning, the BF.hide_callout_details() function will refuse to remove the callout to prevent the user from accidentally closing it too fast.
                                /// For example, if the user double clicked the "More" button, it might trigger the BF.hide_callout_details() function.
                                /// Therefore, we need to wait until it is done transitioning, which should be momentarily.
                                ///NOTE: The callout_obj variable must be used, not the "this" object.
                                if (this.transitioning) {
                                    if (options && options.asap) {
                                        cue.terminate();
                                    } else {
                                        window.setTimeout(function ()
                                        {
                                            callout_obj.remove(callback, options);
                                        }, 50);
                                        return;
                                    }
                                }
                                
                                /// Is the callout maximized?  If so, it will need to be shrunk immediately and then removed.
                                if (this.maximized) {
                                    this.shrink(options);
                                }
                                remove_this_callout();
                            },
                            find_point_to_el: function ()
                            {
                                /// Does the point_to element still exist and is still attached to the DOM?
                                if (point_to && point_to.parentNode) {
                                    return point_to;
                                }
                                
                                /// Try looking for a new point_to element.
                                return document.getElementById(this.id);
                            },
                            /**
                             * Move the callout up or down.
                             *
                             * @param y (number) The amount to move vertically.
                             */
                            move: function (y)
                            {
                                pos.top += y;
                                /// Is the callout small?  Only small callouts need to be moved since detailed callouts have fixed position,
                                /// but when the large callouts transition to small ones, they need to know the correct position to return to.
                                if (!this.maximized) {
                                    callout.style.top = pos.top + "px";
                                }
                            },
                            /**
                             * Determine if the element that the callout is pointing to still exists.
                             *
                             * @return Boolean
                             * @note   The element the callout is pointing to could be removed when verses are cached.
                             */
                            point_to_el_exists: function ()
                            {
                                ///NOTE: If the ID of words changes, this will not work.
                                return !point_to ? false : Boolean(document.getElementById(id));
                            },
                            /**
                             * Write HTML to the callout.
                             *
                             * Also prevent the loading notifier from loading, if it has not already appeared
                             * and resize the callout if needed.
                             *
                             * @param html (string OR DOM element) The HTML or DOM element display in the callout.
                             */
                            replace_HTML: function (html)
                            {
                                /// Prevent the loading graphic from loading if it has not loaded yet.
                                window.clearTimeout(loading_timer);
                                /// Write the HTML, either via a string or DOM element.
                                if (typeof html === "string") {
                                    inside.innerHTML = html;
                                } else {
                                    inside.innerHTML = "";
                                    inside.appendChild(html);
                                }
                                
                                /// Make sure that the content fits without scrolling.
                                this.adjust_height();
                            },
                            /**
                             * Show details about the word
                             *
                             * @param data (object) An object containing the details of the word.
                             */
                            maximize: function (options)
                            {
                                var highlight_terms,
                                    that = this;
                                
                                /// Ignore all other requests while this (or another) callout is transitioning.
                                if (this.transitioning) {
                                    return;
                                }
                                
                                /// If another callout is already larger, it must be shrunk first.
                                /// If no callouts are larger, this variable will be falsey.
                                if (maximized_callout) {
                                    /**
                                     * Open the callout after the other one shrink.
                                     *
                                     * @note Because it needs to use the same context (i.e., the "this" variable; a.k.a. "that"), we need to wrap show_details in another function.
                                     */
                                    BF.callout_manager.shrink_maximized_callout({callback: function ()
                                    {
                                        that.maximize(options);
                                    }});
                                    
                                    /// Stop the current function and wait for the other callout to shrink.
                                    return;
                                }
                                
                                if (!options) {
                                    options = {};
                                }
                                
                                /// The "transitioning" property is used to prevent other callouts from being enlarged or this one from shrinking until after the transition has completed..
                                ///NOTE: It needs to be set down here (after checking for BF.hide_callout_details() because BF.hide_callout_details() also sets "transitioning" to TRUE.
                                this.transitioning = true;
                                
                                cue = BF.create_transition_cue(function on_transition_end()
                                {
                                    that.transitioning = false;
                                    
                                    if (options.callback) {
                                        options.callback();
                                    }
                                }, 1000);
                                
                                /// Get the current width and height of the element so that when it can return to its original size later.
                                ///NOTE: The offset and client widths and heights are incorrect, so we must use the CSS style (which includes units).
                                pos.css_height = window.getComputedStyle(callout).height;
                                pos.css_width  = window.getComputedStyle(callout).width;
                                
                                /// Create a blank element used to fade out the text.
                                transparent_el = document.createElement("div");
                                transparent_el.className = "transparent_el";
                                transparent_el.style.opacity = 0;
                                transparent_el.style.position = "fixed";
                                ///NOTE: Could set this to the position of the top bar if it updated when/if the top bar changes sizes (which it cannot do currently).
                                transparent_el.style.top    = 0;
                                transparent_el.style.bottom = 0;
                                transparent_el.style.left   = 0;
                                transparent_el.style.right  = 0;
                                /// Allow mouse clicks to go through it.
                                transparent_el.style.pointerEvents = "none";
                                transparent_el.style.zIndex = 10;
                                document.body.insertBefore(transparent_el, null);
                                
                                /// Fade in the transparent element.
                                /// There is a short delay to let the callout start moving.
                                cue.add({id: 0, terminator: BF.transition(transparent_el, {prop: "opacity", duration: "250ms", end_val: 0.7, timing: "steps(3, start)", delay: "50ms", failsafe: 500}, function ()
                                {
                                    cue.async_remove(0);
                                })});
                                
                                /// Make sure the callout appears above the semi-transparent element used to fade out the text.
                                callout.style.zIndex = 99;
                                
                                /// Fade out the pointer.
                                cue.add({id: 1, terminator: BF.transition(pointer, {prop: "opacity", duration: "300ms", end_val: 0, failsafe: 500}, function ()
                                {
                                    /// Hide the pointer after transitioning.
                                    pointer.style.display = "none";
                                    cue.async_remove(1);
                                })});
                                
                                ///NOTE: Small callouts are absolutely positioned, so if transitioning from small to larger (which should be the case),
                                ///      it will need to be repositioned.
                                if (callout.style.position !== "fixed") {
                                    callout.style.position = "fixed";
                                    /// Due to switching between absolute and fixed positioning, the callout's position must be recalculated
                                    /// in order for it to appear in the correct spot on the screen.
                                    /// Furthermore, this must be done before the callout's begins to transiting from small to large;
                                    /// otherwise, it would try to animate from the wrong position.
                                    callout.style.top  = (callout.offsetTop  - window.pageYOffset) + "px";
                                    callout.style.left = (callout.offsetLeft - window.pageXOffset) + "px";
                                }
                                
                                /// Tell the callout to transition to a larger font size for certain words.
                                cue.add({
                                    sync: function ()
                                    {
                                        callout.classList.add("large_callout");
                                    },
                                    delay: 0
                                });
                                
                                /// While the callout is transitioning, switch the CSS to hide certain content and show others.
                                /// E.g., the "more" button is hidden when showing details.
                                cue.add({
                                    sync: function ()
                                    {
                                        callout.classList.add("detailed_callout");
                                    },
                                    delay: 200
                                });
                                
                                ///NOTE: This is used by .align() to know how the callout should be aligned.
                                this.maximized = true;
                                
                                /// Resize the callout to take up more of the screen.
                                this.align(true);
                                
                                if (!options.ignore_state) {
                                    highlight_terms = BF.get_highlighted_terms();
                                    /// Change the URL to allow linking to this specific resource.
                                    /// This way, if the user reload the page (or links to this URL) he will be taken back to the verse where the callout is pointing to.
                                    ///NOTE: The trailing slash is necessary to make the meta redirect to preserve the entire URL and add the exclamation point to the end.
                                    BF.history.pushState("/" + BF.lang.id + "/" + window.encodeURIComponent(BF.get_ref_from_word_id(this.id) + (highlight_terms ? " {{" + highlight_terms + "}}" : "")) + "/" + this.id  + "/", {position: context.settings.user.position});
                                }
                                
                                maximized_callout = id;
                            },
                            shrink: function (options)
                            {
                                var can_shrink = this.point_to_el_exists() && typeof pos.top === "number" && typeof pos.left === "number",
                                    highlight_terms,
                                    that = this,
                                    url_component;
                                
                                if (!options) {
                                    options = {};
                                }
                                
                                /// Ignore all other requests while this (or another) callout is transitioning.
                                if (this.transitioning) {
                                    return;
                                }
                                
                                /// The "transitioning" property is used to prevent other callouts from being enlarged or this one from shrinking until after the transition has completed..
                                this.transitioning = true;
                                
                                cue = BF.create_transition_cue(function ()
                                {
                                    /// Set this first in case the following functions throw an error.
                                    that.transitioning = false;
                                    
                                    ///NOTE: This must be set before realigning the callout.
                                    that.maximized = false;
                                    
                                    ///NOTE: maximized_callout is from the outer closure and used to identify and interact with the currently maximized callout.
                                    maximized_callout = undefined;
                                    
                                    if (can_shrink) {
                                        /// Because some things in the callout may have been changed by the user, check the height after transitioning back to a small callout.
                                        /// E.g., Go to Matthew 1:11, click "Babylon," click "[+] more," change the pronunciation key to "(Modern)," then click off of the callout.
                                        that.adjust_height();
                                        
                                        /// Realign the callout in case the user scrolled, and therefore the callout may not be entirely viewable. 
                                        that.align();
                                    } else {
                                        BF.callout_manager.remove_a_callout(that.id);
                                    }
                                    
                                    /// Possibly call a callout (e.g., enlarge another callout).
                                    if (typeof options.callback === "function") {
                                        options.callback();
                                    }
                                }, 1000);
                                
                                cue.add({id: 0, terminator: BF.transition(transparent_el, {prop: "opacity", duration: "250ms", end_val: "0", timing: "steps(3, start)", delay: "50ms", failsafe: 500}, function ()
                                {
                                    /// Remove from DOM and destroy the temporary transparent element.
                                    document.body.removeChild(transparent_el);
                                    transparent_el = null;
                                    
                                    /// Make the callout on the same level as other callouts.
                                    /// Since we do not want the callout to displayed below the transparent element,
                                    /// we must change the z-index here, after has completely faded away.
                                    callout.style.zIndex = 0;
                                    cue.async_remove(0);
                                })});
                                
                                if (can_shrink) {
                                    ///NOTE: Small callouts are absolutely positioned, so if transitioning from small to larger (which should be the case),
                                    ///      it will need to be repositioned.
                                    if (callout.style.position !== "absolute") {
                                        callout.style.position = "absolute";
                                        /// Due to switching between absolute and fixed positioning, the callout's position must be recalculated
                                        /// in order for it to appear in the correct spot on the screen.
                                        /// Furthermore, this must be done before the callout's begins to transiting from small to large;
                                        /// otherwise, it would try to animate from the wrong position.
                                        callout.style.top  = (callout.offsetTop  + window.pageYOffset) + "px";
                                        callout.style.left = (callout.offsetLeft + window.pageXOffset) + "px";
                                    }
                                    
                                    /// Make the pointer visible again.
                                    pointer.style.display = "block";
                                    /// Fade in the pointer.
                                    cue.add({id: 1, terminator: BF.transition(pointer, {prop: "opacity", duration: "300ms", end_val: 1, failsafe: 500}, function ()
                                    {
                                        cue.async_remove(1);
                                    })});
                                    
                                    /// Resize the callout to take up more of the screen.
                                    cue.add({id: 2, terminator: BF.transition(callout, [
                                        ///NOTE: Could use transform: translate(x, y) to possibly optimize the transition.
                                        ///NOTE: It tries to use the previous height and width of the callout before it enlarged,
                                        ///      and if that does not work, it uses the defaults.
                                        ///      E.g., go to Ezekiel 18:5 and click the word "which." Then click more, and then click off of the callout.
                                        {prop: "top",    duration: "300ms", end_val: pos.top  + "px",             failsafe: 5000},
                                        {prop: "left",   duration: "300ms", end_val: pos.left + "px",             failsafe: 5000},
                                        {prop: "height", duration: "300ms", end_val: (pos.css_height || "125px"), failsafe: 5000},
                                        {prop: "width",  duration: "300ms", end_val: (pos.css_width  || "300px"), failsafe: 5000}
                                    ], function ()
                                    {
                                        cue.async_remove(2);
                                    })});
                                    
                                    /// While the callout is transitioning, switch the CSS to hide certain content and show others.
                                    /// E.g., the "more" button is hidden when showing details.
                                    cue.add({
                                        sync: function ()
                                        {
                                            callout.classList.remove("detailed_callout");
                                        },
                                        delay: 200
                                    });
                                    
                                    /// Tell the callout to transition to a small font size for certain words.
                                    cue.add({
                                        sync: function ()
                                        {
                                            callout.classList.remove("large_callout");
                                        },
                                        delay: 0
                                    });
                                } else {
                                    /// Fade out the callout since it is not properly connected to a word and therefore cannot be shrunk properly.
                                    ///NOTE: This situation occurs if a page loads with maximized callout: e.g., http://bibleforge.com/en/Genesis%201%3A1/1/
                                    ///      This could also occur if the word that the callout is attached to is removed.
                                    cue.add({id: 1, terminator: BF.transition(callout, {prop: "opacity", duration: "300ms", end_val: 0, failsafe: 500}, function ()
                                    {
                                        cue.async_remove(1);
                                    })});
                                }
                                
                                if (options.asap) {
                                    cue.terminate();
                                }
                                
                                if (!options.ignore_state) {
                                    /// Change state now that the callout is not maximized to point to the top verse.
                                    highlight_terms = BF.get_highlighted_terms();
                                    if (context.settings.user.last_query.type === BF.consts.verse_lookup) {
                                        /// If the last query was a lookup, use the last seo_query (which was the previous query in the URL, not including the maximized callout URL).
                                        /// This way, reloading the page will take the user back to where they left off, not to where the callout was.
                                        url_component = context.settings.user.last_query.seo_query;
                                    } else {
                                        /// If the last query was a search, just put the search terms back in the URL.
                                        url_component = context.settings.user.last_query.raw_query;
                                    }
                                    BF.history.pushState("/" + BF.lang.id + "/" + window.encodeURIComponent(url_component) + "/", {position: context.settings.user.position});
                                }
                            },

                            /// Callout properties
                            id: id,
                            just_created: true
                        };
                        
                        /// Is the callout supposed to start maximized?
                        if (detailed) {
                            callout_obj.maximize({ignore_state: ignore_state});
                        }
                        
                        /// Make the callout show up in the correct location.
                        callout_obj.align();
                        
                        /// Prevent the callout from being destroyed by the document.onclick function that will fire momentarily.
                        window.setTimeout(function ()
                        {
                            callout_obj.just_created = false;
                        }, 200);
                        
                        return callout_obj;
                    };
                }());
            
                /**
                 * Take the lexical data and turn it into HTML to be displayed in the callout.
                 *
                 * @param data (object) An object describing the lexical information of a word.
                 */
                display_callout = (function ()
                {
                
                    /**
                     * Create a simple drop down box element.
                     *
                     * @example create_drop_down_box([{display: "Option 1", details: "Option 1: The first option"}, {display: "Option 2", details: "Option 2: The second option"}]);
                     * @example create_drop_down_box(options_from_pronun({}));
                     * @param   options  (array)    An array of objects defining the drop down options.
                     *                              Array structure:
                     *                              [{display: "The text to display when selected",
                     *                                details: "The HTML to display when the drop down menu is displayed",
                     *                                title: "The option's tooltip (optional)"},
                     *                               ...]
                     * @param   select   (integer)  The option that should be selected by default
                     * @param   onchange (function) The function triggered whenever a selection is made by the user.
                     * @return  A DOM element representing the drop down box.
                     */
                    var create_drop_down_box = function (options, select, onchange)
                    {
                        var el = document.createElement("span"),
                            i,
                            menu_items = [];
                        
                        /**
                         * Create the function that fires when a menu item is selected.
                         *
                         * @param  which (integer) The option that is selected.
                         * @return A function that triggers the onchange callback.
                         * @note   Since functions should not be created in loops, this function must be declared before the loop.
                         */
                        function make_onclick(which)
                        {
                            /**
                             * Trigger the onchange callback
                             *
                             * @param e (event object) The onclick mouse event.
                             */
                            return function (e)
                            {
                                /// Change the text in the drop down box.
                                el.textContent = options[which].display;
                                /// Remember which option was last chosen.
                                select = which;
                                /// Do not let this mouse event cascade and cause other events to fire (like closing a lexical callout).
                                e.stopPropagation();
                                
                                if (typeof onchange === "function") {
                                    onchange(which);
                                }
                            };
                        }
                        
                        /// Create the menu items to sent to show_context_menu().
                        for (i = options.length - 1; i >= 0; i -= 1) {
                            menu_items[i] = {
                                id:    i,
                                html:  options[i].details,
                                title: options[i].title,
                                link:  make_onclick(i)
                            };
                        }
                        
                        el.className = "dropdown";
                        
                        /// Display the default text (if it exists).
                        el.textContent = options[select] ? options[select].display : options[0].display;
                        
                        /**
                         * Open the pronunciation drop down menu.
                         *
                         * @param  e (event object) The onclick mouse event.
                         * @return FALSE to prevent the default action.
                         * @todo   Determine if sending FALSE is necessary.
                         */
                        el.onclick = function (e)
                        {
                            /// Create the pronunciation menu.
                            show_context_menu(function get_pos()
                            {
                                /// Calculate the proper location for the drop down menu.
                                ///NOTE: Because the callout itself can have a scroll bar, we must calculate the actual position on the viewport and then add in the scroll position of the entire scroll (window.pageYOffset).
                                ///NOTE: Because the white-space CSS style is set to "nowrap", the element will not separate; therefore, there will only be one rectangle.
                                var el_pos = el.getClientRects()[0];
                                
                                /// Is the element still on the page; if not return undefined.
                                if (el_pos) {
                                    return {x: el_pos.left, y: el_pos.bottom + window.pageYOffset, absolute: true};
                                }
                            }, menu_items, select);
                            
                            /// Prevent the event from trigger other events, like the callout onclick event.
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        };
                        
                        return el;
                    };
            
                    /**
                     * Create an array of options for the simple drop down box from the lexical pronunciation object.
                     *
                     * @param   pronun (object) The pronun property returned form a lexical lookup.
                     * @return  An array of objects conforming to the simple drop down box's structure.
                     * @example create_drop_down_box(options_from_pronun({}));
                     */
                    function options_from_pronun(pronun)
                    {
                        /// Thin spaces (\u2009) are placed around the words to separate them slightly from the dividing symbols.
                        ///NOTE: The "cell" class makes the <span> tags behave like <td> tags.
                        return [
                            /// Biblical Reconstructed Dictionary Pronunciation
                            {
                                display: "|\u2009" + pronun.dic + "\u2009|",
                                details: "<span class=cell>" + pronun.dic + "</span><span class=cell>(" + BF.lang.biblical + ")</span>",
                                title:   BF.lang.biblical_pronun
                            },
                            /// Biblical Reconstructed IPA
                            {
                                display: "/\u2009" + pronun.ipa + "\u2009/",
                                details: "<span class=cell>" + pronun.ipa + "</span><span class=cell>(" + BF.lang.biblical_ipa + ")</span>",
                                title:   BF.lang.biblical_ipa_long
                            },
                            /// Modern Dictionary Pronunciation
                            {
                                display: "|\u2009" + pronun.dic_mod + "\u2009|",
                                details: "<span class=cell>" + pronun.dic_mod + "</span><span class=cell>(" + BF.lang.modern + ")</span>",
                                title:   BF.lang.modern_pronun
                            },
                            /// Modern IPA
                            {
                                display: "/\u2009" + pronun.ipa_mod + "\u2009/",
                                details: "<span class=cell>" + pronun.ipa_mod + "</span><span class=cell>(" + BF.lang.modern_ipa + ")</span>",
                                title:   BF.lang.modern_ipa
                            },
                            /// Society of Biblical Languages Transliteration
                            {
                                display: "|\u2009" + pronun.sbl + "\u2009|",
                                details: "<span class=cell>" + pronun.sbl + "</span><span class=cell>(" + BF.lang.translit + ")</span>",
                                title:   BF.lang.translit_long
                            }
                        ];
                    }
                    
                    /**
                     * Convert an array of definitions into HTML.
                     *
                     * @param defs (array) The array to be converted to an HTML list.
                     */
                    function create_long_def(defs)
                    {
                        var li,
                            ol = document.createElement("ol");
                        
                        defs.forEach(function (def)
                        {
                            /// If it is a string, add the element.
                            if (typeof def === "string") {
                                li = document.createElement("li");
                                li.textContent = def;
                                ol.appendChild(li);
                            } else {
                                /// If it is not a string, it must be an array, so recursively call the function.
                                ol.appendChild(create_long_def(def));
                            }
                        });
                        
                        return ol;
                    }
                    
                    /**
                     * Add content to the callout.
                     *
                     * @param callout (object) The callout object
                     * @param data    (object) An object containing info to be placed into the callout
                     */
                    return function display_callout(callout, data)
                    {
                        /// data Object structure:
                        /// word      (string)  The original Greek, Hebrew, or Aramaic word, in Unicode.
                        /// pronun    (string)  A JSON string containing the pronunciation of the word (same as data.pronun below except for the actual word, not the base form).
                        /// strongs   (integer) The designated Strong's number for that word.
                        /// base_word (string)  The original Greek, Hebrew, or Aramaic base form of the word, in Unicode.
                        /// data      (string)  A JSON object containing the lexical information about the word.
                        ///                     Object structure:
                        ///                     def: {lit:    "The literal definition of a word (especially a name)",
                        ///                           long:  ["A multi-dimensional array of various possible definitions"],
                        ///                           short:  "A short and simple definition"}
                        ///                     deriv:  "Information about words this word is derived from",
                        ///                     pronun: {ipa:     "IPA Biblical reconstructed pronunciation (base form)",
                        ///                              ipa_mod: "IPA modern pronunciation (base form)",
                        ///                              dic:     "Dictionary Biblical reconstructed pronunciation (base form)",
                        ///                              dic_mod: "Dictionary modern pronunciation (base form)",
                        ///                              sbl:     "The Society of Biblical Literature's phonemic transliteration"}
                        ///                     see:    ["An array of Strong's numbers identifying additional words of interest."]
                        ///                     comment: "A string containing additional useful information"
                        /// usage     (string)  A list of ways the word is translated.
                        ///NOTE: The usage data is planned to be completely redone and expanded.
                        ///NOTE: Also, any number of the following:
                        ///TODO: Document more fully.
                        /// part_of_speech, declinability, case_5, number, gender, degree, tense, voice, mood, person, middle, transitivity, miscellaneous, noun_type, numerical, form, dialect, type, pronoun_type
                        
                        var child_el,
                            html,
                            lex_data,
                            more_el,
                            parent_el;
                        
                        /// Did the query return any results?
                        if (data.word) {
                            lex_data = JSON.parse(data.data);
                            
                            /// DOM Structure:
                            ///   ┌─►lex-title
                            ///   │   ├─►lex-orig_word
                            ///   │   ├─►text node (space)
                            ///   │   └─►pronunciation drop down box
                            ///   └─►lex-body
                            ///       ├─►literal definition (optional)
                            ///       └─►short definition
                            ///         └─►more-button-buffer
                            ///         └─►more-button
                            
                            /// Create a lightweight container for the DOM elements.
                            ///NOTE: The fragment is discarded when attached to the DOM tree and only its children remain.
                            html = document.createDocumentFragment();
                            /// Create lex-title.
                            parent_el = document.createElement("div");
                            parent_el.className = "lex-title";
                            /// Create lex-orig_word.
                            child_el = document.createElement("span");
                            child_el.className = "lex-orig_word";
                            if (callout.id < BF.lang.divisions.nt) {
                                child_el.classList.add("hebrew");
                            }
                            child_el.textContent = data.word;
                            parent_el.appendChild(child_el);
                            /// Add a space between the word and pronunciation drop down box to separate the two elements.
                            parent_el.appendChild(document.createTextNode(" "));
                            /// Create pronunciation drop down box.
                            child_el = create_drop_down_box(options_from_pronun(JSON.parse(data.pronun)), context.settings.user.pronun_type, function onchange(val)
                            {
                                /// Store the user's pronunciation preference in the settings.
                                context.settings.user.pronun_type = val;
                                
                                /// Sometimes the pronunciation box breaks the line and other times it does not, so the size of the content may change;
                                /// therefore we need to make sure that the content fits without scrolling.
                                /// For example, go to Matthew 1:11, and click the word "Babylon" (first make sure that Biblical IPA pronunciation selected beforehand),
                                /// and then change the pronunciation to Biblical, and observe how the pronunciation text wraps.
                                callout.adjust_height();
                            });
                            /// Since the drop down box already has a style ("dropdown") concatenate "lex-pronun" to the end.
                            child_el.classList.add("lex-pronun");
                            parent_el.appendChild(child_el);
                            
                            html.appendChild(parent_el);
                            
                            /// Create lex-body.
                            parent_el = document.createElement("div");
                            parent_el.className = "lex-body";
                            if (lex_data.def.lit) {
                                /// Optionally, create the literal pronunciation.
                                child_el = document.createElement("div");
                                child_el.textContent = "“" + lex_data.def.lit + "”";
                                parent_el.appendChild(child_el);
                            }
                            /// Create the short definition.
                            child_el = document.createElement("div");
                            child_el.textContent = lex_data.def.short;
                            
                            /// Create an invisible element used as buffer to prevent the description text from going onto it.
                            ///NOTE: To see its use in action, click on "mouth" in Matthew 5:2.
                            more_el = document.createElement("span");
                            /// This element needs two classes: one to emulate the size of the more button, the other to hide it from view and make it float right.
                            more_el.className = "more-button more-button-buffer simple_only";
                            more_el.textContent = "[+] " + BF.lang.more;
                            child_el.appendChild(more_el);
                            
                            /// Create the more button.
                            more_el = document.createElement("div");
                            more_el.className = "more-button simple_only";
                            more_el.textContent = "[+] " + BF.lang.more;
                            child_el.appendChild(more_el);
                            
                            /**
                             * Switch to detailed mode.
                             */
                            more_el.onclick = function ()
                            {
                                callout.maximize();
                            };
                            
                            parent_el.appendChild(child_el);
                            
                            /// Add detailed information.
                            
                            /// Create long definition.
                            /// Does a long definition exist?
                            if (lex_data.def && lex_data.def.long) {
                                child_el = BF.create_expander({
                                    summary_text:  BF.lang.detailed_def,
                                    details_el:    create_long_def(lex_data.def.long),
                                    open:          Boolean(context.settings.user.expand_def),
                                    onstateChange: function (open)
                                    {
                                        context.settings.user.expand_def = open;
                                    }
                                });
                                child_el.className = "expandable detailed_only";
                                parent_el.appendChild(child_el);
                            }
                            
                            /// Add all of the elements to the main fragment.
                            html.appendChild(parent_el);
                            
                            
                        } else {
                            ///TODO: In the future, there could be other information, like notes.
                            html = "<div class=lex-body><em>" + BF.lang.italics_explanation + "</em></div>";
                        }
                        
                        /// Add the HTML to the callout.
                        callout.replace_HTML(html);
                    };
                }());
                
                return function callout_maker(options)
                {
                    var ajax = new BF.Create_easy_ajax(),
                        callout;
                    
                    /// Has this data already been cached?
                    if (lex_cache[options.id]) {
                        /// Delay the code so that the remained of the code will execute first and prepare the callout variable.
                        window.setTimeout(function ()
                        {
                            display_callout(callout, lex_cache[options.id]);
                        }, 0);
                    } else {
                        ajax.query("GET", "/api", "t=" + BF.consts.lexical_lookup + "&q=" + Number(options.id), function success(data)
                        {
                            data = BF.parse_json(data);
                            /// Temporarily cache the data so that it does not have to re-queried.
                            ///NOTE: The cache is cleared before each query.
                            lex_cache[options.id] = data;
                            display_callout(callout, data);
                        });
                    }
                        
                    /// Create the callout variable here while waiting for the code above to be called.
                    callout = create_callout(options.id, options.el, ajax, options.mouse_pos, options.maximized, options.ignore_state);
                    return callout;
                };
            }());
            
            BF.callout_manager.clear_cache = function ()
            {
                lex_cache = {};
            };
            
            BF.callout_manager.shrink_or_remove_callouts = function()
            {
                if (BF.callout_manager.has_maximized()) {
                    BF.callout_manager.shrink_maximized_callout();
                } else {
                    BF.callout_manager.remove_callouts();
                }
            };
            
            BF.callout_manager.move_all = function (amount)
            {
                walk_callouts(function (callout)
                {
                    callout.move(amount);
                });
            };
            
            
            BF.callout_manager.remove_unneeded = function ()
            {
                walk_callouts(function (callout, index)
                {
                    if (!callout.point_to_el_exists()) {
                        callout.remove(function ()
                        {
                            /// Remove the callout object from memory.
                            delete callouts[index];
                        }, {asap: true});
                    }
                });
            };
            
            BF.callout_manager.remove_a_callout = function (id, callback, options)
            {
                callouts[id].remove(function ()
                {
                    /// Remove the callout object from memory.
                    delete callouts[id];
                    
                    if (typeof callback === "function") {
                        callback();
                    }
                }, options);
            };
            
            BF.callout_manager.realign = function ()
            {
                walk_callouts(function (callout)
                {
                    callout.align();
                });
            };
            
            BF.callout_manager.show_callout = function (options)
            {
                /// Does the callout already exist?
                if (callouts[options.id]) { 
                    /// Prevent the callout from being removed.
                    ///NOTE: This will prevent all callouts from being removed.
                    BF.callout_manager.callout_clicked = true;
                    /// Should the callout be maximized and it's not already?
                    if (options.maximized && !callouts[options.id].maximized) {
                        callouts[options.id].maximize(options);
                    /// Should the callout not be maximized and it is already?
                    } else if (!options.maximized && callouts[options.id].maximized) {
                        callouts[options.id].shrink(options);
                    } else if (typeof options.callback === "function") {
                        /// Manually call the callback if there is nothing to do.
                        options.callback();
                    }
                } else {
                    callouts[options.id] = callout_maker(options);
                }
            };
            
            BF.callout_manager.shrink_maximized_callout = function (options)
            {
                if (maximized_callout) {
                    callouts[maximized_callout].shrink(options);
                } else if (options && typeof options.callback === "function") {
                    /// False is sent to indicate that no callout was needed to be shrunk.
                    options.callback(false);
                }
            };
            
            BF.callout_manager.remove_callouts = function (callback, options)
            {
                var callout_arr = Object.keys(callouts);
                
                if (!options) {
                    options = {};
                }
                
                /// If there is nothing to remove, just trigger the callback.
                if (callout_arr.length === 0) {
                    if (typeof callback === "function") {
                        callback();
                    }
                } else {
                    /// Since removing callouts may need to be done asynchronously, we need to create a callback loop.
                    /// We use this closure to create the loop() function.
                    /// If the callouts need to be removed asap, they can also be removed synchronously.
                    /**
                     * Remove callouts with a callback loop.
                     *
                     * @param i (number) The variable to increment.
                     * @note  This function is called immediately to create a closure around loop().
                     */
                    (function remove_callout(i)
                    {
                        /**
                         * Increment the loop.
                         */
                        function loop()
                        {
                            /// Is there still more to remove?
                            if (i > 0) {
                                remove_callout(i - 1);
                            } else {
                                if (typeof callback === "function") {
                                    callback();
                                }
                            }
                        }
                        
                        /// If a callout was just created, don't remove it unless we really want to remove them all.
                        ///NOTE: Clicking on a word both creates a callout and is closes other callouts.
                        ///      We use .just_created to make sure we don't instantly close the one we just opened.
                        if (callouts[callout_arr[i]] && (options.force || !callouts[callout_arr[i]].just_created)) {  
                            callouts[callout_arr[i]].remove(function ()
                            {
                                delete callouts[callout_arr[i]];
                                loop();
                            }, options);
                        } else {
                            /// If the callout was just created, just try the next one.
                            loop();
                        }
                    /// Start the loop at the end since we are removing elements.
                    }(callout_arr.length - 1));
                }
            };
            
            BF.callout_manager.has_maximized = function ()
            {
                return Boolean(maximized_callout);
            };
        }());
        
        /**
         * Create a callout if a word with lexical information was clicked on.
         *
         * @param e (event object) The mouse event object.
         */
        page.addEventListener("click", function(e)
        {
            ///NOTE: IE/Chromium/Safari/Opera use srcElement, Firefox uses originalTarget.
            var clicked_el = e.srcElement || e.originalTarget;
            
            /// Does this language support lexical lookups, and did the user click on a word?
            ///NOTE: All words in the text are wrapped in <a> tags.
            if (BF.lang.linked_to_orig && clicked_el && clicked_el.tagName === "A") {
                BF.callout_manager.show_callout({id: Number(clicked_el.id), el: clicked_el, mouse_pos: {mouse_x: e.clientX, mouse_y: e.clientY}});
            }
        }, false);
        
        document.addEventListener("click", function (e)
        {
            if (BF.callout_manager.callout_clicked) {
                ///TODO: Find a better way to handle this.
                BF.callout_manager.callout_clicked = false;
            } else if (e.button === 0 && !e.ctrlKey) {
                BF.callout_manager.shrink_or_remove_callouts();
            }
        }, false);
        
        /**
         * Possibly remove callouts when a user presses escape.
         *
         * @param e (event object) The keyboard event object.
         * @note  This closes all callouts when pressing escape.
         */
        document.addEventListener("keydown", function (e)
        {
            /// keyCode 27 is the escape key.
            if (e.keyCode === 27) {
                BF.callout_manager.shrink_or_remove_callouts();
            }
        }, false);
        
        /// When the scroll is cleared, remove all callouts as quickly as possible.
        context.system.event.attach("scrollCleared", function ()
        {
            BF.callout_manager.remove_callouts(null, {asap: true, force: true, ignore_state: true});
            
            BF.callout_manager.clear_cache();
        });
        
        /**
         * Move callouts to compensate for additional or the absence of text.
         *
         * Also, remove callouts if the word they were attached to was removed.
         *
         * @param e (event object) An object containing the height dimension (in pixels) of the text that was removed (negative value) or added (positive value).
         */
        context.system.event.attach(["contentAddedAbove", "contentRemovedAbove"], function (e)
        {
            if (e.amount !== 0) {
                BF.callout_manager.move_all(e.amount);
            }
        });
        
        /// Check to see if a word that a callout was connected to was removed.
        context.system.event.attach(["contentRemovedBelow", "contentRemovedAbove"], BF.callout_manager.remove_unneeded);
        
        /// Realign callouts when the viewport window because the text may wrap differently.
        window.addEventListener("resize", BF.callout_manager.realign);
        
        
        /// **************************
        /// * End of Callout Manager *
        /// **************************
        
        /// ****************************
        /// * Start of Language Button *
        /// ****************************
        
        /**
         * Display and manage the language selector button.
         */
        (function ()
        {
            var changing,
                crown_loader_timeout,
                langEl = context.langEl;
            
            /**
             * Change the text in the button and adjust the padding.
             *
             * @param lang_id (string) The text to put into the button.
             */
            function change_langEl_text(lang_id)
            {
                /// If the language file loads quickly enough, there is no need to display a loader.
                window.clearTimeout(crown_loader_timeout);
                
                langEl.textContent = lang_id;
                context.qEl.style.paddingLeft = (langEl.offsetWidth + 3) + "px";
            }
            
            /**
             * Download and parse language files (and all other related files)
             *
             * @param lang_id  (string)   The ID of the language to load
             * @param callback (function) The function to call once all of the related files are downloaded and parsed.
             */
            BF.load_language = function (lang_id, callback)
            {
                ///NOTE: The hash is added (if available) to prevent browsers from caching an outdated file.
                BF.include("/js/lang/" + lang_id + ".js?" + (BF.langs[lang_id].hash || ""), {}, function onload()
                {
                    var cue,
                        link;
                    
                    /// After the language specific JavaScript has been download, check to see if language specific CSS is also needed.
                    
                    /// Does this language need additional files?
                    if (BF.langs[lang_id].has_css || BF.langs[lang_id].load_dependencies) {
                        /// Create a cue since there may be more than one asynchronous task.
                        cue = BF.create_transition_cue(callback);
                        
                        /// Does the language have additional files it needs to download before it is ready?
                        if (BF.langs[lang_id].load_dependencies) {
                            cue.add({id: 0});
                            BF.langs[lang_id].load_dependencies(function ()
                            {
                                cue.async_remove(0);
                            });
                        }
                        
                        /// Does this language need special CSS?
                        ///NOTE: The CSS is loaded second just in case the onload event fires synchronously (though I'm not sure if this can happen).
                        if (BF.langs[lang_id].has_css) {
                            link = document.createElement("link");
                            /// Since style sheets are cached for a long period of time, we can use css_hash to create a unique URL to esentially invalidate the cache.
                            link.href = "/styles/lang/" + lang_id + ".css?" + (BF.langs[lang_id].css_hash || "");
                            link.rel = "stylesheet";
                            
                            cue.add({id: 1});
                            /// Because the CSS could contain fonts and other important rules, we must wait until the CSS has downloaded before initiating the language.
                            ///TODO: Determine if any onerror event needs to be listened to in order to handle errors.
                            link.addEventListener("load", function ()
                            {
                                cue.async_remove(1);
                            });
                            
                            document.getElementsByTagName("head")[0].appendChild(link);
                        }
                    } else {
                        /// If this language does not need special CSS or additional data to download, initiate the language immediately.
                        callback();
                    }
                });
            };
            
            /**
             * Handle changes to the language.
             *
             * @param lang_id        (string)   The ID of the language to change to.
             * @param prevent_reload (boolean)  Whether or not to load the last query after changing the language.
             * @param callback       (function) The function to run after the language loading has completed.
             * @note  This function attaches to the global BF object because it can be executed in different places.
             */
            BF.change_language = function (lang_id, prevent_reload, callback)
            {
                var activate_new_lang,
                    open_new_tab,
                    prev_lang,
                    qEl_str = context.qEl.value,
                    qEl_str_trim;
                
                /// Since trying to change the language while another language is loading will cause problems, cancel any requests until the language has loaded.
                ///TODO: Ideally, there should be a way to cancel the current language change request.
                if (changing) {
                    return;
                }
                
                changing = true;
                
                /**
                 * Indicate that the language change is complete and initiate the callback.
                 */
                function on_end()
                {
                    changing = false;
                    if (callback) {
                        callback();
                    }
                }
                
                qEl_str_trim = qEl_str.trim();
                
                /// If the user is holding down Alt or Ctrl, open a new tab.
                /// But make sure to prevent loading in a new tab as well.
                if (!prevent_reload && (BF.keys_pressed.alt || BF.keys_pressed.ctrl)) {
                    if (BF.langs[lang_id]) {
                        /**
                         * Open a new tab with the selected language.
                         *
                         * @note It is a separate function because it is called in two different places below.
                         */
                        open_new_tab = function ()
                        {
                            /// If the user has typed something into the query box, use that; otherwise, use the last query.
                            var query_str;
                            
                            /// This is to set the name back because the crown of throns loader could be present (if the langauge takes too long to load).
                            change_langEl_text(BF.lang.short_name);
                            
                            if (context.settings.user.last_query.type === BF.consts.verse_lookup && (qEl_str === "" || qEl_str === context.settings.user.last_query.real_query)) {
                                query_str = BF.create_ref(context.settings.user.position, lang_id);
                            } else if (qEl_str_trim !== "") {
                                query_str = qEl_str;
                            } else {
                                query_str = context.settings.user.last_query.real_query;
                            }
                            
                            /// Since the user is holding down a special key, open a new window with the current query and the new language.
                            window.open("/" + lang_id + "/" + window.encodeURIComponent(query_str + (context.settings.user.last_query.extra_highlighting ? " {{" + context.settings.user.last_query.extra_highlighting + "}}" : "")) + "/", "_blank");
                        };
                        
                        /// If the language code already not already been downloaded, it will need to be download if
                        /// the query that will be sent to the new tab is the same as the last query and that query was a verse lookup.
                        ///NOTE: If the query input box is blank, use the last query made by the user.
                        if (!BF.langs[lang_id].loaded && (context.settings.user.last_query.type === BF.consts.verse_lookup && (qEl_str === "" || qEl_str === context.settings.user.last_query.real_query))) {
                            /// Because we needs to know the name of the book, it must first download the selected language and then open a new tab.
                            BF.load_language(lang_id, open_new_tab);
                            
                            /// If the language data does not download quickly enough, display a loader graphic.
                            ///NOTE: This timeout will be canceled in change_langEl_text() if the data loads quickly enough.
                            crown_loader_timeout = window.setTimeout(function ()
                            {
                                langEl.innerHTML = "<div class=crown_loader></div>";
                            }, 175);
                        } else {
                            open_new_tab();
                        }
                    }
                    on_end();
                } else {
                    /// Does the language exist and is the new language different from the current language?
                    if (BF.langs[lang_id] && BF.lang.id !== lang_id) {
                        prev_lang = BF.lang.id;
                        
                        /**
                         * Make the new language the active language.
                         *
                         * @note It is a separate function because it is called in two different places below.
                         */
                        activate_new_lang = function ()
                        {
                            BF.lang = BF.langs[lang_id];
                            change_langEl_text(BF.lang.short_name);
                            
                            /// Make the cursor turn into a hand when hovering over words if there is lexical data available.
                            if (BF.lang.linked_to_orig) {
                                page.classList.add("linked");
                            } else {
                                page.classList.remove("linked");
                            }
                            page.classList.remove("lang_" + prev_lang);
                            page.classList.add("lang_" + lang_id);
                            
                            context.system.event.trigger("languageChange", {prev_lang: prev_lang});
                            
                            /// prevent_reload is used when the page first loads since a query will be sent shortly after changing the language.
                            if (!prevent_reload) {
                                /**
                                 * Reload the text in the new language.
                                 *
                                 * @note The is called via setTimeout to let the effects of switching the language to take place and to isolate some of the variables used for convenience.
                                 */
                                window.setTimeout(function ()
                                {
                                    var position,      /// The object that indicates the actual position on the page (i.e., context.settings.user.position)
                                        query_info = context.settings.user.last_query,
                                        query_str,     /// The actual text used for the query
                                        query_url_str; /// The text that appears in the URL when history.pushState() is applied
                                    
                                    /// Unless the query box is empty or contains the default text, use that text.  If it is empty, try getting the last query.
                                    ///NOTE: If the last query was the default query (when the page first loads), we do not want to record the query in the URL.
                                    ///NOTE: Because the placeholder is currently in the element's value, we must check for that.
                                    query_url_str = qEl_str_trim ? qEl_str : query_info.real_query;
                                    
                                    /// Is the text in the query box empty or the same as the last query?
                                    if (qEl_str === query_info.real_query || qEl_str_trim === "") {
                                        /// Use the current position as the query instead of the actual query.
                                        position = context.settings.user.position;
                                        /// Because the book name may not be recognized the same in the new language, make sure it knows how to handle this query.
                                        position.type = query_info.type;
                                        
                                        if (query_info.type === BF.consts.verse_lookup) {
                                            /// Because the book names are not the same in each language, recreate the verse and store it in the URL
                                            /// so that if the page is refreshed, it will be able to load the correct verse.
                                            query_url_str = BF.create_ref(position, lang_id);
                                            
                                            /// If the last query was the default query (query_info.is_default) use the default query (i.e., Genesis 1:1).
                                            if (query_info.is_default) {
                                                /// Use Genesis 1:1 as the query, but do not store it in the URL since it is the default query.
                                                query_str = BF.create_ref({b: 1, c: 1, v: 1});
                                            } else {
                                                query_str = qEl_str;
                                            }
                                        } else {
                                            /// Searches do not need specially formatted query strings.
                                            /// Separating searches from lookups prevents setting "query_str" to a blank string if the query box is blank.
                                            query_str = query_url_str;
                                        }
                                    } else {
                                        query_str = query_url_str;
                                        ///NOTE: If the user typed something in the query box and not yet submitted the query, is_default is still TRUE,
                                        ///      but now it needs to be FALSE because it will soon preform a new query.
                                        query_info.is_default = false;
                                    }
                                    
                                    ///NOTE: The trailing slash is necessary to make the meta redirect to preserve the entire URL and add the exclamation point to the end.
                                    BF.history.pushState("/" + BF.lang.id + "/" + window.encodeURIComponent(query_url_str + (context.settings.user.last_query.extra_highlighting ? " {{" + context.settings.user.last_query.extra_highlighting + "}}" : "")) + "/");
                                    
                                    ///NOTE: If the user has not typed in a new query or the query was automated (i.e., query_info.is_default), keep the current position.
                                    ///NOTE: query_str may be blank; in such cases, the position object will be used to create the proper query.
                                    context.run_new_query(query_str, query_info.is_default, true, position);
                                }, 0);
                            }
                            ///TODO: Determine if running this before the above timeout triggers is problematic.
                            on_end();
                        };
                        
                        /// Since the language has changed, any currently loaded text must be removed and reloaded (after a moment).
                        context.content_manager.clear_scroll();
                        /// Indicate that more content is coming by showing the bottom loader.
                        context.content_manager.indicate_loading(true);
                            
                        /// Has the language code already been downloaded?
                        if (BF.langs[lang_id].loaded) {
                            activate_new_lang();
                        } else {
                            /// If the language code has not been downloaded yet, download it now and activate the language after the code has loaded.
                            BF.load_language(lang_id, activate_new_lang);
                            
                            /// If the language data does not download quickly enough, display a loader graphic.
                            ///NOTE: This timeout will be canceled in change_langEl_text() if the data loads quickly enough.
                            crown_loader_timeout = window.setTimeout(function ()
                            {
                                langEl.innerHTML = "<div class=crown_loader></div>";
                            }, 175);
                        }
                    } else {
                        on_end();
                    }
                }
            };
            
            
            /// Make the necessary changes to load the default language when the page first loads.
            change_langEl_text(BF.lang.short_name);
            page.classList.add("lang_" + BF.lang.id);
            
            /// The language button is hidden until the current language name is displayed.
            langEl.style.visibility = "visible";
            
            /**
             * Create the language selection menu.
             *
             * @return A function that displays the language selection menu.
             */
            langEl.onclick = (function ()
            {
                var lang,
                    lang_menu = [];
                
                /**
                 * Create a function to run when a user clicks on an item on the language selection menu.
                 *
                 * @param  lang_id (string) The ID of the language to change to.
                 * @return A function that calls the language changing function.
                 * @note   This function is outside of the loop below because creating a function in a loop is error prone.
                 */
                function create_lang_selection(lang_id)
                {
                    return function ()
                    {
                        /// Set lang_id as the new language.
                        BF.change_language(lang_id);
                    };
                }
                
                /// Create the language menu drop down menu.
                
                for (lang in BF.langs) {
                    ///NOTE: According to Crockford (http://yuiblog.com/blog/2006/09/26/for-in-intrigue/), for in loops should be filtered.
                    if (BF.langs.hasOwnProperty(lang)) {
                        lang_menu[lang_menu.length] = {
                            id:   lang,
                            text: BF.langs[lang].full_name,
                            link: create_lang_selection(lang)
                        };
                    }
                }
                
                /**
                 * Prepare to display the language selection menu.
                 *
                 * @param  e (object) (optional) The event object optionally sent by the browser.
                 * @note   Called when the user clicks on the language button.
                 * @return FALSE.  It must return FALSE to prevent the click event from being picked up by the label.
                 */
                return function onclick(e)
                {
                    /// Create the language selection menu.
                    show_context_menu(function get_pos()
                    {
                        var langEl_pos = BF.get_position(langEl);
                        
                        /// Work around an Opera bug where it treats the language button as being absolutely positioned, not fixed.
                        if (window.opera) {
                            langEl_pos.top -= window.pageYOffset;
                        }
                        
                        /// The -1 moves it up slightly so that the top border of the menu is inline with the bottom border of the query box.
                        return {x: langEl_pos.left, y: langEl_pos.top + langEl.offsetHeight - 1};
                    },
                    /// Menu items
                    lang_menu,
                    /// Default selected item
                    BF.lang.id,
                    function open()
                    {
                        /// Because the menu is open, keep the button dark.
                        langEl.classList.add("activeLang");
                    },
                    function close()
                    {
                        /// When the menu closes, the button should be lighter.
                        langEl.classList.remove("activeLang");
                    });
                    
                    /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
                    e.stopPropagation();
                    /// Prevent the default action which highlights the query box and closes the menu.
                    return false;
                };
            }());
            
            /// Load the fonts for the lexicon, after a short delay, so that they don't blink when the text first loads.
            window.setTimeout(function ()
            {
                /// To load both fonts, we need to use both a Hebrew and a Greek letter.
                ///NOTE: \u05d0 is the Hebrew letter Aleph, and \u03b1 is the Greek letter Alpha.
                BF.preload_font("lex-orig_word", "\u05d0\u03b1");
            }, 250);
        }());
        
        /// **************************
        /// * End of Language Button *
        /// **************************
        
        window.setTimeout(function ()
        {
            context.system.event.trigger("secondaryLoaded");
        }, 0);
    };
}());
