/**
 * BibleForge (alpha testing)
 *
 * @date    10-30-08
 * @version 0.1 alpha 2
 * @link http://www.BibleForge.com
 */

/*****************************
 * Declare global constants. *
 *****************************/
 
///NOTE: Should be "const" instead of "var," but IE doesn't support constants yet.
var SEARCH = 1, VERSE_LOOKUP = 2, ADDITIONAL = 1, PREVIOUS = 2;

/*****************************
 * Declare global variables. *
 *****************************/

/// Common DOM/BOM Objects
var doc = document, win = window, doc_docEl = doc.documentElement;

/// DOM Objects
var q_obj   = doc.getElementById("q"); /// The search input box object
var page    = doc.getElementById("page"); /// The results div
var infoBar = doc.getElementById("infoBar");
var topLoader    = doc.getElementById("topLoader");
var bottomLoader = doc.getElementById("bottomLoader");

var highlight_re = []; /// Highlighter regex array
var last_search  = "", last_search_encoded = ""; /// A cache of the last search query
var last_type; /// The type of lookup performed last (SEARCH || VERSE_LOOKUP)
var waiting_for_first_search = false;
var last_book = 0; /// The number of the last book of the Bible that was returned
var highlight_limit = 20; /// Currently, we limit the unique number of search words to highlight.

///NOTE: window.XMLHttpRequest for Mozilla/KHTML/Opera/IE7+
/// ActiveXObject("Microsoft.XMLHTTP") for IE6-
var ajax_addtional = win.XMLHttpRequest ? new win.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
var ajax_previous  = win.XMLHttpRequest ? new win.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

/// Verse variables
var top_verse, bottom_verse;

/// Scrolling variables
var scroll_pos = 0, scroll_check_count = 0;
var checking_excess_content_top = false, checking_excess_content_bottom = false;
var remove_content_top_interval, remove_content_bottom_interval;
var buffer_add = 1000, buffer_rem = 10000;
var cached_verses_top = [], cached_count_top = 0;
var cached_verses_bottom = [], cached_count_bottom = 0;
var scroll_maxed_top = true, scroll_maxed_bottom = false;
var lookup_speed_scrolling = 50, lookup_speed_sitting = 100, lookup_delay = 200, remove_speed = 3000, look_up_range_speed = 300; /// In miliseconds
var looking_up_verse_range = false;

/// Simple Event Registration
///NOTE: Could use wheel if the scroll bars are invisible.
win.onscroll = scrolling;
win.onresize = resizing;

/// Prototypes
///NOTE: Add trim() for older browsers.
if (!"".trim) {
	/**
	 * Removes leading and trailing spaces.
	 *
	 * @example trimmed = trim("  God is &  good  "); /// Returns "God is &  good"
	 * @param str (string) The string to trim.
	 * @return A String with leading and trailing spaces removed.
	 * @note This does not remove unusual white spaces.  It actually removes everything under character code 33.
	 */
	String.prototype.trim = function()
	{
		var start = -1, end = this.length;
		while (this.charCodeAt(--end) < 33);
		while (++start < end && this.charCodeAt(start) < 33);
		return this.slice(start, end + 1);
	};
}


/*****************************
 * Start of search functions *
 *****************************/

/**
 * Prepare for a the search.
 *
 * Prepares the search query from the input box.
 *
 * @example prepare_new_search();
 * @return FALSE to prevent the form from submitting.
 * @note Called when clicking the submit button on the search bar in index.php.
 */
function prepare_new_search()
{
	var raw_search_terms = q_obj.value, verse_id, last_search_prepared;
	
	waiting_for_first_search = true;
	
	last_search_prepared = prepare_search(raw_search_terms);
	
	if (last_search_prepared.length == 0) return false;
	
	/// Stop any old requests since we have a new one.
	/// Is readyState > 0 and < 4?  Anything 1-3 needs to be aborted.
	if (ajax_addtional.readyState % 4) ajax_addtional.abort();
	if (ajax_previous.readyState % 4) ajax_previous.abort();
	
	/// Determine if the user is preforming a search or looking up a verse.
	verse_id = determine_reference(last_search_prepared);
	if (verse_id !== false) {
		/// To get the titles of Psalms, select verse 0 instead of verse 1.
		if (verse_id < 19145002 && verse_id > 19003000 && verse_id % 1000 == 1) --verse_id;
		
		last_type = VERSE_LOOKUP;
		bottom_verse = verse_id - 1; /// NOTE: Subtract 1 because run_search() adds one.
	} else {
		last_type = SEARCH;
		last_search_encoded = encodeURIComponent(last_search_prepared);
		bottom_verse = 0;
	}
	
	run_search(ADDITIONAL);
	
	/// Prepare for the new results.
	if (last_type == VERSE_LOOKUP) {
		scroll_maxed_top = false;
		scroll_maxed_bottom = false;
	} else {
		scroll_maxed_top = true;
		scroll_maxed_bottom = false;
		/// We immediately prepare the highlighter so that when the results are returned via AJAX
		/// the highlighter array will be ready to go.
		if (raw_search_terms != last_search) { /// Already have the regex array?
			prepare_highlighter(last_search_prepared);
			last_search = raw_search_terms;
		}
	}
	
	clean_up_page();
	last_book = 0;
	
	/// Clear cache.
	cached_verses_top = [];
	cached_count_top  = 0;
	cached_verses_bottom = [];
	cached_count_bottom  = 0;
	
	doc.title = raw_search_terms + " - " + lang.page_title;
	return false;
}


