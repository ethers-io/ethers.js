'use strict';

import fs from "fs";
import { resolve } from "path";

import { saveTests, TestCase } from "..";

const testcases: Array<TestCase.Unit> = JSON.parse(fs.readFileSync(resolve(__dirname, "../input/units.json")).toString());

saveTests("units", testcases);

