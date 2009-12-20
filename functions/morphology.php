<?php

/**
 * BibleForge
 *
 * @date    11-08-09
 * @version 0.1 alpha 2
 * @link http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

///TODO: Figure out the best way to handle this.  Currently, there is a short list of constants
///      that is used to ensure that valid data is sent.  The downside is that an array must be
///      sent containing the general grammatical type plus the specific value.  It also requires
///      a long switch construct.
///TODO: See if any of these categories can be combind with others, such as FORM with TYPE or MISCELLANEOUS.
define('PART_OF_SPEECH', 1);
define('NUMBER', 2);
define('PERSON', 3);
define('TENSE', 4);
define('VOICE', 5);
define('MOOD', 6);
define('GENDER', 7);
define('CASE_5', 8);
define('DEGREE', 9);
define('DECLINABILITY', 10);
define('NUMERICAL', 11);
define('NOUN_TYPE', 12);
define('TYPE', 13);
define('DIALECT', 14);
define('TRANSITIVITY', 15);
define('FORM', 16);
define('MISCELLANEOUS', 17);
define('ADDED', 18);
define('DIVINE', 19);
define('RED', 20);


function set_morphology_attributes($attribute_arr, $include_arr, $sphinx)
{
	/// $json '["WORD",[[GRAMMAR_TYPE1,VALUE1],[...]],[INCLUDE]]'
	/// $json ex1: '["love",[[PART_OF_SPEECH,1]],[1]]' == love AS NOUN
	/// $json ex2: '["go",[[MOOD,3],[NUMBER,1]],[1,0]]' == go AS IMPERATIVE, NOT SINGULAR
	
	foreach ($attribute_arr as $key => $morphology_arr) {
		switch ($morphology_arr[0]) {
			case ADDED:
				$attr = 'added';
				break;
			case DIVINE:
				$attr = 'divine';
				break;
			case RED:
				$attr = 'quotation'; ///TODO: Decide on a consistent name for this.
				break;
			case PART_OF_SPEECH:
				$attr = 'part_of_speech';
				break;
			case NUMBER:
				$attr = 'number';
				break;
			case PERSON:
				$attr = 'person';
				break;
			case TENSE:
				$attr = 'tense';
				break;
			case VOICE:
				$attr = 'voice';
				break;
			case MOOD:
				$attr = 'mood';
				break;
			case GENDER:
				$attr = 'gender';
				break;
			case CASE_5:
				$attr = 'case_5';
				break;
			case DEGREE:
				$attr = 'degree';
				break;
			case DECLINABILITY:
				$attr = 'indeclinable'; ///FIXME: This should probably be changed to 'declinability' and the values reversed.
				break;
			case NUMERICAL:
				$attr = 'numerical';
				break;
			case NOUN_TYPE:
				$attr = 'noun_type';
				break;
			case FORM:
				$attr = 'form';
				break;
			case DIALECT:
				$attr = 'dialect';
				break;
			case TRANSITIVITY:
				$attr = 'transitive'; ///FIXME: This should probably be changed to match the constant.
				break;
			case MISCELLANEOUS:
				$attr = 'extra'; ///FIXME: This should probably be changed to match the constant.
				break;
			case SECOND_FORM:
				$attr = 'second_form';
				break;
			default:
				///TODO: Determine if an error should be thrown.
				/// Skip the invalid grammatical form.
				continue 2;
		}
		$sphinx->SetFilter($attr, array((int)$morphology_arr[1]), (bool)$include_arr[$key]);
	}
	///TODO: When multiple morpholgical searches are allowed,
	///      add the word to the query.  Something like $sphinx->AddQuery($WORD, 'morphological');
}