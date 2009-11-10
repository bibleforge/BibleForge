<?php

/**
 * BibleForge (alpha testing)
 *
 * @date    11-08-09
 * @version 0.1 alpha 2
 * @link http://www.BibleForge.com
 */

define('ADDED', 1);
define('DIVINE', 2);
define('RED', 3);

define('NOUN', 4);
define('VERB', 5);
define('ADJECTIVE', 6);
define('ADVERB', 7);
define('DEFINITE_ARTICLE', 8);
define('PRONOUN', 9);
define('PERSONAL_PRONOUN', 10);
define('RELATIVE_PRONOUN', 11);
define('RECIPROCAL_PRONOUN', 12);
define('DEMONSTRATIVE_PRONOUN', 13);
define('CORRELATIVE_PRONOUN', 14);
define('INTERROGATIVE_PRONOUN', 15);
define('INDEFINITE_PRONOUN', 16);
///FIXME: #12 CORRELATIVE PRONOUN OR INTERROGATIVE PRONOUN needs to be analyze.
define('REFLEXIVE_PRONOUN', 17);
define('POSESSIVE_PRONOUN', 18);
define('CONJUNCTION', 19);
define('CONDITIONAL', 20);
define('PARTICLE', 21);
define('PREPOSITION', 22);
define('INJECTIVE', 23);
define('HEBREW', 23);
define('ARAMAIC', 23);

define('SINGULAR', 24);
define('PLURAL', 25);

define('FIRST_PERSON', 26);
define('SECOND_PERSON', 27);
define('THIRD_PERSON', 28);

define('PRESENT', 29);
define('IMPERFECT', 30);
define('FUTURE', 31);
define('AORIST', 32);
define('PERFECT', 33);
define('PLUPERFECT', 34);
define('NO_TENSE', 35); ///NOTE: Adverbial imperative?

define('ACTIVE', 36);
define('MIDDLE', 37);
define('PASSIVE', 38);
define('DEPONENT', 39); ///TODO: Split deponant out.
define('EITHER_MIDDLE_OR_PASSIVE', 40); ///TODO: Determine if these can be reconciled?
define('NO_VOICE', 41);

define('INDICATIVE', 42);
define('SUBJUNCTIVE', 43);
define('IMPERATIVE', 44);
define('INFINITIVE', 45);
define('OPTATIVE', 46);
define('PARTICIPLE', 47);
define('IMPERATIVE_PARTICIPLE', 48); ///TODO: Determine if there should be two participles.

define('MASCULINE', 49);
define('FEMININE', 50);
define('NEUTER', 51);

define('NOMINATIVE', 52);
define('GENITIVE', 53);
define('ACCUSATIVE', 54);
define('DATIVE', 55);
define('VOCATIVE', 56);

define('COMPARATIVE', 57);
define('SUPERLATIVE', 58);

define('INTERROGATIVE', 59);
define('NEGATIVE', 60);
define('PARTICLE', 61);
define('MIDDLE_SIGNIFICANCE', 62);

define('DECLINABLE', 63);
define('INDECLINABLE', 64);

define('NUMERICAL', 65);

define('NORMAL_NOUN', 66);
define('PROPER_NOUN', 67);
define('LETTER', 68);
define('OTHER_NOUN', 69);

define('ABBRIVIATED', 70);
define('CONTRACTED', 71);
define('APOCOPATED', 72);
define('IRREGULAR', 73);

define('ATTIC', 74);
define('AEOLIC', 75);

define('TRANSITIVE', 76);
define('INTRANSITIVE', 77); ///TODO: Need to add this in.  Determine if there is bitransitive.
