---
name: principle-redesign-from-first-principles
description: Use when a new requirement contradicts an assumption the existing design is built on (who owns data, a 1:1 that becomes 1:n, a flow that gains a new actor or state) and fitting it in would mean flags, special cases or parallel code paths. Not for additive features that fit the current model.
---

# Redesign From First Principles

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been a foundational assumption from the start.

1. Read all affected files and understand the current design.
2. Ask: "if we were writing this from scratch with this new requirement, what would we build?"
3. Propagate the change through every reference: types, docs, examples, rationale sections.
4. Think about the whole redesign, then deliver it incrementally.

This is the method for preserving option value when integrating changes into an existing design.

## When not to use

- The requirement fits the current model: add it the ordinary way.
- The redesign would touch code unrelated to the change: plan it separately and ask first.
