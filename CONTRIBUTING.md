# Contributing

Thank you for helping make legal rights information accessible to more communities!

## Add a Translation

1. Fork this repository
2. Copy `content/en.md` to `content/<language-code>.md` (use [ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes))
3. Translate all content
4. Update the frontmatter:
   ```yaml
   ---
   language: fr
   languageName: Français
   title: Connaissez Vos Droits
   subtitle: ...
   lastUpdated: 2024-01-15
   ---
   ```
5. Submit a pull request

### Guidelines

**Do:**
- Keep the same document structure
- Use formal but accessible language
- Keep `<br/>` tags and `[phone](tel:phone)` links exactly as-is

**Don't:**
- Translate organization names (keep "ACLU", "National Immigration Law Center")
- Change phone numbers
- Add or remove sections

## Improve an Existing Translation

1. Fork the repository
2. Edit the file in `/content`
3. Submit a PR explaining what you changed

## AI-Assisted Translation

You can use Claude to generate a draft:

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm run translate -- fr Français
```

AI translations need human review before submission.

## Questions?

Open an issue — we're happy to help!
