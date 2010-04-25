<?php

/**
 * BibleForge
 *
 * @date    08-30-09
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * INSTRUCTIONS:
 * Configure the constants to match your environment,
 * and then rename this file to config.php.
 */

/********************
 * MySQL Constants *
 *******************/
///NOTE: Use the typical MySQL sever format (hostname[:(port|socket)]).
define('DB_SERVER',		'127.0.0.1');
define('DB_USERNAME',	'root');
define('DB_PASSWORD',	'');
define('DB_NAME',		'bf');

/********************
 * Sphinx Constants *
 ********************/
define('SPHINX_API',	'sphinxapi');	/// Which API to use (i.e., 'sphinxapi' or 'sphinxapi_cli')?
define('SPHINX_SERVER',	'127.0.0.1');	/// The Sphinx host address (if using sphinxapi) or the path to search executable (if using sphinxapi_cli)
define('SPHINX_PORT',	9312);			/// Port number (if using sphinxapi) or path to sphinx configuration file (if using sphinxapi_cli)


/****************************
 * Database Table Constants *
 ****************************/
///FIXME: The Sphinx indices also need to determined for multiple languages.
///FIXME: The language needs to be determined somehow (probably by the client).
define('BIBLE_VERSES', 'bible_english_html');


///TODO These should be moved out of the config file to a constants file of some sort.
/************************
 * BibleForge Constants *
 ************************/
define('VERSE_LOOKUP',			1);
define('MIXED_SEARCH',			2);
define('STANDARD_SEARCH',		3);
define('MORPHOLOGICAL_SEARCH',	4);

define('ADDITIONAL',	1);
define('PREVIOUS',		2);

define('LIMIT',			40); ///FIXME: Where should this be defined?  Should it be defined?
define('LIMIT_SUGGEST',	10);
