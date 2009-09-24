<?php
/**
 * BibleForge (alpha testing)
 *
 * @date    09-23-09
 * @version 0.1 alpha 2
 * @link http://www.BibleForge.com
 */


/// known searchd commands
define ( "SEARCHD_COMMAND_SEARCH",	0 );
define ( "SEARCHD_COMMAND_EXCERPT",	1 );
define ( "SEARCHD_COMMAND_UPDATE",	2 );
define ( "SEARCHD_COMMAND_KEYWORDS",3 );

/// current client-side command implementation versions
define ( "VER_COMMAND_SEARCH",		0x113 );
define ( "VER_COMMAND_EXCERPT",		0x100 );
define ( "VER_COMMAND_UPDATE",		0x101 );
define ( "VER_COMMAND_KEYWORDS",	0x100 );

/// known searchd status codes
define ( "SEARCHD_OK",			0 );
define ( "SEARCHD_ERROR",		1 );
define ( "SEARCHD_RETRY",		2 );
define ( "SEARCHD_WARNING",		3 );

/// known match modes
define ( "SPH_MATCH_ALL",		0 );
define ( "SPH_MATCH_ANY",		1 );
define ( "SPH_MATCH_PHRASE",		2 );
define ( "SPH_MATCH_BOOLEAN",		3 );
define ( "SPH_MATCH_EXTENDED",		4 );
define ( "SPH_MATCH_FULLSCAN",		5 );
define ( "SPH_MATCH_EXTENDED2",		6 );	/// extended engine V2 (TEMPORARY, WILL BE REMOVED)

/// known ranking modes (ext2 only)
define ( "SPH_RANK_PROXIMITY_BM25",	0 );	///< default mode, phrase proximity major factor and BM25 minor one
define ( "SPH_RANK_BM25",		1 );	///< statistical mode, BM25 ranking only (faster but worse quality)
define ( "SPH_RANK_NONE",		2 );	///< no ranking, all matches get a weight of 1
define ( "SPH_RANK_WORDCOUNT",		3 );	///< simple word-count weighting, rank is a weighted sum of per-field keyword occurence counts

/// known sort modes
define ( "SPH_SORT_RELEVANCE",		0 );
define ( "SPH_SORT_ATTR_DESC",		1 );
define ( "SPH_SORT_ATTR_ASC",		2 );
define ( "SPH_SORT_TIME_SEGMENTS", 	3 );
define ( "SPH_SORT_EXTENDED", 		4 );
define ( "SPH_SORT_EXPR", 		5 );

/// known filter types
define ( "SPH_FILTER_VALUES",		0 );
define ( "SPH_FILTER_RANGE",		1 );
define ( "SPH_FILTER_FLOATRANGE",	2 );

/// known attribute types
define ( "SPH_ATTR_INTEGER",		1 );
define ( "SPH_ATTR_TIMESTAMP",		2 );
define ( "SPH_ATTR_ORDINAL",		3 );
define ( "SPH_ATTR_BOOL",		4 );
define ( "SPH_ATTR_FLOAT",		5 );
define ( "SPH_ATTR_MULTI",		0x40000000 );

/// known grouping functions
define ( "SPH_GROUPBY_DAY",		0 );
define ( "SPH_GROUPBY_WEEK",		1 );
define ( "SPH_GROUPBY_MONTH",		2 );
define ( "SPH_GROUPBY_YEAR",		3 );
define ( "SPH_GROUPBY_ATTR",		4 );
define ( "SPH_GROUPBY_ATTRPAIR",	5 );

/// sphinx searchd client class
class SphinxClient
{
	
	var $_path;			///< search path (default is "search")
	var $_config;		///< sphinx config file (default is "")
	
