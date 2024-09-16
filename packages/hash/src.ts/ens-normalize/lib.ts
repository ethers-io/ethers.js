/**
 * MIT License
 *
 * Copyright (c) 2021 Andrew Raffensperger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This is a near carbon-copy of the original source (link below) with the
 * TypeScript typings added and a few tweaks to make it ES3-compatible.
 *
 * See: https://github.com/adraffy/ens-normalize.js
 */

import COMPRESSED, {FENCED, NSM_MAX} from './include-ens.js';
import {read_compressed_payload, read_sorted, read_sorted_arrays, read_mapped, read_trie, read_array_while} from './decoder.js';
import {explode_cp, str_from_cps, quote_cp, compare_arrays, array_replace} from './utils.js';
import {nfc, nfd} from './nf.js';
import {IntSet, set_add_many} from './set.js';

type OutputToken = {
	emoji: boolean;
	cps: number[];	
};
type Label = {
	input: number[]; 
	offset: number;
	error?: Error;
	tokens?: OutputToken[]; 
	output?: number[];
	type?: string;
};

type Transform = (cps: number[]) => number[];
type GroupSet = {[name: string]: Group};
type Whole = {V: number[], M: {[cp: number]: GroupSet}};
type EmojiNode = {V?: number[], [cp: number]: EmojiNode};
type Group = {N: string, P: IntSet, Q: IntSet, M: boolean, R: boolean};

const STOP_CH = '.';
const FE0F = 0xFE0F;
const UNIQUE_PH = 1;

function group_has_cp(g: Group, cp: number) {
	// 20230913: keep primary and secondary distinct instead of creating valid union
	return g.P[cp] || g.Q[cp];
}

let MAPPED: {[cp: number]: number[]};
let CM: IntSet = {};
let NSM: IntSet = {};
let IGNORED: IntSet = {};
let ESCAPE: IntSet = {};
let GROUPS: Group[];
let WHOLE_VALID: any = {};
let WHOLE_MAP: {[cp: number]: Whole|1} = {};
let VALID: IntSet = {};
let EMOJI_ROOT: EmojiNode = {};

