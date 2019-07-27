"use strict";

import { toUtf8CodePoints, UnicodeNormalizationForm } from "./utf8";

type Ranged = {
    l: number,
    h: number,
    d?: number,
    s?: number,
    e?: Array<number>
};

type Table = { [ src: number ]: Array<number> };

function bytes2(data: string): Array<number> {
    if ((data.length % 4) !== 0) { throw new Error("bad data"); }
    let result = [];
    for (let i = 0; i < data.length; i += 4) {
        result.push(parseInt(data.substring(i, i + 4), 16));
    }
    return result;
}

function createTable(data: string, func?: (value: string) => Array<number>): Table {
    if (!func) {
        func = function(value: string) { return [ parseInt(value, 16) ]; }
    }

    let result: Table = { };
    data.split(",").forEach((pair) => {
        let comps = pair.split(":");
        result[parseInt(comps[0], 16)] = func(comps[1]);
    });

    return result;
}

const Table_B_1_flags = "ad,34f,1806,180b,180c,180d,200b,200c,200d,2060,feff".split(",").map((v) => parseInt(v, 16));

const Table_B_2_ranges: Array<Ranged> = [
    { h: 25, s: -120335, l: 120432 },
    { h: 25, s: -120283, l: 120380 },
    { h: 25, s: -120231, l: 120328 },
    { h: 25, s: -120179, l: 120276 },
    { h: 25, s: -120127, l: 120224 },
    { h: 25, s: -120075, l: 120172 },
    { h: 24, s: -120023, e: [ 2, 7, 13, 15, 16, 17 ], l: 120120 },
    { h: 24, s: -119971, e: [ 2, 7, 8, 17 ], l: 120068 },
    { h: 25, s: -119919, l: 120016 },
    { h: 25, s: -119867, e: [ 1, 4, 5, 7, 8, 11, 12, 17 ], l: 119964 },
    { h: 25, s: -119815, l: 119912 },
    { h: 24, s: -119775, e: [ 17 ], l: 120720 },
    { h: 25, s: -119763, l: 119860 },
    { h: 24, s: -119717, e: [ 17 ], l: 120662 },
    { h: 25, s: -119711, l: 119808 },
    { h: 24, s: -119659, e: [ 17 ], l: 120604 },
    { h: 24, s: -119601, e: [ 17 ], l: 120546 },
    { h: 24, s: -119543, e: [ 17 ], l: 120488 },
    { h: 54, s: 1, e: [ 48 ], l: 256, d: 2 },
    { h: 14, s: 1, l: 313, d: 2 },
    { h: 44, s: 1, l: 330, d: 2 },
    { h: 10, s: 1, e: [ 2, 6, 8 ], l: 391, d: 2 },
    { h: 16, s: 1, l: 459, d: 2 },
    { h: 84, s: 1, e: [ 18, 24, 66 ], l: 478, d: 2 },
    { h: 22, s: 1, l: 984, d: 2 },
    { h: 32, s: 1, l: 1120, d: 2 },
    { h: 52, s: 1, l: 1162, d: 2 },
    { h: 12, s: 1, l: 1217, d: 2 },
    { h: 40, s: 1, e: [ 38 ], l: 1232, d: 2 },
    { h: 14, s: 1, l: 1280, d: 2 },
    { h: 148, s: 1, l: 7680, d: 2 },
    { h: 88, s: 1, l: 7840, d: 2 },
    { h: 15, s: 16, l: 8544 },
    { h: 25, s: 26, l: 9398 },
    { h: 25, s: 32, l: 65 },
    { h: 30, s: 32, e: [ 23 ], l: 192 },
    { h: 26, s: 32, e: [ 17 ], l: 913 },
    { h: 31, s: 32, l: 1040 },
    { h: 25, s: 32, l: 65313 },
    { h: 37, s: 40, l: 66560 },
    { h: 37, s: 48, l: 1329 },
    { h: 15, s: 80, l: 1024 }
];
const Table_B_2_lut_abs = createTable("b5:956,178:255,17f:115,181:595,186:596,189:598,18a:599,18f:601,190:603,193:608,194:611,196:617,197:616,19c:623,19d:626,19f:629,1a6:640,1a9:643,1ae:648,1b1:650,1b2:651,1b7:658,1f6:405,1f7:447,220:414,345:953,3d0:946,3d1:952,3d2:965,3d5:966,3d6:960,3f0:954,3f1:961,3f2:963,3f4:952,3f5:949,1fbe:953,1fda:8054,1fdb:8055,1fea:8058,1feb:8059,1ff8:8056,1ff9:8057,1ffa:8060,1ffb:8061,2102:99,2107:603,210b:104,210c:104,210d:104,2110:105,2111:105,2112:108,2115:110,2119:112,211a:113,211b:114,211c:114,211d:114,2124:122,2126:969,2128:122,212a:107,212b:229,212c:98,212d:99,2130:101,2131:102,2133:109,213e:947,213f:960,2145:100,1d6b9:952,1d6d3:963,1d6f3:952,1d70d:963,1d72d:952,1d747:963,1d767:952,1d781:963,1d7a1:952,1d7bb:963");
const Table_B_2_lut_rel = createTable("18e:79,1c4:2,1c7:2,1ca:2,1f1:2,2f2:1,2f4:1,2f6:1,304:1,306:1,330:1,340:1,342:1,344:1,34e:1,358:1,35e:1,360:1,362:1,364:1,370:1,372:1,374:1,386:38,388:37,389:37,38a:37,38c:64,38e:63,38f:63,390:1,3d3:-6,3d4:-9,784:1,1e9b:-58,1fba:-74,1fbb:-74,1fc8:-86,1fc9:-86,1fca:-86,1fcb:-86,1fec:-7,3e10:-8,3e11:-8,3e12:-8,3e13:-8,3e14:-8,3e15:-8,3e16:-8,3e17:-8,3e30:-8,3e31:-8,3e32:-8,3e33:-8,3e34:-8,3e35:-8,3e50:-8,3e51:-8,3e52:-8,3e53:-8,3e54:-8,3e55:-8,3e56:-8,3e57:-8,3e70:-8,3e71:-8,3e72:-8,3e73:-8,3e74:-8,3e75:-8,3e76:-8,3e77:-8,3e90:-8,3e91:-8,3e92:-8,3e93:-8,3e94:-8,3e95:-8,3eb2:-8,3eb3:-8,3eb4:-8,3eb5:-8,3eb6:-8,3eb7:-8,3eb8:-8,3ed0:-8,3ed1:-8,3ed2:-8,3ed3:-8,3ed4:-8,3ed5:-8,3ed6:-8,3ed7:-8,3f70:-8,3f71:-8,3fb0:-8,3fb1:-8,3fd0:-8,3fd1:-8");
const Table_B_2_complex = createTable("df:00730073,130:00690307,149:02BC006E,1f0:006A030C,37a:002003B9,390:03B903080301,3b0:03C503080301,587:05650582,1e96:00680331,1e97:00740308,1e98:0077030A,1e99:0079030A,1e9a:006102BE,1f50:03C50313,1f52:03C503130300,1f54:03C503130301,1f56:03C503130342,1f80:1F0003B9,1f81:1F0103B9,1f82:1F0203B9,1f83:1F0303B9,1f84:1F0403B9,1f85:1F0503B9,1f86:1F0603B9,1f87:1F0703B9,1f88:1F0003B9,1f89:1F0103B9,1f8a:1F0203B9,1f8b:1F0303B9,1f8c:1F0403B9,1f8d:1F0503B9,1f8e:1F0603B9,1f8f:1F0703B9,1f90:1F2003B9,1f91:1F2103B9,1f92:1F2203B9,1f93:1F2303B9,1f94:1F2403B9,1f95:1F2503B9,1f96:1F2603B9,1f97:1F2703B9,1f98:1F2003B9,1f99:1F2103B9,1f9a:1F2203B9,1f9b:1F2303B9,1f9c:1F2403B9,1f9d:1F2503B9,1f9e:1F2603B9,1f9f:1F2703B9,1fa0:1F6003B9,1fa1:1F6103B9,1fa2:1F6203B9,1fa3:1F6303B9,1fa4:1F6403B9,1fa5:1F6503B9,1fa6:1F6603B9,1fa7:1F6703B9,1fa8:1F6003B9,1fa9:1F6103B9,1faa:1F6203B9,1fab:1F6303B9,1fac:1F6403B9,1fad:1F6503B9,1fae:1F6603B9,1faf:1F6703B9,1fb2:1F7003B9,1fb3:03B103B9,1fb4:03AC03B9,1fb6:03B10342,1fb7:03B1034203B9,1fbc:03B103B9,1fc2:1F7403B9,1fc3:03B703B9,1fc4:03AE03B9,1fc6:03B70342,1fc7:03B7034203B9,1fcc:03B703B9,1fd2:03B903080300,1fd3:03B903080301,1fd6:03B90342,1fd7:03B903080342,1fe2:03C503080300,1fe3:03C503080301,1fe4:03C10313,1fe6:03C50342,1fe7:03C503080342,1ff2:1F7C03B9,1ff3:03C903B9,1ff4:03CE03B9,1ff6:03C90342,1ff7:03C9034203B9,1ffc:03C903B9,20a8:00720073,2103:00B00063,2109:00B00066,2116:006E006F,2120:0073006D,2121:00740065006C,2122:0074006D,3371:006800700061,3373:00610075,3375:006F0076,3380:00700061,3381:006E0061,3382:03BC0061,3383:006D0061,3384:006B0061,3385:006B0062,3386:006D0062,3387:00670062,338a:00700066,338b:006E0066,338c:03BC0066,3390:0068007A,3391:006B0068007A,3392:006D0068007A,3393:00670068007A,3394:00740068007A,33a9:00700061,33aa:006B00700061,33ab:006D00700061,33ac:006700700061,33b4:00700076,33b5:006E0076,33b6:03BC0076,33b7:006D0076,33b8:006B0076,33b9:006D0076,33ba:00700077,33bb:006E0077,33bc:03BC0077,33bd:006D0077,33be:006B0077,33bf:006D0077,33c0:006B03C9,33c1:006D03C9,33c3:00620071,33c6:00632215006B0067,33c7:0063006F002E,33c8:00640062,33c9:00670079,33cb:00680070,33cd:006B006B,33ce:006B006D,33d7:00700068,33d9:00700070006D,33da:00700072,33dc:00730076,33dd:00770062,fb00:00660066,fb01:00660069,fb02:0066006C,fb03:006600660069,fb04:00660066006C,fb05:00730074,fb06:00730074,fb13:05740576,fb14:05740565,fb15:0574056B,fb16:057E0576,fb17:0574056D", bytes2);

