# Contributing

Thank you for helping improve 隨手 (tool.6yuwei.com). Bug reports, fixes and new tools are welcome.

## Before you open a pull request

- For a new tool or a large change, open an issue first so we can agree on the scope.
- Follow the structure in the [README](README.md#新增一個工具): each tool lives in `src/tools/<slug>/` with `meta.ts`, `logic.ts`, `logic.test.ts` and `Tool.astro`.
- Keep every tool client-side: no uploads, no backend calls, no new third-party scripts.
- Run these commands and make sure they pass:

  ```bash
  npm test
  npm run check
  npm run build
  ```

- Do not commit `.env`, secrets, personal files, logs or generated test output.

## Licensing of contributions

By submitting a contribution (code, text, images or any other material) to this repository, you agree that:

1. You wrote the contribution yourself, or you have the right to submit it under these terms.
2. The contribution is licensed to the public under the [GNU AGPL-3.0-only](LICENSE), the same license as the project.
3. You also grant the project owner, 6yuwei, a perpetual, worldwide, non-exclusive, royalty-free and irrevocable license to use, modify, distribute and sublicense the contribution, including under license terms other than the AGPL.
4. You keep the copyright in your contribution.

If you cannot agree to these terms, please open an issue that describes the change instead of a pull request.

## Names and logo

The names 隨手, Suishou Tools and 隨手ツール, the logo and the domain tool.6yuwei.com are not covered by the AGPL. See [License and trademarks](README.md#license-and-trademarks-english).

## Security issues

Do not report security problems in a public issue. See [SECURITY.md](SECURITY.md).

---

## 貢獻說明（中文摘要）

- 新工具或大改動請先開 issue 討論範圍。
- 送 PR 前請確認 `npm test`、`npm run check`、`npm run build` 都通過。
- 送出貢獻即表示你同意：內容是你自己寫的或你有權提交；以 AGPL-3.0-only 公開授權；並另外授予專案作者 6yuwei 永久、全球、非專屬、免權利金且不可撤回的授權，可使用、修改、散布及再授權（包括以 AGPL 以外的條款）。著作權仍歸你所有。
- 安全性問題請依 [SECURITY.md](SECURITY.md) 私下回報。
