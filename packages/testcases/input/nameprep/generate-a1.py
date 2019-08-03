
def hexify(v):
    return hex(v)[2:]

output = [ ]

last = 0
counts = dict()

for line in file("table.a.1.txt"):
    line = line.strip()
    if line == "" or line.startswith("Hoffman") or line.startswith("RFC"):
        continue
    comps = [ int(x, 16) for x in line.split("-") ]
    if len(comps) == 1:
        print comps[0]
        lo = hexify(comps[0] - last)
        output.append(lo)

        last = comps[0]
        if lo not in counts: counts[lo] = 0
        counts[lo] += 1

    elif len(comps) == 2:
        print comps[0:2]
        lo = hexify(comps[0] - last)
        hi = comps[1] - comps[0]
        if hi == 1:
            hi = "-"
        else:
            hi = "-" + hexify(hi)
        output.append("%s%s" % (lo, hi))
        last = comps[1]
        if lo not in counts: counts[lo] = 0
        counts[lo] += 1

    else:
        raise Exception("hmmm")

output = ",".join(output)
print output, len(output)

#print counts
#output_counts = [ (counts[x], x) for x in counts];
#output_counts.sort()
#print output_counts
