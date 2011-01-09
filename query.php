<?php

/**
 * BibleForge
 *
 * @date    10-30-08
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

///NOTE: This is just for compatibilities sake.  Magic Quotes should be turned off and this code should be removed.
if (get_magic_quotes_gpc()) {
    /**
     * Remove slashes inserted by Magic Quotes.
     *
     * @example	$_POST = stripslashes_deep($_POST);
     * @param	$value (array) The array to remove slashes from.
     * @return	The array with slashes removed.
     * @note	This is ultimately should be removed and Magic Quotes should be turned off.
     */
    function stripslashes_deep($value)
    {
        $value = is_array($value) ? array_map('stripslashes_deep', $value) : stripslashes($value);
        return $value;
    }

    $_POST		= array_map('stripslashes_deep', $_POST);
    $_GET		= array_map('stripslashes_deep', $_GET);
    $_COOKIE	= array_map('stripslashes_deep', $_COOKIE);
    $_REQUEST	= array_map('stripslashes_deep', $_REQUEST);
}

/// Load constants.
require_once 'config.php';

/// Query Variables:
/// d Direction (number)  The direction of the query (ADDITIONAL, PREVIOUS)      (lookup only)
/// f Find      (boolean) Whether or not to find a paragraph break to start at   (lookup only)
/// p Paragraph (boolean) Whether or not verses will be displayed in paragraphs  (lookup only)
/// q Query     (string)  The verse reference or search string to query
/// s Start At  (string)  The verse or word id at which to start the query       (search only)
/// t Type      (number)  The type of query (VERSE_LOOKUP, MIXED_SEARCH, STANDARD_SEARCH, GRAMMATICAL_SEARCH)

///TODO: Compare POST vs GET vs REQEUST.

if (!isset($_REQUEST['q']) || !isset($_REQUEST['t'])) {
    die;
}

/// In what direction should the verses be retrieved?
$_REQUEST['d'] = isset($_REQUEST['d']) ? (int)$_REQUEST['d'] : ADDITIONAL;

/******************
 * Run the query. *
 ******************/

if ($_REQUEST['t'] == VERSE_LOOKUP) {
    require_once 'functions/verse_lookup.php';
    
    /// Example query: 1001001 (Genesis) or 43003016 (John 3:16)
    retrieve_verses($_REQUEST['q'], $_REQUEST['d'], LIMIT, isset($_REQUEST['p']) ? (bool)$_REQUEST['p'] : true, isset($_REQUEST['f']) ? (bool)$_REQUEST['f'] : false);
    
} elseif ($_REQUEST['t'] == STANDARD_SEARCH) {
    require_once 'functions/standard_search.php';
    
    /// Example query: love or God & love or this -that or "in the beginning"
    standard_search($_REQUEST['q'], $_REQUEST['d'], LIMIT, isset($_REQUEST['s']) ? (int)$_REQUEST['s'] : 0);
    
} else { /// GRAMMATICAL_SEARCH
    require_once 'functions/morphology.php';
    
    /// Example query: '["love", [[4,1]], [1]]' (love AS NOUN) or '["love", [[3,1], [7,1]], [1,0]]' (love AS RED, NOT PRESENT)
    morphology_search($_REQUEST['q'], $_REQUEST['d'], LIMIT, isset($_REQUEST['s']) ? (int)$_REQUEST['s'] : 0);
}
