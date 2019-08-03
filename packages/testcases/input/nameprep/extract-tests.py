import json
import re

output = ""
for line in file("test-vectors-00.txt"):
    line = line.strip()
    if line == "" or line[0:1] == "#":
        continue
    if line.startswith("Josefsson") or line.startswith("Internet-Draft"):
        continue
    output += line.replace("\n", "")

Tests = [ ]

def get_byte(v):
    if len(v) == 1:
        return ord(v)
    return int(v[2:4], 16)

def get_string(value):
    value = value.strip()
    if value[0] == '"' and value[-1] == '"':
        return map(get_byte,  re.findall("(\\\\x[0-9a-fA-F]{2}|.)", value[1:-1].replace('""', '')))
    if value.lower() == "null":
        return None
    raise Exception("unhandled")

Tests = [ ]

matches = re.findall("({(?:.|\n)*?})", output)
for m in matches:
    comps = m[1:-1].split(",")
    test = dict(
        comment = comps[0].strip()[1:-1],
        input = get_string(comps[1]),
        output = get_string(comps[2])
    )
    if len(comps) >= 4:
        test["profile"] = get_string(comps[3])
    if len(comps) >= 5:
        test["flags"] = comps[4].strip()
    if len(comps) >= 6:
        test["rc"] = comps[5].strip()
    Tests.append(test)

print json.dumps(Tests)
