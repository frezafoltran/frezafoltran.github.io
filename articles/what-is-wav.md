---
title: "What is .wav?"
date: 2026-01-02
thumbnail: "/assets/zion.png"
image: "/assets/zion.png"
---

**.wav** is a file format for a computer to store sound.

Sound is stored as uncompresed PCM (Pulse Code Modulation) consisting of a header and audio samples.

:::definition
Header contains metadata to playback audio samples:

**Sample Rate**: number of samples per second

**Bit Depth**: number of bits per sample

**Number of Channels**: number of independent audio sample streams

:::

:::definition
**Audio Samples**: list of numbers that represent the acoustic signal (air preassure measurements)
:::

To playback a sound, the computer streams the audio samples to a DAC (Digital-to-Analog Converter)

## But does it sound good?

The number of bits to represent each audio sample determines the dynamic range of output.

:::definition
**Dynamic Range**: distance between quietest and loudest sound without distortion.
:::

Each additional bit increases dynamic range by ~6dB.

So as long as sample rate and bit depth are high enough, a computer can playback sound accurately.
