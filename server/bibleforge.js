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

/// Create the BibleForge global object to which everything else attaches.
var BF = {};

/// ********************
/// * Create constants *
/// ********************

///TODO: Link this with the client-side code, perhaps using the Forge.
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

/// ****************
/// * Load modules *
/// ****************

BF.config = require("./config.js").config;

/// Attach the database object.
BF.db = require("./modules/db.js").db(BF.config.db);

/// Attach the email sender module.
BF.email = require("./modules/email.js").init(BF.config.smtp);

/// ***************************
/// * Create helper functions *
/// ***************************

/**
 * Safely parse JSON.
 *
 * @param  str (string) The JSON encoded string to parse.
 * @return The parsed JSON or NULL if the JSON is invalid.
 * @todo   Load this code from the client side (or copy it via the Forge).
 */
BF.parse_json = function (str)
{
    try {
        return JSON.parse(str);
    } catch (e) {}
};

/**
 * Escape a string to be safely added inside HTML.
 *
 * @example BF.escape_html('This is a "harmless" comment <script>...</script>'); /// Returns "This is a &quot;harmless&quot; comment &lt;script&gt;...&lt;/script&gt;"
 * @param   str (string) The string to be escaped
 * @note    This code only escapes the few dangerous symbols, not all of them.
 */
