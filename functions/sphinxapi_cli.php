<?php

/**
 * BibleForge
 *
 * @date	09-23-09
 * @version	0.2 alpha
 * @link	http://BibleForge.com
 * @license	Reciprocal Public License 1.5 (RPL1.5)
 * @author	BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

/// Match modes
define('SPH_MATCH_ALL',			0);
define('SPH_MATCH_ANY',			1);
define('SPH_MATCH_PHRASE',		2);
define('SPH_MATCH_BOOLEAN',		3);
define('SPH_MATCH_EXTENDED',	4);
define('SPH_MATCH_FULLSCAN',	5);
define('SPH_MATCH_EXTENDED2',	6); /// Extended engine V2 (TEMPORARY, WILL BE REMOVED)

/// Ranking modes (ext2 only)
define('SPH_RANK_PROXIMITY_BM25',	0);	/// Default mode, phrase proximity major factor and BM25 minor one
define('SPH_RANK_BM25',				1);	/// Statistical mode, BM25 ranking only (faster but worse quality)
define('SPH_RANK_NONE',				2);	/// No ranking, all matches get a weight of 1
define('SPH_RANK_WORDCOUNT',		3);	/// Simple word-count weighting, rank is a weighted sum of per-field keyword occurrence counts

/// Sort modes
define('SPH_SORT_RELEVANCE',		0);
define('SPH_SORT_ATTR_DESC',		1);
define('SPH_SORT_ATTR_ASC',			2);
define('SPH_SORT_TIME_SEGMENTS',	3);
define('SPH_SORT_EXTENDED',			4);
define('SPH_SORT_EXPR',				5);

/// Filter types
define('SPH_FILTER_VALUES',		0);
define('SPH_FILTER_RANGE',		1);
define('SPH_FILTER_FLOATRANGE',	2);

/// Attribute types
define('SPH_ATTR_INTEGER',		1);
define('SPH_ATTR_TIMESTAMP',	2);
define('SPH_ATTR_ORDINAL',		3);
define('SPH_ATTR_BOOL',			4);
define('SPH_ATTR_FLOAT',		5);
define('SPH_ATTR_MULTI',		0x40000000);

/// Grouping functions
define('SPH_GROUPBY_DAY',		0);
define('SPH_GROUPBY_WEEK',		1);
define('SPH_GROUPBY_MONTH',		2);
define('SPH_GROUPBY_YEAR',		3);
define('SPH_GROUPBY_ATTR',		4);
define('SPH_GROUPBY_ATTRPAIR',	5);


/**
 * The Sphinx search client class
 * 
 * @example $sphinx = new SphinxClient();
 * @note Called by standard_search() in functions/standard_search.php and morphology_search() in functions/morphology.php.
 */
class SphinxClient
{
	private $_path;				/// Search path (default is 'search')
	private $_config;			/// Sphinx config file (default is '')
	
	private $_offset;			/// How many records to seek from result-set start (default is 0)
	private $_limit;			/// How many records to return from result-set starting at offset (default is 20)
	private $_mode;				/// Query matching mode (default is SPH_MATCH_ALL)
	private $_weights;			/// Per-field weights (default is 1 for all fields)
	private $_sort;				/// Match sorting mode (default is SPH_SORT_RELEVANCE)
	private $_sortby;			/// Attribute to sort by (default is "")
	private $_min_id;			/// Min ID to match (default is 0, which means no limit)
	private $_max_id;			/// Max ID to match (default is 0, which means no limit)
	private $_filters;			/// Search filters
	private $_groupby;			/// Group-by attribute name
	private $_groupfunc;		/// Group-by function (to pre-process group-by attribute value with)
	private $_groupsort;		/// Group-by sorting clause (to sort groups in result set with)
	private $_groupdistinct;	/// Group-by count-distinct attribute
	private $_maxmatches;		/// Max matches to retrieve
	private $_cutoff;			/// Cutoff to stop searching at (default is 0)
	private $_retrycount;		/// Distributed retries count
	private $_retrydelay;		/// Distributed retries delay
	private $_anchor;			/// Geographical anchor point
	private $_indexweights;		/// Per-index weights
	private $_ranker;			/// Ranking mode (default is SPH_RANK_PROXIMITY_BM25)
	private $_maxquerytime;		/// Max query time, milliseconds (default is 0, do not limit)
	private $_fieldweights;		/// Per-field-name weights
	
