<?php

/**
 * BibleForge
 *
 * @date    01-06-10
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

echo 'Testing ' .$_REQUEST['w'];