	var $_offset;		///< how many records to seek from result-set start (default is 0)
	var $_limit;		///< how many records to return from result-set starting at offset (default is 20)
	var $_mode;			///< query matching mode (default is SPH_MATCH_ALL)
	var $_weights;		///< per-field weights (default is 1 for all fields)
	var $_sort;			///< match sorting mode (default is SPH_SORT_RELEVANCE)
	var $_sortby;		///< attribute to sort by (defualt is "")
	var $_min_id;		///< min ID to match (default is 0, which means no limit)
	var $_max_id;		///< max ID to match (default is 0, which means no limit)
	var $_filters;		///< search filters
	var $_groupby;		///< group-by attribute name
	var $_groupfunc;	///< group-by function (to pre-process group-by attribute value with)
	var $_groupsort;	///< group-by sorting clause (to sort groups in result set with)
	var $_groupdistinct;///< group-by count-distinct attribute
	var $_maxmatches;	///< max matches to retrieve
	var $_cutoff;		///< cutoff to stop searching at (default is 0)
	var $_retrycount;	///< distributed retries count
	var $_retrydelay;	///< distributed retries delay
	var $_anchor;		///< geographical anchor point
	var $_indexweights;	///< per-index weights
	var $_ranker;		///< ranking mode (default is SPH_RANK_PROXIMITY_BM25)
	var $_maxquerytime;	///< max query time, milliseconds (default is 0, do not limit)
	var $_fieldweights;	///< per-field-name weights

	var $_error;		///< last error message
	var $_warning;		///< last warning message

	var $_reqs;			///< requests array for multi-query
	var $_mbenc;		///< stored mbstring encoding
	var $_arrayresult;	///< whether $result["matches"] should be a hash or an array
	var $_timeout;		///< connect timeout
	
	/// create a new client object and fill defaults
	function SphinxClient ()
	{
		// per-client-object settings
		$this->_path		= "search";
		$this->_config		= "";
		// per-query settings
		$this->_offset		= 0;
		$this->_limit		= 20;
		$this->_mode		= SPH_MATCH_ALL;
		$this->_weights		= array();
		$this->_sort		= SPH_SORT_RELEVANCE;
		$this->_sortby		= "";
		$this->_min_id		= 0;
		$this->_max_id		= 0;
		$this->_filters		= array();
		$this->_groupby		= "";
		$this->_groupfunc	= SPH_GROUPBY_DAY;
		$this->_groupsort	= "@group desc";
		$this->_groupdistinct= "";
		$this->_maxmatches	= 1000;
		$this->_cutoff		= 0;
		$this->_retrycount	= 0;
		$this->_retrydelay	= 0;
		$this->_anchor		= array();
		$this->_indexweights= array();
		$this->_ranker		= SPH_RANK_PROXIMITY_BM25;
		$this->_maxquerytime= 0;
		$this->_fieldweights= array();

		$this->_error		= ""; /// per-reply fields (for single-query case)
		$this->_warning		= "";
		$this->_reqs		= array();	/// requests storage (for multi-query case)
		$this->_mbenc		= "";
		$this->_arrayresult	= false;
		$this->_timeout		= 0;
	}
	
	///NOTE: This is just to be compatible with the default (searchd) api.
	/// set search path (string) and sphinx config file (string)
	function SetServer($path, $config)
	{
		$this->_path = $path;
		$this->_config = $config;
	}
	
	/// set IDs range to match
	/// only match records if document ID is beetwen $min and $max (inclusive)
	function SetIDRange($min, $max)
	{
		$this->_min_id = $min;
		$this->_max_id = $max;
	}
	
	/// set offset and count into result set,
	/// and optionally set max-matches and cutoff limits
	function SetLimits($offset, $limit, $max = 0, $cutoff = 0)
	{
		$this->_offset = $offset;
		$this->_limit = $limit;
		if ($max > 0)
			$this->_maxmatches = $max;
		if ($cutoff > 0)
			$this->_cutoff = $cutoff;
	}
	
	/// set matching mode
	function SetMatchMode($mode)
	{
		$this->_mode = $mode;
	}
	
	/// set matches sorting mode
	function SetSortMode($mode, $sortby = "")
	{
		$this->_sort = $mode;
		$this->_sortby = $sortby;
	}
	
	/// set ranking mode
	function SetRankingMode($ranker)
	{
		$this->_ranker = $ranker;
	}
	
