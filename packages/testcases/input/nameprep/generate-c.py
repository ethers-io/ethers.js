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

prohibit_single = [ ]
prohibit_range = [ ]

last_range_start = None
last = 0
for p in prohibit:
    if p - 1 == last:
        if last_range_start is None:
            last_range_start = last
            if len(prohibit_single) > 0 and prohibit_single[-1] == last:
                prohibit_single.pop()
    else:
        if last_range_start is not None:
            print "Range", last_range_start, last - last_range_start, hex(last_range_start)
            length = last - last_range_start
            if length == 1:
                length = ""
            else:
                length = "-" + hex(length)[2:]
            prohibit_range.append([ last_range_start, length ])
            last_range_start = None
        else:
            print "Single", p, hex(p)
            prohibit_single.append(p)
    last = p

last = 0
for i in xrange(0, len(prohibit_single)):
    v = prohibit_single[i]
    prohibit_single[i] -= last
    last = v
print 'const Table_C_lut = "' + ",".join(hex(x)[2:] for x in prohibit_single) + '";'

last = 0
for item in prohibit_range:
    v = item[0]
    item[0] -= last
    last = v
print 'const Table_C_ranges = "' + ",".join(("%s%s" % (hex(p[0])[2:], p[1])) for p in prohibit_range) + '";';
