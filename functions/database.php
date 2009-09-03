<?php

/**
 * BibleForge (alpha testing)
 *
 * @date    10-30-08
 * @version 0.1 alpha 2
 * @link http://www.BibleForge.com
 */

require_once 'config.php';

/// Define table constants.
///NOTE: Not used, I think.
///FIXME: Should be set in a lanaguge file or something like that.
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

?>
