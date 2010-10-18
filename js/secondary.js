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
 * @note   This code is eval'ed inside of main.js.  The anonymous function is then run and data from the BibleForge closure is passed though the context object.
 * @note   Even though this function is not called immediately, it needs to be wrapped in parentheses to make it a function expression.
 * @return Null.
 */
(function (context)
{
    var show_context_menu = (function ()
    {
        var context_menu = document.createElement("div"),
            is_open      = false;
        
        ///NOTE: The default style does has "display" set to "none" and "position" set to "fixed."
        context_menu.className = "contextMenu";
        
        document.body.insertBefore(context_menu, null);
        
        function close_menu(callback)
        {
            if (!is_open) {
                return;
            }
            
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
        
        return function (x_pos, y_pos, menu_items)
        {
            var i,
                menu_count = menu_items.length;
            
            /// This code is in a separate function because it may need to be called as a callback after the menu is closed.
            function open_menu()
            {
                var menu_container        = "",
                    tmp_menu_html,
                    prev_document_onclick = document.onclick ? document.onclick : function () {};
                
                is_open = true;
                ///NOTE: Use white-space: nowrap and a div to hold it all.
                for (i = 0; i < menu_count; ++i) {
                    ///TODO: Really create menu list.
                    if (typeof menu_items[i][1] == "string") {
                        tmp_menu_html = '<a href="' + menu_items[i][1] + '">' + menu_items[i][0] + "</a>";
                    } else {
                        tmp_menu_html = '<a href="#something" onclick="">' + menu_items[i][0] + "</a>";
                    }
                    menu_container += "<div>" + tmp_menu_html + "</div>";
                }
                
                context_menu.innerHTML     = "<div>" + menu_container + "</div>";
                context_menu.style.cssText = "left:" + x_pos + "px;top:" + y_pos + "px;display:inline";
                
                /// Close the context menu if the user clicks the page.
                ///NOTE: Firefox 3.6 Does not close the menu when clicking the query box the first time.
                document.onclick = function ()
                {
                    close_menu();
                    
                    /// Re-assign the onclick() code back to document.onclick now that this code has finished its purpose.
                    ///TODO: If multiple functions attempt to reassign a global event function, there could be problems; figure out a better way to do this,
                    ///      such as creating a function that handles all event re-assignments and attaching it to the BF object.
                    document.onclick = prev_document_onclick;
                    /// Run any code that normally would have run when the page is clicked.
                    prev_document_onclick();
                }
                
                /// A delay is needed in order for the CSS transition to occur.
                window.setTimeout(function ()
                {
                    ///TODO: Determine if setting the opacity all the way up to 1 still causes a visual glitch.
                    context_menu.style.opacity = .99;
                }, 0);
            }
            
            /// If it is already open, close it and then re-open it with the new menu.
            if (is_open) {
                close_menu(open_menu);
            } else {
                open_menu();
            }
            

        };
    }());
    
    
    function show_panel()
    {
        
    }
    
    function create_wrench()
    {
        var wrench_button = document.createElement("input"),
            wrench_label  = document.createElement("label");
        
        ///NOTE: A IE 8 bug prevents modification of the type attribute after an element is attached to the DOM.
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
        wrench_label.className = "wrenchPadding transparent";
        ///NOTE: In order for the transition to occur, there needs to be a slight delay.
        window.setTimeout(function ()
        {
            wrench_label.className = "wrenchPadding";
        }, 0);
        
        wrench_button.className = "wrenchIcon";
        
        ///TODO: Make the wrench icon look pressed.
        ///NOTE: Opera does not send the onclick event from the label to the button.
        wrench_button.onclick = function (e)
        {
            var wrench_pos = BF.get_position(wrench_button);
            
            ///TODO: These need to be language specific.
            show_context_menu(wrench_pos.left, wrench_pos.top + wrench_button.offsetHeight, [["Configure", show_panel], ["Blog", "http://blog.bibleforge.com"], ["Help", show_panel]]);
            
            /// Stop the even from bubbling so that document.onclick() does not fire and attempt to close the menu immediately.
            ///TODO: Determine if stopping propagation causes or could cause problems with other events.
            ///NOTE: IE does not pass the event variable to the function, so the global event variable must be retrieved.
            if (!e) {
                e = window.event;
            }
            /// IE 8-
            e.cancelBubble = true;
            /// Mozilla/WebKit/Opera/IE 9
            if (e.stopPropagation) {
                e.stopPropagation();
            }

        };
    }
    
    create_wrench();
});
