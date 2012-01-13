<?php

/**
 * BibleForge
 *
 * @date    01-06-12
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

/// Create REDIRECT_URL and REDIRECT_QUERY_STRING if it is not available.  Apache creates them, but nginx does not.
if (!isset($_SERVER['REDIRECT_URL'])) {
    $_SERVER['REDIRECT_QUERY_STRING'] = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
    ///NOTE: Since REDIRECT_QUERY_STRING does not include the question mark (?), trim it off.
    $_SERVER['REDIRECT_URL'] = rtrim(substr($_SERVER['REQUEST_URI'], 0, strlen($_SERVER['REQUEST_URI']) - strlen($_SERVER['REDIRECT_QUERY_STRING'])), '?');
}

$uri = $_SERVER['REDIRECT_URL'];

/// Is this a request for the normal full featured version?
if (substr($uri, -1) !== '!' && strpos($_SERVER['REQUEST_URI'], '_escaped_fragment_') === false) {
    /// Override the default 404 response.
    header('HTTP/1.1 200 OK');
    
    /// Just send it to the main page and let the client-side JavaScript sort it out.
    require 'index.html';
    die;
}

///NOTE: When a page is redirected, the GET array is empty.
if (isset($_SERVER['REDIRECT_QUERY_STRING'])) {
    parse_str($_SERVER['REDIRECT_QUERY_STRING'], $_GET);
}

/**
 * Create the HTML for the non-JS version.
 *
 * @param  $title (string) (optional) The text to go in the <title>.
 * @param  $query (string) (optional) The text to go in the query box.
 * @param  $info  (string) (optional) The text to go in the info bar.
 * @return NULL.  HTML is printed to the buffer and then flushed.
 */
function create_page_html($title = '', $query = '', $info = '')
{

?>
<html>
<head>
    <meta http-equiv=content-type content="text/html;charset=UTF-8">
    <!-- TODO: Set the page title (and inputIcon title) with language specific JavaScript. -->
    <title><?php echo $title ?> - BibleForge</title>
    <link rel=stylesheet href="/styles/base.css">
    <link rel="icon" type="image/png" href="/favicon.png">
    <!-- This graphic is used by handhelds and tablets for a bookmark icon. -->
    <!-- NOTE: Ideally, this should be at least 114 pixels. -->
    <link rel="apple-touch-icon" href="/images/scroll_64.png">
    <meta name=description content="BibleForge: The free, open source Bible Study web app.">
    <!-- Safari on the iPhone or iPad requires that the viewport width be set. -->
    <!-- The Froyo browser on Android 2.2 needs scaling disabled in order for fixed positioning to work. -->
    <!-- TODO: The correct header should probably be sent dynamically from the server. -->
    <meta name=viewport content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <!-- Redirect unsupported browsers and those with JavaScript turned off to a non-JS version. -->
    <!-- Tell Googlebot (and maybe other bots) to retry the same address with "?_escaped_fragment_=" at the end. -->
    <!-- Then the server can create a page for Googlebot to index. -->
    <meta name="fragment" content="!">
</head>
<body
><div class=viewPorts id=viewPort0
    ><div
        ><div class=searchBars
            ><form action="/!"
                ><label for=q0 class=queryPadding
                    ><nobr
                        ><input type=button class=lang
                        ><input type=text name=q id=q0 class=queryInput value="<?php echo addslashes($query) ?>"
                        ><input type=submit value=Go
                    ></nobr
                ></label
            ></form
        ></div
        ><div class=infoBars><?php echo $info; ?></div
    ></div
    ><div class=scrolls>
<?php
    flush();
}

/// Break apart the URL string.
$query_arr = explode('/', substr($uri, 1, -2), 2);

$langs = array(
    'en' => array(
        'default_query' => 'Genesis 1',
        'db_identifier' => 'english',
        'identifier'    => 'en'
    ),
    'en_em' => array(
        'default_query' => 'Genesis 1',
        'db_identifier' => 'en_em',
        'identifier'    => 'en_em'
    )
);

$query = '';

if (isset($langs[$query_arr[0]])) {
    $language = $langs[$query_arr[0]];
    if (isset($query_arr[1])) {
        $query = $query_arr[1];
    }
} else {
    $language = $langs['en'];
    $query = $query_arr[0];
}

if (trim($query) === '') {
    $query = isset($_GET['q']) ? $_GET['q'] : $language['default_query'];
}

$query = rawurldecode($query);

$full_featured_uri = '/' . $language['identifier'] . '/' . rawurlencode($query) . '/';

