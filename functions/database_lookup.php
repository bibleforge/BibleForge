<?php

/**
 * BibleForge
 *
 * @date    1-30-10
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * Retrieve verses from the MySQL database.
 *
 * @example retrieve_verses(1001001, ADDITIONAL, 40);
 * @example retrieve_verses(40000100, PREVIOUS, LIMIT);
 * @param   $verse_id   (integer) The verse id from which to begin retrieving.
 * @param   $direction  (integer) The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param   $limit      (integer) The maximum number of verses to return.
 * @return  NULL.       Data is sent to the buffer as a JSON array, and then execution ends.
 * @note    Called by run_search().
 */
function retrieve_verses($verse_id, $direction, $limit, $in_paragraphs = true)
{
    /// Quickly check to see if the verse_id is outside of the valid range.
    ///TODO: Determine if $verse_id < 1001001 should default to 1001001 and $verse_id > 66022021 to 66022021.
    ///TODO: 66022021 may need to be language dependant because different langauges have different verse breaks.
    if ($verse_id < 1001001 || $verse_id > 66022021) {
        echo '[[],[],[0]]';
        die;
    }
    
    ///NOTE: To get PREVIOUS verses, we need to sort the database by id in reverse order because
    ///      chapter and book boundaries are not predictable (i.e., we can't just say "WHERE id >= id - LIMIT").
    
    if ($direction == ADDITIONAL) {
        $operator = '>=';
        $order_by = '';
    } else {
        $operator = '<=';
        ///NOTE: Leading space is needed in case the preceeding variable does end with whitespace.
        $order_by = ' ORDER BY id DESC';
    }
    
    require_once 'functions/database.php';
    connect_to_database();
    
    if ($in_paragraphs) {
        /// The longest paragraph in the English version is 57 verses.  By adding 32 we can be
        /// confident that it will always grab plenty of verses.
        /// Therefore, the limit must be at least that long because paragraphs cannot be split.
        ///TODO: Determine if 58 should be stored in a config file or variable somewhere (maybe in a builder).
        $limit          = 90;
        $minimum_verses = 32;
        $extra_fields   = ', paragraph';
    } else {
        $extra_fields = "";
    }
    
    $SQL_query  = 'SELECT id, words' . $extra_fields . ' FROM ' . BIBLE_VERSES . ' WHERE id ' . $operator . (int)$verse_id . $order_by . ' LIMIT ' . $limit;
    
    ///NOTE: Unbuffered queries start returning data as soon as the first row is available;
    ///      however, when the PHP script ends, if all of the data has not been fetched,
    ///      PHP will fetch all of the rest of the verses.  Therefore, the PHP script does not
    ///      end any sooner than with unbuffered queries, but is might be able to start sending data
    ///      back to the client sooner.
    ///TODO: Determine the best way to query the database: consider mysql_query() vs mysql_unbuffered_query(),
    ///      as well as mysqli_store_result() plus mysql_use_result().
    $SQL_res = mysql_unbuffered_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
    
    
    if ($in_paragraphs) {
        $verse_HTML    = array();
        $verse_numbers = array();
        $paragraphs    = array();
        
        $verse_count = 0;
        $break_after = false; 
        
        while ($row = mysql_fetch_assoc($SQL_res)) {
            if ($row['paragraph']) {
                /// Did it find enough verses to send to the browser.
                if ($verse_count > $minimum_verses) {
                    /// The first verse should be at a paragraph beginning, and the last verse
                    /// should be just before one. Therefore, when looking up previous verses,
                    /// we must get this verse (because previous lookups are in reverse).
                    /// So, additional lookups should stop now because the next verse is at the
                    /// beginning of a paragraph, but previous lookups need to get this last verse,
                    /// which is actually the first verse (because the arrays will be reversed shortly).
                    if ($direction == PREVIOUS) {
                        $break_after = true;
                    } else {
                        break;
                    }
                }
            }
            
            $verse_HTML[]    = $row['words'];
            $verse_numbers[] = $row['id'];
            $paragraphs[]    = $row['paragraph'];
            
            if ($break_after) {
                break;
            }
            ++$verse_count;
        }
        
        if ($direction == PREVIOUS) {
            /// When looking up previous verses, the results are returned by the database in reverse,
            /// so they must be reversed (put in correct order) before being sent to the client.
            krsort($verse_HTML);
            krsort($verse_numbers);
            krsort($paragraphs);
        }
        
        ///FIXME: handle_new_verses() in js/main.js is expecting the total number of verses, not success/fail for the last value.
        echo '{n:[', implode(',', $verse_numbers), '],v:["', implode('","', $verse_HTML), '"],p:[', implode(',', $paragraphs), '],t:1}';
        
        /// Flush the results to the server as quickly as possible because it may take a while for the 
        /// script to end because it has to fetch and clear the MySQL buffer.
        ///TODO: Determine the best way to flush the output buffer (and maybe write a function for it).
        @ob_flush();
        flush();
    } else {
        /// Convert SQL results into one comma delineated string for JSON.
        $verses_str = "";
        $verses_num = "";
        
        if ($direction == ADDITIONAL) {
            while ($row = mysql_fetch_assoc($SQL_res)) {
                $verses_str .= '"' . $row['words'] . '",';
                $verses_num .= $row['id'] . ',';
            }
        } else {
            while ($row = mysql_fetch_assoc($SQL_res)) {
                $verses_str = '"' . $row['words'] . '",' . $verses_str;
                $verses_num = $row['id'] . ',' . $verses_num;
            }
        }
        
        /// Send results to the buffer as a JSON serialized array, and stop execution.
        /// Array Format: [[verse_ids,...],[verse_words,...],[success]]
        ///NOTE:  rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
        ///TODO:  It would be nice to indicate if there are no more verses to find when it gets to the end.
        ///FIXME: handle_new_verses() in js/main.js is expecting the total number of verses, not sucess/fail for the last value.
        echo '[[', rtrim($verses_num, ','), '],[', rtrim($verses_str, ','), '],1]';
    }
    die;
}
