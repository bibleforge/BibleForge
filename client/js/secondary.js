/**
 * BibleForge
 *
 * @date    09-28-10
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * Copyright (C) 2012
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see http://www.opensource.org/licenses/AGPL-3.0.
 */

/// Declare globals for JSHint.
/*global BF */

/// Set JSHint options.
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, immed:true, latedef:true, newcap:true, nonew:true, plusplus:true, es5:true, onevar:true, browser:true */

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
        var create_drop_down_box,
            page = context.page,
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
                        document.removeEventListener("keydown", key_handler, false);
                        
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
                        BF.toggleCSS(menu_item, "menu_item_line", 1);
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
                        window_bottom = window.pageYOffset + window.innerHeight,
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
                        
                        e.stopPropagation();
                        /// Chromium somtimes does not have preventDefault().
                        if (typeof e.preventDefault === "function") {
                            e.preventDefault();
                        }
                        return false;
                    }
                };
                
                /// This will be detached by close_menu().
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
                done_button.className = "button done_button";
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
        
        
        /// *********************************
        /// * Start of Mouse Hiding Closure *
        /// *********************************
        
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
            ///NOTE: Could use the new Page Visibility API, such as onvisibilitychange.
            window.onfocus = hide_cursor_delayed;
        }());
        
        /// *******************************
        /// * End of Mouse Hiding Closure *
        /// *******************************
        
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
                var panel_element   = document.createElement("div");
                
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
                show_context_menu(function ()
                {
                    var wrench_pos = BF.get_position(wrench_button);
                    return {x: wrench_pos.left, y: wrench_pos.top + wrench_button.offsetHeight};
                }, [
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
                    /// Make sure no items are selected by default.
                    false,
                    function open()
                    {
                        /// Because the context menu is open, keep the icon dark.
                        BF.toggleCSS(wrench_button, "activeWrenchIcon", 1);
                    },
                    function close()
                    {
                        /// When the menu closes, the wrench button should be lighter.
                        BF.toggleCSS(wrench_button, "activeWrenchIcon", 0);
                    }
                );
                
                /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
                e.stopPropagation();
            };
        }());
        
        
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
        
        /**
         * Create the lexical data lookup functions.
         */
        (function ()
        {
            var create_callout,
                callout_clicked = false;
            
            /**
             * The closure for creating callouts.
             */
            create_callout = (function ()
            {
                var pointer_length   = 12, /// Essentially from the tip of the pointer to the callout
                    pointer_distance = 28; /// The optimal distance from the left of the callout to the middle of the pointer.
                
                /**
                 * Align the callout with the word it is pointing to.
                 *
                 * @param callout    (element) The DOM element representing the callout.
                 * @param pointer    (element) The triangular pointer element.
                 * @param point_to   (element) The element the callout should point to.
                 * @param pos        (object)  An object containing position of the callout so that this information can be retreaved quickly without accessing the DOM.
                 *                             Object structure: {left: number, top: number}
                 * @param split_info (object)  An object containing information about where the user originally clicked and possibly which part of the word the user clicked.
                 *                             Object structure: {mouse_x: number, mouse_y: number, which_rect: number}
                 * @param preference (object)  An object containing information about where the user would prefer the callout to be (e.g., above or below the word).  Not currently used.
                 */
                function align_callout(callout, pointer, point_to, pos, split_info, preference)
                {
                    ///TODO: Store the callout offset info in the object.
                    var callout_offsetHeight = callout.offsetHeight,
                        callout_offsetWidth  = callout.offsetWidth,
                        distance_from_right, /// The distance (in pixels) from the right edge of the viewport to middle_x
                        i,
                        middle_x, /// The middle (horizontally) of the word being pointed to.
                        point_to_offsetTop,
                        /// Get the rectangles that represent the object.
                        ///NOTE: If a word is wrapped (specifically a hyphenated word), there will be multiple rectangles.
                        point_to_rects = point_to.getClientRects(),
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
                    }
                    
                    ///NOTE: Since getClientRects() does not take into account the page offset, we need to add it in.
                    middle_x           = point_to_rects[which_rect].left + window.pageXOffset + (point_to_rects[which_rect].width / 2);
                    point_to_offsetTop = point_to_rects[which_rect].top  + window.pageYOffset;
                    
                    ///NOTE: Currently, the user cannot drag the callouts, so there are no user preferences when it comes to indidual callouts.
                    if (!preference) {
                        /// Try to put the callout above the word.
                        if (callout_offsetHeight + pointer_length < point_to_offsetTop - context.system.properties.topBar_height - window.pageYOffset) {
                            pos.top = point_to_offsetTop - callout_offsetHeight - pointer_length;
                            pointer.className = "pointer-down";
                        /// Else, put the callout below the word.
                        } else {
                            pos.top = point_to_offsetTop + point_to_rects[which_rect].height + pointer_length;
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
                
                /**
                 * Create the callout element and attach it to a word.
                 *
                 * @param  point_to   (element) The element the callout should point to.
                 * @param  ajax       (object)  The ajax object created by BF.Create_easy_ajax().
                 * @param  split_info (object)  An object containing information about where the user originally clicked and possibly which part of the word the user clicked.
                 *                              Object structure: {mouse_x: number, mouse_y: number, which_rect: number}
                 * @return A object that manages the callout.
                 */
                return function create_callout(point_to, ajax, split_info) {
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
                        /**
                         * Using outer variables, call the aligning function.
                         */
                        align_callout: function ()
                        {
                            align_callout(callout, pointer, point_to, pos, split_info);
                        },
                        /**
                         * Delete the callout and stop the query, if it has not already.
                         */
                        destroy: function ()
                        {
                            /// In case the data is still loading, try to abort the request.
                            ajax.abort();
                            
                            document.body.removeChild(callout);
                        },
                        /**
                         * Move the callout up or down.
                         *
                         * @param y (number) The amount to move vertically.
                         */
                        move: function (y)
                        {
                            pos.top += y;
                            callout.style.top = pos.top + "px";
                        },
                        /**
                         * Determine if the element that the callout is pointing to still exists.
                         *
                         * @return boolean
                         * @note   The element the callout is pointing to could be removed when verses are cached.
                         */
                        point_to_el_exists: function ()
                        {
                            ///NOTE: Right now, all words have unique id. If this is not true in the future,
                            ///      we could loop through .parentNode until reaching document or NULL.
                            return Boolean(document.getElementById(point_to.id));
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
                            var diff;
                            
                            /// Prevent the loading graphic from loading if it has not loaded yet.
                            window.clearTimeout(loading_timer);
                            /// Write the HTML, either via a string or DOM element.
                            if (typeof html === "string") {
                                inside.innerHTML = html;
                            } else {
                                inside.innerHTML = "";
                                inside.appendChild(html);
                            }
                            
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
                                this.align_callout();
                            }
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
            
            
            /**
             * Create a simple drop down box element.
             *
             * @example create_drop_down_box([{display: "Option 1", details: "Option 1: The first option"}, {display: "Option 2", details: "Option 2: The second option"}]);
             * @example create_drop_down_box(options_from_pronun({}));
             * @param   options  (array)    An array of objects defining the drop down options.
             *                              Array structure:
             *                              [{display: "The text to display when selected", details: "The HTML to display when the drop down menu is displayed", title: "The option's tooltip (optional)"}, ...]
             * @param   select   (integer)  The option that should be selected by default
             * @param   onchange (function) The function trigged whenever a selection is made by the user.
             * @return  A DOM element representing the drop down box.
             */
            create_drop_down_box = function (options, select, onchange)
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
                 * Open the drop down menu
                 *
                 * @param  e (event object) The onclick mouse event.
                 * @return FALSE to prevent the default action.
                 * @todo   Determine if sending FALSE is necessary.
                 */
                el.onclick = function (e)
                {
                    show_context_menu(function ()
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
             * Create the callouts array and attach the event functions.
             */
            (function ()
            {
                var callouts  = [],
                    lex_cache = {},
                    remove;
                
                /// Since this is not styled by initially, it needs to be set now.
                if (BF.lang.linked_to_orig) {
                    BF.toggleCSS(page, "linked", 1);
                }
                
                /// Initialize the settings.user.pronun_type setting.
                context.settings.add_property(context.settings.user, "pronun_type", 0);
                
                (function ()
                {
                    /**
                     * Take the lexical data and turn it into HTML to be displayed in the callout.
                     *
                     * @param data (object) An object describing the lexical information of a word.
                     */
                    var display_callout = (function ()
                    {
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
                                child_el.textContent = data.word;
                                parent_el.appendChild(child_el);
                                /// Add a space between the word and pronunciation drop down box to separate the two elements.
                                parent_el.appendChild(document.createTextNode(" "));
                                /// Create pronunciation drop down box.
                                child_el = create_drop_down_box(options_from_pronun(JSON.parse(data.pronun)), context.settings.user.pronun_type, function onchange(val)
                                {
                                    /// Store the user's pronunciation preference in the settings.
                                    context.settings.user.pronun_type = val;
                                });
                                /// Since the drop down box already has a style ("dropdown") concatenate "lex-pronun" to the end.
                                BF.toggleCSS(child_el, "lex-pronun", 1);
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
                                more_el.className = "more-button more-button-buffer";
                                more_el.textContent = "[+] " + BF.lang.more;
                                child_el.appendChild(more_el);
                                
                                /// Create the more button.
                                more_el = document.createElement("div");
                                more_el.className = "more-button";
                                more_el.textContent = "[+] " + BF.lang.more;
                                child_el.appendChild(more_el);
                                
                                parent_el.appendChild(child_el);
                                html.appendChild(parent_el);
                                
                                
                            } else {
                                ///TODO: In the future, there could be other information, like notes.
                                html = "<div class=lex-body><em>" + BF.lang.italics_explanation + "</em></div>";
                            }
                            
                            callout.replace_HTML(html);
                        };
                    }());
                    
                    /**
                     * Create a callout if a word with lexical information was clicked on.
                     *
                     * @param e (event object) The mouse event object.
                     */
                    page.addEventListener("click", function(e)
                    {
                        var ajax = new BF.Create_easy_ajax(),
                            callout,
                            ///NOTE: IE/Chromium/Safari/Opera use srcElement, Firefox uses originalTarget.
                            clicked_el = e.srcElement || e.originalTarget;
                        
                        /// Does this language support lexical lookups, and did the user click on a word?
                        ///NOTE: All words in the text are wrapped in <a> tags.
                        if (BF.lang.linked_to_orig && clicked_el && clicked_el.tagName === "A") {
                            /// Has this data already been cached?
                            if (lex_cache[clicked_el.id]) {
                                /// Delay the code so that the remained of the code will execute first and prepare the callout variable.
                                window.setTimeout(function ()
                                {
                                    display_callout(callout, lex_cache[clicked_el.id]);
                                }, 0);
                            } else {
                                ajax.query("GET", "/api", "t=" + BF.consts.lexical_lookup + "&q=" + clicked_el.id, function success(data)
                                {
                                    data = BF.parse_json(data);
                                    /// Temporarily cache the data so that it does not have to re-queried.
                                    ///NOTE: The cache is cleared before each query.
                                    lex_cache[clicked_el.id] = data;
                                    display_callout(callout, data);
                                });
                            }
                            
                            callout = create_callout(clicked_el, ajax, {mouse_x: e.clientX, mouse_y: e.clientY});
                            callouts[callouts.length] = callout;
                        }
                    }, false);
                }());
                ///TODO: Instead of attaching functions here and looping through an array of callouts, it probably should attach a separate function inside the callout closure.
                
                /**
                 * Possibly remove callouts when a user clicks the page.
                 *
                 * Remove callouts if Ctrl is not held and not clicking on a callout.
                 *
                 * @param  e (event object) The mouse event object.
                 * @return NULL
                 */
                remove = function (e)
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
                    ///NOTE: When a callout is created, this function (i.e., the onclick event) will fire, thus potentially removing the callout immediately;
                    ///      therefore, use just_created to see if the callout was recently created and should be left alone.
                    for (i = callouts.length - 1; i >= 0; i -= 1) {
                        if (!callouts[i].just_created && !callouts[i].pinned) {
                            callouts[i].destroy();
                            callouts.remove(i);
                        }
                    }
                };
                
                
                document.addEventListener("click", remove, false);
                
                /**
                 * Possibly remove callouts when a user presses escape.
                 *
                 * @param e (event object) The keyboard event object.
                 * @note  This does not fire when closing menus in Chromium (which is the desired effect), but it does in Firefox (but Firefox seems to work probably when this function is attached once per callout.
                 * @todo  This closes all callouts when pressing escape, but it probably should just close the one that the user is interacting with.
                 * @note  It might be best to close a pinned callout with escape if the user is interacting with it.
                 */
                document.addEventListener("keydown", function (e)
                {
                    /// keyCode 27 is the escape key.
                    if (e.keyCode === 27) {
                        remove(e);
                    }
                }, false);
                
                /**
                 * Move callouts to compensate for additional or the absence of text.
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
                        callouts[i].destroy();
                    }
                    
                    callouts = [];
                    
                    /// Clear lexical data cache to prevent it from building up too large.
                    lex_cache = {};
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
        
        /**
         * Display and manage the language selector button.
         */
        (function ()
        {
            var crown_loader_timeout,
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
                    prev_lang,
                    qEl_str = context.qEl.value,
                    qEl_str_trim;
                
                qEl_str_trim = qEl_str.trim();
                
                /// If the user is holding down Alt or Ctrl, open a new tab.
                /// But make sure to prevent loading in a new tab as well.
                if (!prevent_reload && (BF.keys_pressed.alt || BF.keys_pressed.ctrl)) {
                    if (BF.langs[lang_id]) {
                        activate_new_lang = function ()
                        {
                            /// If the user has typed something into the query box, use that; otherwise, use the last query.
                            var query_str;
                            
                            if (context.settings.user.last_query.type === BF.consts.verse_lookup && (qEl_str === "" || qEl_str === context.settings.user.last_query.real_query)) {
                                query_str = BF.langs[lang_id].books_short[context.settings.user.position.b] + " " + context.settings.user.position.c + ":" + context.settings.user.position.v;
                            } else if (qEl_str_trim !== "") {
                                query_str = qEl_str;
                            } else {
                                query_str = context.settings.user.last_query.real_query;
                            }
                            
                            window.open("/" + lang_id + "/" + window.encodeURIComponent(query_str) + "/", "_blank");
                        };
                        
                        /// If the language code already not already been downloaded, it will need to be download if
                        /// the query that will be sent to the new tab is the same as the last query and that query was a verse lookup.
                        ///NOTE: If the query input box is blank, use the last query made by the user.
                        if (!BF.langs[lang_id].loaded && (context.settings.user.last_query.type === BF.consts.verse_lookup && (qEl_str === "" || qEl_str === context.settings.user.last_query.real_query))) {
                            /// Because we needs to know the name of the book, it must first download the selected language and then open a new tab.
                            ///NOTE: The last modified time is added (if available) to prevent browsers from caching an outdated file.
                            BF.include("/js/lang/" + lang_id + ".js?" + (BF.langs[lang_id].modified || ""), {}, function ()
                            {
                                /// This is to set the name back because the crown of throns loader could be present.
                                change_langEl_text(BF.lang.short_name);
                                activate_new_lang();
                            });
                            
                            /// If the language data does not download quickly enough, display a loader graphic.
                            ///NOTE: This timeout will be canceled in change_langEl_text() if the data loads quickly enough.
                            crown_loader_timeout = window.setTimeout(function ()
                            {
                                langEl.innerHTML = "<div class=crown_loader></div>";
                            }, 175);
                        } else {
                            activate_new_lang();
                        }
                    }
                    if (typeof callback === "function") {
                        callback();
                    }
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
                            BF.toggleCSS(page, "linked", BF.lang.linked_to_orig ? 1 : 0);
                            BF.toggleCSS(page, "lang_" + prev_lang,  0);
                            BF.toggleCSS(page, "lang_" + lang_id,    1);
                            
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
                                    var position,      /// The object that indicates the actual position on the page
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
                                            query_url_str = BF.langs[lang_id].books_short[context.settings.user.position.b] + " " + context.settings.user.position.c + ":" + context.settings.user.position.v;
                                        }
                                        
                                        /// If the last query was the default query (query_info.is_default) use the default query (i.e., Genesis 1:1).
                                        if (query_info.is_default) {
                                            /// Use Genesis 1:1 as the query, but do not store it in the URL since it is the default query.
                                            query_str = BF.lang.books_short[1] + " 1:1";
                                        } else {
                                            query_str = qEl_str;
                                        }
                                    } else {
                                        query_str = query_url_str;
                                        ///NOTE: If the user typed something in the query box and not yet submitted the query, is_default is still TRUE,
                                        ///      but now it needs to be FALSE because it will soon preform a new query.
                                        query_info.is_default = false;
                                    }
                                    
                                    ///NOTE: The trailing slash is necessary to make the meta redirect to preserve the entire URL and add the exclamation point to the end.
                                    BF.history.pushState("/" + BF.lang.id + "/" + window.encodeURIComponent(query_url_str) + "/");
                                    
                                    ///NOTE: If the user has not typed in a new query or the query was automated (i.e., query_info.is_default), keep the current position.
                                    ///NOTE: query_str may be blank; in such cases, the position object will be used to create the proper query.
                                    context.run_new_query(query_str, query_info.is_default, true, position);
                                }, 0);
                            }
                            
                            if (typeof callback === "function") {
                                callback();
                            }
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
                            ///NOTE: The last modified time is added (if available) to prevent browsers from caching an outdated file.
                            BF.include("/js/lang/" + lang_id + ".js?" + (BF.langs[lang_id].modified || ""), {}, activate_new_lang);
                            
                            /// If the language data does not download quickly enough, display a loader graphic.
                            ///NOTE: This timeout will be canceled in change_langEl_text() if the data loads quickly enough.
                            crown_loader_timeout = window.setTimeout(function ()
                            {
                                langEl.innerHTML = "<div class=crown_loader></div>";
                            }, 175);
                        }
                    } else {
                        if (typeof callback === "function") {
                            callback();
                        }
                    }
                }
            };
            
            
            /// Make the necessary changes to load the default language when the page first loads.
            change_langEl_text(BF.lang.short_name);
            BF.toggleCSS(page, "lang_" + BF.lang.id, 1);
            
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
                    show_context_menu(function ()
                    {
                        var langEl_pos = BF.get_position(langEl);
                        return {x: langEl_pos.left, y: langEl_pos.top + langEl.offsetHeight};
                    }, lang_menu, BF.lang.id,
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
        
        window.setTimeout(function ()
        {
            context.system.event.trigger("secondaryLoaded");
        }, 0);
    };
}());
