-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Flatworm Docs
=============


The *Flatworm Docs* rendering script is designed to be **very**
simple, but provide enough formatting necessary for documenting
JavaScript libraries.

A lot of its inspiration came from [Read the Docs](https://github.com/readthedocs/sphinx_rtd_theme) and
the [Sphinx](https://www.sphinx-doc.org/) project.


Fragments
---------


Flatworm Docs are made up of fragments. A fragment is either a lone
body of [markdown](./) text, or a
[directive](./) for specialized formatting, which may
itself have body.


### Directive Format



```
_DIRECTIVE: VALUE @<LINK>
BODY

DIRECTIVE: The directive name
VALUE:     Optional; the value to pass to the directive
LINK:      Optional; a name for internal linking
BODY:      Optional; the directive body (certain directives only)
```



### Flatworm Directives



#### **_section:** *TITLE*

A *section* has its **TITLE** in an H1 font. Sections are linked
to in *Table of Contents* and have a dividing line drawn above
them. If an option is specified, it is avaialble as a name for
intern linking. There should only be one `_section:` per page.




#### **_subsection:** *TITLE*

A *subsection* has its **TITLE** in an H2 font. Subsections are linked
to in *Table of Contents* and have a dividing line drawn above
them. If an option is specified, it is avaialble as a name for
internal linking.




#### **_heading:** *TITLE*

A *heading* has its **TITLE** in an H3 font. If an option is specified,
it is available as a name for internal linking.




#### **_definition:** *TERM*

A *definition* has its **TERM** bolded and the markdown body is
indented.




#### **_property:** *SIGNATURE*

A *property* has its JavaScript **SIGNATURE** formatted and the
markdown body is indented.




#### **_code:** *FILENAME*

A *code* reads the **FILENAME** and depending on the extension
adjusts it.

For JavaScript files, the file is executed, with `//!` replaced
with the result of the last statement and `//!error` is replaced
with the throw error. If the error state does not agree, rendering
fails.




#### **_toc:**

A *toc* injects a Table of Contents, loading each line of the
body as a filename and recursively loads the *toc* if present,
otherwise all the *sections* and *subsections*.




#### **_null:**

A *null* is used to terminated a directive. For example, after
a *definition*, the bodies are indented, so a *null* can be
used to reset the indentation.




### Examples



```
_section: Hello World @<link-to-this-section>

_subsection: Some Example @<link-to-this-subsection>

_heading: Large Bold Text @<link-to-this-heading>

_definition: Flatworm
A phylum of relatively **simple** bilaterian, unsegmented,
soft-bodied invertebrates.

_property: String.fromCharCode(code) => string
Returns a string created from //code//, a sequence of
UTF-16 code units.

_code: filename.js

_toc:
    some-file
    some-directory

_null:
This breaks out of a directive. For example, to end a

_definition and reset the indentation.
```



Markdown
--------


The markdown is simple and does not have the flexibility of
other dialects, but allows for **bold**, *italic*,
*underlined*, `monospaced`, ^super-scripted text,
supporting [links](./) and lists.


```
**bold text**

//italic text//

__underlined text__

``monospace code``

^^superscript text^^

- This is a list
- With bullet points
- With a total of three items

This is separated by -- an en-dash.

This is separated by --- an em-dash.

This is a [Link to Ethereum](https://ethereum.org) and this
is an [Internal Link](some-link).

This is a self-titled link [[https://ethereumorg]] and this
[[some-link]] will use the title from its directives value.
```




-----
**Content Hash:** 2d45e62661589ea3cdf50cc4da9faf63c33b7385840b31fddaf9d3cbe35d6015