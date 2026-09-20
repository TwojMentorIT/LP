# Agent instructions (LP repository)

Read README.md first (in Polish). It contains the mandatory rules, deployment process and the change log.

Key rules (details in README.md, section 1):

- Every change requires a WHO / WHY / WHAT entry in the change log (README.md, section 10), in the same commit.
- No trailing slashes: subpages are flat files (`name.html`, served as `/name`), internal links are root-absolute, canonical is `https://twojmentor.it/name`.
- Plain ASCII punctuation only: no em/en dashes, curly quotes, ellipsis character or emoji in content.
- Google tag on every page. New pages must be added to sitemap.xml, mapa-strony.html and llms.txt.
- Run `node scripts/check.js` before pushing. Pushing to `main` deploys to production; do it only when the owner asks.
- Do not modify the terms of service (regulamin) or privacy policy without an explicit request.
