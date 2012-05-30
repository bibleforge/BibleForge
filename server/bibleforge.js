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

var BF = {
    fs: require("fs")
};

function start_server()
{
    var handle_query = (function ()
    {
        function create_simple_page(url, data, connection)
        {
            /// Because the URI starts with a slash (/), the first array element is empty.
            var full_featured_uri,
                lang,
                query,
                query_arr = url.path.split("/", 3);
            
            /// Is the first parameter a valid language ID?
            if (BF.langs[query_arr[1]]) {
                lang = BF.langs[query_arr[1]];
                /// Is the second parameter a query?
                if (query_arr[2] && query_arr[2] !== "!") {
                    query = query_arr[2];
                }
            } else {
                /// Since there was no language specified, use the default language.
                ///TODO: Determine how to determine the default language.
                lang = BF.langs["en"];
                /// Since the first parameter was not a language ID, the first parameter should be the query (if present).
                /// Is the first parameter a query?
                if (query_arr[1] && query_arr[1] !== "!") {
                    query = query_arr[1];
                }
            }
            
            /// Was there no query specified in the URL?
            if (query === undefined || query === "") {
                /// Was there a query specified in the GET data?
                ///NOTE: For example, this will occur when submitting a query from the query box in the non-JavaScript version.
                if (data && data.q) {
                    query = data.q;
                } else {
                    /// If there is no query present, then preform a verse lookup starting at the beginning of the Bible (e.g., Genesis 1:1).
                    query = lang.books_short[1] + " 1:1";
                }
            } else {
                query = global.decodeURIComponent(query);
            }
            
            ///NOTE: Both the leading and trailing slashes (/) are necessary.
            full_featured_uri = "/" + lang.id + "/" + global.encodeURIComponent(query) + "/";
            
            /// If a query string is present, we want to redirect it to the correct URL.
            ///TODO: Check for the presence of both the exclamation point (!) and _escaped_fragment_ and redirect to a page without the exclamation point.
            ///TODO: Retrieve any query in the _escaped_fragment_ variable.
            if (data && data.q) {
                connection.writeHead(301, {"Location": "http" + (BF.config.use_ssl ? "s" : "") + "://" + url.host + (Number(url.port) !== 80 ? ":" + url.port : "") + full_featured_uri + "!"});
                connection.end();
                return;
            }
            
            /// Override the default 404 header.
            connection.writeHead(200, {"Content-Type": "text/html"});
            
            BF.fs.readFile(__dirname + "/index_non-js.html", "utf8", function (err, html)
            {
                var b,
                    c,
                    verseID = lang.determine_reference(query);
                
                html = html.replace(/__FULL_URI__/g, full_featured_uri);
                html = html.replace("__QUERY__", BF.escape_html(query));
                
                /// Is it a verse lookup?
                if (verseID) {
                    c = ((verseID - (verseID % 1000)) % 1000000) / 1000;
                    b = (verseID - (verseID % 1000) - c * 1000) / 1000000;
                    
                    BF.db.query("SELECT id, words FROM `bible_" + lang.id + "_html` WHERE book = " + b + " AND chapter = " + c, function (data)
                    {
                        var back_next,
                            i,
                            len,
                            res = "",
                            v;
                        
                        /// Was there no response from the database?  This could mean the database crashed.
                        if (!data || !data.length) {
                            res = lang.no_results1 + "<b>" + BF.escape_html(query) + "</b>" + lang.no_results2;
                        } else {
                            len = data.length;
                            v = (data[0].id % 1000);
                            
                            /**
                             * Create the previous and next chapter links.
                             *
                             * @return A string containing HTML.
                             * @todo   Make the text language specific.
                             */
                            back_next = (function ()
                            {
                                var next_b,
                                    next_c,
                                    prev_b,
                                    prev_c,
                                    res = "";
                                
                                /// Is this not Genesis 1?
                                if (b !== 1 || c !== 1) {
                                    if (c === 1) {
                                        prev_b = b - 1;
                                        prev_c = lang.chapter_count[prev_b];
                                    } else {
                                        prev_b = b;
                                        prev_c = c - 1;
                                    }
                                    
                                    res += '<a style="float:left;" href="/' + lang.id + "/" + lang.books_short[prev_b] + "%20" + prev_c + "/!" + '">&lt; Previous ' + (prev_b === 19 ? lang.psalm : lang.chapter) + "</a>";
                                }
                                
                                /// Is this not Revelation 22?
                                if (b !== 66 || c !== lang.chapter_count[66]) {
                                    if (c === lang.chapter_count[b]) {
                                        next_b = b + 1;
                                        next_c = 1;
                                    } else {
                                        next_b = b;
                                        next_c = c + 1;
                                    }
                                    
                                    res += '<a style="float:right;" href="/' + lang.id + "/" + lang.books_short[next_b] + "%20" + next_c + "/!" + '">Next ' + (next_b === 19 ? lang.psalm : lang.chapter) + " &gt;</a>";
                                }
                                
                                return res;
                            }());
                            res += back_next;
                            
                            for (i = 0; i < len; i += 1) {
                                /// Is this the first verse or the Psalm title?
                                if (v < 2) {
                                    /// Is this chapter 1?  (We need to know if we should display the book name.)
                                    if (c === 1) {
                                        res += "<div class=book id=" + data[i].id + "_title><h2>" + lang.books_long_pretitle[b] + "</h2><h1>" + lang.books_long_main[b] + "</h1><h2>" + lang.books_long_posttitle[b] + "</h2></div>";
                                    /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
                                    } else if (i === 0) {
                                        /// Is this the book of Psalms?  (Psalms have a special name.)
                                        res += "<h3 class=chapter id=" + data[i].id + "_chapter>" + (b === 19 ? lang.psalm : lang.chapter) + " " + c + "</h3>";
                                    }
                                    /// Is this a Psalm title (i.e., verse 0)?  (Psalm titles are displayed specially.)
                                    if (v === 0) {
                                        res += "<div class=psalm_title id=" + data[i].id + "_verse>" + data[i].words + "</div>";
                                    } else {
                                        res += "<div class=first_verse id=" + data[i].id + "_verse>" + data[i].words + " </div>";
                                    }
                                } else {
                                    /// Is it a subscription?
                                    if (i === len - 1 && (data[i].id % 1000) === 255) {
                                        res += "<div class=subscription id=" + data[i].id  + "_verse>" + data[i].words + "</div>";
                                    } else {
                                        ///TODO: Determine if "class=verse_number" is needed.
                                        res += "<div class=verse id=" + data[i].id + "_verse><span class=verse_number>" + v + "&nbsp;</span>" + data[i].words + " </div>";
                                    }
                                }
                                v += 1;
                            }
                            
                            res += back_next;
                        }
                        
                        html = html.replace("__CONTENT__", res);
                        connection.end(html);
                    });
                    
                    /// While the query is running, prepare the HTML more.
                    html = html.replace("__TITLE__", BF.escape_html(lang.books_short[b]) + " " + c + " - " + lang.app_name);
                } else {
                    ///TODO: Determine the search type.
                    BF.standard_search({q: lang.prepare_query(query), l: lang.id}, function (data)
                    {
                        var i,
                            last_b,
                            len,
                            res = "",
                            verse_obj;
                        
                        /// Was there no response from the database?  This could mean the database crashed.
                        
                        if (!data || !data.n || !data.n.length) {
                            res = lang.no_results1 + "<b>" + BF.escape_html(query) + "</b>" + lang.no_results2;
                        } else {
                            len = data.n.length;
                            for (i = 0; i < len; i += 1) {
                                verse_obj = BF.get_b_c_v(data.n[i]);
                                
                                if (verse_obj.v === 0) {
                                    /// Change verse 0 to indicate a Psalm title (e.g., change "Psalm 3:0" to "Psalm 3:title").
                                    verse_obj.v = lang.title;
                                } else if (verse_obj.v === 255) {
                                    /// Change verse 255 to indicate a Pauline subscription (e.g., change "Romans 16:255" to "Romans 16:subscription").
                                    verse_obj.v = lang.subscription;
                                }
                                
                                /// Is this verse from a different book than the last verse?
                                ///NOTE: This assumes that searches are always additional (which is correct, currently).
                                if (verse_obj.b !== last_b) {
                                    /// We only need to print out the book if it is different from the last verse.
                                    last_b = verse_obj.b;
                                    
                                    /// Convert the book number to text.
                                    res += "<h1 class=short_book id=" + data.n[i] + "_title>" + lang.books_short[verse_obj.b] + "</h1>";
                                }
                                
                                res += "<div class=search_verse id=" + data.n[i] + "_search><span>" + (lang.chapter_count[verse_obj.b] === 1 ? "" : verse_obj.c + ":") + verse_obj.v + "</span> " + data.v[i] + "</div>";
                            }
                        }
                        html = html.replace("__CONTENT__", res);
                        connection.end(html);
                    });
                    /// While the query is running, prepare the HTML more.
                    html = html.replace("__TITLE__", BF.escape_html(query) + " - " + lang.app_name);
                }
                
            });
        }
        
        return function handle_query(url, data, connection)
        {
            var send_results;
            
            /// Is the request for the APIs?
            if (url.path === "/api") {
                /// Send the proper header.
                connection.writeHead(200, {"Content-Type": "application/json"});
                
                send_results = function (data)
                {
                    connection.end(JSON.stringify(data));
                }
                
                switch (Number(data.t)) {
                    case BF.consts.verse_lookup:
                        BF.lookup(data, send_results);
                        break;
                    case BF.consts.standard_search:
                        BF.standard_search(data, send_results);
                        break;
                    case BF.consts.grammatical_search:
                        BF.grammatical_search(data, send_results);
                        break;
                    case BF.consts.lexical_lookup:
                        BF.lexical_lookup(data, send_results);
                        break;
                    default:
                        /// The request type was invalid, so close the connection.
                        connection.end();
                }
            } else {
                /// Build the non-JavaScript version.
                create_simple_page(url, data, connection);
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
            
            },
                ///NOTE: Use the X-Request-URI header if present because sometimes the original URL gets modified.
                url_parsed = url.parse(request.headers["x-request-uri"] || request.headers.url);
            
            /// Is there GET data?
            ///TODO: Merge POST data with GET data.
            if (request.method === "GET") {
                handle_query({host: request.headers.host, path: url_parsed.pathname, port: request.headers.port}, qs.parse(url_parsed.query), connection);
            } else {
                ///TODO: Also handle POST data.
                /// If there is no data, close the connection.
                connection.end();
            }
        }).listen(7777);
    }());
}

