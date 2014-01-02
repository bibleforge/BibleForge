/**
 * BibleForge
 *
 * @date    10-30-08
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license The MIT License (MIT)
 */

/*!
 * The BibleForge motto:
 *
 * "all things whatsoever ye would that men should do to you, do ye even so to them."
 *     —Jesus (Matthew 7:12)
 */

/*!
 * Copyright (C) 2014
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// Set JSHint options.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, browser:true

/**
 * Create the BibleForge language specific object for the English language.
 *
 * @param  that (object) The global used to attach the code to.
 * @note   The object that is created is used by main.js to preform language specific operations.
 * @return NULL.  Attaches an object containing language specific functions and variables to the global BF object.
 */
(function (that)
{
    "use strict";
    
    var lang_obj;
    
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
    lang_obj = {
        /// Indicate that the code has been downloaded and parsed.
        loaded: true,
        
        /// Indicate the language name so it can be distinguished later.
        full_name:    "English (KJV)",
        short_name:   "KJV",
        abbreviation: "KJV",
        id:           "en",
        
        /// This is used to match the accept-language header to indicate which languages this represents.
        /// See RFC 3282: https://tools.ietf.org/html/rfc3282
        /// This matches "en" and "en-*".
        match_lang: /^en(?:-.*)?$/i,
        
        /// Has this language been linked to the originals?
        linked_to_orig: true,
        
        /// **************************
        /// * Start of unset options *
        /// **************************
        ///NOTE: By not setting these options, they default to undefined (i.e., falsey).  They are just listed below for reference's sake.
        
        /// Does this translation have no paragraph demarcations?
        /// no_paragraphs: false,
        
        /// Indicate that the first verse should not get special CSS.
        /// first_verse_normal: false,
        
        /// Use books_long_main names to create references when searching.
        /// use_main_title: false,
        
        /// ************************
        /// * End of unset options *
        /// ************************
        
        /// Set the language's symbols.
        space: " ",
        chap_separator: ":",
        ndash: "\u2013",
        
        /// Information about this particular Bible translation needed by the server.
        ///NOTE: paragraph_limit can be calculated in the Forge via find_longest_paragraph.js.
        /// The longest paragraph length plus one
        ///NOTE: One is added because it needs to find the paragraph break, which would be demarcated on the next verse when preforming an additional lookup.
        paragraph_limit:        59,
        /// The number of verses to request for a normal verse lookup (It should more than fill up the screen and not need to request more.)
        minimum_desired_verses: 40,
        
        /// Information about different sections of the Bible
        divisions: {
            ///NOTE: Currently, only the division between the Old and New Testaments is needed.
            /// Created in the Forge.
            /// New Testament Division
            nt: 621719
            /// End of New Testament Division
        },
        
        /// Book names
        books_long_main:      ["", "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "Samuel", "Samuel", "The Kings", "The Kings", "Chronicles", "Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Songs", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "The Acts", "Romans", "Corinthians", "Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "Thessalonians", "Thessalonians", "Timothy", "Timothy", "Titus", "Philemon", "Hebrews", "James", "Peter", "Peter", "John", "John", "John", "Jude", "The Revelation"],
        books_long_posttitle: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "of Jeremiah", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "of the Apostles", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "of Jesus Christ"],
        books_long_pretitle:  ["", "The First Book of Moses, called", "The Second Book of Moses, called", "The Third Book of Moses, called", "The Fourth Book of Moses, called", "The Fifth Book of Moses, called", "The Book of", "The Book of", "The Book of", "The First book of", "The Second book of", "The First book of", "The Second book of", "The First book of", "The Second book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Song of", "The Book of", "The Book of", "The Book of the", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Book of", "The Gospel According to", "The Gospel According to", "The Gospel According to", "The Gospel According to", "", "The Epistle of Paul to the", "The First Epistle of Paul to the", "The Second Epistle of Paul to the", "The Epistle of Paul to the", "The Epistle of Paul to the", "The Epistle of Paul to the", "The Epistle of Paul to the", "The First Epistle of Paul to the", "The Second Epistle of Paul to the", "The First Epistle of Paul to", "The Second Epistle of Paul to", "The Epistle of Paul to", "The Epistle of Paul to", "The Epistle of Paul to the", "The Epistle of", "The First Epistle of", "The Second Epistle of", "The First Epistle of", "The Second Epistle of", "The Third Epistle of", "The Epistle of", ""],
        books_short:          ["", "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
        
        /// The Hebrew alphabet (used for Psalm 119)
        hebrew_alphabet: ["Aleph", "Beth", "Gimel", "Daleth", "He", "Vau", "Zayin", "Cheth", "Teth", "Yod", "Kaph", "Lamed", "Mem", "Nun", "Samech", "Ayin", "Pe", "Tsade", "Koph", "Resh", "Shin", "Tau"],
        
        /// The number of chapters in each book of the Bible.
        ///NOTE: Genesis is index 1 (not 0).
        chapter_count: [0, 50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22],
        
        ///TODO: Determine if texts should be categorized.
        /// Miscellaneous Text
        about:             "About BibleForge",                                     /// Context menu item
        about_version:     "About {v}",                                            /// Context menu item (e.g., "About KJV")
        all_lang:          "All languages",                                        /// The heading for language links in the footer of the non-JS version.
        app_name:          "BibleForge",                                           /// The name of the application
        biblical:          "Biblical",                                             /// The short name for the Biblical reconstructed pronunciation displayed on the menu
        biblical_pronun:   "Biblical Reconstructed Pronunciation",                 /// The long name for the Biblical reconstructed pronunciation displayed in a tooltip
        biblical_ipa:      "Biblical IPA",                                         /// The short name for the Biblical reconstructed IPA pronunciation displayed on the menu
        biblical_ipa_long: "Biblical Reconstructed IPA",                           /// The long name for the Biblical reconstructed IPA pronunciation displayed in a tooltip
        blog:              "Blog",                                                 /// Context menu item
        cancel:            "Cancel",                                               /// Cancel button text
        chapter:           "Chapter {num}",                                        /// Chapter headings
        chapter_psalm:     "Psalm {num}",                                          /// The title of chapters in the book of Psalms
        configure:         "Configure",                                            /// Context menu item
        contact:           "Contact",                                              /// Context menu item
        credits:           "<p>The King James Version (KJV) was translated by a group of scholars in England and first printed in 1611. Over the years, the King James version went through many minor revisions. This text is primarily based on the Cambridge family of KJV editions.</p><p>The KJV is in the <a href=\"https://creativecommons.org/publicdomain/mark/1.0/\" target=_blank>public domain</a>.</p>",
        detailed_def:      "Detailed Definition",                                  /// Longer, more detailed definitions caption (in larger callout)
        done:              "Done",                                                 /// The button that closes panels
        err_unknown:       "An error occurred. Please try again.",                 /// A query returned an error for an unspecified reason.
        form_email:        "email: ",                                              /// On the contact panel, indicating Bibleforge's email address
        form_error:        "Sorry, there was an error sending your message. Please try again.", /// An error message stating that the message was not sent properly and asking the user to try again
        form_message:      "Dear Bibleforge...",                                   /// The placeholder for the <textarea> where the user can type a message
        form_your_email:   "Your email (optional)",                                /// Input box placeholder indicating the user's email address (as optional)
        form_your_name:    "Your name (optional)",                                 /// Input box placeholder indicating the user's name (as optional)
        found_plural:      "{num} verses found for <b>{q}</b>",                    /// On the info bar when searching (multiple results
        found_singular:    "{num} verse found for <b>{q}</b>",                     /// On the info bar when searching (one result)
        "in":              "in",                                                   /// Used in the meta description in the non-JavaScript version to indicate the language being used (uncapitalized)
        ///NOTE: This key must be the same as the value in the settings.
        in_paragraphs:     "Paragraphs",                                           /// In the View configuration panel
        ///FIXME: Not all italic words are implied; some are questionable.
        italics_explanation: "This word is implied by context or required in order to translate properly; it was not translated directly from a word in the original languages.", /// When clicking on an italic word
        modern:            "Modern",                                               /// The short name for the modern pronunciation displayed on the menu
        modern_pronun:     "Modern Pronunciation",                                 /// The long name for the modern pronunciation displayed in a tooltip
        modern_ipa:        "Modern IPA",                                           /// The name for the modern IPA pronunciation displayed on the menu and tooltip
        more:              "More",                                                 /// The text for the "[+] More" button on callouts
        next_chap:         "Next Chapter",                                         /// The next chapter link in the non-JavaScript version
        next_psalm:        "Next Psalm",                                           /// The next psalm link in the non-JavaScript version
        night_mode:        "Night Mode",                                           /// In the View configuration panel
        no_results:        "Your search\u200A\u2014\u200A<b>{q}</b>\u200A\u2014\u200Adid not return any results.", /// Displayed when preforming a search that returns no results (NOTE: \u200A are hair spaces and \u2014 are em dashes.)
        previous_chap:     "Previous Chapter",                                     /// The previous chapter link in the non-JavaScript version
        previous_psalm:    "Previous Psalm",                                       /// The previous psalm link in the non-JavaScript version
        psalm:             "Psalm",                                                /// How to reference Psalms in a reference
        query_explanation: "Keyword or Reference: \"God so loved\" or Romans 3:23",/// In a blank query input box before a search has been preformed
        query_button_title:"Click here (or press Enter)",                          /// The text displayed when hovering over the magnifying glass (query button)
        query_button_alt:  "Go",                                                   /// The text to display for the magnifying glass (query button) if images are disabled
        ///NOTE: This key must be the same as the value in the settings.
        red_letters:       "Red Letters",                                          /// In the View configuration panel
        results_for:       "Results for",                                          /// Used in the meta description of searches in the non-JavaScript version to indicate the results for the query.
        send:              "Send",                                                 /// Send a message button text
        subscription:      "subscription",                                         /// Used instead of 255 for subscripts to Paul's epistles (uncapitalized)
        title:             "title",                                                /// Used instead of 0 for Psalm title verse references (uncapitalized)
        translit:          "Transliteration",                                      /// The short name for the SBL transliteration display on the menu
        translit_long:     "Society of Biblical Languages Transliteration",        /// The long name for the SBL transliteration display on a tooltip
        unsupported:       "Sorry, but your browser is not supported. Please update your browser or use the latest version of <a href=\"https://www.mozilla.org/en-US/firefox/new/\" target=_blank>Firefox</a> or <a href=\"https://www.google.com/chrome/\" target=_blank>Chrome</a>. You also may need to enable JavaScript.",
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
        
        
        /**
         * Create the stem_word closure
         *
         * @return A function with variables inside the closure.
         * @note   This function is executed immediately.
         */
        stem_word: (function ()
        {
            /// Create stem arrays for stem_word().
            var step2list = {ational: "ate", tional: "tion", enci: "ence", anci: "ance", izer: "ize", bli: "ble", alli: "al", entli: "ent", eli: "e", ousli: "ous", ization: "ize", ation: "ate", ator: "ate", alism: "al", iveness: "ive", fulness: "ful", ousness: "ous", aliti: "al", iviti: "ive", biliti: "ble", logi: "log", fulli: "ful", lessli: "less"},
                step3list = {icate: "ic", ative: "", alize: "al", iciti: "ic", ical: "ic", ful: "", ness: "", self: ""},
                
                ///TODO: Determine if there is a faster way to do this.  E.g., using an in_array() or isset() function.
                /// Words to ignore that are already the root word but don't look like it.
                stop_words_re = /^(?:th[iu]s|h[ai]s|was|yes|succeed|proceed|e(?:arly|xceed)|only|news)$/i;
            
            /**
             * Convert an English word to its root form.
             *
             * Based on the Porter stemmer in Javascript.
             * Improved for BibleForge.
             *
             * @example root_word = stem_word("loving"); /// Returns "lov[ei]"
             * @param   w (string) Word to stem.
             * @return  Root word string.
             * @todo    Update this (and Sphinx) to the porter2 algorithm.
             * @note    Called by prepare_highlighter() in js/main.js.
             * @link    http://snowball.tartarus.org/algorithms/english/stemmer.html
             * @link    http://www.tartarus.org/~martin/PorterStemmer
             * @todo    Document stem_word() better: give examples (from the KJV if possible) and reasonings for each regular expression, etc.
             * @todo    Review stem_word() for optimizations: avoid regex when possible.
             */
            return function stem_word(w, plain)
            {
                var fp,
                    last_letter,
                    r1,
                    r2,
                    re,
                    re2,
                    re3,
                    re4,
                    stem,
                    suffix;
                
                /// Some quick checking to see if we even need to continue.
                if (w.length < 3) {
                    return w;
                }
                
                if (stop_words_re.test(w)) {
                    return w;
                }
                
                /// ***********
                /// * Step 0a *
                /// ***********
                ///
                /// Search for the longest among the suffixes
                ///     '
                ///     's
                ///     's'
                /// and remove if found.
                                    
                w = w.replace(/'(?:s'?)?$/, "");
                
                /// ***********
                /// * Step 0b *
                /// ***********
                ///
                /// Convert y's at the beginning of a word or after a vowel to upper case to indicate that they are to be treated as consonants.
                /// They are converted back to lower case near the end.
                
                w = w.replace(/(?:^y|([aeiouy])y)/g, "$1Y");
                
                /// ***********
                /// * Step 1a *
                /// ***********
                ///
                /// Find the longest suffix and preform the following:
                /// Replace suffixes: sses             => ss     (witnesses => witness)
                ///                   ??ied+ || ??ies* => ??i    (cried     => cri,      cries => cri)
                ///                   ?ied+  || ?ies*  => ??ie   (tied      => tie,      ties  => tie)
                ///                   {V}{C}s          => {V}{C} (gaps      => gap)
                /// Ignore suffixes:  us+ && ss                  (grievous  => grievous, pass  => pass)
                
                re  = /^(.+?)(ss|i)es$/;
                re2 = /^(.+?)([^s])s$/;
                
                if (re.test(w)) {
                    w = w.replace(re,  "$1$2");
                } else if (re2.test(w)) {
                    w = w.replace(re2, "$1$2");
                }
                
                /// ***********
                /// * Step 1b *
                /// ***********
                ///
                /// Replace "eed" with "ee" if after the first non-vowel following a vowel, or the end of the word if there is no such non-vowel (aka R1).
                ///     agreed => agree
                /// Delete
                ///     ed
                ///     edly
                ///     ing
                ///     ingly
                /// and for Early Modern English
                ///     eth
                ///     est
                ///     edst
                /// if the preceding word part contains a vowel.
                ///
                /// After the deletion:
                /// if the word ends with "at," "bl," or "iz," add "e" (so luxuriat => luxuriate), or
                /// if the word ends with a double remove the last letter (so hopp => hop), or
                /// if the word (syllable) is short, add "e" (so hop => hope)
                
                ///TODO: Also stem "eedly" (porter2).
                re  = /^(.+?)eed$/;
                /// "Present-day" English: re2 = /^(.+?)(ingly|edly|ed|ing|ly)$/;
                re2 = /^(.+?)(ing(?:ly)?|e(?:d(?:ly|st)?|st|th|ly))$/;
                
                if (re.test(w)) {
                    fp = re.exec(w);
                    if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(fp[1])) {
                        w.slice(0, -1);
                    }
                } else if (re2.test(w)) {
                    fp   = re2.exec(w);
                    stem = fp[1];
                    
                    if (/^(?:[^aeiou][^aeiouy]*)?[aeiouy]/.test(stem)) {
                        w   = stem;
                        re2 = /(?:at|bl|iz)$/;
                        re3 = /([^aeiouylsz])\1$/; /// Look for repeating characters.
                        /// Check for a short syllable.
                        re4  = /(?:^[aeiouy][^aeiouy]$|[^aeiouy][aeiouy][^aeiouwxyY]$)/;
                        if (re2.test(w)) {
                            /// TODO: Determine why if (re2.test(w)) and else if (re4.test(w)) should not be merged to the same line since they have the same code following.
                            w += "e";
                        } else if (re3.test(w)) {
                            w = w.slice(0, -1);
                        } else if (re4.test(w)) {
                            w += "e";
                        }
                    }
                }
                
                /// ***********
                /// * Step 1c *
                /// ***********
                ///
                /// Replace y or Y suffixes with i if preceded by a non-vowel which is not the first letter of the word.
                ///     cry => cri
                ///     by  => by
                ///     say => say
                
                re = /^(.+?)[yY]$/;
                
                if (re.test(w)) {
                    fp   = re.exec(w);
                    stem = fp[1];
                    if (/.[^aeiouy]$/.test(stem)) {
                        w = stem + "i";
                    }
                }
                
                /// **********
                /// * Step 2 *
                /// **********
                ///
                /// Replace stems in step2list if after the first non-vowel following a vowel, or the end of the word if there is no such non-vowel (aka R1).
                ///
                /// Current:
                ///     ational => ate
                ///     tional  => tion
                ///     enci    => ence
                ///     anci    => ance
                ///     izer    => ize
                ///     bli     => ble (not in Porter 2)
                ///     alli    => al
                ///     entli   => ent
                ///     eli     => e (not in Porter 2)
                ///     ousli   => ous
                ///     ization => ize
                ///     ation   => ate
                ///     ator    => ate
                ///     alism   => al
                ///     iveness => ive
                ///     fulness => ful
                ///     ousness => ous
                ///     aliti   => al
                ///     iviti   => ive
                ///     biliti  => ble
                ///     logi    => log (not in Porter 2)
                ///     fulli   => ful
                ///     lessli  => less
                ///
                /// Porter 2:
                ///     tional  => tion
                ///     enci    => ence
                ///     anci    => ance
                ///     abli    => able
                ///     entli   => ent
                ///     izer    => ize
                ///     ization => ize
                ///     ational => ate
                ///     ation   => ate
                ///     ator    => ate
                ///     alism   => al
                ///     aliti   => al
                ///     alli    => al
                ///     fulness => ful
                ///     ousli   => ous
                ///     ousness => ous
                ///     iveness => ive
                ///     iviti   => ive
                ///     biliti  => ble
                ///     bli+    => ble
                ///     ogi+    => og (if preceded by l)
                ///     fulli+  => ful
                ///     lessli+ => less
                ///     li+     delete (if preceded by a valid li-ending)
                ///             A valid li-ending is one of these: c, d, e, g, h, k, m, n, r, t.
                
                re = /^(.+?)(a(?:t(?:ion(?:al)?|or)|nci|l(?:li|i(?:sm|ti)))|tional|e(?:n(?:ci|til)|li)|i(?:z(?:er|ation)|v(?:eness|iti))|b(?:li|iliti)|ous(?:li|ness)|ful(?:ness|li)|l(?:ogi|essli))$/;
                r1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
                
                if (re.test(w)) {
                    fp     = re.exec(w);
                    stem   = fp[1];
                    suffix = fp[2];
                    if (r1.test(stem)) {
                        w = stem + step2list[suffix];
                    }
                }
                
                /// **********
                /// * Step 3 *
                /// **********
                ///
                /// Replace stems in step3list if after the first non-vowel following a vowel, or the end of the word if there is no such non-vowel (aka R1).
                ///NOTE: "ative" should be removed if after the first non-vowel following a vowel in R1 or the end of the word, if there is no such non-vowel (aka R2).
                ///
                /// Current:
                ///     icate => ic
                ///     alize => al
                ///     iciti => ic
                ///     ical  => ic
                ///     ative delete
                ///     ful   delete
                ///     ness  delete
                ///     self  delete
                ///
                /// Porter 2:
                ///     tional+  => tion
                ///     ational+ => ate
                ///     alize    => al
                ///     icate    => ic
                ///     iciti    => ic
                ///     ical     => ic
                ///     ful      delete
                ///     ness     delete
                ///     ative*   delete (if in R2)
                
                re = /^(.+?)(ic(?:a(?:te|l)|iti)|a(?:tive|lize)|ful|ness|self)$/;
                
                if (re.test(w)) {
                    fp     = re.exec(w);
                    stem   = fp[1];
                    suffix = fp[2];
                    if (r1.test(stem)) {
                        w = stem + step3list[suffix];
                    }
                }
                
                /// **********
                /// * Step 4 *
                /// **********
                ///
                /// Essentially, delete certain suffixes if found in after the first non-vowel following a vowel in R1 or the end of the word, if there is no such non-vowel (aka R2).
                ///
                /// Possibly delete these suffixes:
                ///     al
                ///     ance
                ///     ence
                ///     er
                ///     ic
                ///     able
                ///     ible
                ///     ant
                ///     ement
                ///     ment
                ///     ent
                ///     ism
                ///     ate
                ///     iti
                ///     ous
                ///     ive
                ///     ize
                ///
                /// The following suffix must also be preceded by an "s" or "t" as well as the other requirements:
                ///     ion
                
                re  = /^(.+?)(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|sm|ti|ve|ze)|ment|ous?)$/;
                re2 = /^(.+?)([st])ion$/;
                r2  = /^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
                
                if (re.test(w)) {
                    fp   = re.exec(w);
                    stem = fp[1];
                    if (r2.test(stem)) {
                        w = stem;
                    }
                } else if (re2.test(w)) {
                    fp   = re2.exec(w);
                    stem = fp[1] + fp[2];
                    if (r2.test(stem)) {
                        w = stem;
                    }
                }
                
                /// **********
                /// * Step 5 *
                /// **********
                ///
                /// Delete "e" if in R2, or in R1 and not preceded by a short syllable.
                ///     creature => creatur
                ///     eye      => eye
                /// Delete "l" if in R2 and preceded by "l":
                ///     fulfill => fulfil
                ///     tell    => tell
                
                re = /^(.+?)e$/;
                
                if (re.test(w)) {
                    fp   = re.exec(w);
                    stem = fp[1];
                    re2  = /^(?:[^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*(?:[aeiouy][aeiou]*)?$/;
                    /// Check for a short syllable.
                    ///NOTE: A short syllable is defined as either a vowel followed by a non-vowel other than w, x or Y and preceded by a non-vowel, or
                    ///      a vowel at the beginning of the word followed by a non-vowel.
                    re3  = /(?:^[aeiouy][^aeiouy]$|[^aeiouy][aeiouy][^aeiouwxyY]$)/;
                    
                    ///NOTE: The only stem that causes false negatives is step 2's "ator" which becomes "ate" (which step 5 would convert from "ate" to "at").
                    ///      Therefore, we must add optional regex to match against the "or" ending.
                    ///      E.g., mediate => mediat(?:or)?
                    ///      Since other words can end in "or" (e.g., "creator"), this must only be applied in special circumstances.
                    ///NOTE: If a word is misspelled (like "mediat"), it will not add the extra regex, so it will return search results but not highlight them correctly.
                    if (r2.test(stem) && stem.slice(-2) === "at") {
                        w = stem + "(?:or)?";
                    } else if (r2.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                        w = stem;
                    }
                } else {
                    if (/ll$/.test(w) && (r2.test(w))) {
                        w = w.slice(0, -1);
                    }
                }
                
                w = w.toLowerCase();
                
                /// In order to match different stemmed versions with regex, convert final y or i to [yi] and final e to [ei].
                ///     love => lov[ei] (therefore it can match "loving" and "hope")
                ///     cri  => cr[yi]  (therefore it can match "cried" and "cry")
                
                last_letter = w.slice(-1);
                
                if (last_letter === "y" || last_letter === "i") {
                    if (plain) {
                        w = w.slice(0, w.length - 1) + "y";
                    } else {
                        w = w.slice(0, w.length - 1) + "[yi]";
                    }
                } else if (last_letter === "e") {
                    if (plain) {
                        w = w.slice(0, w.length - 1) + "e";
                    } else {
                        w = w.slice(0, w.length - 1) + "[ei]";
                    }
                }
                
                return w;
            };
        }()),
        
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
            
            /**
             * Create a regular expression (as a string) that will find a word in its various forms.
             *
             * The regular expression will also ignores common punctuation and capture the word ID from the HTML tag before it.
             *
             * @example reverse_stem("in");     /// Returns "=([0-9]+)>\(*(?:in|[^<]+-in)[),.?!;:—]*[<-]"
             * @example reverse_stem("joyful"); /// Returns "=([0-9]+)>\(*(?:jo[yi]|[^<]+-jo[yi])(?:e|l)?(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|on|sm|t[iy]|ve|ze)|ment|ous?)?(?:ic(?:a(?:te|l)|it[iy])|a(?:tive|lize)|ful|ness|self)?(?:a(?:t(?:ion(?:al)?|or)|nci|l(?:l[iy]|i(?:sm|t[iy])))|tional|e(?:n(?:ci|til)|l[iy])|i(?:z(?:er|ation)|v(?:eness|it[iy]))|b(?:l[iy]|ilit[iy])|ous(?:l[iy]|ness)|fulness|log[iy])?(?:[bdfgmnprt]?(?:i?ng(?:ly)?|e?(?:d(?:ly)?|edst|st|th)|ly))?(?:e[sd]|s)?(?:'(?:s'?)?)?[),.?!;:—]*[<-]"
             * @example reverse_stem("run");    /// Returns "=([0-9]+)>\(*(?:r[au]n|[^<]+-r[au]n)(?:e|l)?(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|on|sm|t[iy]|ve|ze)|ment|ous?)?(?:ic(?:a(?:te|l)|it[iy])|a(?:tive|lize)|ful|ness|self)?(?:a(?:t(?:ion(?:al)?|or)|nci|l(?:l[iy]|i(?:sm|t[iy])))|tional|e(?:n(?:ci|til)|l[iy])|i(?:z(?:er|ation)|v(?:eness|it[iy]))|b(?:l[iy]|ilit[iy])|ous(?:l[iy]|ness)|fulness|log[iy])?(?:[bdfgmnprt]?(?:i?ng(?:ly)?|e?(?:d(?:ly)?|edst|st|th)|ly))?(?:e[sd]|s)?(?:'(?:s'?)?)?[),.?!;:—]*[<-]"
             * @param   term (string) The (lowercase) word to reverse stem.
             * @return  A string that contains a regular expression to match a word in its various forms.
             * @todo    Update the regex created to compensate for changes to the way hyphenation is handled.
             */
            function reverse_stem(term)
            {
                var do_not_add_morph_regex,
                    len_before = term.length,
                    len_after,
                    stemmed_word;
                
                /// First, possibly fix special/unique words that the stemmer wouldn't stem correctly.
                switch (term) {
                case "shalt":
                case "shall":
                    stemmed_word = "shal[lt]";
                    do_not_add_morph_regex = true;
                    break;
                case "wilt":
                case "will":
                    stemmed_word = "wil[lt]";
                    do_not_add_morph_regex = true;
                    break;
                ///NOTE: Could also include "haddest," but that is not found in the current English version.
                case "had":
                case "hadst":
                case "has":
                case "hast":
                case "hath":
                case "have":
                case "having":
                    stemmed_word = "ha(?:d(?:st)?|st?|th|v(?:e|ing))";
                    do_not_add_morph_regex = true;
                    break;
                ///NOTE: "ate" must be here because the stem form is "at," which is ambiguous.
                ///NOTE: See "eat" and "eaten" below also.
                case "ate":
                    stemmed_word = "(?:ate|eat)";
                    break;
                ///NOTE: This is to make "comely" highlight "comeliness" and not "come."
                case "comely":
                    stemmed_word = "comel[yi]";
                    break;
                ///NOTE: This is to highlight "find," "findest," "findeth," and "found" but not "foundation," "founded," or "founder."
                ///NOTE: See "find" and "found" below also.
                case "found":
                    stemmed_word = "f(?:ind(?:e(?:st|th)|ing)?|ound)";
                    do_not_add_morph_regex = true;
                    break;
                case "ye":
                case "you":
                    stemmed_word = "y(?:e|ou)";
                    do_not_add_morph_regex = true;
                    break;
                /// Prevent the word "wast" from highlighting "waste" (or other variants).
                ///NOTE: See "wast" below also.
                case "was":
                case "wast":
                    stemmed_word = "wast?";
                    do_not_add_morph_regex = true;
                    break;
                
                /// Prevent words with no other form having the morphological regex added to the stem.
                case "the":
                case "for":
                case "not":
                /// Because "flies" always refers to the insect (not the verb) and "fly" is always a verb, prevent "flies" from being stemmed.
                ///NOTE: See "fl[yi]" below also.
                case "flies":
                /// Because "goings" is a noun, it should not be stemmed to "go."
                ///NOTE: See "go" below also.
                case "goings":
                    stemmed_word = term;
                    do_not_add_morph_regex = true;
                    break;
                
                /// Try stemming the word and then checking for strong words.
                default:
                    /// Does the word contain a wildcard symbol (*)?
                    if (term.indexOf("*") !== -1) {
                        /// Don't stem; change it to a regex compatible form.
                        ///NOTE: Word breaks are found by looking for tag openings (<) or closings (>).
                        stemmed_word = term.replace(/\*/g, "[^<>]*");
                        do_not_add_morph_regex = true;
                        } else {
                        /// A normal word without a wildcard gets stemmed.
                        stemmed_word = lang_obj.stem_word(term);
                        
                        /// Possibly fix strong words with proper morphological regex.
                        switch (stemmed_word) {
                        case "abid":
                        case "abod":
                            stemmed_word = "ab[io]d[ei]";
                            break;
                        case "aris":
                        case "arisen":
                        case "aros":
                            stemmed_word = "ar[io]s(?:[ei]|en)";
                            break;
                        case "awak":
                        case "awaken":
                        case "awok":
                            stemmed_word = "aw[ao]k(?:en)?";
                            break;
                        case "befal":
                        case "befallen":
                        case "befel":
                            stemmed_word = "bef[ae]ll?(?:en)?";
                            break;
                        case "beheld":
                        case "behold":
                            stemmed_word = "beh[eo]ld";
                            break;
                        case "beseech":
                        case "besought":
                            stemmed_word = "bes(?:eech|ought)";
                            break;
                        case "becam":
                        case "becom":
                            stemmed_word = "bec[ao]m";
                            break;
                        case "began":
                        case "begin":
                        case "begun":
                            stemmed_word = "beg[aiu]n";
                            break;
                        case "beget":
                        case "begot":
                        case "begotten":
                            stemmed_word = "beg[eo]tt?(?:en)?";
                            break;
                        case "bend":
                        case "bent":
                            stemmed_word = "ben[dt]";
                            break;
                        case "bad[ei]":
                        case "bid":
                        case "bidden":
                            stemmed_word = "b(?:ad[ei]|id(?:den)?)";
                            break;
                        case "bind":
                        case "bound":
                            stemmed_word = "b(?:i|ou)nd";
                            break;
                        case "bit":
                        case "bit[ei]":
                        case "bitten":
                            stemmed_word = "bit(?:[ei]|ten)?";
                            break;
                        case "blew":
                        case "blow":
                        case "blown":
                            stemmed_word = "bl[eo]wn?";
                            break;
                        case "bred":
                        case "br[ei]":
                            stemmed_word = "bree?d";
                            break;
                        case "brethren":
                        case "brother":
                            stemmed_word = "br[eo]the?r(?:en)?";
                            break;
                        case "brak[ei]":
                        case "brok[ei]":
                        case "broken":
                            stemmed_word = "br[ao]k[ei](?:en)?";
                            break;
                        case "bring":
                        case "brought":
                        case "brung":
                            stemmed_word = "br(?:ing|ought|ung)";
                            break;
                        case "build":
                        case "built":
                            stemmed_word = "buil[dt]";
                            break;
                        case "burnt":
                        case "burn":
                            stemmed_word = "burnt?";
                            break;
                        case "bought":
                        case "bu[yi]":
                            stemmed_word = "b(?:uy|ought)";
                            break;
                        case "catch":
                        case "caught":
                            stemmed_word = "ca(?:tch|ught)";
                            break;
                        case "cam[ei]":
                        case "com[ei]":
                            /// The negative look ahead (?!l) is to prevent highlighting "comeliness."
                            stemmed_word = "c[ao]m(?:i|e(?!l))";
                            break;
                        case "can":
                        case "canst":
                        case "could":
                            /// The negative look ahead (?!e) is to prevent highlighting "cane."
                            stemmed_word = "c(?:an(?:st)?(?!e)|ould)";
                            break;
                        case "child":
                        case "children":
                            stemmed_word = "child(?:ren)?";
                            break;
                        case "choos":
                        case "chos[ei]":
                        case "chosen":
                            stemmed_word = "cho(?:s(?:en?|i)|ose)";
                            break;
                        case "creep":
                        case "crept":
                            stemmed_word = "cre(?:ep|pt)";
                            break;
                        case "deal":
                        case "dealt":
                            stemmed_word = "dealt?";
                            break;
                        case "did":
                        case "didst":
                        case "do": ///NOTE: "doeth" is stemmed to "do."
                        case "do[ei]":
                        case "don[ei]":
                        case "dost":
                        case "doth":
                            stemmed_word = "d(?:o(?:e(?:st?|th)|ing|ne|st|th)?|id(?:st)?)";
                            /// Since this word is so short, it needs special regex to prevent false positives, so do not add additional morphological regex.
                            do_not_add_morph_regex = true;
                            break;
                        case "draw":
                        case "drawn":
                        case "drew":
                            stemmed_word = "dr[ae]wn?";
                            break;
                        case "driv[ei]":
                        case "driven":
                        case "drov[ei]":
                            stemmed_word = "dr[oi]v[ei]n?";
                            break;
                        case "drank":
                        case "drink":
                        case "drunk":
                            stemmed_word = "dr[aiu]nk";
                            break;
                        case "dig":
                        case "dug":
                            stemmed_word = "d[iu]g";
                            break;
                        case "dwell":
                        case "dwelt":
                            /// The negative look ahead (?!i) is to prevent highlighting "dwelling," "dwellings," "dwellingplace," and "dwellers" but allow for "dwelled."
                            ///NOTE: "dwelling" is primarily used as a noun.
                            stemmed_word = "dwel[lt](?!i)";
                            break;
                        case "di[ei]":
                        case "d[yi]":
                            stemmed_word = "d(?:ie(?:d|th|st)?|ying)";
                            /// Since this word is so short, it needs special regex to prevent false positives, so do not add additional morphological regex.
                            do_not_add_morph_regex = true;
                            break;
                        ///NOTE: See "ate" above also.
                        case "eat":
                        case "eaten":
                            stemmed_word = "(?:ate|eat(?:en)?)";
                            break;
                        ///NOTE: Some versions of the King James Bible use "enquire" and others use "inquire."  BibleForge's uses "inquire."
                        case "enquir":
                        case "enquir[yi]":
                            stemmed_word = "inquir[eiy]?";
                            break;
                        case "fall":
                        case "fallen":
                        case "fell":
                            stemmed_word = "f[ae]ll(?:en)?";
                            break;
                        case "fed":
                        case "feed":
                            stemmed_word = "fee?d";
                            break;
                        case "feet":
                        case "foot":
                            stemmed_word = "f(?:ee|oo)t";
                            break;
                        case "feel":
                        case "felt":
                            stemmed_word = "fe(?:el|lt)";
                            break;
                        case "fight":
                        case "fought":
                            stemmed_word = "f(?:i|ou)ght";
                            break;
                        ///NOTE: This is to highlight "find," "findest," "findeth," and "found" but not "founded" or "foundest."
                        ///NOTE: See "found" above (which is a variant of this word) and "found" below (which is a different word).
                        case "find":
                            stemmed_word = "f(?:ind(?:e(?:st|th)|ing)?|ound)";
                            do_not_add_morph_regex = true;
                            break;
                        ///NOTE: This is actually used to match "founded" and "foundest."
                        ///      Other morphological variants that a user searches for (such as "foundeth") will also correctly use this regex.
                        ///NOTE: See "found" and "find" above (which match forms of another word).
                        case "found":
                            stemmed_word = "founde";
                            do_not_add_morph_regex = true;
                            break;
                        case "fled":
                        case "flee":
                        case "fl[ei]":
                        case "fle[ei]":
                            stemmed_word = "fle[ed]";
                            break;
                        case "flew":
                        case "flown":
                        case "fl[yi]":
                            ///NOTE: See "flies" above also.
                            stemmed_word = "fl(?:ew|i|own?|y)";
                            break;
                        case "forbad":
                        case "forbid":
                        case "forbidden":
                            stemmed_word = "forb[ai]d(?:e|den)?";
                            break;
                        case "foreknew":
                        case "foreknow":
                        case "foreknown":
                            stemmed_word = "forekn[eo]w";
                            break;
                        case "foresaw":
                        case "foreseen":
                        case "fores[ei]":
                            stemmed_word = "fores(?:een?|aw)";
                            break;
                        case "foretel":
                        case "foretold":
                            stemmed_word = "foret(?:ell|old)";
                            break;
                        case "forget":
                        case "forgot":
                        case "forgotten":
                            stemmed_word = "forg[eo]tt?(?:en)?";
                            break;
                        case "forgav":
                        case "forgiv":
                        case "forgiven":
                            stemmed_word = "forg[ai]v[ei]n?";
                            break;
                        case "forsak":
                        case "forsaken":
                        case "forsook":
                            stemmed_word = "fors(?:a|oo)k[ei]n?";
                            break;
                        case "freez":
                        case "froz[ei]":
                        case "frozen":
                            ///NOTE: This word actually only occurs once (as "frozen").
                            stemmed_word = "fr(?:ee|o)z[ei]n?";
                            break;
                        case "gav[ei]":
                        case "giv[ei]":
                        case "given":
                            stemmed_word = "g[ai]v[ei]n?";
                            break;
                        ///NOTE: "gently" stems to "gent".
                        case "gent":
                        case "gentl":
                            stemmed_word = "gentl";
                            break;
                        ///NOTE: See "goings" above also.
                        case "go":
                        case "gon[ei]":
                        case "went":
                            stemmed_word = "(?:go(?:e(?:st|th)|ing|ne)?|went)";
                            /// Because this word is so small and unique, it is easier to white list all of the forms used.
                            do_not_add_morph_regex = true;
                            break;
                        case "get":
                        case "got":
                        case "gotten":
                            stemmed_word = "g[eo]tt?(?:en)?";
                            break;
                        case "graff":
                        case "graft":
                            stemmed_word = "graf[ft]";
                            break;
                        ///NOTE: "haste" is stemmed to "hast."
                        ///NOTE: "hast" is intercepted above, before stemming.
                        case "hast":
                        case "hasten":
                            stemmed_word = "hast[ei]n?";
                            break;
                        case "hear":
                        case "heard":
                            ///NOTE: The negative look ahead (?!t) prevents highlighting "hearth" but allows for other forms.
                            stemmed_word = "heard?(?!t)";
                            break;
                        case "hearken":
                        case "hearkenedst":
                            stemmed_word = "hearken";
                            break;
                        case "held":
                        case "hold":
                            ///NOTE: The word "holds" is used in the Bible only as a noun, such as "strong holds"; however, it is a common Present Day English form.
                            stemmed_word = "h[eo]ld";
                            break;
                        case "hew":
                        case "hewn":
                            stemmed_word = "hewn?";
                            break;
                        case "hid":
                        case "hid[ei]":
                        case "hidden":
                            ///NOTE: The negative look ahead (?!d(?:ek|a)) prevents highlighting "Hiddekel" and "Hiddai" but allows for "hidden."
                            stemmed_word = "hidd?(?:en)?";
                            break;
                        case "hang":
                        case "hung":
                            ///NOTE: "hanging" almost always refers to the noun; "hangings" always does.
                            stemmed_word = "h[au]ng";
                            break;
                        case "keep":
                        case "kept":
                            stemmed_word = "ke(?:ep|pt)";
                            break;
                        case "kneel":
                        case "knelt":
                            stemmed_word = "kne(?:el|lt)";
                            break;
                        case "knew":
                        case "know":
                        case "known":
                            stemmed_word = "kn[eo]wn?";
                            break;
                        case "laid":
                        case "la[yi]":
                            stemmed_word = "la(?:y|id?)";
                            break;
                        case "lad[ei]":
                        case "laden":
                            stemmed_word = "lad(?:en?|i)";
                            break;
                        case "lept":
                        case "leap":
                            stemmed_word = "le(?:ap|pt)";
                            break;
                        ///NOTE: This has conflicts with the adjective form of "left."
                        case "leav":
                        case "left":
                            stemmed_word = "le(?:av|ft)";
                            break;
                        case "lend":
                        case "lent":
                            stemmed_word = "len[dt]";
                            break;
                        case "lain":
                        case "lien":
                        case "li[ei]":
                        case "l[yi]":
                            stemmed_word = "l(?:ain|ien?|y)";
                            break;
                        case "lit":
                        case "light":
                            stemmed_word = "li(?:gh)?t";
                            break;
                        case "mad[ei]":
                        case "mak[ei]":
                            stemmed_word = "ma[dk][ei]";
                            break;
                        case "man":
                        case "men":
                            stemmed_word = "m[ae]n";
                            break;
                        case "met":
                        case "meet":
                            stemmed_word = "mee?t";
                            break;
                        case "mic[ei]":
                        case "mous":
                            stemmed_word = "m(?:ic|ous)[ei]";
                            break;
                        case "mow":
                        case "mown":
                            stemmed_word = "mown?";
                            break;
                        case "overcam":
                        case "overcom":
                            stemmed_word = "overc[ao]m";
                            break;
                        case "overtak":
                        case "overtaken":
                        case "overtook":
                            stemmed_word = "overt(?:a(?:en)?|oo)k";
                            break;
                        case "overthrew":
                        case "overthrow":
                        case "overthrown":
                            stemmed_word = "overthr[eo]wn?";
                            break;
                        case "ox":
                        case "oxen":
                            stemmed_word = "ox(?:en)?";
                            break;
                        case "paid":
                        case "pa[yi]":
                            stemmed_word = "pa(?:id?|y)";
                            break;
                        case "plead":
                        case "pled":
                            ///NOTE: The word "pled" does not actually occur in the Bible, but a user could still search for it.
                            stemmed_word = "plead";
                            break;
                        case "pluck":
                        case "pluckt":
                            stemmed_word = "pluckt?";
                            break;
                        case "rend":
                        case "rent":
                            stemmed_word = "ren[dt]";
                            break;
                        case "repaid":
                        case "repa[yi]":
                            ///NOTE: The word "repaid" does not actually occur in the Bible, but a user could still search for it.
                            stemmed_word = "repa[iy]";
                            break;
                        case "rid[ei]":
                        case "ridden":
                        case "rod[ei]":
                            stemmed_word = "r[oi]d(?:[ei]|den)";
                            break;
                        case "rang":
                        case "ring":
                        case "rung":
                            stemmed_word = "r[aiu]ng";
                            break;
                        case "ris[ei]":
                        case "risen":
                        case "ros[ei]":
                            stemmed_word = "r[io]s[ei]";
                            break;
                        case "ran":
                        case "run":
                            stemmed_word = "r[au]n";
                            break;
                        case "said":
                        case "sa[yi]":
                            stemmed_word = "sa(?:id|y)";
                            break;
                        case "sang":
                        case "sing":
                        case "sung":
                            stemmed_word = "s[aiu]ng";
                            break;
                        case "sank":
                        case "sink":
                        case "sunk":
                            stemmed_word = "s[aiu]nk";
                            break;
                        case "sat":
                        case "sit":
                            stemmed_word = "s[ai]t";
                            break;
                        case "saw":
                        case "see":
                        case "seen":
                            stemmed_word = "s(?:aw|een?)";
                            break;
                        case "seek":
                        case "sought":
                            stemmed_word = "s(?:eek|ought)";
                            break;
                        case "send":
                        case "sent":
                            stemmed_word = "sen[dt]";
                            break;
                        case "sew":
                        case "sewn":
                            stemmed_word = "sewn?";
                            break;
                        case "shak[ei]":
                        case "shaken":
                        case "shook":
                            stemmed_word = "sh(?:ak(?:en?|i)|ook)";
                            break;
                        case "shav[ei]":
                        case "shaven":
                            stemmed_word = "shak(?:en?|i)";
                            break;
                        case "shin[ei]":
                        case "shon[ei]":
                            stemmed_word = "sh[io]n[ei]";
                            break;
                        case "shear":
                        case "shorn":
                            stemmed_word = "sh(?:ear|orn)";
                            break;
                        case "shot":
                        case "shoot":
                            stemmed_word = "shoo?t";
                            break;
                        ///NOTE: Because the word "show" never occurs in the current English Bible (KJV), "shew" already has the correct stemming, and therefore does not need to be modified.
                        case "show":
                            stemmed_word = "shew";
                            break;
                        ///NOTE: Because the word "showbread" never occurs in the current English Bible (KJV), "shewbread" already has the correct stemming, and therefore does not need to be modified.
                        case "showbread":
                            stemmed_word = "shewbread";
                            break;
                        case "shrank":
                        case "shrink":
                        case "shrunk":
                            stemmed_word = "shr[aiu]nk";
                            break;
                        /// This makes "singly" also match "single"
                        case "singl[yi]":
                            stemmed_word = "singl";
                            break;
                        case "slang":
                        case "sling":
                        case "slung":
                            ///NOTE: The word "slung" does not actually occur but could be searched for.
                            stemmed_word = "sl[ai]ng";
                            break;
                        case "sleep":
                        case "slept":
                            stemmed_word = "sle(?:ep|pt)";
                            break;
                        case "sla[yi]":
                        case "slain":
                        case "slew":
                            stemmed_word = "sl(?:a(?:[yi]|in)|ew)";
                            break;
                        case "slid":
                        case "slid[ei]":
                        case "slidden":
                            stemmed_word = "slid(?:[ei]?|den)";
                            break;
                        case "smit[ei]":
                        case "smitten":
                        case "smot[ei]":
                            stemmed_word = "sm(?:[io]t[ei]|itten)";
                            break;
                        case "sell":
                        case "sold":
                            stemmed_word = "s(?:ell|old)";
                            break;
                        case "sow":
                        case "sown":
                            stemmed_word = "sown?";
                            break;
                        case "speak":
                        case "spok[ei]":
                        case "spoken":
                            stemmed_word = "sp(?:eak|ok[ei]n?)";
                            break;
                        case "sped":
                        case "speed":
                            stemmed_word = "spee?d";
                            break;
                        case "spend":
                        case "spent":
                            stemmed_word = "spen[dt]";
                            break;
                        case "spill":
                        case "spilt":
                            stemmed_word = "spil[lt]";
                            break;
                        case "span":
                        case "spin":
                        case "spun":
                            stemmed_word = "sp[aiu]n";
                            break;
                        case "spat":
                        case "spit":
                            stemmed_word = "sp[ai]t";
                            break;
                        case "sprang":
                        case "spring":
                        case "sprung":
                            ///NOTE: The word "spring" occurs both as a noun as well as a verb.
                            stemmed_word = "spr[aiu]ng";
                            break;
                        case "stand":
                        case "stood":
                            stemmed_word = "st(?:an|oo)d";
                            break;
                        case "steal":
                        case "stol[ei]":
                        case "stolen":
                            stemmed_word = "st(?:eal|ol[ei]n?)";
                            break;
                        case "stick":
                        case "stuck":
                            ///NOTE: The word "stick" occurs both as a noun as well as a verb.
                            stemmed_word = "st[iu]ck";
                            break;
                        case "sting":
                        case "stung":
                            ///NOTE: The word "sting" occurs both as a noun as well as a verb.
                            stemmed_word = "st[iu]ng";
                            break;
                        case "stank":
                        case "stink":
                        case "stunk":
                            ///NOTE: The word "stink" occurs both as a noun as well as a verb.
                            ///NOTE: The word "stunk" does not occur but could be searched for.
                            stemmed_word = "st[ia]nk";
                            break;
                        case "strik[ei]":
                        case "struck":
                            stemmed_word = "str(?:ik[ei]|uck)";
                            break;
                        case "striv[ei]":
                        case "striven":
                        case "strov[ei]":
                            stemmed_word = "str[io]v(?:en?|i)";
                            break;
                        case "swam":
                        case "swim":
                        case "swum":
                            stemmed_word = "sw[aiu]m";
                            break;
                        case "sweep":
                        case "swept":
                            stemmed_word = "swe(?:ep|pt)";
                            break;
                        case "swear":
                        case "swor[ei]":
                        case "sworn":
                            stemmed_word = "sw(?:ear|or[ein])";
                            break;
                        case "swell":
                        case "swollen":
                            stemmed_word = "sw(?:ell|ollen)";
                            break;
                        case "tak[ei]":
                        case "taken":
                        case "took":
                            stemmed_word = "t(?:ak[ei]n|ook)";
                            break;
                        case "taught":
                        case "teach":
                            stemmed_word = "t(?:aught|each)";
                            break;
                        case "teeth":
                        case "tooth":
                            stemmed_word = "t(?:ee|oo)th";
                            break;
                        case "tear":
                        case "tor[ei]":
                        case "torn":
                            stemmed_word = "t(?:ear|or[ein])";
                            break;
                        case "tell":
                        case "told":
                            stemmed_word = "t(?:ell|old)";
                            break;
                        case "think":
                        case "thought":
                            stemmed_word = "th(?:ink|ought)";
                            break;
                        case "threw":
                        case "throw":
                        case "thrown":
                            stemmed_word = "thr[eo]wn?";
                            break;
                        case "tread":
                        case "trod":
                        case "trodden":
                            stemmed_word = "tr(?:ead|od(?:den))";
                            break;
                        /// Convert the stemmed form of "tying" to match the word "tie" and other variants.
                        ///NOTE: The word "tying" does not actually occur but might be searched for.
                        case "t[yi]":
                            stemmed_word = "ti[ei]";
                            break;
                        case "understand":
                        case "understood":
                            stemmed_word = "underst(?:an|oo)d";
                            break;
                        case "upheld":
                        case "uphold":
                            stemmed_word = "uph[eo]ld";
                            break;
                        /// Prevent the word "waste" (and other morphological variants) from incorrectly highlighting "wast."
                        ///NOTE: See "was" and "wast" above.
                        case "wast":
                            stemmed_word = "wast(?:e|i)";
                            break;
                        case "wax":
                        case "waxen":
                            stemmed_word = "wax(?:en)?";
                            break;
                        ///NOTE: Since "who" can be searched for in the possessive form (who's), we must match this work after stemming.
                        case "who":
                        case "whom":
                            stemmed_word = "whom?";
                            break;
                        case "whosoev":
                        case "whomsoev":
                            stemmed_word = "whom?soever";
                            break;
                        case "wak[ei]":
                        case "wok[ei]":
                        ///NOTE: The word "woken" does not actually occur but might be searched for.
                        case "woken":
                            stemmed_word = "w[ao]k[ei]";
                            break;
                        case "woman":
                        case "women":
                            stemmed_word = "wom[ae]n";
                            break;
                        /// Convert the stemmed form of "wore" to match the word "wear" and other variants.
                        ///NOTE: The word "wore" does not actually occur but might be searched for.
                        case "wor[ei]":
                        /// Convert the stemmed form of "worn" to match the word "wear" and other variants.
                        ///NOTE: The word "worn" does not actually occur but might be searched for.
                        case "worn":
                            stemmed_word = "wear";
                            break;
                        case "weav":
                        case "wov[ei]":
                        case "woven":
                            stemmed_word = "w(?:ea|o)v[ei]n?";
                            break;
                        case "win":
                        case "won":
                            stemmed_word = "w[io]n";
                            break;
                        case "withdraw":
                        case "withdrawn":
                        case "withdrew":
                            stemmed_word = "withdr[ae]wn?";
                            break;
                        case "withheld":
                        case "withhold":
                        case "withholden":
                            stemmed_word = "withh[eo]ld(?:en)?";
                            break;
                        case "withstand":
                        case "withstood":
                            stemmed_word = "withst(?:an|oo)d";
                            break;
                        case "wring":
                        case "wrung":
                            stemmed_word = "wr[iu]ng";
                            break;
                        case "writ[ei]":
                        case "written":
                        case "wrot[ei]":
                            stemmed_word = "wr[io]t(?:[ei]|ten)";
                            break;
                        case "work":
                        case "wrought":
                            stemmed_word = "w(?:ork|rought)";
                            break;
                        }
                    }
                }
                
                len_after = stemmed_word.length;
                
                ///NOTE:  [<-] finds either the beginning of the close tag (</a>) or a hyphen (-).
                ///       The hyphen is to highlight hyphenated words that would otherwise be missed (matching first word only) (i.e., "Beth").
                ///       ([^>]+-)? finds words where the match is not the first of a hyphenated word (i.e., "Maachah").
                ///       The current English version (KJV) does not use square brackets ([]).
                ///FIXME: The punctuation ,.?!;:)( could be considered language specific.
                ///TODO:  Bench mark different regex (creation and testing).
                if (do_not_add_morph_regex || (len_after === len_before && len_after < 3)) {
                    return "=([0-9]+)>-?\\(*" + stemmed_word + "[),.?!;:—]*[<-]";
                }
                /// Find most words based on stem morphology.
                ///NOTE: [bdfgmnprt]? selects possible doubles.
                return "=([0-9]+)>-?\\(*" + stemmed_word + "(?:e|l)?(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|on|sm|t[iy]|ve|ze)|ment|ous?)?(?:ic(?:a(?:te|l)|it[iy])|a(?:tive|lize)|ful|ness|self)?(?:a(?:t(?:ion(?:al)?|or)|nci|l(?:l[iy]|i(?:sm|t[iy])))|tional|e(?:n(?:ci|til)|l[iy])|i(?:z(?:er|ation)|v(?:eness|it[iy]))|b(?:l[iy]|ilit[iy])|ous(?:l[iy]|ness)|fulness|log[iy])?(?:[bdfgmnprt]?(?:i?ng(?:ly)?|e?(?:d(?:ly)?|edst|st|th)|ly))?(?:e[sd]|s)?(?:['’](?:s['’]?)?)?[),.?!;:—]*[<-]";
            }
            
            /**
             * Prepare search terms for highlighting.
             *
             * Create regex array to search through the verses that will soon be returned by the server.
             *
             * @example BF.lang.prepare_highlighter(q_obj.value);
             * @example BF.lang.prepare_highlighter("search terms"); /// Returns [{regex: /=([0-9]+)>\(*(?:search|[^<]+-search)(?:e|l)?(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|on|sm|t[iy]|ve|ze)|ment|ous?)?(?:ic(?:a(?:te|l)|it[iy])|a(?:tive|lize)|ful|ness|self)?(?:a(?:t(?:ion(?:al)?|or)|nci|l(?:l[iy]|i(?:sm|t[iy])))|tional|e(?:n(?:ci|til)|l[iy])|i(?:z(?:er|ation)|v(?:eness|it[iy]))|b(?:l[iy]|ilit[iy])|ous(?:l[iy]|ness)|fulness|log[iy])?(?:[bdfgmnprt]?(?:i?ng(?:ly)?|e?(?:d(?:ly)?|edst|st|th)|ly))?(?:e[sd]|s)?(?:['’](?:s['’]?)?)?[),.?!;:—]*[<-]/i, word_count: 1}, {regex: /=([0-9]+)>\(*(?:term|[^<]+-term)(?:e|l)?(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|on|sm|t[iy]|ve|ze)|ment|ous?)?(?:ic(?:a(?:te|l)|it[iy])|a(?:tive|lize)|ful|ness|self)?(?:a(?:t(?:ion(?:al)?|or)|nci|l(?:l[iy]|i(?:sm|t[iy])))|tional|e(?:n(?:ci|til)|l[iy])|i(?:z(?:er|ation)|v(?:eness|it[iy]))|b(?:l[iy]|ilit[iy])|ous(?:l[iy]|ness)|fulness|log[iy])?(?:[bdfgmnprt]?(?:i?ng(?:ly)?|e?(?:d(?:ly)?|edst|st|th)|ly))?(?:e[sd]|s)?(?:['’](?:s['’]?)?)?[),.?!;:—]*[<-]/i, word_count: 1}]
             * @example BF.lang.prepare_highlighter("\"in the\" begin*"); /// Returns [{regex: /=([0-9]+)>\(*(?:in|[^<]+-in)[),.?!;:—]*[<-][^<]*[^>]*=([0-9]+)>\(*(?:the|[^<]+-the)[),.?!;:—]*[<-]/i, word_count: 2}, {regex: /=([0-9]+)>\(*(?:begin[^<>]*|[^<]+-begin[^<>]*)[),.?!;:—]*[<-]/i, word_count: 1}]
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
                        stemmed = reverse_stem(search_terms_arr[i]);
                        
                        word_count = 1;
                    /// If it is not a string, then it should be an array of strings.
                    } else {
                        stemmed = "";
                        word_count = search_terms_arr[i].length;
                        /// Loop through each word in the phrase to get a regular expression to highlight it and then combine it with the others.
                        for (j = word_count - 1; j >= 0; j -= 1) {
                            stemmed_tmp = reverse_stem(search_terms_arr[i][j]);
                            if (j > 0) {
                                /// Add a short regular expression to "glue" the regular expressions for each word together to create a regular expression for the entire phrase.
                                /// It also needs to skip over empty words (words that are just an empty HTML tag).
                                /// /[^>]+>*\\s*(?:<[^>]+></[^>]+>)*\\s*<[^>]* is used to skip over HTML tags.
                                stemmed_tmp = "/[^>]+>*\\s*(?:<[^>]+></[^>]+>)*\\s*<[^>]*" + stemmed_tmp;
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
         * @example verse_id = determine_reference("Gen");                      /// Returns "10001001"
         * @example verse_id = determine_reference("first thesalonions 3:10");  /// Returns "52003010" (note the misspelling).
         * @example verse_id = determine_reference("Habakkuk 99:1");            /// Returns "35099001" (note the invalid chapter reference).
         * @example verse_id = determine_reference("love");                     /// Returns 0
         * @param   ref (string) The text that may or may not be a valid verse reference.
         * @return  The verse id of a reference (as a string) or the integer 0 if invalid.
         * @todo    Determine if this should return FALSE on invalid references.
         */
        determine_reference: (function ()
        {
            /// Book Regex
            ///NOTE: Created in the Forge via create_reference_regex.php on 07-16-2013 from ref_array_en.php.
            var books_re = /^(?:1(?: (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?|ngs?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m|t (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m)))|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|2(?: (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?|ngs?)|nd (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m|t cronicles)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|3(?: j(?:no?|o(?:hn|n)?)|j(?:no?|o(?:hn|n)?)|rd j(?:no?|o(?:hn|n)?))|a(?:c(?:t(?: of the apostles?|s(?: of the apostles?)?)?)?|m(?:os?)?|p(?:a(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)|o(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)))|c(?:ant(?:e(?:cles?|sles?)|i(?:cles?|sles?))?|h(?:on|ron(?:i(?:c(?:hles?|les?)|kles?))?)|ol(?:a(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?))|o(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?)))?|rhon)|d(?:a(?:n(?:e(?:il|l)|i(?:el|l))?)?|eu(?:t(?:eron(?:amy|omy)|oronomy)?)?|n|t|u(?:e(?:t(?:eron(?:amy|omy))?)?|t(?:eron(?:amy|omy))?)?)|e(?:c(?:c(?:l(?:es(?:iastes?)?)?)?|l(?:es(?:iast(?:es?|is?))?)?)?|f(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?|p(?:h(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?|r|st(?:er|h(?:er)?)?|x(?:o(?:d(?:us?)?)?)?|z(?:e(?:k(?:i(?:al|el))?)?|k|ra?)?)|first (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|g(?:a(?:l(?:a(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?|e(?:n(?:asis?|esis?|isis?)?)?|ne?)|h(?:a(?:b(?:a(?:c(?:a(?:ck?|k)|u(?:ck?|k))|k(?:a(?:c|k)|k(?:a(?:c|k)|u(?:c|k))|u(?:c|k))))?|g(?:ai|g(?:ai)?)?)?|br?|eb(?:r(?:ews?)?)?|g|o(?:s(?:a(?:ya)?|eah?|ia)?)?)|i(?: (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|i(?: (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m))|i j(?:no?|o(?:hn|n)?)|kin)|kin|s(?:a(?:ah|i(?:ah?|h))?|iah?)?)|j(?:a(?:m(?:es?)?|s)?|b|d(?:gs?|s)?|er(?:amiah?|emiah?|imiah?)?|g(?:ds?|s)?|hn|l|n(?:h|o)?|o(?:b|el?|hn?|l|n(?:ah?)?|s(?:h(?:ua)?)?)?|r|u(?:d(?:e|g(?:es?|s)?)?)?)|k(?:ings?|ngs?)|l(?:a(?:m(?:antati(?:ans?|ons?)|entati(?:ans?|ons?)|intati(?:ans?|ons?))?|v(?:iti(?:c(?:as|us)|k(?:as|us)))?)?|ev(?:iti(?:c(?:as|us?)|k(?:as|us?)))?|ke?|m|u(?:ke?)?|v)|m(?:a(?:kr|l(?:a(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i))|e(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i)))?|rk?|t(?:h(?:e(?:uw|w)|u(?:ew|w))?|t(?:h(?:e(?:uw|w)|u(?:ew|w)))?)?)|ch|i(?:c(?:ah?|hah?)?|k(?:ah?|ea?))?|k|l|rk?|t)|n(?:a(?:h(?:um)?|m)?|e(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?|imiah?)?|i(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?)?|m|u(?:m(?:bers?)?)?)|ob(?:a(?:d(?:iah?)?)?|d)?|p(?:eter?|h(?:i(?:l(?:e(?:m(?:on)?)?|i(?:p(?:i(?:ans?|ons?)|pi(?:ans?|ons?)))?)?)?|lm|m|p)?|r(?:o(?:v(?:erbs?)?)?|v)?|s(?:a(?:lms?)?|s)?|v)|r(?:ev(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?|m|o(?:m(?:ans?|e)?)?|th?|u(?:th?)?|v)|s(?:a(?:lms?|m(?:uel)?)|ec(?: (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|onicles))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:he(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?|im(?:othy)?|m))|ond (?:c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|r(?:hon|on(?:icles)?))|j(?:no?|o(?:hn|n)?)|k(?:gs?|i(?:n(?:gs?)?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:othy)?)?|m)))|gs?|ng|o(?:lomon|n(?:g(?: of so(?:lom(?:an|on)|ngs?)|s(?: of solom(?:an|on))?)?)?))|t(?:h(?:e (?:act(?: of the apostles?|s of the apostles?)|song(?: of so(?:lom(?:an|on)|ngs?)|s of solom(?:an|on)))|ird j(?:no?|o(?:hn|n)?))|i(?:m(?:othy)?|t(?:us?)?)?|m|t)|z(?:a(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?))?|k(?:ariah?|eriah?)?)?|c(?:h|k)?|e(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?)?)?|k(?:ariah?|eriah?)?|p(?:h(?:aniah?|eniah?)?)?)?|k|p))[\d:.;,\-\s]*$/i,
                book_arr_re = [0, /^g(?:e(?:n(?:asis?|esis?|isis?)?)?|ne?)[\d:.;,\-\s]*$/i, /^ex(?:o(?:d(?:us?)?)?)?[\d:.;,\-\s]*$/i, /^l(?:av(?:iti(?:c(?:as|us)|k(?:as|us)))?|ev(?:iti(?:c(?:as|us?)|k(?:as|us?)))?|v)[\d:.;,\-\s]*$/i, /^n(?:m|u(?:m(?:bers?)?)?)[\d:.;,\-\s]*$/i, /^d(?:eu(?:t(?:eron(?:amy|omy)|oronomy)?)?|t|u(?:e(?:t(?:eron(?:amy|omy))?)?|t(?:eron(?:amy|omy))?)?)[\d:.;,\-\s]*$/i, /^jos(?:h(?:ua)?)?[\d:.;,\-\s]*$/i, /^j(?:d(?:gs?|s)?|g(?:ds?|s)?|udg(?:es?|s)?)[\d:.;,\-\s]*$/i, /^r(?:th?|u(?:th?)?)[\d:.;,\-\s]*$/i, /^(?:1(?: s(?:a(?:m(?:uel)?)?|m)|s(?:a(?:m(?:uel)?)?|m|t s(?:a(?:m(?:uel)?)?|m)))|first s(?:a(?:m(?:uel)?)?|m)|i s(?:a(?:m(?:uel)?)?|m)|sam(?:uel)?)[\d:.;,\-\s]*$/i, /^(?:2(?: s(?:a(?:m(?:uel)?)?|m)|nd s(?:a(?:m(?:uel)?)?|m)|s(?:a(?:m(?:uel)?)?|m))|ii s(?:a(?:m(?:uel)?)?|m)|sec(?: s(?:a(?:m(?:uel)?)?|m)|ond s(?:a(?:m(?:uel)?)?|m)))[\d:.;,\-\s]*$/i, /^(?:1(?: k(?:gs?|i(?:n(?:gs?)?)?)|k(?:gs?|i(?:n(?:gs?)?)?|ngs?)|st k(?:gs?|i(?:n(?:gs?)?)?))|first k(?:gs?|i(?:ngs?)?)|i(?: k(?:gs?|i(?:ngs?)?)|kin)|k(?:ings?|ngs?))[\d:.;,\-\s]*$/i, /^(?:2(?: k(?:gs?|i(?:n(?:gs?)?)?)|k(?:gs?|i(?:n(?:gs?)?)?|ngs?)|nd k(?:gs?|i(?:n(?:gs?)?)?))|ii(?: k(?:gs?|i(?:n(?:gs?)?)?)|kin)|sec(?: k(?:gs?|i(?:n(?:gs?)?)?)|ond k(?:gs?|i(?:n(?:gs?)?)?)))[\d:.;,\-\s]*$/i, /^(?:1(?: c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))|st c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?)))|c(?:h(?:on|ron(?:i(?:c(?:hles?|les?)|kles?))?)|rhon)|first c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))|i c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?)))[\d:.;,\-\s]*$/i, /^(?:2(?: c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))|nd c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on))|st cronicles)|ii c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))|sec(?: c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)|r(?:hon|onicles))|ond c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|r(?:hon|on(?:icles)?))))[\d:.;,\-\s]*$/i, /^e(?:r|zra?)[\d:.;,\-\s]*$/i, /^n(?:e(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?|imiah?)?|i(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?)?)[\d:.;,\-\s]*$/i, /^est(?:er|h(?:er)?)?[\d:.;,\-\s]*$/i, /^j(?:b|ob)[\d:.;,\-\s]*$/i, /^(?:ps(?:a(?:lms?)?|s)?|salms?)[\d:.;,\-\s]*$/i, /^p(?:r(?:o(?:v(?:erbs?)?)?|v)?|v)[\d:.;,\-\s]*$/i, /^ec(?:c(?:l(?:es(?:iastes?)?)?)?|l(?:es(?:iast(?:es?|is?))?)?)?[\d:.;,\-\s]*$/i, /^(?:cant(?:e(?:cles?|sles?)|i(?:cles?|sles?))?|s(?:gs?|ng|o(?:lomon|n(?:g(?: of so(?:lom(?:an|on)|ngs?)|s(?: of solom(?:an|on))?)?)?))|the song(?: of so(?:lom(?:an|on)|ngs?)|s of solom(?:an|on)))[\d:.;,\-\s]*$/i, /^is(?:a(?:ah|i(?:ah?|h))?|iah?)?[\d:.;,\-\s]*$/i, /^j(?:er(?:amiah?|emiah?|imiah?)?|r)[\d:.;,\-\s]*$/i, /^l(?:a(?:m(?:antati(?:ans?|ons?)|entati(?:ans?|ons?)|intati(?:ans?|ons?))?)?|m)[\d:.;,\-\s]*$/i, /^ez(?:e(?:k(?:i(?:al|el))?)?|k)?[\d:.;,\-\s]*$/i, /^d(?:a(?:n(?:e(?:il|l)|i(?:el|l))?)?|n)[\d:.;,\-\s]*$/i, /^ho(?:s(?:a(?:ya)?|eah?|ia)?)?[\d:.;,\-\s]*$/i, /^j(?:l|o(?:el?|l))[\d:.;,\-\s]*$/i, /^am(?:os?)?[\d:.;,\-\s]*$/i, /^ob(?:a(?:d(?:iah?)?)?|d)?[\d:.;,\-\s]*$/i, /^j(?:nh|on(?:ah?)?)[\d:.;,\-\s]*$/i, /^m(?:ch|i(?:c(?:ah?|hah?)?|k(?:ah?|ea?))?)[\d:.;,\-\s]*$/i, /^na(?:h(?:um)?|m)?[\d:.;,\-\s]*$/i, /^ha(?:b(?:a(?:c(?:a(?:ck?|k)|u(?:ck?|k))|k(?:a(?:c|k)|k(?:a(?:c|k)|u(?:c|k))|u(?:c|k))))?)?[\d:.;,\-\s]*$/i, /^z(?:ep(?:h(?:aniah?|eniah?)?)?|p)[\d:.;,\-\s]*$/i, /^h(?:ag(?:ai|g(?:ai)?)?|g)[\d:.;,\-\s]*$/i, /^z(?:a(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?))?|k(?:ariah?|eriah?)?)?|c(?:h|k)?|e(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?)?)?|k(?:ariah?|eriah?)?)?|k)[\d:.;,\-\s]*$/i, /^m(?:al(?:a(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i))|e(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i)))?|l)[\d:.;,\-\s]*$/i, /^m(?:at(?:h(?:e(?:uw|w)|u(?:ew|w))?|t(?:h(?:e(?:uw|w)|u(?:ew|w)))?)?|t)[\d:.;,\-\s]*$/i, /^m(?:a(?:kr|rk?)|k|rk?)[\d:.;,\-\s]*$/i, /^l(?:ke?|u(?:ke?)?)[\d:.;,\-\s]*$/i, /^j(?:hn|no?|o(?:hn?)?)[\d:.;,\-\s]*$/i, /^(?:ac(?:t(?: of the apostles?|s(?: of the apostles?)?)?)?|the act(?: of the apostles?|s of the apostles?))[\d:.;,\-\s]*$/i, /^r(?:m|o(?:m(?:ans?|e)?)?)[\d:.;,\-\s]*$/i, /^(?:1(?: co(?:r(?:inthi(?:ans?|ons?))?)?|co(?:r(?:inthi(?:ans?|ons?))?)?|st co(?:r(?:inthi(?:ans?|ons?))?)?)|first co(?:r(?:inthi(?:ans?|ons?))?)?|i co(?:r(?:inthi(?:ans?|ons?))?)?)[\d:.;,\-\s]*$/i, /^(?:2(?: co(?:r(?:inthi(?:ans?|ons?))?)?|co(?:r(?:inthi(?:ans?|ons?))?)?|nd co(?:r(?:inthi(?:ans?|ons?))?)?)|ii co(?:r(?:inthi(?:ans?|ons?))?)?|sec(?: co(?:r(?:inthi(?:ans?|ons?))?)?|ond co(?:r(?:inthi(?:ans?|ons?))?)?))[\d:.;,\-\s]*$/i, /^ga(?:l(?:a(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?[\d:.;,\-\s]*$/i, /^e(?:f(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?|p(?:h(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?)[\d:.;,\-\s]*$/i, /^ph(?:i(?:l(?:i(?:p(?:i(?:ans?|ons?)|pi(?:ans?|ons?)))?)?)?|p)?[\d:.;,\-\s]*$/i, /^col(?:a(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?))|o(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?)))?[\d:.;,\-\s]*$/i, /^(?:1(?: th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|st th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)|first th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)[\d:.;,\-\s]*$/i, /^(?:2(?: th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|nd th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)|ii th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|sec(?: the(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?|ond th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?))[\d:.;,\-\s]*$/i, /^(?:1(?: t(?:i(?:m(?:othy)?)?|m)|st t(?:i(?:m(?:othy)?)?|m)|t(?:i(?:m(?:othy)?)?|m))|first t(?:i(?:m(?:othy)?)?|m)|i t(?:i(?:m(?:othy)?)?|m)|t(?:i(?:m(?:othy)?)?|m))[\d:.;,\-\s]*$/i, /^(?:2(?: t(?:i(?:m(?:othy)?)?|m)|nd t(?:i(?:m(?:othy)?)?|m)|t(?:i(?:m(?:othy)?)?|m))|ii t(?:i(?:m(?:othy)?)?|m)|sec(?: t(?:im(?:othy)?|m)|ond t(?:i(?:m(?:othy)?)?|m)))[\d:.;,\-\s]*$/i, /^t(?:it(?:us?)?|t)[\d:.;,\-\s]*$/i, /^ph(?:ile(?:m(?:on)?)?|lm|m)[\d:.;,\-\s]*$/i, /^h(?:br?|eb(?:r(?:ews?)?)?)[\d:.;,\-\s]*$/i, /^ja(?:m(?:es?)?|s)?[\d:.;,\-\s]*$/i, /^(?:1(?: p(?:e(?:t(?:er?)?)?|t)|p(?:e(?:t(?:er?)?)?|t)|st p(?:e(?:t(?:er?)?)?|t))|first p(?:e(?:t(?:er?)?)?|t)|i p(?:e(?:t(?:er?)?)?|t)|peter?)[\d:.;,\-\s]*$/i, /^(?:2(?: p(?:e(?:t(?:er?)?)?|t)|nd p(?:e(?:t(?:er?)?)?|t)|p(?:e(?:t(?:er?)?)?|t))|ii p(?:e(?:t(?:er?)?)?|t)|sec(?: p(?:e(?:t(?:er?)?)?|t)|ond p(?:e(?:t(?:er?)?)?|t)))[\d:.;,\-\s]*$/i, /^(?:1(?: j(?:no?|o(?:hn|n)?)|j(?:no?|o(?:hn|n)?)|st j(?:no?|o(?:hn|n)?))|first j(?:no?|o(?:hn|n)?)|i j(?:no?|o(?:hn|n)?))[\d:.;,\-\s]*$/i, /^(?:2(?: j(?:no?|o(?:hn|n)?)|j(?:no?|o(?:hn|n)?)|nd j(?:no?|o(?:hn|n)?))|ii j(?:no?|o(?:hn|n)?)|sec(?: j(?:no?|o(?:hn|n)?)|ond j(?:no?|o(?:hn|n)?)))[\d:.;,\-\s]*$/i, /^(?:3(?: j(?:no?|o(?:hn|n)?)|j(?:no?|o(?:hn|n)?)|rd j(?:no?|o(?:hn|n)?))|iii j(?:no?|o(?:hn|n)?)|third j(?:no?|o(?:hn|n)?))[\d:.;,\-\s]*$/i, /^ju(?:de?)?[\d:.;,\-\s]*$/i, /^(?:ap(?:a(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)|o(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?))|r(?:ev(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?|v))[\d:.;,\-\s]*$/i];
            
            return function (ref)
            {
                var book = 0,
                    chapter,
                    cv,
                    verse,
                    zeros;
                
                /// First determine if it is likely a verse reference.
                if (!books_re.test(ref)) {
                    return 0;
                }
                
                switch (ref.slice(0, 1).toLowerCase()) {
                case "j":
                    if (book_arr_re[43].test(ref)) {        /// John
                        book = "43";
                        break;
                    } else if (book_arr_re[32].test(ref)) { /// Jonah
                        book = "32";
                        break;
                    } else if (book_arr_re[59].test(ref)) { /// James
                        book = "59";
                        break;
                    } else if (book_arr_re[6].test(ref)) {  /// Joshua
                        book = "6";
                        break;
                    } else if (book_arr_re[7].test(ref)) {  /// Judges
                        book = "7";
                        break;
                    } else if (book_arr_re[18].test(ref)) { /// Job
                        book = "18";
                        break;
                    } else if (book_arr_re[65].test(ref)) { /// Jude
                        book = "65";
                        break;
                    } else if (book_arr_re[24].test(ref)) { /// Jeremiah
                        book = "24";
                        break;
                    } else if (book_arr_re[29].test(ref)) { /// Joel
                        book = "29";
                        break;
                    }
                    break;
                case "r":
                    if (book_arr_re[45].test(ref)) {        /// Romans
                        book = "45";
                        break;
                    } else if (book_arr_re[66].test(ref)) { /// Revelation
                        book = "66";
                        break;
                    } else if (book_arr_re[8].test(ref)) {  /// Ruth
                        book = "8";
                        break;
                    }
                    break;
                case "g":
                    if (book_arr_re[1].test(ref)) {         /// Genesis
                        book = "1";
                        break;
                    } else if (book_arr_re[48].test(ref)) { /// Galatians
                        book = "48";
                        break;
                    }
                    break;
                case "e":
                    if (book_arr_re[2].test(ref)) {         /// Exodus
                        book = "2";
                        break;
                    } else if (book_arr_re[49].test(ref)) { /// Ephesians
                        book = "49";
                        break;
                    } else if (book_arr_re[26].test(ref)) { /// Ezekiel
                        book = "26";
                        break;
                    } else if (book_arr_re[21].test(ref)) { /// Ecclesiastes
                        book = "21";
                        break;
                    } else if (book_arr_re[17].test(ref)) { /// Esther
                        book = "17";
                        break;
                    } else if (book_arr_re[15].test(ref)) { /// Ezra
                        book = "15";
                        break;
                    }
                    break;
                case "m":
                    if (book_arr_re[40].test(ref)) {        /// Matthew
                        book = "40";
                        break;
                    } else if (book_arr_re[41].test(ref)) { /// Mark
                        book = "41";
                        break;
                    } else if (book_arr_re[39].test(ref)) { /// Malachi
                        book = "39";
                        break;
                    } else if (book_arr_re[33].test(ref)) { /// Micah
                        book = "33";
                        break;
                    }
                    break;
                case "l":
                    if (book_arr_re[42].test(ref)) {        /// Luke
                        book = "42";
                        break;
                    } else if (book_arr_re[3].test(ref)) {  /// Leviticus
                        book = "3";
                        break;
                    } else if (book_arr_re[25].test(ref)) { /// Lamentations
                        book = "25";
                        break;
                    }
                    break;
                case "p":
                    if (book_arr_re[19].test(ref)) {        /// Psalms
                        book = "19";
                        break;
                    } else if (book_arr_re[20].test(ref)) { /// Proverbs
                        book = "20";
                        break;
                    } else if (book_arr_re[50].test(ref)) { /// Philippians
                        book = "50";
                        break;
                    } else if (book_arr_re[57].test(ref)) { /// Philemon
                        book = "57";
                        break;
                    } else if (book_arr_re[60].test(ref)) { /// 1 Peter (Peter)
                        book = "60";
                        break;
                    }
                    break;
                case "d":
                    if (book_arr_re[5].test(ref)) {         /// Deuteronomy
                        book = "5";
                        break;
                    } else if (book_arr_re[27].test(ref)) { /// Daniel
                        book = "27";
                        break;
                    }
                    break;
                case "i":
                    if (book_arr_re[23].test(ref)) {        /// Isaiah
                        book = "23";
                        break;
                    }
                    ///NOTE: Don't break so that references like "I Kings" will be checked.
                    /* falls through */
                case "1":
                case "f":
                    if (book_arr_re[46].test(ref)) {        /// 1 Corinthians | First Corinthians| I Corinthians
                        book = "46";
                        break;
                    } else if (book_arr_re[62].test(ref)) { /// 1 John | First John | I John
                        book = "62";
                        break;
                    } else if (book_arr_re[54].test(ref)) { /// 1 Timothy | First Timothy | I Timothy
                        book = "54";
                        break;
                    } else if (book_arr_re[52].test(ref)) { /// 1 Thessalonians | First Thessalonians | I Thessalonians
                        book = "52";
                        break;
                    } else if (book_arr_re[60].test(ref)) { /// 1 Peter | First Peter | I Peter
                        book = "60";
                        break;
                    } else if (book_arr_re[9].test(ref)) {  /// 1 Samuel | First Samuel | I Samuel
                        book = "9";
                        break;
                    } else if (book_arr_re[11].test(ref)) { /// 1 Kings | First Kings | I Kings
                        book = "11";
                        break;
                    } else if (book_arr_re[13].test(ref)) { /// 1 Chronicles | First Chronicles | I Chronicles
                        book = "13";
                        break;
                    }
                    ///NOTE: Don't break so that references like "II Kings" will be checked.
                    /* falls through */
                case "2":
                case "s":
                    if (book_arr_re[47].test(ref)) {        /// 2 Corinthians | Second Corinthians| II Corinthians
                        book = "47";
                        break;
                    } else if (book_arr_re[63].test(ref)) { /// 2 John | Second John | II John
                        book = "63";
                        break;
                    } else if (book_arr_re[55].test(ref)) { /// 2 Timothy | Second Timothy | II Timothy
                        book = "55";
                        break;
                    } else if (book_arr_re[53].test(ref)) { /// 2 Thessalonians | Second Thessalonians | II Thessalonians
                        book = "53";
                        break;
                    } else if (book_arr_re[61].test(ref)) { /// 2 Peter | Second Peter | II Peter
                        book = "61";
                        break;
                    } else if (book_arr_re[22].test(ref)) { /// Song of Songs
                        book = "22";
                        break;
                    } else if (book_arr_re[10].test(ref)) { /// 2 Samuel | Second Samuel | II Samuel
                        book = "10";
                        break;
                    } else if (book_arr_re[12].test(ref)) { /// 2 Kings | Second Kings | II Kings
                        book = "12";
                        break;
                    } else if (book_arr_re[14].test(ref)) { /// 2 Chronicles | Second Chronicles | II Chronicles
                        book = "14";
                        break;
                    } else if (book_arr_re[9].test(ref)) {  /// 1 Samuel (Samuel)
                        book = "9";
                        break;
                    } else if (book_arr_re[19].test(ref)) { /// Psalms (Salms)
                        book = "19";
                        break;
                    }
                    ///NOTE: Don't break so that references like "III John" will be checked.
                    /* falls through */
                case "3":
                case "t":
                    if (book_arr_re[64].test(ref)) {        /// 3 John | Third John | III John
                        book = "64";
                        break;
                    } else if (book_arr_re[56].test(ref)) { /// Titus
                        book = "56";
                        break;
                    } else if (book_arr_re[54].test(ref)) { /// 1 Timothy (Timothy)
                        book = "54";
                        break;
                    } else if (book_arr_re[52].test(ref)) { /// 1 Thessalonians (Thessalonians)
                        book = "52";
                        break;
                    } else if (book_arr_re[44].test(ref)) { /// The Acts of the Apostles
                        book = "44";
                        break;
                    } else if (book_arr_re[22].test(ref)) { /// The Song of Songs
                        book = "22";
                        break;
                    }
                    break;
                case "a":
                    if (book_arr_re[44].test(ref)) {        /// Acts
                        book = "44";
                        break;
                    } else if (book_arr_re[30].test(ref)) { /// Amos
                        book = "30";
                        break;
                    } else if (book_arr_re[66].test(ref)) { /// Revelation (Apocalypse)
                        book = "66";
                        break;
                    }
                    break;
                case "c":
                    if (book_arr_re[51].test(ref)) {        /// Colossians
                        book = "51";
                        break;
                    } else if (book_arr_re[46].test(ref)) { /// 1 Corinthians (Corinthians)
                        book = "46";
                        break;
                    } else if (book_arr_re[22].test(ref)) { /// Song of Songs (Canticles)
                        book = "22";
                        break;
                    } else if (book_arr_re[13].test(ref)) { /// 1 Chronicles (Chronicles)
                        book = "13";
                        break;
                    }
                    break;
                case "h":
                    if (book_arr_re[58].test(ref)) {        /// Hebrews
                        book = "58";
                        break;
                    } else if (book_arr_re[28].test(ref)) { /// Hosea
                        book = "28";
                        break;
                    } else if (book_arr_re[35].test(ref)) { /// Habakkuk
                        book = "35";
                        break;
                    } else if (book_arr_re[37].test(ref)) { /// Haggai
                        book = "37";
                        break;
                    }
                    break;
                case "n":
                    if (book_arr_re[4].test(ref)) {         /// Numbers
                        book = "4";
                        break;
                    } else if (book_arr_re[16].test(ref)) { /// Nehemiah
                        book = "16";
                        break;
                    } else if (book_arr_re[34].test(ref)) { /// Nahum
                        book = "34";
                        break;
                    }
                    break;
                case "z":
                    if (book_arr_re[38].test(ref)) {        /// Zechariah
                        book = "38";
                        break;
                    } else if (book_arr_re[36].test(ref)) { /// Zephaniah
                        book = "36";
                        break;
                    }
                    break;
                case "k":
                    if (book_arr_re[11].test(ref)) {        /// 1 Kings (Kings)
                        book = "11";
                        break;
                    }
                    break;
                case "o":
                    if (book_arr_re[31].test(ref)) {        /// Obadiah
                        book = "31";
                        break;
                    }
                    break;
                }
                
                /// If it is not a verse reference, return 0 now.
                if (book === 0) {
                    return 0;
                }
                
                /// Set the default chapter and verse.
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
                cv = ref.split(/\s*([0-9]{1,3})(?:[:.;,\s]([0-9]{0,3})[\-0-9]*)?(?:[\d:.;,\-\s]+)?$/);
                
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
                    /// Since verseID's require chapters and verses to be three digits, add in leading zeros, if necessary.
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
         * @example query = prepare_search("rom 16:subscription");                    /// Returns "rom 16:255" (Verse 255 is used internally by BibleForge for Pauline subscriptions.)
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
            ///NOTE: .replace(/\u2011/g, "-")                           converts non-breaking hyphens into normal hyphens.
            ///NOTE: .replace(/[\u00AD\u2012-\u2015]/g, "")             removes soft hyphens (\u00AD) and various types of dashes.
            ///NOTE: .replace(/([0-9]+)[:.;,\s]title/ig, "$1:0")        replaces Psalm title references into an acceptable format (e.g., "Psalm 3:title" becomes "Psalm 3:0").
            ///NOTE: .replace(/([:.;,\s])subscript(?:ion)?/ig, "$1255") replaces the word "subscription" with the verse number (255) used internally by BibleForge for Pauline subscriptions (e.g., "Philemon subscription" becomes "Philemon 255").
            ///NOTE: "$1255" replaces the text with the first placeholder followed by the literal "255" (without quotes).
            ///NOTE: \\+$ removes the trailing back slashes that are so easy to hit by accident when pressing Enter.
            return query.replace(" IN RED", " AS RED").replace(/\s+/g, " ").replace(/\sAND\s/g, " & ").replace(/\sOR\s/g, " | ").replace(/(?:\s-|\s*\bNOT)\s/g, " -").replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\u2011/g, "-").replace(/[\u00AD\u2012-\u2015]/g, "").replace(/([0-9]+)[:.;,\s]title/ig, "$1:0").replace(/([:.;,\s])subscript(?:ion)?/ig, "$1255").replace(/\\+$/, "")
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
    
    that.BF.langs.en = lang_obj;
}(this));
