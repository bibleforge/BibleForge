/**
 * BibleForge
 *
 * @date    03-19-13
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
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, browser:true, node:true

(function ()
{
    "use strict";
    
    var analysis,
        dict,
        p;
    
    function get_significance(x)
    {
        var i;
        
        /// Find which p element to use.
        for (i = p.length - 2; i > 0; i -= 1) {
            if (x >= p[i].x) {
                break;
            }
        }
        
        /// If the forumal has not been solved yet for these two points (i, i + 1), solve it now.
        if (typeof p[i].a === "undefined") {
            p[i].a = Math.pow((p[i + 1].y / p[i].y), (1 / ((p[i + 1].x - p[i].x))));
            p[i].yint = p[i].y / (Math.pow(p[i].a, p[i].x));
        }
        
        return p[i].yint * Math.pow(p[i].a, x);
    }
    
    function copy(mixed)
    {
        return JSON.parse(JSON.stringify(mixed));
    }
    
    function get_probabilities(str)
    {
        var i,
            len = str.length,
            prob,
            probs = [];
        
        for (i = 0; i < len; i += 1) {
            prob = analysis[str[i]];
            if (!prob) {
                /// If the character is unknown, just assign it a simple probability.
                prob = {L: 50, M: 1, R: 50, guess: true};
            }
            
            /// Expand short hand.
            if (prob.R === 1 && typeof prob.L === "undefined") {
                prob.R = 100;
            } else if (prob.L === 1 && typeof prob.R === "undefined") {
                prob.L = 100;
            }
            
            probs[probs.length] = prob;
        }
        
        return probs;
    }
    
    function isolate_chinese_characters(str)
    {
        ///NOTE: This would include punctuation too (\u3000-\u3020\u2014-\u2027\u4e36\ufe4f-\uffe5)
        return {
            /// Divide the string at non-Chinese parts.
            cn:  str.split(/[^\u4e00-\u4e35\u4e37-\u9fff\u3400-\u4dff]+/),
            /// Get an array of the non-Chinese parts to fill in later.
            ///NOTE: If there are no matches, return an empty array so that it has a valid length.
            non: str.match(/[^\u4e00-\u4e35\u4e37-\u9fff\u3400-\u4dff]+/g) || []
        };
    }
    
    function calculate_prob(str, prob, starting, len)
    {
        var i,
            /// Assuming at least a two letter word.
            sample_count = 2,
            tmp_prob,
            total_prob = 0,
            word_prob = {
                inner_valid:  true,
                outter_valid: true,
                middle_valid: true
            };
        
        /// Get the left probability.
        tmp_prob = prob[starting].L;
        if (isNaN(tmp_prob)) {
            word_prob.inner_valid = false;
        }
        total_prob += tmp_prob || 0;
        
        /// Get the right probability.
        tmp_prob = prob[starting + len - 1].R;
        if (isNaN(tmp_prob)) {
            word_prob.inner_valid = false;
        }
        total_prob += tmp_prob || 0;
        
        word_prob.inner = total_prob / sample_count;
        
        /// Get the outer probability (if any).
        if (starting > 0) {
            /// The previous character's right probability.
            tmp_prob = prob[starting - 1].R;
            if (isNaN(tmp_prob)) {
                word_prob.outter_valid = false;
            }
            total_prob += tmp_prob || 0;
            sample_count += 1;
        }
        if (len + starting < str.length - 1) {
            /// The next character's left probability.
            tmp_prob = prob[starting + len].L;
            if (isNaN(tmp_prob)) {
                word_prob.outter_valid = false;
            }
            total_prob += tmp_prob || 0;
            sample_count += 1;
        }
        
        word_prob.outter = total_prob / sample_count;
        
        word_prob.ave_prob = (word_prob.inner + word_prob.outter) / 2;
        
        /// Check for middle validity.
        for (i = starting + 1; i < len + starting - 1; i += 1) {
            if (isNaN(prob[i].M)) {
                word_prob.middle_valid = false;
                break;
            }
        }
        
        word_prob.invalid_count = 0;
        if (!word_prob.inner_valid) {
            word_prob.invalid_count += 1;
        }
        if (!word_prob.outter_valid) {
            word_prob.invalid_count += 1;
        }
        if (!word_prob.middle_valid) {
            word_prob.invalid_count += 1;
        }
        
        return word_prob;
    }
    
    function extract_word(str, prob, starting, len)
    {
        var dict_pos,
            word = {str: str.substr(starting, len)};
        
        if ((dict_pos = dict.indexOf("\n" + word.str + "\n")) > -1) {
            word.in_dict = true;
            word.dict_pos = dict_pos;
        /// Check to see if the last character is very commonly found at the end (like 的 and 了).
        ///TODO: Measure words after a number.
        } else if (word.str.length > 2 && /[了子的儿着吗者呢啊得个过地兒著嗎個過]/.test(word.str.slice(-1)) && (dict_pos = dict.indexOf("\n" + word.str.slice(0, -1) + "\n")) > -1) {
            word.in_dict = true;
            word.dict_pos = dict_pos;
            /// Indicate that one character is not actually in the dictionary.
            word.not_in_dict = 1;
        /// Check for two character endings, like 的人 and 了吗.
        } else if (word.str.length > 3 && /(?:的人|了(?:吗|嗎))/.test(word.str.slice(-2)) && (dict_pos = dict.indexOf("\n" + word.str.slice(0, -2) + "\n")) > -1) {
            word.in_dict = true;
            word.dict_pos = dict_pos;
            /// Indicate that two characters are not actually in the dictionary.
            word.not_in_dict = 2;
        /// Check for short separable words: 吃了饭
        } else if (word.str.length === 3 && /[了着过著過]/.test(word.str.substr(1, 1)) && (dict_pos = dict.indexOf("\n" + word.str.substr(0, 1) + word.str.slice(-1) + "\n")) > -1) {
            word.in_dict = true;
            word.dict_pos = dict_pos;
            /// Indicate that one character is not actually in the dictionary.
            word.not_in_dict = 1;
            word.separable = true;
        }
        /// Misc matching that could be added:
        ///     在……
        ///NOTE: Also match duplication, like 刚刚、高高兴兴.
        
        word.prob = calculate_prob(str, prob, starting, len);
        
        return word;
    }
    
    function examine_str(str, prob, starting)
    {
        var dictionary_max_len = 5,
            i,
            len = str.length - starting,
            word,
            likely_words   = [],
            possible_words = [];
        
        if (len > dictionary_max_len) {
            len = dictionary_max_len;
        }
        
        for (i = 2; i <= len; i += 1) {
            word = extract_word(str, prob, starting, i);
            ///TODO: There should be a way to override this.
            if (word.in_dict || word.prob.invalid_count === 0 || (word.prob.invalid_count === 1 && !word.prob.middle_valid)) {
                possible_words[possible_words.length] = word;
            }
            
            ///TODO: Make a way to override this.
            if (!word.in_dict && (word.prob.invalid_count > 1 || (word.prob.invalid_count === 1 && !word.prob.middle_valid))) {
                break;
            }
        }
        
        possible_words.forEach(function (word)
        {
            /// The acceptable probability should probably be changeable.
            if (word.in_dict || word.prob.ave_prob > 60) {
                likely_words[likely_words.length] = word;
            }
        });
        
        return likely_words;
    }
    
    function find_known_and_likely_words(str, prob)
    {
        var branch,
            branches = [],
            i,
            len = str.length;
        
        /// Subtract one because we want to examine at least 2 characters.
        for (i = 0; i < len - 1; i += 1) {
            branch = examine_str(str, prob, i);
            branches[i] = branch;
        }
        
        return branches;
    }
    
    function create_char_arr(branches)
    {
        var char_arr = [];
        
        branches.forEach(function (branch, x)
        {
            branch.forEach(function (word_obj)
            {
                var i;
                
                for (i = word_obj.str.length - 1; i >= 0; i -= 1) {
                    if (!char_arr[x + i]) {
                        char_arr[x + i] = [];
                    }
                    char_arr[x + i].push({
                        x: x + i,
                        origin_x: x,
                        obj: word_obj,
                        is_beginning: i === 0,
                        is_end: i === word_obj.str.length - 1,
                        total_len: word_obj.str.length,
                        len_left: word_obj.str.length - 1 - i,
                    });
                }
            });
        });
        
        return char_arr;
    }
    
    function mark_resolved_branches(char_arr)
    {
        var currently_disputed,
            disputed_count = -1,
            resolved_branch = [];
        
        function at_ending(arr)
        {
            var i;
            
            for (i = arr.length - 1; i >= 0; i -= 1) {
                if (!arr[i].is_end) {
                    return false;
                }
            }
            
            return true;
        }
        
        function tag_disputed(arr, disputed_count)
        {
            arr.forEach(function (el)
            {
                el.obj.disputed_group = disputed_count;
            });
        }
        
        char_arr.forEach(function (arr)
        {
            /// If there is more than one word, it is disputed.
            if (arr.length > 1) {
                /// If it's not already known to be disputed, inc group to keep track of the groups.
                if (!currently_disputed) {
                    disputed_count += 1;
                }
                currently_disputed = true;
            /// If it is not disputed and we are at the end, it's resolved!
            } else if (!currently_disputed && arr[0].is_end) {
                resolved_branch[arr[0].origin_x] = arr[0].obj;
                arr[0].obj.resolved = true;
            }
            
            /// Tag them all each time just to make sure no one is missed.
            if (currently_disputed) {
                tag_disputed(arr, disputed_count);
            }
            
            /// If they are all ending, it's the end of a group.
            if (currently_disputed && at_ending(arr)) {
                currently_disputed = false;
            }
        });
        
        return disputed_count;
    }
    
    function walk_branches(branch_holder, branches, disputed_group, branch_num_obj, x, mark_callback)
    {
        var at_end_of_branch = true,
            i,
            stop_before = branches.length;
            
        function create_mark_func(obj, callback)
        {
            return function (branch_num)
            {
                /// Create new branch object to track branches.
                if (!obj.branch) {
                    obj.branch = {};
                }
                
                obj.branch[branch_num] = 1;
                
                /// Add this branch if it's not already known.
                if (!branch_holder[branch_num]) {
                    branch_holder[branch_num] = [];
                }
                /// Add this word to the branch tracker.
                branch_holder[branch_num].push(obj);
                
                if (callback) {
                    /// Loop back through the whole tree.
                    callback(branch_num);
                }
            };
        }
                
        for (; x < stop_before; x += 1) {
            /// Are there any words in this column?
            if (branches[x] && branches[x].length > 0) {
                /// Just look for the specific group.
                if (branches[x][0].resolved || branches[x][0].disputed_group < disputed_group) {
                    continue;
                }
                if (branches[x][0].disputed_group > disputed_group) {
                    break;
                }
                
                /// Could make it reverse later; just doing it more straightforwardly at first to make it easier to understand.
                for (i = 0; i < branches[x].length; i += 1) {
                    /// stop_before needs to keep moving in based on the shortest distance from start to finish.
                    if (x + branches[x][i].str.length < stop_before) {
                        stop_before = x + branches[x][i].str.length;
                    }
                    
                    /// Walk to the next step.
                    walk_branches(branch_holder, branches, disputed_group, branch_num_obj, x + branches[x][i].str.length, create_mark_func(branches[x][i], mark_callback));
                    
                    /// If it found another route, it's not at a branches end, so it does not need to marked the branches at the end.
                    at_end_of_branch = false;
                }
            }
        }
        
        /// Trigger the mark cascade, if any.
        if (at_end_of_branch && mark_callback) {
            mark_callback(branch_num_obj.num);
            branch_num_obj.num += 1;
        }
    }
    
    function is_more_likely(sig1, sig2, prob1, prob2)
    {
        var i,
            index,
            sig_t1,
            sig_t2,
            calc_sig;
        
        function sum(a, b)
        {
            return a + b;
        }
        
        /// Remove words that are the same so that it doesn't overshadow the average of the significance.
        for (i = sig1.length; i >= 0; i -= 1) {
            index = sig2.indexOf(sig1[i]);
            if (index > -1) {
                sig1.splice(i, 1);
                sig2.splice(index, 1);
            }
        }
        
        if (sig1.length > 0) {
            sig_t1 = sig1.map(get_significance).reduce(sum);
        } else {
            sig_t1 = 0;
        }
        if (sig2.length > 0) {
            sig_t2 = sig2.map(get_significance).reduce(sum);
            calc_sig = sig_t1 / sig_t2;
        } else {
            sig_t2 = 0;
            calc_sig = 0;
        }
        
        if (prob2 > 0) {
            ///NOTE: Weigh significance a little more since it seems more reliable.
            calc_sig = (calc_sig * 2 + (prob1 / prob2)) / 3;
        }
        
        return calc_sig > 1;
    }
    
    function keep_best_branch(branches_lined_up, branches, disputed_group)
    {
        var best_branch = 0,
            best_words_in_dict = 0,
            best_prob = 0,
            best_sig = [],
            i,
            j,
            clear_branch;
        
        branches_lined_up.forEach(function (lined_up_branch, branch_num)
        {
            var this_words_in_dict = 0,
                this_prob_tmp = 0,
                this_prob,
                this_sig = [];
            
            lined_up_branch.forEach(function(word)
            {
                if (word.in_dict) {
                    ///NOTE: If some parts of the word are not actually in the dictionary, weight them a little less.
                    this_words_in_dict += word.str.length - (word.not_in_dict ? word.not_in_dict / 1.5 : 0);
                    this_sig[this_sig.length] = word.dict_pos;
                }
                this_prob_tmp += word.prob.ave_prob;
            });
            
            this_prob = this_prob_tmp / lined_up_branch.length;
            
            ///NOTE: Since the arrays are mutated, just send a copy.
            if (branch_num === 0 || this_words_in_dict > best_words_in_dict || (this_words_in_dict - 1 >= best_words_in_dict && is_more_likely(copy(this_sig), copy(best_sig), this_prob, best_prob))) {
                best_branch = branch_num;
                best_words_in_dict = this_words_in_dict;
                best_prob = this_prob;
                best_sig = this_sig;
            }
        });
        
        /// Now, remove the others.
        for (i = 0; i < branches.length; i += 1) {
            for (j = branches[i].length - 1; j >= 0; j -= 1) {
                clear_branch = false;
                /// If it reached a later branch, we are done.
                if (branches[i][j].disputed_group > disputed_group) {
                    return;
                }
                /// Skip if it is not the right branch.
                ///NOTE: If it finds a resolved branch after already finding the disputed branch, it could return there too.
                if (branches[i][j].resolved || branches[i][j].disputed_group < disputed_group) {
                    break;
                }
                
                if (branches[i][j].branch[best_branch]) {
                    branches[i] = [branches[i][j]];
                    /// Break since there's only one per column.
                    break;
                } else {
                    clear_branch = true;
                }
            }
            if (clear_branch) {
                ///NOTE: Deleting just sets the element to undefined, so it's fastest just to replace it all.
                branches[i] = [];
            }
        }
    }
    
    function resolve_multiple_branches(branches)
    {
        /// First, add known good branches (single branches) to a resolved variable
        /// while adding unresolved branches to an array of unresolved branches.
        /// Then, recursively loop through all of the branches in the array and total up
        /// how many known characters were found and the overall probability.
        var branches_lined_up = [],
            disputed_count,
            i;
        
        disputed_count = mark_resolved_branches(create_char_arr(branches));
        
        for (i = 0; i <= disputed_count; i += 1) {
            branches_lined_up[i] = [];
            walk_branches(branches_lined_up[i], branches, i, {num: 0}, 0);
        }
        for (i = 0; i <= disputed_count; i += 1) {
            keep_best_branch(branches_lined_up[i], branches, i);
        }
    }
    
    function format_nicely(branches, str)
    {
        var res = [],
            x = 0;
        
        for (;;) {
            if (x >= str.length) {
                break;
            }
            
            /// If there are no words, use a single character.
            if (!branches[x] || branches[x].length === 0) {
                res[res.length] = str.substr(x, 1);
                x += 1;
            } else {
                /// Use a word if present.
                res[res.length] = branches[x][0].str;
                x += branches[x][0].str.length;
            }
        }
        
        return res;
    }
    
    /**
     * Segment a string of Chinese text.
     *
     * @param lang_analysis (object)  The analyzed language data
     * @param lang_dict     (string)  A dictionary list of words
     * @param lang_p        (object)  The dictionary plot data
     * @param orig_str      (string)  The string to segment
     * @param return_raw    (boolean) Whether or not to return the raw array of segmented strings (default) or a string with a space separating each segmentation
     * @note  When compling the CKJV in the Forge, it needs the raw data.
     */
    function segment(lang_analysis, lang_dict, lang_p, orig_str, return_raw)
    {
        var chunks = isolate_chinese_characters(orig_str),
            res = [],
            text;
        
        /// Set the closure variables for this language.
        analysis = lang_analysis;
        dict = lang_dict;
        p = lang_p;
        
        chunks.cn.forEach(function (str, i)
        {
            var branches;
            
            if (str !== "") {
                /// Step 1
                branches = find_known_and_likely_words(str, get_probabilities(str));
                
                /// Step 2
                resolve_multiple_branches(branches);
                
                /// Step 3
                res[res.length] = format_nicely(branches, str);
            }
            
            /// Fill in with any non-Chinese parts.
            if (chunks.non.length > i) {
                res[res.length] = chunks.non[i];
            }
        });
        
        /// Should it convert the data into a string separated by spaces between segments?
        if (!return_raw) {
            text = "";
            res.forEach(function (sec, i)
            {
                if (typeof sec === "string") {
                    /// Adding a space, even before non-Chinese parts, helps to keep segments separate.
                    /// But don't add a space before a space.
                    if (i > 0 && sec !== " ") {
                        text += " ";
                    }
                    text += sec;
                } else {
                    sec.forEach(function (word, i)
                    {
                        /// Add a space to separate words.
                        if (i > 0) {
                            text += " ";
                        }
                        text += word;
                    });
                }
            });
            return text;
        }
        
        return res;
    };
    
    /// Is this Node.js?
    if (typeof exports !== "undefined") {
        exports.segment = segment;
    } else {
        /// If this is a browser, return a function that allows segment() to be attached to an object.
        return function init(context)
        {
            context.segment = segment;
        };
    }
}());
