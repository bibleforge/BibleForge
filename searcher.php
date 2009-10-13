<?php
/**
 * BibleForge (alpha testing)
 *
 * @date    10-30-08
 * @version 0.1 alpha 2
 * @link http://www.BibleForge.com
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
	die();
} else {
	$query = $_REQUEST['q'];
}

if (isset($_REQUEST['t'])) {
	$type = $_REQUEST['t'];
} else {
	///NOTE: The type is unknown, therefore attempt to determine what it should be.
	///      The type should always be set by the requester since it is faster.
	///      Not supported curently.
	die();
	/*
	$verse_id = parse_reference($query); ///FIXME Not implemented, and might not be needed.
	if ($verse_id === false) {
		$type = STANDARD_SEARCH;
		
		/// Which verse should searches start on?
		if (isset($_REQUEST['s'])) {
			$start_id = (int)$_REQUEST['s'];
		} else {
			$start_id = 0;
		}
	} else {
		$type = VERSE_LOOKUP;
		$start_id = 0;
	}
	*/
}

/// Which verse should searches start on?
///NOTE: Not used with VERSE_LOOKUP.
if (isset($_REQUEST['s'])) {
	$start_id = (int)$_REQUEST['s'];
} else {
	$start_id = 0;
}

/// In what direction should the verses be retrived?
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
 * @example run_search(1001001, VERSE_LOOKUP, ADDITIONAL);
 * @example run_search(40000101, VERSE_LOOKUP, PREVIOUS);
 * @example run_search("love", STANDARD_SEARCH, ADDITIONAL, 40000101);
 * @example run_search("God & love", STANDARD_SEARCH, ADDITIONAL);
 * @example run_search('["love","NOUN"]', MORPHOLOGICAL_SEARCH, ADDITIONAL);
 * @param $query (string) The input to be searched for.
 * @param $type (integer) The type of query: SEARCH || VERSE_LOOKUP.
 * @param $direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param $start_id (integer) (optional) The verse_id from whence to start.
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
		/// $query ex: '["love","NOUN"]' OR '["go","IMPERITIVE"]'
		morphology_search($query_array[0], $query_array[1], $direction, $start_id);
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
	///FIXME: Perhaps $verse_id < 1001001 should default to 1001001 and $verse_id > 66022021 to 66022021.
	if ($verse_id < 1001001 || $verse_id > 66022021) {
		echo '[[', VERSE_LOOKUP, ',', $direction, '],[],[],[0]]';
		die();
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
	
	$SQL_query = 'SELECT id, words FROM ' . bible_verses . ' WHERE id ' . $operator . (int)$verse_id . $order_by . ' LIMIT ' . LIMIT;
	$SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
	/// Convert SQL results into one comma deliniated string for JSON.
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
	///NOTE: JSON should ignore trailing commas.
	///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
	echo '[[', VERSE_LOOKUP, ',', $direction, '],[', $verses_num, '],[', $verses_str, '],[1]]';
	die();
}


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
	
	$cl = new SphinxClient();
	$cl->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
	$cl->SetLimits(0, LIMIT); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))
	
	if ($start_id > 0) $cl->SetIDRange($start_id, 0); /// SetIDRange(start_id, stop_id (0 means no limit))
	
	/// Determine the search mode.
	/// Default is SPH_MATCH_ALL (i.e., all words are required: word1 & word2).
	/// SPH_MATCH_ALL should be the fastest and needs no sorting.
	
	/// Is there more than one word?
	if (strpos($query, ' ') !== false) {		
		if (strpos($query, '"') !== false || substr_count($query, ' ') > 9) {
			///NOTE: Could use the more accurate (preg_match('/([a-z-]+[^a-z-]+){11}/i', $query) == 1) to find word count, but it is slower.
			/// There are more than 10 search terms in the query or the query contains double quotes (").
			/// By default, other modes stop at 10, but SPH_MATCH_EXTENDED does more (256?).
			/// Phrases (words in quotes) require SPH_MATCH_EXTENDED mode.
			///NOTE: SPH_MATCH_BOOLEAN is supposed to find more than 10 words too but doesn't seem to.
			$cl->SetMatchMode(SPH_MATCH_EXTENDED); /// Most complex (and slowest?).
			$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		} elseif (strpos($query, '&') !== false || strpos($query, '|') !== false || strpos($query, ' -') !== false || substr($query, 0, 1) == '-') {
			/// Boolean opperators found.
			$cl->SetMatchMode(SPH_MATCH_BOOLEAN);
			$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		} else {
			/// Multiple words are being searched for but nothing else special.
			$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		}
	}
	
	$cl->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest
	
	/// Run Sphinx search.
	$sphinx_res = $cl->Query($query, 'verse_text');
	
	/// If no results found were found, send an empty JSON result.
	if ($sphinx_res['simple-matches'] == "") {
		echo '[[', STANDARD_SEARCH, ',', $direction, '],[],[],[0]]';
		die();
	}
	
	/// Get verses from the MySQL database.
	require_once 'functions/database.php';
	connect_to_database();
	
	$SQL_query = 'SELECT words FROM ' . bible_verses . ' WHERE id IN (' . $sphinx_res['simple-matches'] . ')';
	$SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
	/// Convert SQL results into one comma deliniated string.
	$verses_str = "";
	while ($row = mysql_fetch_assoc($SQL_res)) {
		$verses_str .= '"' . $row['words'] . '",';
	}
	
	/// Send results to the buffer as a JSON serialized array, and stop execution.
	/// Array Format: [[action],[verse_ids,...],[verse_words,...],[number_of_matches]]
	///NOTE: JSON should ignore trailing commas.
	///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
	echo '[[', STANDARD_SEARCH, ',', $direction, '],[', $sphinx_res['simple-matches'], '],[', $verses_str, '],[', $sphinx_res['total_found'], ']]';
	die();
}


