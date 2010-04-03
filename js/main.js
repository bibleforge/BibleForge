/**
 * BibleForge
 *
 * @date	10-30-08
 * @version	0.2 alpha
 * @link	http://BibleForge.com
 * @license	Reciprocal Public License 1.5 (RPL1.5)
 * @author	BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

/// Initialize the JavaScript frontend of BibleForge.
create_viewport(doc.getElementById("viewPort1"), doc.getElementById("searchForm1"), doc.getElementById("q1"),
	doc.getElementById("scroll1"), doc.getElementById("infoBar1"), doc.getElementById("topLoader1"),
	doc.getElementById("bottomLoader1"), document, document.documentElement, window);

/**
 * Create the BibleForge environment.
 *
 * This function is used to house all of the code used by BibleForge,
 * expect for language specific code, which is stored in js/lang/LOCALE.js.
 *
 * @param	viewPort		(object) The HTML object which encapsulates all of the other objects.
 * @param	searchForm		(object) The <form> object which contains the text box and button.
 * @param	q_obj			(object) The <input> object the user types into.
 * @param	infoBar			(object) The HTML object that displays information about the lookups and searches.
 * @param	topLoader		(object) The HTML object which displays the loading image above the text.
 * @param	bottomLoader	(object) The HTML object which displays the loading image below the text.
 * @param	doc				(object) The document element.
 * @param	doc_docEl		(object) The document.documentElement element (the HTML element).
 * @param	win				(object) The window element.
 * @return	NULL.  Some functions are attached to events and the rest accompany them via closure.
 */
