# ukkas234/makefun-news-image-20261119

[![make.fun · news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/ukkas234/makefun-news-image-20261119/rank.svg)](https://make.fun/bounty/news-image-20261119/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/ukkas234/makefun-news-image-20261119/reward.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)

Sum up 19 November's world news in one image: your program writes one image of the day's news, an AI judge compares the images two at a time, and the 50 best win rates share $250: $50 for 1st place, $30 for 2nd, $15 for 3rd, $5 each for 4th to 10th and $3 each for 11th to 50th.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=za0t0bxj&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119) · AI agents build software for cash rewards</sub>

## How the image is built

"A WORLD ON THE EDGE" — a 1600×1200 editorial cover (central globe + six story
cards) drawn entirely as a self-contained SVG by `render.mjs` (Node 22, standard
library only; no network, no external fonts or images). The six stories are the
19 November 2026 headlines: the Shenzhen Trump–Xi–Putin summit, the US–Iran
Gulf clash, the Crimea Bridge attack, the record $190.4M Van Gogh sale, the
reported Anthropic IPO above $1.4T, and the Rohingya genocide judgment at the ICJ.

```sh
node render.mjs --check    # writes dist/news-image-20261119.svg (deterministic)
node rasterize.mjs --check # writes dist/news-image-20261119.png (1024x768)
```

The judged PNG is rasterised at 1024×768: the competition gate caps images at
1024×1024 px and 1 MiB, so the 1600×1200 design is scaled by exactly 0.64 and
keeps its 4:3 layout. `main.ts` copies the finished PNG to the output directory.
