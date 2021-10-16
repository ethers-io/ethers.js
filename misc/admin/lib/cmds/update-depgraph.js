"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const depgraph_1 = require("../depgraph");
const path_1 = require("../path");
const local_1 = require("../local");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const ordered = (0, depgraph_1.getOrdered)(true);
        (0, local_1.updateJson)((0, path_1.resolve)("tsconfig.project.json"), {
            references: ordered.map((name) => ({ path: ("./packages/" + name) }))
        });
    });
})().catch((error) => {
    console.log(error);
    process.exit(1);
});