	function Query($query, $index = "*", $comment = "")
	{
		$extra_regex = "";
		
		$options = " -q";
		$options .= " -l " . $this->_limit;
		$options .= ' -s "@id ASC"';
		
		if ($this->_mode == SPH_MATCH_ANY) {
			$options .= " -a";
		} elseif ($this->_mode == SPH_MATCH_PHRASE) {
			$options .= " -p";
		} elseif ($this->_mode == SPH_MATCH_BOOLEAN) {
			$options .= " -b";
		} elseif ($this->_mode == SPH_MATCH_EXTENDED) {
			$options .= " -e";
		} elseif ($this->_mode == SPH_MATCH_EXTENDED2) {
			$options .= " -e2";
		}
		
		if ($this->_min_id > 0 || $this->_max_id > 0) {
			$sortexpr = ' -S "';
			if ($this->_min_id > 0) {
				$sortexpr .= '@id >= ' . $this->_min_id;
			}
			if ($this->_max_id > 0) {
				if ($this->_min_id > 0) {
					$sortexpr .= ' AND ';
				}
				$sortexpr .= '@id <= ' . $this->_max_id;
			}
			$options .= $sortexpr . '"';
			$extra_regex = ", weight=\d+, @expr=1";
			
		}
		
		$cmd = $this->_path . $options . " -c " . $this->_config . " -i " . $index . " " . escapeshellarg($query);
		
		$res = shell_exec($cmd);
		preg_match_all('/^(\d+)\. document=(\d+)' . $extra_regex . '/im', $res, $matches);
		preg_match_all('/^\d+\. \'([^\']+)\': (\d+) documents, (\d+) /im', $res, $hits);
		preg_match('/matches of (\d+) total in ([0-9.]+) sec/im', $res, $stats);
		
		/*
		/// Uncomment for debugging.
		echo "<pre>$cmd\n";
		print_r($matches);
		print_r($hits);
		print_r($stats);
		echo $res;
		*/
		return array('simple-matches' => implode(',', $matches[2]), 'total_found' => $stats[1], 'time' => $stats[2]);
	}
}



/*
/// Example usage

define("SPHINX_SERVER", 'C:\srv\www\bf\win-sphinx\search.exe');
define("SPHINX_PORT", "C:\srv\www\bf\win-sphinx\sphinx_bf.conf");
define("LIMIT", 40);
$start_id = 41012030;

$query = "love God";
//$query = "love | God"; /// boolean
//$query = "love | God & \"in the\""; /// extended

//require_once 'functions/sphinxapi.php';

$cl = new SphinxClient();
$cl->SetServer(SPHINX_SERVER, SPHINX_PORT); /// SetServer(sphinx_server_address, sphinx_server_port)
$cl->SetLimits(0, LIMIT); /// SetLimits(starting_point, count, max_in_memory (optional), quit_after_x_found (optional))

if ($start_id > 0) $cl->SetIDRange($start_id, 0); /// SetIDRange(start_id, stop_id (0 means no limit))

/// Determine the search mode.
/// Default is SPH_MATCH_ALL (i.e., all words are required: word1 & word2).
if (strpos($query, ' ') === false) {
	/// There is only one word; therefore, skip all other checking to be faster.
	/// Uses default SPH_MATCH_ALL which should be the fastest.  No sorting necessary.
} elseif (strpos($query, '"') !== false || substr_count($query, ' ') > 9) {
	///NOTE: Could use the more accurate (preg_match('/([a-z-]+[^a-z-]+){11}/i', $query) == 1) to find word count, but it is slower.
	/// There are more than 10 search terms in the query or the query contains double quotes (").
	/// By default, other modes stop at 10, but SPH_MATCH_EXTENDED does more (256?).
	/// Phrases (words in quotes) require SPH_MATCH_EXTENDED mode.
	///NOTE: SPH_MATCH_BOOLEAN is supposed to find more than 10 words too but doesn't seem to.
	$cl->SetMatchMode(SPH_MATCH_EXTENDED); /// Most complex (and slowest?).
	$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order by id.
//} elseif (strpos($query, '"') || (substr_count($query, ' ') > 9 && preg_match('/([a-z-]+[^a-z-]+){11}/i', $query) == 1)) {
} elseif (strpos($query, '&') !== false || strpos($query, '|') !== false || strpos($query, ' -') !== false || substr($query, 0, 1) == '-') {
	/// Boolean opperators found.
	$cl->SetMatchMode(SPH_MATCH_BOOLEAN);
	$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order by id.
} else {
	/// Multiple words are being searched for but nothing else special.
	$cl->SetSortMode(SPH_SORT_EXTENDED, '@id ASC'); /// Order by id.
}

//$cl->SetMatchMode(SPH_MATCH_ANY); /// any matches, fast?

//$cl->SetRankingMode(SPH_RANK_PROXIMITY_BM25); /// default, slowest
//$cl->SetRankingMode(SPH_RANK_BM25); /// slow
$cl->SetRankingMode(SPH_RANK_NONE); /// No ranking, fastest

/// Run Sphinx search.
///TODO: Change test1 to something permanent.
$sphinx_res = $cl->Query($query, 'test1');
*/