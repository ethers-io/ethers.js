"use strict";

(async function() {
  const stopWords = "a an and as at for from in of on the with".split(/ /g);
  function search(words) {
    const blocks = [ ];
    const tally = { };
    const skipped = [ ];
    const searchWords = [ ];

    // For each word...
    const leftover = words.replace(/([a-z][a-z0-9]*)/ig, (all, word) => {
      if (stopWords.indexOf(word.toLowerCase()) >= 0) { return ("|stop:" + word + "|"); }
      if (searchWords.indexOf(word) === -1) { searchWords.push(word); }
      word = "_" + word.toLowerCase();
      const found = data.indices[word];
      if (found) {
        found.forEach((block) => {
          blocks.push(block);
          const comps = block.split("/");
          if (tally[block] == null) { tally[block] = 0; }
          if (tally[comps[0]] == null) { tally[comps[0]] = 0; }

          // Give the summary and the summary block some clout
          tally[comps[0]] += 1;
          tally[block] += 1;

          // Give a little extra clout if the title matching
          const title = (((data.summaries[comps[0]] || {}).title) || "");
          if (title.indexOf(word.substring(1)) >= 0) {
              tally[comps[0]] += 1;
          }
        });
      }
      // Return this to detect unprocessed characters
      return "|";
    });

    // What parts of the search query di we discard?
    leftover.split("|").forEach((junk) => {
      junk = junk.trim();
      if (junk) { skipped.push(junk); }
    });;
    console.log("Skipped: " + skipped.map((i) => JSON.stringify(i)).join(", "));

    // Score each block
    const scores = blocks.reduce((accum, block) => {
      const comps = block.split("/");
      accum[block] = 11 * tally[block] + 3 * tally[comps[0]];
      return accum;
    }, { });

    const result = Object.keys(scores);
    result.sort((a, b) => (scores[b] - scores[a]));

    //console.log(scores, result);

    let lastComps = [ -1, -1 ];
    const output = [ ];
    result.forEach((block) => {
      const comps = block.split("/").map((v) => parseInt(v));
      const summary = data.summaries[comps[0]];
      const details = summary.blocks[comps[1]];

      if (comps[0] === lastComps[0]) {
        const joiner = (comps[1] === lastComps[1] + 1) ? " ": ".. ";
        output[output.length - 1].text += joiner + details.text;
      } else {
        output.push({
          title: summary.title,
          link: details.link,
          text: details.text
        });
      }

      lastComps = comps;
    });

    return {
        results: output,
        searchWords: searchWords
    };
  }

  const response = await fetch("/v5/search.json");
  const data = await response.json();

  const content = document.querySelector("div.content");
  const footer = document.querySelector("div.content div.footer");

  function htmlify(parent, text, searchWords) {
      let current = "";
      function flush() {
        if (current.length > 0) {
          const span = document.createElement("span");
          span.textContent = current;
          parent.appendChild(span);
          current = "";
        }
      }

      for (let i = 0; i < text.length; i++) {
          current += text[i];
          for (let j = 0; j < searchWords.length; j++) {
            const word = searchWords[j];
            const offset = current.length - word.length;
            const tailValue = current.substring(offset);
            if (tailValue.toLowerCase() === word) {
              current = current.substring(0, offset);
              flush();

              const span = document.createElement("span");
              span.className = "highlight";
              span.textContent = tailValue;
              parent.appendChild(span);
              break;
            }
          }
      }

      flush();

      return parent;
  }

  function appendBlock(title, body, link, searchWords) {
    title = title.split(/=>|\(/)[0];
    title = title.replace(/--/g, "\xbb");

    const titleA = htmlify(document.createElement(link ? "a": "span"), title, searchWords || [ ]);
    if (link) {
      titleA.setAttribute("href", link);
    }

    const titleH3 = document.createElement("h3");
    titleH3.appendChild(titleA);
    content.insertBefore(titleH3, footer)

    if (body) {
      const bodyP = htmlify(document.createElement("p"), body, searchWords);
      content.insertBefore(bodyP, footer)
    }
  }

  const words = decodeURIComponent((location.search.split("search=")[1] || "").replace(/\+/g, " "));
  document.getElementById("search").value = words;
  const { results, searchWords } = search(words);
  if (results.length === 0) {
     appendBlock("No Results.")
  } else {
     results.forEach((result) => {
      appendBlock(result.title, result.text, result.link, searchWords);
    });
  }
})();
