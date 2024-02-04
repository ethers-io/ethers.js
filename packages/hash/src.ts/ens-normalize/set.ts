export type IntSet = {[i: number]: number};

export function set_add_many(set: IntSet, v: number[]) {
	for (let x of v) set[x] = x;
}
