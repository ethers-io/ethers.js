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

// Opcodes
([A-Za-z][A-Za-z0-9]*)                         return "ID"

// Lists
"("                                            return "OPEN_PAREN"
")"                                            return "CLOSE_PAREN"
","                                            return "COMMA"

// Labelled Target Prefixes
([@][A-Za-z][A-Za-z0-9]*)                      return "AT_ID"

// Label References
([$](_|[A-Za-z][A-Za-z0-9]*))                  return "DOLLAR_ID"
([#](_|[A-Za-z][A-Za-z0-9]*))                  return "HASH_ID"

// Scope
"{"                                            return "OPEN_BRACE"
"}"                                            return "CLOSE_BRACE"

// Label
":"                                            return "COLON"

// Data Segment
"["                                            return "OPEN_BRACKET"
"]"                                            return "CLOSE_BRACKET"

// Literals
(0x([0-9a-fA-F][0-9a-fA-F])*)                  return "HEX"
(0b(0|1)+)                                     return "BINARY"
([1-9][0-9]*|0)                                return "DECIMAL"

// Pop Placeholders
"$$"                                           return "DOLLAR_DOLLAR"
([$][1-9][0-9]*)                               return "DOLLAR_INDEX"

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
    | BINARY
        { {
            const hex = "0x" + parseInt(("0" + ($1).substring(2)), 2).toString(16);
            $$ = { type: "hex", value: hex, loc: getLoc(yy, @1)  };
        } }
    | DOLLAR_DOLLAR
        { $$ = { type: "pop", index: 0, loc: getLoc(yy, @1)  }; }
    | DOLLAR_INDEX
        { $$ = { type: "pop", index: parseInt(($1).substring(1)), loc: getLoc(yy, @1)  }; }
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
            let hex = (value).toString(16);
            while (hex.length < 2) { hex = "0" + hex; }
            $$ = { type: "hex", verbatim: true, value: ("0x" + hex), loc: getLoc(yy, @1) };
        } }
    | BINARY
        { {
            const value = parseInt(($1).substring(2), 2);
            if (value >= 256) { throw new Error("binary data values must be single bytes"); }
            const hex = ("0x" + (value).toString(16));
            $$ = { type: "hex", verbatim: true, value: hex, loc: getLoc(yy, @1)  };
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
        { {
            const statement = $1;
            statement.loc.statement = true;
            $$ = statement;
        } }
    | AT_ID COLON
        { $$ = { type: "label", name: $1.substring(1), loc: getLoc(yy, @1, @2, true)  }; }
    | AT_ID OPEN_BRACE statement_list CLOSE_BRACE
        { $$ = { type: "scope", name: $1.substring(1), statements: $3, loc: getLoc(yy, @1, @4, true) }; }
    | AT_ID OPEN_BRACKET hex_list CLOSE_BRACKET
        { $$ = { type: "data", name: $1.substring(1), data: $3, loc: getLoc(yy, @1, @4, true) }; }
    | SCRIPT_EXEC javascript
        { $$ = { type: "exec", script: $2, loc: getLoc(yy, @1, @2, true) }; }
    ;

%%

function getLoc(yy, start, end, statement) {
    if (end == null) { end = start; }

    let result = null;
    if (start) {
        result = {
            first_line: start.first_line,
            first_column: start.first_column,
            last_line: end.last_line,
            last_column: end.last_column,
            statement: !!statement
        };
    }

    if (yy._ethersLocation) {
        return yy._ethersLocation(result);
    }

    return result;
}

