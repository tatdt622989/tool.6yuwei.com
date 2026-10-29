# Security Policy

隨手 (tool.6yuwei.com) is a static site: every tool runs in the visitor's browser and no user input is sent to our servers. The only third-party scripts are Google AdSense (and Google Analytics when enabled).

## Reporting a vulnerability

Please report security issues privately through GitHub's **Report a vulnerability** button on the repository's Security tab (private vulnerability reporting), not in a public issue. Include the affected URL or file, steps to reproduce, and the impact you expect.

We aim to acknowledge reports within 7 days. Things we especially care about:

- Any path by which a tool could send user input, files or results off the device.
- XSS in tools that render user-provided content (Markdown preview, regex tester, HTML entities, JSON formatter).
- Supply-chain issues in dependencies or the build/deploy pipeline (Dockerfile, GitHub Actions).
