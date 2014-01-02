/**
 * BibleForge
 *
 * @date    05-15-12
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

/// Set JSHint options.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

"use strict";

exports.config = {
    cache_simple_html: true, /// Whether or not to cache the contents of index_non-js.html.  Should be TRUE on production servers.
    /// The database options
    db: [
        /// Database server #1
        {
            base: "bf",         /// The database name
            ///NOTE: If connecting via a network host, remove the "sock" property.
            host: "127.0.0.1",  /// The hostname to connect to
            user: "user",       /// The database username
            pass: "password",   /// The user's password
            port: 3306,         /// The port to connect to (must be an integer) (optional: default 3306)
            ///NOTE: If connecting via a file socket, remove the "host" and "port" properties.
            ///      If not using a Unix socket file, remove the following line.
            sock: "mysqld.sock" /// The Unix socket file
        },
    ],
    use_ssl: false, /// Whether or not to use SSL (partially implemented)
    port: 7777,     /// The port for the BibleForge server to listen to.  This is the port that HTTP server forwards requests to, not the port of the HTTP server.
    /// The SMTP info for sending emails
    smtp: {
        user:   "email@address.com", /// SMTP username
        pass:   "password",          /// SMTP password
        host:   "smtp.address.com",  /// SMTP server
        port:    null,               /// SMTP port (if NULL, a standard port will be used)
        from:   "sender <info@bibleforge.com>",    /// The address displayed in the FROM header (does not need to be the same as user)
        to:     "recipient <info@bibleforge.com>", /// The address to send user generated emails to
        ssl:     true,  /// Whether or not to use SSL when connecting to the SMTP server
        tls:     false, /// Whether or not to use TLS when connecting to the SMTP server
        domain: "bibleforge.com", /// The domain to claim when connecting (optional)
    },
    static_path: "../client/" /// The folder containing files sent to the client.  The server also includes some of them.
};
