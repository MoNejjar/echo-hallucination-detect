## Diagram Sources

This directory contains the **authoritative Mermaid source files** for system documentation. Inline copies inside `docs/architecture.md` and `docs/user_flow.md` are for convenience only; edit these `.mmd` files to make lasting changes.

| File | Diagram Purpose | Consumed In |
|------|------------------|-------------|
| `topology.mmd` | High-level component & data flow | architecture.md |
| `pipeline-sequence.mmd` | Request → analysis → scoring sequence | architecture.md |
| `refinement-loop.mmd` | Human iterative refinement workflow | user_flow.md, README summary |

### Conventions
* Left-to-right orientation (`flowchart LR`) preferred for horizontal space efficiency.
* Node labels use Title Case for components, sentence case for actions.
* Use concise edge labels only when clarifying conditional branches.
* Avoid styling directives to keep GitHub rendering clean.

### Editing Workflow
1. Modify the `.mmd` source.
2. (Optional) Regenerate SVG assets for offline docs or PDFs.
3. Copy inline version if you want immediate Markdown reflect (optional).

### Generate SVG/PNG Locally
Requires Node.js.

```bash
npm install -g @mermaid-js/mermaid-cli
cd docs/diagrams
mmdc -i topology.mmd -o topology.svg
mmdc -i pipeline-sequence.mmd -o pipeline-sequence.svg
mmdc -i refinement-loop.mmd -o refinement-loop.svg
```

Add `-b transparent` for transparent backgrounds, or `-t dark` / `-t neutral` for theming.

### Version Control Guidance
* Keep diffs minimal—single conceptual change per commit when altering diagrams.
* Reference commit SHAs in thesis or external docs if citing a stable architecture.

### Future Enhancements
* Automated CI job to export diagrams and attach as build artifacts.
* Multi-variant theme generation for light/dark PDF inclusion.
* Hash comment insertion to detect divergence between inline copies and source.

---
Maintainer: See root README for contact details.