/**
 * Submits a query via AJAX.
 *
 * @example run_search(ADDITIONAL); /// Will add verses to the bottom.
 * @example run_search(PREVIOUS); /// Will add verses to the top.
 * @param direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @return NULL.  Query is sent via AJAX.
 * @note Called by prepare_new_search() when the user submits a search.
 * @note Called by add_content_bottom() and add_content_top() when scrolling.
 * @note Assumes that global variables last_type and bottom_verse and/or top_verse are set.
 */
function run_search(direction)
{
	/// last_type set in prepare_new_search().
	var query = "t=" + last_type, ajax;
	if (direction == ADDITIONAL) {
		ajax = ajax_addtional;
	} else {
		ajax = ajax_previous;
		query += "&d=" + direction;
	}
	
	/// Is the server is already working on the request?
	///NOTE: readyState is between 0-4, and anything 1-3 means that the server is already working on the request.
	if (ajax.readyState % 4) return null;
	
	if (last_type == VERSE_LOOKUP) {
		if (direction == ADDITIONAL) {
			query += "&q=" + (bottom_verse + 1);
		} else {
			query += "&q=" + (top_verse - 1);
		}
	} else {
		query += "&q=" + last_search_encoded;
		if (direction == ADDITIONAL) {
			if (bottom_verse > 0) query += "&s=" + (bottom_verse + 1); /// Continue starting on the next verse.
		} else {
			query += "&s=" + (top_verse + -1); /// Continue starting on the next verse.
		}
	}
	
	post_to_server("searcher.php", query, ajax);
}


/**
 * Handles new verses from the server.
 *
 * Writes new verses to the page, determines if more content is needed or available,
 * and writes initial information to the info bar.
 *
 * @example prepare_verses(json_array);
 * @example prepare_verses([[1,1],[1001001],["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning...</b>"],[1]]);
 * @param res (array) JSON array from server.  Array format: [[action,direction],[verse_ids,...],[verse_HTML,...],[number_of_matches]].
 * @return NULL.  Writes HTML to the page.
 * @note Called by prepare_verses() after AJAX request.
 */
function handle_new_verses(res)
{
	///TODO: On a verse lookup that does not start with Genesis 1:1, scroll_maxed_top must be set to FALSE. (Has this been taken care of?)
	var total = res[3], return_type = res[0][0], direction = res[0][1];
	
	if (total > 0) {
		///FIXME: When looking up the last few verses of Revelation (i.e., Revelation 22:21), the page jumps when more content is loaded above.
		write_verses(return_type, direction, res[1], res[2]);
		
		/// Indicate to the user that more content may be loading, and check for more content.
		if (direction == ADDITIONAL && res[1][res[1].length - 1] < 66022021) {
			bottomLoader.style.visibility = "visible";
			setTimeout(add_content_bottom, lookup_speed_sitting);
		}
		if ((direction == PREVIOUS || waiting_for_first_search) && res[1][0] > 1001001) {
			topLoader.style.visibility = "visible";
			/// A delay is added on to space out the requests.
			setTimeout(add_content_top, lookup_speed_sitting + lookup_delay);
		}
	} else {
		if (direction == ADDITIONAL) {
			/// Reached the bottom scrolling down (RETURNED_SEARCH || RETURNED_VERSES_PREVIOUS).
			/// Either Revelation 22:21 or end of search or no results.
			scroll_maxed_bottom = true;
			bottomLoader.style.visibility = "hidden";
		}
		if (direction == PREVIOUS || waiting_for_first_search) {
			/// Reached the top scrolling up: Genesis 1:1 or no results.
			scroll_maxed_top = true;
			topLoader.style.visibility = "hidden";
		}
	}
	
	/// If this is the first results, update the info bar.
	if (waiting_for_first_search) {
		/// Stop the browser from trying to reset the scroll position after a page refresh.
		win.scrollTo(0, 0);
		
		waiting_for_first_search = false;
		
		infoBar.innerHTML = "";
		
		if (return_type == SEARCH) {
			/// Create the inital text.
			infoBar.appendChild(doc.createTextNode(format_number(total) + lang["found_" + (total == 1 ? "singular" : "plural")]));
			/// Create a <b> for the search terms.
			var b_tag = doc.createElement("b");
			///NOTE: We use this method instead of straight innerHTML to prevent HTML elements from appearing inside the <b></b>.
			b_tag.appendChild(doc.createTextNode(last_search));
			infoBar.appendChild(b_tag);
		}
		
		top_verse = res[1][0];
	}
}


