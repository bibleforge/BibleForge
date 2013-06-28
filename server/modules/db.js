/**
 * BibleForge
 *
 * @date    05-28-12
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
 * Copyright (C) 2013
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

/// How long to wait after an error
var reconnect_delay = 1000;

/**
 * Check if a Node.js module exists.
 *
 * @param  name (string) The name of the module to check for
 * @return TRUE if the module was found and FALSE if not
 */
function module_exists(name)
{
    try {
        require.resolve(name);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Escape special symbols used in Sphinx and the db connectors.
 *
 * @param  str (string) The string to escape.
 * @return An escaped string
 */
function sphinx_escape(str)
{
    /// Because question marks (?) are a special symbol to the database connectors, they must be escaped too.
    /// Semicolons are special symbols in SphinxQL and need to be escaped.
    return str.replace(/\?/g, "\\?").replace(/;/g, "\\\\;");
}

/**
 * Create an abstraction around the non-blocking Maria/MySQL connector.
 *
 * @param config (object) A BibleForge DB config object (see init() for details)
 */
function create_connection_non_blocking(config, set_status)
{
    var client = new (require("mariasql"))(),
        connecting,
        connected;
    
    /**
     * Open a connection to the database if one does not already exist.
     */
    function connect()
    {
        /// Make sure an open connection has not already been established or in the process of being established; otherwise, an infinite connection loop could occur.
        if (!connected && !connecting) {
            connecting = true;
            client.connect({
                host: config.host,
                user: config.user,
                port: config.port,
                password: config.pass,
                db: config.base,
            });
        }
    }
    
    /**
     * Reconnect on disconnections.
     *
     * @param err (object) (optional) An error message from the server
     */
    function handle_disconnect(err)
    {
        connecting = false;
        ///TODO: Log disconnection.
        connected = false;
        set_status(0);
        setTimeout(connect, reconnect_delay);
        
        if (err) {
            console.log(err);
        }
    }
    
    /// Open a connection.
    connect();
    
    /// Attach functions to the connect, error, and close events.
    client.on("connect", function ()
    {
        connecting = false;
        connected = true;
        set_status(1);
    }).on("error", handle_disconnect).on("close", handle_disconnect);
    
    return {
        /**
         * Escape a sphinx query argument.
         *
         * @example var sql = "SELECT * FROM `table` WHERE query = \"" + db_client.escape_sphinx("fake query;limit=99999") + ";ranker=none\"";
         * @param   str (string) The string to escape.
         * @return  An escaped string.
         * @note    This requires an open connection to a database.
         */
        escape_sphinx: function (str)
        {
            return sphinx_escape(client.escape(str));
        },
        /**
         * Send a simple SQL query and get any and all results.
         *
         * @param sql      (string)              The SQL string to execute.
         * @param callback (function) (optional) The function to call after all of the data is returned or an error occurred
         *                                       The callback() function will receive one variable if the query succeeds
         *                                       and two (the first will be undefined) on errors.
         */
        query: function (sql, callback)
        {
            /// Send the query.
            client.query(sql).on("result", function (res)
            {
                var data = [];
                
                res.on("row", function (row)
                {
                    /// Store each row in an array.
                    data[data.length] = row;
                }).on("end", function ()
                {
                    /// Once the query has finished, send the results to the callback, if any.
                    if (callback) {
                        callback(data);
                    }
                });
            }).on("error", function (err)
            {
                /// Catch errors.
                ///TODO: Log errors.
                if (callback) {
                    callback(undefined, err);
                }
            });
        },
    };
}

/**
 * Create an abstraction around the pure JavaScript Maria/MySQL connector.
 *
 * @param config (object) A BibleForge DB config object (see init() for details)
 */
function create_connection_js(config, set_status)
{
    var client,
        connecting,
        connected;
    
    /**
     * Create the connection object and make the connection.
     */
    function create_connection()
    {
        client = require("mysql").createConnection({
            host: config.host,
            user: config.user,
            port: config.port,
            password: config.pass,
            database: config.base,
            socketPath: config.sock,
        });
    }
    
    /**
     * Open and prepare a connection to the database if one does not already exist.
     */
    function connect()
    {
        if (!connected && !connecting) {
            connecting = true;
            /// In this module, a connection can only be used once (it cannot be used to reconnect to a server), so a new client object has to be created each time.
            create_connection();
            /// Attach functions to the connect, error, and close events.
            ///NOTE: This has to be done each time because this connector cannot reuse a connection object.
            client.on("error", handle_disconnect);
            client.connect(function on_connect(err)
            {
                /// Was there an error connecting?
                if (err) {
                    handle_disconnect(err);
                } else {
                    /// If no error was reported then the connection apparently opened correctly.
                    connecting = false;
                    connected = true;
                    set_status(1);
                }
            });
        }
    }
    
    /**
     * Reconnect on disconnections.
     *
     * @param err (object) (optional) An error message from the server
     */
    function handle_disconnect(err)
    {
        connecting = false;
        ///TODO: Log disconnection.
        connected = false;
        set_status(0);
        setTimeout(connect, reconnect_delay);
        
        if (err) {
            console.log(err);
        }
    }
    
    /// Open a connection.
    connect();
    
    return {
        /**
         * Escape a sphinx query argument.
         *
         * @example var sql = "SELECT * FROM `table` WHERE query = \"" + db_client.escape_sphinx("fake query;limit=99999") + ";ranker=none\"";
         * @param   str (string) The string to escape.
         * @return  An escaped string.
         * @note    This requires an open connection to a database.
         */
        escape_sphinx: function (str)
        {
            /// This module adds quotations around strings, but those will cause issues with Sphinx.
            return sphinx_escape(client.escape(str)).slice(1, -1);
        },
        /**
         * Send a simple SQL query and get the results.
         *
         * @param sql      (string)              The SQL string to execute.
         * @param callback (function) (optional) The function to call after all of the data is returned or an error occurred
         *                                       The callback() function will receive one variable if the query succeeds
         *                                       and two (the first will be undefined) on errors.
         */
        query: function (sql, callback)
        {
            /// Send the query.
            client.query(sql, function (err, data)
            {
                if (callback) {
                    callback(data, err);
                }
            });
        },
    };
}

/**
 * Create the database abstraction layer.
 *
 * @param db_config (array || object) An object or array of objects describing how to configure the database (see config.sample.js)
 *                                    Object structure:
 *                                    {
 *                                        host: "The host's address",
 *                                        port: "The port to listen to",
 *                                        sock: "The Unix file socket if not listening to a port",
 *                                        user: "The database username",
 *                                        user: "The database user's password",
 *                                        base: "The database to connect to",
 *                                    }
 */
exports.db = function init(db_config)
{
    var create_connection,
        request_a_client,
        servers = [],
        servers_count;
    
    /// If the mariasql module exists use that.
    ///NOTE: The mariasql module is faster and non-blocking, but it is a C module, so it is not as portable and may not be installed.
    if (module_exists("mariasql")) {
        create_connection = create_connection_non_blocking;
    } else {
        /// As a fallback, use the pure JavaScript client.
        create_connection = create_connection_js;
    }
    
    /// If only an object was sent, turn it into an array for convenience’s sake.
    if (!Array.isArray(db_config)) {
        db_config = [db_config];
    }
    
    servers_count = db_config.length - 1;
    
    /// Create a connection to each server.
    db_config.forEach(function (config)
    {
        var which = servers.length;
        servers[which] = {
            connection: create_connection(config, function set_status(status)
            {
                servers[which].online = status === 1;
            })
        };
    });
    
    /**
     * Get a free database client
     *
     * @return A client object or FALSE if none could be found
     * @note   This uses a round robin method.
     * @note   It would be nice if we could make a server as a backup server and only query it when the other servers are down.
     */
    request_a_client = (function ()
    {
        /// Since it adds 1 at the beginning of the loop, we start with -1 to go to 0 (i.e., the first server).
        var which_server = -1;
        
        return function ()
        {
            var tries = 0;
            
            /// Loop through all available servers (from where we left off) and try to find one online.
            for (;;) {
                /// Try the next server.
                which_server += 1;
                
                if (which_server > servers_count) {
                    which_server = 0;
                }
                
                if (servers[which_server].online) {
                    /// If a server is online, Stop looping and use that server.
                    break;
                }
                
                /// If that server is offline, keep track of how many we've tried and try the next one.  This way we know when we've tried them all.
                tries += 1;
                
                /// If we have tried all of the clients, give up.
                if (tries > servers_count) {
                    return false;
                }
            }
            
            ///TODO: Connection pooling.
            return servers[which_server].connection;
        };
    }());
    
    return {
        /**
         * Execute a query.
         *
         * @param sql      (string)   The SQL query to execute
         * @param callback (function) The function to call after the query returns
         * @note  If the database has not yet been connected to, the query will be queued.
         */
        query: function query(sql, callback)
        {
            var client = request_a_client();
            
            /// Were no clients available?
            if (!client) {
                /// If we cannot get a client, wait and try again later.
                setTimeout(function ()
                {
                    query(sql, callback);
                }, 100);
                return;
            }
            
            /// Hand off the query to the client.
            client.query(sql, callback);
        },
        /// For more complex queries (like ones involving escaping) a client object and be requested directly.
        /// Client's have the following functions:
        ///     .escape_sphinx()
        ///     .query()
        request_a_client: request_a_client,
    };
};
