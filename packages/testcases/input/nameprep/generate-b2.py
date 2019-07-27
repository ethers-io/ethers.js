
def stringify(v):
    if type(v) == int:
        return hex(v)
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
    return '"' + ",".join(("%s:%s" % (hex(k)[2:], obj[k])) for k in keys) + '"'

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

def add_simple(src, dst):
    if len(str(dst - src)) < len(str(dst)):
        simple_relative[src] = dst - src
    else:
        simple[src] = dst

def add_simple_data(data):
    stride = 1
    skip = [ ]
    if "d" in data: stride = data["d"]
    if "e" in data: skip = data["e"]
    for i in xrange(data["l"], data["l"] + data["h"] + 1, stride):
        if i in skip: continue
        v = data["l"] + i
        add_simple(v, v + data["s"])

mappings = [ ]

for delta in deltas:
    bucket = buckets[delta]

    if len(bucket) <= 7:
        for p in bucket:
            add_simple(p["src"], p["dst"])
        continue

    last = 0

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
        if dl != mode:
            if data and (dl % mode) == 0 and (dl - mode) < 5:
                if "e" not in data: data["e"] = [ ]
                for i in xrange(last + mode, p["src"], mode):
                    data["e"].append(i - data["l"])
            else:
                if data:
                    data["h"] -= data["l"]
                    if data["h"] <= 7:
                        add_simple_data(data)
                    else:
                        mappings.append("    " + javascript(data))
                data = dict(l = 0xffffffff, h = 0, s = delta)
                if mode != 1: data["d"] = mode
            leap = "***"
        if p["src"] < data["l"]: data["l"] = p["src"]
        if p["src"] > data["h"]: data["h"] = p["src"]
        last = p["src"]

    data["h"] -= data["l"]
    if data["h"] <= 7:
        add_simple_data(data)
    else:
        mappings.append("    " + javascript(data))

complex = { }
for (src, dst, reason) in weird:
    for word in dst.split(" "):
        if len(word) != 4: raise Exception("hmmm")
    complex[int(src, 16)] = dst.replace(" ", "")

print "const Table_B_2_ranges = ["
print ",\n".join(mappings)
print "];"
print "const Table_B_2_lut_abs = createTable(" + javascript_table(simple) + ");"
print "const Table_B_2_lut_rel = createTable(" + javascript_table(simple_relative) + ");"
print "const Table_B_2_complex = createTable(" + javascript_table(complex) + ", bytes2);"