/**
 * Writes new verses to page.
 *
 * @example write_verses(SEARCH, ADDITIONAL, [1001001], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning...</b>"]);
 * @param return_type (integer) The type of query: SEARCH || VERSE_LOOKUP.
 * @param direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS. 
 * @param verse_ids (array) An array of integers representing Bible verse references.
 * @param verse_HTML (array) An array of strings containing verses in HTML.
 * @return NULL.  Writes HTML to the page.
 * @note Called by handle_new_verses().
 * @note verse_ids contains an array of verses in the following format: [B]BCCCVVV (e.g., Genesis 1:1 == 1001001).
 */
function write_verses(return_type, direction, verse_ids, verse_HTML)
{
	///NOTE: psalm_title_re determines if a psalm does not have a title.
	var i, num, b, c, v, verse_str, HTML_str = "", chapter_text = "", psalm_title_re = /^(?:1(?:0[4-7]?|1[1-9]|3[25-7]|4[6-9]|50)?|2|33|43|71|9[13-79])$/;
	
	for (i in verse_HTML) {
		num = verse_ids[i];
		v = num % 1000; /// Calculate the verse.
		c = ((num - v) % 1000000) / 1000; /// Calculate the chapter.
		b = (num - v - c * 1000) / 1000000; /// Calculate the book by number (e.g., Genesis == 1).
		
		if (return_type == SEARCH) {
			/// Fix Psalm titles.
			if (v == 0) v = lang.title;
			
			if (b != last_book) { /// Only display the book if it is different from the last verse.
				last_book = b;
				HTML_str += "<h1 class=book id=" + num + "_title>" + books_short[b] + "</h1>"; /// Convert the book number to text.
			}
			verse_str = verse_HTML[i];
			HTML_str += "<div class=search_verse id=" + num + "_search>" + c + ":" + v + " " + verse_str + "</div>";
			
			///TODO: Determine if it would be better to put this in an array and send it all at once, preferably without the implied eval().
			/// Highlight the verse after 100 miliseconds.
			/// The delay is so that the verse is displayed as quickly as possible.
			setTimeout("highlight_results(\"" + verse_str + "\")", 100);
		} else { /// VERSE_LOOKUP
			if (v < 2) { /// I.e., 1 or 0 (title).
				if (c == 1) {
					HTML_str += "<div class=book id=" + num + "_title>" + books_long_pretitle[b] + "<h1>" + books_long_main[b] + "</h1>" + books_long_posttitle[b] + "</div>";
				} else if (b != 19 || v == 0 || psalm_title_re.test(c)) { /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
					/// Psalms have a special name.
					if (b == 19) {
						chapter_text = lang.psalm;
					} else {
						chapter_text = lang.chapter;
					}
					HTML_str += "<h3 class=chapter id=" + num + "_chapter>" + chapter_text + " " + c + "</h3>";
				}
				if (v == 0) {
					HTML_str += "<div class=pslam_title id=" + num + "_verse>" + verse_HTML[i] + "</div>";
				} else {
					HTML_str += "<div class=first_verse id=" + num + "_verse>" + verse_HTML[i] + "</div>";
				}
			} else {
				HTML_str += "<div class=verse id=" + num + "_verse>" + v + " " + verse_HTML[i] + "</div>";
			}
		}
	}
	
	var newEl = doc.createElement("div");
	///NOTE: If innerHTML disappears in the future (because it is not (yet) in the "standards"),
	///      a simple (but slow) alternative is to use the innerDOM script from http://innerdom.sourceforge.net/ or BetterInnerHTML from http://www.optimalworks.net/resources/betterinnerhtml/.
	///      Using range.createContextualFragment is also a posibility.
	newEl.innerHTML = HTML_str;
	
	if (direction == ADDITIONAL) {
		page.insertBefore(newEl, null);
		bottom_verse = num;
	} else {
		page.insertBefore(newEl, page.childNodes[0]);
		win.scrollTo(0, scroll_pos = (win.pageYOffset + newEl.clientHeight));
		top_verse = verse_ids[0];
	}
	
	if (!looking_up_verse_range) {
		looking_up_verse_range = true;
		setTimeout(find_current_range, look_up_range_speed);
	}
}
/* FIXME this code greatly speeds up replacing an element in Mozilla using innerHTML if there are lots of elements in it.
function replaceHtml(el, html) {
	var oldEl = typeof el === "string" ? document.getElementById(el) : el;
	/ *@cc_on // Pure innerHTML is slightly faster in IE	<----------
		oldEl.innerHTML = html;
		return oldEl;
	@* / <----------
	var newEl = oldEl.cloneNode(false);
	newEl.innerHTML = html;
	oldEl.parentNode.replaceChild(newEl, oldEl);
	/ * Since we just removed the old element from the DOM, return a reference <----------
	to the new element, which can be used to restore variable references. * / <----------
	return newEl;
};
*/


/**
 * Prepares the page for new verses.
 *
 * @example clean_up_page();
 * @return NULL.  The page is prepared for new verses.
 * @note Called by prepare_new_search().
 */
