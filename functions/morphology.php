<?php

/**
 * BibleForge
 *
 * @date    11-08-09
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * Perform a morphological Sphinx-based search.
 *
 * @example morphology_search('["love", [[4,1]], [1]]', ADDITIONAL, 40, 0); /// love AS NOUN
 * @example morphology_search('["love", [[3,1], [7,1]], [1,0]]', ADDITIONAL, LIMIT, 0); /// love AS RED, NOT PRESENT
 * @example morphology_search('["", [[3,1], [9,3], [7,5]], [0,0,0]]', ADDITIONAL, 40, 0); /// * AS RED, IMPERATIVE, PERFECT
 * @param   $json		(string)				A stringified JSON array containing the word to be searched for, the morphological attributes to be considered, and whether or not to exclude results matching the morphological attributes.
 *                                              Format: '["WORD", [[MORPHOLOGICAL_CLASS, ATTRIBUTE], [...]], [EXCLUDE, ...]]'
 * @param   $direction  (integer)               The direction of the verses to be retrieved: ADDITIONAL || PREVIOUS.
 * @param   $limit      (integer)               The maximum number of verses to return.
 * @param   $start_id   (integer) (optional)    The morphological id whence to start.
 * @return  NULL.  Data is sent to the buffer as a JSON array, and then execution ends.
 * @note    Called in search.php.
 */
function morphology_search($json, $direction, $limit, $start_id = 0)
{
    /// Prepare Sphinx.
    require_once 'functions/' . SPHINX_API . '.php';
    $sphinx = new SphinxClient();
    $sphinx->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
    $sphinx->SetLimits(0, $limit); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))
    
    ///NOTE: The stop_id is now required for sphinxapi and should be calculated by the Forge, and could be set as a constant so that sphinxapi_cli is not slowed down by it.
    ///TODO: Calculate the stop_id in the Forge.
    if ($start_id > 0) {
        $sphinx->SetIDRange($start_id, 99999999); /// SetIDRange(start_id, stop_id)
    }
    
    $sphinx->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest
    /// Set the attributes and prepare to search.
    $query_array = json_decode($json, true);
    
    set_morphology_attributes($query_array[1], $query_array[2], $sphinx);
    
    /// Run Sphinx search.
    $sphinx_res = $sphinx->Query($query_array[0], 'morphological');
    
    /// If no results found were found, send an empty JSON result.
    ///FIXME: Sending an empty JSON is actually unnecessary if post_to_server() in main.js keeps track of the query.
    if ($sphinx_res['total'] == 0) {
        echo '0';
        die;
    }
    
    $verseid_arr = array();
    foreach ($sphinx_res['matches'] as $value) {
        $verseid_arr[] = $value['attrs']['verseid'];
    }
    
    $simple_matches = implode(',', array_unique($verseid_arr));
    
    $word_ids = implode(',', array_keys($sphinx_res['matches']));
    
    /// Get verses from the MySQL database.
    require_once 'functions/database.php';
    connect_to_database();
    
    $SQL_query = 'SELECT words FROM ' . BIBLE_VERSES . ' WHERE id IN (' . $simple_matches . ')';
    $SQL_res   = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
    
    /// Convert SQL results into one comma delineated string.
    $verses_str = "";
    while ($row = mysql_fetch_assoc($SQL_res)) {
        $verses_str .= '"' . $row['words'] . '",';
    }
    
    /// Send results to the buffer as a JSON serialized array, and stop execution.
    /// Array Format: [[verse_ids,...],[verse_words,...],number_of_matches,[word_id,...]]
    ///NOTE: rtrim(..., ',') removes trailing commas.  It seems to be slightly faster than substr(..., 0, -1).
    ///TODO: Indicate if there are no more verses to find when it gets to the end.
    echo '{"n":[', $simple_matches, '],"v":[', rtrim($verses_str, ','), '],"t":', $sphinx_res['total_found'], ',"i":[', $word_ids ,']}';
    die;
}


/**
 * Set the attributes to filter in Sphinx.
 *
 * @example set_morphology_attributes(array(array(3, 1), array(7, 1)), array(0, 1), $sphinx); /// Set Sphinx to only find words that are spoken by Jesus and not in the present tense.
 * @param   $attribute_arr  (array) An array of arrays containing two integers indicating the attribute to filter and the value with which to filter accordingly.
 * @param   $exclude_arr    (array) An array containing ones and zeros indicating whether to only find words that match the attributes (0) or exclude those words (1).
 * @param   $sphinx	        (class) The Sphinx API class to use to set the filters.
 * @return  NULL.  It sets the filters directly in Sphinx.
 * @note    Called by morphology_search().
 */
function set_morphology_attributes($attribute_arr, $exclude_arr, $sphinx)
{
    ///TODO: Determine if it would be good to do error handing if $attribute_arr is not an array.
    foreach ((array)$attribute_arr as $key => $morphology_arr) {
        ///NOTE: Created in the Forge via grammar_constants_parser.php on 12-22-2009 from Grammar Constants.txt.
        switch ($morphology_arr[0]) {
        case 1:
            $attr = 'implied';
            break;
        case 2:
            $attr = 'divine';
            break;
        case 3:
            $attr = 'red';
            break;
        case 4:
            $attr = 'part_of_speech';
            break;
        case 5:
            $attr = 'number';
            break;
        case 6:
            $attr = 'person';
            break;
        case 7:
            $attr = 'tense';
            break;
        case 8:
            $attr = 'voice';
            break;
        case 9:
            $attr = 'mood';
            break;
        case 10:
            $attr = 'gender';
            break;
        case 11:
            $attr = 'case_5';
            break;
        case 12:
            $attr = 'pronoun_type';
            break;
        case 13:
            $attr = 'degree';
            break;
        case 14:
            $attr = 'declinability';
            break;
        case 15:
            $attr = 'numerical';
            break;
        case 16:
            $attr = 'noun_type';
            break;
        case 17:
            $attr = 'type';
            break;
        case 18:
            $attr = 'dialect';
            break;
        case 19:
            $attr = 'transitivity';
            break;
        case 20:
            $attr = 'form';
            break;
        case 21:
            $attr = 'miscellaneous';
            break;
        default:
            ///TODO: Determine if an error should be thrown.
            /// Skip the invalid grammatical form.
            continue 2;
        }
        
        $sphinx->SetFilter($attr, array((int)$morphology_arr[1]), (bool)$exclude_arr[$key]);
    }
    ///TODO: When multiple morphological searches are allowed, add the word to the query.
    ///      Something like this: $sphinx->AddQuery($WORD, 'morphological');
}