function init() {
	if (MAPPED) return;
	
	let r = read_compressed_payload(COMPRESSED);

	MAPPED = {};
	read_mapped(r).forEach(([x, ys]) => MAPPED[x] = ys);
	set_add_many(IGNORED, read_sorted(r)); // ignored characters are not valid, so just read raw codepoints

	// 20230217: we still need all CM for proper error formatting
	// but norm only needs NSM subset that are potentially-valid
	let tempCM = read_sorted(r);
	set_add_many(NSM, read_sorted(r).map(i => tempCM[i]));
	set_add_many(CM, tempCM);
	
	set_add_many(ESCAPE, read_sorted(r)); // characters that should not be printed
	read_sorted(r); // dont need this

	let chunks = read_sorted_arrays(r);
	let unrestricted = r();
	//const read_chunked = () => new Set(read_sorted(r).flatMap(i => chunks[i]).concat(read_sorted(r)));
	
	const read_chunked = () => {
		// 20230921: build set in parts, 2x faster
		let set: IntSet = {};
		read_sorted(r).forEach(i => set_add_many(set, chunks[i]));
		set_add_many(set, read_sorted(r));
		return set; 
	};
	GROUPS = read_array_while(i => {
		// minifier property mangling seems unsafe
		// so these are manually renamed to single chars
		let v = read_array_while(r).map(x => x+0x60);
		if (!v.length) return null;
		let R = i >= unrestricted; // unrestricted then restricted
		v[0] -= 32; // capitalize
		let N = str_from_cps(v);
		if (R) N=`Restricted[${N}]`;
		let P = read_chunked(); // primary
		let Q = read_chunked(); // secondary
		let M = !r(); // not-whitelisted, check for NSM
		return {N, P, Q, M, R};
	});

	// decode compressed wholes
	let whole_valid = read_sorted(r);	
	set_add_many(WHOLE_VALID, whole_valid);
	let whole_backref: Whole[] = []; 
	let wholes: Whole[] = [];
	read_sorted(r).concat(whole_valid).sort((a, b) => a-b).forEach((cp, i) => { // must be sorted
		let d = r(); 
		let w;
		if (d) {
			w = whole_backref[i-d];
		} else {
			w = {V: [], M: {}};
			wholes.push(w);
		}
		whole_backref[i] = w;
		w.V.push(cp); // add to member set
		if (!WHOLE_VALID[cp]) {
			WHOLE_MAP[cp] = w;  // register with whole map
		}
	});

	// compute confusable-extent complements
	// usage: WHOLE_MAP.get(cp).M.get(cp) = complement set
	for (let {V, M} of wholes) {
		// connect all groups that have each whole character
		let active: GroupSet = {};
		let recs: {G: GroupSet, V: number[]}[] = [];
		for (let cp of V) {
			let gs = GROUPS.filter(g => group_has_cp(g, cp));
			let rec = recs.find(({G}) => gs.some(g => G[g.N]));
			if (!rec) {
				rec = {G: {}, V: []};
				recs.push(rec);
			}
			rec.V.push(cp);
			gs.forEach(g => rec.G[g.N] = active[g.N] = g);
		}
		// per character cache groups which are not a member of the extent
		let union = Object.values(active);
		for (let {G, V} of recs) {
			let complement: GroupSet = {};
			union.forEach(g => {
				if (!G[g.N]) complement[g.N] = g; // groups not covered by the extent
			});
			for (let cp of V) {
				M[cp] = complement; // this is the same reference
			}
		}
	}

	// compute valid set
	// 20230924: VALID was union but can be re-used	
	let multi: IntSet = {} // exists in 2+ groups
	const add_to_union = (cp: number) => VALID[cp] ? multi[cp] = cp : VALID[cp] = cp;
	for (let g of GROUPS) {
		for (let cp of Object.values(g.P)) add_to_union(cp);
		for (let cp of Object.values(g.Q)) add_to_union(cp);
	}
	// dual purpose WHOLE_MAP: return placeholder if unique non-confusable
	for (let cp of Object.values(VALID)) {
		if (!WHOLE_MAP[cp] && !multi[cp]) {
			WHOLE_MAP[cp] = UNIQUE_PH;
		}
	}
	// add all decomposed parts
	// see derive: "Valid is Closed (via Brute-force)"
	set_add_many(VALID, nfd(Object.values(VALID)));
	
	// decode emoji
	// 20230719: emoji are now fully-expanded to avoid quirk logic 
	let emojis = read_trie(r).sort(compare_arrays);
	for (let cps of emojis) {
		// 20230719: change to *slightly* stricter algorithm which disallows 
		// insertion of misplaced FE0F in emoji sequences (matching ENSIP-15)
		// example: beautified [A B] (eg. flag emoji) 
		//  before: allow: [A FE0F B], error: [A FE0F FE0F B] 
		//   after: error: both
		// note: this code now matches ENSNormalize.{cs,java} logic
		let prev = [EMOJI_ROOT];
		for (let cp of cps) {
			let next = prev.map(node => {
				let child = node[cp];
				if (!child) node[cp] = child = {};
				return child;
			});
			if (cp === FE0F) {
				prev.push(...next); // less than 20 elements
			} else {
				prev = next;
			}
		}
		for (let x of prev) {
			x.V = cps;
		}
	}
}

// if escaped: {HEX}
//       else: "x" {HEX}
function quoted_cp(cp: number) {
	return (cp in ESCAPE ? '' : `${bidi_qq(safe_str_from_cps([cp]))} `) + quote_cp(cp);
}

// 20230211: some messages can be mixed-directional and result in spillover
// use 200E after a quoted string to force the remainder of a string from 
// acquring the direction of the quote
// https://www.w3.org/International/questions/qa-bidi-unicode-controls#exceptions
function bidi_qq(s: string) {
	return `"${s}"\u200E`; // strong LTR
}

