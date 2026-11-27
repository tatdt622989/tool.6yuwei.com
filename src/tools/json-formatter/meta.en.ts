import { defineTool } from '../types';

export default defineTool({
  slug: 'json-formatter',
  name: 'JSON Formatter',
  seoTitle: 'JSON Formatter and Validator: Beautify, Minify and Fix JSON',
  description:
    'Free JSON formatter and validator. Beautify or minify JSON, sort keys, and get the exact line and column of any syntax error with a plain-English fix.',
  category: 'dev',
  icon: 'Braces',
  keywords: [
    'json formatter',
    'json validator',
    'json beautifier',
    'json pretty print',
    'json minify',
    'format json online',
    'json lint',
    'json checker',
    'json viewer',
    'validate json',
    'json syntax error',
    'sort json keys',
    'json formatter online',
  ],
  intro:
    'Paste JSON to validate and pretty-print it instantly, or minify it into a single line. If it is invalid, you get the exact line and column plus a plain-English explanation of what is wrong.',
  howTo: [
    'Paste JSON into the “JSON input” box, or click “Load sample” to try it.',
    'Choose “Beautify” and an indentation (2 spaces, 4 spaces or Tab), or choose “Minify” to remove all whitespace.',
    'Tick “Sort keys” to order object keys alphabetically, which makes two JSON files much easier to compare.',
    'Click “Copy output” or “Download .json”. If the JSON is invalid, fix the line shown under the input and the output updates automatically.',
  ],
  sections: [
    {
      heading: 'The JSON errors you will hit most often',
      body: [
        'JSON (RFC 8259) is much stricter than JavaScript. The usual suspects are a trailing comma after the last item ({"a": 1,}), keys or strings in single quotes, unquoted keys ({name: "x"}), comments, and values such as NaN, Infinity or undefined, none of which are valid JSON.',
        'Browsers report these differently. Chrome says “Unexpected token } in JSON at position 42”, Firefox gives a line and column, and Safari often gives no position at all. This tool runs its own strict scanner, so you always get the line, the column and a caret pointing at the problem, whichever browser you use.',
      ],
    },
    {
      heading: 'Beautify vs minify',
      body: [
        'Beautifying (pretty-printing) adds line breaks and indentation so people can read the structure. Two spaces is the default in most JavaScript and TypeScript projects and in tools like Prettier; four spaces matches Python’s json.dumps(indent=4) and many Java and C# codebases.',
        'Minifying removes every unnecessary space and line break. It is what you send over the network or store in a config value, and it typically shrinks pretty-printed JSON by 20% to 40%. The status line shows the size before and after so you can see the difference.',
      ],
    },
    {
      heading: 'Why sorting keys helps',
      body: [
        'Object keys in JSON have no meaningful order, but APIs and serializers often emit them in different orders, which turns a simple comparison into noise. Sorting keys recursively gives a canonical form: run both documents through the formatter with “Sort keys” on, then diff the output. Array order is kept, because it is significant.',
      ],
    },
    {
      heading: 'Large numbers and other things to watch',
      body: [
        'JavaScript numbers are 64-bit floats, so integers above 9,007,199,254,740,991 (2^53 − 1) lose precision when parsed. Twitter/X and many databases send 64-bit IDs as strings for exactly this reason. If a long ID changes after formatting, the source should be sending it as a string.',
        'Duplicate keys are technically allowed by the spec, but most parsers keep only the last value, so the formatted output will show just one of them.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is my JSON sent to a server?',
      a: 'No. Parsing, validation and formatting all happen in your browser, so it is safe to paste API responses or config files that contain tokens. Only your mode and indentation choices are remembered on your device.',
    },
    {
      q: 'Why does it say a trailing comma is not allowed?',
      a: 'JavaScript and many config formats accept a comma after the last item, but strict JSON does not. Remove the comma before the closing } or ].',
    },
    {
      q: 'Can it format JSON with comments (JSONC) like tsconfig.json?',
      a: 'No. Comments are not part of JSON, so the validator flags them. Remove the // or /* */ comments first, or use a JSONC-aware editor such as VS Code for those files.',
    },
    {
      q: 'What is the difference between a JSON formatter and a JSON validator?',
      a: 'A validator only tells you whether the text is valid JSON; a formatter rewrites it with consistent indentation. This tool does both: invalid input gets an error with its position, valid input gets formatted.',
    },
    {
      q: 'How large a file can it handle?',
      a: 'Several megabytes are fine on a modern computer. Very large files (tens of MB) may make the page slow, because everything runs in your browser.',
    },
    {
      q: 'Does sorting keys change my data?',
      a: 'No. Only the order of keys inside objects changes, which has no meaning in JSON. Values and the order of array items stay exactly the same.',
    },
  ],
  related: ['text-diff', 'base64', 'jwt-decoder', 'url-encoder'],
  priority: 75,
  updated: '2026-10-29',
});
