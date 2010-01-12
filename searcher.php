<?php

/**
 * BibleForge
 *
 * @date    10-30-08
 * @version 0.2 alpha
 * @link http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

error_reporting(E_ALL);

///NOTE: This is just for compatibilities sake.  Magic Quotes should be turned off and this code should be removed.
if (get_magic_quotes_gpc()) {
    function stripslashes_deep($value)
    {
        $value = is_array($value) ? array_map('stripslashes_deep', $value) : stripslashes($value);
        return $value;
    }

    $_POST = array_map('stripslashes_deep', $_POST);
    $_GET = array_map('stripslashes_deep', $_GET);
    $_COOKIE = array_map('stripslashes_deep', $_COOKIE);
    $_REQUEST = array_map('stripslashes_deep', $_REQUEST);
}

///FIXME: The language needs to be determined somehow (probably by the client).
define('BIBLE_VERSES', 'bible_english_html');

define('VERSE_LOOKUP', 1);
define('MIXED_SEARCH', 2);
define('STANDARD_SEARCH', 3);
define('MORPHOLOGICAL_SEARCH', 4);
define('ADDITIONAL', 1);
define('PREVIOUS', 2);

define('LIMIT', 40); ///FIXME: Where should this be defined?  Should it be defined?

/// Prepare for search.

///TODO: POST vs GET vs REQEUST
if (!isset($_REQUEST['q'])) {
	/// $_REQUEST['q'] is required.
	die;
} else {
	$query = $_REQUEST['q'];
}

if (isset($_REQUEST['t'])) {
	$type = $_REQUEST['t'];
} else {
	die;
}

/// Which verse should the search start on?
///NOTE: Not used with VERSE_LOOKUP.
if (isset($_REQUEST['s'])) {
	$start_id = (int)$_REQUEST['s'];
} else {
	$start_id = 0;
}

/// In what direction should the verses be retrieved?
if (isset($_REQUEST['d'])) {
	$direction = (int)$_REQUEST['d'];
} else {
	$direction = ADDITIONAL;
}


/// Preform search or lookup, and end execution.
run_search($query, $type, $direction, $start_id);


/**
 * Run a search.
 *
 * This is the first function to handle searches and verse lookups.
 * It figures out what type of search is being preformed and calls the corresponding functions.
 *
 * @example run_search(1001001, VERSE_LOOKUP, ADDITIONAL); /// Find verses starting with Genesis 1:1.
 * @example run_search(40000100, VERSE_LOOKUP, PREVIOUS); /// Find verses before the book of Matthew.
 * @example run_search("love", STANDARD_SEARCH, ADDITIONAL, 40000101); /// Search for the word "love" starting at Matthew 1:1.
 * @example run_search("God & love", STANDARD_SEARCH, ADDITIONAL); /// Find both words "God" and "love" in the same verse.
 * @example run_search('["love", [[4,1]], [0]]', MORPHOLOGICAL_SEARCH, ADDITIONAL); /// Find the word "love" only when it is used as a noun.
 * @param $query (string) The input to be searched for or a stringified JSON array for advanced searching.
 * @param $type (integer) The type of query: SEARCH || VERSE_LOOKUP.
 * @param $direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param $start_id (integer) (optional) The verse_id whence to start.
 * @return NULL.  Data is sent to the buffer.  Intended for AJAX requests.
 * @note The script should stop execution before this function ends.
 */
function run_search($query, $type, $direction, $start_id = 0)
{
	if ($type == VERSE_LOOKUP) {
		/// $query example: 1001001 OR 43003016
		retrieve_verses($query, $direction);
	} elseif ($type == STANDARD_SEARCH) {
		/// $query example: love OR God & love OR this -that OR "in the beginning"
		standard_search($query, $direction, $start_id);
	} else { /// MORPHOLOGICAL_SEARCH
		/// $query ex: '["love", [[4,1]], [1]]' (love AS NOUN) OR '["love", [[3,1], [7,1]], [1,0]]' (love AS RED, NOT PRESENT)
		morphology_search($query, $direction, $start_id);
	}
}


/**
 * Retrieve verses from the MySQL database.
 *
 * @example retrieve_verses($query, $direction);
 * @param $verse_id (integer) The verse id from which to begin retrieving.
 * @param $direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @return NULL.  Data is sent to the buffer as a JSON array, and then execution ends.
 * @note Called by run_search().
 */
