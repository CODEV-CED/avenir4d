# Tailwind v4 Editor Setup

This project uses Tailwind CSS v4 with the new PostCSS plugin (`@tailwindcss/postcss`) and v4-specific at-rules like `@plugin`, `@custom-variant`, and `@theme`. Some editors flag these as unknown at-rules by default.

## VS Code configuration

Workspace settings include:

- `css.lint.unknownAtRules: "ignore"` — Avoid false errors for Tailwind v4 at-rules in CSS files.
- `postcss.validate: true` — Enable PostCSS validation.
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`) and PostCSS Language Support (`csstools.postcss`) are recommended in `.vscode/extensions.json`.

Tailwind is wired via `postcss.config.mjs`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

If you still see warnings, reload VS Code and ensure the recommended extensions are installed.