/**
 * Perform a morphological Sphinx-based search.
 *
 * @example morphology_search($query, $direction, $start_id);
 * @param $query (string) The query to be searched for.
 * @param $direction (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param $start_id (integer) (optional) The verse_id whence to start.
 * @return NULL.  Data is sent to the buffer as a JSON array, and then execution ends.
 * @note Called by run_search().
 */
function morphology_search($query, $direction, $start_id = 0)
{
	require_once 'config.php';
	
	require_once 'functions/' . SPHINX_API . '.php';
	
	$cl = new SphinxClient();
	$cl->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
	$cl->SetLimits(0, LIMIT); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))
	
	if ($start_id > 0) $cl->SetIDRange($start_id, 0); /// SetIDRange(start_id, stop_id (0 means no limit))
	
	/// Determine the search mode.
	/// Default is SPH_MATCH_ALL (i.e., all words are required: word1 & word2).
	/// SPH_MATCH_ALL should be the fastest and needs no sorting.
	
	/// Is there more than one word?
	if (strpos($query, ' ') !== false) {		
		if (strpos($query, '"') !== false || substr_count($query, ' ') > 9) {
			///NOTE: Could use the more accurate (preg_match('/([a-z-]+[^a-z-]+){11}/i', $query) == 1) to find word count, but it is slower.
			/// There are more than 10 search terms in the query or the query contains double quotes (").
			/// By default, other modes stop at 10, but SPH_MATCH_EXTENDED does more (256?).
			/// Phrases (words in quotes) require SPH_MATCH_EXTENDED mode.
			///NOTE: SPH_MATCH_BOOLEAN is supposed to find more than 10 words too but doesn't seem to.
			$cl->SetMatchMode(SPH_MATCH_EXTENDED); /// Most complex (and slowest?).
			$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		} elseif (strpos($query, '&') !== false || strpos($query, '|') !== false || strpos($query, ' -') !== false || substr($query, 0, 1) == '-') {
			/// Boolean opperators found.
			$cl->SetMatchMode(SPH_MATCH_BOOLEAN);
			$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		} else {
			/// Multiple words are being searched for but nothing else special.
			$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.
		}
	}
	
	$cl->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest
	
	/// Run Sphinx search.
	$sphinx_res = $cl->Query($query, 'verse_text');
	
	/// If no results found were found, send an empty JSON result.
	if ($sphinx_res['simple-matches'] == "") {
		echo '[[', MORPHOLOGICAL_SEARCH, ',', $direction, '],[],[],[0]]';
		die();
	}
	
	/// Get verses from the MySQL database.
	require_once 'functions/database.php';
	connect_to_database();
	
	$SQL_query = 'SELECT words FROM ' . bible_verses . ' WHERE id IN (' . $sphinx_res['simple-matches'] . ')';
	$SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
	/// Convert SQL results into one comma deliniated string.
	$verses_str = "";
	while ($row = mysql_fetch_assoc($SQL_res)) {
		$verses_str .= '"' . $row['words'] . '",';
	}
	
	/// Send results to the buffer as a JSON serialized array, and stop execution.
	/// Array Format: [[action],[verse_ids,...],[verse_words,...],[number_of_matches]]
	///NOTE: JSON should ignore trailing commas.
	///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
	echo '[[', MORPHOLOGICAL_SEARCH, ',', $direction, '],[', $sphinx_res['simple-matches'], '],[', $verses_str, '],[', $sphinx_res['total_found'], ']]';
	die();
}


/**
 * Parse a query to detime the book, chapter, and/or verse references.
 *
 * This is used to convert a query like "John 3:16" to the number 43003016.
 *
 * @example $verse_id = parse_reference($query);
 * @param $query (string) The input to be parsed.
 * @return Integer of book, chapter, and verses or FALSE if not a valid verse reference.
 * @note FIXME: Not yet implamented.  Handeled by Javascript; not needed?
 */
function parse_reference($query)
{
	return false;
}