BF.escape_html = function (str)
{
    ///NOTE: It must first replace ampersands (&); otherwise, the other entities would be escaped twice.
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * Get the book, chapter, and verse numbers from a verse ID.
 *
 * @example BF.get_b_c_v(1002003); /// Returns {b: 1, c: 2, v: 3}
 * @param   verseID (number || string) The verse ID to convert.
 * @return  An object containing the book, chapter, and verse numbers: {b: book, c: chapter, v: verse}
 * @todo    Load this code from the client side (or copy it via the Forge).
 */
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

/**
 * Insert data into a string.
 *
 * @example BF.insert({"a": "text", num: 10}, "This is some {a}; {num} is a number. Here's more {a}.") /// Returns "This is some text; 10 is a number. Here's more text."
 * @param   obj      (object) An object representing the data to insert.
 * @param   template (string) The template string using curly brackets with a name to indicate placeholders.
 */
BF.insert = function (obj, template)
{
    /// Match all matching curly brackets, and send them to the function.
    return template.replace(/{([^{}]+)}/g, function (whole, inside)
    {
        var data = obj[inside];
        return typeof data !== "undefined" ? data : whole;
    });
};


/**
 * Tries to detect bots based on their user-agent.
 *
 * @param  agent (string) The user-agent to examine.
 * @return A boolean indicating whether or not the client appears to be a bot.
 * @note   User-agents can be easily spoofed.
 */
BF.is_bot = function (agent)
{
    ///NOTE: Using parentheses prevents the regex from possibly (however unlikely) from looking like the divion sign.
    return (/google(?:bot|\/)|yahoo\!|bingbot|baiduspider|iaskspider|ia_archiver|yandex/i).test(agent);
};

/// **************************
/// * Create query functions *
/// **************************

/**
 * Retrieve verses from the database.
 *
 * @example BF.verse_lookup({q: "1001001"}, function (data) {});                     /// Look up verses starting with Genesis 1:1 in English.
 * @example BF.verse_lookup({q: "19119160", f: "1"}, function (data) {});            /// Look up verses starting with Psalm 119:160 in English.
 * @example BF.verse_lookup({q: "19119152", d: "2"}, function (data) {});            /// Look up previous verses starting with Psalm 119:152 in English.
 * @example BF.verse_lookup({q: "66022021", f: "1", l: "zh_t"}, function (data) {}); /// Look up verses starting with Revelation 22:21 in Traditional Chinese.
 * @param   data     (object)   An object containing the query and query options.
 *                              Object structure:
 *                              q: "The verse ID",
 *                              d: "The direction (BF.consts.additional OR BF.consts.previous)" (optional) (default: BF.consts.additional)
 *                              f: "Whether or not to find the start of a paragraph"            (optional) (default: FALSE)
 *                              l: "The language ID"                                            (optional) (default: "en")
 *                              p: "Whether or not to return verses in groups of paragraphs"    (optional) (default: TRUE)
 * @param   callback (function) The function to send the results to.
 * @return  An object containing the results (if any).
 *          Object structure:
 *          n: (array)  An array of verse IDs for each verse returned
 *          v: (array)  An array of strings containing the HTML of the verses
 *          p: (array)  An array of numbers either 1 (indicating a paragraph break at that verse) or 0 (no paragraph break)
 *          t: (number) The total number of verses
 */
BF.verse_lookup = function (data, callback)
{
    var extra_fields,
        direction = data.d ? Number(data.d) : BF.consts.additional,
        find_paragraph_start = data.f === "1",
        in_paragraphs = typeof data.p === "undefined" ? true : data.p === "1",
        /// Select the language object specified by the query or use the default.
        lang = BF.langs[data.l] || BF.langs.en,
        limit,
        operator,
        order_by,
        verse_id = Number(data.q);
    
    if (in_paragraphs && lang.no_paragraphs) {
        in_paragraphs = false;
    }
    
    /**
     * Send the query to the database.
     *
     * @note This is a separate query because it can be called at two different times (and one is from an asynchronous callback).
     */
    function run_query(starting_verse)
    {
        BF.db.query("SELECT id, words" + extra_fields + " FROM `bible_" + lang.id + "_html` WHERE id " + operator + starting_verse + order_by + " LIMIT " + limit, function (verses)
        {
            var i,
                len,
                res = {
                    n: [],
                    v: []
                };
            
            /// Was there no response from the database?  This could mean the database crashed.
            if (!verses) {
                /// Send an empty response, and exit.
                callback({});
                return;
            }
            
            if (in_paragraphs) {
                res.p = [];
                
                /// Determine the actual number of verses that should be returned (starting from the end).
                ///NOTE: Because the last verse cannot be in the middle of a paragraph break, it has to trim off the last partial paragraph from the database results.
                len = verses.length;
                /// Did it return the expected number of verses?
                /// If not, then it must have reached the end of the Bible, in which case it has also reached the end of a paragraph.
                if (len === limit) {
                    /// Start at the end of the dataset, and look for the last (i.e., first in reverse order) paragraph marker.
                    /// Once found, trim off the last, incomplete paragraph (if any).
                    ///NOTE: When preforming previous lookups, there might not be anything to trim off, but additional lookups must at least trim off one verse
                    ///      because it must stop before the last paragraph marker.
                    while (true) {
                        /// Is it at a paragraph break?
                        ///NOTE: Since the database may return "0" or "1" as strings, it is necessary to convert them to JavaScript Numbers so that 0 will be falesy.
                        if (Number(verses[len - 1].paragraph)) {
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
                /// When not breaking at paragraphs, just send back all of the verses retrieved from the database.
                len = verses.length;
            }
            
            /// Loop through the verses and fill in the results object.
            for (i = 0; i < len; i += 1) {
                res.n[i] = Number(verses[i].id);
                res.v[i] = verses[i].words;
                if (in_paragraphs) {
                    res.p[i] = Number(verses[i].paragraph);
                }
            }
            
            /// Is the query looking up previous verses?
            if (direction === BF.consts.previous) {
                /// Because the database returns the verses in reverse order when preforming a previous lookup, they need to be reordered.
                ///NOTE: Because in paragraph mode, there is no way to know how many verses will be returned, it cannot simply put the verses in the array in reverse order above.
                res.n.reverse();
                res.v.reverse();
                if (in_paragraphs) {
                    res.p.reverse();
                }
            }
            
            /// Add the total number of verses being sent back to the client.
            res.t = res.n.length;
            
            callback(res);
        });
    }
    
    /// If verse_id is not a number, send an empty response, and exit.
    if (isNaN(verse_id)) {
        callback({});
        return;
    }
    
    if (verse_id < 1001001) {
        /// Default to Genesis 1:1 if the verse_id is too small.
        verse_id = 1001001;
    } else if (verse_id > 66022021) {
        /// If the user is looking for a verse past the end, default to Revelation 22:21.
        ///NOTE: 66022021 may need to be language dependent because different languages have different verse breaks.
        verse_id = 66022021;
        /// If returning paragraphs, make sure to find the beginning of the last paragraph.
        if (in_paragraphs) {
            find_paragraph_start = true;
        }
    }
    
    if (direction === BF.consts.additional) {
        operator = ">=";
        order_by = "";
    } else {
        ///NOTE: To get the right verses in a previous verse lookup, we need to sort the database by id in reverse order because
        ///      chapter and book boundaries are not predictable (i.e., we can't just say "WHERE id >= id - LIMIT").
        operator = "<=";
        ///NOTE: Leading space is needed in case the preceding variable does end with whitespace.
        order_by = " ORDER BY id DESC";
    }
    
    if (in_paragraphs) {
        /// The limit must be larger than the minimum length of the longest paragraph because paragraphs cannot be split.
        limit = lang.paragraph_limit;
        extra_fields = ", paragraph";
    } else {
        limit = lang.minimum_desired_verses;
        extra_fields = "";
    }
    
    /// If this is the first query and the query does not begin at an obvious paragraph break (e.g., the beginning of a chapter), we must first determine the where the paragraph begins.
    ///NOTE: For example, if the query is for Deuteronomy 6:4 (in paragraphs), the query cannot begin at Deuteronomy 6:4 because that is (or at least could be) the middle of a paragraph.
    ///      So, we must first use another query to determine the first paragraph break before (or at) Deuteronomy 6:4.  Currently, in the English version, it is Deuteronomy 6:3, so that will be used for starting_verse.
    if (find_paragraph_start) {
        /// Look up the nearest verse that is at a paragraph break, and then run the query.
        ///NOTE: This is much faster than adding a subquery to the main query.
        ///NOTE: Currently, find_paragraph_start is never true when direction === BF.consts.previous because previous lookups always start at a paragraph break.
        ///      In order to find the correct starting verse when looking up in reverse, the comparison operator (<=) would need to be greater than or equal to (>=),
        ///      and 1 would need to be subtracted from the found starting id.
        BF.db.query("SELECT id FROM `bible_" + lang.id + "_html` WHERE id <= " + verse_id + " AND paragraph = 1 ORDER BY id DESC LIMIT 1", function (start_id)
        {
            /// Was there no response from the database?  This could mean the database crashed.
            if (!start_id || !start_id[0]) {
                /// Send an empty response, and exit.
                callback({});
                return;
            }
            
            run_query(start_id[0].id);
        });
    } else {
        /// Since if not grouping the verses in paragraphs, it does not matter where the query starts, so just start with the verse being queried.
        run_query(verse_id);
    }
};


/**
 * Preform a standard search of the Bible.
 *
 * @example BF.standard_search({q: "love"}, function (data) {});               /// Preform a search for the word "love."
 * @example BF.standard_search({q: "love", s: "5033004"}, function (data) {}); /// Preform a search for the word "love" starting from Deuteronomy 33:4.
 * @param   data     (object)   An object containing the query and query options.
 *                              Object structure:
 *                              q: "The search query",
 *                              l: "The language ID"                             (optional) (default: "en")
 *                              s: "The verse ID from which to start the search" (optional) (default: 0)
 * @param   callback (function) The function to send the results to.
 * @return  An object containing the results (if any).
 *          Object structure:
 *          n: (array)  An array of verse IDs for each verse returned
 *          v: (array)  An array of strings containing the HTML of the verses
 *          t: (number) The total number of verses found in the search, not the total sent back, only present on intial queries
 */
BF.standard_search = function (data, callback)
{
    var db_client,
        html_table,
        initial,
        /// Select the language object specified by the query or use the default.
        lang = BF.langs[data.l] || BF.langs.en,
        query,
        start_at = data.s ? Number(data.s) : 0,
        terms = String(data.q),
        verse_table;
    
    html_table  = "`bible_" + lang.id + "_html`";
    verse_table = "`verse_text_" + lang.id + "`";
    
    ///NOTE: Currently, the first query does not specifiy a verse.
    initial = !Boolean(start_at);
    
    ///TODO: Requery if no client is returned.
    db_client = BF.db.request_a_client();
    
    /// Create the first part of the SQL/SphinxQL query.
    query = "SELECT " + verse_table + ".id, " + html_table + ".words FROM " + verse_table + ", " + html_table + " WHERE " + html_table + ".id = " + verse_table + ".id AND " + verse_table + ".query = \"" + db_client.escape_sphinx(terms) + ";limit=" + lang.minimum_desired_verses + ";ranker=none";
    
    /// Should the query start somewhere in the middle of the Bible?
    if (start_at) {
        ///NOTE: By keeping all of the settings in the Sphinx query, Sphinx can preform the best optimizations.
        ///      Another, less optimized, approach would be to use the database itself to filter the results like this:
        ///         ...WHERE id >= start_at AND query="...;limit=9999999" LIMIT lang.minimum_desired_verses
        query += ";minid=" + start_at;
    }
    
    /// Determine the search mode.
    /// Default is SPH_MATCH_ALL (i.e., all words are required: word1 & word2).
    /// SPH_MATCH_ALL should be the fastest and needs no sorting.
    
    /// Is there more than one word?
    if (terms.indexOf(" ") >= 0) {
        /// Are there more than 10 search terms in the query, or does the query contains double quotes (")?
        ///NOTE: Could use the more accurate (/([a-z-]+[^a-z-]+){11}/.test(terms)) to find word count, but it is slower.
        if (terms.indexOf("\"") >= 0 || terms.split(" ").length > 9) {
            /// By default, other modes stop at 10, but SPH_MATCH_EXTENDED does more (256?).
            /// Phrases (words in quotes) require SPH_MATCH_EXTENDED mode.
            ///NOTE: SPH_MATCH_BOOLEAN is supposed to find more than 10 words too but doesn't seem to.
            /// mode=extended is the most complex (and slowest?).
            /// Since we want the verses in canonical order, we need to sort the results by id, not based on weight.
            query += ";mode=extended;sort=extended:@id asc";
        /// Are boolean operators present?
        ///NOTE: This detects all ampersands (&), all pipes (|), and hyphens (-) only at the beginning of the string (e.g., "-word1 word2") or after a space (e.g., "word1 -word2").
        ///      The reason why only some hyphens are detected is that hyphens are only special symbols in certain positions.  If a hyphen separates two words (e.g., " Baal-peor"), it is not a special symbol.
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
        query += "\"";
    }
    
    /// Run the Sphinx search and return both the verse IDs and the HTML.
    db_client.query(query, function (data, err)
    {
        var i,
            len,
            res = {
                n: [],
                v: []
            };
        
        /// Was there no response (or an invalid response) from the database?  This could mean the database or Sphinx crashed.
        ///NOTE: If merely the length is 0, that means there were no results for that query, and we need to send an empty result with the proper response and not attempt to log it as an error.
        if (!data) {
            ///TODO: Do better logging,
            if (err) {
                console.log(err);
            }
            /// Send an empty response, and exit.
            callback({});
            return;
        }
        
        if (initial) {
            if (data.length > 0) {
                /// Because all of the columns share the same name when using UNION, the total verses found statistic is in the "words" column.
                res.t = Number(data.pop().words);
            } else {
                res.t = 0;
            }
        }
        
        len = data.length;
        
        for (i = 0; i < len; i += 1) {
            res.n[i] = Number(data[i].id);
            res.v[i] = data[i].words;
        }
        
        callback(res);
    });
};

/**
 * Preform a grammatical (morphological) search of the Bible.
 *
 * @example BF.standard_search({q: '["love",[[3,1]],[0]]'}, function (data) {});                 /// Preform a search for the word "love" when spoken by Jesus (i.e., red letter).
 * @example BF.standard_search({q: '["love",[[3,1]],[0]]', s: "704772"}, function (data) {});    /// Preform a search for the word "love" when spoken by Jesus (i.e., red letter) starting from the 704772th word (in English).
 * @example BF.standard_search({q: '["love",[[3,1],[6,3],[5,2]],[1,0,0]]'}, function (data) {}); /// Preform a search for the word "love" when not spoken by Jesus (i.e., black letter) and that is in the third person plural.
 * @param   data     (object)   An object containing the query and query options.
 *                              Object structure:
 *                              q: "A JSON encoed string defining an array of search terms and grammatical properties.",
 *                                 JSON structure:
 *                                 ["WORD", [[(number) GRAMMATICAL_CATEGORY, (number) ATTRIBUTE], ...],[(boolean) EXCLUDE, ...]]
 *                              l: "The language ID"                                                         (optional) (default: "en")
 *                              s: "The word ID (in the translated language) from which to start the search" (optional) (default: 0)
 * @param   callback (function) The function to send the results to.
 * @return  An object containing the results (if any).
 *          Object structure:
 *          i: (array)  An array of word IDs for each highlighted word
 *          n: (array)  An array of verse IDs for each verse returned
 *          v: (array)  An array of strings containing the HTML of the verses
 *          t: (number) The total number of verses found in the search, not the total sent back, only present on intial queries
 * @note    Grammatical searches examine the morphology of the original languages, not translations.
 * @note    The data.s property refers to the word ID, not the verse ID.
 */
BF.grammatical_search = function (data, callback)
{
    var db_client,
        html_table,
        i,
        initial,
        /// Select the language object specified by the query or use the default.
        lang = BF.langs[data.l] || BF.langs.en,
        morphological_table,
        query,
        start_at = data.s ? Number(data.s) : 0,
        ///TODO: Make this an object instead.
        query_arr = BF.parse_json(data.q);
    
    /// If query_arr is not an array, return an empty result.
    /// If the first element is not a string or the second or third element is not an array, return an empty result.
    ///NOTE: This assumes only one grammatical word being searched for, which is currently the limit.
    if (!(query_arr instanceof Array) || typeof query_arr[0] !== "string" || !(query_arr[1] instanceof Array) || !(query_arr[2] instanceof Array)) {
        callback({});
        return;
    }
    
    ///TODO: Requery if no client is returned.
    db_client = BF.db.request_a_client();
    
    html_table = "`bible_" + lang.id + "_html`";
    morphological_table = "`morphological_" + lang.id + "`";
    ///NOTE: Currently, the first query does not specifiy a verse.
    initial = !Boolean(start_at);
    
    /// Create the first part of the SQL/SphinxQL query.
    query = "SELECT " + morphological_table + ".id, " + morphological_table + ".verseID, " + html_table + ".words FROM " + morphological_table + ", " + html_table + " WHERE " + html_table + ".id = " + morphological_table + ".verseID AND " + morphological_table + ".query = \"" + db_client.escape_sphinx(query_arr[0]) + ";limit=" + lang.minimum_desired_verses + ";ranker=none";
    
    /// Should the query start somewhere in the middle of the Bible?
    if (start_at) {
        ///NOTE: By keeping all of the settings in the Sphinx query, Sphinx can preform the best optimizations.
        ///      Another less optimized approach would be to use the database itself to filter the results like this:
        ///         ...WHERE id >= start_at AND query="...;limit=9999999" LIMIT lang.minimum_desired_verses
        query += ";minid=" + start_at;
    }
    
    /// Create the filter from the query.
    /// Examples:
    ///     ... AS RED                           => ["...", [[3, 1]], [0]]                      => "...;filter=red,1"
    ///     ... AS NOT RED                       => ["...", [[3, 1]], [1]]                      => "...;!filter=red,1"
    ///     ... AS NOT RED, THIRD_PERSON, PLURAL => ["...", [[3, 1], [6, 3], [5, 2]],[1, 0, 0]] => "...;filter=number,2;filter=person,3;!filter=red,1"
    ///NOTE: The filters are added in reverse order simply to make the loop simpler.
    for (i = query_arr[1].length - 1; i >= 0; i -= 1) {
        query += ";" + (query_arr[2][i] ? "!" : "") + "filter=" + lang.grammar_categories[query_arr[1][i][0]] + "," + query_arr[1][i][1];
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
        query += "\"";
    }
    
    /// Run the Sphinx search, and return both the verse IDs and the HTML.
    db_client.query(query, function (data)
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
            /// Send an empty response, and exit.
            callback({});
            return;
        }
        
        if (initial) {
            /// Because all of the columns share the same name when using UNION, the total verses found statistic is in the "words" column.
            res.t = Number(data.pop().words);
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

/**
 * Retrieve lexical data from the database.
 *
 * @example BF.standard_search({q: "1"}, function (data) {}); /// Get the lexical data for the first word in the english Bible.
 * @param   data     (object)   An object containing the query and query options.
 *                              Object structure:
 *                              q: "The word ID (in the translated language)",
 *                              l: "The language ID" (optional) (default: "en")
 * @param   callback (function) The function to send the results to.
 * @return  An object containing the results (if any).
 *          Object structure:
 *          word      (string)  The original Greek, Hebrew, or Aramaic word, in Unicode.
 *          pronun    (string)  A JSON string containing the pronunciation of the word (same as data.pronun below except for the actual word, not the base form).
 *          strongs   (integer) The designated Strong's number for that word.
 *          base_word (string)  The original Greek, Hebrew, or Aramaic base form of the word, in Unicode.
 *          data      (string)  A JSON object containing the lexical information about the word.
 *                              Object structure:
 *                              def: {lit:    "The literal definition of a word (especially a name)",
 *                                    long:  ["A multi-dimensional array of various possible definitions"],
 *                                    short:  "A short and simple definition"}
 *                              deriv:  "Information about words this word is derived from",
 *                              pronun: {ipa:     "IPA Biblical reconstructed pronunciation (base form)",
 *                                       ipa_mod: "IPA modern pronunciation (base form)",
 *                                       dic:     "Dictionary Biblical reconstructed pronunciation (base form)",
 *                                       dic_mod: "Dictionary modern pronunciation (base form)",
 *                                       sbl:     "The Society of Biblical Literature's phonemic transliteration"}
 *                              see:    ["An array of Strong's numbers identifying additional words of interest."]
 *                              comment: "A string containing additional useful information"
 *          usage     (string)  A list of ways the word is translated.
 * @note    The usage data is planned to be completely redone and expanded.
 * @note    Also, any number of the following:
 *          part_of_speech, declinability, case_5, number, gender, degree, tense, voice, mood, person, middle, transitivity, miscellaneous, noun_type, numerical, form, dialect, type, pronoun_type
 */
BF.lexical_lookup = function (data, callback)
{
    /// Select the language object specified by the query or use the default.
    var bible_table,
        lang = BF.langs[data.l] || BF.langs.en,
        query,
        word_id = Number(data.q);
    
    bible_table = "`bible_" + lang.id + "`";
    
    /// Is it an Old Testament word?
    if (word_id < lang.divisions.nt) {
        query = "SELECT `bible_original`.word, `bible_original`.pronun, `lexicon_hebrew`.strongs, `lexicon_hebrew`.base_word, `lexicon_hebrew`.data, `lexicon_hebrew`.usage FROM " + bible_table + ", `bible_original`, `lexicon_hebrew`, `morphology` WHERE " + bible_table + ".id = " + word_id + " AND `bible_original`.id = " + bible_table + ".orig_id AND lexicon_hebrew.strongs = `bible_original`.strongs LIMIT 1";
    } else {
        query = "SELECT `bible_original`.word, `bible_original`.pronun, `lexicon_greek`.strongs, `lexicon_greek`.base_word, `lexicon_greek`.data, `lexicon_greek`.usage, `morphology`.part_of_speech, `morphology`.declinability, `morphology`.case_5, `morphology`.number, `morphology`.gender, `morphology`.degree, `morphology`.tense, `morphology`.voice, `morphology`.mood, `morphology`.person, `morphology`.middle, `morphology`.transitivity, `morphology`.miscellaneous, `morphology`.noun_type, `morphology`.numerical, `morphology`.form, `morphology`.dialect, `morphology`.type, `morphology`.pronoun_type FROM " + bible_table + ", `bible_original`, `lexicon_greek`, `morphology` WHERE " + bible_table + ".id = " + word_id + " AND `bible_original`.id = " + bible_table + ".orig_id AND lexicon_greek.strongs = `bible_original`.strongs AND `morphology`.id = `bible_original`.id LIMIT 1";
    }
    
    ///FIXME: Currently, BibleForge links words to the lexicon by Strong's numbers; however, this is too simplistic because some Strong's numbers have multiple entries.
    ///       So, there needs to be another identifier.
    BF.db.query(query, function (data)
    {
        /// Was there no response from the database?  This could mean the database crashed.
        if (!data || !data.length) {
            /// Send an empty response, and exit.
            callback({});
            return;
        }
        
        ///NOTE: Currently, only one results is requested, so it can simply send data[0].
        ///      In the future, it should return multiple results for some words (e.g., hyphenated words, phrases translated as one word).
        
        callback(data[0]);
    });
};


/// *******************************
/// * Prepare to start the server *
/// *******************************

/**
 * Load the language specific files and start the server.
 */
(function ()
{
    ///NOTE: Since the server cannot start until this is done, async only slows things down.
    var files = require("fs").readdirSync(BF.config.static_path + "js/lang"),
        i,
        id,
        lang;
    
    /// Pepare the langs object for the languages to attach to.
    BF.langs = {};
    
    for (i = files.length - 1; i >= 0; i -= 1) {
        lang = require(BF.config.static_path + "js/lang/" + files[i]).BF.langs;
        ///NOTE: Object.keys() ignores prototypes, so there is no need for hasOwnProperty().
        id = Object.keys(lang)[0];
        BF.langs[id] = lang[id];
    }
    
    /**
     * Listen for HTTP forwarded requests.
     */
    (function start_server()
    {
        /**
         * Create a closure to handle queries from the client.
         *
         * @return A function to handle queries.
         */
        var handle_query = (function ()
        {
            /**
             * Create a closure to house the code to produce the non-JavaScript version.
             *
             * @return A function to create the HTML for the non-JavaScript version.
             */
            var create_simple_page = (function ()
            {
                /**
                 * Create a closure to get the base HTML of the non-JavaScript code.
                 *
                 * @return A function to get the HTML for the non-JavaScript version.
                 */
                var get_simple_html = (function ()
                {
                    /// Prepare a variable in the closure to cache the results.
                    var html;
                    
                    /**
                     * Get the base HTML of the non-JavaScript code.
                     *
                     * @param  callback (function) The function to send the HTML back to.
                     * @return NULL
                     * @note   The callback function could be called synchronously or asynchronously.
                     */
                    return function get_simple_html(callback)
                    {
                        /// Has the HTML already been cached?
                        if (html) {
                            callback(html);
                        } else {
                            /// Asynchronously read the file.
                            require("fs").readFile(__dirname + "/index_non-js.html", "utf8", function (err, data)
                            {
                                if (err) {
                                    ///TODO: Log errors.
                                    console.error(err);
                                }
                                /// Is BibleForge configued to cache the results?
                                ///NOTE: Production servers should use the cache.
                                if (BF.config.cache_simple_html) {
                                    /// Optionally, cache the HTML in the closure.
                                    html = data;
                                }
                                
                                callback(data);
                            });
                        }
                    };
                }());
                
                /**
                 * Create the non-JavaScript version and send the results to the client.
                 *
                 * @param  url        (string) The URL from which to create the query.
                 * @param  data       (object) The GET/POST data as an object.
                 * @param  connection (object) The connection object though which data may be sent back to the client.
                 */
                return function create_simple_page(url, data, connection, info)
                {
                    /// Because the URI starts with a slash (/), the first array element is empty.
                    var full_featured_uri,
                        lang,
                        query,
                        /// Separate the URL to possibly obtain the language and query.
                        ///NOTE: Three matches are possibly returned because the leading slash (/) counts as one black result.
                        ///      I.e., "/en/love/".split("/", 3) returns ["", "en", "love"].
                        query_arr = url.path.split("/", 3);
                    
                    /// First, parse the query array for valid langauges and searches.
                    /// Example queries:
                    ///     /!
                    ///     /en/!
                    ///     /en/love/!
                    ///     /en_em/Romans 3:16/!
                    ///     /love/!
                    ///     /Romans 3:16/!
                    
                    /// Is the first parameter a valid language ID?
                    if (BF.langs[query_arr[1]]) {
                        /// Example queries:
                        ///     /en/!
                        ///     /en/love/!
                        lang = BF.langs[query_arr[1]];
                        /// Is the second parameter a query?
                        ///NOTE: If the last parameter is simply a question mark, it is not a valid query and indicates the switch to the non-JavaScript version.
                        if (query_arr[2] && query_arr[2] !== "!") {
                            /// Example query: /en/love/!
                            query = query_arr[2];
                        }
                    } else {
                        /// Since there was no language specified, use the default language.
                        ///TODO: Determine how to determine the default language.
                        lang = BF.langs.en;
                        /// Since the first parameter was not a language ID, the first parameter should be the query (if present).
                        /// Is the first parameter a query?
                        ///NOTE: If the first parameter not a valid language ID, the first parameter is treated as the query and any other parameters are discarded.
                        ///NOTE: If the last parameter is simply a question mark, it is not a valid query and indicates the switch to the non-JavaScript version.
                        if (query_arr[1] && query_arr[1] !== "!") {
                            /// Example query: /love/!
                            query = query_arr[1];
                        }
                    }
                    
                    /// Was there no query specified in the URL?
                    /// Example queries:
                    ///     /!
                    ///     /en/!
                    if (query === undefined || query === "") {
                        /// Get the queried language.
                        if (data && data.l && BF.langs[data.l]) {
                            lang = BF.langs[data.l];
                        }
                        /// Was there a query specified in the GET data?
                        ///NOTE: For example, this will occur when submitting a query from the query box in the non-JavaScript version.
                        /// Example query: /en/!?q=love
                        if (data && data.q) {
                            query = data.q;
                        } else {
                            /// If there is no query present, then preform a verse lookup starting at the beginning of the Bible (e.g., Genesis 1:1).
                            query = lang.books_short[1] + " 1:1";
                        }
                    } else {
                        /// Convert special symbols to normal ones (e.g., "%26" becomes "&").
                        query = global.decodeURIComponent(query);
                    }
                    
                    /// Create the URL to the full-featured page, used to possibly redirect proper browsers to.
                    ///NOTE: A scenario where this could be used is if someone using the non-JavaScript version sends a link to someone with a browser capable of handing the full-featured page.
                    ///NOTE: Both the leading and trailing slashes (/) are necessary.
                    full_featured_uri = "/" + lang.id + "/" + global.encodeURIComponent(query) + "/";
                    
                    /// If a query string is present, redirect it to the correct URL and cloes the connection.
                    ///TODO: Check for the presence of both the exclamation point (!) and _escaped_fragment_ and redirect to a page without the exclamation point.
                    ///TODO: Retrieve any query in the _escaped_fragment_ variable.
                    if (data && (data.q || data.l)) {
                        connection.writeHead(301, {"Location": "http" + (BF.config.use_ssl ? "s" : "") + "://" + url.host + (Number(url.port) !== 80 ? ":" + url.port : "") + full_featured_uri + "!"});
                        connection.end();
                        return;
                    }
                    
                    /// Now that we know the request will not be redirected, send the OK status code and appropriate header.
                    connection.writeHead(200, {"Content-Type": "text/html"});
                    
                    /**
                    * Create the page based on the retrieved HTML and send it to the client.
                    *
                    * @param html (string) The HTML of the non-JavaScript version.
                    * @note  The callback function could be called synchronously or asynchronously.
                    */
                    get_simple_html(function (html)
                    {
                        var b,
                            c,
                            content = {},
                            lang_css_html = "", /// If there is no language specific CSS, a blank string is needed.
                            lang_select = "<select name=l>",
                            verseID = lang.determine_reference(query);
                        
                        /// Add the full URL to the page to redirect capable browsers to the full-featured page.
                        ///NOTE: A regular expression is used because this string occurs twice.
                        content.FULL_URI = full_featured_uri;
                        /// Add the query string to the query box.
                        content.QUERY = BF.escape_html(query);
                        /// Add the language ID to the scroll's class to allow the CSS to change based on language.
                        content.LANG = lang.id;
                        /// Is the client (purporting to be) a bot?
                        if (info.is_bot) {
                            /// Do not show an unsupported message to bots.
                            /// Search engines are not intended to be supported and cannot read this text anyway.
                            /// Furthermore, we don't want that text showing up in search results.
                            content.UNSUPPORTED_WARNING = "";
                            /// Prevent the page from attempting to be changed to the full version.
                            /// This allows for cached versions to display properly without attempting to redirect to another page.
                            content.FORCE_REDIRECT = "false && ";
                        } else {
                            /// If the client is a real user, show an unsupported warning.
                            content.UNSUPPORTED_WARNING = lang.unsupported;
                            /// By setting this to blank, it allows the client to be redirect to the full version if his browser appears to be supported.
                            content.FORCE_REDIRECT = "";
                        }
                        /// Add information about the Bible version to the footer since there is no wrench menu.
                        ///NOTE: More of the footer will be created below.
                        content.FOOTER = "<legend>" + BF.insert({v: lang.abbreviation}, lang.about_version) + "</legend>" + lang.credits;
                        
                        /// Add the a <link> tag for the language specific CSS, if any.
                        if (lang.has_css) {
                            lang_css_html = "<link rel=stylesheet href=\"/styles/lang/" + lang.id + ".css?" + (lang.css_hash || "") + "\">";
                        }
                        content.LANG_CSS = lang_css_html;
                        
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
                                
                                /**
                                 * Compile the HTML for a normal verse.
                                 *
                                 * @return A string containing the verse encapsulated in HTML.
                                 * @note   This is a separate function because it can be called from two different places.
                                 */
                                function get_normal_verse_html()
                                {
                                    return "<div class=verse id=" + data[i].id + "_verse><span class=verse_number>" + v + "&nbsp;</span>" + data[i].words + " </div>";
                                }
                                
                                /// Was there no response from the database?  This could mean the database crashed or the verse is invalid.
                                if (!data || !data.length) {
                                    res = BF.insert({q: BF.escape_html(query)}, lang.no_results);
                                } else {
                                    ///TODO: Reuse code from the client side to create the HTML.
                                    len = data.length;
                                    v = (data[0].id % 1000);
                                    
                                    /**
                                     * Create the previous and next chapter links.
                                     *
                                     * @return A string containing HTML for the previous and next links.
                                     * @note   This function is run immediately.
                                     */
                                    back_next = (function ()
                                    {
                                        var next_b,
                                            next_c,
                                            prev_b,
                                            prev_c,
                                            res = "";
                                        
                                        /// Is this not Genesis 1? (Genesis 1 does not need a previous link.)
                                        if (b !== 1 || c !== 1) {
                                            if (c === 1) {
                                                /// If it is looking up the first chapter, the previous link should point to the last chapter of the previous book.
                                                prev_b = b - 1;
                                                prev_c = lang.chapter_count[prev_b];
                                            } else {
                                                /// If this is not the first chapter, the previous link shoudl simply point back one chapter.
                                                prev_b = b;
                                                prev_c = c - 1;
                                            }
                                            
                                            ///NOTE: Psalms uses a special name (i.e., "psalm" instead of "chapter").
                                            res += "<a class=\"static_link prev\" href=\"/" + lang.id + "/" + global.encodeURIComponent(lang.books_short[prev_b] + lang.space + prev_c + lang.chap_separator + "1") + "/" + (info.is_bot ? "" : "!") + "\">&lt; " + (prev_b === 19 ? lang.previous_psalm : lang.previous_chap) + "</a>";
                                        }
                                        
                                        /// Is this not Revelation 22? (Revelation 22 does not need a next link.)
                                        if (b !== 66 || c !== lang.chapter_count[66]) {
                                            /// Is this the last chapter in the book?
                                            if (c === lang.chapter_count[b]) {
                                                /// If this is the last chapter, the next link should point to the first chapter of the next book.
                                                next_b = b + 1;
                                                next_c = 1;
                                            } else {
                                                /// If this is not the last chapter, the next link should simply point to the next chapter.
                                                next_b = b;
                                                next_c = c + 1;
                                            }
                                            
                                            ///NOTE: Psalms uses a special name (i.e., "psalm" instead of "chapter").
                                            res += "<a class=\"static_link next\" href=\"/" + lang.id + "/" + global.encodeURIComponent(lang.books_short[next_b] + lang.space + next_c + lang.chap_separator + "1") + "/" + (info.is_bot ? "" : "!") + "\">" + (next_b === 19 ? lang.next_psalm : lang.next_chap) + " &gt;</a>";
                                        }
                                        
                                        return res;
                                    }());
                                    
                                    /// Add the previous and next links above the results.
                                    res += back_next;
                                    
                                    /// Loop through the verses and concatenate them to the results string.
                                    for (i = 0; i < len; i += 1) {
                                        /// Is this the first verse or the Psalm title?
                                        if (v < 2) {
                                            /// Is this chapter 1?  (We need to know if we should display the book name.)
                                            if (c === 1) {
                                                res += "<div class=book id=" + data[i].id + "_title><h2>" + lang.books_long_pretitle[b] + "</h2><h1>" + lang.books_long_main[b] + "</h1><h2>" + lang.books_long_posttitle[b] + "</h2></div>";
                                            /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
                                            } else if (i === 0) {
                                                /// Is this the book of Psalms?  (Psalms have a special name.)
                                                res += "<h3 class=chapter id=" + data[i].id + "_chapter>" + BF.insert({num: c}, b === 19 ? lang.chapter_psalm : lang.chapter) + "</h3>";
                                            }
                                            /// Is this a Psalm title (i.e., verse 0)?  (Psalm titles are displayed specially.)
                                            if (v === 0) {
                                                res += "<div class=psalm_title id=" + data[i].id + "_verse>" + data[i].words + "</div>";
                                            } else if (lang.first_verse_normal) {
                                                res += get_normal_verse_html();
                                            } else {
                                                res += "<div class=first_verse id=" + data[i].id + "_verse>" + data[i].words + " </div>";
                                            }
                                        } else {
                                            /// Is it a subscription?
                                            if (i === len - 1 && (data[i].id % 1000) === 255) {
                                                res += "<div class=subscription id=" + data[i].id  + "_verse>" + data[i].words + "</div>";
                                            } else {
                                                res += get_normal_verse_html();
                                            }
                                        }
                                        v += 1;
                                    }
                                    
                                    /// Add the previous and next links below the results.
                                    res += back_next;
                                }
                                
                                content.CONTENT = res;
                                
                                /// Add the verses and other content to the HTML and send it.
                                connection.end(BF.insert(content, html));
                            });
                            
                            /// While the database is looking up the verses, prepare the HTML more.
                            /// Add the full verse book name along with the chapter and BibleForge's name to the <title> tag.
                            content.TITLE = BF.escape_html(lang.books_short[b]) + " " + c + " - " + lang.app_name;
                            /// Add a description to the <meta name=description> tag.
                            content.DESC = BF.escape_html(lang.books_short[b]) + " " + c + " " + lang.in + " " + lang.full_name;
                            /// Now, wait for the database to return the results to the function above.
                            
                        /// If it is not a verse lookup, it must be a search of some kind.
                        } else {
                            /// Preform a standard search.
                            ///FIXME: Currently, it assumes all searches are standard searches.
                            BF.standard_search({q: lang.prepare_query(query), l: lang.id}, function (data)
                            {
                                var i,
                                    last_b,
                                    len,
                                    res = "",
                                    verse_obj;
                                
                                /// Was there no response from the database?  This could mean the database crashed or Sphinx is not running.
                                if (!data || !data.n || !data.n.length) {
                                    res = BF.insert({q: BF.escape_html(query)}, lang.no_results);
                                } else {
                                    ///TODO: Reuse code from the client side to create the HTML.
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
                                content.CONTENT = res;
                                
                                /// Add the verses and other content to the HTML and send it.
                                connection.end(BF.insert(content, html));
                            });
                            /// While the database is looking up the verses, prepare the HTML more.
                            /// Add the query and BibleForge's name to the <title> tag.
                            content.TITLE = BF.escape_html(query) + " - " + lang.app_name;
                            /// Add a description to the <meta name=description> tag.
                            content.DESC = BF.escape_html(lang.results_for + " " + query + " " + lang.in + " " + lang.full_name + " (" + lang.abbreviation + ")");
                            /// Now, wait for the database to return the results to the function above.
                        }
                        
                        /// Add language links to the footer.
                        ///NOTE: Part of the footer was created above.
                        content.FOOTER += "<legend>" + lang.all_lang + "</legend>";
                        
                        /// Build a <select> element that lists the available languages.
                        Object.keys(BF.langs).sort().forEach(function (lang_id)
                        {
                            /// Create the drop down box.
                            lang_select += "<option value=\"" + lang_id + "\"" + (lang_id === lang.id ? " SELECTED" : "") + ">" + BF.langs[lang_id].full_name + "</option>";
                            /// Create links for the footer for SEO purposes primarily.
                            content.FOOTER += "<a href=\"/" + lang_id + "/" + global.encodeURIComponent(verseID ? BF.langs[lang_id].books_short[b] + BF.langs[lang_id].space + c + BF.langs[lang_id].chap_separator + "1" : query) + "/" + (info.is_bot ? "" : "!") + "\">" + BF.langs[lang_id].full_name + "</a><br>";
                        });
                        content.LANG_SELECT = lang_select + "</select>";
                    });
                };
            }());
            
            /**
             * Handle all incomming requests.
             *
             * @param url        (object) The parsed URL.
             *                            Object structure:
             *                            host: "The server (e.g., 'bibleforge.com')",
             *                            path: "The URL path (e.g., '/api'),
             *                            port: "The port number (as a string) (e.g., '80')"
             * @param data       (object) The GET data.
             * @param connection (object) The object used to communicate with the client.
             *                            Object structure:
             *                            end:       function (data, encoding)
             *                            writeHead: function (statusCode, headers)
             * @param headers    (object) The HTTP headers from the request.
             */
            return function handle_query(url, data, connection, headers)
            {
                var send_results;
                
                /// Is the request for the APIs?
                if (url.path === "/api") {
                    /// Send the proper header.
                    connection.writeHead(200, {"Content-Type": "application/json"});
                    
                    /**
                     * Send the results back to the client as a JSON string.
                     *
                     * @param data (object) The data to be sent back to the client.
                     */
                    send_results = function (data)
                    {
                        connection.end(JSON.stringify(data));
                    };
                    
                    switch (Number(data.t)) {
                        case BF.consts.verse_lookup:
                            BF.verse_lookup(data, send_results);
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
                            if (data.t === "email") {
                                BF.email.send_user_message(data, send_results);
                            } else {
                                /// The request type was invalid, so close the connection.
                                connection.end();
                            }
                    }
                } else {
                    /// All other requests are replied to with the non-Javascript version.
                    create_simple_page(url, data, connection, {is_bot: BF.is_bot(headers["user-agent"])});
                }
            };
        }());
        
        /**
         * Start the server.
         */
        (function ()
        {
            var url = require("url"),
                qs  = require("querystring");
            
            /// HTTP is Node 0.10- is broken. This mitigates the problem.
            /// See https://github.com/LearnBoost/knox/commit/0bc57294e1bf7b4526ce9f51aee6553bac77cebc.
            require("http").globalAgent.maxSockets = 99999;
            
            /**
             * Finally create the server.
             *
             * @param request  (object) The object containing info about the request.
             * @param response (object) The object used to communicate back to the client.
             */
            require("http").createServer(function (request, response)
            {
                /// Give an object with a subset of the response's functions.
                var connection = {
                        /**
                         * Close the connection to the client and optionally write a final message.
                         *
                         * @param data     (string OR buffer) (optional) The final message to write to the client.
                         * @param encoding (string)           (optional) The encoding of the data.
                         * @note  This must be called in order for the client to finish the request.
                         */
                        end: function (data, encoding)
                        {
                            response.end(data, encoding);
                        },
                        /**
                         * Write the header to the client.
                         *
                         * @example connection.writeHead(200, {"Content-Type": "text/html"});
                         * @param   statusCode (number) The HTTP status code (e.g., 200 for "OK"; 404 for "File not found")
                         * @param   headers    (object) An object containing the headers to be sent.
                         * @note    This must be called in order for the client to finish the request.
                         */
                        writeHead: function (statusCode, headers)
                        {
                            response.writeHead(statusCode, headers);
                        }
                    },
                    /// Get the original URI that is being requested and parse it.
                    ///NOTE: Use the X-Request-URI header if present because sometimes the original URL gets modified (e.g., a request to /en/love/ is redirected to /api).
                    url_parsed = url.parse(request.headers["x-request-uri"] || request.headers.url || request.url);
                
                /// Is there GET data?
                ///TODO: Merge POST data with GET data.
                if (request.method.toUpperCase() === "GET") {
                    handle_query({host: request.headers.host, path: url_parsed.pathname, port: request.headers.port}, qs.parse(url_parsed.query), connection, request.headers);
                } else {
                    ///TODO: Also handle POST data.
                    /// If there is no data, close the connection.
                    connection.end();
                }
            }).listen(BF.config.port);
        }());
    }());
}());
