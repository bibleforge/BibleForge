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

///FIXME: The Sphinx indices also need to determined for multiple languages.
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

if ($type == VERSE_LOOKUP) {
	/// $query example: 1001001 OR 43003016
	require_once 'functions/database_lookup.php';
	retrieve_verses($query, $direction);
} elseif ($type == STANDARD_SEARCH) {
	/// $query example: love OR God & love OR this -that OR "in the beginning"
	require_once 'functions/standard_search.php';
	standard_search($query, $direction, $start_id);
} else { /// MORPHOLOGICAL_SEARCH
	/// $query ex: '["love", [[4,1]], [1]]' (love AS NOUN) OR '["love", [[3,1], [7,1]], [1,0]]' (love AS RED, NOT PRESENT)
	require_once 'functions/morphology.php';
	morphology_search($query, $direction, $start_id);
}