/// If a query string is present, we want to redirect it to the correct URL.
///TODO: Check for the presence of both the exclamation point (!) and _escaped_fragment_ and redirect to a page without the exclamation point .
///TODO: Retrieve any query in the _escaped_fragment_ variable.
if (isset($_GET['q'])) {
    Header('HTTP/1.1 301 Moved Permanently');
    Header('Location: //' . $_SERVER['HTTP_HOST'] . $full_featured_uri . '!');
    die;
}

/// Override the default 404 response.
header('HTTP/1.1 200 OK');

/// Since a supported browser could here accidentally (e.g., by clicking on a link from another site), try to redirect supported browsers to the full-featured page.
?>
<!doctype html>
<!--[if !IE]> -->
    <script>
        window.location.replace("<?php echo $full_featured_uri; ?>");
    </script>
<!-- <![endif]-->
<!--[if gte IE 7]>
    <script>
        window.location.replace("<?php echo $full_featured_uri; ?>");
    </script>
<![endif]-->
<?php

flush();

require_once 'config.php';

/// Use node.js to determine if it is a verse reference.
$ref = json_decode(shell_exec('node js/.ref_info.js ' . $language['identifier'] . ' ' . escapeshellarg($query)), true);

/// Is it a verse lookup?
if ($ref['verseID'] !== 0) {
    /**
     * Create the previous and next chapter links.
     *
     * @param  $b (integer) The current book number.
     * @param  $c (integer) The current chapter number.
     * @return NULL.  HTML is printed to the buffer.
     * @todo   Make the text language specific.
     */
    function create_back_next($b, $c)
    {
        global $ref, $language;
        
        /// Is this not Genesis 1?
        if (!($b === 1 && $c === 1)) {
            if ($c === 1) {
                $prev_b = $b - 1;
                $prev_c = $ref['chapter_count'][$prev_b];
            } else {
                $prev_b = $b;
                $prev_c = $c - 1;
            }
            
            echo '<a style="float:left;" href="' . '/' . $language['identifier'] . '/' . $ref['books_short'][$prev_b] . '%20' . $prev_c . '/!' . '">&lt; Previous ' . $ref[$prev_b === 19 ? 'psalm' : 'chapter'] . '</a>';
        }
        
        /// Is this not Revelation 22?
        if (!($b === count($ref['chapter_count']) - 1 && $c === $ref['chapter_count'][$b])) {
            if ($c === $ref['chapter_count'][$b]) {
                $next_b = $b + 1;
                $next_c = 1;
            } else {
                $next_b = $b;
                $next_c = $c + 1;
            }
            
            echo '<a style="float:right;" href="' . '/' . $language['identifier'] . '/' . $ref['books_short'][$next_b] . '%20' . $next_c . '/!' . '">Next ' . $ref[$next_b === 19 ? 'psalm' : 'chapter'] . ' &gt;</a>';
        }
    }
    
    require_once 'functions/database.php';
    connect_to_database();
    
    $v = $ref['verseID'] % 1000;
    $c = (($ref['verseID'] - $v) % 1000000) / 1000;
    $b = ($ref['verseID'] - $v - $c * 1000) / 1000000;
    
    create_page_html($ref['books_short'][$b] . ' ' . $c, $query, $ref['books_short'][$b] . ' ' . $c);
    
    $SQL_query = 'SELECT id, words FROM `bible_' . $language['db_identifier'] . '_html` WHERE book = ' . $b . ' AND chapter = ' . $c;
    
    $SQL_res = mysql_query($SQL_query) or die('SQL Error: ' . mysql_error() . '<br>' . $SQL_query);
    
    $cur_verse = 1;
    
    create_back_next($b, $c);
    
    /// Print book and chapter headings.
    if ($c === 1) {
        echo '<div class=book><h2>' . $ref['books_long_pretitle'][$b] . '</h2><h1>' . $ref['books_long_main'][$b] . '</h1><h2>' . $ref['books_long_posttitle'][$b] . '</h2></div>';
    } else {
        echo '<h3 class="chapter">' . $ref[$b === 19 ? 'psalm' : 'chapter'] . ' ' . $c . '</h3>';
    }
    
    while ($row = mysql_fetch_assoc($SQL_res)) {
        echo '<div class="verse">';
        echo '<span class="verse_number">' . $c . ':' . $cur_verse . '&nbsp;</span>';
        echo $row['words'];
        
        ++$cur_verse;
        
        echo '</div>';
    }
    
    create_back_next($b, $c);
} else {
    create_page_html($query, $query);
    
    echo 'Sorry, but this feature is not yet available in basic version of BibleForge. Please <a href="http://getfirefox.com" target=_blank>upgrade your browser</a>.';
}
?>
    </div
></div
></body
></html>
