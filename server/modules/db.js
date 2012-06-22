/**
 * BibleForge
 *
 * @date    05-28-12
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

/// Set JSLint options.
/*jslint node: true, indent: 4, white: true */

/// Indicate all object properties used.  JSLint checks this list for misspellings.
/*properties
    Database, add, base, callback, charset, connect, database, db, escape, 
    execute, flush, host, hostname, length, name, pass, password, query, shift, 
    sql, user
*/

"use strict";

/**
 * Create the database abstraction layer.
 *
 * @param config (object) An object defining the database parameters.
 *                        Object format:
 *                          {host: "The hostname to connect to",
 *                           user: "The database username",
 *                           pass: "The user's password",
 *                           base: "The database name"}
 * @todo  Determine if the hostname can contain a port or socket.  If not, allow this to be configured as separate options.
 */
this.db = function (config)
{
    return (function ()
    {
        var connected,
            db = new (require("db-mysql")).Database({
                charset:  "utf8", /// With this, we do not need to send "SET NAMES utf8;" when the connection is made.
                ///NOTE: Could also use "port" and "socket".
                hostname: config.host,
                user:     config.user,
                password: config.pass,
                database: config.base
                /// Other options:
                ///     compress        (default: FALSE)
                ///     reconnect       (default: TRUE)
                ///     initCommand     (default: undefined)
                ///     readTimeout     (default: 0)
                ///     sslVerifyServer (default: FALSE)
                ///     timeout         (default: 0)
                ///     writeTimeout    (default: 0)
            }),
            /// The queue object is used to store any queries that are called before a connection to the database has been established.
            /// This is only used before the database has started.  The intended purpose is to allow the BibleForge server to start up
            /// before the database itself has started.  If the BibleForge loses its connection to the database later, the queries are
            /// simply rejected.  Once the database is running again, a connection will automatically be re-established.
            /**
             * Create the queue object to handle queued queries.
             */
            queue = (function ()
            {
                var queries = [];
                
                return {
                    /**
                     * Add an additional query to the queue.
                     *
                     * @param sql      (string)   The SQL query to execute
                     * @param callback (function) The function to call after the query returns
                     * @todo  Remove old queued queries when the client that requested them closes.
                     */
                    add: function (sql, callback)
                    {
                        queries[queries.length] = {sql: sql, callback: callback};
                    },
                    /**
                     * Execute queued queries.
                     *
                     * @note Since executing the queries is done asynchronously, this function may call itself.
                     */
                    flush: function ()
                    {
                        var query;
                        
                        /// Are there any queries?  If not, this function will simply end.
                        if (queries.length) {
                            
                            /// Get the first array item and simultaneously remove it form the array.
                            query = queries.shift();
                            
                            db.query().execute(query.sql, [], function (err, data)
                            {
                                if (typeof query.callback === "function") {
                                    query.callback(data, err);
                                }
                                /// Call this function again to preform the next query (if any).
                                queue.flush();
                            });
                        }
                    }
                };
            }());
        
        /**
         * Attempt to connect to the database.
         *
         * @note If a connection cannot be made, this function will call itself after a short delay.
         */
        function connect()
        {
            /// Try to connect to the database.
            db.connect(function (err)
            {
                /// If an error occured, try again shortly.
                if (err) {
                    setTimeout(connect, 50);
                } else {
                    /// If a connection is made, prevent queries form being stored and flush any that have already been stored.
                    connected = true;
                    queue.flush();
                }
            });
        }
        
        connect();
        
        return {
            /**
             * Escape a query argument.
             *
             * @example var sql = "SELECT * FROM `table` WHERE field = \"" + db.escape("\"; DROP TABLE table;") + "\"";
             * @param   str (string) The string to escape.
             */
            escape: function (str)
            {
                return db.escape(str);
            },
            /**
             * Escape a table or field name.
             *
             * @example var sql = "SELECT * FROM " + db.name("table name");
             * @param   str (string) The string to escape.
             */
            name: function (str)
            {
                return db.name(str);
            },
            /**
             * Execute a query.
             *
             * @param sql      (string)   The SQL query to execute
             * @param callback (function) The function to call after the query returns
             * @note  If the database has not yet been connected to, the query will be queued.
             */
            query: function (sql, callback)
            {
                /// Has a connection been established?
                if (connected) {
                    db.query().execute(sql, [], function (err, data)
                    {
                        ///TODO: Log errors.
                        if (typeof callback === "function") {
                            callback(data, err);
                        }
                    });
                } else {
                    /// Queue queries if the database has not yet started up.
                    queue.add(sql, callback);
                }
            },
            /**
             * Attempt to re-establish a connection with the server.
             */
            reconnect: function ()
            {
                db.disconnect();
                connected = false;
                connect();
            }
        };
    }());
};