function check_label_extension(cps: number[]) {
	const HYPHEN = 0x2D;
	if (cps.length >= 4 && cps[2] == HYPHEN && cps[3] == HYPHEN) {
		throw new Error(`invalid label extension: "${str_from_cps(cps.slice(0, 4))}"`); // this can only be ascii so cant be bidi
	}
}
function check_leading_underscore(cps: number[]) {
	const UNDERSCORE = 0x5F;
	for (let i = cps.lastIndexOf(UNDERSCORE); i > 0; ) {
		if (cps[--i] !== UNDERSCORE) {
			throw new Error('underscore allowed only at start');
		}
	}
}
// check that a fenced cp is not leading, trailing, or touching another fenced cp
function check_fenced(cps: number[]) {
	let cp = cps[0];
	let prev = FENCED[cp];
	if (prev) throw error_placement(`leading ${prev}`);
	let n = cps.length;
	let last = -1; // prevents trailing from throwing
	for (let i = 1; i < n; i++) {
		cp = cps[i];
		let match = FENCED[cp];
		if (match) {
			// since cps[0] isn't fenced, cps[1] cannot throw
			if (last == i) throw error_placement(`${prev} + ${match}`);
			last = i + 1;
			prev = match;
		}
	}
	if (last == n) throw error_placement(`trailing ${prev}`);
}

// create a safe to print string 
// invisibles are escaped
// leading cm uses placeholder
// if cps exceed max, middle truncate with ellipsis
// quoter(cp) => string, eg. 3000 => "{3000}"
// note: in html, you'd call this function then replace [<>&] with entities
function safe_str_from_cps(cps: number[], max: number = Infinity) {
	//if (Number.isInteger(cps)) cps = [cps];
	//if (!Array.isArray(cps)) throw new TypeError(`expected codepoints`);
	let buf = [];
	if (cps[0] in CM) buf.push('\u25CC');
	if (cps.length > max) {
		max >>= 1;
		cps = [...cps.slice(0, max), 0x2026, ...cps.slice(-max)];
	}
	let prev = 0;
	let n = cps.length;
	for (let i = 0; i < n; i++) {
		let cp = cps[i];
		if (cp in ESCAPE) {
			buf.push(str_from_cps(cps.slice(prev, i)));
			buf.push(quote_cp(cp));
			prev = i + 1;
		}
	}
	buf.push(str_from_cps(cps.slice(prev, n)));
	return buf.join('');
}


export function ens_normalize(name: string) {
	return flatten(split(name, nfc, filter_fe0f));
}

export function ens_beautify(name: string) {
	let labels = split(name, nfc, x => x); // emoji not exposed
	for (let {type, output, error} of labels) {
		if (error) break; // flatten will throw

		// replace leading/trailing hyphen
		// 20230121: consider beautifing all or leading/trailing hyphen to unicode variant
		// not exactly the same in every font, but very similar: see hyphen example
		/*
		const UNICODE_HYPHEN = 0x2010;
		// maybe this should replace all for visual consistancy?
		// `node tools/reg-count.js regex ^-\{2,\}` => 592
		//for (let i = 0; i < output.length; i++) if (output[i] == 0x2D) output[i] = 0x2010;
		if (output[0] == HYPHEN) output[0] = UNICODE_HYPHEN;
		let end = output.length-1;
		if (output[end] == HYPHEN) output[end] = UNICODE_HYPHEN;
		*/
		// 20230123: WHATWG URL uses "CheckHyphens" false
		// https://url.spec.whatwg.org/#idna

		// update ethereum symbol if not greek
		if (type !== 'Greek') array_replace(output, 0x3BE, 0x39E);

		// 20221213: fixes bidi subdomain issue, but breaks invariant (200E is disallowed)
		// could be fixed with special case for: 2D (.) + 200E (LTR)
		// https://discuss.ens.domains/t/bidi-label-ordering-spoof/15824
		//output.splice(0, 0, 0x200E);
	}
	return flatten(labels);
}

