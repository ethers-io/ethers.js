
def stringify(v):
    if type(v) == int:
        if v < 0:
            return "-" + hex(v)[3:]
        return hex(v)[2:]
    return v

def javascript(obj):
   if type(obj) == int:
       return str(obj)
   if type(obj) == list:
       return "[ " + ", ".join(javascript(i) for i in obj) + " ]";
   if type(obj) == dict:
       return "{ " + ", ".join(map(lambda k: ("%s: %s" % (stringify(k), javascript(obj[k]))), obj.keys())) + " }"
   print obj
   raise Exception("unsupported")

def javascript_table(obj):
    keys = obj.keys();
    keys.sort()

    obj = [ [ k, obj[k] ] for k in keys ]

    last = 0
    for item in obj:
        item[1] = stringify(item[1])
        v = item[0]
        item[0] -= last
        last = v

    return '"' + ",".join(("%s:%s" % (stringify(i[0]), i[1])) for i in obj) + '"'

weird = [ ];
lines = [ ]
for line in file("table.b.2.txt"):
    comps = [ x.strip() for x in line.split(";") ]
    if len(comps) != 3: raise Exception("bad line")
    if len(comps[1].split(" ")) > 1:
        weird.append(comps)
        continue
    lines.append(dict(
        src = int(comps[0], 16),
        dst = int(comps[1], 16),
        reason = comps[2]
    ))

buckets = dict()

for p in lines:
    delta = p["dst"] - p["src"];
    special = ""
    if delta not in buckets: buckets[delta] = [ ]
    buckets[delta].append(p)

deltas = buckets.keys()
deltas.sort()

simple = dict()
simple_relative = dict()
debug = dict()

def add_simple(src, dst):
    if len(str(dst - src)) < len(str(dst)):
        simple_relative[src] = dst - src
        debug[src] = "rel:" + str(dst - src)
    else:
        simple[src] = dst
        debug[src] = "abs:" + str(dst)

def add_simple_data(data):
    stride = 1
    skip = [ ]
    if "d" in data: stride = data["d"]
    if "e" in data: skip = data["e"]
    #print "ADD", data
    for i in xrange(data["l"], data["l"] + data["h"] + 1, stride):
        #print "  ", i, data
        if (i - data["l"]) in skip: continue
        add_simple(i, i + data["s"])

mappings = [ ]

for delta in deltas:
    bucket = buckets[delta]

    if len(bucket) <= 7:
        for p in bucket:
            add_simple(p["src"], p["dst"])
        continue

    last = 0

    # Compute the mode of the delta
    mode = dict()
    last = 0xffffffff
    for p in buckets[delta]:
        dl = p["src"] - last
        if dl not in mode: mode[dl] = 0
        mode[dl] += 1
        last = p["src"]
    mode = map(lambda k: (mode[k], k), mode.keys())
    mode.sort()
    mode = mode[-1][1]

    data = None

    for p in bucket:
        leap = ""
        dl = p["src"] - last

        # Non-standard detla...
        if dl != mode:

            # But only a small gap; add exceptions
            if data and (dl % mode) == 0 and (dl - mode) < 5:
                if "e" not in data: data["e"] = [ ]
                for i in xrange(last + mode, p["src"], mode):
                    data["e"].append(i - data["l"])

            # Big gap; start a new range
            else:
                if data:
                    data["h"] -= data["l"]

                    # Small range, use simple LUT instead
                    if data["h"] <= 7:
                        add_simple_data(data)
                    else:
                        mappings.append(data)
                        debug[data["l"]] = "MAP:" + str(data)

                # New range
                data = dict(l = 0xffffffff, h = 0, s = delta)
                if mode != 1: data["d"] = mode

            # Indicate a new range started in the debug info
            leap = "***"

        # Update ranges
        if p["src"] < data["l"]: data["l"] = p["src"]
        if p["src"] > data["h"]: data["h"] = p["src"]
        last = p["src"]

    data["h"] -= data["l"]
    if data["h"] <= 7:
        add_simple_data(data)
    else:
        mappings.append(data)
        debug[data["l"]] = "MAP:" + str(data)

# Create complex table (things that map to more than one byte)
complex = { }
complex_output = [ ];
for (src, dst, reason) in weird:
    for word in dst.split(" "):
        complex_output.append(int(word, 16))
        if len(word) != 4: raise Exception("hmmm")
    complex[int(src, 16)] = dst.replace(" ", "")

# Experimenting: We can easily create a LUT for the individual
# components, as there is substantial overlap.
#complex_output = dict((x, True) for x in complex_output).keys()
#complex_output.sort()
#print "COM", complex_output, len(complex_output)

# Sort mappings by lo
mappings.sort(lambda a, b: cmp(a["l"], b["l"]))

#debug_keys = debug.keys()
#debug_keys.sort()
#for d in debug_keys:
#   print d, debug[d]

#print mappings

last = 0
for item in mappings:
    v = item["l"]
    item["l"] -= last
    last = v

print "const Table_B_2_ranges = ["
print ",\n".join(("    " + javascript(m)) for m in mappings)
print "];"

print "SS", list(sorted(simple.keys())), simple[120763]
print "SS2", list(sorted(simple_relative.keys()))
print "const Table_B_2_lut_abs = createTable(" + javascript_table(simple) + ");"
print "const Table_B_2_lut_rel = createTable(" + javascript_table(simple_relative) + ");"
print "const Table_B_2_complex = createTable(" + javascript_table(complex) + ", bytes2);"
