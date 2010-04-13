<?php

/**
 * BibleForge
 *
 * @date	1-25-10
 * @version	0.2 alpha
 * @link	http://BibleForge.com
 * @license	Reciprocal Public License 1.5 (RPL1.5)
 * @author	BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

//$_REQUEST['q'] = 'for God so';

/// Prepare the query for the Sphinx search.
if (($break_point = strpos($_REQUEST['q'], ' ')) === false) {
    $query = $_REQUEST['q'] . '*';
} else {
    //$query = substr($_REQUEST['q'], 0, $break_point) . ' "' . substr($_REQUEST['q'], $break_point + 1) . '*"';
    $query = substr($_REQUEST['q'], 0, $break_point) . ' "' . $_REQUEST['q'] . '*"';
}
//echo $query;

require_once 'config.php';

require_once 'functions/standard_search.php';
$search_res = standard_search($query, ADDITIONAL, LIMIT_SUGGEST, 0, false);

if ($search_res[2] <= LIMIT_SUGGEST) {
    echo '[[', 3, '],[', $search_res[0], '],[', $search_res[1], ']]';
    die;
}

require_once 'functions/' . SPHINX_API . '.php';

$sphinx = new SphinxClient();
$sphinx->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
$sphinx->SetLimits(0, 10); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))

$sphinx->SetMatchMode(SPH_MATCH_EXTENDED); /// Most complex (and slowest?).
$sphinx->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order BY id.

$sphinx->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest

/// Run Sphinx search.
/// What is the best way to do this?
//$sphinx_res = $sphinx->Query('^the << "God*" "the God*"', 'suggestions_english');

$sphinx_res = $sphinx->Query('^' . $query, 'suggestions_english');

//echo "<pre>";print_r($sphinx_res);
/// If no results found were found, send an empty JSON result.
if ($sphinx_res['total'] == 0) {
    echo '[[', 3, '],[],[],[0]]';
    die;
}

$simple_matches = implode(',', array_keys($sphinx_res['matches']));

/// Get verses from the MySQL database.
require_once 'functions/database.php';
connect_to_database();

$SQL_query	= 'SELECT text, hits FROM ' . 'suggestions_english' . ' WHERE id IN (' . $simple_matches . ')';
$SQL_res	= mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);

/// Convert SQL results into one comma delineated string.
$verses_str	= "";
$hits_str	= "";
while ($row = mysql_fetch_assoc($SQL_res)) {
    $verses_str	.= '"' . $row['text'] . '",';
    $hits_str	.= $row['hits'] . ',';
}

/// Send results to the buffer as a JSON serialized array, and stop execution.
/// Array Format: [[action,direction],[verse_ids,...],[verse_words,...],number_of_matches]
///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
///TODO: It would be nice to indicate if there are no more verses to find when it gets to the end.
///TODO: Make the JSON work with both eval() and JSON.parse().  The \' throws it off.  But \\' works.
echo '[[', 3, '],[', $simple_matches, '],[', rtrim($verses_str, ','), '],[', rtrim($hits_str, ','), ']]';