function clean_up_page() {
	///TODO: This should have smooth scrolling effects, etc.
	bottomLoader.style.visibility = "hidden";
	topLoader.style.visibility = "hidden";
	page.innerHTML = "";
}


/**
 * Highlight the verses.
 *
 * Highlights the words in the verses that match the search terms.
 * Highlighting is done by adding/changing the className of a word.
 *
 * @example setTimeout("highlight_results(\"" + res[2][i] + "\")", 100);
 * @example highlight_results("<b id=1>In</b> <b id=2>the</b> <b id=3>beginning...</b>");
 * @param search_str (string) The HTML to examine and highlight.
 * @return NULL.  Modifies objects className.
 * @note Called by write_search() via setTimeout() with a short delay.
 */
function highlight_results(search_str)
{	
	var tmp_found_ids = [], count = 1, regex_id, i, ids;

	for (regex_id in highlight_re) {
		
		tmp_found_ids = search_str.split(highlight_re[regex_id]);

		ids = tmp_found_ids.length;
		///NOTE: search_str.split() creates an array of the HTML with the correct ids every third one.
		for (i = 1; i < ids; i += 2) {
			///TODO: Determine if there is a downside to having a space at the start of the className.
			///TODO: Determine if we ever need to replace an existing f* className.
			doc.getElementById(tmp_found_ids[i]).className += " f" + count;
		}
		///TODO: Is there a way around this limitation (limiting how many unique words can be highlighted with different colors)?
		if (++count > highlight_limit) count = 1;
	}
}


/**
 * Filter multiple occurances and unnecessary characters.
 *
 * Remove multiple occurances of words, unnecessary characters or words (&, |, ", -anything, ...), and convert them all to lowercase.
 *
 * @example search_terms_arr = filter_array(search_terms.split(" "));
 * @example search_terms_arr = filter_array(["One", "two", "&", "one.", "-three"]); /// Returns: ["one", "two"];
 * @param arr (array) Array of words to filter.
 * @return Filtered array.
 * @note Called by prepare_highlighter().
 */
function filter_array(arr)
{
	///FIXME: The regex filters out characters of other languages, e.g., Greek and Hebrew.
	var key = "", tmp_arr1 = arr, tmp_arr2 = [], count = 0, val, re = /[^a-z*-]/ig;
	
	for (key in tmp_arr1) {
		//val = stemWord(tmp_arr1[key]);
		val = tmp_arr1[key].toLowerCase().replace(re, "");
		if (in_array(val, tmp_arr2) === false) {
			/// Filter out boolean operators and negitive words
			//if (val.length != 0 && val != "&" && val != "|" && val.substr(0, 1) != "-") {
			if (val.length != 0 && val.slice(0, 1) != "-") {
				/// Lastly, remove puncuation.
				//tmp_arr2[count++] = val.split(/["',.?!;:&|\)\(\]\[]/).join("");		
				///NOTE: Use this to filter correctly "one two"~3 || "one two" \ 4
				///      val = val.split(/"\s*[~\\]\s*[0-9]+/i).join(""); 
				///TODO: At the moment, we don't allow number searches (0-9), so we simply remove all numbers too for now.
				///TODO: We don't want to filter out Greek and Hebrew characters.
				///      Could do something like [^-\w], but that would filter Hebrew vowels and maybe other characters.
				//tmp_arr2[count++] = val.split(re).join("");
				tmp_arr2[count++] = val;
			}
		}
		delete tmp_arr1[key];
	}
	return tmp_arr2;
}


/**
 * Determines if a value is in an array.
 *
 * @example in_array("word", ["is", "word", "here"]); /// Returns TRUE.
 * @param needle (string) String to look for.
 * @param haystack (array) Array to examine.
 * @return TRUE if found; FALSE if not.
 */
function in_array(needle, haystack)
{
	for (var fkey in haystack) {
		if (haystack[fkey] == needle) {
			return fkey;
		}
	}
	return false;
}


/**
 * Prepare search terms for highlighting.
 *
 * Create regex array to search through the verses that will soon be returned by the server.
 *
 * @example prepare_highlighter(q_obj.value);
 * @example prepare_highlighter("search terms");
 * @param search_terms (string) The terms to look for.
 * @return NULL.  A regex array is created and stored in the global variable highlight_re[].
 * @note Called by run_search().
 */
