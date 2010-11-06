/**
 * BibleForge
 *
 * @date    09-28-10
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/// Set JSLint options.
/*global window, BF */
/*jslint white: true, browser: true, devel: true, evil: true, forin: true, onevar: true, undef: true, nomen: true, bitwise: true, newcap: true, immed: true */

/**
 * Load secondary, nonessential code, such as the wrench button.
 *
 * @param  context (object) An object containing necessary variables from the parent closure.
 * @note   This code is eval'ed inside of main.js.  The anonymous function is then called and data from the BibleForge closure is passed though the context object.
 * @note   Even though this function is not called immediately, it needs to be wrapped in parentheses to make it a function expression.
 * @return Null.
 */
(function (context)
{
    var show_context_menu,
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
         * @example open_menu(leftOffset, topOffset, [{text: "Menu Item 1", link: "http://link.com"}, [text: "Menu Item 2", link: some_function, true}]); /// Creates a menu with one external link and one link that runs a function with a line break separating the two.
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
                menu_container        = document.createElement("div"),
                menu_count            = menu_items.length,
                menu_item,
                prev_document_onclick = document.onclick ? document.onclick : function () {};
            
            is_open = true;
            
            for (i = 0; i < menu_count; ++i) {
                menu_item = document.createElement("a");
                
                /// If the link is a string, then it is simply a URL; otherwise, it is a function.
                if (typeof menu_items[i].link == "string") {
                    menu_item.href = menu_items[i].link;
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
            document.onclick = function ()
            {
                /// Close the context menu if the user clicks the page.
                close_menu(close_callback);
                
                /// Re-assign the onclick() code back to document.onclick now that this code has finished its purpose.
                ///TODO: If multiple functions attempt to reassign a global event function, there could be problems; figure out a better way to do this,
                ///      such as creating a function that handles all event re-assignments and attaching it to the BF object.
                document.onclick = prev_document_onclick;
                /// Run any code that normally would have run when the page is clicked.
                prev_document_onclick();
            };
            
            /// A delay is needed in order for the CSS transition to occur.
            window.setTimeout(function ()
            {
                context_menu.style.opacity = 1;
                
                if (open_callback && typeof open_callback == "function") {
                    open_callback();
                }
            }, 0);
        }
        
        
        /**
         * Handle opening the context menu, even if one is already open.
         *
         * @example show_context_menu(leftOffset, topOffset, [{text: "Menu Item 1", link: "http://link.com"}, [text: "Menu Item 2", link: some_function, true}]); /// Creates a menu with one external link and one link that runs a function with a line break separating the two.
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
                    if (close_callback && typeof close_callback == "function") {
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
                
                /// Make sure that this function will not fire again when the panel opens.
                panel.removeEventListener("transitionend",       on_panel_close, false);
                panel.removeEventListener("oTransitionEnd",      on_panel_close, false);
                panel.removeEventListener("webkitTransitionEnd", on_panel_close, false);
                
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
                settings_config = [{name: BF.lang.view, settings_value: "view", options: [{name: BF.lang.red_letters, type: "checkbox", settings_value: "red_letters"}, {name: BF.lang.paragraphs, type: "checkbox", settings_value: "in_paragraphs"}]}];
            
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
                    label_el.htmlFor = context.settings[config.settings_value] + "_" + config.options[cur_option].settings_value;
                    ///NOTE: document.createTextNode() is akin to innerText.  It does not inject HTML.
                    label_el.appendChild(document.createTextNode(config.options[cur_option].name));
                    table_cell.appendChild(label_el);
                    
                    /// Insert a <td> for the input element.
                    table_cell = table_row.insertCell(-1);
                    
                    /// Create the function that changes the proper settings before the switch statement so that it can be used multiple times inside of it.
                    apply_change = make_apply_change(context.settings[config.settings_value], config.options[cur_option].settings_value);
                    
                    switch (config.options[cur_option].type) {
                    case "checkbox":
                        input_el      = document.createElement("input");
                        input_el.type = "checkbox";
                        
                        /// Set the current value.
                        input_el.checked = context.settings[config.settings_value][config.options[cur_option].settings_value].get();
                        
                        input_el.onclick = make_checkbox_onclick(apply_change);
                    }
                    /// Give the input element an id that matches the label so that clicking the label will interact with the input field.
                    input_el.id   = label_el.htmlFor;
                    
                    table_cell.appendChild(input_el);
                    
                    ++cur_option;
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
            
            ///TODO: These need to be language specific.
            show_context_menu(wrench_pos.left, wrench_pos.top + wrench_button.offsetHeight, [{text: BF.lang.configure, link: show_configure_panel}, {line: true, text: BF.lang.blog, link: "http://blog.bibleforge.com"}, {text: BF.lang.help, link: show_help_panel}], function ()
            {
                /// TODO: Create a function attached to the BF object that adds and removes class names.
                wrench_button.className += " activeWrenchIcon";
            }, function ()
            {
                wrench_button.className = "wrenchIcon";
            });
            
            /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
            ///TODO: Determine if stopping propagation causes or could cause problems with other events.
            ///NOTE: IE 8- does not pass the event variable to the function, so the global event variable must be retrieved.
            /*@cc_on
                @if (@_jscript_version < 9)
                    e = window.event;
                    e.cancelBubble = true;
                @end
            @*/
            /// Mozilla/WebKit/Opera/IE 9
            if (e.stopPropagation) {
                e.stopPropagation();
            }

        };
    }());
});
