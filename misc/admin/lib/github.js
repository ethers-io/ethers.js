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
const geturl_1 = require("./geturl");
function createRelease(user, password, tagName, title, body, prerelease, commit) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield geturl_1.getUrl("https:/\/api.github.com/repos/ethers-io/ethers.js/releases", {
            body: Buffer.from(JSON.stringify({
                tag_name: tagName,
                target_commitish: (commit || "master"),
                name: title,
                body: body,
                //draft: true,
                draft: false,
                prerelease: !!prerelease
            })),
            method: "POST",
            headers: {
                "User-Agent": "ethers-io"
            },
            user: user,
            password: password
        });
        return JSON.parse(Buffer.from(result.body).toString("utf8")).html_url;
    });
}
exports.createRelease = createRelease;
