%lex

%x script

%%

// Inline JavaScript State (gobble up all tokens including whitespace)

"{{="                                          %{ this.begin("script"); return "SCRIPT_EVAL"; %}
"{{!"                                          %{ this.begin("script"); return "SCRIPT_EXEC"; %}
<script>([^\}]|\n|\}[^}])                      return "SCRIPT_TOKEN";
<script>"}}"                                   this.popState()


// Assembler State

// Ignorables
([;][^\n]*\n)                                  // Ignore comments
(\s+)                                          // Ignore Whitespace

// Identifiers (and opcodes)
([A-Za-z][A-Za-z0-9]*)                         return "ID"

// Lists
"("                                            return "OPEN_PAREN"
")"                                            return "CLOSE_PAREN"
","                                            return "COMMA"

// Labels prefixes
([@][A-Za-z][A-Za-z0-9]*)                      return "AT_ID"
([#][A-Za-z][A-Za-z0-9]*)                      return "HASH_ID"
([$][A-Za-z][A-Za-z0-9]*)                      return "DOLLAR_ID"

// Scope
"{"                                            return "OPEN_BRACE"
"}"                                            return "CLOSE_BRACE"
":"                                            return "COLON"

// Data
"["                                            return "OPEN_BRACKET"
"]"                                            return "CLOSE_BRACKET"

// Literals
(0x([0-9a-fA-F][0-9a-fA-F])*)                  return "HEX"
([1-9][0-9]*|0)                                return "DECIMAL"
//(0b[01]*)                                      return "BINARY"

// Special
<<EOF>>                                        return "EOF"
                                               return "INVALID"

/lex

%start program

%%

program
    : statement_list EOF
        { return { type: "scope", name: "_", statements: $1, loc: getLoc(yy, null) }; }
    ;

javascript
    : /* empty */
       { $$ = ""; }
    | SCRIPT_TOKEN javascript
       { $$ = $1 + $2; }    
    ;

opcode_list
    : opcode
        { $$ = [ $1 ]; }
    | opcode COMMA opcode_list
        { {
           const opcodes = $3.slice();
           opcodes.unshift($1);
           $$ = opcodes;
        } }
    ;

opcode
    : ID
        { $$ = { type: "opcode", bare: true, mnemonic: $1, operands: [ ], loc: getLoc(yy, @1) }; }
    | ID OPEN_PAREN CLOSE_PAREN
        { $$ = { type: "opcode", mnemonic: $1, operands: [ ], loc: getLoc(yy, @1, @3) }; }
    | ID OPEN_PAREN opcode_list CLOSE_PAREN
        { $$ = { type: "opcode", mnemonic: $1, operands: $3, loc: getLoc(yy, @1, @4) }; }
    | HASH_ID
        { $$ = { type: "length", label: $1.substring(1), loc: getLoc(yy, @1) }; }
    | DOLLAR_ID
        { $$ = { type: "offset", label: $1.substring(1), loc: getLoc(yy, @1)  }; }
    | HEX
        { $$ = { type: "hex", value: $1, loc: getLoc(yy, @1)  }; }
    | DECIMAL
        { $$ = { type: "decimal", value: $1, loc: getLoc(yy, @1)  }; }
    | SCRIPT_EVAL javascript
        { $$ = { type: "eval", script: $2, loc: getLoc(yy, @1, @2)  }; }
    ;

hex_list
    : /* empty */
        { $$ = [ ]; }
    | hex hex_list
        { {
            const hexes = $2.slice();;
            hexes.unshift($1);
            $$ = hexes;
        } }
    ;

hex
    : HEX
        { $$ = { type: "hex", verbatim: true, value: $1, loc: getLoc(yy, @1) }; }
    | DECIMAL
        { {
            const value = parseInt($1);
            if (value >= 256) { throw new Error("decimal data values must be single bytes"); }
            $$ = { type: "hex", verbatim: true, value: ("0x" + (value).toString(16)), loc: getLoc(yy, @1) };
        } }
    | SCRIPT_EVAL javascript
        { $$ = { type: "eval", verbatim: true, script: $2, loc: getLoc(yy, @1, @2) }; }
    ;

statement_list
    : /* empty */
        { $$ = [ ]; }
    | statement statement_list
        { {
            const statements = $2.slice();
            statements.unshift($1);
            $$ = statements;
        } }
    ;

statement
    : opcode
    | AT_ID COLON
        { $$ = { type: "label", name: $1.substring(1), loc: getLoc(yy, @1, @2)  }; }
    | AT_ID OPEN_BRACE statement_list CLOSE_BRACE
        { $$ = { type: "scope", name: $1.substring(1), statements: $3, loc: getLoc(yy, @1, @4) }; }
    | AT_ID OPEN_BRACKET hex_list CLOSE_BRACKET
        { $$ = { type: "data", name: $1.substring(1), data: $3, loc: getLoc(yy, @1, @4) }; }
    | SCRIPT_EXEC javascript
        { $$ = { type: "exec", script: $2, loc: getLoc(yy, @1, @2) }; }
    ;

%%

function getLoc(yy, start, end) {
    if (end == null) { end = start; }

    let result = null;
    if (start) {
        result = {
            first_line: start.first_line,
            first_column: start.first_column,
            last_line: end.last_line,
            last_column: end.last_column
        };
    }

    if (yy._ethersLocation) {
        return yy._ethersLocation(result);
    }

    return Object.freeze(result);
}

