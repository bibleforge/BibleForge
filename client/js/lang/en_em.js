/**
 * BibleForge
 *
 * @date    12-30-12
 * @version alpha (α)
 * @link    http://BibleForge.com
 * @license GNU Affero General Public License 3.0 (AGPL-3.0)
 * @author  BibleForge <info@bibleforge.com>
 */

/**
 * Copyright (C) 2012
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

/// Declare globals for JSLint.
/*global window, BF */

/// Set JSLint options.
/*jslint continue: true, regexp: true, indent: 4, white: true */

/// Indicate all object properties used.  JSLint checks this list for misspellings.
/*properties
    ABBREVIATED, ACCUSATIVE, ACTIVE, ADJECTIVE, ADVERB, AEOLIC, 
    AMBIGUOUS_CORRELATIVE_INTERROGATIVE_PRONOUN, AMBIGUOUS_MIDDLE_PASSIVE, 
    AMBIGUOUS_MIDDLE_PASSIVE_DEPONENT, AORIST, APOCOPATED, ARAMAIC, ATTIC, 
    COMPARATIVE, CONDITIONAL, CONJUNCTION, CONTRACTED, CORRELATIVE_PRONOUN, 
    DATIVE, DEFINITE_ARTICLE, DEMONSTRATIVE_PRONOUN, DIVINE, FEMININE, 
    FIRST_FORM, FIRST_PERSON, FUTURE, GENITIVE, HEBREW, IMPERATIVE, 
    IMPERATIVE_SENSE_PARTICIPLE, IMPERFECT, IMPERSONAL_ACTIVE, IMPLIED, 
    INDECLINABLE, INDEFINITE_PRONOUN, INDICATIVE, INFINITIVE, INJECTIVE, 
    INTERROGATIVE, INTERROGATIVE_PRONOUN, IRREGULAR, LETTER, MASCULINE, MIDDLE, 
    MIDDLE_DEPONENT, MIDDLE_SIGNIFICANCE, NEGATIVE, NEUTER, NOMINATIVE, 
    NORMAL_NOUN, NOUN, NO_TENSE_STATED, NO_VOICE_STATED, NUMERICAL, OPTATIVE, 
    OTHER, PARTICIPLE, PARTICLE, PARTICLE_ATTACHED, PASSIVE, PASSIVE_DEPONENT, 
    PERFECT, PERSONAL_PRONOUN, PLUPERFECT, PLURAL, POSESSIVE_PRONOUN, 
    PREPOSITION, PRESENT, PRONOUN, PROPER_NOUN, RECIPROCAL_PRONOUN, RED, 
    REFLEXIVE_PRONOUN, RELATIVE_PRONOUN, SECOND_FORM, SECOND_PERSON, SINGULAR, 
    SUBJUNCTIVE, SUPERLATIVE, THIRD_PERSON, TRANSITIVE, VERB, VOCATIVE, about, 
    alism, aliti, alize, alli, anci, app_name, ation, ational, ative, ator, 
    biblical, biblical_ipa, biblical_ipa_long, biblical_pronun, biliti, bli, 
    blog, books_long_main, books_long_posttitle, books_long_pretitle, 
    books_short, chapter, chapter_count, configure, determine_reference, done, 
    eli, en_em, enci, entli, exec, found_plural, found_singular, ful, full_name, 
    fulness, grammar_keywords, grammar_marker, grammar_marker_len, 
    grammar_separator, help, ical, icate, iciti, id, in_paragraphs, indexOf, 
    italics_explanation, iveness, iviti, ization, izer, langs, length, 
    linked_to_orig, loaded, logi, modern, modern_ipa, modern_pronun, ness, 
    no_results1, no_results2, ousli, ousness, prepare_highlighter, prepare_query, 
    psalm, query_button_alt, query_button_title, query_explanation, red_letters, 
    replace, self, short_name, slice, split, subscription, test, tional, title, 
    toLowerCase, translit, translit_long, view, wrench_title
*/

/**
 * Create the BibleForge language specific object for Early Modern English.
 *
 * @note    The object that is created is used by main.js to preform language specific operations.
 * @return  Returns an object containing language specific functions and variables.
 */