function create_viewport(viewPort, searchForm, q_obj, page, infoBar, topLoader, bottomLoader, doc, doc_docEl, win)
{
	///NOTE: This should be "const" instead of "var," but IE doesn't support constants yet.
	var VERSE_LOOKUP 			= 1,
		MIXED_SEARCH 			= 2,
		STANDARD_SEARCH			= 3,
		MORPHOLOGICAL_SEARCH	= 4,
		
		/// Direction constants
		ADDITIONAL	= 1,
		PREVIOUS	= 2,
		
		highlight_re				= [],	/// Highlighter regex array
		last_search					= "",
		last_search_encoded			= "",	/// A cache of the last search query
		last_type,							/// The type of lookup performed last (VERSE_LOOKUP || MIXED_SEARCH || STANDARD_SEARCH || MORPHOLOGICAL_SEARCH)
		waiting_for_first_search	= false,
		last_book					= 0,	/// The number of the last book of the Bible that was returned
		highlight_limit				= 20,	/// Currently, we limit the unique number of search words to highlight.
		
		/// Ajax objects
		ajax_additional	= new win.XMLHttpRequest(),
		ajax_previous	= new win.XMLHttpRequest(),
		
		/// Verse variables
		/// top_verse and bottom_verse are the last verses displayed on the screen so that the same verse is not displayed twice when more search data is returned (currently just used for MORPHOLOGICAL_SEARCH).
		top_verse		= 0,
		bottom_verse	= 0,
		/// top_id and bottom_id are the last ids (either verse or word id) returned from a search or verse lookup.
		/// These are the same as bottom_id and top_id for VERSE_LOOKUP and STANDARD_SEARCH since these deal with entire verses as a whole, not individual words.
		/// For MORPHOLOGICAL_SEARCH, the last word id is stored.
		top_id,
		bottom_id,
		
		/// Scrolling variables
		scroll_pos						= 0,
		scroll_check_count				= 0,
		checking_excess_content_top		= false,
		checking_excess_content_bottom	= false,
		remove_content_top_interval,
		remove_content_bottom_interval,
		buffer_add						= 1000,
		buffer_rem						= 10000,
		cached_verses_top				= [],
		cached_count_top				= 0,
		cached_verses_bottom			= [],
		cached_count_bottom				= 0,
		scroll_maxed_top				= true,
		scroll_maxed_bottom				= false,
		lookup_speed_scrolling			= 50,
		lookup_speed_sitting			= 100,
		lookup_delay					= 200,
		remove_speed					= 3000,
		look_up_range_speed				= 300,	/// In milliseconds
		looking_up_verse_range			= false;
		
	/// Simple Event Registration
	/// Capture form submit event.
	searchForm.onsubmit = prepare_new_search;
	
	///NOTE: Could use wheel if the scroll bars are invisible.
	win.onscroll = scrolling;
	win.onresize = resizing;
	
	/*********************************
 	 * Start of Suggestion functions *
	 *********************************/
	/// Create suggest and attach it to the keypress event.
	///TODO: Determine if using closure here is helpful.
	/**
	 *
	 */
	q_obj.onkeypress = (function ()
	{
		/// Auto Suggest variables
		var last_suggestion_text = "",
			suggestion_cache = {},
			suggest_interval,
			suggest_delay = 250,
			ajax_suggestions = new win.XMLHttpRequest();
		
		/**
		 * 
		 */
		function request_suggestions()
		{
			clearInterval(suggest_interval);
			if (q_obj.value == last_suggestion_text) return;
			///TODO: Determine if there is a better way to write this code so that we don't need to use q_obj twice.
			last_suggestion_text = q_obj.value.trim();
			
			if (last_suggestion_text == "") return;
			
			/// Stop a previous, unfinished request.
			if (ajax_suggestions.readyState % 4) ajax_suggestions.abort();
			
			/// Check to see if we already have this in the cache.
			/// Do we need to request the suggestions from the server?
			if (typeof suggestion_cache[last_suggestion_text] == "undefined") {
				post_to_server("suggest.php", "q=" + encodeURIComponent(last_suggestion_text), ajax_suggestions, handle_suggest);
			} else {
				show_suggestions(suggestion_cache[last_suggestion_text]);
			}
		}
		
		/**
		 * 
		 */
		function handle_suggest(res)
		{
			
		}
		
		
		/**
		 * Handle keyboard events (onkeypress).
		 *
		 * This function is called as the user types in the input box.
		 * It then analyzes the type of key strokes and determines if
		 * BibleForge needs to look up suggestions for the user.
		 *
		 * @param	event (event object) (optional) The event object (Mozilla/Safari/Opera).
		 * @return	???
		 * @note	This function is returned into the window.onkeypress event.
		 */
		return function (event)
		{
			if (!event) event = win.event; /// IE does not send the event object.
			
			/// keyCode meanings:
			/// 0	(any letter)
			///	13	enter
			///	8	backspace
			/// 38	up
			/// 40	down
			switch (event.keyCode) {
			case 38:
				///TODO: Move the highlighting up.
				break;
			case 40:
				///TODO: Move the highlighting down.
				break;
			default:
				clearInterval(suggest_interval);
				suggest_interval = setInterval(request_suggestions, suggest_delay);
				break;
			}
			return true;
		};
	}());
	
	
	/// Disable autocomplete for Javascript enabled browsers because they can use the auto suggestions.
	q_obj.setAttribute("autocomplete", "off");
	
	/// Prototypes
	///NOTE: Adds trim() to Strings for IE/Opera/WebKit/Mozilla 3.0-.
	if (!"".trim) {
		/**
		 * Removes leading and trailing spaces.
		 *
		 * @example	trimmed = trim("  God is   good  "); /// Returns "God is   good"
		 * @param	str (string) The string to trim.
		 * @return	A String with leading and trailing spaces removed.
		 * @note	This does not remove all types of whitespace.  It actually removes anything under character code 33.
		 */
		String.prototype.trim = function()
		{
			var start = -1, end = this.length;
			while (this.charCodeAt(--end) < 33);
			while (++start < end && this.charCodeAt(start) < 33);
			return this.slice(start, end + 1);
		};
	}
	
	
	/**
	 * Make split() work correctly in IE.
	 *
	 * @param	s		(regexp || string)	The regular expression or string with which to break the string.
	 * @param	limit	(int)				The number of times to split the string.
	 * @return	Returns an array of the string now broken into pieces.
	 * @see		http://blog.stevenlevithan.com/archives/cross-browser-split.
	 */
	///NOTE: The following conditional compilation code blocks only executes in IE.
	/*@cc_on
		String.prototype._$$split = String.prototype._$$split || String.prototype.split;
		String.prototype.split = function (s, limit)
		{
			var flags, s2, output, origLastIndex, lastLastIndex, i, match, lastLength, emptyMatch, j;
			
			if (!(s instanceof RegExp)) return String.prototype._$$split.apply(this, arguments);
			
			flags = (s.global ? "g" : "") + (s.ignoreCase ? "i" : "") + (s.multiline ? "m" : "");
			s2 = new RegExp("^" + s.source + "$", flags);
			output = [];
			origLastIndex = s.lastIndex;
			lastLastIndex = 0;
			i = 0;
			
			if (limit === undefined || +limit < 0) {
				limit = false;
			} else {
				limit = Math.floor(+limit);
				if (!limit) return [];
			}
			if (s.global) {
				s.lastIndex = 0;
			} else {
				s = new RegExp(s.source, "g" + flags);
			}
			while ((!limit || i++ <= limit) && (match = s.exec(this))) {
				emptyMatch = !match[0].length;
				if (emptyMatch && s.lastIndex > match.index) {
					--s.lastIndex;
				}
				if (s.lastIndex > lastLastIndex) {
					if (match.length > 1) {
						match[0].replace(s2, function()
						{
							for (j = 1; j < arguments.length - 2; j++) {
								if (arguments[j] === undefined) {
									match[j] = undefined;
								}
							}
						});
					}
					
					output = output.concat(this.slice(lastLastIndex, match.index));
					if (1 < match.length && match.index < this.length) {
						output = output.concat(match.slice(1));
					}
					lastLength = match[0].length;
					lastLastIndex = s.lastIndex;
				}
				if (emptyMatch) ++s.lastIndex;
			}
			output = lastLastIndex === this.length ? (s.test("") && !lastLength ? output : output.concat("")) : (limit ? output : output.concat(this.slice(lastLastIndex)));
			s.lastIndex = origLastIndex;
			return output;
		};
		
		
		/// Trick IE into understanding win.pageYOffset.
		/// The initial value so that it is not undefined.
		/// See scrolling().
		win.pageYOffset = doc_docEl.scrollTop;
	@*/
	
	
	/*****************************
	 * Start of search functions *
	 *****************************/
	
	/**
	 * Prepare for the search.
	 *
	 * Evaluates the query from the user and deterim the search query from the input box.
	 *
	 * @example	prepare_new_search();
	 * @return	FALSE to prevent the form from submitting.
	 * @note	Called when clicking the submit button on the search bar in index.php.
	 * @note	Global variables used: waiting_for_first_search, ajax_additional, ajax_previous, last_type, bottom_id, last_search_encoded, last_search.
	 */
	function prepare_new_search()
	{
		var raw_search_terms = q_obj.value, verse_id, last_search_prepared, search_type_array;
		
		waiting_for_first_search = true;
		
		last_search_prepared = lang.prepare_search(raw_search_terms);
		
		if (last_search_prepared.length == 0) return false;
		
		/// Stop any old requests since we have a new one.
		/// Is readyState > 0 and < 4?  (Anything 1-3 needs to be aborted.)
		if (ajax_additional.readyState % 4)	ajax_additional.abort();
		if (ajax_previous.readyState % 4)	ajax_previous.abort();
		
		/// Determine if the user is preforming a search or looking up a verse.
		/// If the query is a verse reference, a number is returned, if it is a search, then FALSE is returned.
		verse_id = lang.determine_reference(last_search_prepared);
		
		/// Is the user looking up a verse? (verse_id is false when the user is preforming a search.)
		if (verse_id !== false) {
			/// To get the titles of Psalms, select verse 0 instead of verse 1.
			if (verse_id < 19145002 && verse_id > 19003000 && verse_id % 1000 == 1) --verse_id;
			
			last_type = VERSE_LOOKUP;
			///TODO: Determine if there is a better way of doing this.
			///NOTE: Subtract 1 because run_search() adds one.
			bottom_id = verse_id - 1;
			
		/// The user is submitting a search request.
		} else {
			/// The type of search must be determined (i.e., MIXED_SEARCH or STANDARD_SEARCH or MORPHOLOGICAL_SEARCH).
			search_type_array = determine_search_type(last_search_prepared);
			
			/// The type of search is stored in the first index of the array.
			last_type = search_type_array[0];
			
			if (last_type == MORPHOLOGICAL_SEARCH) {
				/// MORPHOLOGICAL_SEARCH uses a JSON array which is stored as text in the second index of the array.
				last_search_prepared = search_type_array[1];
			}
			last_search_encoded = encodeURIComponent(last_search_prepared);
			bottom_id = 0;
		}
		
		run_search(ADDITIONAL);
		
		/// Prepare for the new results.
		if (last_type == VERSE_LOOKUP) {
			scroll_maxed_top = false;
			scroll_maxed_bottom = false;
		} else {
			scroll_maxed_top = true;
			scroll_maxed_bottom = false;
			/// We immediately prepare the highlighter so that when the results are returned via Ajax.
			/// the highlighter array will be ready to go.
			/// Do we already have the regex array or do we not need because the highlighted words will be returned (e.g., morphological searching)?
			if (raw_search_terms != last_search) {
				prepare_highlighter(last_search_prepared);
				/// This global variable is used to display the last search on the info bar.
				last_search = raw_search_terms;
			}
		}
		
		clean_up_page();
		last_book = 0;
		
		/// Clear cache.
		///TODO: Determine a way to store the cache in a way that it can be used later.
		cached_verses_top		= [];
		cached_count_top 		= 0;
		cached_verses_bottom	= [];
		cached_count_bottom 	= 0;
		
		doc.title = raw_search_terms + " - " + lang.app_name;
		return false;
	}
	
	
	/**
	 * Figure out what type of search is being attempted by the user.
	 *
	 * @example	determine_search_type("God & love");							/// Returns [STANDARD_SEARCH]
	 * @example	determine_search_type("love AS NOUN");							/// Returns [MORPHOLOGICAL_SEARCH,'["love",[[1,1]],[1]]']
	 * @example	determine_search_type("go AS IMPERATIVE, -SINGULAR");			/// Returns [MORPHOLOGICAL_SEARCH,'["go",[[9,3],[5,1]],[0,1]]']
	 * @example	determine_search_type("go* AS PASSIVE, -PERFECT,INDICATIVE");	/// Returns [MORPHOLOGICAL_SEARCH,'["go*",[[8,3],[7,5],[9,1]],[0,1,0]]']
	 * @example	determine_search_type("* AS RED, IMPERATIVE");					/// Returns [MORPHOLOGICAL_SEARCH,'["",[[3,1],[9,3]],[0,0]]']
	 * //@example determine_search_type("love AS NOUN & more | less -good AS ADJECTIVE"); /// Returns [MORPHOLOGICAL_SEARCH, [0, "love", "NOUN"], STANDARD_SEARCH, "& more | less -good", MORPHOLOGICAL_SEARCH, [0, "good", "ADJECTIVE"]]
	 * @param	search_terms (string) The prepared terms to be examined.
	 * @return	An array describing the type of search.  Format: [(int)Type of search, (optional)(string)JSON array describing the search].
	 * @note	Called by run_search().
	 * @note	Only a partial implementation currently.  Mixed searching is lacking.
	 */
	function determine_search_type(search_terms)
	{
		var split_pos, morph_json, morph_attribute_json, morph_attributes, split_start, morph_search_term;
		/// Did the user use the morphological keyword in his search?
		if ((split_pos = search_terms.indexOf(lang.morph_marker)) != -1) {
			///TODO: Determine what is better: a JSON array or POST/GET string (i.e., word1=word&grammar_type1=1&value1=3&include1=1&...).
			/// A JSON array is used to contain the information about the search.
			/// JSON format: '["WORD",[[GRAMMAR_TYPE1,VALUE1],[...]],[INCLUDE1,...]]'
			/// replace(/(["'])/g, "\\$1") adds slashes to sanitize the data.
			morph_search_term = search_terms.slice(0, split_pos);
			
			/// Is the user trying to find all words that match the morphological attributes?
			if (morph_search_term == "*") {
				/// Sphinx will find all words if no query is present, so we need to send a blank search request.
				morph_search_term = ""
			}
			
			morph_json = '["' + morph_search_term.replace(/(["'])/g, "\\$1") + '",[';
			
			/// These strings will be used to concatenate data.
			morph_attribute_json = "", exclude_json = "";
			
			morph_attributes = search_terms.slice(split_pos + lang.morph_marker_len);
			
			split_start = 0;
			
			///TODO: Determine if there is a benefit to using do() over while().
			///NOTE: An infinite loop is used because the data is returned when it reaches the end of the string.
			do {
				/// Find where the attributes separate (e.g., "NOUN, GENITIVE" would separate at character 4).
				split_pos = morph_attributes.indexOf(lang.morph_separator, split_start);
				/// Trim leading white space.
				if (morph_attributes.slice(split_start, split_start + 1) == " ") ++split_start;
				/// Is this morphological feature to be excluded?
				if (morph_attributes.slice(split_start, split_start + 1) == "-") {
					/// Skip the hyphen so that we just get the grammatical word (e.g., "love AS -NOUN" we just want "NOUN").
					++split_start;
					exclude_json += "1,";
				} else {
					exclude_json += "0,";
				}
				
				if (split_pos > -1) {
					morph_attribute_json += lang.morph_grammar[morph_attributes.slice(split_start, split_pos).trim()] + ",";
					split_start = split_pos + 1;
				} else {
					///TODO: Determine if trim() is necessary or if there is a better implementation.
					///NOTE: exclude_json.slice(0, -1) is used to remove the trailing comma.  This could be unnecessary.
					return [MORPHOLOGICAL_SEARCH, morph_json + morph_attribute_json + lang.morph_grammar[morph_attributes.slice(split_start).trim()] + "],[" + exclude_json.slice(0, -1) + "]]"];
				}
			} while (true);
		}
		/// The search is just a standard search.
		return [STANDARD_SEARCH];
	}
	
	
	/**
	 * Submits a query via Ajax.
	 *
	 * @example	run_search(ADDITIONAL);	/// Will add verses to the bottom.
	 * @example	run_search(PREVIOUS);	/// Will add verses to the top.
	 * @param	direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
	 * @return	NULL.  Query is sent via Ajax.
	 * @note	Called by prepare_new_search() when the user submits a search.
	 * @note	Called by add_content_bottom() and add_content_top() when scrolling.
	 * @note	Global variables used: last_type and bottom_id, top_id, last_search_encoded.
	 */
	function run_search(direction)
	{
		/// last_type set in prepare_new_search().
		var ajax, query = "t=" + last_type;
		if (direction == ADDITIONAL) {
			ajax = ajax_additional;
		} else {
			ajax = ajax_previous;
			query += "&d=" + direction;
		}
		
		/// Is the server already working on this request?
		///NOTE: readyState is between 0-4, and anything 1-3 means that the server is already working on this request.
		if (ajax.readyState % 4) return null;
		
		if (last_type == VERSE_LOOKUP) {
			if (direction == ADDITIONAL) {
				query += "&q=" + (bottom_id + 1);
			} else {
				query += "&q=" + (top_id - 1);
			}
		} else {
			query += "&q=" + last_search_encoded;
			if (direction == ADDITIONAL) {
				/// Continue starting on the next verse.
				if (bottom_id > 0) query += "&s=" + (bottom_id + 1);
			} else {
				/// Continue starting backwards on the previous verse.
				query += "&s=" + (top_id + -1);
			}
		}
		post_to_server("search.php", query, ajax, handle_new_verses);
	}
	
	
	/**
	 * Handles new verses from the server.
	 *
	 * Writes new verses to the page, determines if more content is needed or available,
	 * and writes initial information to the info bar.
	 *
	 * @example	prepare_verses([[VERSE_LOOKUP, PREVIOUS], [1001001, 1001002], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning....</b>", "<b id="12">And</b> <b id="13">the</b> <b id="14">earth....</b>"], 2]);
	 * @example	prepare_verses([[STANDARD_SEARCH, ADDITIONAL], [1001001], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning....</b>"], 1]);
	 * @example	prepare_verses([[MORPHOLOGICAL_SEARCH, ADDITIONAL], [50004008], ["<b id=772635>Finally,</b> <b id=772636>brethren,</b> <b id=772637>whatsoever</b> <b id=772638>things....</b>"], 1, [772638]]);
	 * @param	res (array) JSON array from the server.  Array format: [action, direction], [verse_ids, ...], [verse_HTML, ...], number_of_matches, [word_id, ...]].  ///NOTE: word_id is optional.
	 * @return	NULL.  The function writes HTML to the page.
	 * @note	Called by prepare_verses() after an Ajax request.
	 */
	function handle_new_verses(res)
	{
		///TODO: On a verse lookup that does not start with Genesis 1:1, scroll_maxed_top must be set to FALSE. (Has this been taken care of?)
		var total = res[3], action = res[0][0], direction = res[0][1], i, count, b_tag;
		
		if (total > 0) {
			///FIXME: When looking up the last few verses of Revelation (i.e., Revelation 22:21), the page jumps when more content is loaded above.
			write_verses(action, direction, res[1], res[2]);
			
			///FIXME: Highlighting needs to be in its own function where each type and mixed highlighting will be done correctly.
			if (action == STANDARD_SEARCH) {
				/// Highlight the verse after 100 milliseconds.
				/// The delay is so that the verse is displayed as quickly as possible.
				///TODO: Determine if it would be better to put this in an array and send it all at once, preferably without the implied eval().
				///TODO: Determine if it is bad to convert the array to a string like this
				setTimeout(function ()
				{
					highlight_search_results('"' + res[2] + '"');
				}, 100);
			} else if (action == MORPHOLOGICAL_SEARCH) {
				count = res[4].length;
				for (i = 0; i < count; ++i) {
					///TODO: Determine if there is a downside to having a space at the start of the className.
					///TODO: Determine if we ever need to replace an existing f* className.
					doc.getElementById(res[4][i]).className += " f" + 1;
				}
				/// Record the last id found from the search so that we know where to start from for the next search as the user scrolls.
				/// Do we need to record the bottom id?
				if (direction == ADDITIONAL) {
					bottom_id = res[4][count - 1];
				} else {
					top_id = res[4][0];
				}
			}
			
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
				/// The user has reached the bottom by scrolling down (either RETURNED_SEARCH or RETURNED_VERSES_PREVIOUS), so we need to hide the loading graphic.
				/// This is cause by scrolling to Revelation 22:21 or end of search or there were no results.
				scroll_maxed_bottom = true;
				bottomLoader.style.visibility = "hidden";
			}
			if (direction == PREVIOUS || waiting_for_first_search) {
				/// The user has readed the top of the page by scrolling up (either Genesis 1:1 or there were no search results), so we need to hide the loading graphic
				scroll_maxed_top = true;
				topLoader.style.visibility = "hidden";
			}
		}
		
		/// If this is the first results, update the info bar.
		if (waiting_for_first_search) {
			/// If the user had scrolled down the page and then pressed the refresh button,
			/// the page will keep scrolling down as content is loaded, so to prevent this, force the window to scroll to the top of the page.
			win.scrollTo(0, 0);
			
			waiting_for_first_search = false;
			
			infoBar.innerHTML = "";
			
			if (action != VERSE_LOOKUP) {
				/// Create the inital text.
				infoBar.appendChild(doc.createTextNode(format_number(total) + lang["found_" + (total == 1 ? "singular" : "plural")]));
				/// Create a <b> for the search terms.
				b_tag = doc.createElement("b");
				///NOTE: We use this method instead of straight innerHTML to prevent HTML elements from appearing inside the <b></b>.
				b_tag.appendChild(doc.createTextNode(last_search));
				infoBar.appendChild(b_tag);
			}
			
			/// Store the first verse reference for later.
			top_id = res[1][0];
		}
	}
	
	
	/**
	 * Writes new verses to page.
	 *
	 * @example	write_verses(action, direction, [verse_ids, ...], [verse_HTML, ...]);
	 * @example	write_verses(VERSE_LOOKUP, ADDITIONAL, [1001001], ["<b id=1>In</b> <b id=2>the</b> <b id=3>beginning....</b>"]);
	 * @param	action		(integer)	The type of query: VERSE_LOOKUP || MIXED_SEARCH || STANDARD_SEARCH || MORPHOLOGICAL_SEARCH.
	 * @param	direction	(integer)	The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
	 * @param	verse_ids	(array)		An array of integers representing Bible verse references.
	 * @param	verse_HTML	(array)		An array of strings containing verses in HTML.
	 * @return	NULL.  Writes HTML to the page.
	 * @note	Called by handle_new_verses().
	 * @note	verse_ids contains an array of verses in the following format: [B]BCCCVVV (e.g., Genesis 1:1 == 1001001).
	 */
	function write_verses(action, direction, verse_ids, verse_HTML)
	{
		///NOTE: psalm_title_re determines if a psalm does not have a title.
		///TODO: Determine if psalm_title_re should be global for performance reasons or otherwise.
		var i, num, b, c, v, newEl,
			HTML_str = "", chapter_text = "",
			///TODO: Determine if this should be a global variable.
			psalm_title_re = /^(?:1(?:0[4-7]?|1[1-9]|3[5-7]|4[6-9]|50)?|2|33|43|71|9[13-79])$/,
			start_key = 0, stop_key = verse_ids.length;
		
		/// Currently only MORPHOLOGICAL_SEARCH searches data at the word level, so it is the only action that might stop in the middle of a verse and find more words in the same verse as the user scrolls.
		if (action == MORPHOLOGICAL_SEARCH) {
			if (direction == ADDITIONAL) {
				/// Is the first verse returned the same as the bottom verse on the page?
				if (bottom_verse == verse_ids[0]) start_key = 1;
			} else {
				/// Is the last verse returned the same as the top verse on the page?
				if (top_verse == verse_ids[stop_key - 1]) --start_key;
			}
		}
		
		for (i = start_key; i < stop_key; ++i) {
			num = verse_ids[i];
			/// Calculate the verse.
			v = num % 1000;
			/// Calculate the chapter.
			c = ((num - v) % 1000000) / 1000;
			/// Calculate the book by number (e.g., Genesis == 1).
			b = (num - v - c * 1000) / 1000000;
			///TODO: Determine if it would be better to have two for loops instead of the if statement inside of this one.
			
			if (action == VERSE_LOOKUP) {
				/// Is this the first verse or the Psalm title?
				if (v < 2) {
					/// Is this chapter 1?  (We need to know if we should display the book name.)
					if (c == 1) {
						HTML_str += "<div class=book id=" + num + "_title>" + lang.books_long_pretitle[b] + "<h1>" + lang.books_long_main[b] + "</h1>" + lang.books_long_posttitle[b] + "</div>";
					} else if (b != 19 || v == 0 || psalm_title_re.test(c)) { /// Display chapter/psalm number (but not on verse 1 of psalms that have titles).
						/// Is this the book of Psalms?  (Psalms have a special name.)
						if (b == 19) {
							chapter_text = lang.psalm;
						} else {
							chapter_text = lang.chapter;
						}
						HTML_str += "<h3 class=chapter id=" + num + "_chapter>" + chapter_text + " " + c + "</h3>";
					}
					/// Is this a Psalm title (i.e., verse 0)?  (Psalm titles are displayed specially.)
					if (v == 0) {
						HTML_str += "<div class=pslam_title id=" + num + "_verse>" + verse_HTML[i] + "</div>";
					} else {
						HTML_str += "<div class=first_verse id=" + num + "_verse>" + verse_HTML[i] + "</div>";
					}
				} else {
					HTML_str += "<div class=verse id=" + num + "_verse>" + v + " " + verse_HTML[i] + "</div>";
				}
				
			/// Searching
			} else {
				/// Change verse 0 to "title" (i.e., Psalm titles).  (Display Psalm 3:title instead of Psalm 3:0.)
				if (v == 0) v = lang.title;
				
				/// Is this verse from a different book than the last verse?
				if (b != last_book) {
					/// We only need to print out the book if it is different from the last verse.
					last_book = b;
					HTML_str += "<h1 class=book id=" + num + "_title>" + lang.books_short[b] + "</h1>"; /// Convert the book number to text.
				}
				
				HTML_str += "<div class=search_verse id=" + num + "_search>" + c + ":" + v + " " + verse_HTML[i] + "</div>";
			}
		}
		
		newEl = doc.createElement("div");
		///NOTE: If innerHTML disappears in the future (because it is not (yet) in the "standards"),
		///      a simple (but slow) alternative is to use the innerDOM script from http://innerdom.sourceforge.net/ or BetterInnerHTML from http://www.optimalworks.net/resources/betterinnerhtml/.
		///      Also using "var range = doc.createRange();var newEl = range.createContextualFragment(HTML_str); is also a possibility.
		newEl.innerHTML = HTML_str;
		
		if (direction == ADDITIONAL) {
			page.appendChild(newEl);
			
			/// Record the bottom most verse reference and id so that we know where to start from for the next search or verse lookup as the user scrolls.
			///NOTE: For VERSE_LOOKUP and STANDARD_SEARCH, the bottom_id and bottom_verse are the same because the search is preformed at the verse level.
			///      MORPHOLOGICAL_SEARCH is performed at the word level, so the id is different from the verse.
			///      The id for MORPHOLOGICAL_SEARCH is recorded in handle_new_verses(), currently.
			///TODO: Determine the pros/cons of using an if statement to prevent morphological searches from recording the id here, since it is overwritten later.
			bottom_id = bottom_verse = num;
		} else {
			page.insertBefore(newEl, page.childNodes[0]);
			
			/// The new content that was just added to the top of the page will push the other contents downward.
			/// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
			win.scrollTo(0, scroll_pos = win.pageYOffset + newEl.clientHeight);
			
			/// Record the top most verse reference and id so that we know where to start from for the next search or verse lookup as the user scrolls.
			///NOTE: For VERSE_LOOKUP and STANDARD_SEARCH, the top_id and top_verse are the same because the search is preformed at the verse level.
			///      MORPHOLOGICAL_SEARCH is performed at the word level, so the id is different from the verse.
			///      The id for MORPHOLOGICAL_SEARCH is recorded in handle_new_verses(), currently.
			///TODO: Determine the pros/cons of using an if statement to prevent morphological searches from recording the id here, since it is overwritten later.
			top_id = top_verse = verse_ids[0];
		}
		
		/// If it is not going to already, figure out which verses are presently displayed on the screen.
		if (!looking_up_verse_range) {
			looking_up_verse_range = true;
			setTimeout(find_current_range, look_up_range_speed);
		}
	}
	
	
	/**
	 * Prepares the page for new verses.
	 *
	 * @example	clean_up_page();
	 * @return	NULL.  The page is prepared for new verses.
	 * @note	Called by prepare_new_search().
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
	 * @example	setTimeout(function () {highlight_search_results('"' + res[2] + '"');}, 100);
	 * @example	highlight_search_results("<b id=1>In</b> <b id=2>the</b> <b id=3>beginning...</b>");
	 * @param	search_str (string) The HTML to examine and highlight.
	 * @return	NULL.  Modifies objects className.
	 * @note	Called by write_verses() via setTimeout() with a short delay.
	 */
	function highlight_search_results(search_str)
	{
		var tmp_found_ids = [], count = 1, regex_id, regex_length = highlight_re.length, i, ids;
		
		for (regex_id = 0; regex_id < regex_length; ++regex_id) {
			tmp_found_ids = search_str.split(highlight_re[regex_id]);
			
			ids = tmp_found_ids.length;
			///NOTE: search_str.split() creates an array of the HTML with the correct ids every third one.
			for (i = 1; i < ids; i += 2) {
				///TODO: Determine if there is a downside to having a space at the start of the className.
				///TODO: Determine if we ever need to replace an existing f* className.
				doc.getElementById(tmp_found_ids[i]).className += " f" + (regex_id + 1);
			}
		}
	}
	
	
	///TODO: Determine if this whole function should be in a language specific file.
	/**
	 * Prepare search terms for highlighting.
	 *
	 * Create regex array to search through the verses that will soon be returned by the server.
	 *
	 * @example	prepare_highlighter(q_obj.value);
	 * @example	prepare_highlighter("search terms");
	 * @param	search_terms (string) The terms to look for.
	 * @return	NULL.  A regex array is created and stored in the global variable highlight_re[].
	 * @note	Called by run_search().
	 */
	function prepare_highlighter(search_terms)
	{
		var count			= 0,
			i,
			j,
			len_before,
			len_after,
			no_morph, term,
			stemmed_arr		= [],
			search_terms_arr,
			stemmed_word;
		
		highlight_re = [];
		
		search_terms_arr = lang.filter_terms_for_highlighter(search_terms)
		
		first_loop:for (i in search_terms_arr) {
			term = search_terms_arr[i];
			len_before = term.length;
			
			///FIXME: Move this to the language specific file because it is language dependent.
			/// Fix special/unique words that the stemmer won't stem correctly.
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
				/// Does the word contain a wildcard symbol (*)?
				if (term.indexOf("*") != -1) {
					/// Don't stem; change it to a regex compatible form.
					///NOTE: Word breaks are found by looking for tag openings (<) or closings (>).
					stemmed_word = term.replace(/\*/g, "[^<>]*");
					no_morph = true;
				} else {
					/// A normal word without a wildcard gets stemmed.
					stemmed_word = lang.stem_word(term);
					no_morph = false;
				}
			}
			len_after = stemmed_word.length;
			
			/// Skip words that are the same after stemming or regexing.
			for (j = 0; j < count; ++j) {
				if (stemmed_word == stemmed_arr[j]) continue first_loop; ///NOTE: This is the same as "continue 2" in PHP.
			}
			
			stemmed_arr[count] = stemmed_word;
			
			///NOTE: [<-] finds either the beginning of the close tag (</b>) or a hyphen (-).
			///      The hyphen is to highlight hyphenated words that would otherwise be missed (matching first word only) (i.e., "Beth").
			///      ([^>]+-)? finds words where the match is not the first of a hyphenated word (i.e., "Maachah").
			///      The current English version (KJV) does not use square brackets ([]).
			///FIXME: The punctuation ,.?!;:)( could be considered language specific.
			///TODO: Bench mark different regex (creation and testing).
			if (no_morph || (len_after == len_before && len_after < 3)) {
				highlight_re[count++] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[),.?!;:]*[<-]", "i");
			} else {
				/// Find most words based on stem morphology, but also can have false hits.
				///TODO: Compare different regexes.
				//highlight_re[count++] = new RegExp("id=([0-9]+)>[(]*([^<]+-)?" + stemmed_word + "[a-z']{0,7}[),.?!;:]*[<-]", "i");
				highlight_re[count++] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[^<]{0,7}[),.?!;:]*[<-]", "i");
			}
		}
	}
	
	
	/**
	 * Format a positive number with appropriate commas.
	 *
	 * @example	format_number(1000); /// Returns "1,000"
	 * @param	num (positive number) The number to format.
	 * @return	A formatted number as a string.
	 * @note	To be faster, this will not format a negative number.
	 */
	function format_number(num)
	{
		var rgx;
		if (num < 1000) return num;
		/// Quickly converts a number to a string quickly.
		num += "";
		rgx = /^([0-9]+)([0-9][0-9][0-9])/;
		
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
	 * @return	NULL.  May call other functions via setTimeout() or setInterval().
	 * @note	Called when the window scrolls.
	 * @note	Set via "window.onscroll = scrolling;".
	 */
	function scrolling()
	{
		/// Trick IE into understanding win.pageYOffset.
		/*@cc_on
			win.pageYOffset = doc_docEl.scrollTop;
		@*/
		var new_scroll_pos = win.pageYOffset, scrolling_down;
		
		if (new_scroll_pos == scroll_pos) {
			/// IE/Opera sometimes don't update page.scrollTop until after this function is run.
			/// Mozilla/WebKit can get stuck here too.
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
		
		scrolling_down = (new_scroll_pos > scroll_pos);
		
		/// This keeps track of the current scroll position so we can tell the direction of the scroll.
		scroll_pos = new_scroll_pos;
		
		/// Don't look up more data until the first results come.
		if (waiting_for_first_search) return null;
		
		/// Since the page is scrolling, we need to determine if more content needs to be added or if some content should be hidden.
		
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
	 * @example	remove_excess_content_top();
	 * @return	NULL.  Removes content from the page if required.
	 * @note	Called by scrolling() via setInterval().
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
			/// Store the content in cache, and then add 1 to the global counter variable so that we know how much cache we have.
			cached_verses_top[cached_count_top++] = child.innerHTML;
			///TODO: Determine if setting the display to "none" actually helps at all.
			/// Remove quickly from page.
			child.style.display = "none";
			/// Calculate and set the new scroll position
			/// Because content is being removed from the top of the page, the rest of the content will be shifted upward.
			/// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was removed.
			win.scrollTo(0, scroll_pos = (win.pageYOffset - child_height));
			
			page.removeChild(child);
			
			/// Indicates to the user that content will load if they scroll to the top of the screen.
			topLoader.style.visibility = "visible";
			/// End execution to keep the checking_content_top_interval running because there could be even more content that should be removed.
			return null;
		}
		
		/// Since no content needs to be removed, there is no need to check again.
		clearInterval(remove_content_top_interval);
		checking_excess_content_top = false;
	}
	
	
	/**
	 * Remove content from below the screen and store in cache.
	 *
	 * @example	remove_excess_content_bottom();
	 * @return	NULL.  Removes content from the page if required.
	 * @note	Called by scrolling() via setInterval().
	 */
	function remove_excess_content_bottom()
	{
		var child = page.lastChild, child_position, page_height;
		
		if (child == null) return null;
		
		child_position = child.offsetTop;
		page_height = doc_docEl.clientHeight;
		
		/// Is the element is in the remove zone?
		if (child_position > scroll_pos + page_height + buffer_rem) {
			/// Store the content in cache, and then add 1 to the global counter variable so that we know how much cache we have.
			cached_verses_bottom[cached_count_bottom++] = child.innerHTML;
			
			page.removeChild(child);
			
			/// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
			/*@cc_on
				win.scrollTo(0, scroll_pos);
			@*/
			/// End execution to keep the checking_content_top_interval running because there might be even more content that should be removed.
			bottomLoader.style.visibility = "visible";
			return null;
		}
		
		/// Since no content needs to be removed, there is no need to check again.
		clearInterval(remove_content_bottom_interval);
		checking_excess_content_bottom = false;
	}
	
	
	/**
	 * Add content to bottom of the page (off the screen)
	 *
	 * @example	add_content_bottom();
	 * @return	NULL.  Adds content to the page if needed.
	 * @note	Called by scrolling() via setTimeout().
	 * @note	May call itself via setTimeout() if content is added.
	 */
	function add_content_bottom()
	{
		var child = page.lastChild, child_position, page_height, newEl;
		
		if (child == null) return null;
		
		child_position = child_position = child.offsetTop + child.clientHeight;
		page_height = page_height = doc_docEl.clientHeight;
		/// Is the user scrolling close to the bottom of the page?
		if (child_position < scroll_pos + page_height + buffer_add) {
			/// Can the content be grabbed from cache?
			if (cached_count_bottom > 0) {
				newEl = doc.createElement("div");
				/// First subtract 1 from the global counter variable to point to the last cached passage, and then retrieve the cached content.
				newEl.innerHTML = cached_verses_bottom[--cached_count_bottom];
				///NOTE: This is actually works like insertAfter() (if such a function existed).
				///      By using "null" as the second parameter, it tells it to add the element to the end.
				page.insertBefore(newEl, null);
				
				/// This fixes an IE7+ bug that causes the page to scroll needlessly when an element is added.
				/*@cc_on
					win.scrollTo(0, scroll_pos);
				@*/
				/// Better check to see if we need to add more content.
				setTimeout(add_content_bottom, lookup_speed_scrolling);
			} else {
				/// Did the user scroll all the way to the very bottom?  (If so, then there is no more content to be gotten.)
				if (scroll_maxed_bottom) {
					bottomLoader.style.visibility = "hidden";
					return null;
				}
				/// Get more content.
				run_search(ADDITIONAL);
			}
		}
	}
	
	
	/**
	 * Add content to top of the page (off the screen)
	 *
	 * @example	add_content_top();
	 * @return	NULL.  Adds content to the page if needed.
	 * @note	Called by scrolling(), resizing(), and write_verses() via setTimeout().
	 * @note	May call itself via setTimeout() if content is added.
	 */
	function add_content_top()
	{
		var child = page.firstChild, child_height, child_position, newEl;
		
		if (child == null) return null;
		
		child_height = child.clientHeight;
		
		child_position = child_height;
		
		/// Is the user scrolling close to the top of the page?
		if (child_position + buffer_add > scroll_pos) {
			/// Can the content be grabbed from cache?
			if (cached_count_top > 0) {
				newEl = doc.createElement("div");
				
				/// First subtract 1 from the global counter variable to point to the last cached passage, and then retrieve the cached content.
				newEl.innerHTML = cached_verses_top[--cached_count_top];
				
				page.insertBefore(newEl, child);
				
				/// The new content that was just added to the top of the page will push the other contents downward.
				/// Therefore, the page must be instantly scrolled down the same amount as the height of the content that was added.
				win.scrollTo(0, scroll_pos = (win.pageYOffset + newEl.clientHeight));
				
				/// Check to see if we need to add more content.
				setTimeout(add_content_top, lookup_speed_scrolling);
			} else {
				/// Did the user scroll all the way to the very top?  (If so, then there is no more content to be gotten.)
				if (scroll_maxed_top) {
					topLoader.style.visibility = "hidden";
					return null;
				}
				/// Get more content.
				run_search(PREVIOUS);
			}
		}
	}
	
	
	/**
	 * Finds and displays the range of verses visible on the screen.
	 *
	 * Find the verse that is at the top of the page and at the bottom of the page window and
	 * display that range on the page and change the page title to indicate the verse range as well.
	 *
	 * @example	setTimeout(find_current_range, look_up_range_speed);
	 * @return	NULL.  The page is modified to reflect the verse range.
	 * @note	Called by scrolling(), resizing(), write_verses(), or itself via setTimeout().
	 * @note	This function should be called every time the page is resized or scrolled or when visible content is added.
	 */
	function find_current_range()
	{
		/// Allow for this function to be called again via setTimeout().  See scrolling().
		looking_up_verse_range = false;
		
		///TODO: Determine if there is a better way to calculate the topBar offset.
		var top_pos = scroll_pos + topLoader.offsetHeight + 8,
			bottom_pos = scroll_pos + doc_docEl.clientHeight - 14,
			top_verse_block = find_element_at_scroll_pos(top_pos, page),
			verse1_el, verse2_el, verse1, v1, c1, b1, verse2, v2, c2, b2,
			bottom_verse_block, ref_range, new_title;
		
		/// Is the top verse block not found?
		if (top_verse_block === null) {
			///NOTE: There appears to be no verses displayed on the screen.
			///      Since they may still be being retrieved, so run this function again a little later.
			looking_up_verse_range = true;
			setTimeout(find_current_range, look_up_range_speed);
			return null;
		}
		
		bottom_verse_block = find_element_at_scroll_pos(bottom_pos, null, top_verse_block);
		
		/// Is the bottom verse block not found?
		if (bottom_verse_block === null) {
			///NOTE: There are no verses at the bottom of the screen.
			///      Since they may still be being retrieved, so run this function again a little later.
			looking_up_verse_range = true;
			setTimeout(find_current_range, look_up_range_speed);
			return null;
		}
		
		/// Find the verse elements.
		verse1_el = find_element_at_scroll_pos(top_pos, top_verse_block);
		verse2_el = find_element_at_scroll_pos(bottom_pos, bottom_verse_block);
		
		/// Are either of the verses not found?
		if (verse1_el === null || verse2_el === null) {
			///NOTE: It is possible for some padding to separate the verses.
			///      This is probably a temporary issue, so run this function again a little later.
			looking_up_verse_range = true;
			setTimeout(find_current_range, look_up_range_speed);
			return null;
		}
		
		/// parseInt() is used to keep the number and remove the trailing string from the id.  See write_verses().
		verse1 = parseInt(verse1_el.id);
		v1 = verse1 % 1000;
		c1 = ((verse1 - v1) % 1000000) / 1000;
		b1 = (verse1 - v1 - c1 * 1000) / 1000000;
		verse2 = parseInt(verse2_el.id);
		v2 = verse2 % 1000;
		c2 = ((verse2 - v2) % 1000000) / 1000;
		b2 = (verse2 - v2 - c2 * 1000) / 1000000;
		
		/// The titles in the book of Psalms are referenced as verse zero (cf. Psalm 3).
		v1 = v1 == 0 ? lang.title : v1;
		v2 = v2 == 0 ? lang.title : v2;
		
		///NOTE: \u2013 is Unicode for the en dash (–) (HTML: &ndash;).
		///TODO: Determine if the colons should be language specified.
		/// Are the books the same?
		if (b1 == b2) {
			/// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
			b1 = b1 == 19 ? lang.psalm : lang.books_short[b1];
			/// Are the chapters the same?
			if (c1 == c2) {
				/// Are the verses the same?
				if (v1 == v2) {
					ref_range = b1 + " " + c1 + ":" + v1;
				} else {
					ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + v2;
				}
			} else {
				ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + c2 + ":" + v2;
			}
		} else {
			/// The book of Psalms is refereed to differently (e.g., Psalm 1:1, rather than Chapter 1:1).
			b1 = b1 == 19 ? lang.psalm : lang.books_short[b1];
			b2 = b2 == 19 ? lang.psalm : lang.books_short[b2];
			ref_range = b1 + " " + c1 + ":" + v1 + "\u2013" + b2 + " " + c2 + ":" + v2;
		}
		
		/// last_type is set in prepare_new_search().
		/// The verse range is displayed differently based on the type of search (i.e., a verse look up or a regular search).
		if (last_type == VERSE_LOOKUP) {
			new_title = ref_range + " - " + lang.app_name;
		} else {
			new_title = last_search + " (" + ref_range + ") - " + lang.app_name;
		}
		
		/// Is the new verse range the same as the old one?
		/// If they are the same, updating it would just waste resources.
		if (doc.title != new_title) {
			doc.title = new_title;
			
			/// Display the verse range on the page if looking up verses.
			///FIXME: There should be a variable that shows the current view mode and not rely on last_type.
			if (last_type == VERSE_LOOKUP) {
				///TODO: Find a better way to clear infoBar than innerHTML.
				infoBar.innerHTML = "";
				infoBar.appendChild(doc.createTextNode(ref_range));
			}
		}
		
		return null;
	}
	
	
	/**
	 * Find an element that is within a certain Y position on the page.
	 *
	 * @example	element = find_element_at_scroll_pos(scroll_pos, page);
	 * @param	the_pos		(number) The vertical position on the page.
	 * @param	parent_el	(object) The DOM element to search inside of.
	 * @return	DOM element that is within the specified position of the page.
	 * @note	Called by find_current_range().
	 * @note	This is a helper function to find_current_range().
	 */
	function find_element_at_scroll_pos(the_pos, parent_el, el)
	{
		var el_start_at, el_offset_top, el_offset_height, looked_next, looked_previous;
		/// Is the starting element unknown?
		if (!el) {
			/// Make an educated guess as to which element to start with to save time.
			el_start_at = Math.round(parent_el.childNodes.length * (the_pos / doc_docEl.scrollHeight));
			if (el_start_at < 1) el_start_at = 1;
			el = parent_el.childNodes[el_start_at - 1];
		} else {
			/// We may need the parent_el if the_pos is below all of the elements.
			parent_el = el.parentNode;
		}
		
		/// Were no elements found?  (If so, then there is nothing to do.)
		if (!el) return null;
		
		looked_next = false;
		looked_previous = false;
		
		do {
			el_offset_top = el.offsetTop;
			el_offset_height = el.offsetHeight + el_offset_top;
			
			/// Is the element somewhere between the position in question?
			if (the_pos >= el_offset_top && the_pos <= el_offset_height) {
				/// The element was found.
				return el;
			} else {
				/// Is the position in question lower?
				if (the_pos > el_offset_top) {
					 el = el.nextSibling;
					 looked_next = true;
				} else {
					 el = el.previousSibling;
					 looked_previous = true
				}
				/// Is it stuck in an infinite loop?  (If so, then give up.)
				if (looked_next && looked_previous) return null;
			}
		} while (el !== null);
		
		/// Was the position in question to high for all of the elements?
		if (looked_next) {
			/// If there are no elements left (e.g., by scrolling all the way to the bottom) return the last element.
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
	 * @return	NULL.  Calls other functions
	 * @note	Called when the window is resized.
	 * @note	Set via window.onresize = resizing.
	 */
	function resizing()
	{
		setTimeout(add_content_bottom, lookup_speed_scrolling);
		setTimeout(add_content_top, lookup_speed_scrolling);
		
		/// If it is not doing so already, check to see if the range of visible verses has changed.
		if (!looking_up_verse_range) {
			looking_up_verse_range = true;
			setTimeout(find_current_range, look_up_range_speed);
		}
	}
	
	/******************************
	 * End of Scrolling functions *
	 ******************************/
	
	
	/**
	 * Send an Ajax request to the server.
	 *
	 * @example	post_to_server("search.php", "q=search", ajax);
	 * @example	post_to_server("search.php", "q=search&s=48003027", ajax);
	 * @param	server_URL	(string) The file on the server to run.
	 * @param	message		(string) The variables to send.  URI format: "name1=value1&name2=value%202"
	 * @param	ajax		(object) The Ajax object that preforms the query.
	 * @return	NULL.  Queries server and then performs an action with the received JSON array.
	 * @note	Called by run_search().
	 */
	function post_to_server(server_URL, message, ajax, handler)
	{
		///TODO: Consider whether GET could be better than POST.
		ajax.open("POST", server_URL, true);
		ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		ajax.onreadystatechange = function ()
		{
			if (ajax.readyState == 4) {
				if (ajax.status == 200) {
					/// This is run when the results are returned properly.
					///NOTE: JSON.parse() is at least currently (November 2009) twice as slow as eval(), and it does not work because of problems parsing the character combination slash plus single quote (\').  Two slashes may work.
					///TODO: Add error handling for parsing.
					handler(eval(ajax.responseText));
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
}
