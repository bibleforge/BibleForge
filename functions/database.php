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

/**
 * Connect to the MySQL database
 *
 * @example connect_to_database();
 * @return  Database resource.
 * @note    Called by retrieve_verses() in functions/database_lookup.php, standard_search() in functions/standard_search.php, and grammatical_search() in functions/grammatical_search.php.
 */
function connect_to_database()
{
    ///NOTE: Global constants are set in config.php.
    $db = mysql_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);
    mysql_select_db(DB_NAME, $db);
    return $db;
}