function prepare_highlighter(search_terms)
{
	///TODO: Determine if this whole function should be in a language specific file.
	highlight_re = [];
	
	var search_terms_arr = filter_array(search_terms.split(" "));
	
	var count = 0, len_before, len_after, stemmed_word, stemmed_arr = [], no_morph, term, i;
	
	for (i in search_terms_arr) {
		term = search_terms_arr[i];
		len_before = term.length;
		
		///FIXME: Move this to lang/en.js because it is language dependent.
		/// Fix special/unique words that the stemmer won't.
		switch (term) {
			case "does": case "doth": case "do": case "doeth": case "doest":
				stemmed_word = "do[esth]*";
				no_morph = true;
				break;
			case "haste": case "hasted":
				stemmed_word = "haste";
				no_morph = false;
				break;
			case "shalt": case "shall":
				stemmed_word = "shal[lt]";
				no_morph = true;
				break;
			case "wilt": case "will":
				stemmed_word = "wil[lt]";
				no_morph = true;
				break;
			case "have": case "hast": case "hath":
				stemmed_word = "ha[vesth]+";
				no_morph = true;
				break;
			case "the":
				stemmed_word = "the";
				no_morph = true;
				break;
			case "for":
				stemmed_word = "for";
				no_morph = true;
				break;
			case "not":
				stemmed_word = "not";
				no_morph = true;
				break;
			default:
				if (term.indexOf("*") != -1) {
					/// The word has a wild card: don't stem, and change it to a regex compatible form.
					/// Word breaks are found by looking for tag beginnings (<) or closings (>).
					stemmed_word = term.replace(/\*/g, "[^<>]*");
					no_morph = true;
				} else {
					/// Most words get stemmed.
					///NOTE: stemWord() is language dependent, and therefore is delcared in js/langs/LOCALE.js.
					stemmed_word = stem_word(term);
					no_morph = false;
				}
		}
		len_after = stemmed_word.length;
		
		if (count > 0) {
			/// Skip words that are the same after stemming/regexing.
			if (in_array(stemmed_word, stemmed_arr)) continue;
		}
		
		stemmed_arr[count] = stemmed_word;
		
		//document.title=stemmed_word; /// Debugging: display last stemmed word.
		
		///NOTE: [<-] finds either the beginning of the close tag (</b>) or a hyphen (-).
		///      The hyphen is to highlight hyphenated words that would otherwise be missed (matching first word only) (i.e., "Beth").
		///      ([^>]+-)? finds words where the match is not the first of a hyphenated word (i.e., "Maachah").
		///      The current English version (KJV) does not use square brackets ([]).
		///FIXME: The punctutation )(,.?!;: could be considered language specific and should be moved.
		///TODO: Bench mark different regex (creation and testing).
		if (no_morph || (len_after == len_before && len_after < 3)) {
			highlight_re[count++] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[),.?!;:]*[<-]", "i");
		} else {
			/// Find most words based on stem morphology, but also can have false hits.
			///TODO: Compare different regexes
			//highlight_re[count++] = new RegExp("id=([0-9]+)>[(]*([^<]+-)?" + stemmed_word + "[a-z']{0,7}[),.?!;:]*[<-]", "i");
			highlight_re[count++] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[^<]{0,7}[),.?!;:]*[<-]", "i");
		}
	}
	
}


/**
 * Format a positive number with appropriate commas.
 *
 * @example format_number(1000); /// Returns "1,000"
 * @param num (positive number) The number to format.
 * @return A formatted number as a string.
 * @note To be faster, this will not format a negitive number.
 */
function format_number(num)
{
	if (num < 1000) return num;
	num += ""; /// Quickly converts a number to a string quickly.
	var rgx = /^([0-9]+)([0-9][0-9][0-9])/;
	
	while (rgx.test(num)) {
		num = num.replace(rgx, "$1,$2");
	}
	return num;
}

/***************************
 * End of search functions *
 ***************************/


/********************************
 * Start of Scrolling functions *
 ********************************/

/**
 * The onscroll event.
 *
 * When the page scrolls this figures out the direction of the scroll and
 * calls specific functions to determine whether content should be added or removed.
 *
 * @return NULL.  May call other functions via setTimeout() or setInterval().
 * @note Called when the window scrolls.
 * @note Set via "window.onscroll = scrolling;".
 */
function scrolling()
{
	///NOTE: Opera doesn't understand window.scrollY.
	var new_scroll_pos = win.pageYOffset;
	if (new_scroll_pos == scroll_pos) {
		/// IE/Opera sometimes don't update page.scrollTop until after this function is run.
		/// Mozilla/KHTML can get stuck here too.
		if (++scroll_check_count < 10) {
			setTimeout(scrolling, 30);
		} else { /// Stop it if it is stuck looping.
			scroll_check_count = 0;
		}
		return null;
	}
	scroll_check_count = 0;
	
	if (!looking_up_verse_range) {
		looking_up_verse_range = true;
		setTimeout(find_current_range, look_up_range_speed);
	}
	
	var scrolling_down = (new_scroll_pos > scroll_pos);
	
	/// This keeps track of the current scroll position so we can tell the direction of the scroll.
	scroll_pos = new_scroll_pos;
	
	/// Don't look up more data until the first results come.
	if (waiting_for_first_search) return null;
	
	if (scrolling_down) {
		setTimeout(add_content_bottom, lookup_speed_scrolling);
		checking_excess_content_top = true;
	} else {
		setTimeout(add_content_top, lookup_speed_scrolling);
		checking_excess_content_bottom = true;
	}

	if (checking_excess_content_top) {
		clearInterval(remove_content_top_interval);
		remove_content_top_interval = setInterval(remove_excess_content_top, remove_speed);
	}
	if (checking_excess_content_bottom) {
		clearInterval(remove_content_bottom_interval);
		remove_content_bottom_interval = setInterval(remove_excess_content_bottom, remove_speed);
	}
}


