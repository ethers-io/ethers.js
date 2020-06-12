const fs = require("fs");
const { resolve } = require("path");

const Content = `
<html>
  <head>
    <title>ethers.js - Legacy Documentation</title>
    <style type="text/css">
      html {
        font-family: sans-serif;
      }
      h1 {
        opacity: 0.8;
      }
      .content {
        border: 2px solid #000;
        border-radius: 7px;
        box-shadow: 5px 5px 10px #aaa;
        left: 50%;
        padding: 20px;
        position: absolute;
        text-align: center;
        transform: translate(-50%, 30px);
        width: 700px;
      }
      .hr {
        border-top: 1px solid black;
        margin: 4px 10px 40px;
      }
      span.v5 {
        font-size: 24px;
        margin-bottom: 40px;
      }
      span.v4 {
        opacity: 0.7;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <h1>This link is out-of-date <i>and</i> has moved.</h1>
      <div class="hr"></div>
      <span class="v5">Click <a id="link-v5" href="%%DEFAULT%%">here</a> to visit the updated documentation</span>
      <br />
      <br />
      <br />
      <span class="v4">or continue to the historic <a id="link-v4" href="%%LEGACY%%">legacy documentation</a>.</span>
    </div>
    <script type="text/javascript">
      var redirects = %%REDIRECTS%%;
      var hash = location.hash;
      if (hash && hash !== "#") {
        hash = hash.substring(1);
        var v4 = document.getElementById("link-v4");
        v4.setAttribute("href", v4.getAttribute("href").split("#")[0] + "#" + hash);
        var target = redirects[hash];
        if (target) {
          var v5 = document.getElementById("link-v5");
          v5.setAttribute("href", target);
        }
      }
    </script>
  </body>
</html>`

const redirects = require("./redirects.json");
const links = require("../docs/v5/metadata.json").links;

const result = { };

const prefix = "ethers.js/html/";
Object.keys(redirects).forEach((uri) => {
    if (uri.substring(0, prefix.length) !== prefix) { return; }

    const comps = uri.substring(prefix.length).split("#");
    const filename = comps[0];
    const hash = comps[1] || "_";
    const tag = redirects[uri];

    let path = null;
    if (tag.path) {
        path = tag.path;
    } else if (tag.tag) {
        path = links[tag.tag] || null;
    } else {
        console.log("Missing tag:", uri);
        return;
    }

    if (!path) {
        console.log("Missing path:", uri);
        return;
    }

    if (!result[filename]) { result[filename] = {
        "_legacy": `/v4/${ filename }`
    }; }
    result[filename][hash] = path;
});

function generateOutput(filename) {
    const page = result[filename];
    return Content.replace("%%DEFAULT%%", page._ || "/v5/")
                  .replace("%%LEGACY%%", page._legacy || "/v4/")
                  .replace("%%REDIRECTS%%", JSON.stringify(page));
}

Object.keys(result).forEach((filename) => {
    const output = generateOutput(filename);
    const path = resolve(__dirname, "../docs/ethers.js/html", filename);
    fs.writeFileSync(path, output);
});