/// Catch errors so that it does not cause the entire server to crash.
process.on("uncaughtException", function(e)
{
    ///TODO: Log errors.
    console.error(e.message);
    console.error(e.stack);
});

BF.config = require("./config.js").config;

///TODO: This needs to be linked to the client side code.
BF.consts = {
    /// Query type "constants"
    verse_lookup:       1,
    mixed_search:       2,
    standard_search:    3,
    grammatical_search: 4,
    lexical_lookup:     5,
    
    /// Direction "constants"
    additional: 1,
    previous:   2
};


BF.parse_json = function (str)
{
    try {
        return JSON.parse(str);
    } catch (e) {}
};


BF.escape_html = function (str)
{
    ///NOTE: It must first replace ampersands (&) otherwise, it will escape the other entities.
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

BF.get_b_c_v = function (verseID)
{
    var c,
        v = verseID % 1000;
    
    c = ((verseID - v) % 1000000) / 1000;
    
    return {
        b: (verseID - v - c * 1000) / 1000000,
        c: c,
        v: v
    };
};


BF.db = require("./modules/db.js").db(BF.config);

BF.lookup = function (data, callback)
{
    var extra_fields,
        direction = data.d ? Number(data.d) : BF.consts.additional,
        find_paragraph_start = Boolean(data.f),
        in_paragraphs = data.p ? Boolean(data.p) : true,
        lang = data.l || "en",
        limit,
        operator,
        order_by,
        starting_verse,
        verse_id = Number(data.q);
    
    /**
     * Send the query to the database.
     *
     * @note This is a separate query because it can be called at two different times (and one is from an asynchronous callback).
     */
    function run_query()
    {
        BF.db.query("SELECT id, words" + extra_fields + " FROM `bible_" + lang + "_html` WHERE id " + operator + starting_verse + order_by + " LIMIT " + limit, function (data)
        {
            var break_after,
                i,
                len,
                res = {
                    n: [],
                    v: []
                };
            
            /// Was there no response from the database?  This could mean the database crashed.
            if (!data) {
                /// Send a blank response, and exit.
                callback({});
                return;
            }
            
            if (in_paragraphs) {
                res.p = [];
                
                /// Determine the actual number of verses that should be returned (starting from the end).
                ///NOTE: Because the last verse cannot be in the middle of a paragraph break, it has to trim off the last partial paragraph from the database results.
                len = data.length;
                /// Did it return the expected number of verses?
                /// If not, then it must have reached the end of the Bible, in which case it has also reached the end of a paragraph.
                if (len === limit) {
                    /// Start at the end of the dataset, and look for the last (i.e., first in reverse order) paragraph marker.
                    /// Once found, trim off the last, incomplete paragraph (if any).
                    ///NOTE: When preforming previous lookups, there might not be anything to trim off, but additional lookups must at least trim off one verse
                    ///      because it must stop before the last paragraph marker.
                    ///NOTE: (len >= 0) is just to make sure that it cannot get stuck in an infinite loop.
                    while (len >= 0) {
                        /// Is it at a paragraph break?
                        if (data[len - 1].paragraph) {
                            /// The first verse should be at a paragraph beginning, and the last verse
                            /// should be just before one. Therefore, when looking up previous verses,
                            /// we must get this verse (because previous lookups are in reverse).
                            /// So, previous lookups should stop now because this verse is at the
                            /// beginning of a paragraph, but additional lookups need to get the verse before.
                            if (direction === BF.consts.previous) {
                                break;
                            }
                            /// Move back one to get the verse before the paragraph break.
                            len -= 1;
                            break;
                        }
                        len -= 1;
                    }
                }
            } else {
                len = data.length;
            }
            
            for (i = 0; i < len; i += 1) {
                res.n[i] = Number(data[i].id);
                res.v[i] = data[i].words;
                if (in_paragraphs) {
                    res.p[i] = Number(data[i].paragraph);
                }
            }
            
            if (direction === BF.consts.previous) {
                /// Because the database returns the verses in reverse order when preforming a previous lookup, they need to be reordered.
                ///NOTE: Because in paragraph mode, there is no way to know how many verses will be returned, it cannot simply put the verses in the array in reverse order above.
                res.n.reverse();
                res.v.reverse();
                if (in_paragraphs) {
                    res.p.reverse();
                }
            }
            
            res.t = res.n.length;
            
            callback(res);
        });
    }
    
    /// Quickly check to see if the verse_id is outside of the valid range.
    ///TODO: Determine if verse_id < 1001001 should default to 1001001 and verse_id > 66022021 to 66022021.
    ///TODO: 66022021 may need to be language dependent because different languages have different verse breaks.
    /// Also, check to see if the language specified is valid.
    if (verse_id < 1001001 || !BF.langs[lang]) {
        callback({});
        return;
    }
    
    /// If the user is looking for a verse beyond Revelation 22:21, just return the last verse.
    if (verse_id > 66022021) {
        verse_id = 66022021;
        /// If returning paragraphs, make sure to find the beginning of the last paragraph.
        if (in_paragraphs) {
            find_paragraph_start = true;
        }
    }
    
    ///NOTE: To get PREVIOUS verses, we need to sort the database by id in reverse order because
    ///      chapter and book boundaries are not predictable (i.e., we can't just say "WHERE id >= id - LIMIT").
    
    if (direction === BF.consts.additional) {
        operator = ">=";
        order_by = "";
    } else {
        operator = "<=";
        ///NOTE: Leading space is needed in case the preceding variable does end with whitespace.
        order_by = " ORDER BY id DESC";
    }
    
    if (in_paragraphs) {
        /// The limit must be set to the minimum length of the longest paragraph because paragraphs cannot be split.
        limit = BF.langs[lang].paragraph_limit;
        extra_fields = ", paragraph";
    } else {
        limit = BF.langs[lang].minimum_desired_verses;
        extra_fields = "";
    }
    
    if (find_paragraph_start) {
        /// Look up the nearest verse that is at a paragraph break, and then run the query.
        ///NOTE: This is much faster than adding a subquery to the main query.
        ///NOTE: Currently, find_paragraph_start is never true when direction === BF.consts.previous because previous lookups always start at a paragraph break.
        ///      In order to find the correct starting verse when looking up in reverse, the comparison operator (<=) would need to be greater than or equal to (>=),
        ///      and 1 would need to be subtracted from the found starting id.
        BF.db.query("SELECT id FROM `bible_" + lang + "_html` WHERE id <= " + verse_id + " AND paragraph = 1 ORDER BY id DESC LIMIT 1", function (data)
        {
            /// Was there no response from the database?  This could mean the database crashed.
            if (!data || !data[0]) {
                /// Send a blank response, and exit.
                callback({});
                return;
            }
            
            starting_verse = data[0].id;
            run_query();
        });
    } else {
        starting_verse = verse_id;
        run_query();
    }
};


BF.standard_search = function (data, callback)
{
    var direction = data.d ? Number(data.d) : BF.consts.additional,
        initial,
        lang = data.l || "en",
        query,
        start_at = data.s ? Number(data.s) : 0,
        terms = String(data.q);
    
    /// Is the language invalid?
    if (!BF.langs[lang]) {
        callback({});
        return;
    }
    
    ///NOTE: Currently, the first query does not specifiy a verse.
    initial = !Boolean(start_at);
    
    /// Create the first part of the SQL/SphinxQL query.
    query = "SELECT `verse_text_" + lang + "`.id, `bible_" + lang + "_html`.words FROM `verse_text_" + lang + "`, `bible_" + lang + "_html` WHERE `bible_" + lang + "_html`.id = `verse_text_" + lang + "`.id AND `verse_text_" + lang + "`.query = \"" + BF.db.escape(terms) + ";limit=" + BF.langs[lang].minimum_desired_verses + ";ranker=none";
    
    /// Should the query start somewhere in the middle of the Bible?
    if (start_at) {
        ///NOTE: By keeping all of the settings in the Sphinx query, Sphinx can preform the best optimizations.
        ///      Another less optimized approach would be to use the database itself to filter the results like this:
        ///         ...WHERE id >= start_at AND query="...;limit=9999999" LIMIT BF.langs[lang].minimum_desired_verses
        query += ";minid=" + start_at;
    }
    
    /// Determine the search mode.
    /// Default is SPH_MATCH_ALL (i.e., all words are required: word1 & word2).
    /// SPH_MATCH_ALL should be the fastest and needs no sorting.
    
    /// Is there more than one word?
    ///FIXME: These could be one word with a hyphen (e.g., -bad).  However, this search would cause an error, currently.
    if (terms.indexOf(" ") >= 0) {
        /// Are there more than 10 search terms in the query, or does the query contains double quotes (")?
        ///NOTE: Could use the more accurate (preg_match('/([a-z-]+[^a-z-]+){11}/i', $query) == 1) to find word count, but it is slower.
        if (terms.indexOf('"') >= 0 || terms.split(" ").length > 9) {
            /// By default, other modes stop at 10, but SPH_MATCH_EXTENDED does more (256?).
            /// Phrases (words in quotes) require SPH_MATCH_EXTENDED mode.
            ///NOTE: SPH_MATCH_BOOLEAN is supposed to find more than 10 words too but doesn't seem to.
            /// mode=extended is the most complex (and slowest?).
            /// Since we want the verses in canonical order, we need to sort the results by id, not based on weight.
            query += ";mode=extended;sort=extended:@id asc";
        /// Are boolean operators present?
        ///NOTE: This detects ampersands (&), pipes (|), and hyphens (-) at the beginning of the string (e.g., "-word1 word2") or after a space (e.g., "word1 -word2").
        } else if (/(?:(?:^| )-|&|\|)/.test(terms)) {
            /// Set mode to boolean and order by id.
            query += ";mode=boolean;sort=extended:@id asc";
        /// Multiple words are being searched for but nothing else special.
        } else {
            /// Just order by id.
            query += ";sort=extended:@id asc";
        }
    }
    
    if (initial) {
        /// Initial queries need to calculate the total verse.
        ///NOTE: SphinxSE does not return statistics by default, but we can retrieve them by running another query immediately after the first
        ///      on the INFORMATION_SCHEMA.SESSION_STATUS table and UNION'ing it to the first.
        ///      The only draw back to this is that both queries must have the same number of columns.
        ///      Other ways to get the statistics is with the the following queries:
        ///         SHOW ENGINE SPHINX STATUS;
        ///             +--------+-------+-------------------------------------------------+
        ///             | Type   | Name  | Status                                          |
        ///             +--------+-------+-------------------------------------------------+
        ///             | SPHINX | stats | total: 421, total found: 421, time: 1, words: 1 |
        ///             | SPHINX | words | love:421:498                                    |
        ///             +--------+-------+-------------------------------------------------+
        ///
        ///         SHOW STATUS LIKE 'sphinx_%';
        ///             +--------------------------------+--------------+
        ///             | Variable_name                  | Value        |
        ///             +--------------------------------+--------------+
        ///             | sphinx_error_commits           | 0            |
        ///             | sphinx_error_group_commits     | 0            |
        ///             | sphinx_error_snapshot_file     |              |
        ///             | sphinx_error_snapshot_position | 0            |
        ///             | sphinx_time                    | 1            |
        ///             | sphinx_total                   | 421          |
        ///             | sphinx_total_found             | 421          |
        ///             | sphinx_word_count              | 1            |
        ///             | sphinx_words                   | love:421:498 |
        ///             +--------------------------------+--------------+
        ///
        ///     However, because these queries are SHOW queries and not SELECT queries, they must be executed after the initial SELECT query.
        ///
        ///NOTE: The first column is currently ignored.
        query += "\" UNION SELECT 0, VARIABLE_VALUE FROM INFORMATION_SCHEMA.SESSION_STATUS WHERE VARIABLE_NAME = 'sphinx_total_found'";
    } else {
        query += '"';
    }
    
    /// Run the Sphinx search and return both the verse IDs and the HTML.
    BF.db.query(query, function (data)
    {
        var i,
            len,
            res = {
                n: [],
                v: []
            };
        
        /// Was there no response from the database?  This could mean the database or Sphinx crashed.
        if (!data) {
            /// Send a blank response, and exit.
            callback({});
            return;
        }
        
        if (initial) {
            /// Because all of the columns share the same name when using UNION, the total verses found statistic is in the "words" column.
            res.t = Number(data.pop().words);
        } else {
            ///BUG: Without a truthy value here, the client thinks the results are empty.
            res.t = 1;
        }
        
        len = data.length;
        
        for (i = 0; i < len; i += 1) {
            res.n[i] = Number(data[i].id);
            res.v[i] = data[i].words;
        }
        
        callback(res);
    });
};


BF.grammatical_search = function (data, callback)
{
    var direction = data.d ? Number(data.d) : BF.consts.additional,
        i,
        initial,
        lang = data.l || "en",
        query,
        start_at = data.s ? Number(data.s) : 0,
        ///TODO: Make this an object instead.
        query_arr = BF.parse_json(data.q);
    
    /// Is the language or query invalid?
    if (!BF.langs[lang] || !query_arr) {
        callback({});
        return;
    }
    
    ///NOTE: Currently, the first query does not specifiy a verse.
    initial = !Boolean(start_at);
    
    /// Create the first part of the SQL/SphinxQL query.
    query = "SELECT `morphological_" + lang + "`.id, `morphological_" + lang + "`.verseID, `bible_" + lang + "_html`.words FROM `morphological_" + lang + "`, `bible_" + lang + "_html` WHERE `bible_" + lang + "_html`.id = `morphological_" + lang + "`.verseID AND `morphological_" + lang + "`.query = \"" + BF.db.escape(query_arr[0]) + ";limit=" + BF.langs[lang].minimum_desired_verses + ";ranker=none";
    
    /// Should the query start somewhere in the middle of the Bible?
    if (start_at) {
        ///NOTE: By keeping all of the settings in the Sphinx query, Sphinx can preform the best optimizations.
        ///      Another less optimized approach would be to use the database itself to filter the results like this:
        ///         ...WHERE id >= start_at AND query="...;limit=9999999" LIMIT BF.langs[lang].minimum_desired_verses
        query += ";minid=" + start_at;
    }
    
    for (i = query_arr[1].length - 1; i >= 0; i -= 1) {
        query += ";" + (query_arr[2][i] ? "!" : "") + "filter=" + BF.langs[lang].grammar_categories[query_arr[1][i][0]] + "," + query_arr[1][i][1];
    }
    
    
    if (initial) {
        /// Initial queries need to calculate the total verse.
        ///NOTE: SphinxSE does not return statistics by default, but we can retrieve them by running another query immediately after the first
        ///      on the INFORMATION_SCHEMA.SESSION_STATUS table and UNION'ing it to the first.
        ///      The only draw back to this is that both queries must have the same number of columns.
        ///      Other ways to get the statistics is with the the following queries:
        ///         SHOW ENGINE SPHINX STATUS;
        ///             +--------+-------+-------------------------------------------------+
        ///             | Type   | Name  | Status                                          |
        ///             +--------+-------+-------------------------------------------------+
        ///             | SPHINX | stats | total: 421, total found: 421, time: 1, words: 1 |
        ///             | SPHINX | words | love:421:498                                    |
        ///             +--------+-------+-------------------------------------------------+
        ///
        ///         SHOW STATUS LIKE 'sphinx_%';
        ///             +--------------------------------+--------------+
        ///             | Variable_name                  | Value        |
        ///             +--------------------------------+--------------+
        ///             | sphinx_error_commits           | 0            |
        ///             | sphinx_error_group_commits     | 0            |
        ///             | sphinx_error_snapshot_file     |              |
        ///             | sphinx_error_snapshot_position | 0            |
        ///             | sphinx_time                    | 1            |
        ///             | sphinx_total                   | 421          |
        ///             | sphinx_total_found             | 421          |
        ///             | sphinx_word_count              | 1            |
        ///             | sphinx_words                   | love:421:498 |
        ///             +--------------------------------+--------------+
        ///
        ///     However, because these queries are SHOW queries and not SELECT queries, they must be executed after the initial SELECT query.
        ///
        ///NOTE: The first two columns are currently ignored.
        query += "\" UNION SELECT 0, 0, VARIABLE_VALUE FROM INFORMATION_SCHEMA.SESSION_STATUS WHERE VARIABLE_NAME = 'sphinx_total_found'";
    } else {
        query += '"';
    }
    
    /// Run the Sphinx search and return both the verse IDs and the HTML.
    BF.db.query(query, function (data)
    {
        var i,
            len,
            res = {
                i: [],
                n: [],
                v: []
            },
            verse_count = 0;
        
        /// Was there no response from the database?  This could mean the database or Sphinx crashed.
        if (!data) {
            /// Send a blank response, and exit.
            callback({});
            return;
        }
        
        if (initial) {
            /// Because all of the columns share the same name when using UNION, the total verses found statistic is in the "words" column.
            res.t = Number(data.pop().words);
        } else {
            ///BUG: Without a truthy value here, the client thinks the results are empty.
            res.t = 1;
        }
        
        len = data.length;
        
        for (i = 0; i < len; i += 1) {
            res.i[i] = Number(data[i].id);
            /// Because Sphinx is searching at the word level, it might return multiple verses, so only add non-duplicate verses.
            if (res.n[verse_count - 1] !== Number(data[i].verseID)) {
                res.n[verse_count] = Number(data[i].verseID);
                res.v[verse_count] = data[i].words;
                verse_count += 1;
            }
        }
        
        callback(res);
    });
};

BF.lexical_lookup = function (data, callback)
{
    var lang = data.l || "en",
        query,
        word_id = Number(data.q);
    
    /// Is the language invalid?
    if (!BF.langs[lang]) {
        callback({});
        return;
    }
    
    /// Is it an Old Testament word?
    if (word_id < BF.langs[lang].divisions.nt) {
        query = "SELECT `bible_original`.word, `bible_original`.pronun, `lexicon_hebrew`.strongs, `lexicon_hebrew`.base_word, `lexicon_hebrew`.data, `lexicon_hebrew`.usage FROM `bible_" + lang + "`, `bible_original`, `lexicon_hebrew`, `morphology` WHERE `bible_" + lang + "`.id = " + word_id + " AND `bible_original`.id = `bible_" + lang + "`.orig_id AND lexicon_hebrew.strongs = `bible_original`.strongs LIMIT 1";
    } else {
        query = "SELECT `bible_original`.word, `bible_original`.pronun, `lexicon_greek`.strongs, `lexicon_greek`.base_word, `lexicon_greek`.data, `lexicon_greek`.usage, `morphology`.part_of_speech, `morphology`.declinability, `morphology`.case_5, `morphology`.number, `morphology`.gender, `morphology`.degree, `morphology`.tense, `morphology`.voice, `morphology`.mood, `morphology`.person, `morphology`.middle, `morphology`.transitivity, `morphology`.miscellaneous, `morphology`.noun_type, `morphology`.numerical, `morphology`.form, `morphology`.dialect, `morphology`.type, `morphology`.pronoun_type FROM `bible_" + lang + "`, `bible_original`, `lexicon_greek`, `morphology` WHERE `bible_" + lang + "`.id = " + word_id + " AND `bible_original`.id = `bible_" + lang + "`.orig_id AND lexicon_greek.strongs = `bible_original`.strongs AND `morphology`.id = `bible_original`.id LIMIT 1";
    }
    
    ///FIXME: Currently, BibleForge links words to the lexicon by Strong's numbers; however, this is too simplistic because some Strong's numbers have multiple entries.
    ///       So, there needs to be another identifier.
    BF.db.query(query, function (data)
    {
        /// Was there no response from the database?  This could mean the database crashed.
        if (!data || !data.length) {
            /// Send a blank response, and exit.
            callback({});
            return;
        }
        
        ///NOTE: Currently, only one results is requested, so it can simply send data[0].
        ///      In the future, it should return multiple results for some words (e.g., hyphenated words).
        callback(data[0]);
    });
};


/// Pepare the langs object for the languages to attach to.
BF.langs = {};

/// Load the languages
(function ()
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
    
    (function ()
    {
        function include(path, context, callback, timeout, retry)
        {
            BF.fs.readFile(path, "utf8", function (err, data)
            {
                var code = evaler(data);
                
                if (code === "function") {
                    code(context);
                }
                
                if (typeof callback === "function") {
                    callback(err);
                }
            });
        }
        
        BF.fs.readdir(BF.config.static_path + "js/lang/", function (err, files)
        {
            var len = files.length;
            
            (function load_file(i)
            {
                if (i === len) {
                    /// Now that every this is loaded, start the server.
                    ///TODO: Start the server first, but make it wait for the rest to load.
                    start_server();
                } else {
                    include(BF.config.static_path + "js/lang/" + files[i], null, load_file(i + 1));
                }
            }(0));
        });
     }());   
}());
