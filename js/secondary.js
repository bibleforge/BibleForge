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
/*global window */
/*jslint white: true, browser: true, devel: true, evil: true, forin: true, onevar: true, undef: true, nomen: true, bitwise: true, newcap: true, immed: true */

/**
 * Load secondary, nonessential code, such as the wrench button.
 *
 * @param  context (object) An object containing necessary variables from the parent closure.
 * @note   This code is eval'ed inside of main.js.  The anonymous function is then run and data from the BibleForge closure is passed though the context object.
 * @return Null.
 */
(function (context)
{
    var wrench_button = document.createElement("input"),
        wrench_label  = document.createElement("label");
    
    ///NOTE: A IE 8 bug prevents modification of the type attribute after an element is attached to the DOM.
    wrench_button.type      = "image";
    wrench_button.id        = "wrenchIcon" + context.viewPort_num;
    ///TODO: Determine where this gif data should be.
    wrench_button.src       = "data:image/gif;base64,R0lGODdhEAAQAMIIAAEDADAyL05OSWlpYYyLg7GwqNjVyP/97iwAAAAAEAAQAAADQ3i6OwBhsGnCe2Qy+4LRS3EBn5JNxCgchgBo6ThwFDc+61LdY6m4vEeBAbwMBBHfoYgBLW8njUPmPNwk1SkAW31yqwkAOw==";
    wrench_button.title     = BF.lang.wrench_title;
    
    wrench_label.htmlFor    = wrench_button.id;
    
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
});