function split(name: string, nf: Transform, ef: Transform) {
	if (!name) return []; // 20230719: empty name allowance
	init();
	let offset = 0;
	// https://unicode.org/reports/tr46/#Validity_Criteria
	// 4.) "The label must not contain a U+002E ( . ) FULL STOP."
	return name.split(STOP_CH).map(label => {
		let input = explode_cp(label);
		let info: Label = {
			input,
			offset, // codepoint, not substring!
		};
		offset += input.length + 1; // + stop
		try {
			// 1.) "The label must be in Unicode Normalization Form NFC"
			let tokens = info.tokens = tokens_from_str(input, nf, ef);
			let token_count = tokens.length;
			let type;
			if (!token_count) { // the label was effectively empty (could of had ignored characters)
				//norm = [];
				//type = 'None'; // use this instead of next match, "ASCII"
				// 20230120: change to strict
				// https://discuss.ens.domains/t/ens-name-normalization-2nd/14564/59
				throw new Error(`empty label`);
			} 
			let norm: number[] = info.output = [];
			tokens.forEach(({cps}) => norm.push(...cps));
			check_leading_underscore(norm);
			let emoji = token_count > 1 || tokens[0].emoji; // same as: tokens.some(x => x.is_emoji);
			if (!emoji && norm.every(cp => cp < 0x80)) { // special case for ascii
				// 20230123: matches matches WHATWG, see note 3.3
				check_label_extension(norm); // only needed for ascii
				// cant have fenced
				// cant have cm
				// cant have wholes
				// see derive: "Fastpath ASCII"
				type = 'ASCII';
			} else {
				let chars: number[] = [];
				let unique_set: IntSet = {};
				tokens.forEach(({emoji, cps}) => {
					if (!emoji) {
						chars.push(...cps);  // all of the nfc tokens concat together
						set_add_many(unique_set, cps);
					}
				});
				if (!chars.length) { // theres no text, just emoji
					type = 'Emoji';
				} else {
					// 5.) "The label must not begin with a combining mark, that is: General_Category=Mark."
					if (norm[0] in CM) throw error_placement('leading combining mark');
					for (let i = 1; i < token_count; i++) { // we've already checked the first token
						let {emoji, cps} = tokens[i];
						if (!emoji && cps[0] in CM) { // every text token has emoji neighbors, eg. EtEEEtEt...
							// bidi_qq() not needed since emoji is LTR and cps is a CM
							throw error_placement(`emoji + combining mark: "${str_from_cps(tokens[i-1].cps)} + ${safe_str_from_cps([cps[0]])}"`); 
						}
					}
					check_fenced(norm);
					let unique = Object.values(unique_set);
					let [g] = determine_group(unique); // take the first match
					// see derive: "Matching Groups have Same CM Style"
					// alternative: could form a hybrid type: Latin/Japanese/...	
					check_group(g, chars); // need text in order
					check_whole(g, unique); // only need unique text (order would be required for multiple-char confusables)
					type = g.N;
					// 20230121: consider exposing restricted flag
					// it's simpler to just check for 'Restricted'
					// or even better: type.endsWith(']')
					//if (g.R) info.restricted = true;
				}
			}
			info.type = type;
		} catch (err) {
			info.error = err; // use full error object
		}
		return info;
	});
}

function check_whole(group: Group, unique: number[]) {
	let maker;
	let shared = [];
	for (let cp of unique) {
		let whole = WHOLE_MAP[cp];
		if (whole === UNIQUE_PH) return; // unique, non-confusable
		if (whole) {
			let set = whole.M[cp]; // groups which have a character that look-like this character
			maker = maker ? maker.filter(g => set[g.N]) : Object.values(set);
			if (!maker.length) return; // confusable intersection is empty
		} else {
			shared.push(cp); 
		}
	}
	if (maker) {
		// we have 1+ confusable
		// check if any of the remaining groups
		// contain the shared characters too
		for (let g of maker) {
			if (shared.every(cp => group_has_cp(g, cp))) {
				throw new Error(`whole-script confusable: ${group.N}/${g.N}`);
			}
		}
	}
}

