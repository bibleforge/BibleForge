/**
 * BibleForge
 *
 * @date    05-28-12
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

"use strict";

/**
 *
 * @todo Reconnect to the server if it gets disconnected.
 */
this.db = function (config)
{
    return (function ()
    {
        var connected,
            db = new (require("db-mysql")).Database({
            charset:  "utf8", /// With this, we do not need to send "SET NAMES utf8;" when the connection is made.
            hostname: config.host,
            user:     config.user,
            password: config.pass,
            database: config.base
        }),
            /// The queue object is used to store any queries that are called before a connection to the database has been established.
            /// This is only used before the database has started.  The intended purpose is to allow the BibleForge server to start up
            /// before the database itself has started.  If the BibleForge loses its connection to the database later, the queiries are
            /// simply rejected.  Once the database is running again, a connection will automatically be re-established.
            queue = (function ()
            {
                var queries = [];
                
                return {
                    /**
                     * Add an additional query to the queue.
                     *
                     * @param sql      (string)   The SQL query to send.
                     * @param callback (function) The function to call after the query returns.
                     * @todo  Remove old queued queries when the client that requested them closes.
                     */
                    add: function (sql, callback)
                    {
                        queries[queries.length] = {sql: sql, callback: callback};
                    },
                    flush: function ()
                    {
                        var query;
                        
                        if (queries.length) {
                            
                            query = queries.shift();
                            
                            db.query().execute(query.sql, [], function (err, data)
                            {
                                if (typeof query.callback === "function") {
                                    query.callback(data, err);
                                }
                                queue.flush();
                            });
                        }
                    }
                };
            }());
        
        function connect()
        {
            db.connect(function (err)
            {
                if (err) {
                    setTimeout(connect, 50);
                } else {
                    connected = true;
                    queue.flush();
                }
            });
        }
        
        connect();
        
        return {
            escape: function (str)
            {
                return db.escape(str);
            },
            name: function (str)
            {
                return db.name(str);
            },
            query: function (sql, callback)
            {
                if (connected) {
                    db.query().execute(sql, [], function (err, data)
                    {
                        if (typeof callback === "function") {
                            callback(data, err);
                        }
                    });
                } else {
                    queue.add(sql, callback);
                }
            }
        };
    }());
};