/**
 * Remove content that is past the top of screen and store in cache.
 *
 * @example remove_excess_content_top();
 * @return NULL.  Removes content from the page if required.
 * @note Called by scrolling() via setInterval().
 */
function remove_excess_content_top()
{
	var child = page.firstChild, child_height;
	
	if (child == null) return null;
	
	///NOTE: Mozilla ignores .clientHeight, .offsetHeight, .scrollHeight for some objects (not <div> however) with a doctype.
	///      If Mozilla has problems in the future, you can use this as a replacement:
	///      child_height = parseInt(window.getComputedStyle(child, null).getPropertyValue("height"));
	
	///NOTE: Opera wrongly subtracts the scroll position from .offsetTop.
	
	child_height = child.clientHeight;
	
	///NOTE: Mozilla also has window.scrollMaxY, which is slightly different than document.documentElement.scrollHeight (document.body.scrollHeight should work too).
	
	/// Is the object in the remove zone, and is its height less than the remaining space to scroll to prevent jumping?
	if (child_height + buffer_rem < scroll_pos && child_height < doc_docEl.scrollHeight - scroll_pos - doc_docEl.clientHeight) {
		
		cached_verses_top[cached_count_top++] = child.innerHTML;
		/// Remove quickly from page.
		child.style.display = "none";
		/// Calculate and set the new scroll position
		
		win.scrollTo(0, scroll_pos = (win.pageYOffset - child_height));
		
		page.removeChild(child);
		
		/// Indicates to the user that content will load if they scroll to the top of the screen.
		topLoader.style.visibility = "visible";
		/// End execution to keep the checking_content_top_interval running.
		return null;
	}
	
	clearInterval(remove_content_top_interval);
	checking_excess_content_top = false;
}


/**
 * Remove content from below the screen and store in cache.
 *
 * @example remove_excess_content_bottom();
 * @return NULL.  Removes content from the page if required.
 * @note Called by scrolling() via setInterval().
 */
function remove_excess_content_bottom()
{
	var child = page.lastChild, child_position, page_height;
	
	if (child == null) return null;
	
	child_position = child.offsetTop;
	
	page_height = doc_docEl.clientHeight;
	
	/// Is the object is in the remove zone?
	if (child_position > scroll_pos + page_height + buffer_rem) {
		cached_verses_bottom[cached_count_bottom++] = child.innerHTML;
		page.removeChild(child);
		
		/// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
		/*@cc_on
			win.scrollTo(0, scroll_pos);
		@*/
		/// End execution to keep the checking_content_top_interval running.
		bottomLoader.style.visibility = "visible";
		return null;
	}
	
	clearInterval(remove_content_bottom_interval);
	checking_excess_content_bottom = false;
}


/**
 * Add content to bottom of the page (off the screen)
 *
 * @example add_content_bottom();
 * @return NULL.  Adds content to the page if needed.
 * @note Called by scrolling() via setTimeout().
 * @note May call itself via setTimeout() if content is added.
 */
function add_content_bottom()
{
	var child = page.lastChild, child_position, page_height;
	
	if (child == null) return null;
	
	child_position = child.offsetTop + child.clientHeight;
	
	page_height = doc_docEl.clientHeight;
	
	if (child_position < scroll_pos + page_height + buffer_add) {
		if (cached_count_bottom > 0) {
			var newEl = doc.createElement("div");
			newEl.innerHTML = cached_verses_bottom[--cached_count_bottom];
			///NOTE: This is actually works like insertAfter() (if such a function existed).
			///      By using "null" as the second parameter, it tell it to add the element to the end.
			page.insertBefore(newEl, null);
			
			/// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
			/*@cc_on
				win.scrollTo(0, scroll_pos);
			@*/
			/// Better check to see if we need to add more content.
			setTimeout(add_content_bottom, lookup_speed_scrolling);
		} else {
			/// Check to see if we need to get new content.
			if (scroll_maxed_bottom) {
				bottomLoader.style.visibility = "hidden";
				return null;
			}
			run_search(ADDITIONAL);
		}
	}
}


/**
 * Add content to top of the page (off the screen)
 *
 * @example add_content_top();
 * @return NULL.  Adds content to the page if needed.
 * @note Called by scrolling(), resizing(), and write_verses() via setTimeout().
 * @note May call itself via setTimeout() if content is added.
 */
function add_content_top()
{
	var child = page.firstChild, child_height, child_position;
	
	if (child == null) return null;
	
	child_height = child.clientHeight;
	
	child_position = child_height;
	
	if (child_position + buffer_add > scroll_pos) {
		/// Can we get content from the cache?
		if (cached_count_top > 0) {
			var newEl = doc.createElement("div");
			newEl.innerHTML = cached_verses_top[--cached_count_top];
			
			page.insertBefore(newEl, child);
			
			win.scrollTo(0, scroll_pos = (win.pageYOffset + newEl.clientHeight));
			
			/// Better check to see if we need to add more content.
			setTimeout(add_content_top, lookup_speed_scrolling);
		} else {
			/// Check to see if we need to get new content.
			if (scroll_maxed_top) {
				topLoader.style.visibility = "hidden";
				return null;
			}
			run_search(PREVIOUS);
		}
	}
}


