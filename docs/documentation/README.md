-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Flatworm Docs
=============


The *Flatworm Docs* rendering script is designed to be **very**
simple, but provide enough formatting necessary for documenting
JavaScript libraries.

A lot of its inspiration came from [Read the Docs](../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/readthedocs/sphinx_rtd_theme) and
the [Sphinx](../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.sphinx-doc.org) project.


Fragments
---------


Flatworm Docs are made up of fragments. A fragment is either a lone
body of [markdown](./) text, or a
[directive](./) for specialized formatting, which may
itself have body.


### Directive Format



```
_DIRECTIVE: VALUE @<LINK> @META<PARAMETER>
BODY

DIRECTIVE:  The directive name
VALUE:      Optional; the value to pass to the directive
LINK:       Optional; a name for internal linking
META:       Optional; extended directive functionality
PARAMETER:  Optional; value to pass to extended directive functions
BODY:       Optional; the directive body (certain directives only)
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




#### **_note:** *TITLE*

A *note* is placed in a blue bordered-box to draw attention to it.




#### **_warning:** *TITLE*

A *warning* is placed in an orange bordered-box to draw attention to it.




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

_definition and reset the indentation.

_note: Title
This is placed in a blue box.

_warning: Title
This is placed in an orange box.

_null:
This breaks out of a directive. For example, to end a
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



Configuration
-------------


Configuration is optional (but highly recommended) and may be either
a simple JSON file (config.json) or a JS file (config.js) placed in
the top  of the source folder.

TODO:  example JSON and example JS


Extended Directive Functions
----------------------------



### @INHERIT<markdown>


Adds an inherits description to a directive. The *markdown* may contain links.

This extended directive function is available for:



* _section
* _subsetion
* _heading


### @NAV<text>


Sets the name in the breadcrumbs when not the current node.

This extended directive function is available for:



* _section


### @SRC<text>


Calls the configuration `getSourceUrl(text, VALUE)` to get a URL which
will be linked to by a link next to the *directive*.

This extended directive function requires an advanced `config.js` [Configuration](./)
file since it requires a JavaScript function.

This extended directive function is available for:



* _section
* _subsetion
* _heading
* _property



-----
**Content Hash:** d9553352210e8259406507b6b50fc3a611a1dde0aab1a979cbcc6c22af677fb9