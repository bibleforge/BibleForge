<?php

/**
 * BibleForge
 *
 * @date    11-08-09
 * @version 0.2 alpha
 * @link http://BibleForge.com
 * @license Reciprocal Public License 1.5 (RPL1.5)
 * @author BibleForge <http://mailhide.recaptcha.net/d?k=01jGsLrhXoE5xEPHj_81qdGA==&c=EzCH6aLjU3N9jI2dLDl54-N4kPCiE8JmTWHPxwN8esM=>
 */

/**
 * Set the attributes to filter in Sphinx.
 * 
 * @example set_morphology_attributes(array(array(3, 1), array(7, 1)), array(0, 1), $sphinx); /// Set Sphinx to only find words that are spoken by Jesus and not in the present tense.
 * @param $attribute_arr (array) An array of arrays containing two integers indicating the attribute to filter and the value with which to filter accordingly.
 * @param $exclude_arr (array) An array containing ones and zeros indicating whether to only find words that match the attributes (0) or exclude those words (1).
 * @param $sphinx (class) The Sphinx API class to use to set the filters.
 * @return NULL.  It sets the filters directly in Sphinx.
 * @note Called by morphology_search() in search.php.
 */
function set_morphology_attributes($attribute_arr, $exclude_arr, $sphinx)
{
	///TODO: Determine if it would be good to do error handing if $attribute_arr is not an array.
	foreach ((array)$attribute_arr as $key => $morphology_arr) {
		///NOTE: Created in the Forge via grammar_constants_parser.php on 12-22-2009 from Grammar Constants.txt.
		switch ($morphology_arr[0]) {
			case 1:
				$attr = 'implied';
				break;
			case 2:
				$attr = 'divine';
				break;
			case 3:
				$attr = 'red';
				break;
			case 4:
				$attr = 'part_of_speech';
				break;
			case 5:
				$attr = 'number';
				break;
			case 6:
				$attr = 'person';
				break;
			case 7:
				$attr = 'tense';
				break;
			case 8:
				$attr = 'voice';
				break;
			case 9:
				$attr = 'mood';
				break;
			case 10:
				$attr = 'gender';
				break;
			case 11:
				$attr = 'case_5';
				break;
			case 12:
				$attr = 'pronoun_type';
				break;
			case 13:
				$attr = 'degree';
				break;
			case 14:
				$attr = 'declinability';
				break;
			case 15:
				$attr = 'numerical';
				break;
			case 16:
				$attr = 'noun_type';
				break;
			case 17:
				$attr = 'type';
				break;
			case 18:
				$attr = 'dialect';
				break;
			case 19:
				$attr = 'transitivity';
				break;
			case 20:
				$attr = 'form';
				break;
			case 21:
				$attr = 'miscellaneous';
				break;
			default:
				///TODO: Determine if an error should be thrown.
				/// Skip the invalid grammatical form.
				continue 2;
		}
		
		$sphinx->SetFilter($attr, array((int)$morphology_arr[1]), (bool)$exclude_arr[$key]);
	}
	///TODO: When multiple morphological searches are allowed, add the word to the query.
	///      Something like this: $sphinx->AddQuery($WORD, 'morphological');
}