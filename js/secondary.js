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
        
        
        function open_menu(x_pos, y_pos, menu_items)
        {
            var i,
                line_break_above      = false,
                menu_container        = document.createElement("div"),
                menu_count            = menu_items.length,
                menu_item,
                prev_document_onclick = document.onclick ? document.onclick : function () {};
            
            is_open = true;
            
            for (i = 0; i < menu_count; ++i) {
                /// If the link is simply a hyphen, then add a line break above the next item.
                if (menu_items[i][1] == "-") {
                    line_break_above = true;
                    /// Skip to the next menu item because lines are added to the next item.
                    /// That way, if there are no more items, the line will not be displayed.
                    /// Also, if there are multiple line breaks in a row, at most one line will be displayed.
                    continue;
                }
                
                menu_item = document.createElement("a");
                
                /// If the link is a string then it is simply a URL; otherwise, it is a function.
                if (typeof menu_items[i][1] == "string") {
                    menu_item.href = menu_items[i][1];
                } else {
                    ///TODO: Create a usable hash value.
                    menu_item.href    = "#";
                    menu_item.onclick = menu_items[i][1];
                }
                /// The the previous item was a line break, add a line above this item.
                if (line_break_above) {
                    menu_item.style.borderTop = "1px solid #A3A3A3";
                    line_break_above = false;
                }
                
                /// document.createTextNode() is akin to innerText.  It does not inject HTML.
                menu_item.appendChild(document.createTextNode(menu_items[i][0]));
                menu_container.appendChild(menu_item);
            }
            
            /// The menu needs to be cleared first.
            ///TODO: Determine if there is a better way to do this.  Since the items are contained in a single <div> tag, it should not be slow.
            context_menu.innerHTML = "";
            
            context_menu.appendChild(menu_container);
            
            ///TODO: Determine if the menu will go off of the page.
            context_menu.style.cssText = "left:" + x_pos + "px;top:" + y_pos + "px;display:inline";
            
            /// Close the context menu if the user clicks the page.
            ///BUG: Firefox 3.6 Does not close the menu when clicking the query box the first time.
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
        
        
        return function (x_pos, y_pos, menu_items)
        {
            /// If it is already open, close it and then re-open it with the new menu.
            if (is_open) {
                close_menu(function ()
                {
                    open_menu(x_pos, y_pos, menu_items)
                });
            } else {
                open_menu(x_pos, y_pos, menu_items);
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
        wrench_label.className = "wrenchPadding transparent";
        ///NOTE: In order for the CSS transition to occur, there needs to be a slight delay.
        window.setTimeout(function ()
        {
            wrench_label.className = "wrenchPadding";
        }, 0);
        
        wrench_button.className = "wrenchIcon";
        
        ///TODO: Make the wrench icon look pressed.
        ///BUG:  Opera does not send the onclick event from the label to the button.
        wrench_button.onclick = function (e)
        {
            var wrench_pos = BF.get_position(wrench_button);
            
            ///TODO: These need to be language specific.
            show_context_menu(wrench_pos.left, wrench_pos.top + wrench_button.offsetHeight, [["Configure", show_panel], [0, "-"], ["Blog", "http://blog.bibleforge.com"], ["Help", show_panel]]);
            
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
    }
    
    create_wrench();
});
