/// Set JSHint options.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

"use strict";

exports.init = function (config)
{
    var server;
    
    function init()
    {
        server = require("emailjs/email").server.connect({
            user:     config.user,
            password: config.pass,
            host:     config.host,
            ssl:      config.ssl,
            tls:      config.tls,
            domain:   config.domain,
            port:     config.port,
        });
    }
    
    init();
    
    return {
        /**
         * Send an email from a user.
         *
         * @param data (object)                  An object describing the message
         *                                       Object structure:
         *                                       message:         "The message to send; only plain text is allowed"
         *                                       submitter_name:  "(optional) The name to use for the reply-to address"
         *                                       submitter_email: "(optional) The address to use in the reply-to header"
         * @param callback (function) (optional) The function to call after an email is sent
         *                                       The function will be sent TRUE on success and FALSE if the email fails to send.
         */
        send_user_message: function (data, callback)
        {
            var message_data = {
                text: data.message,
                from: config.from,
                to:   config.to,
                subject: "BibleForge User Message: " + (data.submitter_name || "anonymous") + " <" + (data.submitter_email || "NOEMAIL") + ">",
            };
            
            /// If the user submitted an email address, use that address in the reply-to header.
            if (data.submitter_email) {
                /// The reply-to header should be the submitter's name and address, if any, a reply can be made to him.
                /// Email format is "[NAME ]<EMAIL>"
                message_data["reply-to"] = (data.submitter_name ? data.submitter_name + " " : "") + "<" + data.submitter_email + ">";
            }
            
            server.send(message_data, function server_response(err, message)
            {
                var res;
                
                if (err) {
                    ///NOTE: If an error occurs, it seems to keep an open connection (the script will not terminate).
                    console.log("Error sending an email!");
                    console.log(err);
                    console.log(message);
                    res = false;
                    /// Reinitialize the client since when there is an error, it gets messed up.
                    init();
                } else {
                    res = true;
                }
                
                if (callback) {
                    callback(res);
                }
            });
        }
    };
};