/**
 * Find the verse that is at the top of the page and at the bottom.
 *
 * @return NULL.  The page is modified to reflect the verse range.
 * @note Called by scrolling() or itself via setTimeout().
 */
function find_current_range()
{
	/// Allow for this function to be called again via setTimeout().  See scrolling().
	looking_up_verse_range = false;
	
	///TODO: Determine if there is a better way to calculate the topBar offset.
	var top_pos = scroll_pos + topLoader.offsetHeight + 8;
	var bottom_pos = scroll_pos + doc_docEl.clientHeight - 14;
	
	var top_verse_block = find_element_at_scroll_pos(top_pos, page);
	if (top_verse_block === null) {
		looking_up_verse_range = true;
		setTimeout(find_current_range, look_up_range_speed);
		return null;
	}
	
	var bottom_verse_block = find_element_at_scroll_pos(bottom_pos, null, top_verse_block);
	if (bottom_verse_block === null) {
		looking_up_verse_range = true;
		setTimeout(find_current_range, look_up_range_speed);
		return null;
	}
	
	var verse1_el = find_element_at_scroll_pos(top_pos, top_verse_block);
	var verse2_el = find_element_at_scroll_pos(bottom_pos, bottom_verse_block);
	if (verse1_el === null || verse2_el === null) {
		looking_up_verse_range = true;
		setTimeout(find_current_range, look_up_range_speed);
		return null;
	}
	
	/// parseInt() is used to keep the number and remove the trailing string from the id.  See write_verses().
	var verse1 = parseInt(verse1_el.id);
	var v1 = verse1 % 1000;
	var c1 = ((verse1 - v1) % 1000000) / 1000;
	var b1 = (verse1 - v1 - c1 * 1000) / 1000000;
	var verse2 = parseInt(verse2_el.id);
	var v2 = verse2 % 1000;
	var c2 = ((verse2 - v2) % 1000000) / 1000;
	var b2 = (verse2 - v2 - c2 * 1000) / 1000000;
	
	var ref_range;
	
	/// The titles in the book of Psalms are referenced as verse zero (cf. Psalm 3).
	v1 = v1 == 0 ? lang.title : v1;
	v2 = v2 == 0 ? lang.title : v2;
	
	///NOTE: \u2013 is unicode for the en dash (–) (HTML: &ndash;).
	///TODO: Determine if the colons should be language specified.
	if (b1 == b2) {
		/// The book of Psalms is refered to differently (e.g., Psalm 1:1).
		b1 = b1 == 19 ? lang.psalm : books_short[b1];
		if (c1 == c2) {
			if (v1 == v2) {
				ref_range = b1 + " " + c1 + ":" + v1;
			} else {
				ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + v2;
			}
		} else {
			ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + c2 + ":" + v2;
		}
	} else {
		/// The book of Psalms is refered to differently (e.g., Psalm 1:1).
		b1 = b1 == 19 ? lang.psalm : books_short[b1];
		b2 = b2 == 19 ? lang.psalm : books_short[b2];
		ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + b2 + " " + c2 + ":" + v2;
	}
	
	var new_title;
	/// last_type set in prepare_new_search().
	if (last_type == SEARCH) {
		new_title = last_search +  " (" + ref_range + ") - " + lang.page_title;
	} else {
		new_title = ref_range + " - " + lang.page_title;
	}
	///FIXME: Display the verse range properly.
	doc.title = new_title;
	
	return null;
}


/**
 * Find an element that is within a certain position on the page.
 *
 * @example element = find_element_at_scroll_pos(scroll_pos, page);
 * @param the_pos (number) The vertical position on the page.
 * @param parent_el (DOM element) The element to search inside of.
 * @return DOM element that is within the specified position of the page.
 * @note Called by find_current_range().
 * @note This is a helper function to find_current_range().
 */
function find_element_at_scroll_pos(the_pos, parent_el, el)
{
	/// Is the starting element unknown?
	if (!el) {
		/// Make an educated guess as to which element to start with to save time.
		var el_start_at = Math.round(parent_el.childNodes.length * (the_pos / doc_docEl.scrollHeight));
		if (el_start_at < 1) el_start_at = 1;
		el = parent_el.childNodes[el_start_at - 1];
	} else {
		/// We may need the parent_el if the_pos is below all of the elements.
		parent_el = el.parentNode;
	}
	
	if (!el) return null;
	var el_offset_top, el_offset_height;
	var looked_next = false, looked_previous = false;
	
	do {
		el_offset_top = el.offsetTop;
		el_offset_height = el.offsetHeight + el_offset_top;
		if (the_pos >= el_offset_top && the_pos <= el_offset_height) {
			return el;
		} else {
			if (the_pos > el_offset_top) {
				 el = el.nextSibling;
				 looked_next = true;
			} else {
				 el = el.previousSibling;
				 looked_previous = true
			}
			/// Did we get stuck in an infinite loop?
			if (looked_next && looked_previous) return null;
		}
	} while (el !== null);
	
	/// If there are no elements left (e.g., by scrolling all the way to the bottom) return the last element.
	if (looked_next) {
		return parent_el.lastChild;
	}
	///TODO: Determine if we should return parent_el.firstChild if looked_previous or if that might cause bugs.
	
	return null;
}


