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

import { decode } from "@ethersproject/base64";

export type NextFunc = () => number;
export type Mapping = [number, number[]];

export function decode_arithmetic(bytes: Uint8Array) {
	let pos = 0;
	function u16() { return (bytes[pos++] << 8) | bytes[pos++]; }
	
	// decode the frequency table
	let symbol_count = u16();
	let total = 1;
	let acc = [0, 1]; // first symbol has frequency 1
	for (let i = 1; i < symbol_count; i++) {
		acc.push(total += u16());
	}

	// skip the sized-payload that the last 3 symbols index into
	let skip = u16();
	let pos_payload = pos;
	pos += skip;

	let read_width = 0;
	let read_buffer = 0; 
	function read_bit() {
		if (read_width == 0) {
			// this will read beyond end of buffer
			// but (undefined|0) => zero pad
			read_buffer = (read_buffer << 8) | bytes[pos++];
			read_width = 8;
		}
		return (read_buffer >> --read_width) & 1;
	}

	const N = 31;
	const FULL = 2**N;
	const HALF = FULL >>> 1;
	const QRTR = HALF >> 1;
	const MASK = FULL - 1;

	// fill register
	let register = 0;
	for (let i = 0; i < N; i++) register = (register << 1) | read_bit();

	let symbols = [];
	let low = 0;
	let range = FULL; // treat like a float
	while (true) {
		let value = Math.floor((((register - low + 1) * total) - 1) / range);
		let start = 0;
		let end = symbol_count;
		while (end - start > 1) { // binary search
			let mid = (start + end) >>> 1;
			if (value < acc[mid]) {
				end = mid;
			} else {
				start = mid;
			}
		}
		if (start == 0) break; // first symbol is end mark
		symbols.push(start);
		let a = low + Math.floor(range * acc[start]   / total);
		let b = low + Math.floor(range * acc[start+1] / total) - 1
		while (((a ^ b) & HALF) == 0) {
			register = (register << 1) & MASK | read_bit();
			a = (a << 1) & MASK;
			b = (b << 1) & MASK | 1;
		}
		while (a & ~b & QRTR) {
			register = (register & HALF) | ((register << 1) & (MASK >>> 1)) | read_bit();
			a = (a << 1) ^ HALF;
			b = ((b ^ HALF) << 1) | HALF | 1;
		}
		low = a;
		range = 1 + b - a;
	}
	let offset = symbol_count - 4;
	return symbols.map(x => { // index into payload
		switch (x - offset) {
			case 3: return offset + 0x10100 + ((bytes[pos_payload++] << 16) | (bytes[pos_payload++] << 8) | bytes[pos_payload++]);
			case 2: return offset + 0x100 + ((bytes[pos_payload++] << 8) | bytes[pos_payload++]);
			case 1: return offset + bytes[pos_payload++];
			default: return x - 1;
		}
	});
}	

export function read_compressed_payload(s: string) {
	let v = decode_arithmetic(decode(s));
	let pos = 0;
	return () => v[pos++];
}

// eg. [0,1,2,3...] => [0,-1,1,-2,...]
export function signed(i: number) { 
	return (i & 1) ? (~i >> 1) : (i >> 1);
}

function read_counts(n: number, next: NextFunc) {
	let v = [];
	for (let i = 0; i < n; i++) v[i] = 1 + next();
	return v;
}

function read_ascending(n: number, next: NextFunc) {
	let v = [];
	for (let i = 0, x = -1; i < n; i++) v[i] = x += 1 + next();
	return v;
}

export function read_deltas(n: number, next: NextFunc) {
	let v = [];
	for (let i = 0, x = 0; i < n; i++) v[i] = x += signed(next());
	return v;
}

// [123][5] => [0 3] [1 1] [0 0]
export function read_sorted(next: NextFunc, prev: number = 0): number[] {
	let v = [];
	while (true) {
		let x = next();
		let n = next();
		if (!n) break;
		prev += x;
		for (let i = 0; i < n; i++) {
			v.push(prev + i);
		}
		prev += n + 1;
	}
	return v;
}

export function read_sorted_arrays(next: NextFunc): number[][] {
	return read_array_while(() => { 
		let v = read_sorted(next);
		return v.length ? v : null;
	});
}

// return unsorted? unique array 
export function read_member_array(next: NextFunc, lookup?: {[i: number]: number}): number[] {
	let v = read_ascending(next(), next);
	let n = next();
	let vX = read_ascending(n, next);
	let vN = read_counts(n, next);
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < vN[i]; j++) {
			v.push(vX[i] + j);
		}
	}
	return lookup ? v.map(x => lookup[x]) : v;
}

// returns map of x => ys
export function read_mapped(next: NextFunc) {
	let ret: Mapping[] = [];
	while (true) {
		let w = next();
		if (w == 0) break;
		read_linear_table(w, next, ret);
	}
	while (true) {
		let w = next() - 1;
		if (w < 0) break;
		read_replacement_table(w, next, ret);
	}
	return ret;
}

// read until next is falsy
// return array of read values
export function read_array_while<T>(next: (i: number) => T|null) {
	let v: T[] = [];
	while (true) {
		let x = next(v.length);
		if (!x) break;
		v.push(x);
	}
	return v;
}

// read w columns of length n
// return as n rows of length w
function read_transposed(n: number, w: number, next: NextFunc) {
	let m: number[][] = [];
	for (let i = 0; i < n; i++) m.push([]);
	for (let i = 0; i < w; i++) {
		read_deltas(n, next).forEach((x, j) => m[j].push(x));
	}
	return m;
}
 
// returns [[x, ys], [x+dx, ys+dy], [x+2*dx, ys+2*dy], ...]
// where dx/dy = steps, n = run size, w = length of y
function read_linear_table(w: number, next: NextFunc, into: Mapping[]) {
	let dx = 1 + next();
	let dy = next();
	let vN = read_array_while(next);
	read_transposed(vN.length, 1+w, next).forEach((v, i) => {
		let n = vN[i];
		let [x, ...ys] = v;
		for (let j = 0; j < n; j++) {
			let j_dy = j * dy;
			into.push([x + j * dx, ys.map(y => y + j_dy)]);
		}
	});
}

// return [[x, ys...], ...]
// where w = length of y
function read_replacement_table(w: number, next: NextFunc, into: Mapping[]) { 
	read_transposed(1 + next(), 1+w, next).forEach(v => {
		into.push([v[0], v.slice(1)]);
	});
}

export function read_trie(next: NextFunc) {
	type Node = {S: number, B: Node[], Q: number[]};
	let ret: number[][] = [];
	let sorted = read_sorted(next); 
	expand(decode([]), [], 0);
	return ret; // not sorted
	function decode(Q: number[]): Node { // characters that lead into this node
		let S = next(); // state: valid, save, check
		let B = read_array_while(() => { // buckets leading to new nodes
			let cps = read_sorted(next).map(i => sorted[i]);
			return cps.length ? decode(cps) : null;
		});
		return {S, B, Q};
	}
	function expand({S, B}: Node, cps: number[], saved: number) {
		if (S & 4 && saved === cps[cps.length-1]) return;
		if (S & 2) saved = cps[cps.length-1];
		if (S & 1) ret.push(cps); 
		for (let br of B) {
			for (let cp of br.Q) {
				expand(br, [...cps, cp], saved);
			}
		}
	}
}