BF.langs.en_em = (function ()
{
    "use strict";
    
    /// Return the language variables and functions.
    return {
        /// Incidate that the code has been downloaded and parsed.
        loaded: true,
        
        /// Indicate the language name so it can be distinguished later.
        full_name:  "Early Modern English (1611)",
        short_name: "1611",
        id:         "en_em",
        
        linked_to_orig: false,
        
        /// Information about this particular Bible translation needed by the server.
        ///NOTE: paragraph_limit can be calculated in the Forge via find_longest_paragraph.js.
        paragraph_limit:        76, /// The longest paragraph length
        minimum_desired_verses: 40, /// The number of verses to request for a normal verse lookup (It should more than fill up the screen.)
        
        /// Information about different sections of the Bible
        divisions: {
            ///NOTE: Currently, only the division between the Old and New Testaments is needed.
            /// Calculated via find_beginning_of_nt.js.
            nt: 610569
        },
        
        /// Book names
        books_long_main:      ["", "Genesis", "Exodus", "Leuiticus", "Numbers", "Deuteronomie", "Ioshua", "Iudges", "Ruth", "Samuel", "Samuel", "The Kings", "The Kings", "Chronicles", "Chronicles", "Ezra", "Nehemiah", "Esther", "Iob", "Psalmes", "The Prouerbes", "Ecclesiastes", "Solomon", "Prophet Isaiah", "Prophet Ieremiah", "The Lamentations", "Prophet Ezekiel", "Daniel", "Hosea", "Ioel", "Amos", "Obadiah", "Ionah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Marke", "Luke", "Iohn", "The Actes of", "Epistle of Paul the", "of Paul the Apostle to the", "of Paul the Apostle to the", "Paul to the Galatians", "the Apostle to the Ephesians", "the Apostle to the Philippians", "the Apostle to the Colossians", "Paul the Apostle to the Thessalonians", "of Paul the Apostle to the", "of Paul the Apostle to Timothie", "of Paul the Apostle to Timothie", "Paul to Titus", "Paul to Philemon", "the Apostle to the Hebrewes", "Epistle of Iames", "generall of Peter", "generall of Peter", "generall of Iohn", "The second Epistle of Iohn", "The third Epistle of Iohn", "Epistle of Iude", "The Reuelation"],
        books_long_posttitle: ["", "", "", "", "", "", "", "", "", "otherwise called, The first Booke of the Kings", "otherwise called, The second Booke of the Kings", "commonly called, The third Booke of the Kings", "commonly called, The fourth Booke of the Kings", "", "", "", "", "", "", "", "", "or the Preacher", "", "", "", "of Ieremiah", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "the Apostles", "Apostle to the Romanes", "Corinthians", "Corinthians", "", "", "", "", "", "Thessalonians", "", "", "", "", "", "", "", "", "", "", "", "", "of Iesus Christ"],
        books_long_pretitle:  ["", "The First Booke of Moses, called", "The Second Booke of Moses, called", "The Third Booke of Moses, called", "The Fourth Booke of Moses, called", "The Fifth Booke of Moses, called", "The Booke of", "The Booke of", "The Booke of", "The First Booke of", "The Second Booke of", "The First Booke of", "The Second Booke of", "The First Booke of the", "The Second Booke of the", "", "The Booke of", "The Booke of", "The Booke of", "The Booke of", "", "", "The Song of", "The Booke of the", "The Booke of the", "", "The Booke of the", "The Booke of", "", "", "", "", "", "", "", "", "", "", "", "", "The Gospel According to", "The Gospel According to", "The Gospel According to", "The Gospel According to", "", "The", "The First Epistle", "The Second Epistle", "The Epistle of", "The Epistle of Paul", "The Epistle of Paul", "The Epistle of Paul", "The First Epistle of", "The Second Epistle", "The First Epistle", "The Second Epistle", "The Epistle of", "The Epistle of", "The Epistle of Paul", "The Generall", "The First Epistle", "The Second Epistle", "The First Epistle", "", "", "The Generall", ""],
        books_short:          ["", "Genesis", "Exodus", "Leuiticus", "Numbers", "Deuteronomie", "Ioshua", "Iudges", "Ruth", "I Samuel", "II Samuel", "I Kings", "II Kings", "I Chronicles", "II Chronicles", "Ezra", "Nehemiah", "Esther", "Iob", "Psalmes", "Prouerbes", "Ecclesiastes", "Song of Solomon", "Isaiah", "Ieremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Ioel", "Amos", "Obadiah", "Ionah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Marke", "Luke", "Iohn", "Actes", "Romanes", "I Corinthians", "II Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "I Thessalonians", "II Thessalonians", "I Timothie", "II Timothie", "Titus", "Philemon", "Hebrewes", "Iames", "I Peter", "II Peter", "I Iohn", "II Iohn", "III Iohn", "Iude", "Reuelation"],
        
        /// The number of chapters in each book of the Bible.
        ///NOTE: Genesis is index 1 (not 0).
        chapter_count: [0, 50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22],
        
        ///TODO: Determine if texts should be categorized.
        /// Miscellaneous Text
        about:             "About",                                               /// Context menu item
        app_name:          "BibleForge",                                          /// The name of the application
        biblical:          "Biblical",                                            /// The short name for the Biblical reconstructed pronunciation displayed on the menu
        biblical_pronun:   "Biblical Reconſtructed Pronunciation",                /// The long name for the Biblical reconstructed pronunciation displayed in a tooltip
        biblical_ipa:      "Biblical IPA",                                        /// The short name for the Biblical reconstructed IPA pronunciation displayed on the menu
        biblical_ipa_long: "Biblical Reconſtructed IPA",                          /// The long name for the Biblical reconstructed IPA pronunciation displayed in a tooltip
        blog:              "Weblog",                                              /// Context menu item
        chapter:           "Chapter",                                             /// Chapter headings
        configure:         "Configure",                                           /// Context menu item
        done:              "Finiſh",                                              /// The button that closes panels
        found_plural:      " verſes found for ",                                  /// On the info bar when searching (multiple results)
        found_singular:    " verſe found for ",                                   /// On the info bar when searching (one result)
        help:              "Succor",                                              /// Context menu item
        ///NOTE: This key must be the same as the value in the settings.
        in_paragraphs:     "Paragraphs",                                          /// In the View configuration panel
        ///FIXME: Not all italic words are implied; some are questionable.
        italics_explanation: "This word is implied by context or required in order to translate properly; it was not translated directly from a word in the original languages.", /// When clicking on an italic word
        modern:            "Modern",                                              /// The short name for the modern pronunciation displayed on the menu
        modern_pronun:     "Modern Pronunciation",                                /// The long name for the modern pronunciation displayed in a tooltip
        modern_ipa:        "Modern IPA",                                          /// The name for the modern IPA pronunciation displayed on the menu and tooltip
        no_results1:       "Your search\u200A\u2014\u200A",                       /// Displayed when preforming a search that returns no results (before the search terms).
        no_results2:       "\u200A\u2014\u200Adid not return any results.",       /// Displayed when preforming a search that returns no results (after the search terms).
        psalm:             "Psalme",                                              /// The title of chapters in the book of Psalms
        query_explanation: 'Keyword or Reference: "God ſo loued" or Romans 3:23', /// In a blank query input box before a search has been preformed
        query_button_title:"Click here (or preſſe Enter)",                        /// The text displayed when hovering over the magnifying glass (query button).
        query_button_alt:  "Goe",                                                 /// The text to display for the magnifying glass (query button) if images are disabled.
        ///NOTE: This key must be the same as the value in the settings.
        red_letters:       "Red Letters",                                         /// In the View configuration panel
        subscription:      "subscription",                                        /// Used instead of 255 for subscripts to Paul's epistles
        title:             "title",                                               /// Used instead of 0 for Psalm title verse references
        translit:          "Tranſliteration",                                     /// The short name for the SBL transliteration display on the menu
        translit_long:     "Society of Biblical Languages Tranſliteration",       /// The long name for the SBL transliteration display on a tooltip
        view:              "View",                                                /// The title of a configuration panel
        ///TODO: Determine if the app_name should be dynamically appended to the string below or if it should be done in the build system
        wrench_title:      "Cuſtomiſe & Configure BibleForge",                    /// The text displayed when hovering over the wrench menu
        
        
        prepare_highlighter: (function ()
        {
            /**
             * Create the stem_word closure
             *
             * @return A function with variables inside the closure.
             * @note   This function is executed immediately.
             * @todo   Adapt for Early Modern English.
             */
            var stem_word = (function ()
            {
                /// Create stem arrays for stem_word().
                var step2list = {ational: "ate", tional: "tion", enci: "ence", anci: "ance", izer: "ize", bli: "ble", alli: "al", entli: "ent", eli: "e", ousli: "ous", ization: "ize", ation: "ate", ator: "ate", alism: "al", iveness: "ive", fulness: "ful", ousness: "ous", aliti: "al", iviti: "ive", biliti: "ble", logi: "log"},
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
                return function stem_word(w)
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
                    re2 = /^(.+?)(ing(?:ly)?|e(?:d(?:ly|st)?|st|th)|ly)$/;
                    
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
                        if (/^.[^aeiouy]/.test(stem)) {
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
                    ///     bli     => ble
                    ///     alli    => al
                    ///     entli   => ent
                    ///     eli     => e
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
                    ///     logi    => log
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
                    
                    re = /^(.+?)(a(?:t(?:ion(?:al)?|or)|nci|l(?:li|i(?:sm|ti)))|tional|e(?:n(?:ci|til)|li)|i(?:z(?:er|ation)|v(?:eness|iti))|b(?:li|iliti)|ous(?:li|ness)|fulness|logi)$/;
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
                        w = w.slice(0, w.length - 1) + "[yi]";
                    } else if (last_letter === "e") {
                        w = w.slice(0, w.length - 1) + "[ei]";
                    }
                    
                    return w;
                };
            }());
            
            
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
                    final_search_arr    = [],
                    i,
                    initial_search_arr,
                    j,
                    new_arr_len         = 0;
                
                /// Remove punctuation and break up the query string into individual parts to filter out duplicates.
                ///NOTE: (?:^|\s)- makes sure not to filter out hyphenated words by ensuring that a hyphen must occur at the beginning or before a space to be counted as a NOT operator.
                ///NOTE: (?:"[^"]*"?|[^\s]*) matches a phrase starting with a double quote (") or a single word.
                ///NOTE: [~\/]\d* removes characters used for Sphinx query syntax.  I.e., proximity searches ("this that"~10) and quorum matching ("at least three of these"/3).
                ///NOTE: -\B removes trailing hyphens.  (This might be unnecessary.)
                ///NOTE: '(?!s\b) removes that are not followed by an "s" and only an "s."
                initial_search_arr = search_terms.replace(/(?:(?:^|\s)-(?:"[^"]*"?|[^\s]*)|[~\/]\d*|[",.:?!;&|\)\(\]\[\/\\`{}<$\^+]|-\B|'(?!s\b))/g, "").toLowerCase().split(" ");
                
                arr_len = initial_search_arr.length;
                
                /// Filter out duplicates (i.e., PHP's array_unique()).
first_loop:     for (i = 0; i < arr_len; i += 1) {
                    /// Skip empty strings.
                    if (initial_search_arr[i] !== "") {
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
                
                return final_search_arr;
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
             * @todo    Adapt for Early Modern English.
             */
            return function prepare_highlighter(search_terms)
            {
                var add_morph_regex,
                    count           = 0,
                    highlight_regex = [],
                    i               = 0,
                    j,
                    len_before,
                    len_after,
                    term,
                    stemmed_arr     = [],
                    search_terms_arr,
                    search_terms_arr_len,
                    stemmed_word;
                
                search_terms_arr     = filter_terms_for_highlighter(search_terms);
                search_terms_arr_len = search_terms_arr.length;
                
                ///TODO: Determine if a normal FOR loop would be better.
first_loop:     while (i < search_terms_arr_len) {
                    term       = search_terms_arr[i];
                    len_before = term.length;
                    i += 1;
                    
                    /// Possibly fix special/unique words that the stemmer won't stem correctly.
                    switch (term) {
                    case "shalt":
                    case "shall":
                        stemmed_word = "shal[lt]";
                        add_morph_regex = false;
                        break;
                    case "wilt":
                    case "will":
                        stemmed_word = "wil[lt]";
                        add_morph_regex = false;
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
                        add_morph_regex = false;
                        break;
                    ///NOTE: "ate" must be here because the stem form is "at," which is ambiguous.
                    ///NOTE: See "eat" and "eaten" below also.
                    case "ate":
                        stemmed_word = "(?:ate|eat)";
                        add_morph_regex = true;
                        break;
                    ///NOTE: This is to make "comely" highlight "comeliness" and not "come."
                    case "comely":
                        stemmed_word = "comel[yi]";
                        add_morph_regex = true;
                        break;
                    ///NOTE: This is to highlight "find," "findest," "findeth," and "found" but not "foundation," "founded," or "founder."
                    ///NOTE: See "find" and "found" below also.
                    case "found":
                        stemmed_word = "f(?:ind(?:e(?:st|th)|ing)?|ound)";
                        add_morph_regex = false;
                        break;
                    case "ye":
                    case "you":
                        stemmed_word = "y(?:e|ou)";
                        add_morph_regex = false;
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
                        add_morph_regex = false;
                        break;
                    
                    /// Try stemming the word and then checking for strong words.
                    default:
                        /// Does the word contain a wildcard symbol (*)?
                        if (term.indexOf("*") !== -1) {
                            /// Don't stem; change it to a regex compatible form.
                            ///NOTE: Word breaks are found by looking for tag openings (<) or closings (>).
                            stemmed_word = term.replace(/\*/g, "[^<>]*");
                            add_morph_regex = false;
                        } else {
                            /// A normal word without a wildcard gets stemmed.
                            stemmed_word = stem_word(term);
                            add_morph_regex = true;
                            
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
                                stemmed_word = "b[ae]fell?(?:en)?";
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
                            case "do":
                            case "do[ei]":
                            case "don[ei]":
                            case "dost":
                            case "doth":
                                stemmed_word = "d(?:o(?:est?|ne|st|th)?|id(?:st)?)";
                                /// Since this word is so short, it needs special regex to prevent false positives, so do not add additional morphological regex.
                                add_morph_regex = false;
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
                                add_morph_regex = false;
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
                                add_morph_regex = false;
                                break;
                            ///NOTE: This is actually used to match "founded" and "foundest."
                            ///      Other morphological variants that a user searches for (such as "foundeth") will also correctly use this regex.
                            ///NOTE: See "found" and "find" above (which match forms of another word).
                            case "found":
                                stemmed_word = "founde";
                                add_morph_regex = false;
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
                                ///NOTE: This word actually only occurs once (as "forzen").
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
                                add_morph_regex = false;
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
                            case "leep":
                                stemmed_word = "le(?:ep|pt)";
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
                    
                    /// Skip words that are the same after stemming or regex'ing (e.g., "joyful joy" becomes "joy joy").
                    for (j = 0; j < count; j += 1) {
                        if (stemmed_word === stemmed_arr[j]) {
                            ///NOTE: This is the same as "continue 2" in PHP.
                            continue first_loop;
                        }
                    }
                    
                    len_after = stemmed_word.length;
                    
                    stemmed_arr[count] = stemmed_word;
                    
                    ///NOTE:  [<-] finds either the beginning of the close tag (</a>) or a hyphen (-).
                    ///       The hyphen is to highlight hyphenated words that would otherwise be missed (matching first word only) (i.e., "Beth").
                    ///       ([^>]+-)? finds words where the match is not the first of a hyphenated word (i.e., "Maachah").
                    ///       The current English version (KJV) does not use square brackets ([]).
                    ///FIXME: The punctuation ,.?!;:)( could be considered language specific.
                    ///TODO:  Bench mark different regex (creation and testing).
                    if (!add_morph_regex || (len_after === len_before && len_after < 3)) {
                        highlight_regex[count] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")[),.?!;:]*[<-]", "i");
                    } else {
                        /// Find most words based on stem morphology.
                        ///NOTE: [bdfgmnprt]? selects possible doubles.
                        highlight_regex[count] = new RegExp("=([0-9]+)>\\(*(?:" + stemmed_word + "|[^<]+-" + stemmed_word + ")(?:e|l)?(?:a(?:l|n(?:ce|t)|te|ble)|e(?:n(?:ce|t)|r|ment)|i(?:c|ble|on|sm|t[iy]|ve|ze)|ment|ous?)?(?:ic(?:a(?:te|l)|it[iy])|a(?:tive|lize)|ful|ness|self)?(?:a(?:t(?:ion(?:al)?|or)|nci|l(?:l[iy]|i(?:sm|t[iy])))|tional|e(?:n(?:ci|til)|l[iy])|i(?:z(?:er|ation)|v(?:eness|it[iy]))|b(?:l[iy]|ilit[iy])|ous(?:l[iy]|ness)|fulness|log[iy])?(?:[bdfgmnprt]?(?:i?ng(?:ly)?|e?(?:d(?:ly)?|edst|st|th)|ly))?(?:e[sd]|s)?(?:'(?:s'?)?)?[),.?!;:]*[<-]", "i");
                    }
                    count += 1;
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
         * @example verse_id = determine_reference("love");                     /// Returns FALSE
         * @param   ref (string) The text that may or may not be a valid verse reference.
         * @return  The verse id of a reference (as a string) or the integer 0 if invalid.
         * @todo    Adapt further for Early Modern English.
         */
        determine_reference: (function ()
        {
            /// Book Regex
            ///NOTE: Created in the Forge via create_reference_regex.php on 05-19-2012 from ref_array_en_em.php.
            var books_re = /^(?:1(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?|ngs?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m|t (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)))|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|2(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?|ngs?)|nd (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m|t cronicles)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|3(?: (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|kings)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|kings|rd (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|kings))|4(?: kings|kings|th kings)|a(?:c(?:t(?: of the apostles?|e(?: of the apostles?|s(?: of the apostles?)?)?|s(?: of the apostles?)?)?)?|m(?:os?)?|p(?:a(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)|o(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)))|c(?:ant(?:e(?:cles?|sles?)|i(?:cles?|sles?))?|h(?:on|ron(?:i(?:c(?:hles?|les?)|kles?))?)|ol(?:a(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?))|o(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?)))?)|d(?:a(?:n(?:e(?:il|l)|i(?:el|l))?)?|e(?:u(?:t(?:eron(?:am(?:ie|y)|om(?:ie|y))|oronom(?:ie|y))?)?|v(?:t(?:eron(?:am(?:ie|y)|om(?:ie|y)))?)?)|n|t|u(?:e(?:t(?:eron(?:amy|omy))?)?|t(?:eron(?:amy|om(?:ie|y)))?)?|v(?:e|t(?:eronom(?:ie|y))?)?)|e(?:c(?:c(?:l(?:es(?:iastes?)?)?)?|l(?:es(?:iast(?:es?|is?))?)?)?|f(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?|p(?:h(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?|r|st(?:er|h(?:er)?)?|x(?:o(?:d(?:us?|vs?)?)?)?|z(?:e(?:k(?:i(?:al|el))?)?|k|ra?)?)|f(?:irst (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|epistle (?:generall of peter|of peter)|generall epistle of peter|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|ourth kings)|g(?:a(?:l(?:a(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?|e(?:n(?:asis?|e(?:rall epistle of (?:i(?:ames|ude)|j(?:ames|ude))|sis?)|isis?)?)?|ne?)|h(?:a(?:b(?:a(?:c(?:a(?:ck?|k)|u(?:ck?|k))|k(?:a(?:c|k)|k(?:a(?:c|k)|u(?:c|k)|vk)|u(?:c|k)|vk)))?|g(?:ai|g(?:ai)?)?)?|br?|eb(?:r(?:ew(?:es?|s)?)?)?|g|o(?:s(?:a(?:ya)?|eah?|ia)?)?)|i(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|a(?:m(?:es?)?|s)?|b|d(?:gs?|s)?|er(?:amiah?|emiah?|imiah?)?|g(?:ds?|s)?|hn|i(?: (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|i(?: (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|kings)|i kings|j kings)|j (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|kings))|j (?:c(?:h(?:r(?:on)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:an|on)|saloni(?:an|on))?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|l|nh?|o(?:b|el?|hn?|l|n(?:ah?)?|s(?:h(?:ua|va)?)?)?|r|s(?:a(?:ah|i(?:ah?|h))?|iah?)?|u(?:d(?:e|g(?:es?|s)?)?)?|v(?: kings|dg(?:es?|s)?))|j(?:a(?:m(?:es?)?|s)?|b|d(?:gs?|s)?|er(?:amiah?|emiah?|imiah?)?|g(?:ds?|s)|hn|l|nh?|o(?:b|el?|hn?|l|n(?:ah?)?|s(?:h(?:ua|va)?)?)?|r|u(?:d(?:e|g(?:es?|s)?)?)?|vdg(?:es?|s)?)|k(?:ings?|ngs?)|l(?:a(?:m(?:antati(?:ans?|ons?)|entati(?:ans?|ons?)|intati(?:ans?|ons?))?|v(?:iti(?:c(?:as|us)|k(?:as|us)))?)?|e(?:u(?:iti(?:c(?:as|us)|kus))?|v(?:iti(?:c(?:as|us?)|k(?:as|us?)))?)|ke?|m|u(?:ke?)?|v(?:ke?)?)|m(?:a(?:kre?|l(?:a(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i))|e(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i)))?|r(?:ke?)?|t(?:h(?:e(?:uw|vw|w)|u(?:ew|w)|v(?:ew|w))?|t(?:h(?:e(?:uw|vw|w)|u(?:ew|w)|v(?:ew|w)))?)?)|ch|i(?:c(?:ah?|hah?)?|k(?:ah?|ea?))?|ke?|l|r(?:ke?)?|t)|n(?:a(?:h(?:um|vm)?|m)?|e(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?|imiah?)?|i(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?)?|m|u(?:m(?:bers?)?)?|v(?:m(?:bers?)?)?)|ob(?:a(?:d(?:iah?)?)?|d)?|p(?:eter?|h(?:i(?:l(?:e(?:m(?:on)?)?|i(?:p(?:i(?:ans?|ons?)|pi(?:ans?|ons?)))?)?)?|lm|m|p)?|r(?:o(?:u(?:erb(?:es?|s)?)?|v(?:erbs?)?)?|u|v)?|s(?:a(?:lm(?:es?|s)?)?|s)?|u|v)|r(?:e(?:u(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?|v(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?)|m|o(?:m(?:an(?:es?|s)?|e)?)?|th?|u(?:th?)?|v(?:th?)?)|s(?:a(?:lm(?:es?|s)?|m(?:uel|vel)?)|ec(?: c(?:hr(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?|ronicles)|ond (?:c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|o(?:r(?:inthi(?:ans?|ons?))?)?|ron(?:icles)?)|epistle (?:generall of peter|of peter)|generall epistle of peter|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|k(?:gs?|i(?:ngs?)?)|p(?:e(?:t(?:er?)?)?|t)|s(?:a(?:m(?:uel|vel)?)?|m)|t(?:h(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)))|g|ng|o(?:lomon|n(?:g(?: of so(?:lom(?:an|on)|ngs?)|s(?: of solom(?:an|on))?)?)?))|t(?:h(?:e (?:act(?: of the apostles?|e(?: of the apostles?|s of the apostles?)|s of the apostles?)|epistle generall of (?:i(?:ames|ude)|j(?:ames|ude))|first (?:epistle general(?: of peter|l of peter)|generall epistle of peter)|general(?: epistle of (?:i(?:ames|ude)|j(?:ames|ude))|l epistle of (?:i(?:ames|ude)|j(?:ames|ude)))|s(?:econd (?:epistle general(?: of peter|l of peter)|generall epistle of peter)|ong(?: of so(?:lom(?:an|on)|ngs?)|s of solom(?:an|on))))|ird (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|kings))|i(?:m(?:oth(?:eus|ie|y))?|t(?:us?)?)?|m|t)|z(?:a(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?))?|k(?:ariah?|eriah?)?)?|c(?:h|k)?|e(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?)?)?|k(?:ariah?|eriah?)?|p(?:h(?:aniah?|eniah?)?)?)?|k|p))[\s0-9:.;,\-]*$/i,
                book_arr_re = [0, /^g(?:e(?:n(?:asis?|esis?|isis?)?)?|ne?)[\s0-9:.;,\-]*$/i, /^ex(?:o(?:d(?:us?|vs?)?)?)?[\s0-9:.;,\-]*$/i, /^l(?:av(?:iti(?:c(?:as|us)|k(?:as|us)))?|e(?:u(?:iti(?:c(?:as|us)|kus))?|v(?:iti(?:c(?:as|us?)|k(?:as|us?)))?)|v)[\s0-9:.;,\-]*$/i, /^n(?:m|u(?:m(?:bers?)?)?|v(?:m(?:bers?)?)?)[\s0-9:.;,\-]*$/i, /^d(?:e(?:u(?:t(?:eron(?:am(?:ie|y)|om(?:ie|y))|oronom(?:ie|y))?)?|v(?:t(?:eron(?:am(?:ie|y)|om(?:ie|y)))?)?)|t|u(?:e(?:t(?:eron(?:amy|omy))?)?|t(?:eron(?:amy|om(?:ie|y)))?)?|v(?:e|t(?:eronom(?:ie|y))?)?)[\s0-9:.;,\-]*$/i, /^(?:ios(?:h(?:ua|va)?)?|jos(?:h(?:ua|va)?)?)[\s0-9:.;,\-]*$/i, /^(?:i(?:d(?:gs?|s)?|g(?:ds?|s)?|udg(?:es?|s)?|vdg(?:es?|s)?)|j(?:d(?:gs?|s)?|g(?:ds?|s)|udg(?:es?|s)?|vdg(?:es?|s)?))[\s0-9:.;,\-]*$/i, /^r(?:th?|u(?:th?)?|vth?)[\s0-9:.;,\-]*$/i, /^(?:1(?: s(?:a(?:m(?:uel|vel)?)?|m)|s(?:a(?:m(?:uel|vel)?)?|m|t s(?:a(?:m(?:uel|vel)?)?|m)))|first s(?:a(?:m(?:uel|vel)?)?|m)|i s(?:a(?:m(?:uel|vel)?)?|m)|sam(?:uel|vel)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: s(?:a(?:m(?:uel|vel)?)?|m)|nd s(?:a(?:m(?:uel|vel)?)?|m)|s(?:a(?:m(?:uel|vel)?)?|m))|i(?:i s(?:a(?:m(?:uel|vel)?)?|m)|j s(?:a(?:m(?:uel)?)?|m))|second s(?:a(?:m(?:uel|vel)?)?|m))[\s0-9:.;,\-]*$/i, /^(?:1(?: k(?:gs?|i(?:ngs?)?)|k(?:gs?|i(?:ngs?)?|ngs?)|st k(?:gs?|i(?:ngs?)?))|3(?: kings|kings|rd kings)|first k(?:gs?|i(?:ngs?)?)|i(?: k(?:gs?|i(?:ngs?)?)|i(?:i kings|j kings))|k(?:ings?|ngs?)|third kings)[\s0-9:.;,\-]*$/i, /^(?:2(?: k(?:gs?|i(?:ngs?)?)|k(?:gs?|i(?:ngs?)?|ngs?)|nd k(?:gs?|i(?:ngs?)?))|4(?: kings|kings|th kings)|fourth kings|i(?:i(?: k(?:gs?|i(?:ngs?)?)|i(?:i kings|j kings))|j k(?:gs?|i(?:ngs?)?)|v kings)|second k(?:gs?|i(?:ngs?)?))[\s0-9:.;,\-]*$/i, /^(?:1(?: c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)|st c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?))|ch(?:on|ron(?:i(?:c(?:hles?|les?)|kles?))?)|first c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)|i c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?))[\s0-9:.;,\-]*$/i, /^(?:2(?: c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)|c(?:h(?:on|r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)|nd c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron)|st cronicles)|i(?:i c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)|j c(?:h(?:r(?:on)?)?|ron(?:icles)?))|sec(?: c(?:hr(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?|ronicles)|ond c(?:h(?:r(?:on(?:i(?:c(?:hles?|les?)|kles?))?)?)?|ron(?:icles)?)))[\s0-9:.;,\-]*$/i, /^e(?:r|zra?)[\s0-9:.;,\-]*$/i, /^n(?:e(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?|imiah?)?|i(?:amiah?|emiah?|h(?:amiah?|emiah?|imiah?)?)?)[\s0-9:.;,\-]*$/i, /^est(?:er|h(?:er)?)?[\s0-9:.;,\-]*$/i, /^(?:i(?:b|ob)|j(?:b|ob))[\s0-9:.;,\-]*$/i, /^(?:ps(?:a(?:lm(?:es?|s)?)?|s)?|salm(?:es?|s)?)[\s0-9:.;,\-]*$/i, /^p(?:r(?:o(?:u(?:erb(?:es?|s)?)?|v(?:erbs?)?)?|u|v)?|u|v)[\s0-9:.;,\-]*$/i, /^ec(?:c(?:l(?:es(?:iastes?)?)?)?|l(?:es(?:iast(?:es?|is?))?)?)?[\s0-9:.;,\-]*$/i, /^(?:cant(?:e(?:cles?|sles?)|i(?:cles?|sles?))?|s(?:g|ng|o(?:lomon|n(?:g(?: of so(?:lom(?:an|on)|ngs?)|s(?: of solom(?:an|on))?)?)?))|the song(?: of so(?:lom(?:an|on)|ngs?)|s of solom(?:an|on)))[\s0-9:.;,\-]*$/i, /^is(?:a(?:ah|i(?:ah?|h))?|iah?)?[\s0-9:.;,\-]*$/i, /^(?:i(?:er(?:amiah?|emiah?|imiah?)?|r)|j(?:er(?:amiah?|emiah?|imiah?)?|r))[\s0-9:.;,\-]*$/i, /^l(?:a(?:m(?:antati(?:ans?|ons?)|entati(?:ans?|ons?)|intati(?:ans?|ons?))?)?|m)[\s0-9:.;,\-]*$/i, /^ez(?:e(?:k(?:i(?:al|el))?)?|k)?[\s0-9:.;,\-]*$/i, /^d(?:a(?:n(?:e(?:il|l)|i(?:el|l))?)?|n)[\s0-9:.;,\-]*$/i, /^ho(?:s(?:a(?:ya)?|eah?|ia)?)?[\s0-9:.;,\-]*$/i, /^(?:i(?:l|o(?:el?|l))|j(?:l|o(?:el?|l)))[\s0-9:.;,\-]*$/i, /^am(?:os?)?[\s0-9:.;,\-]*$/i, /^ob(?:a(?:d(?:iah?)?)?|d)?[\s0-9:.;,\-]*$/i, /^(?:i(?:nh|on(?:ah?)?)|j(?:nh|on(?:ah?)?))[\s0-9:.;,\-]*$/i, /^m(?:ch|i(?:c(?:ah?|hah?)?|k(?:ah?|ea?))?)[\s0-9:.;,\-]*$/i, /^na(?:h(?:um|vm)?|m)?[\s0-9:.;,\-]*$/i, /^ha(?:b(?:a(?:c(?:a(?:ck?|k)|u(?:ck?|k))|k(?:a(?:c|k)|k(?:a(?:c|k)|u(?:c|k)|vk)|u(?:c|k)|vk)))?)?[\s0-9:.;,\-]*$/i, /^z(?:ep(?:h(?:aniah?|eniah?)?)?|p)[\s0-9:.;,\-]*$/i, /^h(?:ag(?:ai|g(?:ai)?)?|g)[\s0-9:.;,\-]*$/i, /^z(?:a(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?))?|k(?:ariah?|eriah?)?)?|c(?:h|k)?|e(?:c(?:h(?:ariah?|eriah?)?|k(?:ariah?|eriah?)?)?|k(?:ariah?|eriah?)?)?|k)[\s0-9:.;,\-]*$/i, /^m(?:al(?:a(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i))|e(?:c(?:ai|h(?:ai|i)|i|k(?:ai|i))|k(?:ai|i)))?|l)[\s0-9:.;,\-]*$/i, /^m(?:at(?:h(?:e(?:uw|vw|w)|u(?:ew|w)|v(?:ew|w))?|t(?:h(?:e(?:uw|vw|w)|u(?:ew|w)|v(?:ew|w)))?)?|t)[\s0-9:.;,\-]*$/i, /^m(?:a(?:kre?|r(?:ke?)?)|ke?|r(?:ke?)?)[\s0-9:.;,\-]*$/i, /^l(?:ke?|u(?:ke?)?|vke?)[\s0-9:.;,\-]*$/i, /^(?:i(?:hn|n|o(?:hn?)?)|j(?:hn|n|o(?:hn?)?))[\s0-9:.;,\-]*$/i, /^(?:ac(?:t(?: of the apostles?|e(?: of the apostles?|s(?: of the apostles?)?)?|s(?: of the apostles?)?)?)?|the act(?: of the apostles?|e(?: of the apostles?|s of the apostles?)|s of the apostles?))[\s0-9:.;,\-]*$/i, /^r(?:m|o(?:m(?:an(?:es?|s)?|e)?)?)[\s0-9:.;,\-]*$/i, /^(?:1(?: co(?:r(?:inthi(?:ans?|ons?))?)?|co(?:r(?:inthi(?:ans?|ons?))?)?|st co(?:r(?:inthi(?:ans?|ons?))?)?)|first co(?:r(?:inthi(?:ans?|ons?))?)?|i co(?:r(?:inthi(?:ans?|ons?))?)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: co(?:r(?:inthi(?:ans?|ons?))?)?|co(?:r(?:inthi(?:ans?|ons?))?)?|nd co(?:r(?:inthi(?:ans?|ons?))?)?)|i(?:i co(?:r(?:inthi(?:ans?|ons?))?)?|j co(?:r(?:inthi(?:ans?|ons?))?)?)|second co(?:r(?:inthi(?:ans?|ons?))?)?)[\s0-9:.;,\-]*$/i, /^ga(?:l(?:a(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?[\s0-9:.;,\-]*$/i, /^e(?:f(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?|p(?:h(?:e(?:si(?:ans?|ons?)|ti(?:ans?|ons?)))?)?)[\s0-9:.;,\-]*$/i, /^ph(?:i(?:l(?:i(?:p(?:i(?:ans?|ons?)|pi(?:ans?|ons?)))?)?)?|p)?[\s0-9:.;,\-]*$/i, /^col(?:a(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?))|o(?:s(?:hi(?:ans?|ons?)|i(?:ans?|ons?)|si(?:ans?|ons?))|ti(?:ans?|ons?)))?[\s0-9:.;,\-]*$/i, /^(?:1(?: th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|st th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)|first th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|i th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)[\s0-9:.;,\-]*$/i, /^(?:2(?: th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|nd th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)|i(?:i th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?|j th(?:e(?:s(?:aloni(?:an|on)|saloni(?:an|on))?)?)?)|second th(?:e(?:s(?:aloni(?:ans?|ons?)|s(?:aloni(?:ans?|ons?))?)?)?)?)[\s0-9:.;,\-]*$/i, /^(?:1(?: t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|st t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|first t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|i t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|t(?:i(?:m(?:oth(?:eus|ie|y))?)?|m))[\s0-9:.;,\-]*$/i, /^(?:2(?: t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|nd t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|i(?:i t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m)|j t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))|second t(?:i(?:m(?:oth(?:e(?:us|vs)|ie|y))?)?|m))[\s0-9:.;,\-]*$/i, /^t(?:it(?:us?)?|t)[\s0-9:.;,\-]*$/i, /^ph(?:ile(?:m(?:on)?)?|lm|m)[\s0-9:.;,\-]*$/i, /^h(?:br?|eb(?:r(?:ew(?:es?|s)?)?)?)[\s0-9:.;,\-]*$/i, /^(?:generall epistle of (?:iames|james)|ia(?:m(?:es?)?|s)?|ja(?:m(?:es?)?|s)?|the (?:epistle generall of (?:iames|james)|general(?: epistle of (?:iames|james)|l epistle of (?:iames|james))))[\s0-9:.;,\-]*$/i, /^(?:1(?: p(?:e(?:t(?:er?)?)?|t)|p(?:e(?:t(?:er?)?)?|t)|st p(?:e(?:t(?:er?)?)?|t))|first (?:epistle (?:generall of peter|of peter)|generall epistle of peter|p(?:e(?:t(?:er?)?)?|t))|i p(?:e(?:t(?:er?)?)?|t)|peter?|the first (?:epistle general(?: of peter|l of peter)|generall epistle of peter))[\s0-9:.;,\-]*$/i, /^(?:2(?: p(?:e(?:t(?:er?)?)?|t)|nd p(?:e(?:t(?:er?)?)?|t)|p(?:e(?:t(?:er?)?)?|t))|i(?:i p(?:e(?:t(?:er?)?)?|t)|j p(?:e(?:t(?:er?)?)?|t))|second (?:epistle (?:generall of peter|of peter)|generall epistle of peter|p(?:e(?:t(?:er?)?)?|t))|the second (?:epistle general(?: of peter|l of peter)|generall epistle of peter))[\s0-9:.;,\-]*$/i, /^(?:1(?: (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?))|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|st (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))|first (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?))|i (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))[\s0-9:.;,\-]*$/i, /^(?:2(?: (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?))|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|nd (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))|i(?:i (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?))|j (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))|second (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))[\s0-9:.;,\-]*$/i, /^(?:3(?: (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?))|i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)|rd (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))|ii(?:i (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?))|j (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))|third (?:i(?:n|o(?:hn)?)|j(?:n|o(?:hn)?)))[\s0-9:.;,\-]*$/i, /^(?:generall epistle of (?:iude|jude)|iu(?:de?)?|ju(?:de?)?|the (?:epistle generall of (?:iude|jude)|general(?: epistle of (?:iude|jude)|l epistle of (?:iude|jude))))[\s0-9:.;,\-]*$/i, /^(?:ap(?:a(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?)|o(?:c(?:al(?:ipse?|ypse?)|k(?:al(?:ipse?|ypse?))?)?|k(?:al(?:ipse?|ypse?))?))|r(?:e(?:u(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?|v(?:alati(?:ans?|ons?)|elati(?:ans?|ons?))?)|v))[\s0-9:.;,\-]*$/i];
            
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
                    } else if (book_arr_re[59].test(ref)) { /// James (Generall Epistle of James)
                        book = "59";
                        break;
                    } else if (book_arr_re[65].test(ref)) { /// Jude (Generall Epistle of Jude)
                        book = "65";
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
                    if (book_arr_re[43].test(ref)) {        /// John (Iohn)
                        book = "43";
                        break;
                    } else if (book_arr_re[32].test(ref)) { /// Jonah (Ionah)
                        book = "32";
                        break;
                    } else if (book_arr_re[59].test(ref)) { /// James (Iames)
                        book = "59";
                        break;
                    } else if (book_arr_re[6].test(ref)) {  /// Joshua (Ioshua)
                        book = "6";
                        break;
                    } else if (book_arr_re[7].test(ref)) {  /// Judges (Iudges)
                        book = "7";
                        break;
                    } else if (book_arr_re[18].test(ref)) { /// Job (Iob)
                        book = "18";
                        break;
                    } else if (book_arr_re[65].test(ref)) { /// Jude (Iude)
                        book = "65";
                        break;
                    } else if (book_arr_re[24].test(ref)) { /// Jeremiah (Ieremiah)
                        book = "24";
                        break;
                    } else if (book_arr_re[29].test(ref)) { /// Joel (Ioel)
                        book = "29";
                        break;
                    } else if (book_arr_re[23].test(ref)) { /// Isaiah
                        book = "23";
                        break;
                    }
                    ///NOTE: Don't break so that references like "I Kings" will be checked.
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
                    } else if (book_arr_re[60].test(ref)) { /// 1 Peter (The First Epistle generall of Peter)
                        book = "60";
                        break;
                    } else if (book_arr_re[61].test(ref)) { /// 2 Peter (The Second Epistle generall of Peter)
                        book = "61";
                        break;
                    } else if (book_arr_re[59].test(ref)) { /// James (The generall Epistle of James)
                        book = "59";
                        break;
                    } else if (book_arr_re[65].test(ref)) { /// Jude (The generall Epistle of Jude)
                        book = "65";
                        break;
                    } else if (book_arr_re[11].test(ref)) { /// 1 Kings (3 Kings)
                        book = "11";
                        break;
                    }
                    ///NOTE: Don't break so that references like "IV Kings" will be checked.
                case "4":
                    if (book_arr_re[12].test(ref)) { /// 2 Kings (4 Kings)
                        book = "12";
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
                
                if (book === 0) {
                    return 0;
                }
                
                chapter = "001";
                verse   = "001";
                
                /// Finally, we need to determine the chapter and/or verse reference is they are supplied.
                ///TODO: Explain regex and give examples.
                cv = ref.split(/\s*([0-9]{1,3})(?:[:.;,\s]([0-9]{0,3})[\-0-9]*)?$/);
                
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
         * @example query = prepare_search("NOT in  the  AND good OR  beginning  "); /// Returns "-in the & good | beginning  "
         * @example query = prepare_search("ps 16:title");                           /// Returns "ps 16:0"
         * @example query = prepare_search("“God is good”");                         /// Returns '"God is good"' (Note the curly quotes.)
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
            ///NOTE: \u2011-\u2015 replaces various hyphens, dashes, and minuses with the standard hyphen (-).
            ///NOTE: replace(/([0-9]+)[:.;,\s]title/ig, "$1:0") replaces Psalm title references into an acceptable format (e.g., "Psalm 3:title" becomes "Psalm 3:0").
            ///NOTE: replace(/([:.;,\s])subscript(?:ion)?/ig, "$1255" replaces the word "subscription" with the verse number (255) used internally by BibleForge for Pauline subscriptions (e.g., "Philemon subscription" becomes "Philemon 255").
            ///NOTE: "$1255" replaces the text with the first placeholder followed by the literal "255" (without quotes).
            return query.replace(" IN RED", " AS RED").replace(/\s+/g, " ").replace(/\sAND\s/g, " & ").replace(/\sOR\s/g, " | ").replace(/(?:\s-|\s*\bNOT)\s/g, " -").replace(/ſ/g, "s").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[\u2011-\u2015]/g, "-").replace(/([0-9]+)[:.;,\s]title/ig, "$1:0").replace(/([:.;,\s])subscript(?:ion)?/ig, "$1255");
        }
    };
}());