/**
 * The onresize event.
 *
 * When the page is resized, check to see if more content should be loaded.
 *
 * @return NULL.  Calls other functions
 * @note Called when the window is resized.
 * @note Set via window.onresize = resizing.
 */
function resizing()
{
	setTimeout(add_content_bottom, lookup_speed_scrolling);
	setTimeout(add_content_top, lookup_speed_scrolling);
	if (!looking_up_verse_range) {
		looking_up_verse_range = true;
		setTimeout(find_current_range, look_up_range_speed);
	}
}

/******************************
 * End of Scrolling functions *
 ******************************/


/***************************
 * Start of AJAX functions *
 ***************************/

/**
 * Send an AJAX request to the server.
 *
 * @example post_to_server("searcher.php", "q=search", ajax);
 * @example post_to_server("searcher.php", "q=search&s=48003027", ajax);
 * @param server_URL (string) The file on the server to run.
 * @param message (string) The variables to send.  URI format: "name1=value1&name2=value%202"
 * @param ajax (AJAX object) The object that preforms the query.
 * @return NULL.  Queries server and then performs an action with the recieved JSON array.
 * @note Called by run_search().
 */
function post_to_server(server_URL, message, ajax)
{
	ajax.open("POST", server_URL, true);
	ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	ajax.onreadystatechange = function ()
	{
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				/// This is run when the results are returned properly.
				interpret_result(ajax.responseText);
			} else {
				/// Was the abort unintentional?
				if (ajax.status != 0) {
					///FIXME: Do meaningful error handling.
					alert("Error " + ajax.status + ":\n" + ajax.responseText);
				}
			}
		}
	};
	ajax.send(message);
}


/**
 * Determines the action to preform with the recieved data.
 *
 * @example interpret_result(ajax.responseText);
 * @param message (string) The recieved JSON array.
 * @return NULL.  Preforms an action with the data.
 * @note Called by post_to_server().
 */
function interpret_result(message)
{
	///TODO: When a JSON parser is avaiable, use that if it is fast or the same speed.
	var res = eval(message);
	
	/// New search results.
	//if (res[0] == 1) write_search(res); ///FIXME: Right now, there is only one command.
	handle_new_verses(res);
}

/*************************
 * End of AJAX functions *
 *************************/


/**************************************
 * Start of IE compatiblity functions *
 **************************************/

///NOTE: Conditional compilation code block only executes on IE.
/// Make split() work correctly on IE.
/// See http://blog.stevenlevithan.com/archives/cross-browser-split.
/*@cc_on
String.prototype._$$split = String.prototype._$$split || String.prototype.split;

String.prototype.split = function (s, limit) {
	if (!(s instanceof RegExp)) return String.prototype._$$split.apply(this, arguments);
	var	flags = (s.global ? "g" : "") + (s.ignoreCase ? "i" : "") + (s.multiline ? "m" : ""),
		s2 = new RegExp("^" + s.source + "$", flags),
		output = [],
		origLastIndex = s.lastIndex,
		lastLastIndex = 0,
		i = 0, match, lastLength;
	if (limit === undefined || +limit < 0) {
		limit = false;
	} else {
		limit = Math.floor(+limit);
		if (!limit) return [];
	}
	if (s.global)
		s.lastIndex = 0;
	else
		s = new RegExp(s.source, "g" + flags);
	while ((!limit || i++ <= limit) && (match = s.exec(this))) {
		var emptyMatch = !match[0].length;
		if (emptyMatch && s.lastIndex > match.index)
			--s.lastIndex;
		if (s.lastIndex > lastLastIndex) {
			if (match.length > 1) {
				match[0].replace(s2, function ()
				{
					for (var j = 1; j < arguments.length - 2; j++) {
						if (arguments[j] === undefined)
							match[j] = undefined;
					}
				});
			}

			output = output.concat(this.slice(lastLastIndex, match.index));
			if (1 < match.length && match.index < this.length)
				output = output.concat(match.slice(1));
			lastLength = match[0].length;
			lastLastIndex = s.lastIndex;
		}
		if (emptyMatch)	++s.lastIndex;
	}
	output = lastLastIndex === this.length ?
		(s.test("") && !lastLength ? output : output.concat("")) :
		(limit ? output : output.concat(this.slice(lastLastIndex)));
	s.lastIndex = origLastIndex;
	return output;
};
@*/

/************************************
 * End of IE compatiblity functions *
 ************************************/