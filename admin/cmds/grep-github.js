"use strict";

const { colorify } = require("../log");
const { getIssues } = require("../github");
const { repeat } = require("../utils");

const Options = {
    "body": 1,
    "end": 1,
    "issue": 1,
    "start": 1,
    "title": 1,
    "user": 1,
};

const Flags = {
    "open": 1,
    "match-case": 1,
};

(async function() {
    const options = { };
    for (let i = 2; i < process.argv.length; i++) {
        const option = process.argv[i];
        if (option.substring(0, 2) === "--") {
            const comps = option.substring(2).split(/=/);
            if (Flags[comps[0]]) {
                if (comps[1] != null) { throw new Error("Invalid flag: " + option); }
                options[comps[0]] = true;
            } else if (Options[comps[0]]) {
                if (comps[1] == null) {
                    options[comps[0]] = process.argv[++i];
                    if (options[comps[0]] == null) {
                        throw new Error("Missing option value: " + option);
                    }
                } else {
                    options[comps[0]] = comps[1];
                }
            } else {
                throw new Error("Unexpected option: " + option);
            }
        } else {
            throw new Error("Unexpected argument: " + option);
        }
    }

    if (options["title"]) { options.title = new RegExp(options.title, (options["match-case"] ? "": "i")); }
    if (options["body"]) { options.body = new RegExp(options.title, (options["match-case"] ? "": "i")); }
    if (options["start"]) {
        if (options["start"].match(/^[0-9]{4}-[0-9]{2}-[0-9{2}]$/)) {
            throw new Error("Expected YYYY-MM-DD");
        }
    }
    if (options["end"]) {
        if (options["end"].match(/^[0-9]{4}-[0-9]{2}-[0-9{2}]$/)) {
            throw new Error("Expected YYYY-MM-DD");
        }
    }

    const count = { issues: 0, comments: 0, code: 0, responses: 0 };

    const issues = await getIssues();
    issues.forEach((issue) => {
        const info = issue.issue;
        const comments = issue.comments;

        if (options.issue && parseInt(options.issue) != info.number) { return; }
        if (options.open && info.state !== "open") { return; }
        if (options.title && !info.title.match(options.title)) { return; }
        if (options.body) {
            const body = info.body + "\n" + comments.map((c) => (c.body)).join("\n");
            if (!body.match(options.body)) {
                return;
            }
        }
        if (options.user) {
            const users = comments.map((c) => (c.user.login));
            users.push(info.user.login);
            if (users.indexOf(options.user) === -1) {
                return;
            }
        }

        const dates = comments.map((c) => (c.created_at.split("T")[0]));
        dates.push(info.created_at.split("T")[0]);

        if (options.start) {
            if (dates.filter((d) => (d >= options.start)).length === 0) { return; }
        }
        if (options.end) {
            if (dates.filter((d) => (d <= options.start)).length === 0) { return; }
        }

        count.issues++;

        console.log(colorify(repeat("=", 70), "bold"))
        console.log(colorify("Issue:", "bold"), info.title, ` (#${ info.number })`);
        console.log(colorify("User:","bold"), colorify(info.user.login, "blue"));
        console.log(colorify("State:", "bold"), info.state);
        if (info.created_at === info.updated_at) {
            console.log(colorify("Created:", "bold"), info.created_at);
        } else {
            console.log(colorify("Created:", "bold"), info.created_at, ` (updated: ${ info.updated_at })`);
        }
        info.body.trim().split("\n").forEach((line) => {
            console.log("  " + line);
        });

        if (comments.length) {
            comments.forEach((info) => {
                if (options.start && info.created_at < options.start) { return ; }
                if (options.end && info.created_at > options.end) { return; }
                count.comments++;
                if (options.user && info.user.login !== options.user) { return; }
                count.responses++;
                if (info.body.indexOf("`") >= 0) { count.code++; }
                console.log(colorify(repeat("-", 70), "bold"));
                console.log(colorify("User:", "bold"), colorify(info.user.login, "green"));
                if (info.created_at === info.updated_at) {
                    console.log(colorify("Created:", "bold"), info.created_at);
                } else {
                    console.log(colorify("Created:", "bold"), info.created_at, ` (updated: ${ info.updated_at })`);
                }
                info.body.trim().split("\n").forEach((line) => {
                    console.log("  " + line);
                });
            });
        }
    });

    console.log(colorify(repeat("=", 70), "bold"))

    // @TODO: Add stats on new/closed issues
    //if (options.user) {
    //    console.log(`${ count.responses } responses (${ count.code } w/ code) on ${ count.comments } comments across ${ count.issues } issues.`);
    //} else {
        console.log(`${ count.comments } comment${ (count.comments !== 1) ? "s": "" } across ${ count.issues } issue${ (count.issues !== 1) ? "s": ""}.`);
    //}

})().catch((error) => {
    console.log("Error: " + error.message);
});
