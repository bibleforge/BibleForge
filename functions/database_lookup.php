<?php

/**
 * BibleForge
 *
 * @date	1-30-10
 * @version	0.2 alpha
 * @link	http://BibleForge.com
 * @license	Reciprocal Public License 1.5 (RPL1.5)
 * @author	BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

/**
 * Retrieve verses from the MySQL database.
 *
 * @example	retrieve_verses(1001001, ADDITIONAL, 40);
 * @example	retrieve_verses(40000100, PREVIOUS, LIMIT);
 * @param	$verse_id	(integer) The verse id from which to begin retrieving.
 * @param	$direction	(integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param	$limit		(integer) The maximum number of verses to return.
 * @return	NULL.  Data is sent to the buffer as a JSON array, and then execution ends.
 * @note	Called by run_search().
 */
function retrieve_verses($verse_id, $direction, $limit)
{
	/// Quickly check to see if the verse_id is outside of the valid range.
	///TODO: Determine if $verse_id < 1001001 should default to 1001001 and $verse_id > 66022021 to 66022021.
	if ($verse_id < 1001001 || $verse_id > 66022021) {
		echo '[[],[],[0]]';
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
	
	$SQL_query	= 'SELECT id, words FROM ' . BIBLE_VERSES . ' WHERE id ' . $operator . (int)$verse_id . $order_by . ' LIMIT ' . $limit;
	$SQL_res	= mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
	
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
	/// Array Format: [[verse_ids,...],[verse_words,...],[success]]
	///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
	///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
	echo '[[', rtrim($verses_num, ','), '],[', rtrim($verses_str, ','), '],[1]]';
	die;
}
