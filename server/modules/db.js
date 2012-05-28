"use strict";

this.db = function (config)
{
    return (function ()
    {
        var db = new (require("db-mysql")).Database({
            hostname: config.db.host,
            user:     config.db.user,
            password: config.db.pass,
            database: config.db.base,
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
