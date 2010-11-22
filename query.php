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

/// Prepare for search.

///TODO: Compare POST vs GET vs REQEUST.
if (isset($_REQUEST['q'])) {
    $query = $_REQUEST['q'];
} else {
    /// $_REQUEST['q'] is required.
    die;
}

if (isset($_REQUEST['t'])) {
    $type = $_REQUEST['t'];
} else {
    die;
}

/// Which verse should the search start on?
///NOTE: Not used with VERSE_LOOKUP.
///TODO: Determine if this can be moved so that it does not always run.
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

/******************
 * Run the query. *
 ******************/

if ($type == VERSE_LOOKUP) {
    require_once 'functions/database_lookup.php';
    
    /// Should verses be returned in paragraph form?
    if (isset($_REQUEST['p'])) {
        $in_paragraphs = (bool)$_REQUEST['p'];
    } else {
        $in_paragraphs = true;
    }
    
    /// Should the server assume that the starting verse is not at a paragraph break
    /// so it should figure out where the paragraph begins.
    ///NOTE: Currently, this is only needed when the client preforms the initial verse lookup.
    if (isset($_REQUEST['f'])) {
        $find_paragraph_start = (bool)$_REQUEST['f'];
    } else {
        $find_paragraph_start = false;
    }
    
    /// $query example: 1001001 or 43003016
    retrieve_verses($query, $direction, LIMIT, $in_paragraphs, $find_paragraph_start);
    
} elseif ($type == STANDARD_SEARCH) {
    require_once 'functions/standard_search.php';
    
    /// $query example: love or God & love or this -that or "in the beginning"
    standard_search($query, $direction, LIMIT, $start_id);
    
} else { /// MORPHOLOGICAL_SEARCH
    require_once 'functions/morphology.php';
    
    /// $query example: '["love", [[4,1]], [1]]' (love AS NOUN) or '["love", [[3,1], [7,1]], [1,0]]' (love AS RED, NOT PRESENT)
    morphology_search($query, $direction, LIMIT, $start_id);
}
