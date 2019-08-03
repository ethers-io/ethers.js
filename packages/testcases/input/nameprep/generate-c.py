def hexify(v):
    return hex(v)[2:]

prohibit = [ ]

table = None
for line in file("table.c.txt"):
    line = line.strip()
    if line.startswith("#"): continue
    if line.startswith("---"):
        if line.find("Start") >= 0:
           table = line.replace("-", "").replace("Start", "").strip().replace(" ", "_").replace(".", "_")
           print table
        continue
    comps = [ c.strip() for c in line.split(";") ]
    if len(comps) != 2: raise Exception("hmmm")
    comps = comps[0].split("-")
    if len(comps) == 1:
        start = int(comps[0], 16)
        prohibit.append(start)
    elif len(comps) == 2:
        start = int(comps[0], 16)
        end = int(comps[1], 16)
        for i in xrange(start, end + 1):
            prohibit.append(i)
    else:
        raise Exception("hmmm")
print prohibit

# Dedup and sort
prohibit = list(dict([(p, True) for p in prohibit]).keys())
prohibit.sort()

output = [ dict(lo = prohibit[0], hi = prohibit[0]) ]

for p in prohibit[1:]:
    if p - 1 == output[-1]["hi"]:
         output[-1]["hi"] = p
    else:
         output.append(dict(lo = p, hi = p))

print output

last = 0
for r in output:
    r["h"] = r["hi"] - r["lo"]
    r["l"] = r["lo"] - last
    last = r["hi"]

    r["range"] = hexify(r["l"])
    if r["h"] > 1:
        r["range"] += "-" + hexify(r["h"])
    elif r["h"] > 0:
        r["range"] += "-"

print 'const Table_C_ranges = "' + ",".join(x["range"] for x in output) + '";'