function retrieve_verses($verse_id, $direction)
{
	/// Quickly check to see if the verse_id is outside of the valid range.
	///TODO: Determine if $verse_id < 1001001 should default to 1001001 and $verse_id > 66022021 to 66022021.
	if ($verse_id < 1001001 || $verse_id > 66022021) {
		echo '[[', VERSE_LOOKUP, ',', $direction, '],[],[],[0]]';
		die;
	}
	
	///NOTE: To get PREVIOUS verses, we need to sort the database by id in reverse order because
	///      chapter and book boundaries are not predictable (i.e., we can't just say "WHERE id >= id - LIMIT").
	
	if ($direction == ADDITIONAL) {
		$operator = '>=';
		$order_by = '';
	} else {
		$operator = '<=';
		$order_by = ' ORDER BY id DESC';
	}
	
	require_once 'functions/database.php';
	connect_to_database();
	
	$SQL_query = 'SELECT id, words FROM ' . BIBLE_VERSES . ' WHERE id ' . $operator . (int)$verse_id . $order_by . ' LIMIT ' . LIMIT;
	$SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
	/// Convert SQL results into one comma delineated string for JSON.
	$verses_str = "";
	$verses_num = "";
	
	if ($direction == ADDITIONAL) {
		while ($row = mysql_fetch_assoc($SQL_res)) {
			$verses_str .= '"' . $row['words'] . '",';
			$verses_num .= $row['id'] . ',';
		}
	} else {
		while ($row = mysql_fetch_assoc($SQL_res)) {
			$verses_str = '"' . $row['words'] . '",' . $verses_str;
			$verses_num = $row['id'] . ',' . $verses_num;
		}
	}
	
	/// Send results to the buffer as a JSON serialized array, and stop execution.
	/// Array Format: [[action],[verse_ids,...],[verse_words,...],[success]]
	///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
	///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
	echo '[[', VERSE_LOOKUP, ',', $direction, '],[', rtrim($verses_num, ','), '],[', rtrim($verses_str, ','), '],[1]]';
	die;
}


///TODO: Determine the performance cost of creating functions for the code overlap between the two function (standard_search() and morphology_search()).
/**
 * Perform a standard Sphinx-based search.
 *
 * This function queries the Sphinx server and retrieves the verses from the MySQL server.
 *
 * @example standard_search("love", ADDITIONAL, 0);
 * @param $query (string) The query to be searched for.
 * @param $direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param $start_id (integer) (optional) The verse_id whence to start.
 * @return NULL.  Data is sent to the buffer as a JSON array, and then execution ends.
 * @note Called by run_search().
 */
function standard_search($query, $direction, $start_id = 0)
{
	require_once 'config.php';
	
	require_once 'functions/' . SPHINX_API . '.php';
	
	$sphinx = new SphinxClient();
	$sphinx->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
	$sphinx->SetLimits(0, LIMIT); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))
	
	///NOTE: The stop_id is now required for sphinxapi and should be calculated by the Forge, and could be set as a constant so that sphinxapi_cli is not slowed down by it.
	///TODO: Calculate the stop_id in the Forge.
	if ($start_id > 0) $sphinx->SetIDRange($start_id, 99999999); /// SetIDRange(start_id, stop_id (0 means no limit))
	
	/// Determine the search mode.
	/// Default is SPH_MATCH_ALL (i.e., all words are required: word1 & word2).
	/// SPH_MATCH_ALL should be the fastest and needs no sorting.
	
	/// Is there more than one word?
	///FIXME: These could be one word with a hyphen (e.g., -bad).  However, this search would cause an error, currently.
	if (strpos($query, ' ') !== false) {
			/// Are there more than 10 search terms in the query, or does the query contains double quotes (")?
		if (strpos($query, '"') !== false || substr_count($query, ' ') > 9) {
			///NOTE: Could use the more accurate (preg_match('/([a-z-]+[^a-z-]+){11}/i', $query) == 1) to find word count, but it is slower.
			/// By default, other modes stop at 10, but SPH_MATCH_EXTENDED does more (256?).
			/// Phrases (words in quotes) require SPH_MATCH_EXTENDED mode.
			///NOTE: SPH_MATCH_BOOLEAN is supposed to find more than 10 words too but doesn't seem to.
			$sphinx->SetMatchMode(SPH_MATCH_EXTENDED); /// Most complex (and slowest?).
			$sphinx->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		/// Are boolean operators present.
		///NOTE: The query string must have at least one character in order to use $query[0]; otherwise isset($query[0]) is needed.
		} elseif (strpos($query, '&') !== false || strpos($query, '|') !== false || strpos($query, ' -') !== false || $query[0] == '-') {
			$sphinx->SetMatchMode(SPH_MATCH_BOOLEAN);
			$sphinx->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		} else {
			/// Multiple words are being searched for but nothing else special.
			$sphinx->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		}
	}
	
	$sphinx->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest
	
	/// Run Sphinx search.
	$sphinx_res = $sphinx->Query($query, 'verse_text');
	
	/// If no results found were found, send an empty JSON result.
	if ($sphinx_res['total'] == 0) {
		echo '[[', STANDARD_SEARCH, ',', $direction, '],[],[],[0]]';
		die;
	}
	
	$simple_matches = implode(',', array_keys($sphinx_res['matches']));
	
	/// Get verses from the MySQL database.
	require_once 'functions/database.php';
	connect_to_database();
	
	$SQL_query = 'SELECT words FROM ' . BIBLE_VERSES . ' WHERE id IN (' . $simple_matches . ')';
	
	$SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
	/// Convert SQL results into one comma delineated string.
	$verses_str = "";
	while ($row = mysql_fetch_assoc($SQL_res)) {
		$verses_str .= '"' . $row['words'] . '",';
	}
	
	/// Send results to the buffer as a JSON serialized array, and stop execution.
	/// Array Format: [[action,direction],[verse_ids,...],[verse_words,...],number_of_matches]
	///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
	///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
	///TODO: Make the JSON work with both eval() and JSON.parse().  The \' throws it off.  But \\' works.
	echo '[[', STANDARD_SEARCH, ',', $direction, '],[', $simple_matches, '],[', rtrim($verses_str, ','), '],', $sphinx_res['total_found'], ']';
	die;
}


