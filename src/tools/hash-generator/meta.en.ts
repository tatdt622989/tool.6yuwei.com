import { defineTool } from '../types';

export default defineTool({
  slug: 'hash-generator',
  name: 'Hash Generator',
  seoTitle: 'Hash Generator: MD5, SHA-1, SHA-256, SHA-512 for Text and Files',
  description:
    'Free hash generator for text and files: MD5, SHA-1, SHA-256 and SHA-512 at once. Verify a download against its checksum. Files never leave your device.',
  category: 'dev',
  icon: 'Hash',
  keywords: [
    'hash generator',
    'sha256 generator',
    'md5 generator',
    'md5 hash generator',
    'sha256 hash online',
    'sha256 checksum',
    'file checksum calculator',
    'verify sha256 checksum',
    'sha1 generator',
    'sha512 generator',
    'checksum calculator',
    'online hash calculator',
    'md5 checksum file',
  ],
  intro:
    'Calculate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 for any text or file in one go. Paste a published checksum to confirm that a download is intact and untampered.',
  howTo: [
    'Choose “Text” to hash typed or pasted text, or “File” to hash a file from your device.',
    'Type the text, or choose or drop a file. All five hashes appear at once.',
    'To verify a download, paste the checksum from the publisher’s site into “Compare with a checksum”. The tool tells you which algorithm matches.',
    'Click “Copy” next to any hash. Tick “Uppercase output” if you need uppercase hex, as shown by Windows tools.',
  ],
  sections: [
    {
      heading: 'What is a hash?',
      body: [
        'A cryptographic hash function turns input of any size into a fixed-length fingerprint. The same input always gives the same hash, and changing a single bit changes the result completely. MD5 produces 128 bits (32 hex characters), SHA-1 160 bits (40), SHA-256 256 bits (64) and SHA-512 512 bits (128).',
        'Hashes are one-way: you cannot get the original data back from the hash. That makes them useful for verifying file integrity, detecting changes, deduplicating data and building digital signatures.',
      ],
    },
    {
      heading: 'How to verify a download with SHA-256',
      body: [
        'Software projects such as Ubuntu, Python and VS Code publish a SHA-256 checksum next to each download. Choose “File”, select the file you downloaded, then paste the published value into the compare box. “Match” means the file is byte-for-byte identical to what the publisher released; “No match” means it is corrupted, incomplete or not the file you expected.',
        'You can do the same on the command line: certutil -hashfile file.iso SHA256 or Get-FileHash file.iso in PowerShell on Windows, shasum -a 256 file.iso on macOS, and sha256sum file.iso on Linux. Windows prints uppercase hex; the comparison here ignores case and spaces.',
      ],
    },
    {
      heading: 'MD5 and SHA-1 are broken for security',
      body: [
        'Practical collision attacks exist for both MD5 (since 2004) and SHA-1 (Google’s SHAttered, 2017), so attackers can create two different files with the same hash. Don’t use them for digital signatures, certificates or anything where someone might deliberately forge a match. They are still fine for spotting accidental corruption and as cache keys. For security, use SHA-256 or stronger, as recommended by NIST.',
      ],
    },
    {
      heading: 'Don’t store passwords as plain hashes',
      body: [
        'Fast hashes like MD5 and SHA-256 are designed to be quick, which lets attackers test billions of password guesses per second on a GPU. Store passwords with a slow, salted algorithm built for that purpose, such as Argon2id, bcrypt or scrypt. OWASP’s Password Storage Cheat Sheet recommends Argon2id first.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can a hash be decrypted or reversed?',
      a: 'No. Hashing is not encryption and there is no key. “MD5 decrypt” sites only look up hashes of common words and leaked passwords in huge precomputed tables; they cannot reverse a hash of random data.',
    },
    {
      q: 'Why is my hash different from another tool’s?',
      a: 'Usually the input differs: a trailing newline (echo adds one unless you use -n), Windows CRLF line endings, extra spaces, or a different text encoding. This tool hashes text exactly as typed, encoded as UTF-8.',
    },
    {
      q: 'Is it safe to hash confidential files here?',
      a: 'Yes. Files are read and hashed locally with the browser’s Web Crypto API. Nothing is uploaded, so it works even for private documents.',
    },
    {
      q: 'Is there a file size limit?',
      a: 'The file is loaded into memory, so files up to a few hundred MB work well on most computers. Multi-gigabyte ISO images may fail in the browser; use the command-line tools listed above for those.',
    },
    {
      q: 'Which algorithm should I use?',
      a: 'SHA-256 for almost everything: it is widely supported, fast enough and secure. Use MD5 or SHA-1 only to match a checksum someone else published in that format.',
    },
    {
      q: 'Does uppercase or lowercase matter?',
      a: 'No. Hex is case-insensitive, so A1B2 and a1b2 are the same hash. The compare box ignores case and spaces.',
    },
  ],
  related: ['password-generator', 'base64', 'uuid-generator', 'jwt-decoder'],
  priority: 55,
  updated: '2026-10-29',
});
