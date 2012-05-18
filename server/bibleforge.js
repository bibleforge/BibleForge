/**
 * BibleForge
 *
 * @date    05-15-12
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

"use strict";

var BF = {};

function start_server()
{
    var handle_query = (function ()
    {
        return function handle_query(path, data, connection)
        {
            switch (Number(data.t)) {
                case BF.consts.verse_lookup:
                    BF.lookup(data, connection);
                    break;
                case BF.consts.standard_search:
                    connection.end("test " + (new Date()).getTime());
                    break;
                case BF.consts.grammatical_search:
                    connection.end("test " + (new Date()).getTime());
                    break;
                default:
                    connection.end("test " + (new Date()).getTime());
            }
        }
    }());
    
    (function ()
    {
        var url = require("url"),
            qs  = require("querystring");
        
        require('http').createServer(function (request, response)
        {
            ///TODO: Determine if there the connection should be able to timeout.
            /// Give an object with a subset of the response's functions.
            var connection = {
                end: function (data, encoding)
                {
                    response.end(data, encoding);
                },
                write: function (chunk, encoding)
                {
                    response.write(chunk, encoding);
                },
                writeHead: function (statusCode, headers)
                {
                    response.writeHead(statusCode, headers);
                }
            }, url_parsed = url.parse(request.url);
            
            /// Is there GET data?
            ///TODO: Merge POST data with GET data.
            if (request.method === "GET") {
                handle_query(url_parsed.pathname, qs.parse(url_parsed.query), connection);
            } else {
                ///TODO: Also handle POST data.
                /// If there is no data, close the connection.
                connection.end();
            }
        }).listen(7777);
    }());
}

BF.config = require("./config.js").config;

///TODO: This needs to be linked to the client side code.
BF.consts = {
    /// Query type "constants"
    verse_lookup:       1,
    mixed_search:       2,
    standard_search:    3,
    grammatical_search: 4,
    
    /// Direction "constants"
    additional: 1,
    previous:   2
};

BF.include = (function ()
{
    /**
     * Eval code in a neutral scope.
     *
     * @param  code (string) The string to eval.
     * @return The result of the eval'ed code.
     * @note   This is used to prevent included code from having access to the variables inside of the function's scope.
     */
    function evaler(code)
    {
        return eval(code);
    }
    
    return (function ()
    {
        /// Stores files that have already been loaded so that they do not have to be downloaded more than once.
        ///TODO: Use the data in this variable and maybe make a way to ignore the cache is needed.
        var fs = require("fs");
        
        return function (path, context, callback, timeout, retry)
        {
            fs.readFile(path, "utf8", function (err, data)
            {
                var code = evaler(data);
                
                if (code === "function") {
                    code(context);
                }
                
                if (typeof callback === "function") {
                    callback(err);
                }
            });
        };
    }());
}());

BF.db_query = (function ()
{
    var db = new (require("db-mysql")).Database({
        hostname: BF.config.db.host,
        user:     BF.config.db.user,
        password: BF.config.db.pass,
        database: BF.config.db.base,
        async: false
    });
    
    db.connect({async: false});
        
    db.query().execute("SET NAMES 'utf8'", {async: false});
    
    return function db_query(sql, callback)
    {
        db.query().execute(sql, [], function (err, data)
        {
            if (typeof callback === "function") {
                callback(data);
            }
        });
    }
}());

BF.lookup = function (data, connection)
{
    connection.writeHead(200, {"Content-Type": "application/json"});
    connection.end("{}");
};

BF.langs = {};

BF.include("../client/js/lang/en.js", null, start_server);
