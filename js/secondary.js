/**
 * BibleForge
 *
 * @date    09-28-10
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/// Declare globals for JSLint.
/*global document, window, BF */

/// Set JSLint options.
/*jslint indent: 4, white: true */

/// Indicate all object properties used.  JSLint checks this list for misspellings.
/*properties
    Create_easy_ajax, about, addEventListener, align_callout, alt, appendChild, 
    blog, body, borderTop, button, changeCSS, checked, childNodes, className, 
    clearTimeout, clientWidth, configure, createElement, createTextNode, 
    cssText, cssTransitions, currentTarget, cursor, destroy, detail, display, 
    done, get, get_position, help, href, htmlFor, id, innerHTML, innerHeight, 
    innerWidth, insertBefore, insertCell, insertRow, is_WebKit, just_created, 
    lang, left, length, line, line_height, link, maxHeight, maxWidth, name, 
    nodeName, offsetHeight, offsetLeft, offsetTop, offsetWidth, onchange, 
    onclick, onfocus, onmousemove, onmouseout, opacity, options, 
    originalTarget, page, pageXOffset, pageYOffset, paragraphs, parentNode, 
    parse_json, pinned, preventDefault, properties, query, red_letters, 
    relatedTarget, removeChild, removeEventListener, replace_HTML, scrollBy, 
    scrollLeft, set, setTimeout, settings, src, srcElement, stopPropagation, 
    style, system, tagName, target, text, title, top, topBar, topBar_height, 
    type, value, view, viewPort_num, wheelDelta, word, wrench_title
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
     * @return Null.
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
                is_open      = false;
            
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
             * @return  NULL.
             */
            function close_menu(callback)
            {
                /// First, stop the element from being displayed.
                context_menu.style.display = "none";
                /// Then reset the opacity so that it will fade in when the menu is re-displayed later.
                context_menu.style.opacity = 0;
                
                /// A delay is needed so that if there is a callback, it will run after the menu has been visually removed from the page.
                window.setTimeout(function ()
                {
                    /// Set the menu's is_open status to false after the delay to prevent the menu from being re-opened in the meantime.
                    is_open = false;
                    
                    if (callback) {
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
             * @return  NULL.
             */
            function open_menu(x_pos, y_pos, menu_items, open_callback, close_callback)
            {
                var i,
                    menu_container = document.createElement("div"),
                    menu_count = menu_items.length,
                    menu_item;
                
                is_open = true;
                
                for (i = 0; i < menu_count; i += 1) {
                    menu_item = document.createElement("a");
                    
                    /// If the link is a string, then it is simply a URL; otherwise, it is a function.
                    if (typeof menu_items[i].link === "string") {
                        menu_item.href   = menu_items[i].link;
                        /// Force links to open in a new tab.
                        menu_item.target = "_blank";
                    } else {
                        ///TODO: Create a useful hash value.
                        menu_item.href    = "#contextmenu";
                        menu_item.onclick = menu_items[i].link;
                    }
                    /// Should there be a line break before this item?
                    if (menu_items[i].line) {
                        menu_item.style.borderTop = "1px solid #A3A3A3";
                    }
                    
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
                 * @return NULL.
                 * @bug    Firefox 3.6 Does not close the menu when clicking the query box the first time.  However, it does close after submitting the query.
                 */
                document.addEventListener("click", function ()
                {
                    /// Close the context menu if the user clicks the page.
                    close_menu(close_callback);
                }, false);
                
                /// A delay is needed in order for the CSS transition to occur.
                window.setTimeout(function ()
                {
                    context_menu.style.opacity = 1;
                    
                    if (open_callback) {
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
             * @return  NULL.
             */
            return function (x_pos, y_pos, menu_items, open_callback, close_callback)
            {
                /// If it is already open, close it and then re-open it with the new menu.
                ///TODO: Determine if this can (or should) ever happen.
                if (is_open) {
                    close_menu(function ()
                    {
                        if (close_callback) {
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
         * @return NULL.
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
                    
                    if (callback) {
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
         * @return NULL.
         * @note   Called immediately.
         */
        (function ()
        {
            var hide_cursor_timeout,
                is_cursor_visible = true,
                
                pointer_selector = ".scrolls a",
                pointer_style    = "cursor: pointer;",
                
                /// Special variables needed for an ugly WebKit hack.
                webkit_cursor_hack,
                webkit_ignore_event_once;
                
            /// Make the cursor look like a hand to indicate that the words are clickable.
            BF.changeCSS(pointer_selector, pointer_style, true);
            
            ///NOTE: Webkit only changes the mouse cursor after the mouse cursor moves, making cursor hiding impossible.
            ///      However, there is a way to trick WebKit into thinking the cursor moved when it did not.  The following
            ///      function does just that.  Needed for at least Chromium 12/Safari 5.
            ///      See https://code.google.com/p/chromium/issues/detail?id=26723 for more details.
            if (BF.is_WebKit) {
                /**
                 * Create the function that tricks WebKit into hiding the cursor.
                 *
                 * @return A function used to trick WebKit.
                 */
                webkit_cursor_hack = (function ()
                {
                    /// Prepare the needed elements.
                    var div1 = document.createElement("div"),
                        div2 = document.createElement("div");
                    
                    div1.style.cssText = "overflow: hidden; position: fixed; left: 0; top: 0; width: 100%; height: 100%;";
                    div2.style.cssText = "width: 200%; height: 200%;";
                    
                    div1.appendChild(div2);
                    
                    /**
                     * Trick WebKit into updating the cursor.
                     *
                     * @param  el     (DOM element) The element which cursor is changing
                     * @param  cursor (string)      The new cursor style
                     * @return NULL.
                     */
                    return function (el, cursor)
                    {
                        ///NOTE: For a yet unknown reason, the code works fine without being called via setTimeout with the exception of being called onmousedown.
                        window.setTimeout(function ()
                        {
                            ///NOTE: So basically, a large div is added with an even larger div inside of it.  Then the first div is scrolled back and forth.
                            ///      This creates the illusion of mouse movement, and the cursor is updated.
                            document.body.appendChild(div1);
                            
                            el.style.cursor = cursor;
                            
                            div1.scrollLeft = 1;
                            div1.scrollLeft = 0;
                            document.body.removeChild(div1);
                            
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
             * @return NULL.
             * @note   Called by hide_cursor_delayed(), page.onmousedown(), and page.onmouseout().
             */
            function show_cursor()
            {
                /// Prevent the cursor from being hidden.
                window.clearTimeout(hide_cursor_timeout);
                
                if (!is_cursor_visible) {
                    if (BF.is_WebKit) {
                        ///NOTE: For a yet unknown reason, when being called onmousedown, this must be called twice.
                        webkit_cursor_hack(page, "auto");
                        webkit_cursor_hack(page, "auto");
                    } else {
                        page.style.cursor = "auto";
                    }
                    ///FIXME: Determine a way to do this without modifying the CSS.
                    BF.changeCSS(pointer_selector, pointer_style);
                    
                    is_cursor_visible = true;
                }
            }
            
            
            /**
             * Hide the cursor after a short delay.
             *
             * @return NULL.
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
                        webkit_cursor_hack(page, "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAABdJREFUOMtjYBgFo2AUjAIGhv///zMBAA0JAwCYSe1yAAAAAElFTkSuQmCC), auto");
                    } else {
                        /// Mozilla/IE9
                        page.style.cursor = "none";
                    }
                    /// All words have a hand cursor, so this style must be removed.
                    ///FIXME: Determine a way to do this without modifying the CSS.
                    BF.changeCSS(pointer_selector, "");
                    
                    is_cursor_visible = false;
                }, 2000);
            }
            
            
            /**
             * Handle cursor hiding when a mouse button is clicked.
             *
             * @param  e (object) The event object (normally supplied by the browser).
             * @return NULL.
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
             * @return NULL.
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
             * @return NULL.
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
         * @return NULL.
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
                         * @return NULL.
                         * @note   Called when the user changes a setting.
                         */
                        return function (new_value)
                        {
                            settings_obj[option_name].set(new_value);
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
                         * @return NULL.
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
                         * @return NULL.
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
                            input_el.checked = context.settings[config.settings][config.options[cur_option].settings].get();
                            
                            input_el.onclick = make_checkbox_onclick(apply_change);
                            break;
                        ///NOTE: Not yet used.
                        case "text":
                            input_el      = document.createElement("input");
                            input_el.type = "text";
                            
                            /// Set the current value.
                            input_el.value = context.settings[config.settings][config.options[cur_option].settings].get();
                            
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
                
                ///TODO: Determine which settings pane to create first (based on the last one the user used).
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
             * @return NULL.
             * @todo   Make the wrench icon look pressed.
             * @bug    Opera does not send the onclick event from the label to the button.
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
                    wrench_button.className += " activeWrenchIcon";
                },
                function ()
                {
                    /// When the menu closes, the wrench button should be lighter.
                    wrench_button.className = "wrenchIcon";
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
                    line_height = context.settings.system.line_height.get();
                
                /// Force the browser to scroll three lines of text up or down.
                ///NOTE: window.pageYOffset % line_height calculates the offset from the nearest line to snap the view to a line.
                ///NOTE: If between lines, this actually scrolls up more than 3 lines and down less than 3, but it is simple and doesn't seem to impede usability.
                window.scrollBy(window.pageXOffset, (line_height * (delta > 0 ? -3 : 3)) - (window.pageYOffset % line_height));
                e.preventDefault();
            };
            
            /// WebKit/Opera/IE9 (?)
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
                var pointer_height   = 12,
                    pointer_distance = 28;
                
                function adjust_pointer(callout, pointer_before, pointer_after, point_to, users_preference)
                {
                    var middle_x = point_to.offsetLeft + (point_to.offsetWidth / 2),
                        pointer_used;
                    
                    if (!users_preference) {
                        /// First, try to put the bubble above the word.
                        if (callout.offsetHeight + pointer_height < point_to.offsetTop - context.properties.topBar_height - window.pageYOffset) {
                            callout.style.top = (point_to.offsetTop - callout.offsetHeight - pointer_height) + "px";
                            pointer_after.className = "pointer-down";
                            pointer_before.style.display = "none";
                            pointer_used = pointer_after;
                        /// Next try the bottom.
                        } else if (callout.offsetHeight + pointer_height < window.innerHeight - (window.pageYOffset - point_to.offsetTop - point_to.offsetHeight)) {
                            callout.style.top = (point_to.offsetTop + point_to.offsetHeight + pointer_height) + "px";
                            pointer_before.className = "pointer-up";
                            pointer_after.style.display = "none";
                            pointer_used = pointer_before;
                        } else {
                            ///TODO: Also try to put it on the left and right.
                            ///TODO: Since it cannot fit, just try to center it on the page.
                            callout.style.top = "300px";
                            callout.style.left = "300px";
                            return;
                        }
                        
                        /// Try to put the pointer on the left.
                        ///TODO: Include rounded corners in calculation.
                        if (window.innerWidth - middle_x > callout.offsetWidth) {
                            callout.style.left = (middle_x - pointer_distance) + "px";
                            pointer_used.style.marginLeft = "12px";
                        } else {
                            callout.style.left = (window.innerWidth - callout.offsetWidth - pointer_distance) + "px";
                            pointer_used.style.marginLeft = (middle_x - (window.innerWidth - callout.offsetWidth - (pointer_distance / 2) + 2)) + "px";
                        }
                        
                    }
                }
                
                return function (point_to) {
                    var callout = document.createElement("div"),
                        inside  = document.createElement("div"),
                        pointer_before = document.createElement("div"),
                        pointer_after  = document.createElement("div"),
                        callout_obj;
                    
                    callout.className = "callout";
                    inside.className = "inside";
                    inside.innerHTML = "Loading";
                    callout.appendChild(pointer_before);
                    callout.appendChild(inside);
                    callout.appendChild(pointer_after);
                    
                    /// Because non-pinned callouts are closed when the user clicks off,
                    /// we notify the document.onclick() function that a callout was clicked on so it will ignore the click.
                    callout.addEventListener("click", function (e)
                    {
                        callout_clicked = true;
                    }, false);
                    
                    /// The element must be in the DOM tree in order for it to have a height and width.
                    document.body.appendChild(callout);
                    
                    callout_obj = {
                        /// Methods
                        align_callout: function ()
                        {
                            adjust_pointer(callout, pointer_before, pointer_after, point_to);
                        },
                        destroy: function ()
                        {
                            document.body.removeChild(callout);
                        },
                        replace_HTML: function (html)
                        {
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
                
                page.addEventListener("click", function(e)
                {
                    var ajax = new BF.Create_easy_ajax(),
                        callout,
                        ///NOTE: IE/Chromium/Safari/Opera use srcElement, Firefox uses originalTarget.
                        clicked_el = e.srcElement || e.originalTarget;
                    
                    /// All words in the text are in <a> tags.
                    if (clicked_el && clicked_el.tagName === "A") {
                        ///TODO: Determine if the lexicon query (type 5) should be defined somewhere.
                        ajax.query("post", "query.php", "t=5&q=" + clicked_el.id, function (data)
                        {
                            ///TODO: Do something with the data.
                            data = BF.parse_json(data);
                            callout.replace_HTML(data.word);
                        });
                        
                        callout = create_callout(clicked_el);
                        callouts[callouts.length] = callout;
                    }
                }, false);
                
                document.addEventListener("click", function (e)
                {
                    var i,
                        callouts_len = callouts.length,
                        new_arr = [];
                    
                    /// Are there no callouts or is the Ctrl key pressed?
                    if (i > 0 || e.ctrlKey) {
                        return;
                    }
                    
                    /// Did the user click on a callout?
                    if (callout_clicked) {
                        callout_clicked = false;
                        return;
                    }
                    
                    for (i = 0; i < callouts_len; i += 1) {
                        if (callouts[i].pinned || callouts[i].just_created) {
                            new_arr[new_arr.length] = callouts[i];
                        } else {
                            callouts[i].destroy();
                        }
                    }
                    callouts = new_arr;
                }, false);
            }());
        }());

        
    };
}());
