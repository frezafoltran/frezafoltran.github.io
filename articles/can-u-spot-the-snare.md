---
title: "Can u spot the snare?"
date: 2026-01-01
thumbnail: "/assets/fourier-funk.png"
image: "/assets/fourier-funk.png"
---

It fascinates me how Shazam can identify almost any song so quickly.

In a sense, a human Shazam is less impressive.

We can identify songs even when they are transposed, sped up, hummed off-key, or played on a different instrument.

## How do computers hear?

Computers convert sound into numerical representations that describe how energy is distributed across frequencies over time.

This works well for exact matches and noisy environments, but it is less accurate when:

- Pitch or tempo changes

- Instrumentation differs

- Recordings vary in acoustics or performance

## How do our ears work?

Humans don’t register raw frequencies, instead we perceive relationships.

Our ear decomposes sound into frequencies, and our brain abstracts:

:::definition
**Relative Pitch**: We hear the "shape" of a melody. Just as size doesn’t change a square’s shape, pitch doesn’t change a song’s identity.
:::

:::definition
**Rhythmic Patterns**: We feel the "pulse". Like a heartbeat, the rhythm is recognizable whether it’s racing or resting because the spacing between beats stays proportional.
:::

:::definition
**Harmonic Structure**: We "group" sounds. A computer sees 20 separate frequencies; we see a forest instead of 20 individual trees. We bundle notes together into a single "chord."
:::

:::definition
**Sound Signatures (Timbre)**: We identify the texture of a snare or guitar regardless of the room's acoustics.
:::

This allows recognition across transposition, tempo changes, and even humming.

We recognize **patterns**, not waveforms.

## How to make computers listen like humans?

Shift from **signal matching** to **pattern understanding**:

- Focus on relative features (intervals, rhythm, chroma) instead of raw frequencies

- Make representations invariant to pitch and tempo changes

- Separate sources (i.e. isolate instruments before analysis)

- Learn compact representations that encode musical identity, not audio detail
