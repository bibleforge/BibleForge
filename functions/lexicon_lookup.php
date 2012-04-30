<?php

/**
 * BibleForge
 *
 * @date    12-06-11
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * Retrieve lexical data from the database.
 *
 * @example retrieve_lexical_data(4); /// Retrieves the lexical data for the word "God" (i.e., the 4th word in the English Bible).
 * @param   $word_id (integer) The id of the word to be retrieved.
 * @return  NULL.    Data is sent to the buffer as a JSON array, and then execution ends.
 * @note    Called in query.php.
 */
function retrieve_lexical_data($word_id, $language)
{
    require_once 'functions/database.php';
    connect_to_database();
    
    /// Greek and Hebrew letters must be encoded in UTF8.
    mysql_query("SET NAMES 'utf8'");
    
    /// Create the query.
    /// Is the word from the Old Testament?
    ///TODO:  Determine if there is a better way to handle the different languages.
    ///FIXME: 621740 is just for the English version, so this needs to be dynamic when more languages are added.
    if ($word_id < 621740) {
        $SQL_query = 'SELECT `bible_original`.word, `bible_original`.pronun, `lexicon_hebrew`.* FROM `bible_' . $language['identifier'] . '`, `bible_original`, `lexicon_hebrew`, `morphology` WHERE `bible_' . $language['identifier'] . '`.id = ' . ((int)$word_id) . ' AND `bible_original`.id = `bible_' . $language['identifier'] . '`.orig_id AND lexicon_hebrew.strongs = `bible_original`.strongs LIMIT 1';
    } else {
        $SQL_query = 'SELECT `bible_original`.word, `bible_original`.pronun, `lexicon_greek`.*, `morphology`.* FROM `bible_' . $language['identifier'] . '`, `bible_original`, `lexicon_greek`, `morphology` WHERE `bible_' . $language['identifier'] . '`.id = ' . ((int)$word_id) . ' AND `bible_original`.id = `bible_' . $language['identifier'] . '`.orig_id AND lexicon_greek.strongs = `bible_original`.strongs AND `morphology`.id = `bible_original`.id LIMIT 1';
    }
    
    ///FIXME: Currently, BibleForge links words to the lexicon by Strong's numbers; however, this is too simplistic because some Strong's numbers have multiple entries.
    ///       So, there needs to be another identifier.
    $SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
    
    if (mysql_num_rows($SQL_res) === 0) {
        echo "{}";
    } else {
        $row = mysql_fetch_assoc($SQL_res);
        
        /// Convert some strings to JSON.
        $row['long_def'] = json_decode($row['long_def']);
        if ($row['see'] !== "") {
            $row['see'] = json_decode($row['see']);
        }
        
        /// array_filter($row) removes all empty (falsey) values from the array so that there is less data to send.
        echo json_encode(array_filter($row));
    }
    die;
}