	private $_error;			/// Last error message
	private $_warning;			/// Last warning message
	
	private $_reqs;				/// Requests array for multi-query
	private $_mbenc;			/// Stored mbstring encoding
	private $_arrayresult;		/// Whether $result["matches"] should be a hash or an array
	private $_timeout;			/// Connect timeout
	
	
	/**
	 * Create a new client object and fill defaults.
	 * 
	 * @return NULL.  Default values are set.
	 * @note Called automatically when the class is created.
	 * @note The class is created by standard_search() and morphology_search() in search.php.
	 */
	function SphinxClient()
	{
		/// Per-client-object settings
		$this->_path		= 'search';
		$this->_config		= "";
		
		/// Per-query settings
		$this->_offset			= 0;
		$this->_limit			= 20;
		$this->_mode			= SPH_MATCH_ALL;
		$this->_weights			= array();
		$this->_sort			= SPH_SORT_RELEVANCE;
		$this->_sortby			= "";
		$this->_min_id			= 0;
		$this->_max_id			= 0;
		$this->_filters			= array();
		$this->_groupby			= "";
		$this->_groupfunc		= SPH_GROUPBY_DAY;
		$this->_groupsort		= '@group desc';
		$this->_groupdistinct	= "";
		$this->_maxmatches		= 1000;
		$this->_cutoff			= 0;
		$this->_retrycount		= 0;
		$this->_retrydelay		= 0;
		$this->_anchor			= array();
		$this->_indexweights	= array();
		$this->_ranker			= SPH_RANK_PROXIMITY_BM25;
		$this->_maxquerytime	= 0;
		$this->_fieldweights	= array();
		
		/// Per-reply fields (for single-query case)
		$this->_error		= "";
		$this->_warning		= "";
		$this->_reqs		= array(); /// Requests storage (for multi-query case)
		$this->_mbenc		= "";
		$this->_arrayresult	= false;
		$this->_timeout		= 0;
	}
	
	
	/**
	 * Set the search path and sphinx config file.
	 * 
	 * @example	$sphinx->SetServer(SPHINX_SERVER, SPHINX_PORT);
	 * @example	$sphinx->SetServer('search', 'sphinx.conf');
	 * @param	$path	(string) The path to the search executable file.  Default is "search."
	 * @param	$config	(string) The path to the config file for Sphinx.
	 * @return	NULL.
	 * @note	Called by standard_search() and morphology_search() in search.php.
	 */
	function SetServer($path, $config)
	{
		///NOTE: This function is just to be compatible with the default (searchd) api.
		///      There is no actual server.
		$this->_path   = $path;
		$this->_config = $config;
	}
	
	
	/**
	 * Set the id range to match.
	 * 
	 * Only match records if document ID is between $min and $max (inclusive).
	 * 
	 * @example	$sphinx->SetIDRange($start_id, 0);
	 * @param	$min (integer) The lowest id to be returned.
	 * @param	$max (integer) The highest id to be returned.  If 0 then there is no upper limit.
	 * @return	NULL.
	 * @note	Called by standard_search() and morphology_search() in search.php.
	 */
	function SetIDRange($min, $max)
	{
		$this->_min_id = $min;
		$this->_max_id = $max;
	}
	
	 
	/**
	 * Set offset and count into result set, and optionally set max-matches and cutoff limits.
	 * 
	 * @example	$sphinx->SetLimits(0, LIMIT);
	 * @param	$offset	(integer) 				The result to start at.
	 * @param	$limit	(integer)				The number of results to return.
	 * @param	$max	(integer) (optional)	The maximum overall number of results to find internally in Sphinx.
	 * @param	$cutoff	(integer) (optional)	The threshold of results to stop searching after.
	 * @return	NULL.
	 * @note	Called by standard_search() and morphology_search() in search.php.
	 */
	function SetLimits($offset, $limit, $max = 0, $cutoff = 0)
	{
		$this->_offset = $offset;
		$this->_limit  = $limit;
		if ($max > 0) {
			$this->_maxmatches = $max;
		}
		if ($cutoff > 0) {
			$this->_cutoff = $cutoff;
		}
	}
	
	
	/**
	 * Set the matching mode.
	 * 
	 * @example	$sphinx->SetMatchMode(SPH_MATCH_EXTENDED);
	 * @param	$mode (integer) The mode to search with.  The default is SPH_MATCH_ALL.
	 * @return	NULL.
	 * @note	Called by standard_search() and morphology_search() in search.php.
	 */
	function SetMatchMode($mode)
	{
		$this->_mode = $mode;
	}
	
	
	/**
	 * Set the sorting mode.
	 * 
	 * @example	$sphinx->SetSortMode(SPH_SORT_EXTENDED, '@id ASC');
	 * @param	$mode	(integer)			The search mode to use.  The default is SPH_SORT_RELEVANCE.
	 * @param	$sortby	(string) (optional)	The search expression to use.
	 * @return	NULL.
	 * @note	Called by standard_search() in search.php.
	 */
	function SetSortMode($mode, $sortby = "")
	{
		$this->_sort   = $mode;
		$this->_sortby = $sortby;
	}
	
	
	/**
	 * Set the ranking mode.
	 *  
	 * @example	$sphinx->SetRankingMode(SPH_RANK_NONE);
	 * @param	$ranker (integer) The ranking mode to use.  The default is SPH_RANK_PROXIMITY_BM25.
	 * @return	NULL.
	 * @note	Called by standard_search() and morphology_search() in search.php.
	 */
	function SetRankingMode($ranker)
	{
		$this->_ranker = $ranker;
	}
	
	
	/**
	 * Set values to filter the attributes with.
	 * 
	 * Only match records where $attribute value is in given set.
	 * 
	 * @example	$sphinx->SetFilter($attr, array((int)$morphology_arr[1]), (bool)$include_arr[$key]);
	 * @example	$sphinx->SetFilter('tense', array(1), false); /// This finds words that are in the present tense.
	 * @param	$attribute	(string)				The attribute to filter.
	 * @param	$values		(array)					An array of values (integers) to filter the attribute with.
	 * @param	$exclude	(boolean) (optional)	Whether to find only words that match the values or only words that do not match.
	 * @return	NULL.
	 * @note	Called by set_morphology_attributes() in functions/morphology.php.
	 */
	function SetFilter($attribute, $values, $exclude = false)
	{
		if (is_array($values) && count($values)) {
			$this->_filters[] = array('type' => SPH_FILTER_VALUES, 'attr' => $attribute, 'exclude' => $exclude, 'values' => $values);
		}
	}
	
	
	/**
	 * Execute the "search" executable, run the given query through the given indices, and return the result.
	 * 
	 * Only match records where $attribute value is in given set.
	 * 
	 * @example	$sphinx_res = $sphinx->Query($query, 'index');
	 * @example	$sphinx_res = $sphinx->Query('love', 'verse_text'); /// Do a simple search for the word "love."
	 * @param	$query		(string)			The string to search for.
	 * @param	$index		(string) (optional)	The index to use.  The default is "*" which searches through all indices.
	 * @param	$comment	(string) (optional)	Comments are recorded in the query log and are placed in square brackets to be used for debugging purposes.
	 * @return	NULL.
	 * @note	Called by standard_search() and morphology_search() in search.php.
	 */
	function Query($query, $index = '*', $comment = "")
	{
		$extra_regex	= "";
		$error_message	= "";
		
		///FIXME: The options should be applied when the corresponding functions are called, not when Query() is called.
		$options =	' -q';
		$options .=	' -l ' . $this->_limit;
		$options .=	' -s "@id ASC"';
		
		if (isset($this->_filters) && is_array($this->_filters)) {
			foreach ($this->_filters as $values) {
				$options .= ' -f ' . $values['attr'] . ' ' . $values['values'][0];
			}
		}
		
		if ($this->_mode == SPH_MATCH_ANY) {
			$options .= ' -a';
		} elseif ($this->_mode == SPH_MATCH_PHRASE) {
			$options .= ' -p';
		} elseif ($this->_mode == SPH_MATCH_BOOLEAN) {
			$options .= ' -b';
		} elseif ($this->_mode == SPH_MATCH_EXTENDED) {
			///NOTE: It may be better to use -e2.
			$options .= ' -e';
		} elseif ($this->_mode == SPH_MATCH_EXTENDED2) {
			$options .= ' -e2';
		}
		
		/// Was the min_id or max_id set?
		if ($this->_min_id > 0 || $this->_max_id > 0) {
			///NOTE: This is an ugly way to get around the issue of the search executable not being able to set the min and max ids.
			///      The max and min ids can be emulated by sorting the results with a sort expression
			///      where the id of the verse or word must be between the ids (if both are given).
			///      Then we can filter out verses not in this range by looking for the value of the @expr attribute.
			///      If it has a value of 1 (@expr=1), then it is within the range.  A value of 0 (@expr=0) is outside of the range. 
			$sortexpr		= ' -S "';
			$sort_attribute	= '@id';
			
			if ($this->_min_id > 0) {
				$sortexpr .= $sort_attribute . ' >= ' . $this->_min_id;
			}
			if ($this->_max_id > 0) {
				if ($this->_min_id > 0) {
					$sortexpr .= ' AND ';
				}
				$sortexpr .= $sort_attribute . ' <= ' . $this->_max_id;
			}
			$options .= $sortexpr . '"';
			/// The regular expressions that parse the result should only retrieve results that match the sort expression and, therefore, have a value of one. 
			$extra_regex = ', @expr=1';
			
		}
		
		/// Is the user searching for a specific word?
		///NOTE: If the user is looking for all words that match some morphological attributes, then we do not send anything for the query (not even empty double quotes).
		if ($query != "") {
			/// Since the data is being sent to the command line, it needs to be wrapped in double quotes and sanitized.
			///NOTE: A space is needed after the first double quote; otherwise Sphinx throws an error.
			$query = ' " ' . str_replace('"', '\"', $query) . '"';
		}
		
		///TODO: Determine if this work on Linux?
		///FIXME: If there is a space in the $this->path on Windows, then we have to use the cmd executable to run the query.
		///       E.g., exec('cmd /c "' . ... . '"');
		///TODO: Determine if the problem with spaces on Windows is a PHP bug, and report it if it is.
		$cmd = $this->_path . $options . ' -c "' . str_replace('"', '\"', $this->_config) . '" -i ' . $index . $query;
		
		/// Run the search.
		$res = shell_exec($cmd);
		
		/// Since the results are plain text, we need to parse the results.
		
		/// Parse for how many times each word was found.
		preg_match_all('/^\d+\. \'([^\']+)\': (\d+) documents, (\d+)/im', $res, $hits);
		
		/// Parse for the statistical data concerning the search.
		preg_match('/: returned (\d+) matches of (\d+) total in ([0-9.]+)/i', $res, $stats);
		
		/// Parse for the verses that were found.
		preg_match_all('/ document=.*' . $extra_regex . '/', $res, $matches);
		
		/// Convert the text into valid JSON.
		$matches = preg_replace('/ ([^=]+)=/i', '"\1":', $matches[0]);
		
		/// Were results found?
		if (count($matches) > 0) {
			$mathces_attrs = array();
			
			/// Loop through the results to put them in an array that can be returned.
			foreach($matches as $value) {
				/// Since the results are comma delineated, we can use json_decode() to parse them as if they were a JSON object.
				/// Curly brakets ({}) are added to make the results look like a JSON object.
				$tmp_arr						= json_decode('{' . $value . '}', true);
				$doc							= $tmp_arr['document'];
				$mathces_attrs[$doc]['weight']	= $tmp_arr['weight'];
				
				/// Removing the "document" and "weight" keys will leave just the attributes from the search results.
				unset($tmp_arr['document']);
				unset($tmp_arr['weight']);
				$mathces_attrs[$doc]['attrs'] = $tmp_arr;
			}
		} else {
			/// Make sure to indicate that no valid results were found (i.e., valid results must match the sort expression).
			$stats[1]		= 0;
			$stats[2]		= 0;
			$mathces_attrs	= "";
			
			/// If there was an error, all of the stats need to be set manually to blank, so they can be returned.
			if (!isset($stats[3])) {
				$stats[3] = "";
			}
			
			/// Look for errors since no results were found.
			preg_match('/: search error: (.*)$/i', $res, $error_match);
			/// Was an error message found?
			if (count($error_match) > 1) {
				$error_message = $error_match[1];
			}
		}
		
		$hits_ret = array();
		foreach ($hits[1] as $key => $value) {
			$hits_ret[$value] = array('docs' => $hits[2][$key], 'hits' => $hits[3][$key]);
		}
		
		return array('error' => $error_message, 'warning' => "", 'matches' => $mathces_attrs, 'total' => $stats[1], 'total_found' => $stats[2], 'time' => $stats[3], 'words' => $hits_ret);
	}
}
