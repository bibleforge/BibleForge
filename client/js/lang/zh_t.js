/**
 * BibleForge
 *
 * @date    03-18-13
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * Copyright (C) 2013
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see http://www.opensource.org/licenses/AGPL-3.0.
 */

/// Set JSHint options.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, es5:true, browser:true

/**
 * Create the BibleForge language specific object for the English language.
 *
 * @param   that (object) The global used to attach the code to.
 * @note    The object that is created is used by main.js to preform language specific operations.
 * @return  NULL.  Attaches an object containing language specific functions and variables to the global BF object.
 */
(function (that)
{
    "use strict";
    
    /// In the eval context, "this" is undefined, so it needs to get the global object manually.
    /// Because this file is included immediately via <script> tags, it is not eval'ed.
    ///NOTE: Object.isFrozen() is needed for eval'ed code because the "this" object is the one from the evaler() function.
    if (typeof that === "undefined" || Object.isFrozen(that)) {
        /// Since only the browser might load the code via eval(), use the "window" object.
        that = window;
    }
    
    /// Has the BF object already been created?
    ///NOTE: "that" is "this", which is "window" in browsers and a global object in Node.js.
    ///NOTE: This also allows this code to be accessed via Node.js' require() function.
    if (!that.BF) {
        that.BF = {langs: {}};
    } else if (!that.BF.langs) {
        that.BF.langs = {};
    }
    
    /// Return the language variables and functions.
    that.BF.langs.zh_t = {
        /// Indicate that the code has been downloaded and parsed.
        loaded: true,
        
        /// Indicate the language name so it can be distinguished later.
        full_name:  "繁體中文 (CKJV)",
        short_name: "繁體",
        id:         "zh_t",
        
        /// Indicate that the first verse should not get special CSS.
        first_verse_normal: true,
        
        linked_to_orig: false,
        no_paragraphs: true,
        
        /// Information about this particular Bible translation needed by the server.
        ///NOTE: paragraph_limit can be calculated in the Forge via find_longest_paragraph.js.
        /// The longest paragraph length plus one
        ///NOTE: One is added because it needs to find the paragraph break, which would be demarcated on the next verse when preforming an additional lookup.
        paragraph_limit:        59,
        /// The number of verses to request for a normal verse lookup (It should more than fill up the screen.)
        minimum_desired_verses: 40,
        
        /// Information about different sections of the Bible
        divisions: {
            ///NOTE: Currently, only the division between the Old and New Testaments is needed.
            /// Calculated via find_beginning_of_nt.js.
            nt: 392042
        },
        
        /// Book names
        books_long_main:      ["", "創世記", "出埃及記", "利未記", "民數記", "申命記", "約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下", "列王紀上", "列王紀下", "歷代誌上", "歷代誌下", "以斯拉記", "尼希米記" , "以斯帖記", "約伯記", "詩篇", "箴言", "傳道書", "雅歌", "以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書", "何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書", "馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳", "羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書", "提摩太前書", "提摩太后書", "提多書", "腓利門書", "希伯來書", "雅各書", "彼得前書", "彼得後書", "約翰一書" , "約翰二書", "約翰三書", "猶大書", "啟示錄"],
        books_long_posttitle: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        books_long_pretitle:  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        books_short:          ["", "創", "出", "利", "民", "申", "書", "士", "得", "撒上", "撒下", "王上", "王下", "代上", "代下", "拉", "尼", "斯", "伯", "詩", "箴", "傳", "歌", "賽", "耶", "哀", "結", "但", "何", "珥", "摩", "俄", "拿", "彌", "鴻", "哈", "番", "該", "亞", "瑪", "太", "可", "路", "約", "徒", "羅", "林前", "林後", "加", "弗", "腓", "西", "帖前", "帖後", "提前", "提後", "多", "門", "來", "雅", "彼前", "彼後", "約一", "約二", "約三", "猶", "啟"],
        
        /// The Hebrew alphabet (used for Psalm 119)
        hebrew_alphabet: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        
        /// The number of chapters in each book of the Bible.
        ///NOTE: Genesis is index 1 (not 0).
        chapter_count: [0, 50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22],
        
        ///TODO: Determine if texts should be categorized.
        /// Miscellaneous Text
        about:             "About",                                                /// Context menu item
        app_name:          "BibleForge",                                           /// The name of the application
        biblical:          "Biblical",                                             /// The short name for the Biblical reconstructed pronunciation displayed on the menu
        biblical_pronun:   "Biblical Reconstructed Pronunciation",                 /// The long name for the Biblical reconstructed pronunciation displayed in a tooltip
        biblical_ipa:      "Biblical IPA",                                         /// The short name for the Biblical reconstructed IPA pronunciation displayed on the menu
        biblical_ipa_long: "Biblical Reconstructed IPA",                           /// The long name for the Biblical reconstructed IPA pronunciation displayed in a tooltip
        blog:              "Blog",                                                 /// Context menu item
        chapter:           "第{num}章",                                             /// Chapter headings
        chapter_psalm:     "第{num}首",                                             /// The title of chapters in the book of Psalms
        configure:         "Configure",                                            /// Context menu item
        detailed_def:      "Detailed Definition",                                  /// Longer, more detailed definitions caption (in larger callout)
        done:              "Done",                                                 /// The button that closes panels
        err_unknown:       "An error occurred. Please try again.",                 /// A query returned an error for an unspecified reason.
        found_plural:      " verses found for ",                                   /// On the info bar when searching (multiple results) (uncapitalized)
        found_singular:    " verse found for ",                                    /// On the info bar when searching (one result) (uncapitalized)
        help:              "Help",                                                 /// Context menu item
        "in":              "in",                                                   /// Used in the meta description in the non-JavaScript version to indicate the language being used (uncapitalized)
        ///NOTE: This key must be the same as the value in the settings.
        in_paragraphs:     "Paragraphs",                                           /// In the View configuration panel
        ///FIXME: Not all italic words are implied; some are questionable.
        italics_explanation: "This word is implied by context or required in order to translate properly; it was not translated directly from a word in the original languages.", /// When clicking on an italic word
        modern:            "Modern",                                               /// The short name for the modern pronunciation displayed on the menu
        modern_pronun:     "Modern Pronunciation",                                 /// The long name for the modern pronunciation displayed in a tooltip
        modern_ipa:        "Modern IPA",                                           /// The name for the modern IPA pronunciation displayed on the menu and tooltip
        more:              "More",                                                 /// The text for the "[+] More" button on callouts
        next:              "Next",                                                 /// The next chapter link in the non-JavaScript version
        night_mode:        "Night Mode",                                           /// In the View configuration panel
        no_results1:       "Your search\u200A\u2014\u200A",                        /// Displayed when preforming a search that returns no results (before the search terms)
        no_results2:       "\u200A\u2014\u200Adid not return any results.",        /// Displayed when preforming a search that returns no results (after the search terms) (uncapitalized)
        previous:          "Previous",                                             /// The previous chapter link in the non-JavaScript version
        psalm:             "詩",                                                   /// How to reference Psalms in a reference
        query_explanation: "Keyword or Reference: \"God so loved\" or Romans 3:23",/// In a blank query input box before a search has been preformed
        query_button_title:"Click here (or press Enter)",                          /// The text displayed when hovering over the magnifying glass (query button)
        query_button_alt:  "Go",                                                   /// The text to display for the magnifying glass (query button) if images are disabled
        ///NOTE: This key must be the same as the value in the settings.
        red_letters:       "Red Letters",                                          /// In the View configuration panel
        results_for:       "Results for",                                          /// Used in the meta description of searches in the non-JavaScript version to indicate the results for the query.
        subscription:      "subscription",                                         /// Used instead of 255 for subscripts to Paul's epistles (uncapitalized)
        title:             "title",                                                /// Used instead of 0 for Psalm title verse references (uncapitalized)
        translit:          "Transliteration",                                      /// The short name for the SBL transliteration display on the menu
        translit_long:     "Society of Biblical Languages Transliteration",        /// The long name for the SBL transliteration display on a tooltip
        view:              "View",                                                 /// The title of a configuration panel
        ///TODO: Determine if the app_name should be dynamically appended to the string below or if it should be done in the build system
        wrench_title:      "Customize and Configure BibleForge",                   /// The text displayed when hovering over the wrench menu
        
        /// Grammatical Variables
        /// Grammatical search format:  WORD grammar_marker ATTRIBUTE_1 grammar_separator ATTRIBUTE_2 grammar_separator ... ATTRIBUTE_N
        /// Grammatical search example: love AS VERB, THIRD_PERSON
        /// The keyword that indicates a grammatical search.
        ///NOTE: Created in the Forge via grammar_constants_parser.php on 05-24-2012 from Grammar Constants.txt.
        grammar_keywords:   {IMPLIED: "[1,1]", DIVINE: "[2,1]", RED: "[3,1]", NOUN: "[4,1]", VERB: "[4,2]", ADJECTIVE: "[4,3]", ADVERB: "[4,4]", PRONOUN: "[4,5]", DEFINITE_ARTICLE: "[4,6]", CONJUNCTION: "[4,7]", CONDITIONAL: "[4,8]", PARTICLE: "[4,9]", PREPOSITION: "[4,10]", INJECTIVE: "[4,11]", HEBREW: "[4,12]", ARAMAIC: "[4,13]", SINGULAR: "[5,1]", PLURAL: "[5,2]", FIRST_PERSON: "[6,1]", SECOND_PERSON: "[6,2]", THIRD_PERSON: "[6,3]", PRESENT: "[7,1]", IMPERFECT: "[7,2]", FUTURE: "[7,3]", AORIST: "[7,4]", PERFECT: "[7,5]", PLUPERFECT: "[7,6]", NO_TENSE_STATED: "[7,99]", ACTIVE: "[8,1]", MIDDLE: "[8,2]", PASSIVE: "[8,3]", MIDDLE_DEPONENT: "[8,4]", PASSIVE_DEPONENT: "[8,5]", IMPERSONAL_ACTIVE: "[8,6]", AMBIGUOUS_MIDDLE_PASSIVE: "[8,77]", AMBIGUOUS_MIDDLE_PASSIVE_DEPONENT: "[8,88]", NO_VOICE_STATED: "[8,99]", INDICATIVE: "[9,1]", SUBJUNCTIVE: "[9,2]", IMPERATIVE: "[9,3]", INFINITIVE: "[9,4]", OPTATIVE: "[9,5]", PARTICIPLE: "[9,6]", IMPERATIVE_SENSE_PARTICIPLE: "[9,7]", MASCULINE: "[10,1]", FEMININE: "[10,2]", NEUTER: "[10,3]", NOMINATIVE: "[11,1]", GENITIVE: "[11,2]", ACCUSATIVE: "[11,3]", DATIVE: "[11,4]", VOCATIVE: "[11,5]", PERSONAL_PRONOUN: "[12,1]", RELATIVE_PRONOUN: "[12,2]", RECIPROCAL_PRONOUN: "[12,3]", DEMONSTRATIVE_PRONOUN: "[12,4]", CORRELATIVE_PRONOUN: "[12,5]", INTERROGATIVE_PRONOUN: "[12,6]", INDEFINITE_PRONOUN: "[12,7]", REFLEXIVE_PRONOUN: "[12,8]", POSESSIVE_PRONOUN: "[12,9]", AMBIGUOUS_CORRELATIVE_INTERROGATIVE_PRONOUN: "[12,10]", COMPARATIVE: "[13,1]", SUPERLATIVE: "[13,2]", INDECLINABLE: "[14,1]", NUMERICAL: "[15,1]", NORMAL_NOUN: "[16,1]", PROPER_NOUN: "[16,2]", LETTER: "[16,3]", OTHER: "[16,4]", ABBREVIATED: "[17,1]", CONTRACTED: "[17,2]", APOCOPATED: "[17,3]", IRREGULAR: "[17,4]", ATTIC: "[18,1]", AEOLIC: "[18,2]", TRANSITIVE: "[19,1]", FIRST_FORM: "[20,1]", SECOND_FORM: "[20,2]", INTERROGATIVE: "[21,1]", NEGATIVE: "[21,2]", PARTICLE_ATTACHED: "[21,3]", MIDDLE_SIGNIFICANCE: "[21,4]"},
        grammar_categories: ["", "implied", "divine", "red", "part_of_speech", "number", "person", "tense", "voice", "mood", "gender", "case_5", "pronoun_type", "degree", "declinability", "numerical", "noun_type", "type", "dialect", "transitivity", "form", "miscellaneous"],
        grammar_marker:     " AS ",
        grammar_marker_len: 4,   /// The length of grammar_marker.
        grammar_separator:  ",", /// The punctuation that separates two attributes.
        
        /// ****************************************
        /// * Start of Language Specific Functions *
        /// ****************************************
        
        prepare_highlighter: (function ()
        {
            /**
             * Prepare the search terms for the highlighter.
             *
             * Removes punctuation, words which should not be found in the search results, duplicate words, and converts all words to lower case
             * so that the highlighter can parse the words properly.
             *
             * @example filter_terms_for_highlighter('this one, -that one -"none of these" -"or these ones"~1 "but, these?"'); /// Returns ["this", "one", "but", "these"].
             * @param   search_terms (string) The terms to be filtered.
             * @return  An array of filtered words.
             * @note    Called by prepare_highlighter().
             * @todo    Determine if this should be moved out of the language specific file (and maybe just use some language specific variables).
             */
            function filter_terms_for_highlighter(search_terms)
            {
                var arr_len,
                    final_search_arr = [],
                    i,
                    initial_search_arr,
                    j,
                    new_arr_len = 0;
                
                /// Remove punctuation and break up the query string into individual parts to filter out duplicates.
                /// E.g., 'in "and the earths "earths | in | earth. | "in the beginning God"' =>
                ///       ["in","\"and the earths \"","earths","in","earth","\"in the beginning god\""]
                ///NOTE: (?:^|\s)- makes sure not to filter out hyphenated words by ensuring that a hyphen must occur at the beginning or before a space to be counted as a NOT operator.
                ///NOTE: (?:"[^"]*"?|[^\s]*) matches a phrase starting with a double quote (") or a single word.
                ///NOTE: [~\/]\d* removes characters used for Sphinx query syntax.  I.e., proximity searches ("this that"~10) and quorum matching ("at least three of these"/3).
                ///NOTE: -\B removes trailing hyphens.  (This might be unnecessary.)
                ///NOTE: '(?!s\b) removes apostrophes that are not followed by an "s" and only an "s."
                ///NOTE: "[^"]+"?|[^"\s]+ is used to split the string into groups of individual words and quoted phrases.
                ///NOTE: Unterminated double quotes are treated as a phrase that ends at the end of the query, so '"unterminated quote' is treated as '"unterminated quote"'.
                initial_search_arr = search_terms.replace(/(?:(?:^|\s)-(?:"[^"]*"?|[^\s]*)|[~\/]\d*|[,.:?!;&|\)\(\]\[\/\\`{}<$\^+]|-\B|'(?!s\b))/g, "").toLowerCase().match(/"[^"]+"?|[^"\s]+/g);
                
                /// Where no terms found?  If so, return an empty array.
                ///NOTE: This could happen if all of the search terms are negative (e.g., "NOT bad").
                if (!initial_search_arr) {
                    return [];
                }
                
                arr_len = initial_search_arr.length;
                                
                /// Filter out duplicates (i.e., PHP's array_unique()).
                /// E.g., ["in","\"and the earths \"","earths","in","earth","\"in the beginning god\""] =>
                ///       ["in","\"and the earths \"","earths","earth","\"in the beginning god\""]
first_loop:     for (i = 0; i < arr_len; i += 1) {
                    /// Skip empty strings.
                    
                    if (initial_search_arr[i] !== "" && initial_search_arr[i] !== "*") {
                        for (j = 0; j < new_arr_len; j += 1) {
                            if (final_search_arr[j] === initial_search_arr[i]) {
                                /// This words already exists; jump to the first loop and get the next word.
                                ///NOTE: This would be the same as "continue 2" in PHP.
                                continue first_loop;
                            }
                        }
                        final_search_arr[new_arr_len] = initial_search_arr[i];
                        new_arr_len += 1;
                    }
                }
                
                /// Loop through all of words and phrases and remove any double quotes and add to the array as individual words or arrays of words.
                /// E.g., ["in","\"and the earths \"","earths","earth","\"in the beginning god\""] =>
                ///       ["in",["and","the","earths"],"earths","earth",["in","the","beginning","god"]]
                for (i = final_search_arr.length - 1; i >= 0; i -= 1) {
                    /// Since a quotation mark might be followed or preceded by a space, make sure to remove any extra space when removing double quotes.
                    final_search_arr[i] = final_search_arr[i].replace(/\s*"\s*/g, "");
                    /// Is this a phrase (multiple words that were in double quotes)?
                    if (final_search_arr[i].indexOf(" ") !== -1) {
                        /// Add phrases as an array of individual words.
                        final_search_arr[i] = final_search_arr[i].split(" ");
                    }
                }
                
                return final_search_arr;
            }
            
            function add_regex(term)
            {
                /// Convert the asterisks to a valid regex wildcard.
                ///NOTE: Word breaks are found by looking for tag openings (<) or closings (>).
                term = term.replace(/\*/g, "[^<>]*");
                return "=([0-9]+)>[　「『（]?\\(*(?:" + term + "|[^<]+-" + term + ")[）；：，。？！」』]*[<-]";
            }
            
            /**
             * Prepare search terms for highlighting.
             *
             * Create regex array to search through the verses that will soon be returned by the server.
             *
             * @example BF.lang.prepare_highlighter(q_obj.value);
             * @example BF.lang.prepare_highlighter("search terms");
             * @param   search_terms (string) The terms to look for.
             * @return  An array of regular expressions.
             * @note    Called by run_new_query().
             * @todo    Determine if this can be moved out of the language specific files.
             */
            return function prepare_highlighter(search_terms)
            {
                var highlight_regex = [],
                    i,
                    j,
                    search_terms_arr = filter_terms_for_highlighter(search_terms),
                    search_terms_arr_len,
                    stemmed,
                    stemmed_obj = {},
                    stemmed_tmp,
                    word_count;
                
                search_terms_arr_len = search_terms_arr.length;
                
                /// Loop through the array of words and phrases to create the regular expression.
                for (i = 0; i < search_terms_arr_len; i += 1) {
                    /// Is it a single word (it will be a string)?
                    if (typeof search_terms_arr[i] === "string") {
                        stemmed = add_regex(search_terms_arr[i]);
                        
                        word_count = 1;
                    /// If it is not a string, then it should be an array of strings.
                    } else {
                        stemmed = "";
                        word_count = search_terms_arr[i].length;
                        /// Loop through each word in the phrase to get a regular expression to highlight it and then combine it with the others.
                        for (j = word_count - 1; j >= 0; j -= 1) {
                            stemmed_tmp = add_regex(search_terms_arr[i][j]);
                            if (j > 0) {
                                /// Add a short regular expression to "glue" the regular expressions for each word together to create a regular expression for the entire phrase.
                                /// [^<]*[^>]* is used to skip over an HTML tag.
                                stemmed_tmp = "[^<]*[^>]*" + stemmed_tmp;
                            }
                            /// Since we are looping backward, add it to the beginning of the string.
                            stemmed = stemmed_tmp + stemmed;
                        }
                    }
                    
                    /// Is this regular expression not a duplicate?
                    if (!stemmed_obj[stemmed]) {
                        stemmed_obj[stemmed] = true;
                        
                        highlight_regex[highlight_regex.length] = {
                            /// Create the regular expression for the phrase or word (and make it case insensitive).
                            regex: new RegExp(stemmed, "i"),
                            /// word_count is used when looping through the results of the regular expression to know how many IDs to look for.
                            word_count: word_count
                        };
                    }
                }
                
                return highlight_regex;
            };
        }()),


        /**
         * Determines the id of a verse from a reference.
         *
         * Determines if a verse is a reference and then calculates the verse id.
         * It supports various abbreviated forms as well as misspellings.
         * Only a book is required or checked for validity.
         * The verse id format is [B]BCCCVVV (e.g., Genesis 1:1 == 1001001).
         *
         * @example verse_id = determine_reference("創");                      /// Returns "10001001"
         * @example verse_id = determine_reference("帖撒羅尼迦前書3：10");        /// Returns "52003010"
         * @example verse_id = determine_reference("愛");                      /// Returns 0
         * @param   ref (string) The text that may or may not be a valid verse reference.
         * @return  The verse id of a reference (as a string) or the integer 0 if invalid.
         * @todo    Determine if this should return FALSE on invalid references.
         */
        determine_reference: (function ()
        {
            var books = {
                /// Simplified
                "创": 1, "出": 2, "利": 3, "民": 4, "申": 5, "书": 6, "士": 7, "得": 8, "撒上": 9, "撒下": 10, "王上": 11, "王下": 12, "代上": 13, "代下": 14, "拉": 15, "尼": 16, "斯": 17, "伯": 18, "诗": 19, "箴": 20, "传": 21, "歌": 22, "赛": 23, "耶": 24, "哀": 25, "结": 26, "但": 27, "何": 28, "珥": 29, "摩": 30, "俄": 31, "拿": 32, "弥": 33, "鸿": 34, "哈": 35, "番": 36, "该": 37, "亚": 38, "玛": 39, "太": 40, "可": 41, "路": 42, "约": 43, "徒": 44, "罗": 45, "林前": 46, "林后": 47, "加": 48, "弗": 49, "腓": 50, "西": 51, "帖前": 52, "帖后": 53, "提前": 54, "提后": 55, "多": 56, "门": 57, "来": 58, "雅": 59, "彼前": 60, "彼后": 61, "约一": 62, "约二": 63, "约三": 64, "犹": 65, "启": 66,
                "创世记": 1, "出埃及记": 2, "利未记": 3, "民数记": 4, "申命记": 5, "约书亚记": 6, "士师记": 7, "路得记": 8, "撒母耳记上": 9, "撒母耳记下": 10, "列王纪上": 11, "列王纪下": 12, "历代志上": 13, "历代志下": 14, "以斯拉记": 15, "尼希米记": 16, "以斯帖记": 17, "约伯记": 18, "诗篇": 19, "箴言": 20, "传道书": 21, "雅歌": 22, "以赛亚书": 23, "耶利米书": 24, "耶利米哀歌": 25, "以西结书": 26, "但以理书": 27, "何西阿书": 28, "约珥书": 29, "阿摩司书": 30, "俄巴底亚书": 31, "约拿书": 32, "弥迦书": 33, "那鸿书": 34, "哈巴谷书": 35, "西番雅书": 36, "哈该书": 37, "撒迦利亚书": 38, "玛拉基书": 39, "马太福音": 40, "马可福音": 41, "路加福音": 42, "约翰福音": 43, "使徒行传": 44, "罗马书": 45, "哥林多前书": 46, "哥林多后书": 47, "加拉太书": 48, "以弗所书": 49, "腓立比书": 50, "歌罗西书": 51, "帖撒罗尼迦前书": 52, "帖撒罗尼迦后书": 53, "提摩太前书": 54, "提摩太后书": 55, "提多书": 56, "腓利门书": 57, "希伯来书": 58, "雅各书": 59, "彼得前书": 60, "彼得后书": 61, "约翰一书": 62, "约翰二书": 63, "约翰三书": 64, "犹大书": 65, "启示录": 66,
                /// Traditional
                "創": 1, "書": 6, "詩": 19, "傳": 21, "賽": 23, "結": 26, "彌": 33, "鴻": 34, "該": 37, "亞": 38, "瑪": 39, "羅": 45, "林後": 47, "帖後": 53, "提後": 55, "門": 57, "來": 58, "彼後": 61, "約一": 62, "約二": 63, "約三": 64, "猶": 65, "啟": 66,
                "創世記": 1, "出埃及記": 2, "利未記": 3, "民數記": 4, "申命記": 5, "約書亞記": 6, "士師記": 7, "路得記": 8, "撒母耳記上": 9, "撒母耳記下": 10, "列王紀上": 11, "列王紀下": 12, "歷代誌上": 13, "歷代誌下": 14, "以斯拉記": 15, "尼希米記": 16 , "以斯帖記": 17, "約伯記": 18, "詩篇": 19, "傳道書": 21, "以賽亞書": 23, "耶利米書": 24, "以西結書": 26, "但以理書": 27, "何西阿書": 28, "約珥書": 29, "阿摩司書": 30, "俄巴底亞書": 31, "約拿書": 32, "彌迦書": 33, "那鴻書": 34, "哈巴谷書": 35, "西番雅書": 36, "哈該書": 37, "撒迦利亞書": 38, "瑪拉基書": 39, "馬太福音": 40, "馬可福音": 41, "約翰福音": 43, "使徒行傳": 44, "羅馬書": 45, "哥林多前書": 46, "哥林多後書": 47, "加拉太書": 48, "以弗所書": 49, "腓立比書": 50, "歌羅西書": 51, "帖撒羅尼迦前書": 52, "帖撒羅尼迦後書": 53, "提摩太前書": 54, "提摩太后書": 55, "提多書": 56, "腓利門書": 57, "希伯來書": 58, "雅各書": 59, "彼得前書": 60, "彼得後書": 61, "約翰一書": 62, "約翰二書": 63, "約翰三書": 64, "猶大書": 65, "啟示錄": 66,
                /// English
                genesis: 1, exodus: 2, leviticus: 3, numbers: 4, deuteronomy: 5, joshua: 6, judges: 7, ruth: 8, "1 samuel": 9, "2 samuel": 10, "1 kings": 11, "2 kings": 12, "1 chronicles": 13, "2 chronicles": 14, ezra: 15, nehemiah: 16, esther: 17, job: 18, psalms: 19, proverbs: 20, ecclesiastes: 21, "song of songs": 22, isaiah: 23, jeremiah: 24, lamentations: 25, ezekiel: 26, daniel: 27, hosea: 28, joel: 29, amos: 30, obadiah: 31, jonah: 32, micah: 33, nahum: 34, habakkuk: 35, zephaniah: 36, haggai: 37, zechariah: 38, malachi: 39, matthew: 40, mark: 41, luke: 42, john: 43, acts: 44, romans: 45, "1 corinthians": 46, "2 corinthians": 47, galatians: 48, ephesians: 49, philippians: 50, Colossians: 51, "1 thessalonians": 52, "2 thessalonians": 53, "1 timothy": 54, "2 timothy": 55, titus: 56, philemon: 57, hebrews: 58, james: 59, "1 peter": 60, "2 peter": 61, "1 john": 62, "2 john": 63, "3 john": 64, jude: 65, revelation: 66,
                "song of solomon": 22
            };
            
            /**
             * Convert Chinese numbers to Arabic numerals.
             *
             * @example convert_numbers("一")       /// Returns "1"
             * @example convert_numbers("十二")     /// Returns "12"
             * @example convert_numbers("三十")     /// Returns "30"
             * @example convert_numbers("四十五")    /// Returns "45"
             * @example convert_numbers("两百")     /// Returns "200"
             * @example convert_numbers("六百七")    /// Returns "670"
             * @example convert_numbers("六百七十")   /// Returns "670"
             * @example convert_numbers("六百七十八") /// Returns "678"
             * @example convert_numbers("六百零九")   /// Returns "609"
             * @example convert_numbers("创世记五十：十五")   /// Returns "创世记50：15"
             * @param   str (string) The text to convert.
             * @return  A string containing the converted numbers, if any
             * @note    This only converts numbers less than one thousand.
             */
            function convert_numbers(str)
            {
                var val = {"一": 1, "二": 2, "两": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9};
                
                ///TODO: Could also look to see if it is just a string of numbers and then treat it like a list of digits.
                return str.replace(/[一二三四五六七八九十百两兩零]+/g, function (hanzi)
                {
                    var char,
                        digits = [],
                        len = hanzi.length,
                        i,
                        place_holder = 1,
                        res = hanzi,
                        tmp_val;
                    
                    for (i = 0; i < len; i += 1) {
                        char = hanzi[i];
                        tmp_val = val[char];
                        
                        /// If the character has a value (i.e., 1-9), add it to the list of digits.
                        if (tmp_val) {
                            digits[digits.length] = {val: tmp_val, place: place_holder, char: char};
                            /// By default, we assume the digit will be in the ones column unless proven otherwise.
                            place_holder = 1;
                        } else {
                            /// 十 (shi) is special since it can stand alone too.
                            if (char === "十") {
                                /// Is it not first?
                                if (digits.length > 0) {
                                    /// Then it is a place marker for the previous digit.
                                    digits[digits.length - 1].place = 10;
                                } else {
                                    /// Otherwise it equals 10.
                                    digits[digits.length] = {val: 1, place: 10, char: char};
                                }
                                place_holder = 1;
                            } else if (char === "百") {
                                /// 百 (bai) is always a place marker.
                                digits[digits.length - 1].place = 100;
                                /// We set the next digit to the tens column by default (e.g., 一百五 equals 150).
                                place_holder = 10;
                            } else if (char === "零") {
                                /// If we find 零 (ling), just reset and assume the next value will be in the ones column unless proven otherwise.
                                place_holder = 1;
                            }
                        }
                    }
                    
                    /// If it didn't find anything, just return the original value.
                    if (digits.length > 0) {
                        /// Now, just total the digits.
                        res = 0;
                        digits.forEach(function (digit)
                        {
                            res += digit.val * digit.place;
                        });
                    }
                    
                    return res;
                });
            }
            
            return function (ref)
            {
                var book,
                    chapter,
                    cv,
                    verse,
                    zeros;
                
                /// First, convert Chinese numbers into Arabic numerals (e.g., "创世记五十：十五" becomes "创世记50：15").
                /// Remove special Chinese words to allow for verse references like this "{book} 第一章".
                /// E.g., "创世记第五章十六节" first becomes "创世记第5章16节" and then becomes "创世记 5 16".
                ///NOTE: The space in " $1$2" is necessary so that two numbers do not get put together.
                ref = convert_numbers(String(ref)).replace(/第(\d+)[章首节節]?|第?(\d+)[章首节節]/g, " $1$2");
                
                book = books[ref.replace(/\s*\d+(?:[,.;:；：，。\s]\d*)?$/, "").toLowerCase()];
                
                if (!book) {
                    return 0;
                }
                
                chapter = "001";
                verse   = "001";
                
                /// Finally, we need to determine the chapter and/or verse reference is they are supplied.
                /// Create an array containing the starting chapter and verse (if any).
                /// Examples:
                ///    "Romans"        => ["Romans"]
                ///    "Romans 3"      => ["Romans", "3", undefined, ""]
                ///    "Romans 3:"     => ["Romans", "3", "",  ""]
                ///    "Romans 3:9"    => ["Romans", "3", "9", ""]
                ///    "Romans 3:9-"   => ["Romans", "3", "9", ""]
                ///    "Romans 3:9-18" => ["Romans", "3", "9", ""]
                ///NOTE: The plus (+) in [；：，。:.;,\s]+ is to match extra spacing possibly added by the first regular expression above.
                cv = ref.split(/\s*([0-9]{1,3})(?:[；：，。:.;,\s]+([0-9]{0,3})[\-0-9]*)?(?:[\d\W]+)?$/);
                
                if (cv.length > 1) {
                    /// Is the number a valid chapter?
                    if (cv[1] > 0) {
                        chapter = String(cv[1]);
                    } else {
                        chapter = "1";
                    }
                    
                    if (cv[2] !== "" && typeof cv[2] !== "undefined") {
                        verse = String(cv[2]);
                    } else {
                        /// For books with only 1 chapter, the chapter reference is optional (i.e., Jude 4 == Jude 1:4).
                        if (this.chapter_count[book] === 1) {
                            verse   = chapter;
                            chapter = "001";
                        }
                    }
                    zeros   = ["", "00", "0", ""];
                    chapter = zeros[chapter.length] + chapter;
                    verse   = zeros[verse.length]   + verse;
                }
                
                return book + chapter + verse;
            };
        }()),
        
        /**
         * Prepares search terms to adhere to Sphinx syntax before submission to the server.
         *
         * Converts special words to symbols, and converts certain characters to a format adhere to Sphinx syntax.
         *
         * @example query = prepare_search("NOT in  the  AND good OR  beginning  ");  /// Returns "-in the & good | beginning  "
         * @example query = prepare_search("ps 16:title");                            /// Returns "ps 16:0"
         * @example query = prepare_search("“God is good”");                          /// Returns '"God is good"' (Note the curly quotes.)
         * @example query = prepare_search('he build El-beth-el "beth-el: because"'); /// Returns 'he build "El beth el" "beth el: because"' (Note the lack of hyphens and added quotes.)
         * @example query = prepare_search("rom 16:subscription");                    /// Returns "rom 16:255" (Verse 255 is used internally by BibleForge for subscriptions.)
         
         * @param   query (string) The terms to be examined.
         * @return  A string that conforms to Sphinx syntax.
         * @note    Called by preform_query() in js/main.js.
         * @note    Replaces AND, OR, and NOT with &, |, and - respectively.
         * @note    Replaces curly quotes with straight.
         * @note    Replaces various hyphens, dashes, and minuses with the standard hyphen (-).
         * @note    This function assumes that whitespace will be trimmed afterward.
         * @todo    Determine if this should be moved out of the language specific file (and maybe just use some language specific variables).
         */
        prepare_query: function (query)
        {
            ///NOTE: /\s+/g gets rid of double spaces within the words (e.g., "here    there" becomes "here there")
            ///      and converts all types of white space to the normal space (e.g., converts non-breaking spaces to normal spaces).
            ///NOTE: /\s+-\s+/g ensures that filter_array() will filter out negative words like "this - that" (i.e., "that" does not need to be highlighted).
            ///NOTE: .replace(/[\u2011－]/g, "-")                              converts non-breaking and fullwidth hyphens into normal hyphens.
            ///NOTE: .replace(/[\u00AD\u2012-\u2015]/g, "")                    removes soft hyphens (\u00AD) and various types of dashes.
            ///NOTE: .replace(/([0-9]+)[:.;,；。；，\s]title/ig, "$1:0")        replaces Psalm title references into an acceptable format (e.g., "Psalm 3:title" becomes "Psalm 3:0").
            ///NOTE: .replace(/([:.;,；。；，\s])subscript(?:ion)?/ig, "$1255") replaces the word "subscription" with the verse number (255) used internally by BibleForge for Pauline subscriptions (e.g., "Philemon subscription" becomes "Philemon 255").
            ///NOTE: "$1255" replaces the text with the first placeholder followed by the literal "255" (without quotes).
            return query.replace(/[０-９]/g, function (number)
            {
                /// Convert fullwidth numbers to normal numbers.
                return String.fromCharCode(number.charCodeAt(0) - 65248);
            }).replace(" IN RED", " AS RED").replace(/\s+/g, " ").replace(/\sAND\s/g, " & ").replace(/\sOR\s/g, " | ").replace(/(?:\s[-－]|\s*\bNOT)\s/g, " -").replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/[\u2011－]/g, "-").replace(/[\u00AD\u2012-\u2015]/g, "").replace(/([0-9]+)[:.;,；。；，\s]title/ig, "$1:0").replace(/([:.;,；。；，\s])subscript(?:ion)?/ig, "$1255").replace(/＊/g, "*")
                /// In order to handle hyphenated words correctly, we treat them as a quoted phrase.
                /// So we need to wrap hyphenated words in quotes (if they are not in a quotation already) and replace the hyphens with spaces.
               .replace(/"[^"]+"?|[^"\s]+/g, function (terms)
                {
                    var prefix = "";
                    
                    /// Is this a negative boolean?
                    /// E.g., "-not"
                    if (terms[0] === "-") {
                        /// Store the hyphen to be appended at the end.
                        prefix = "-";
                        /// Remove the leading hyphen so that it does not add extra space at the beginning after the hyphens are removed.
                        terms = terms.substring(1);
                    }
                    
                    /// Does the rest of the string have a hyphen in it not followed by a number?  If so, remove hyphens; if not, just return the original string.
                    ///NOTE: The reason for testing to see if there is a number is to leave verse ranges as is.
                    ///      E.g., '1:1-2' will not be changed, but 'Bethlehem-judah' will become '"Bethlehem judah"'.
                    if (/-(?!\d|$)/.test(terms)) {
                        /// Replace all hyphens with spaces and trim any possible space that might have been created.
                        /// In case a hyphen was surrounded by spaces, remove any spaces as well.
                        terms = terms.replace(/\s*-+(?!\d|$)\s*/g, " ").trim();
                        
                        /// Was this word not wrapped in double quotes.  If not, then it needs to be now in order to force the words to be found in order.
                        if (terms[0] !== "\"") {
                            terms = "\"" + terms + "\"";
                        }
                    }
                    
                    return prefix + terms;
                });
        }
    };
}(this));