const Table_C_flags = "80,70f,1680,180e,2000,d800,fff9,e0020".split(",").map((v) => parseInt(v, 16));
const Table_C_ranges = "80-20,340,2000-f,2028-7,205f-4,206a-5,2ff0-b,d800-20ff,fdd0-1f,fff9-6,1d173-7,1fffe,2fffe,3fffe,4fffe,5fffe,6fffe,7fffe,8fffe,9fffe,afffe,bfffe,cfffe,dfffe,e0020-5f".split(",").map((v) => {
    let comps = v.split("-");
    if (comps.length === 1) { comps[1] = "1"; }
    return { l: parseInt(comps[0], 16), h: parseInt(comps[1], 16) }
});

function matchMap(value: number, ranges: Array<Ranged>): Ranged {
    for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        if (value >= range.l && value <= range.l + range.h) {
            if (range.e && range.e.indexOf(value - range.l) == -1) { continue; }
            return range;
        }
    }
    return null;
}

function flatten(values: Array<Array<number>>): Array<number> {
    return values.reduce((accum, value) => {
        value.forEach((value) => { accum.push(value); });
        return accum;
    }, [ ]);
}

export function nameprep(value: string): string {

    // This allows platforms with incomplete normalize to bypass
    // it for very basic names which the built-in toLowerCase
    // will certainly handle correctly
    if (value.match(/^[a-z0-9-]*$/i)) { return value.toLowerCase(); }

    // Get the code points (keeping the current normalization)
    let codes = toUtf8CodePoints(value);

    codes = flatten(codes.map((code) => {

        // Substitute Table B.1 (Maps to Nothin)
        if (Table_B_1_flags.indexOf(code) >= 0) { return [ ]; }
        if (code >= 0xfe00 && code <= 0xfe0f) { return [ ]; }

        // Substitute Table B.2 (Case Folding)
        let match = matchMap(code, Table_B_2_ranges);
        if (match) { return [ code + match.s ]; }

        let codes = Table_B_2_lut_abs[code];
        if (codes) { return codes; }

        let shift = Table_B_2_lut_rel[code];
        if (shift) { return [ code + shift[0] ]; }

        let complex = Table_B_2_complex[code];
        if (complex) { return complex; }

        // No Substitution
        return [ code ];
    }));

    // Normalize using fomr KC
    codes = toUtf8CodePoints(String.fromCharCode(...codes), UnicodeNormalizationForm.NFKC);

    // Prohibit C.1.2, C.2.2, C.3, C.4, C.5, C.6, C.7, C.8, C.9
    codes.forEach((code) => {
        if (Table_C_flags.indexOf(code) >= 0) { throw new Error("invalid character code"); }
        Table_C_ranges.forEach((range) => {
            if (code >= range.l && code <= range.l + range.h) {
                throw new Error("invalid character code");
            }
        });
    });

    // Prohibit IDNA (@TODO: add this list)

    return String.fromCharCode(...codes);
}

