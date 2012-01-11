/**
 * BibleForge
 *
 * @date    01-12-12
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

///HACK: This is a temporary Node.js script that is executed by PHP.
///      In the future, it is planned to replace all (or most) of the PHP with a Node.js environment.
///NOTE: It expects to be run from the root directory.

/// Usage: node js/.ref_info.js LANG "QUERY STRING"
///
/// Example: node js/.ref_info.js en "John 3:16"
/// Return:  A JSON object containing the verseID (or 0 if not a verse reference) and language specific data.

var BF  = {},
    fs  = require("fs"),
    lang,
    res = {};

BF.langs = {};

///NOTE: eval() is used instead of require() because eval() gives access to the local variables (i.e., BF).
eval(fs.readFileSync("./js/lang/" + process.argv[2] + ".js", "utf8"));

lang = BF.langs[process.argv[2]];

res.verseID = lang.determine_reference(process.argv[3]);

res.books_long_main      = lang.books_long_main;
res.books_long_posttitle = lang.books_long_posttitle;
res.books_long_pretitle  = lang.books_long_pretitle;
res.books_short          = lang.books_short;
res.chapter              = lang.chapter;
res.chapter_count        = lang.chapter_count;
res.psalm                = lang.psalm;

console.log(JSON.stringify(res));
