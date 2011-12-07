<?php

/**
 * BibleForge
 *
 * @date    12-06-11
 * @version 0.2 alpha
 * @link    http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author  BibleForge <info@bibleforge.com>
 */

/****************************
 * Database Table Constants *
 ****************************/
///FIXME: The Sphinx indices also need to determined for multiple languages.
///FIXME: The language needs to be determined somehow (probably by the client).
define('BIBLE_VERSES', 'bible_english_html');

/************************
 * BibleForge Constants *
 ************************/
define('VERSE_LOOKUP',       1);
define('MIXED_SEARCH',       2);
define('STANDARD_SEARCH',    3);
define('GRAMMATICAL_SEARCH', 4);
define('LEXICON_LOOKUP',     5);

define('ADDITIONAL', 1);
define('PREVIOUS',   2);

define('LIMIT',         40); ///FIXME: Where should this be defined?  Should it be defined?
define('LIMIT_SUGGEST', 10);
