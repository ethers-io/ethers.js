-----

Documentation: [html](https://docs.ethers.io/)

-----

Flatworm Docs
=============

Fragments
---------

### Directive Format

```
_DIRECTIVE: VALUE @<LINK> @EXTENSION<PARAMETER>
BODY

MORE BODY

DIRECTIVE:  The directive name
VALUE:      Optional; the value to pass to the directive
LINK:       Optional; a name for internal linking
EXTENSION:  Optional; extended directive functionality
PARAMETER:  Optional; value to pass to extended directive functions
BODY:       Optional; the directive body (certain directives only)
```

### Flatworm Directives

#### **_section:** *TITLE*

A *section* has its **TITLE** in an H1 font. Sections are linked to in *Table of Contents* and have a dividing line drawn above them.

The body supports markdown.

There should only be one `_section:` per page.

**Extensions:** [@inherit](/v5/documentation/#flatworm--ext-inherit), [@src](/v5/documentation/#flatworm--ext-src), [@nav](/v5/documentation/#flatworm--ext-nav), [@note](/v5/documentation/#flatworm--ext-note)


#### **_subsection:** *TITLE*

A *subsection* has its **TITLE** in an H2 font. Subsections are linked to in *Table of Contents* and have a dividing line drawn above them.

The title and body support markdown.

**Extensions:** [@inherit](/v5/documentation/#flatworm--ext-inherit), [@src](/v5/documentation/#flatworm--ext-src), [@note](/v5/documentation/#flatworm--ext-note)


#### **_heading:** *TITLE*

A *heading* has its **TITLE** in an H3 font.

The title and body support markdown.

**Extensions:** [@inherit](/v5/documentation/#flatworm--ext-inherit), [@src](/v5/documentation/#flatworm--ext-src), [@note](/v5/documentation/#flatworm--ext-note)


#### **_definition:** *TERM*

A *definition* has its **TERM** in normal text and the body is indented.

The title and body support markdown.


#### **_property:** *SIGNATURE*

A *property* has its JavaScript **SIGNATURE** formatted.

The body supports markdown and the return portion of the signature support markdown links.

**Extensions:** [@src](/v5/documentation/#flatworm--ext-src)


#### **_note:** *BANNER*

A *note* is placed in a blue bordered-box to draw attention to it.

The body supports markdown.


#### **_warning:** *BANNER*

A *warning* is placed in an orange bordered-box to draw attention to it.

The body supports markdown.


#### **_code:** *CAPTION*

Creates a [Code](/v5/documentation/#flatworm--code) block.

The body does **not** support markdown, and will be output exactly as is, with the exception of [Code Evaluation](/v5/documentation/#flatworm--code-eval).

If a line begins with a `"_"`, it should be escaped with a `"\"`.

**Extensions:** [@lang](/v5/documentation/#flatworm--ext-lang)


#### **_table:** *FOOTER*

Creates a [Table](/v5/documentation/#flatworm--table) structured according to the body.

Each cell contents supports markdown and variables supports markdown.

**Extensions:** [@style](/v5/documentation/#flatworm--ext-style)


#### **_toc:**

A *toc* injects a Table of Contents, loading each line of the body as a filename and recursively loads the *toc* if present, otherwise all the *sections* and *subsections*.

The body does **not** support markdown, as it is interpreted as a list of files and directories to process.


#### **_null:**

A *null* is used to terminated a directive. For example, after a *definition*, the bodies are indented, so a *null* can be used to reset the indentation.

The body supports markdown.


```
_section: Hello World @<link-main>
Body for section...


_subsection: Some Example @<link-secondary>
Body for subsection...


_heading: Large Bold Text @<link-here>
Body for heading...


_definition: Flatworm
A phylum of relatively **simple** bilaterian, unsegmented,
soft-bodied invertebrates.


_property: String.fromCharCode(code) => string
Returns a string created from //code//, a sequence of
UTF-16 code units.


_code: heading

// Some code goes here
while(1);


_table: Table Footer

|  **Name**  |  **Color**  |
|   Apple    |   Red       |
|   Banana   |   Yellow    |
|   Grape    |   Purple    |


_toc:
    some-file
    some-directory


_note: Title
This is placed in a blue box.


_warning: Title
This is placed in an orange box.


_null:
This breaks out of a directive. For example, to end
a ``_note:`` or ``_code:``.
```

Markdown
--------

```
**bold text**

//italic text//

__underlined text__

``monospace code``

^^superscript text^^

~~strikeout text~~

- This is a list
- With bullet points
- With a total of three items

This is a [Link to Ethereum](https://ethereum.org) and this
is an [Internal Link](some-link).

This is a self-titled link [[https://ethereumorg]] and this
[[some-link]] will use the title from its directives value.
```

Code
----

### JavaScript Evaluation

```
_code: Result of Code Example  @lang<javascript>

// <hide>
const url = require("url");
// </hide>

url.parse("https://www.ricmoo.com/").protocol
//!

url.parse(45)
//! error

// You want to assign (doesn't emit eval) AND display the value
const foo = 4 + 5;
// <hide>
foo
// </hide>
//!
```

```javascript
url.parse("https://www.ricmoo.com/").protocol
// 'https:'

url.parse(45)
// Error: The "url" argument must be of type string. Received type number

// You want to assign (doesn't emit eval) AND display the value
const foo = 4 + 5;
// 9
```

### Languages





Tables
------

### Row Data

### Alignment

Alignment Conditions (higher precedence listed first)



```
_table: Result of Alignment Example @style<compact>

|   center    |

| left        |
|left         |

|       right |
|        right|
```

Result of Alignment Example



### Row and Column Spanning

```
_table: Result of Cell Spanning Example @style<compact>

|  (1x1)  |  (1x2)      <|  (2x1)  |
|  (2x2)      <|  (2x1)  |    ^    |
|    ^         |    ^    |  (1x1)  |
```

Result of Cell Spanning Example



### Styles





### Variables

```
_table: Result of Variables Example

$Yes:    This option is supported.
$No:     This option is **not** supported
$bottom: This just represents an example of
         what is possible. Notice that variable
         content can span multiple lines.

|  **Feature**     |  **Supported**  |
|  Dancing Monkey  |      $Yes       |
|  Singing Turtle  |      $No        |
|  Newt Hair       |      $Yes       |
|        $bottom                    <|
```

Result of Variables Example



Configuration
-------------

Extensions
----------

### @inherit< markdown >

### @lang< text >

### @nav< text >

### @note< markdown >

### @src< key >

### @style< text >