/**
 * Perform a morphological Sphinx-based search.
 *
 * @example morphology_search('["love", [[4,1]], [1]]', ADDITIONAL, 0); /// love AS NOUN
 * @example morphology_search('["love", [[3,1], [7,1]], [1,0]]', ADDITIONAL, 0); /// love AS RED, NOT PRESENT
 * @example morphology_search('["", [[3,1], [9,3], [7,5]], [0,0,0]]', ADDITIONAL, 0); /// * AS RED, IMPERATIVE, PERFECT
 * @param $json (string) A stringified JSON array containing the word to be searched for, the morphological attributes to be considered, and whether or not to exclude results matching the morphological attributes.  
 *        Format: '["WORD", [[MORPHOLOGICAL_CLASS, ATTRIBUTE], [...]], [EXCLUDE, ...]]'
 * @param $direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param $start_id (integer) (optional) The morphological id whence to start.
 * @return NULL.  Data is sent to the buffer as a JSON array, and then execution ends.
 * @note Called by run_search().
 */
function morphology_search($json, $direction, $start_id = 0)
{
	require_once 'config.php';
	
	/// Prepare Sphinx.
	require_once 'functions/' . SPHINX_API . '.php';
	$sphinx = new SphinxClient();
	$sphinx->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
	$sphinx->SetLimits(0, LIMIT); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))
	
	///NOTE: The stop_id is now required for sphinxapi and should be calculated by the Forge, and could be set as a constant so that sphinxapi_cli is not slowed down by it.
	///TODO: Calculate the stop_id in the Forge.
	if ($start_id > 0) $sphinx->SetIDRange($start_id, 99999999); /// SetIDRange(start_id, stop_id)
	
	$sphinx->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest
	/// Set the attributes and prepare to search.
	$query_array = json_decode($json, true);
	
	require_once 'functions/morphology.php';
	set_morphology_attributes($query_array[1], $query_array[2], $sphinx);
	
	/// Run Sphinx search.
	$sphinx_res = $sphinx->Query($query_array[0], 'morphological');
	
	/// If no results found were found, send an empty JSON result.
	if ($sphinx_res['total'] == 0) {
		echo '[[', MORPHOLOGICAL_SEARCH, ',', $direction, '],[],[],[0]]';
		die;
	}
	
	$verseid_arr = array();
	foreach ($sphinx_res['matches'] as $value) {
		$verseid_arr[] = $value['attrs']['verseid'];
	}
	
	$simple_matches = implode(',', array_unique($verseid_arr));
	
	$word_ids = implode(',', array_keys($sphinx_res['matches']));
	
	/// Get verses from the MySQL database.
	require_once 'functions/database.php';
	connect_to_database();
	
	$SQL_query = 'SELECT words FROM ' . BIBLE_VERSES . ' WHERE id IN (' . $simple_matches . ')';
	$SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
	/// Convert SQL results into one comma delineated string.
	$verses_str = "";
	while ($row = mysql_fetch_assoc($SQL_res)) {
		$verses_str .= '"' . $row['words'] . '",';
	}
	
	/// Send results to the buffer as a JSON serialized array, and stop execution.
	/// Array Format: [[action,direction],[verse_ids,...],[verse_words,...],number_of_matches,[word_id,...]]
	///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
	///TODO: Indicate if there are no more verses to find when it gets to the end.
	echo '[[', MORPHOLOGICAL_SEARCH, ',', $direction, '],[', $simple_matches, '],[', rtrim($verses_str, ','), '],', $sphinx_res['total_found'], ',[', $word_ids ,']]';
	die;
}