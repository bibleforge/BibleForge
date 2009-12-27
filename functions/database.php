<?php

/**
 * BibleForge
 *
 * @date    10-30-08
 * @version 0.1 alpha 2
 * @link http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

require_once 'config.php';

/// Define table constants.
///NOTE: Not used, I think.
///FIXME: Should be set in a language file or something like that.
define('bible_english', 'bible_english');
define('bible_verses', 'bible_english_html');
/**
 * Connect to the MySQL database
 *
 * @return Database resource.
 * @note Called by run_search() in searcher.php.
 */
function connect_to_database() {
	///TODO: Credentials should be set in a config file.
	$db = mysql_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);
	mysql_select_db(DB_NAME, $db);
	return $db;
}