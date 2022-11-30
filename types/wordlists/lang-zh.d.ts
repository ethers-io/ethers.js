import { Wordlist } from "./wordlist.js";
/**
 *  The [[link-bip-39]] Wordlist for the Chinese language.
 *
 *  This Wordlist supports both simplified and traditional
 *  character set, depending on which is specified in the
 *  constructor.
 *
 *  For the ``zh_cn`` language use ``"cn"`` and for the ``zh_tw``
 *  langauge, use ``"tw"``.
 *
 *  @_docloc: api/wordlists
 */
export declare class LangZh extends Wordlist {
    /**
     *  Creates a new instance of the Chinese language Wordlist for
     *  the %%dialect%%, either ``"cn"`` or ``"tw"`` for simplified
     *  or traditional, respectively.
     *
     *  This should be unnecessary most of the time as the exported
     *  [[langZhCn]] and [[langZhTw]] should suffice.
     */
    constructor(dialect: string);
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(phrase: string): Array<string>;
    /**
     *  Returns a singleton instance of a ``LangZh`` for %%dialect%%,
     *  creating it if this is the first time being called.
     */
    static wordlist(dialect: string): LangZh;
}
//# sourceMappingURL=lang-zh.d.ts.map