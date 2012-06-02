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

this.db = function (config)
{
    return (function ()
    {
        var db = new (require("db-mysql")).Database({
            hostname: config.host,
            user:     config.user,
            password: config.pass,
            database: config.base,
            async: false
        });
        
        db.connect({async: false});
            
        db.query().execute("SET NAMES 'utf8'", {async: false});
        
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
                db.query().execute(sql, [], function (err, data)
                {
                    if (typeof callback === "function") {
                        callback(data, err);
                    }
                });
            }
        };
    }());
};
