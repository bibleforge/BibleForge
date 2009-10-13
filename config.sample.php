<?php
/**
 * BibleForge (alpha testing)
 *
 * @date    08-30-09
 * @version 0.1 alpha 2
 * @link http://www.BibleForge.com
 */

/**
 * Configure the constants to match your enviroment,
 * and then rename this file to config.php.
 */

/// MySQL
define('DB_SERVER', '127.0.0.1');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'bf');

/// Sphinx
define('SPHINX_API', 'sphinxapi'); /// 'sphinxapi' OR 'sphinxapi_cli'
define('SPHINX_SERVER', '127.0.0.1'); /// sphinx host address OR path to search executable
define('SPHINX_PORT', 3312); /// port OR path to sphinx config file
