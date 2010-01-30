<?php

/**
 * BibleForge
 *
 * @date    1-30-10
 * @version 0.2 alpha
 * @link http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

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
 * @note Called in search.php.
 */
function standard_search($query, $direction, $start_id = 0, $output_JSON = true)
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
			/// Since we want the verses in cannonical order, we need to sort the results by id, not based on weight.
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
	///FIXME: Sending an empty JSON is actually unnecesary if post_to_server() in main.js keeps track of the query.
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
	
	if ($output_JSON) {
		/// Send results to the buffer as a JSON serialized array, and stop execution.
		/// Array Format: [[action,direction],[verse_ids,...],[verse_words,...],number_of_matches]
		///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
		///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
		///TODO: Make the JSON work with both eval() and JSON.parse().  The \' throws it off.  But \\' works.
		echo '[[', STANDARD_SEARCH, ',', $direction, '],[', $simple_matches, '],[', rtrim($verses_str, ','), '],', $sphinx_res['total_found'], ']';
		die;
	} else {
		return array($simple_matches, rtrim($verses_str, ','));
	}
}
