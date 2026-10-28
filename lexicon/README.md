# The change record in InTheWake

Every commit here that changes files outside the exempt list in `change-record.json` carries a change entry:
why it mattered and what it enables, in the words of whoever made it. The pre-commit hook refuses a commit
without one. Content and generated files are exempt, so a recipe, a sermon or a rebuilt index needs nothing.

```bash
PS=<your Project-Sophos checkout>       # the hook finds it through SOPHOS_ROOT, ../Project-Sophos or ~/Project-Sophos
node $PS/admin/change-record.mjs new --repo . --task <Tekton task> --slug <short-name> \
  --why "<why it mattered>" --enables "<what can be done now>" \
  --proved-by "<test file>::<test name>"    # or --untested "<why there is no test>"
git add lexicon/
```

- Entries are filed under the `public` partition because this repository is public: no host names, private or tailnet addresses, home paths or secrets, and the gate refuses them.
- `MANUAL.md` is generated from the entries. Never edit it or an entry by hand; a correction is a new entry with `--supersedes`.
- Install the hooks once per clone: `git config core.hooksPath .githooks`.
- Every code, remedy and the reason for each rule: Project-Sophos `docs/lexicon/CHANGE-RECORD.md`.

Soli Deo Gloria.
