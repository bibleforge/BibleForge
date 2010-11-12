/**
 * BibleForge
 *
 * @date    10-30-08
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/// Set JSLint options.
/*global window */
/*jslint white: true, browser: true, devel: true, evil: true, forin: true, onevar: true, undef: true, nomen: true, bitwise: true, newcap: true, immed: true */

/// Create the global BibleForge variable if it does not exist.
if (!window.BF) {
    var BF = {};
}

/**
 * Create the BibleForge language specific object for the English language.
 *
 * @note    The object that is created is used by main.js to preform language specific operations.
 * @return  Returns an object containing language specific functions and variables.
 */
BF.lang = (function ()
{
    /// Create variables used by these functions but hidden from the rest of the code via closure.
    /// Book Regex
    ///NOTE: Created in the Forge via create_reference_regex.php on 04-20-2010 from ref_array.php.
    var books_re    = /^(?:1(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m|t (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m)))|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|2(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|nd (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|3(?: j(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|rd j(?:n|o(?:hn)?))|a(?:c(?:t(?: of the apostles?|s(?: of the apostles?)?)?)?|m(?:os?)?|p(?:a(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)|o(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)))|c(?:ant(?:e(?:cles?|sles?)|i(?:cles?|sles?))?|hron(?:i(?:c(?:hles?|les?)|kles?))?|ol(?:a(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?))|o(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?)))?)|d(?:a(?:n(?:e(?:il|l)|i(?:el|l))?)?|eu(?:t(?:eron(?:amy|omy))?)?|n|t|u(?:e(?:t(?:eron(?:amy|omy))?)?|t(?:eron(?:amy|omy))?)?)|e(?:c(?:c(?:l(?:es(?:iastes?)?)?)?|l(?:es(?:iast(?:es?|is?))?)?)?|f(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?|p(?:h(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?|r|st(?:er|h(?:er)?)?|x(?:o(?:d(?:us?)?)?)?|z(?:e(?:k(?:i(?:al|el))?)?|k|ra?)?)|first (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|g(?:a(?:l(?:a(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?|e(?:n(?:asis?|esis?|isis?)?)?|n)|h(?:a(?:b(?:a(?:c(?:a(?:ck?|k)|u(?:ck?|k))|k(?:a(?:c|k)|k(?:a(?:c|k)|u(?:c|k))|u(?:c|k))))?|g(?:ai|g(?:ai)?)?)?|br?|eb(?:r(?:ews?)?)?|g|o(?:s(?:a(?:ya)?|eah?|ia)?)?)|i(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|i(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|i j(?:n|o(?:hn)?))|s(?:a(?:ah|i(?:ah?|h))?|iah?)?)|j(?:a(?:m(?:es?)?|s)?|b|d(?:gs?|s)?|er(?:amiah?|emiah?|imiah?)?|g(?:ds?|s)?|hn|l|nh?|o(?:b|el?|hn?|l|n(?:ah?)?|s(?:h(?:ua)?)?)?|r|u(?:d(?:e|g(?:es?|s)?)?)?)|kings?|l(?:a(?:m(?:antati(?:ans?|ons?)|entati(?:ans?|ons?)|intati(?:ans?|ons?))?|v(?:iti(?:c(?:as|us)|k(?:as|us)))?)?|ev(?:iti(?:c(?:as|us?)|k(?:as|us?)))?|ke?|m|u(?:ke?)?|v)|m(?:a(?:l(?:a(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i))|e(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i)))?|rk?|t(?:h(?:e(?:uw|w)|u(?:ew|w))|t(?:h(?:e(?:uw|w)|u(?:ew|w)))?)?)|ch|i(?:c(?:ah?|hah?)?|k(?:ah?|ea?))?|k|l|rk?|t)|n(?:a(?:h(?:um)?|m)?|e(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?|imiah?)?|i(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?)?|m|u(?:m(?:bers?)?)?)|ob(?:a(?:d(?:iah?)?)?|d)?|p(?:eter?|h(?:i(?:l(?:e(?:m(?:on)?)?|i(?:p(?:i(?:ans?|ons?)|pi(?:ans?|ons?)))?)?)?|lm|m|p)?|r(?:o(?:v(?:erbs?)?)?|v)?|s(?:a(?:lms?)?|s)?|v)|r(?:ev(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?|m|o(?:m(?:ans?|e)?)?|th?|u(?:th?)?|v)|s(?:a(?:lms?|m(?:uel)?)|econd (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|g|ng|o(?:lomon|n(?:g(?: of so(?:lom(?:an|on)|ngs?)|s(?: of solom(?:an|on))?)?)?))|t(?:h(?:e (?:act(?: of the apostles?|s of the apostles?)|song(?: of so(?:lom(?:an|on)|ngs?)|s of solom(?:an|on)))|ird j(?:n|o(?:hn)?))|i(?:m(?:othy)?|t(?:us?)?)?|m|t)|z(?:a(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?))?|k(?:ariah?|eriah?)?)?|c(?:h|k)?|e(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?)?)?|k(?:ariah?|eriah?)?|p(?:h(?:aniah?|eniah?)?)?)?|k|p))[\s0-9:.;,\-]*$/i,
        book_arr_re = [0, /^g(?:e(?:n(?:asis?|esis?|isis?)?)?|n)[\s0-9:.;,\-]*$/i, /^ex(?:o(?:d(?:us?)?)?)?[\s0-9:.;,\-]*$/i, /^l(?:av(?:iti(?:c(?:as|us)|k(?:as|us)))?|ev(?:iti(?:c(?:as|us?)|k(?:as|us?)))?|v)[\s0-9:.;,\-]*$/i, /^n(?:m|u(?:m(?:bers?)?)?)[\s0-9:.;,\-]*$/i, /^d(?:eu(?:t(?:eron(?:amy|omy))?)?|t|u(?:e(?:t(?:eron(?:amy|omy))?)?|t(?:eron(?:amy|omy))?)?)[\s0-9:.;,\-]*$/i, /^jos(?:h(?:ua)?)?[\s0-9:.;,\-]*$/i, /^j(?:d(?:gs?|s)?|g(?:ds?|s)?|udg(?:es?|s)?)[\s0-9:.;,\-]*$/i, /^r(?:th?|u(?:th?)?)[\s0-9:.;,\-]*$/i, /^(?:1(?: s(?:a(?:m(?:uel)?)?|m)|s(?:a(?:m(?:uel)?)?|m|t s(?:a(?:m(?:uel)?)?|m)))|first s(?:a(?:m(?:uel)?)?|m)|i s(?:a(?:m(?:uel)?)?|m)|sam(?:uel)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: s(?:a(?:m(?:uel)?)?|m)|nd s(?:a(?:m(?:uel)?)?|m)|s(?:a(?:m(?:uel)?)?|m))|ii s(?:a(?:m(?:uel)?)?|m)|second s(?:a(?:m(?:uel)?)?|m))[\s0-9:.;,\-]*$/i, /^(?:1(?: k(?:gs?|i(?:ngs?)?)|k(?:gs?|i(?:ngs?)?)|st k(?:gs?|i(?:ngs?)?))|first k(?:gs?|i(?:ngs?)?)|i k(?:gs?|i(?:ngs?)?)|kings?)[\s0-9:.;,\-]*$/i, /^(?:2(?: k(?:gs?|i(?:ngs?)?)|k(?:gs?|i(?:ngs?)?)|nd k(?:gs?|i(?:ngs?)?))|ii k(?:gs?|i(?:ngs?)?)|second k(?:gs?|i(?:ngs?)?))[\s0-9:.;,\-]*$/i, /^(?:1(?: ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|st ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?)|chron(?:i(?:c(?:hles?|les?)|kles?))?|first ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|i ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|nd ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?)|ii ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|second ch(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?)[\s0-9:.;,\-]*$/i, /^e(?:r|zra?)[\s0-9:.;,\-]*$/i, /^n(?:e(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?|imiah?)?|i(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?)?)[\s0-9:.;,\-]*$/i, /^est(?:er|h(?:er)?)?[\s0-9:.;,\-]*$/i, /^j(?:b|ob)[\s0-9:.;,\-]*$/i, /^(?:ps(?:a(?:lms?)?|s)?|salms?)[\s0-9:.;,\-]*$/i, /^p(?:r(?:o(?:v(?:erbs?)?)?|v)?|v)[\s0-9:.;,\-]*$/i, /^ec(?:c(?:l(?:es(?:iastes?)?)?)?|l(?:es(?:iast(?:es?|is?))?)?)?[\s0-9:.;,\-]*$/i, /^(?:cant(?:e(?:cles?|sles?)|i(?:cles?|sles?))?|s(?:g|ng|o(?:lomon|n(?:g(?: of so(?:lom(?:an|on)|ngs?)|s(?: of solom(?:an|on))?)?)?))|the song(?: of so(?:lom(?:an|on)|ngs?)|s of solom(?:an|on)))[\s0-9:.;,\-]*$/i, /^is(?:a(?:ah|i(?:ah?|h))?|iah?)?[\s0-9:.;,\-]*$/i, /^j(?:er(?:amiah?|emiah?|imiah?)?|r)[\s0-9:.;,\-]*$/i, /^l(?:a(?:m(?:antati(?:ans?|ons?)|entati(?:ans?|ons?)|intati(?:ans?|ons?))?)?|m)[\s0-9:.;,\-]*$/i, /^ez(?:e(?:k(?:i(?:al|el))?)?|k)?[\s0-9:.;,\-]*$/i, /^d(?:a(?:n(?:e(?:il|l)|i(?:el|l))?)?|n)[\s0-9:.;,\-]*$/i, /^ho(?:s(?:a(?:ya)?|eah?|ia)?)?[\s0-9:.;,\-]*$/i, /^j(?:l|o(?:el?|l))[\s0-9:.;,\-]*$/i, /^am(?:os?)?[\s0-9:.;,\-]*$/i, /^ob(?:a(?:d(?:iah?)?)?|d)?[\s0-9:.;,\-]*$/i, /^j(?:nh|on(?:ah?)?)[\s0-9:.;,\-]*$/i, /^m(?:ch|i(?:c(?:ah?|hah?)?|k(?:ah?|ea?))?)[\s0-9:.;,\-]*$/i, /^na(?:h(?:um)?|m)?[\s0-9:.;,\-]*$/i, /^h(?:a(?:b(?:a(?:c(?:a(?:ck?|k)|u(?:ck?|k))|k(?:a(?:c|k)|k(?:a(?:c|k)|u(?:c|k))|u(?:c|k))))?)?|b)[\s0-9:.;,\-]*$/i, /^z(?:ep(?:h(?:aniah?|eniah?)?)?|p)[\s0-9:.;,\-]*$/i, /^h(?:ag(?:ai|g(?:ai)?)?|g)[\s0-9:.;,\-]*$/i, /^z(?:a(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?))?|k(?:ariah?|eriah?)?)?|c(?:h|k)?|e(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?)?)?|k(?:ariah?|eriah?)?)?|k)[\s0-9:.;,\-]*$/i, /^m(?:al(?:a(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i))|e(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i)))?|l)[\s0-9:.;,\-]*$/i, /^m(?:at(?:h(?:e(?:uw|w)|u(?:ew|w))|t(?:h(?:e(?:uw|w)|u(?:ew|w)))?)?|t)[\s0-9:.;,\-]*$/i, /^m(?:ark?|k|rk?)[\s0-9:.;,\-]*$/i, /^l(?:ke?|u(?:ke?)?)[\s0-9:.;,\-]*$/i, /^j(?:hn|n|o(?:hn?)?)[\s0-9:.;,\-]*$/i, /^(?:ac(?:t(?: of the apostles?|s(?: of the apostles?)?)?)?|the act(?: of the apostles?|s of the apostles?))[\s0-9:.;,\-]*$/i, /^r(?:m|o(?:m(?:ans?|e)?)?)[\s0-9:.;,\-]*$/i, /^(?:1(?: co(?:r(?:inthi(?:ans?|ons?))?)?|co(?:r(?:inthi(?:ans?|ons?))?)?|st co(?:r(?:inthi(?:ans?|ons?))?)?)|first co(?:r(?:inthi(?:ans?|ons?))?)?|i co(?:r(?:inthi(?:ans?|ons?))?)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: co(?:r(?:inthi(?:ans?|ons?))?)?|co(?:r(?:inthi(?:ans?|ons?))?)?|nd co(?:r(?:inthi(?:ans?|ons?))?)?)|ii co(?:r(?:inthi(?:ans?|ons?))?)?|second co(?:r(?:inthi(?:ans?|ons?))?)?)[\s0-9:.;,\-]*$/i, /^ga(?:l(?:a(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?[\s0-9:.;,\-]*$/i, /^e(?:f(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?|p(?:h(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?)[\s0-9:.;,\-]*$/i, /^ph(?:i(?:l(?:i(?:p(?:i(?:ans?|ons?)|pi(?:ans?|ons?)))?)?)?|p)?[\s0-9:.;,\-]*$/i, /^col(?:a(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?))|o(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?)))?[\s0-9:.;,\-]*$/i, /^(?:1(?: th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|st th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)|first th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|nd th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)|ii th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|second th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)[\s0-9:.;,\-]*$/i, /^(?:1(?: t(?:i(?:m(?:othy)?)?|m)|st t(?:i(?:m(?:othy)?)?|m)|t(?:i(?:m(?:othy)?)?|m))|first t(?:i(?:m(?:othy)?)?|m)|i t(?:i(?:m(?:othy)?)?|m)|t(?:i(?:m(?:othy)?)?|m))[\s0-9:.;,\-]*$/i, /^(?:2(?: t(?:i(?:m(?:othy)?)?|m)|nd t(?:i(?:m(?:othy)?)?|m)|t(?:i(?:m(?:othy)?)?|m))|ii t(?:i(?:m(?:othy)?)?|m)|second t(?:i(?:m(?:othy)?)?|m))[\s0-9:.;,\-]*$/i, /^t(?:it(?:us?)?|t)[\s0-9:.;,\-]*$/i, /^ph(?:ile(?:m(?:on)?)?|lm|m)[\s0-9:.;,\-]*$/i, /^h(?:br?|eb(?:r(?:ews?)?)?)[\s0-9:.;,\-]*$/i, /^ja(?:m(?:es?)?|s)?[\s0-9:.;,\-]*$/i, /^(?:1(?: p(?:e(?:t(?:er?)?)?|t)|p(?:e(?:t(?:er?)?)?|t)|st p(?:e(?:t(?:er?)?)?|t))|first p(?:e(?:t(?:er?)?)?|t)|i p(?:e(?:t(?:er?)?)?|t)|peter?)[\s0-9:.;,\-]*$/i, /^(?:2(?: p(?:e(?:t(?:er?)?)?|t)|nd p(?:e(?:t(?:er?)?)?|t)|p(?:e(?:t(?:er?)?)?|t))|ii p(?:e(?:t(?:er?)?)?|t)|second p(?:e(?:t(?:er?)?)?|t))[\s0-9:.;,\-]*$/i, /^(?:1(?: j(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|st j(?:n|o(?:hn)?))|first j(?:n|o(?:hn)?)|i j(?:n|o(?:hn)?))[\s0-9:.;,\-]*$/i, /^(?:2(?: j(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|nd j(?:n|o(?:hn)?))|ii j(?:n|o(?:hn)?)|second j(?:n|o(?:hn)?))[\s0-9:.;,\-]*$/i, /^(?:3(?: j(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|rd j(?:n|o(?:hn)?))|iii j(?:n|o(?:hn)?)|third j(?:n|o(?:hn)?))[\s0-9:.;,\-]*$/i, /^ju(?:de?)?[\s0-9:.;,\-]*$/i, /^(?:ap(?:a(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)|o(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?))|r(?:ev(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?|v))[\s0-9:.;,\-]*$/i],

        /// Stemming variables
        step2list = {ational: "ate", tional: "tion", enci: "ence", anci: "ance", izer: "ize", bli: "ble", alli: "al", entli: "ent", eli: "e", ousli: "ous", ization: "ize", ation: "ate", ator: "ate", alism: "al", iveness: "ive", fulness: "ful", ousness: "ous", aliti: "al", iviti: "ive", biliti: "ble", logi: "log"},
        step3list = {icate: "ic", ative: "", alize: "al", iciti: "ic", ical: "ic", ful: "", ness: "", self: ""},

        ///TODO: Determine if there is a faster way to do this.  E.g., using a in_array() or isset() function.
        /// Words to ignore that are already the root word but don't look like it.
        stop_words_re = /^th[iu]s|h[ai]s|was|yes|succeed|proceed|e(?:arly|xceed)|only|news$/i;
    
    
    /// Return the language variables and functions.
    return {
        /// Book names
        books_long_main:      ["", "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "Samuel", "Samuel", "The Kings", "The Kings", "Chronicles", "Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Songs", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "The Acts", "Romans", "Corinthians", "Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "Thessalonians", "Thessalonians", "Timothy", "Timothy", "Titus", "Philemon", "Hebrews", "James", "Peter", "Peter", "John", "John", "John", "Jude", "The Revelation"],
        books_long_posttitle: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "of Jeremiah", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "of the Apostles", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "of Jesus Christ"],
        books_long_pretitle:  ["", "The First Book of Moses, called", "The Second Book of Moses, called", "The Third Book of Moses, called", "The Fourth Book of Moses, called", "The Fifth Book of Moses, called", "The Book of", "The Book of", "The Book of", "The First book of", "The Second book of", "The First book of", "The Second book of", "The First book of", "The Second book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Song of", "The Book of", "The Book of", "The Book of the", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Gospel According to", "The Gospel According to", "The Gospel According to", "The Gospel According to", "", "The Epistle of Paul to the", "The First Epistle of Paul to the", "The Second Epistle of Paul to the", "The Epistle of Paul to the", "The Epistle of Paul to the", "The Epistle of Paul to the", "The Epistle of Paul to the", "The First Epistle of Paul to the", "The Second Epistle of Paul to the", "The First Epistle of Paul to", "The Second Epistle of Paul to", "The Epistle of Paul to", "The Epistle of Paul to", "The Epistle of Paul to the", "The Epistle of", "The First Epistle of", "The Second Epistle of", "The First Epistle of", "The Second Epistle of", "The Third Epistle of", "The Epistle of", ""],
        books_short:          ["", "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
        
        ///TODO: Determine if texts should be categorized.
        /// Miscellaneous Text
        about:             "About",                                               /// Context menu item
        app_name:          "BibleForge",                                          /// The name of the application
        blog:              "Blog",                                                /// Context menu item
        chapter:           "Chapter",                                             /// Chapter headings
        configure:         "Configure",                                           /// Context menu item
        done:              "Done",                                                /// The button that closes panels
        found_plural:      " verses found for ",                                  /// On the info bar when searching (multiple results)
        found_singular:    " verse found for ",                                   /// On the info bar when searching (one result)
        help:              "Help",                                                /// Context menu item
        paragraphs:        "Paragraphs",                                          /// In the View configuration panel
        psalm:             "Psalm",                                               /// The title of chapters in the book of Psalms
        query_explanation: 'Keyword or Reference: "God so loved" or Romans 3:23', /// In a blank query input box before a search has been preformed
        red_letters:       "Red Letters",                                         /// In the View configuration panel
        title:             "title",                                               /// Used instead of "0" for Psalm title verse references
        view:              "View",                                                /// The title of a configuration panel
        ///TODO: Determine if the app_name should be dynamically appended to the string below or if it should be done in the build system
        wrench_title:      "Customize and Configure BibleForge",                  /// The text displayed when hovering over the wrench menu
        
        /// Grammatical Variables
        /// Grammatical search format:  WORD grammar_marker ATTRIBUTE_1 grammar_separator ATTRIBUTE_2 grammar_separator ... ATTRIBUTE_N
        /// Grammatical search example: love AS VERB, THIRD_PERSON
        /// The keyword that indicates a grammatical search.
        ///NOTE: Created in the Forge via grammar_constants_parser.php on 04-05-2010 from Grammar Constants.txt.
        grammar_keywords:   {IMPLIED: "[1,1]", DIVINE: "[2,1]", RED: "[3,1]", NOUN: "[4,1]", VERB: "[4,2]", ADJECTIVE: "[4,3]", ADVERB: "[4,4]", PRONOUN: "[4,5]", DEFINITE_ARTICLE: "[4,6]", CONJUNCTION: "[4,7]", CONDITIONAL: "[4,8]", PARTICLE: "[4,9]", PREPOSITION: "[4,10]", INJECTIVE: "[4,11]", HEBREW: "[4,12]", ARAMAIC: "[4,13]", SINGULAR: "[5,1]", PLURAL: "[5,2]", FIRST_PERSON: "[6,1]", SECOND_PERSON: "[6,2]", THIRD_PERSON: "[6,3]", PRESENT: "[7,1]", IMPERFECT: "[7,2]", FUTURE: "[7,3]", AORIST: "[7,4]", PERFECT: "[7,5]", PLUPERFECT: "[7,6]", NO_TENSE_STATED: "[7,99]", ACTIVE: "[8,1]", MIDDLE: "[8,2]", PASSIVE: "[8,3]", MIDDLE_DEPONENT: "[8,4]", PASSIVE_DEPONENT: "[8,5]", IMPERSONAL_ACTIVE: "[8,6]", AMBIGUOUS_MIDDLE_PASSIVE: "[8,77]", AMBIGUOUS_MIDDLE_PASSIVE_DEPONENT: "[8,88]", NO_VOICE_STATED: "[8,99]", INDICATIVE: "[9,1]", SUBJUNCTIVE: "[9,2]", IMPERATIVE: "[9,3]", INFINITIVE: "[9,4]", OPTATIVE: "[9,5]", PARTICIPLE: "[9,6]", IMPERATIVE_SENSE_PARTICIPLE: "[9,7]", MASCULINE: "[10,1]", FEMININE: "[10,2]", NEUTER: "[10,3]", NOMINATIVE: "[11,1]", GENITIVE: "[11,2]", ACCUSATIVE: "[11,3]", DATIVE: "[11,4]", VOCATIVE: "[11,5]", PERSONAL_PRONOUN: "[12,1]", RELATIVE_PRONOUN: "[12,2]", RECIPROCAL_PRONOUN: "[12,3]", DEMONSTRATIVE_PRONOUN: "[12,4]", CORRELATIVE_PRONOUN: "[12,5]", INTERROGATIVE_PRONOUN: "[12,6]", INDEFINITE_PRONOUN: "[12,7]", REFLEXIVE_PRONOUN: "[12,8]", POSESSIVE_PRONOUN: "[12,9]", AMBIGUOUS_CORRELATIVE_INTERROGATIVE_PRONOUN: "[12,10]", COMPARATIVE: "[13,1]", SUPERLATIVE: "[13,2]", INDECLINABLE: "[14,1]", NUMERICAL: "[15,1]", NORMAL_NOUN: "[16,1]", PROPER_NOUN: "[16,2]", LETTER: "[16,3]", OTHER: "[16,4]", ABBREVIATED: "[17,1]", CONTRACTED: "[17,2]", APOCOPATED: "[17,3]", IRREGULAR: "[17,4]", ATTIC: "[18,1]", AEOLIC: "[18,2]", TRANSITIVE: "[19,1]", FIRST_FORM: "[20,1]", SECOND_FORM: "[20,2]", INTERROGATIVE: "[21,1]", NEGATIVE: "[21,2]", PARTICLE_ATTACHED: "[21,3]", MIDDLE_SIGNIFICANCE: "[21,4]"},
        grammar_marker:     " AS ",
        grammar_marker_len: 4,   /// The length of grammar_marker.
        grammar_separator:  ",", /// The punctuation that separates two attributes.
        
        /**
         * Convert an English word to its root form.
         *
         * Based on the Porter stemmer in Javascript.
         * Improved for BibleForge.
         *
         * @example	root_word = stem_word("loving"); /// Returns "lov[ei]"
         * @param	w (string) Word to stem.
         * @return	Root word string.
         * @note	Called by prepare_highlighter() in js/main.js.
         * @link	http://snowball.tartarus.org/algorithms/english/stemmer.html
         * @link	http://www.tartarus.org/~martin/PorterStemmer
         * @todo    Document stem_word() better: give examples and reasonings for each regular expression, etc.
         * @todo    Review stem_word() for optimizations: avoid regex when possible.
         */
        stem_word: function (w)
        {
            var fp,
                last_letter,
                re,
                re2,
                re3,
                re4,
                stem,
                suffix;
            
            /// Some quick checking to see if we even need to continue.
            if (w.length < 3) {
                return w;
            }
            
            if (stop_words_re.test(w)) {
                return w;
            }
            
            /// Step 1a
            re  = /^(.+?)(ss|i)es$/;
            re2 = /^(.+?)([^s])s$/;
            
            if (re.test(w)) {
                w = w.replace(re,  "$1$2");
            } else if (re2.test(w)) {
                w = w.replace(re2, "$1$2");
            }
            
            /// Step 1b
            /// "Present-day" English: re = /^(.+?)eed$/;
            re  = /^(.+?)ee$/; /// Early Modern English fix
            /// "Present-day" English: re2 = /^(.+?)(ingly|edly|ed|ing|ly)$/;
            re2 = /^(.+?)(ing(?:ly)?|ed(?:ly)?|ly|e(?:st|th))$/; /// Early Modern English fix
            
            if (re.test(w)) {
                fp = re.exec(w);
                if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(fp[1])) {
                    w.slice(0, -1);
                }
            } else if (re2.test(w)) {
                fp   = re2.exec(w);
                stem = fp[1];
                if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy]/.test(stem)) {
                    w   = stem;
                    re2 = /(?:at|bl|iz)$/;
                    re3 = /([^aeiouylsz])\1$/; /// Look for repeating characters.
                    re4 = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/;
                    if (re2.test(w)) {
                        /// TODO: Determine why if (re2.test(w)) and else if (re4.test(w)) should not be merged to the same line since they have the same code followoing.
                        w += "e";
                    } else if (re3.test(w)) {
                        w = w.slice(0, -1);
                    } else if (re4.test(w)) {
                        w += "e";
                    }
                }
            }
            
            /// Step 1c
            re = /^(.+?)y$/;
            if (re.test(w)) {
                fp   = re.exec(w);
                stem = fp[1];
                if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy]/.test(stem)) {
                    w = stem + "i";
                }
            }
            
            /// Step 2
            re = /^(.+?)(a(?:t(?:ion(?:al)?|or)|nci|l(?:li|i(?:sm|ti)))|tional|e(?:n(?:ci|til)|li)|i(?:z(?:er|ation)|v(?:eness|iti))|b(?:li|iliti)|ous(?:li|ness)|fulness|logi)$/;
            if (re.test(w)) {
                fp     = re.exec(w);
                stem   = fp[1];
                suffix = fp[2];
                if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stem)) {
                    w = stem + step2list[suffix];
                }
            }
            
            /// Step 3
            re = /^(.+?)(ic(?:a(?:te|l)|iti)|a(?:tive|lize)|ful|ness|self)$/;
            if (re.test(w)) {
                fp     = re.exec(w);
                stem   = fp[1];
                suffix = fp[2];
                if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stem)) {
                    w = stem + step3list[suffix];
                }
            }
            
            /// Step 4
            re  = /^(.+?)(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|sm|ti|ve|ze)|ment|ous?)$/;
            re2 = /^(.+?)([st])ion$/;
            
            if (re.test(w)) {
                fp   = re.exec(w);
                stem = fp[1];
                if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stem)) {
                    w = stem;
                }
            } else if (re2.test(w)) {
                fp   = re2.exec(w);
                stem = fp[1] + fp[2];
                if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stem)) {
                    w = stem;
                }
            }
            
            /// Step 5
            re = /^(.+?)e$/;
            if (re.test(w)) {
                fp   = re.exec(w);
                stem = fp[1];
                re   = /^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
                re2  = /^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*(?:[aeiouy][aeiou]*)?$/;
                re3  = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/;
                
                if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                    w = stem;
                }
            }
            
            if (/ll$/.test(w) && (/^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(w))) {
                w = w.slice(0, -1);
            }
            
            last_letter = w.slice(-1);
            
            if (last_letter == "y" || last_letter == "i") {
                w = w.slice(0, w.length - 1) + "[yi]";
            } else if (last_letter == "e") {
                w = w.slice(0, w.length - 1) + "[ei]";
            }
            
            return w;
        },


        /**
         * Determines the id of a verse from a reference.
         *
         * Determines if a verse is a reference and then calculates the verse id.
         * It supports various abbreviated forms as well as misspellings.
         * Only a book is required or checked for validity.
         * The verse id format is [B]BCCCVVV (e.g., Genesis 1:1 == 1001001).
         *
         * @example	verse_id = determine_reference("Gen");						/// Returns "10001001"
         * @example	verse_id = determine_reference("first thesalonions 3:10");	/// Returns "52003010" (note the misspelling).
         * @example	verse_id = determine_reference("Habakkuk 99:1");			/// Returns "35099001" (note the invalid chapter reference).
         * @example	verse_id = determine_reference("love");						/// Returns FALSE
         * @param	ref (string) The text that may or may not be a valid verse reference.
         * @return	The verse id of a reference or FALSE if invalid.
         * @note	Called by run_search() in js/main.js.
         * @note	Requires books_re and book_arr_re global regex variables.
         */
        determine_reference: function (ref)
        {
            var book = 0,
                chapter,
                cv,
                verse,
                zeros;
            
            /// First determine if it is likely a verse reference.
            if (!books_re.test(ref)) {
                return false;
            }
            
            switch (ref.slice(0, 1).toLowerCase()) {
            case "j":
                if (book_arr_re[43].test(ref)) {		/// John
                    book = "43";
                    break;
                } else if (book_arr_re[32].test(ref)) {	/// Jonah
                    book = "32";
                    break;
                } else if (book_arr_re[59].test(ref)) {	/// James
                    book = "59";
                    break;
                } else if (book_arr_re[6].test(ref)) {	/// Joshua
                    book = "6";
                    break;
                } else if (book_arr_re[7].test(ref)) {	/// Judges
                    book = "7";
                    break;
                } else if (book_arr_re[18].test(ref)) {	/// Job
                    book = "18";
                    break;
                } else if (book_arr_re[65].test(ref)) {	/// Jude
                    book = "65";
                    break;
                } else if (book_arr_re[24].test(ref)) {	/// Jeremiah
                    book = "24";
                    break;
                } else if (book_arr_re[29].test(ref)) {	/// Joel
                    book = "29";
                    break;
                }
                break;
            case "r":
                if (book_arr_re[45].test(ref)) {		/// Romans
                    book = "45";
                    break;
                } else if (book_arr_re[66].test(ref)) {	/// Revelation
                    book = "66";
                    break;
                } else if (book_arr_re[8].test(ref)) {	/// Ruth
                    book = "8";
                    break;
                }
                break;
            case "g":
                if (book_arr_re[1].test(ref)) {			/// Genesis
                    book = "1";
                    break;
                } else if (book_arr_re[48].test(ref)) {	/// Galatians
                    book = "48";
                    break;
                }
                break;
            case "e":
                if (book_arr_re[2].test(ref)) {			/// Exodus
                    book = "2";
                    break;
                } else if (book_arr_re[49].test(ref)) {	/// Ephesians
                    book = "49";
                    break;
                } else if (book_arr_re[26].test(ref)) {	/// Ezekiel
                    book = "26";
                    break;
                } else if (book_arr_re[21].test(ref)) {	/// Ecclesiastes
                    book = "21";
                    break;
                } else if (book_arr_re[17].test(ref)) {	/// Esther
                    book = "17";
                    break;
                } else if (book_arr_re[15].test(ref)) {	/// Ezra
                    book = "15";
                    break;
                }
                break;
            case "m":
                if (book_arr_re[40].test(ref)) {		/// Matthew
                    book = "40";
                    break;
                } else if (book_arr_re[41].test(ref)) {	/// Mark
                    book = "41";
                    break;
                } else if (book_arr_re[39].test(ref)) {	/// Malachi
                    book = "39";
                    break;
                } else if (book_arr_re[33].test(ref)) {	/// Micah
                    book = "33";
                    break;
                }
                break;
            case "l":
                if (book_arr_re[42].test(ref)) {		/// Luke
                    book = "42";
                    break;
                } else if (book_arr_re[3].test(ref)) {	/// Leviticus
                    book = "3";
                    break;
                } else if (book_arr_re[25].test(ref)) {	/// Lamentations
                    book = "25";
                    break;
                }
                break;
            case "p":
                if (book_arr_re[19].test(ref)) {		/// Psalms
                    book = "19";
                    break;
                } else if (book_arr_re[20].test(ref)) {	/// Proverbs
                    book = "20";
                    break;
                } else if (book_arr_re[50].test(ref)) {	/// Philippians
                    book = "50";
                    break;
                } else if (book_arr_re[57].test(ref)) {	/// Philemon
                    book = "57";
                    break;
                } else if (book_arr_re[60].test(ref)) {	/// 1 Peter (Peter)
                    book = "60";
                    break;
                }
                break;
            case "d":
                if (book_arr_re[5].test(ref)) {			/// Deuteronomy
                    book = "5";
                    break;
                } else if (book_arr_re[27].test(ref)) {	/// Daniel
                    book = "27";
                    break;
                }
                break;
            case "i":
                if (book_arr_re[23].test(ref)) {		/// Isaiah
                    book = "23";
                    break;
                }
                ///NOTE: Don't break so that references like "I Kings" will be checked.
            case "1":
            case "f":
                if (book_arr_re[46].test(ref)) {		/// 1 Corinthians | First Corinthians| I Corinthians
                    book = "46";
                    break;
                } else if (book_arr_re[62].test(ref)) {	/// 1 John | First John | I John
                    book = "62";
                    break;
                } else if (book_arr_re[54].test(ref)) {	/// 1 Timothy | First Timothy | I Timothy
                    book = "54";
                    break;
                } else if (book_arr_re[52].test(ref)) {	/// 1 Thessalonians | First Thessalonians | I Thessalonians
                    book = "52";
                    break;
                } else if (book_arr_re[60].test(ref)) {	/// 1 Peter | First Peter | I Peter
                    book = "60";
                    break;
                } else if (book_arr_re[9].test(ref)) {	/// 1 Samuel | First Samuel | I Samuel
                    book = "9";
                    break;
                } else if (book_arr_re[11].test(ref)) {	/// 1 Kings | First Kings | I Kings
                    book = "11";
                    break;
                } else if (book_arr_re[13].test(ref)) {	/// 1 Chronicles | First Chronicles | I Chronicles
                    book = "13";
                    break;
                }
                ///NOTE: Don't break so that references like "II Kings" will be checked.
            case "2":
            case "s":
                if (book_arr_re[47].test(ref)) {		/// 2 Corinthians | Second Corinthians| II Corinthians
                    book = "47";
                    break;
                } else if (book_arr_re[63].test(ref)) {	/// 2 John | Second John | II John
                    book = "63";
                    break;
                } else if (book_arr_re[55].test(ref)) {	/// 2 Timothy | Second Timothy | II Timothy
                    book = "55";
                    break;
                } else if (book_arr_re[53].test(ref)) {	/// 2 Thessalonians | Second Thessalonians | II Thessalonians
                    book = "53";
                    break;
                } else if (book_arr_re[61].test(ref)) {	/// 2 Peter | Second Peter | II Peter
                    book = "61";
                    break;
                } else if (book_arr_re[22].test(ref)) {	/// Song of Songs
                    book = "22";
                    break;
                } else if (book_arr_re[10].test(ref)) {	/// 2 Samuel | Second Samuel | II Samuel
                    book = "10";
                    break;
                } else if (book_arr_re[12].test(ref)) {	/// 2 Kings | Second Kings | II Kings
                    book = "12";
                    break;
                } else if (book_arr_re[14].test(ref)) {	/// 2 Chronicles | Second Chronicles | II Chronicles
                    book = "14";
                    break;
                } else if (book_arr_re[9].test(ref)) {	/// 1 Samuel (Samuel)
                    book = "9";
                    break;
                } else if (book_arr_re[19].test(ref)) {	/// Psalms (Salms)
                    book = "19";
                    break;
                }
                ///NOTE: Don't break so that references like "III John" will be checked.
            case "3":
            case "t":
                if (book_arr_re[64].test(ref)) {		/// 3 John | Third John | III John
                    book = "64";
                    break;
                } else if (book_arr_re[56].test(ref)) {	/// Titus
                    book = "56";
                    break;
                } else if (book_arr_re[54].test(ref)) {	/// 1 Timothy (Timothy)
                    book = "54";
                    break;
                } else if (book_arr_re[52].test(ref)) {	/// 1 Thessalonians (Thessalonians)
                    book = "52";
                    break;
                } else if (book_arr_re[44].test(ref)) {	/// The Acts of the Apostles
                    book = "44";
                    break;
                } else if (book_arr_re[22].test(ref)) {	/// The Song of Songs
                    book = "22";
                    break;
                }
                break;
            case "a":
                if (book_arr_re[44].test(ref)) {		/// Acts
                    book = "44";
                    break;
                } else if (book_arr_re[30].test(ref)) {	/// Amos
                    book = "30";
                    break;
                } else if (book_arr_re[66].test(ref)) {	/// Revelation (Apocalypse)
                    book = "66";
                    break;
                }
                break;
            case "c":
                if (book_arr_re[51].test(ref)) {		/// Colossians
                    book = "51";
                    break;
                } else if (book_arr_re[46].test(ref)) {	/// 1 Corinthians (Corinthians)
                    book = "46";
                    break;
                } else if (book_arr_re[22].test(ref)) {	/// Song of Songs (Canticles)
                    book = "22";
                    break;
                } else if (book_arr_re[13].test(ref)) {	/// 1 Chronicles (Chronicles)
                    book = "13";
                    break;
                }
                break;
            case "h":
                if (book_arr_re[58].test(ref)) {		/// Hebrews
                    book = "58";
                    break;
                } else if (book_arr_re[28].test(ref)) {	/// Hosea
                    book = "28";
                    break;
                } else if (book_arr_re[35].test(ref)) {	/// Habakkuk
                    book = "35";
                    break;
                } else if (book_arr_re[37].test(ref)) {	/// Haggai
                    book = "37";
                    break;
                }
                break;
            case "n":
                if (book_arr_re[4].test(ref)) {			/// Numbers
                    book = "4";
                    break;
                } else if (book_arr_re[16].test(ref)) {	/// Nehemiah
                    book = "16";
                    break;
                } else if (book_arr_re[34].test(ref)) {	/// Nahum
                    book = "34";
                    break;
                }
                break;
            case "z":
                if (book_arr_re[38].test(ref)) {		/// Zechariah
                    book = "38";
                    break;
                } else if (book_arr_re[36].test(ref)) {	/// Zephaniah
                    book = "36";
                    break;
                }
                break;
            case "k":
                if (book_arr_re[11].test(ref)) {		/// 1 Kings (Kings)
                    book = "11";
                    break;
                }
                break;
            case "o":
                if (book_arr_re[31].test(ref)) {		/// Obadiah
                    book = "31";
                    break;
                }
                break;
            }
            
            if (book === 0) {
                return false;
            }
            
            chapter	= "001";
            verse	= "001";
            
            /// Finally, we need to determine the chapter and/or verse reference is they are supplied.
            cv = ref.split(/\s*([0-9]{1,3})(?:[:.;,\s]([0-9]{0,3})[\-0-9]*)?$/);
            
            if (cv.length > 1) {
                if (cv[1] != "") {
                    chapter = cv[1] + "";
                }
                if (cv[2] != "" && typeof cv[2] != "undefined") {
                    verse = cv[2] + "";
                } else {
                    /// For books with only 1 chapter, the chapter reference is optional (i.e., Jude 4 == Jude 1:4).
                    switch (book) {
                    case "31":
                    case "57":
                    case "63":
                    case "64":
                    case "65":
                        verse   = chapter;
                        chapter = "001";
                    }
                }
                zeros   = ["", "00", "0", ""];
                chapter = zeros[chapter.length] + chapter;
                verse   = zeros[verse.length]   + verse;
            }
            
            return book + chapter + verse;
        },

        ///TODO: Determine if these functions (prepare_search() and filter_terms_for_highlighter())could be moved out of the language Dependant file and just use some language dependent variables.

        /**
         * Prepares search terms to adhere to Sphinx syntax before submission to the server.
         *
         * Removes excess whitespace, converts special words to symbols, and converts certain characters to a format adhere to Sphinx syntax.
         *
         * @example	search_terms = prepare_search("NOT in  the  AND good OR  beginning  ");	/// Returns "-in the & good | beginning"
         * @example	search_terms = prepare_search("ps 16:title");							/// Returns "ps 16:0"
         * @example	search_terms = prepare_search("“God is good”");							/// Returns '"God is good"' (Note the curly quotes.)
         * @param	search_terms (string) The terms to be examined.
         * @return	A prepared string with leading and trailing white space removed.
         * @note	Called by run_search() in js/main.js.
         * @note	Replaces AND, OR, and NOT with &, |, and - respectively.
         * @note	Replaces curly quotes with straight.
         * @note	Replaces various hyphens, dashes, and minuses with the standard hyphen (-).
         */
        prepare_search: function (search_terms)
        {
            ///NOTE: /\s{2,}/g gets rid of double spaces within the words (e.g., "here    there" becomes "here there").
            ///NOTE: /\s+-\s+/g ensures that filter_array() will filter out negative words like "this - that" (i.e., "that" does not need to be highlighted).
            ///NOTE: \u2011-\u2015 replaces various hyphens, dashes, and minuses with the standard hyphen (-).
            ///NOTE: replace(/([0-9]+)[:.;,\s]title/ig, "$1:0") replaces Psalm title references into an acceptable format (e.g., "Psalm 3:title" becomes "Psalm 3:0").
            return search_terms.replace(" IN RED", " AS RED").replace(/\s{2,}/g, " ").replace(/\sAND\s/g, " & ").replace(/\sOR\s/g, " | ").replace(/(?:\s-|\s*\bNOT)\s/g, " -").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[\u2011-\u2015]/g, "-").replace(/([0-9]+)[:.;,\s]title/ig, "$1:0").trim();
        },


        /**
         * Prepare the search terms for the highlighter.
         *
         * Removes punctuation, words which should not be found in the search results, duplicate words, and converts all words to lower case
         * so that the highlighter can parse the words properly.
         *
         * @example	filter_terms_for_highlighter('this one, -that one -"none of these" -"or these ones"~1 "but, these?"'); /// Returns ["this", "one", "but", "these"].
         * @param	search_terms (string) The terms to be filtered.
         * @return	An array of filtered words.
         * @note	Called by prepare_highlighter().
         */
        filter_terms_for_highlighter: function (search_terms)
        {
            var arr_len,
                final_search_arr	= [],
                i,
                initial_search_arr,
                j,
                new_arr_len			= 0;
            
            /// Remove punctuation and break up the query string into individual parts to filter out duplicates.
            ///NOTE: (?:^|\s) makes sure not to filter out hyphenated words.
            ///NOTE: (?:"[^"]*"?|[^\s]*) matches a single word or phrase starting with a double quote (").
            ///NOTE: [~\/]\d* removes characters used for Sphinx query syntax.  I.e., proximity searches ("this that"~10) and quorum matching ("at least three of these"/3).
            ///NOTE: -\B removes trailing hyphens.  (This might be unnecessary.)
            initial_search_arr = search_terms.replace(/(?:(?:^|\s)-(?:"[^"]*"?|[^\s]*)|[~\/]\d*|["',.:?!;&|\)\(\]\[\/\\`{}<$\^+]|-\B)/g, "").toLowerCase().split(" ");
            arr_len = initial_search_arr.length;
            
            first_loop:
            for (i = 0; i < arr_len; ++i) {
                for (j = 0; j < new_arr_len; ++j) {
                    if (final_search_arr[j] == initial_search_arr[i]) {
                        continue first_loop; /// This words already exists; jump to the first loop and get the next word.  (This would be the same as "continue 2" in PHP.)
                    }
                }
                final_search_arr[new_arr_len++] = initial_search_arr[i];
            }
            
            return final_search_arr;
        }
    };
}());
