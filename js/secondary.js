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
            is_open      = false,
            opening      = false;
        
        /// Hide the context menu so that it will not be displayed on the page yet.
        context_menu.className = "contextMenu";
        
        document.body.insertBefore(context_menu, null);
        
        function close_menu(callback)
        {
            /// A delay is needed in order for the CSS tranisition to occur.
            window.setTimeout(function ()
            {
                context_menu.style.opacity = 0;                
            }, 0);
            
            /// This function is used by the transitionEnd variants to run the callback function after the CSS transition finishes.
            function on_close(e)
            {
                document.title = e.propertyName;
                is_open = false;
                
                callback();
            }
            
            ///NOTE: This will not work on Firefox 3.6- or IE.
            /// Mozilla 4.0+
            context_menu.addEventListener('transitionend',       on_close, false);
            context_menu.addEventListener('oTransitionEnd',      on_close, false);
            context_menu.addEventListener('webkitTransitionEnd', on_close, false);
        }
        
        return function (x_pos, y_pos, menu_items)
        {
            var i,
                menu_count = menu_items.length;
            
            /// Is it already in the process of opening?  If so, prevent the action.
            if (opening) {
                return;
            }
            
            opening = true;
            
            function open_menu()
            {
                is_open = true;
                
                context_menu.innerHTML = ""; /// TEMP
                for (i = 0; i < menu_count; ++i) {
                    ///TODO: Really create menu list.
                    context_menu.innerHTML += "<div>" + menu_items[i][0] + "</div>";
                }
                
                //context_menu.style.cssText = "left:" + x_pos + "px;top:" + y_pos + "px;display:inline"; /// Faster?
                context_menu.style.left     = x_pos + "px";
                context_menu.style.top      = y_pos + "px";
                context_menu.style.display  = "inline";
                window.setTimeout(function ()
                {
                    context_menu.style.opacity  = .99;
                    opening = false;
                }, 0);
            }
            
            
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
        wrench_button.type   = "image";
        wrench_button.id     = "wrenchIcon" + context.viewPort_num;
        ///TODO: Determine where this gif data should be.
        wrench_button.src    = "data:image/gif;base64,R0lGODdhEAAQAMIIAAEDADAyL05OSWlpYYyLg7GwqNjVyP/97iwAAAAAEAAQAAADQ3i6OwBhsGnCe2Qy+4LRS3EBn5JNxCgchgBo6ThwFDc+61LdY6m4vEeBAbwMBBHfoYgBLW8njUPmPNwk1SkAW31yqwkAOw==";
        wrench_button.title  = BF.lang.wrench_title;
        
        wrench_label.htmlFor = wrench_button.id;
        
        /// A label is used to allow the cursor to be all the way in the corner and still be able to click on the button.
        ///NOTE: Because of a bug in WebKit, the elements have to be attached to the DOM before setting the className value.
        ///TODO: Report the WebKit (or Chrome?) bug.
        wrench_label.appendChild(wrench_button);
        context.topBar.insertBefore(wrench_label, context.topBar.childNodes[0]);
        
        /// Make the elements transparent at first and fade in (using a CSS transition).
        wrench_label.className  = "wrenchPadding transparent";
        ///NOTE: In order for the transition to occur, there needs to be a slight delay.
        window.setTimeout(function ()
        {
            wrench_label.className = "wrenchPadding";
        }, 0);
        
        wrench_button.className = "wrenchIcon";
        
        ///TODO: Make the wrench icon look pressed.
        wrench_button.onclick = function ()
        {
            var wrench_pos = BF.get_position(wrench_button);
            
            ///TODO: These need to be language specific.
            show_context_menu(wrench_pos.left, wrench_pos.top + wrench_button.offsetHeight, [["Configure", show_panel], ["Blog", "http://blog.bibleforge.com"], ["Help", show_panel]]);
        };
    }
    
    create_wrench();
});
