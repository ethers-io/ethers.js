'use strict';
import fs from "fs";
import { resolve } from "path";
import { saveTests } from "..";
const testcases = JSON.parse(fs.readFileSync(resolve(__dirname, "../input/nameprep-josefsson-idn.json")).toString());
saveTests("nameprep", testcases);
