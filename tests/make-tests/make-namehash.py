
import json
import os
import sha3


def keccak256(data):
    hasher = sha3.keccak_256()
    hasher.update(data)
    return hasher.digest()

# See: http://docs.ens.domains/en/latest/introduction.html#namehash
# See: https://github.com/ethereum/EIPs/issues/137

def namehash(name):
  name = name.lower()
  if name == '':
    return '\0' * 32
  else:
    label, _, remainder = name.partition('.')
    return keccak256(namehash(remainder) + keccak256(label))

Tests = [
    dict(name = "", test = "official-test-vector-0", expected = "0x0000000000000000000000000000000000000000000000000000000000000000"),
    dict(name = "eth", test = "official-test-vector-1", expected = "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae"),
    dict(name = "foo.eth", test = "official-test-vector-2", expected = "0xde9b09fd7c5f901e23a3f19fecc54828e9c848539801e86591bd9801b019f84f"),

    dict(name = "", test = "empty"),
    dict(name = "eth", test = "top-levle"),
    dict(name = "wallet.eth", test = "second-level"),
    dict(name = "vitalik.wallet.eth", test = "third-level"),
    dict(name = "ViTalIk.WALlet.Eth", test = "mixed case"),
]

# @TODO: add Unicode examples

for i in xrange(0, len(Tests)):
    test = Tests[i]
    hash = '0x' + namehash(test['name']).encode('hex')
    if 'expected' in test:
        if test['expected'] != hash:
            raise Exception('Bad Wolf')
    else:
        test['expected'] = hash

with file('../tests/namehash.json', 'w') as f:
    f.write(json.dumps(Tests))
    os.system('cat ../test/namehash.json | gzip > ../tests/namehash.json.gz');