// assumption: unique.size > 0
// returns list of matching groups
function determine_group(unique: number[]) {
	let groups = GROUPS;
	for (let cp of unique) {
		// note: we need to dodge CM that are whitelisted
		// but that code isn't currently necessary
		let gs = groups.filter(g => group_has_cp(g, cp));
		if (!gs.length) {
			if (!GROUPS.some(g => group_has_cp(g, cp))) { 
				// the character was composed of valid parts
				// but it's NFC form is invalid
				// 20230716: change to more exact statement, see: ENSNormalize.{cs,java}
				// note: this doesn't have to be a composition
				// 20230720: change to full check
				throw error_disallowed(cp); // this should be rare
			} else {
				// there is no group that contains all these characters
				// throw using the highest priority group that matched
				// https://www.unicode.org/reports/tr39/#mixed_script_confusables
				throw error_group_member(groups[0], cp);
			}
		}
		groups = gs;
		if (gs.length == 1) break; // there is only one group left
	}
	// there are at least 1 group(s) with all of these characters
	return groups;
}

// throw on first error
function flatten(split: Label[]) {
	return split.map(({input, error, output}) => {
		if (error) {
			// don't print label again if just a single label
			let msg = error.message;
			// bidi_qq() only necessary if msg is digits
			throw new Error(split.length == 1 ? msg : `Invalid label ${bidi_qq(safe_str_from_cps(input, 63))}: ${msg}`); 
		}
		return str_from_cps(output);
	}).join(STOP_CH);
}

function error_disallowed(cp: number) {
	// TODO: add cp to error?
	return new Error(`disallowed character: ${quoted_cp(cp)}`); 
}
function error_group_member(g: Group, cp: number) {
	let quoted = quoted_cp(cp);
	let gg = GROUPS.find(g => g.P[cp]); // only check primary
	if (gg) {
		quoted = `${gg.N} ${quoted}`;
	}
	return new Error(`illegal mixture: ${g.N} + ${quoted}`);
}
function error_placement(where: string) {
	return new Error(`illegal placement: ${where}`);
}

// assumption: cps.length > 0
// assumption: cps[0] isn't a CM
// assumption: the previous character isn't an emoji
function check_group(g: Group, cps: number[]) {
	for (let cp of cps) {
		if (!group_has_cp(g, cp)) {
			// for whitelisted scripts, this will throw illegal mixture on invalid cm, eg. "e{300}{300}"
			// at the moment, it's unnecessary to introduce an extra error type
			// until there exists a whitelisted multi-character
			//   eg. if (M < 0 && is_combining_mark(cp)) { ... }
			// there are 3 cases:
			//   1. illegal cm for wrong group => mixture error
			//   2. illegal cm for same group => cm error
			//       requires set of whitelist cm per group: 
			//        eg. new Set([...g.P, ...g.Q].flatMap(nfc).filter(cp => CM.has(cp)))
			//   3. wrong group => mixture error
			throw error_group_member(g, cp);
		}
	}
	//if (M >= 0) { // we have a known fixed cm count
	if (g.M) { // we need to check for NSM
		let decomposed = nfd(cps);
		for (let i = 1, e = decomposed.length; i < e; i++) { // see: assumption
			// 20230210: bugfix: using cps instead of decomposed h/t Carbon225
			/*
			if (CM.has(decomposed[i])) {
				let j = i + 1;
				while (j < e && CM.has(decomposed[j])) j++;
				if (j - i > M) {
					throw new Error(`too many combining marks: ${g.N} ${bidi_qq(str_from_cps(decomposed.slice(i-1, j)))} (${j-i}/${M})`);
				}
				i = j;
			}
			*/
			// 20230217: switch to NSM counting
			// https://www.unicode.org/reports/tr39/#Optional_Detection
			if (decomposed[i] in NSM) {
				let j = i + 1;
				for (let cp; j < e && (cp = decomposed[j]) in NSM; j++) {
					// a. Forbid sequences of the same nonspacing mark.
					for (let k = i; k < j; k++) { // O(n^2) but n < 100
						if (decomposed[k] == cp) {
							throw new Error(`duplicate non-spacing marks: ${quoted_cp(cp)}`);
						}
					}
				}
				// parse to end so we have full nsm count
				// b. Forbid sequences of more than 4 nonspacing marks (gc=Mn or gc=Me).
				if (j - i > NSM_MAX) {
					// note: this slice starts with a base char or spacing-mark cm
					throw new Error(`excessive non-spacing marks: ${bidi_qq(safe_str_from_cps(decomposed.slice(i-1, j)))} (${j-i}/${NSM_MAX})`);
				}
				i = j;
			}
		}
	}
	// *** this code currently isn't needed ***
	/*
	let cm_whitelist = M instanceof Map;
	for (let i = 0, e = cps.length; i < e; ) {
		let cp = cps[i++];
		let seqs = cm_whitelist && M.get(cp);
		if (seqs) { 
			// list of codepoints that can follow
			// if this exists, this will always be 1+
			let j = i;
			while (j < e && CM.has(cps[j])) j++;
			let cms = cps.slice(i, j);
			let match = seqs.find(seq => !compare_arrays(seq, cms));
			if (!match) throw new Error(`disallowed combining mark sequence: "${safe_str_from_cps([cp, ...cms])}"`);
			i = j;
		} else if (!V.has(cp)) {
			// https://www.unicode.org/reports/tr39/#mixed_script_confusables
			let quoted = quoted_cp(cp);
			for (let cp of cps) {
				let u = UNIQUE.get(cp);
				if (u && u !== g) {
					// if both scripts are restricted this error is confusing
					// because we don't differentiate RestrictedA from RestrictedB 
					if (!u.R) quoted = `${quoted} is ${u.N}`;
					break;
				}
			}
			throw new Error(`disallowed ${g.N} character: ${quoted}`);
			//throw new Error(`disallowed character: ${quoted} (expected ${g.N})`);
			//throw new Error(`${g.N} does not allow: ${quoted}`);
		}
	}
	if (!cm_whitelist) {
		let decomposed = nfd(cps);
		for (let i = 1, e = decomposed.length; i < e; i++) { // we know it can't be cm leading
			if (CM.has(decomposed[i])) {
				let j = i + 1;
				while (j < e && CM.has(decomposed[j])) j++;
				if (j - i > M) {
					throw new Error(`too many combining marks: "${str_from_cps(decomposed.slice(i-1, j))}" (${j-i}/${M})`);
				}
				i = j;
			}
		}
	}
	*/
}

