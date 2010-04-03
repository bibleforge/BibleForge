<?php

/**
 * BibleForge
 *
 * @date	10-30-08
 * @version	0.2 alpha
 * @link	http://BibleForge.com
 * @license	Reciprocal Public License 1.5 (RPL1.5)
 * @author	BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

/**
 * Connect to the MySQL database
 *
 * @example	connect_to_database();
 * @return	Database resource.
 * @note	Called by retrieve_verses() in functions/database_lookup.php, standard_search() in functions/standard_search.php, and morphology_search() in functions/morphology.php.
 */
function connect_to_database()
{
	///NOTE: Global constants are set in config.php.
	$db = mysql_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);
	mysql_select_db(DB_NAME, $db);
	return $db;
}
