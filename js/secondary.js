/**
 * BibleForge
 *
 * @date    09-28-10
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

/// Declare globals for JSLint.
/*global document, window, BF */

/// Set JSLint options.
/*jslint indent: 4, white: true */

/// Indicate all object properties used.  JSLint checks this list for misspellings.
/*properties
    Create_easy_ajax, abort, about, addEventListener, align_callout, alt, 
    amount, appendChild, attach, automated, blog, body, books_short, borderTop, 
    button, change_language, checked, childNodes, className, clearTimeout, 
    clear_scroll, click, clientWidth, configure, content_manager, 
    createElement, createEvent, createTextNode, cssText, cssTransitions, ctrl, 
    ctrlKey, currentTarget, destroy, detail, dispatchEvent, display, done, 
    encodeURIComponent, event, full_name, getElementById, get_position, 
    get_query_info, hasOwnProperty, height, help, history, href, htmlFor, id, 
    identifier, include, initMouseEvent, innerHTML, innerHeight, innerWidth, 
    insertBefore, insertCell, insertRow, is_WebKit, italics_explanation, 
    just_created, keyCode, keyboard_busy, keys_pressed, lang, langEl, langs, 
    left, length, line, line_height, link, linked_to_orig, lit, loaded, 
    long_def, maxHeight, maxWidth, modified, move, name, nodeName, 
    offsetHeight, offsetLeft, offsetTop, offsetWidth, onchange, onclick, 
    onfocus, onmousemove, onmouseout, opacity, open, options, originalTarget, 
    paddingLeft, page, pageXOffset, pageYOffset, paragraphs, parentNode, 
    parse_json, pinned, point_to_el_exists, prev_lang, preventDefault, 
    pronunciation, properties, pushState, qEl, query, query_explanation, 
    real_query, red_letters, relatedTarget, remove, removeChild, 
    removeEventListener, replace_HTML, run_new_query, scrollBy, setTimeout, 
    settings, short_def, short_name, src, srcElement, stopPropagation, style, 
    system, tagName, target, text, title, toggleCSS, top, topBar, 
    topBar_height, trigger, trim, type, value, view, viewPort_num, visibility, 
    wheelDelta, word, wrench_title
*/

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
        
        /// TODO: Reevaluate combining show_context_menu() and show_panel() into a single function that takes the open and close functions as parameters and creates the respective functions.
        /**
         * Create the show_context_menu() function with closure.
         *
         * @note   This function is called immediately.
         * @return The function for that is used to create the menu.
         */
        show_context_menu = (function ()
        {
            var context_menu = document.createElement("div"),
                is_open = false,
                key_handler;
            
            ///NOTE: The default style does has "display" set to "none" and "position" set to "fixed."
            context_menu.className = "contextMenu";
            
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
            function close_menu(callback)
            {
                /// First, stop the element from being displayed.
                context_menu.style.display = "none";
                /// Then reset the opacity so that it will fade in when the menu is re-displayed later.
                context_menu.style.opacity = 0;
                
                /// Release control of the keyboard.
                context.system.keyboard_busy = false;
                document.removeEventListener("keydown", key_handler, false);
                
                /// A delay is needed so that if there is a callback, it will run after the menu has been visually removed from the page.
                window.setTimeout(function ()
                {
                    /// Set the menu's is_open status to false after the delay to prevent the menu from being re-opened in the meantime.
                    is_open = false;
                    
                    if (typeof callback === "function") {
                        callback();
                    }
                }, 0);
            }
            
            
            /**
             * Display the context menu.
             *
             * @example open_menu(leftOffset, topOffset, [{text: "Menu Item 1", link: "http://link.com"}, [text: "Menu Item 2", link: some_function, line: true}]); /// Creates a menu with one external link and one link that runs a function with a line break separating the two.
             * @param   x_pos          (number)              The X position of the menu.
             * @param   y_pos          (number)              The Y position of the menu.
             * @param   menu_items     (array)               An array containing object(s) specifying the text of the menu items, the corresponding links, and whether or not to add a line break.
             *                                               Array format: [{text: (string), link: (string or function), line: (truthy or falsey (optional))}, {...}]
             * @param   open_callback  (function) (optional) The function to run when the menu opens.
             * @param   close_callback (function) (optional) The function to send to close_menu() as a callback when the menu closes.
             * @note    Called by show_context_menu() and close_menu() (as the callback function).
             * @return  NULL
             */
            function open_menu(x_pos, y_pos, menu_items, open_callback, close_callback)
            {
                var cur_item = -1,
                    i,
                    menu_container = document.createElement("div"),
                    menu_count = menu_items.length,
                    menu_item;
                
                function highlight_item(old_item)
                {
                    if (old_item !== cur_item) {
                        if (old_item > -1) {
                            BF.toggleCSS(menu_container.childNodes[old_item], "menu_item_selected", 0);
                        }
                        BF.toggleCSS(menu_container.childNodes[cur_item], "menu_item_selected", 1);
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
                        
                        e.preventDefault();
                        ///TODO: Determine if returning FALSE is necessary.
                        return false;
                    };
                }
                
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
                
                for (i = 0; i < menu_count; i += 1) {
                    menu_item = document.createElement("a");
                    
                    /// If the link is a string, then it is simply a URL; otherwise, it is a function.
                    if (typeof menu_items[i].link === "string") {
                        menu_item.href   = menu_items[i].link;
                        /// Force links to open in a new tab.
                        menu_item.target = "_blank";
                    } else {
                        ///NOTE: Possibly could add something to the href to make the link open in a new window.
                        menu_item.onclick = make_onclick(menu_items[i].link);
                    }
                    /// Should there be a line break before this item?
                    if (menu_items[i].line) {
                        menu_item.style.borderTop = "1px solid #A3A3A3";
                    }
                    
                    /// In order to allow for both mouse and keyboard interaction, a menu item must be selected when the mouse moves over it.
                    menu_item.onmousemove = make_onmousemove(i);
                    
                    ///NOTE: document.createTextNode() is akin to innerText.  It does not inject HTML.
                    menu_item.appendChild(document.createTextNode(menu_items[i].text));
                    menu_container.appendChild(menu_item);
                }
                
                /// The menu needs to be cleared first.
                ///TODO: Determine if there is a better way to do this.  Since the items are contained in a single <div> tag, it should not be slow.
                context_menu.innerHTML = "";
                
                context_menu.appendChild(menu_container);
                
                ///TODO: Determine if the menu will go off of the page and adjust the position accordingly.
                context_menu.style.cssText = "left:" + x_pos + "px;top:" + y_pos + "px;display:block";
                
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
                    close_menu(close_callback);
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
                    
                    if (e.keyCode === 38) { /// Up
                        /// If at the top, loop to the bottom.
                        if (cur_item < 1) {
                            cur_item = menu_count - 1;
                        } else {
                            cur_item -= 1;
                        }
                        highlight_item(old_item);
                    } else if (e.keyCode === 40) { /// Down
                        /// If at the bottom, loop to the top.
                        if (cur_item === menu_count - 1) {
                            cur_item = 0;
                        } else {
                            cur_item += 1;
                        }
                        highlight_item(old_item);
                    } else if (e.keyCode === 13) { /// Enter
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
                    } else if (e.keyCode === 27) { /// Escape
                        close_menu(close_callback);
                    } else {
                        /// Allow all other keys to pass to the rest of the page like normal.
                        return;
                    }
                    
                    e.stopPropagation();
                    /// Chromium somtimes does not have preventDefault().
                    if (typeof e.preventDefault === "function") {
                        e.preventDefault();
                    }
                    return false;
                };
                
                document.addEventListener("keydown", key_handler, false);
                
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
             * @example show_context_menu(leftOffset, topOffset, [{text: "Menu Item 1", link: "http://link.com"}, [text: "Menu Item 2", link: some_function, line: true}]); /// Creates a menu with one external link and one link that runs a function with a line break separating the two.
             * @param   x_pos          (number)              The X position of the menu.
             * @param   y_pos          (number)              The Y position of the menu.
             * @param   menu_items     (array)               An array containing object(s) specifying the text of the menu items, the corresponding links, and whether or not to add a line break.
             *                                               Array format: [{text: (string), link: (string or function), line: (truthy or falsey (optional))}, {...}]
             * @param   open_callback  (function) (optional) The function to send to open_menu() as a callback when the menu opens.
             * @param   close_callback (function) (optional) The function to send to close_menu() as a callback when the menu closes.
             * @note    This is the function stored in the show_context_menu variable.
             * @note    Called by the wrench menu onclick event.
             * @return  NULL
             */
            return function show_context_menu(x_pos, y_pos, menu_items, open_callback, close_callback)
            {
                /// If it is already open, close it and then re-open it with the new menu.
                ///TODO: Determine if this can (or should) ever happen.
                if (is_open) {
                    close_menu(function ()
                    {
                        if (typeof close_callback === "function") {
                            close_callback();
                        }
                        open_menu(x_pos, y_pos, menu_items, open_callback, close_callback);
                    });
                } else {
                    open_menu(x_pos, y_pos, menu_items, open_callback, close_callback);
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
            var panel   = document.createElement("div"),
                is_open = false;
            
            ///NOTE: The default style does has "display" set to "none" and "position" set to "fixed."
            panel.className = "panel";
            
            /// Attach the element to the DOM now so that it does not have to be done each time it is displayed.
            document.body.insertBefore(panel, null);
            
            function close_panel(callback)
            {
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
                    
                    if (typeof callback === "function") {
                        callback();
                    }
                }
                
                /// Is the panel already open and are CSS transitions supported by the browser?
                if (is_open && BF.cssTransitions) {
                    panel.addEventListener("transitionend",       on_panel_close, false);
                    panel.addEventListener("oTransitionEnd",      on_panel_close, false);
                    panel.addEventListener("webkitTransitionEnd", on_panel_close, false);
                    
                    panel.style.top = -panel.offsetHeight + "px";
                } else {
                    panel.style.display = "none";
                    /// A delay is needed so that if there is a callback, it will run after the menu has been visually removed from the page.
                    window.setTimeout(on_panel_close, 0);
                }
            }
            
            function open_panel(panel_el)
            {
                var done_button     = document.createElement("button"),
                    panel_container = document.createElement("div");
                
                is_open = true;
                
                done_button.innerHTML = BF.lang.done;
                done_button.className = "done_button";
                /// An anonymous function must be used because we do not want to send the event object to close_panel().
                done_button.onclick   = function ()
                {
                    close_panel();
                };
                
                ///NOTE: The reason why panel_container is used is to provide a single element that can be attached to the DOM so that the page does not have to reflow multiple times.
                ///      Also, clearing innerHTML works much better when there is just one element to clear.
                panel_container.appendChild(panel_el);
                panel_container.appendChild(done_button);
                /// Remove the old panel.
                ///TODO: Figure out if it is better not to clear the panel if the panel is the same as the previous one.
                panel.innerHTML = "";
                panel.appendChild(panel_container);
                
                /// Remove CSS Transitions so that the element will immediately be moved just outside of the visible area so that it can slide in nicely (if CSS transitions are supported).
                panel.className       = "panel";
                /// Ensure that the element is visible (display is set to "none" when it is closed).
                panel.style.display   = "block";
                /// Set the max with and height to get a little smaller than the screen so that the contents will always be visible.
                ///TODO: Determine if this should be done each time the window is resized.
                ///NOTE: document.body.clientHeight will not work right because it takes into account the entire page height, not just the viewable region.
                panel.style.maxHeight = (window.innerHeight        - 80) + "px";
                panel.style.maxWidth  = (document.body.clientWidth - 40) + "px";
                /// Quickly move the element to just above of the visible area.
                panel.style.top       = -panel.offsetHeight + "px";
                /// Center the element on the page.
                ///NOTE: document.body.clientWidth does not include the scroll bars.
                panel.style.left      = ((document.body.clientWidth / 2) - (panel.offsetWidth / 2)) + "px";
                /// Restore CSS transitions (if supported by the browser).
                panel.className       = "panel slide";
                /// Move the panel to the very top of the page.
                /// The element has enough padding on the top to ensure that everything inside of it is visible to the user.
                ///NOTE: Opera needs a short delay in order for the transition to take effect.
                window.setTimeout(function ()
                {
                    panel.style.top = 0;
                }, 0);
            }
            
            return function (panel_el)
            {
                close_panel(function ()
                {
                    open_panel(panel_el);
                });
            };
        }());
        
        
        /*********************************
         * Start of Mouse Hiding Closure *
         *********************************/
        
        /**
         * Register events to manage the cursor for better readability.
         *
         * @return NULL
         * @note   Called immediately.
         */
        (function ()
        {
            var hidden_css = "hidden_cursor",
                hide_cursor_timeout,
                is_cursor_visible = true,
                
                /// Special variables needed for an ugly WebKit hack.
                webkit_cursor_hack,
                webkit_ignore_event_once;
            
            ///NOTE: Webkit only changes the mouse cursor after the mouse cursor moves, making cursor hiding impossible.
            ///      However, there is a way to trick WebKit into thinking the cursor moved when it did not.  The following
            ///      function does just that.  Needed for at least Chromium 15/Safari 5.
            ///      See https://code.google.com/p/chromium/issues/detail?id=26723 for more details.
            if (BF.is_WebKit) {
                /**
                 * Create the function that tricks WebKit into hiding the cursor.
                 *
                 * @return A function used to trick WebKit.
                 */
                webkit_cursor_hack = (function ()
                {
                    /**
                     * Trick WebKit into updating the cursor.
                     *
                     * @param  el        (DOM element) The element which cursor is changing
                     * @param  className (string)      The class name to toggle
                     * @param  force     (integer)     Whether or not to force the toggle on (1) or off (0).
                     * @return NULL
                     * @bug    This does not work with at least Chromium 15 on mousedown.
                     */
                    return function (el, className, force)
                    {
                        window.setTimeout(function ()
                        {
                            BF.toggleCSS(el, className, force);
                            
                            ///NOTE: Because WebKit thinks the cursor moved, it will call the onmousemove event, which will reset the cursor.
                            ///      So, we need to ignore the next onmousemove event.
                            webkit_ignore_event_once = true;
                        },0);
                    };
                }());
            }
            
            
            /**
             * Set the mouse cursor back to its default state.
             *
             * @return NULL
             * @note   Called by hide_cursor_delayed(), page.onmousedown(), and page.onmouseout().
             */
            function show_cursor()
            {
                /// Prevent the cursor from being hidden.
                window.clearTimeout(hide_cursor_timeout);
                
                if (!is_cursor_visible) {
                    if (BF.is_WebKit) {
                        ///NOTE: For a yet unknown reason, when being called onmousedown, this must be called twice.
                        ///      Actually, this used to work, but in Chrome 15 it does not seem to.
                        webkit_cursor_hack(page, hidden_css, 0);
                        webkit_cursor_hack(page, hidden_css, 0);
                    } else {
                        BF.toggleCSS(page, hidden_css, 0);
                    }
                    
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
                    ///NOTE: WebKit can use an almost completely transparent PNG.
                    ///      Opera (at least 10.53) has no alternate cursor support whatsoever.
                    if (BF.is_WebKit) {
                        webkit_cursor_hack(page, hidden_css, 1);
                    } else {
                        /// Mozilla/IE9
                        BF.toggleCSS(page, hidden_css, 1);
                    }
                    
                    is_cursor_visible = false;
                }, 2000);
            }
            
            
            /**
             * Handle cursor hiding when a mouse button is clicked.
             *
             * @param  e (object) The event object (normally supplied by the browser).
             * @return NULL
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
            
            
            page.onmousemove = function ()
            {
                ///NOTE: Because WebKit must be tricked into thinking that the mouse cursor moved in order for it to update the cursor, the onmousemove event
                ///      can be triggered too many times.  Therefore, WebKit needs to ignore the onmousemove event occationally.
                if (webkit_ignore_event_once) {
                    webkit_ignore_event_once = false;
                    return;
                }
                
                if (!is_cursor_visible) {
                    show_cursor();
                }
                hide_cursor_delayed();
            };
            
            
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
            window.onfocus = hide_cursor_delayed;
        }());
        
        /*******************************
         * End of Mouse Hiding Closure *
         *******************************/
        
        /**
         * Add the rest of the BibleForge user interface (currently, just the wrench menu).
         *
         * @note   This function is called immediately.
         * @return NULL
         */
        (function ()
        {
            var show_configure_panel,
                show_help_panel,
                wrench_button = document.createElement("input"),
                wrench_label  = document.createElement("label");
            
            ///NOTE: An IE 8 bug(?) prevents modification of the type attribute after an element is attached to the DOM, so it must be done earlier.
            wrench_button.type  = "image";
            wrench_button.id    = "wrenchIcon" + context.viewPort_num;
            ///TODO: Determine where this gif data should be.
            wrench_button.src   = "data:image/gif;base64,R0lGODdhEAAQAMIIAAEDADAyL05OSWlpYYyLg7GwqNjVyP/97iwAAAAAEAAQAAADQ3i6OwBhsGnCe2Qy+4LRS3EBn5JNxCgchgBo6ThwFDc+61LdY6m4vEeBAbwMBBHfoYgBLW8njUPmPNwk1SkAW31yqwkAOw==";
            wrench_button.title = BF.lang.wrench_title;
            ///TODO: Determine if the alt tag should be shorter, like "Configure."
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
                var panel_element   = document.createElement("div"),
                    settings_config = [
                        {
                            name:     BF.lang.view,
                            settings: "view",
                            options:  [
                                {
                                    name:     BF.lang.red_letters,
                                    type:     "checkbox",
                                    settings: "red_letters"
                                },
                                {
                                    name:     BF.lang.paragraphs,
                                    type:     "checkbox",
                                    settings: "in_paragraphs"
                                }
                            ]
                        }
                    ];
                
                function create_element_from_config(config)
                {
                    var container_el = document.createElement("fieldset"),
                        cur_option   = 0,
                        input_el,
                        label_el,
                        legend_el    = document.createElement("legend"),
                        apply_change,
                        option_count = config.options.length,
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
                    
                    ///NOTE: document.createTextNode() is akin to innerText.  It does not inject HTML.
                    legend_el.appendChild(document.createTextNode(config.name));
                    container_el.appendChild(legend_el);
                    
                    /// Create the input items in the table.
                    while (cur_option < option_count) {
                        ///NOTE: Passing -1 to insertRow() and insertCell() adds a row/cell to the end of the table.
                        table_row  = table_el.insertRow(-1);
                        
                        /// Insert a <td> for the name of the setting.
                        table_cell = table_row.insertCell(-1);
                        label_el   = document.createElement("label");
                        
                        /// The label identifies with the input element via a unique id.
                        label_el.htmlFor = context.settings[config.settings] + "_" + config.options[cur_option].settings;
                        ///NOTE: document.createTextNode() is akin to innerText.  It does not inject HTML.
                        label_el.appendChild(document.createTextNode(config.options[cur_option].name));
                        table_cell.appendChild(label_el);
                        
                        /// Insert a <td> for the input element.
                        table_cell = table_row.insertCell(-1);
                        
                        /// Create the function that changes the proper settings before the switch statement so that it can be used multiple times inside of it.
                        apply_change = make_apply_change(context.settings[config.settings], config.options[cur_option].settings);
                        
                        switch (config.options[cur_option].type) {
                        case "checkbox":
                            input_el      = document.createElement("input");
                            input_el.type = "checkbox";
                            
                            /// Set the current value.
                            input_el.checked = context.settings[config.settings][config.options[cur_option].settings];
                            
                            input_el.onclick = make_checkbox_onclick(apply_change);
                            break;
                        ///NOTE: Not yet used.
                        case "text":
                            input_el      = document.createElement("input");
                            input_el.type = "text";
                            
                            /// Set the current value.
                            input_el.value = context.settings[config.settings][config.options[cur_option].settings];
                            
                            input_el.onchange = make_textbox_onchange(apply_change);
                            break;
                        }
                        /// Give the input element an id that matches the label so that clicking the label will interact with the input field.
                        input_el.id   = label_el.htmlFor;
                        
                        table_cell.appendChild(input_el);
                        
                        cur_option += 1;
                    }
                    
                    container_el.appendChild(table_el);
                    
                    return container_el;
                }
                
                ///TODO: Determine which settings pane to create first (based on the last one the user used). (But currently, there is only one pane.)
                panel_element = create_element_from_config(settings_config[0]);
                
                return function ()
                {
                    show_panel(panel_element);
                };
            }());
            
            
            /**
             * Prepare the help panel.
             *
             * @return A function that shows the panel.
             * @note   Called immediately in order to create another function that shows the panel.
             */
            show_help_panel = (function ()
            {
                var panel_element = document.createElement("div");
                
                ///FIXME: Make a real help panel.
                panel_element.innerHTML = "Email: <a href=\"mailto:info@bibleforge.com\">info@bibleforge.com</a><br><br>More coming soon, Lord willing.<br><br>";
                
                return function ()
                {
                    show_panel(panel_element);
                };
            }());
            
            
            /**
             * Prepare to display the context menu near the wrench button.
             *
             * @param  e (object) (optional) The event object optionally sent by the browser.
             * @note   Called when the user clicks on the wrench button.
             * @return NULL
             * @bug    Opera does not send the onclick event from the label to the button.
             * @bug    Opera miscalculates the position of the lang button (it does not take into account the fixed position of the topBar).
             */
            wrench_button.onclick = function (e)
            {
                var wrench_pos = BF.get_position(wrench_button);
                
                show_context_menu(wrench_pos.left, wrench_pos.top + wrench_button.offsetHeight, [
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
                        text: BF.lang.about,
                        link: "http://bibleforge.wordpress.com/about/"
                    },
                    {
                        text: BF.lang.help,
                        link: show_help_panel
                    }
                ],
                function ()
                {
                    /// Because the context menu is open, keep the icon dark.
                    BF.toggleCSS(wrench_button, "activeWrenchIcon", 1);
                },
                function ()
                {
                    /// When the menu closes, the wrench button should be lighter.
                    BF.toggleCSS(wrench_button, "activeWrenchIcon", 0);
                });
                
                /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
                e.stopPropagation();
            };
        }());
        
        
        /**
         * Snap mouse wheel scrolling.
         */
        (function ()
        {
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
        
        /**
         * Look up lexical data.
         */
        (function ()
        {
            var create_callout,
                callout_clicked = false;
            
            create_callout = (function ()
            {
                var pointer_length   = 12, /// Essentially from the tip of the pointer to the callout
                    pointer_distance = 28; /// The optimal distance from the left of the callout to the middle of the pointer.
                
                function align_callout(callout, pointer, point_to, pos, users_preference)
                {
                    ///TODO: Store the callout offset info in the object.
                    var callout_offsetHeight = callout.offsetHeight,
                        callout_offsetWidth  = callout.offsetWidth,
                        distance_from_right,
                        middle_x,
                        point_to_offsetTop,
                        /// Get the rectangles that represent the object.
                        ///NOTE: If a word is wrapped (specifically a hyphenated word), there will be multiple rectangles.
                        point_to_rects       = point_to.getClientRects();
                    
                    if (point_to_rects.length > 1) {
                        ///TODO: Figure out which rectangle was clicked on.
                    }
                    
                    middle_x             = point_to_rects[0].left + window.pageXOffset + (point_to_rects[0].width / 2);
                    point_to_offsetTop   = point_to_rects[0].top + window.pageYOffset;
                    
                    ///NOTE: Currently, the user cannot drag the callouts, so there are no user preferences when it comes to indidual callouts.
                    if (!users_preference) {
                        /// Try to put the callout above the word.
                        if (callout_offsetHeight + pointer_length < point_to_offsetTop - context.system.properties.topBar_height - window.pageYOffset) {
                            pos.top = point_to_offsetTop - callout_offsetHeight - pointer_length;
                            pointer.className = "pointer-down";
                        /// Else, put the callout below the word.
                        } else {
                            pos.top = point_to_offsetTop + point_to_rects[0].height + pointer_length;
                            pointer.className = "pointer-up";
                        }
                        callout.style.top = pos.top + "px";
                        
                        distance_from_right = window.innerWidth - middle_x;
                        /// Can the pointer fit on the far left?
                        if (distance_from_right > callout_offsetWidth) {
                            pos.left = middle_x - pointer_distance;
                        } else {
                            /// If the pointer will move off of callout on the right side (distance_from_right < 50),
                            /// the callout needs to be moved to the left a little further (pushing the callout off the page a little).
                            pos.left = (window.innerWidth - callout_offsetWidth - pointer_distance + 8) + (distance_from_right < 50 ? 50 - (distance_from_right) : 0);
                        }
                        callout.style.left = pos.left + "px";
                        pointer.style.left = (middle_x - pos.left - pointer_length) + "px";
                    }
                }
                
                return function create_callout(point_to, ajax) {
                    var callout = document.createElement("div"),
                        inside  = document.createElement("div"),
                        pointer = document.createElement("div"),
                        
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
                    
                    /// Delay the creation of the loading graphic because the data could load quickly enough as to make it unnecessary.
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
                            loader.style.opacity = ".99";
                        }, 0);
                    }, 500);
                    
                    /// Because non-pinned callouts are closed when the user clicks off,
                    /// we notify the document.onclick() function that a callout was clicked on so it will ignore the click.
                    callout.addEventListener("click", function ()
                    {
                        callout_clicked = true;
                    }, false);
                    
                    /// The element must be in the DOM tree in order for it to have a height and width.
                    document.body.appendChild(callout);
                    
                    callout_obj = {
                        /// Methods
                        align_callout: function ()
                        {
                            align_callout(callout, pointer, point_to, pos);
                        },
                        destroy: function ()
                        {
                            document.body.removeChild(callout);
                            /// In case the data is still loading, try to abort the request.
                            ajax.abort();
                        },
                        move: function (x)
                        {
                            pos.top += x;
                            callout.style.top = pos.top + "px";
                        },
                        point_to_el_exists: function ()
                        {
                            ///NOTE: Right now, all words have unique id. If this is not true in the future,
                            ///      we could loop through .parentNode until reaching document or NULL.
                            return Boolean(document.getElementById(point_to.id));
                        },
                        replace_HTML: function (html)
                        {
                            /// Prevent the loading graphic from loading if it has not loaded yet.
                            window.clearTimeout(loading_timer);
                            inside.innerHTML = html;
                        },
                        
                        /// Properties
                        just_created: true
                    };
                    
                    callout_obj.align_callout();
                    
                    /// Prevent the callout from being destroyed by the document.onclick function that will fire momentarily.
                    window.setTimeout(function ()
                    {
                        callout_obj.just_created = false;
                    }, 200);
                    
                    return callout_obj;
                };
            }());
            
            (function ()
            {
                var callouts = [];
                
                /// Since this is not styled by initially, it needs to be set now.
                if (BF.lang.linked_to_orig) {
                    BF.toggleCSS(page, "linked", 1);
                }
                
                page.addEventListener("click", function(e)
                {
                    var ajax = new BF.Create_easy_ajax(),
                        callout,
                        ///NOTE: IE/Chromium/Safari/Opera use srcElement, Firefox uses originalTarget.
                        clicked_el = e.srcElement || e.originalTarget;
                    
                    /// Does this language support lexical lookups, and did the user click on a word?
                    ///NOTE: All words in the text are in <a> tags.
                    if (BF.lang.linked_to_orig && clicked_el && clicked_el.tagName === "A") {
                        ///TODO: Determine if the lexicon query (type 5) should be defined somewhere.
                        ajax.query("post", "/query.php", "t=5&q=" + clicked_el.id, function (data)
                        {
                            var html;
                            
                            data = BF.parse_json(data);
                            
                            if (data.word) {
                                ///FIXME: Currently, .pronunciation is the base word, not the actual word.
                                /// Thin spaces are added to separate the word from the vertical bars so that they do not appear to be part of the word.
                                html  = "<div class=lex-title><span class=lex-orig_word>" + data.word + "</span> <span class=lex-pronun>|&thinsp;" + data.pronunciation + "&thinsp;|</span></div>";
                                /// Wrap the rest of the text in a separate tag so that it can all be moved slightly to the left to line up (more or less) with the title.
                                html += "<div class=lex-body>";
                                ///FIXME: data.long_def.lit should be somewhere else.
                                if (data.long_def && data.long_def.lit) {
                                    html += "<div>&#8220;" + data.long_def.lit + "&#8221;</div>";
                                }
                                html += "<div>" + data.short_def + "</div>";
                                html += "</div>";
                                ///TODO: Add a way to get more details.
                            } else {
                                ///TODO: In the future, there could be other information, like notes.
                                html = "<div class=lex-body><em>" + BF.lang.italics_explanation + "</em></div>";
                            }
                            callout.replace_HTML(html);
                        });
                        
                        callout = create_callout(clicked_el, ajax);
                        callouts[callouts.length] = callout;
                    }
                }, false);
                
                /**
                 * Possibly remove callouts when a user clicks the page.
                 *
                 * Remove callouts if Ctrl is not held and not clicking on a callout.
                 *
                 * @param e (event object) The mouse event object.
                 */
                document.addEventListener("click", function (e)
                {
                    var i;
                    
                    /// Are there no callouts or is the Ctrl key pressed?
                    ///NOTE: The Ctrl key is used as a way to open multiple callouts (like selecting multiple files in a file browser).
                    if (i > 0 || e.ctrlKey) {
                        return;
                    }
                    
                    /// Did the user click on a callout? If so, do not close any.
                    if (callout_clicked) {
                        callout_clicked = false;
                        return;
                    }
                    
                    /// Remove unpinned callous and non-new callouts.
                    ///NOTE: When a callout is created, this function (i.e., the onclick event) will fire, thus potentially removing the callout immedately;
                    ///      therefore, use just_created to see if the callout was recently created and should be left alone.
                    for (i = callouts.length - 1; i >= 0; i -= 1) {
                        if (!callouts[i].just_created && !callouts[i].pinned) {
                            callouts[i].destroy();
                            callouts.remove(i);
                        }
                    }
                }, false);
                
                /**
                 * Move callouts to compensate for additional or the abcense of text.
                 *
                 * Also, remove callouts if the word they were attached to was removed.
                 *
                 * @param e (event object) An object containing the height dimension (in pixels) of the text that was removed (negative value) or added (positive value).
                 */
                context.system.event.attach(["contentAddedAbove", "contentRemovedAbove"], function (e)
                {
                    var i;
                    
                    for (i = callouts.length - 1; i >= 0; i -= 1) {
                        /// When contentRemovedAbove is triggered, the element that the callout is pointing to may have been removed.
                        /// If so, remove the callout.
                        ///NOTE: contentAddedAbove has a positive e.amount; whereas, contentRemovedAbove has a negative e.amount.
                        if (e.amount >= 0 || callouts[i].point_to_el_exists()) {
                            callouts[i].move(e.amount);
                        } else {
                            callouts[i].destroy();
                            callouts.remove(i);
                        }
                    }
                });
                
                /**
                 * When the text is removed, remove the callous too.
                 */
                context.system.event.attach("scrollCleared", function ()
                {
                    var i;
                    
                    for (i = callouts.length - 1; i >= 0; i -= 1) {
                        if (!callouts[i].pinned) {
                            callouts[i].destroy();
                            callouts.remove(i);
                        }
                    }
                });
                
                /**
                 * Check to see if a word that a callout was connected to was removed.
                 */
                context.system.event.attach("contentRemovedBelow", function ()
                {
                    var i;
                    
                    for (i = callouts.length - 1; i >= 0; i -= 1) {
                        if (!callouts[i].point_to_el_exists()) {
                            callouts[i].destroy();
                            callouts.remove(i);
                        }
                    }
                });
                
                /**
                 * Realign callouts.
                 */
                window.addEventListener("resize", function ()
                {
                    var i;
                    
                    ///TODO: If there are a lot of callouts that are not visible, it might be a good idea to make them invisible and not re-align them.
                    ///      To do this, we could expose the callout's pos variable (perhaps via a get() function).
                    for (i = callouts.length - 1; i >= 0; i -= 1) {
                        if (callouts[i].point_to_el_exists()) {
                            callouts[i].align_callout();
                        }
                    }
                }, false);
            }());
        }());
        
        /// Display the language selector button.
        (function ()
        {
            var langEl = context.langEl;
            
            function change_langEl_text(identifier)
            {
                langEl.value = identifier;
                context.qEl.style.paddingLeft = (langEl.offsetWidth + 3) + "px";
            }
            
            BF.change_language = function (identifier, prevent_reload, callback)
            {
                var activate_new_lang,
                    prev_lang;
                
                if (BF.keys_pressed.alt || BF.keys_pressed.ctrl) {
                    /// If the user has typed something into the query box, use that; otherwise, use the last query.
                    ///NOTE: Because the placeholder is currently in the element's value, we must check for that.
                    window.open("/" + identifier + "/" + window.encodeURIComponent(context.qEl.value !== BF.lang.query_explanation && context.qEl.value.trim() ? context.qEl.value : context.get_query_info().real_query) + "/", "_blank");
                } else {
                    /// Does the language exist and is the new language different from the current language?
                    if (BF.langs[identifier] && BF.lang.identifier !== identifier) {
                        prev_lang = BF.lang.identifier;
                        
                        activate_new_lang = function ()
                        {
                            BF.lang = BF.langs[identifier];
                            change_langEl_text(BF.lang.short_name);
                            
                            /// Since the language has changed, any currently loaded text must be removed and reloaded (after a moment).
                            context.content_manager.clear_scroll();
                            
                            /// Make the cursor turn into a hand when hovering over words if there is lexical data available.
                            BF.toggleCSS(page, "linked", BF.lang.linked_to_orig ? 1 : 0);
                            BF.toggleCSS(page, "lang_" + prev_lang,  0);
                            BF.toggleCSS(page, "lang_" + identifier, 1);
                            
                            context.system.event.trigger("languageChange", {prev_lang: prev_lang});
                            
                            /// prevent_reload is used when the page first loads since a query will be sent shortly after changing the language.
                            if (!prevent_reload) {
                                /// Reload the text in the new language.
                                window.setTimeout(function ()
                                {
                                    var query_info = context.get_query_info(),
                                        query_str;
                                    
                                    /// If the last query was automated (e.g., when the page first loads), we do not want to record the query in the URL.
                                    ///NOTE: Because the placeholder is currently in the element's value, we must check for that.
                                    query_str = context.qEl.value !== BF.lang.query_explanation && context.qEl.value.trim() ? context.qEl.value : context.get_query_info().real_query;
                                    
                                    ///NOTE: The trailing slash is necessary to make the meta redirect to preserve the entire URL and add the exclamation point to the end.
                                    BF.history.pushState("/" + BF.lang.identifier + "/" + window.encodeURIComponent(query_str) + "/");
                                    
                                    /// If the last query was automated (query_info.automated) and the user has not typed anything into the query box (query_str === query_info.real_query), use the default query (i.e., Genesis 1:1).
                                    if (query_info.automated && query_str === query_info.real_query) {
                                        query_str = BF.lang.books_short[1] + " 1:1";
                                    } else {
                                        /// If the user typed something into the query box, the query is not automated.
                                        query_info.automated = false;
                                    }
                                    
                                    context.run_new_query(query_str, query_info.automated, true);
                                }, 0);
                            }
                            
                            if (typeof callback === "function") {
                                callback();
                            }
                        };
                        
                        /// Has the language code already been downloaded?
                        if (BF.langs[identifier].loaded) {
                            activate_new_lang();
                        } else {
                            ///NOTE: The last modified time is added (if available) to prevent browsers from caching an outdated file.
                            BF.include("/js/lang/" + identifier + ".js?" + (BF.langs[identifier].modified || ""), {}, activate_new_lang);
                        }
                    } else {
                        if (typeof callback === "function") {
                            callback();
                        }
                    }
                }
            };
            
            
            change_langEl_text(BF.lang.short_name);
            BF.toggleCSS(page, "lang_" + BF.lang.identifier, 1);
            
            /// The language button is hidden until the current language name is displayed.
            langEl.style.visibility = "visible";
            
            
            langEl.onclick = (function ()
            {
                var lang,
                    lang_menu = [];
                
                function create_lang_selection(identifier)
                {
                    return function ()
                    {
                        /// Set identifier as the new language.
                        BF.change_language(identifier);
                    };
                }
                
                /// Create the language menu drop down menu.
                for (lang in BF.langs) {
                    ///NOTE: According to Crockford (http://yuiblog.com/blog/2006/09/26/for-in-intrigue/), for in loops should be filtered.
                    if (BF.langs.hasOwnProperty(lang)) {
                        lang_menu[lang_menu.length] = {
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
                 * @return NULL
                 */
                return function (e)
                {
                    var langEl_pos = BF.get_position(langEl);
                    
                    ///TODO: Make show_context_menu() take a position object, not two variables.
                    show_context_menu(langEl_pos.left, langEl_pos.top + langEl.offsetHeight, lang_menu,
                        function open()
                        {
                            /// Because the menu is open, keep the button dark.
                            BF.toggleCSS(langEl, "activeLang", 1);
                        },
                        function close()
                        {
                            /// When the menu closes, the button should be lighter.
                            BF.toggleCSS(langEl, "activeLang", 0);
                        }
                    );
                    
                    /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
                    e.stopPropagation();
                    /// Prevent the default action.
                    return false;
                };
            }());
            
            if (BF.is_WebKit) {
                ///HACK: A tremendously ugly hack to make WebKit not center align langEl.
                (function ()
                {
                    /// If there is an input element before langEl, it will align correctly.
                    var dummy = document.createElement("input");
                    dummy.type = "image";
                    dummy.style.cssText = "width: 0; height: 0;";
                    langEl.parentNode.insertBefore(dummy, langEl);
                }());
            }
        }());
        
        window.setTimeout(function ()
        {
            context.system.event.trigger("secondaryLoaded");
        }, 0);
    };
}());