// given a list of codepoints
// returns a list of lists, where emoji are a fully-qualified (as Array subclass)
// eg. explode_cp("abc{POOP EMOJI}d") => [[61, 62, 63], Emoji[1F4A9, FE0F], [64]]
// 20230818: rename for 'process' name collision h/t Javarome
// https://github.com/adraffy/ens-normalize.js/issues/23
function tokens_from_str(input: number[], nf: Transform, ef: Transform) {
	let ret: OutputToken[] = [];
	let chars: number[] = [];
	input = input.slice().reverse(); // flip so we can pop
	while (input.length) {
		let emoji = consume_emoji_reversed(input);
		if (emoji) {
			add_text();
			ret.push({emoji: true, cps: ef(emoji)});
		} else {
			let cp = input.pop();
			if (VALID[cp]) {
				chars.push(cp);
			} else {
				let cps = MAPPED[cp];
				if (cps) {
					chars.push(...cps); // less than 10 elements
				} else if (!(cp in IGNORED)) {
					// 20230912: unicode 15.1 changed the order of processing such that
					// disallowed parts are only rejected after NFC
					// https://unicode.org/reports/tr46/#Validity_Criteria
					// this doesn't impact normalization as of today
					// technically, this error can be removed as the group logic will apply similar logic
					// however the error type might be less clear
					throw error_disallowed(cp);
				}
			}
		}
	}
	add_text();
	return ret;
	function add_text() {
		if (chars.length) {
			ret.push({emoji: false, cps: nf(chars)});
			chars = [];
		}
	}
}

function filter_fe0f(cps: number[]) {
	return cps.filter(cp => cp != FE0F);
}

// given array of codepoints
// returns the longest valid emoji sequence (or undefined if no match)
// *MUTATES* the supplied array
// disallows interleaved ignored characters
// fills (optional) eaten array with matched codepoints
function consume_emoji_reversed(cps: number[]) {
	let node = EMOJI_ROOT;
	let emoji;
	let pos = cps.length;
	while (pos) {
		node = node[cps[--pos]];
		if (!node) break;
		let {V} = node;
		if (V) { // this is a valid emoji (so far)
			emoji = V;
			cps.length = pos; // truncate
		}
	}
	return emoji;
}
