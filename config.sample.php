<?php

/**
 * BibleForge
 *
 * @date    08-30-09
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
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
define('DB_SERVER',   '127.0.0.1'); ///NOTE: Use the typical MySQL sever format (hostname[:(port|socket)]).
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME',     'bf');

/********************
 * Sphinx Constants *
 ********************/
define('SPHINX_API',    'sphinxapi'); /// Which API to use (i.e., 'sphinxapi' or 'sphinxapi_cli')?
define('SPHINX_SERVER', '127.0.0.1'); /// The Sphinx host address (if using sphinxapi) or the path to search executable (if using sphinxapi_cli)
define('SPHINX_PORT',   9312);        /// Port number (if using sphinxapi) or path to sphinx configuration file (if using sphinxapi_cli)
