# Library health check

Made 2026-10-20 19:38 · 1017 books read · media files not checked (run with --online)

## Summary

| Check | Errors | Warnings | Notes |
|---|---|---|---|
| catalog | 1 | 8 | 0 |
| pages | 0 | 5 | 5 |
| narration | 0 | 44 | 71 |
| quiz | 0 | 197 | 101 |
| text | 0 | 10 | 479 |
| level | 0 | 44 | 0 |

**1 errors, 308 warnings, 656 notes.** Errors are things a child would notice (a page with no sound, an answer that is not one of the choices). Warnings are probably wrong. Notes are worth a look.  

Right-answer positions in all 11122 questions: A 35%, B 35%, C 30%

The right answer is the longest of the choices in **65%** of the 11122 questions (guessing the longest would be right a third of the time by chance). By topic: cs 69%, fiction 68%, math-stories 48%, science 69%, sel 69%, social-studies 67%.

## Reading level by grade

How hard the books read, for the grade they are filed under. If the grades were well spread out, each row would be a step up from the one before.

| Grade | Books | Reading level (Flesch-Kincaid, middle) | Middle half | Words in a sentence | Hard words |
|---|---|---|---|---|---|
| K | 162 | 2.6 | 1.7 - 3.7 | 7.8 | 7.2% |
| G1 | 162 | 2.0 | 1.1 - 3.3 | 7.6 | 6.5% |
| G2 | 159 | 4.0 | 2.9 - 5.2 | 9.8 | 7.3% |
| G3 | 158 | 6.0 | 4.6 - 7.4 | 12.8 | 7.0% |
| G4 | 124 | 6.1 | 5.3 - 7.1 | 12.9 | 6.8% |
| G5 | 123 | 6.5 | 5.5 - 8.1 | 12.8 | 8.0% |
| G6 | 123 | 7.4 | 6.3 - 8.9 | 13.5 | 8.2% |

## Books to look at first

Books with the most errors, then warnings:

| Book | Errors | Warnings | Notes |
|---|---|---|---|
| math-stories/what-comes-next | 1 | 0 | 4 |
| cs/computers-everywhere | 0 | 2 | 1 |
| cs/give-instructions-just-right | 0 | 2 | 1 |
| cs/inside-a-computer | 0 | 2 | 0 |
| cs/the-internet-connects-us | 0 | 2 | 1 |
| cs/working-together-on-code | 0 | 2 | 1 |
| fiction/basil-and-the-borrowed-roar | 0 | 2 | 2 |
| fiction/clap-it-across-the-market | 0 | 2 | 6 |
| fiction/grandmas-hands-remember | 0 | 2 | 0 |
| fiction/millie-and-the-shifting-wind | 0 | 2 | 0 |
| fiction/minas-moving-day-window | 0 | 2 | 0 |
| fiction/my-cardboard-box | 0 | 2 | 2 |
| fiction/ravi-and-the-stubborn-kite | 0 | 2 | 0 |
| fiction/the-attic-orchestra | 0 | 2 | 1 |
| fiction/the-cave-of-echoing-names | 0 | 2 | 0 |
| fiction/the-lantern-parade-mix-up | 0 | 2 | 0 |
| fiction/the-library-of-lost-sounds | 0 | 2 | 0 |
| fiction/the-missing-scene | 0 | 2 | 0 |
| fiction/the-museum-of-unfinished-inventions | 0 | 2 | 0 |
| fiction/the-wobbly-tower | 0 | 2 | 1 |
| fiction/two-plans-for-cedar-bridge | 0 | 2 | 0 |
| math-stories/place-value-to-the-millions | 0 | 2 | 1 |
| sel/the-message-saved-as-a-draft | 0 | 2 | 0 |
| social-studies/a-constitution-built-through-debate | 0 | 2 | 0 |
| social-studies/after-victory-what-changed | 0 | 2 | 0 |

## Errors (1)


### catalog (1)

- `math-stories/what-comes-next` listed twice (math-stories and cs)

## Warnings (308)


### catalog (8)

- `science/growing-up` filed under Grade 1 with the band 'Growing Reader', which only 1% of the Grade 1 books have
- `cs/inside-a-computer` has a page but is not in any books.js, so nobody can find it
- `fiction/my-cardboard-box` has a page but is not in any books.js, so nobody can find it
- `fiction/the-big-blue-kite` has a page but is not in any books.js, so nobody can find it
- `fiction/the-big-race` has a page but is not in any books.js, so nobody can find it
- `math-stories/the-fruit-graph` filed under Grade 1 with the band 'Growing Reader', which only 1% of the Grade 1 books have
- `fiction/the-picture-needs-more` has a page but is not in any books.js, so nobody can find it
- `fiction/the-wobbly-tower` has a page but is not in any books.js, so nobody can find it

### level (44)

- `social-studies/a-constitution-built-through-debate` reads like grade 12.0 (sentences 14.6 words, 6% hard words) but is filed under Grade 5, where books read like grade 6.5
- `social-studies/a-government-on-the-map` reads like grade 11.2 (sentences 12.7 words, 6% hard words) but is filed under Grade 3, where books read like grade 6.0
- `social-studies/a-promise-for-five-lakes` reads like grade 10.4 (sentences 12.4 words, 2% hard words) but is filed under Grade 2, where books read like grade 4.0
- `social-studies/ancient-hebrew-traditions-and-history` reads like grade 12.9 (sentences 14.4 words, 13% hard words) but is filed under Grade 6, where books read like grade 7.4
- `social-studies/california-on-page-and-screen` reads like grade 12.8 (sentences 16.3 words, 7% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/california-through-depression-and-war` reads like grade 10.7 (sentences 13.2 words, 7% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/christianity-change-and-the-roman-legacy` reads like grade 13.1 (sentences 15.1 words, 12% hard words) but is filed under Grade 6, where books read like grade 7.4
- `social-studies/city-of-many-arrivals` reads like grade 10.7 (sentences 13.5 words, 8% hard words) but is filed under Grade 4, where books read like grade 6.1
- `cs/computers-everywhere` reads like grade 10.9 (sentences 13.4 words, 6% hard words) but is filed under Grade 3, where books read like grade 6.0
- `social-studies/dolores-huerta-organizing-for-change` reads like grade 10.5 (sentences 13.7 words, 8% hard words) but is filed under Grade 2, where books read like grade 4.0
- `social-studies/doors-of-learning` reads like grade 12.7 (sentences 14.5 words, 6% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/ellen-ochoa-looking-closely-reaching-far` reads like grade 10.5 (sentences 13.2 words, 8% hard words) but is filed under Grade 2, where books read like grade 4.0
- `social-studies/fort-ross-a-place-between-empires` reads like grade 10.4 (sentences 13.5 words, 9% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/four-governments-one-watershed` reads like grade 10.6 (sentences 13.8 words, 7% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/george-washington-carver-soil-science-and-service` reads like grade 10.5 (sentences 15.4 words, 9% hard words) but is filed under Grade 2, where books read like grade 4.0
- `cs/give-instructions-just-right` reads like grade 7.5 (sentences 15.8 words, 1% hard words) but is filed under Kindergarten, where books read like grade 2.6
- `social-studies/gold-changed-the-river` reads like grade 10.9 (sentences 13.9 words, 10% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/good-fire-living-knowledge` reads like grade 12.1 (sentences 16.2 words, 6% hard words) but is filed under Grade 3, where books read like grade 6.0
- `social-studies/greek-stories-ideas-and-the-hellenistic-world` reads like grade 12.6 (sentences 14.1 words, 9% hard words) but is filed under Grade 6, where books read like grade 7.4
- `cs/info-in-info-out-grade-1` reads like grade 7.6 (sentences 13.7 words, 11% hard words) but is filed under Grade 1, where books read like grade 2.0
- `social-studies/jackie-robinson-beyond-the-ballpark` reads like grade 11.1 (sentences 13.9 words, 6% hard words) but is filed under Grade 2, where books read like grade 4.0
- `social-studies/life-and-power-in-the-roman-empire` reads like grade 12.4 (sentences 13.9 words, 11% hard words) but is filed under Grade 6, where books read like grade 7.4
- `social-studies/many-roots-main-street` reads like grade 11.3 (sentences 13.6 words, 7% hard words) but is filed under Grade 3, where books read like grade 6.0
- `fiction/minas-moving-day-window` reads like grade 5.7 (sentences 12.4 words, 9% hard words) but is filed under Grade 1, where books read like grade 2.0
- `cs/my-idea-my-credit` reads like grade 6.0 (sentences 15.3 words, 6% hard words) but is filed under Kindergarten, where books read like grade 2.6
- `social-studies/native-california-is-here` reads like grade 12.2 (sentences 14.5 words, 7% hard words) but is filed under Grade 4, where books read like grade 6.1
- `math-stories/ordering-by-length` reads like grade 5.7 (sentences 12.1 words, 0% hard words) but is filed under Grade 1, where books read like grade 2.0
- `social-studies/patricia-bath-a-clearer-way-to-see` reads like grade 10.1 (sentences 12.5 words, 9% hard words) but is filed under Grade 2, where books read like grade 4.0
- `social-studies/rails-work-and-unequal-laws` reads like grade 10.6 (sentences 13.8 words, 10% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/seas-mountains-and-greek-city-states` reads like grade 12.4 (sentences 14.2 words, 12% hard words) but is filed under Grade 6, where books read like grade 7.4
- `cs/sort-it-out` reads like grade 7.2 (sentences 13.1 words, 8% hard words) but is filed under Kindergarten, where books read like grade 2.6
- `social-studies/symbols-tell-a-story` reads like grade 6.6 (sentences 8.9 words, 6% hard words) but is filed under Kindergarten, where books read like grade 2.6
- `science/taking-care-of-earth` reads like grade 5.7 (sentences 15.3 words, 3% hard words) but is filed under Grade 1, where books read like grade 2.0
- `science/taking-care-of-our-environment` reads like grade 6.5 (sentences 12.9 words, 12% hard words) but is filed under Kindergarten, where books read like grade 2.6
- `fiction/the-attic-orchestra` reads like grade 5.6 (sentences 6.7 words, 15% hard words) but is filed under Grade 1, where books read like grade 2.0
- `social-studies/the-exhibit-between-two-classrooms` reads like grade 9.5 (sentences 16.7 words, 3% hard words) but is filed under Grade 2, where books read like grade 4.0
- `fiction/the-garden-gates-secret-song` reads like grade 5.5 (sentences 13.0 words, 12% hard words) but is filed under Grade 1, where books read like grade 2.0
- `cs/the-internet-connects-us` reads like grade 6.6 (sentences 10.8 words, 1% hard words) but is filed under Grade 1, where books read like grade 2.0
- `social-studies/the-rulebook-and-the-people` reads like grade 11.8 (sentences 13.3 words, 4% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/vedic-traditions-and-early-hinduism` reads like grade 12.6 (sentences 15.4 words, 12% hard words) but is filed under Grade 6, where books read like grade 7.4
- `social-studies/voices-from-the-canyon` reads like grade 10.9 (sentences 15.7 words, 6% hard words) but is filed under Grade 3, where books read like grade 6.0
- `social-studies/water-crosses-california` reads like grade 10.6 (sentences 14.4 words, 10% hard words) but is filed under Grade 4, where books read like grade 6.1
- `social-studies/who-had-a-voice-in-colonial-america` reads like grade 11.9 (sentences 13.3 words, 7% hard words) but is filed under Grade 5, where books read like grade 6.5
- `cs/working-together-on-code` reads like grade 10.9 (sentences 13.7 words, 12% hard words) but is filed under Grade 3, where books read like grade 6.0

### narration (44)

- `fiction/a-sandwich-for-the-scarecrow` page 1: a 3.0 s silence after word 13 ('beans.')
- `social-studies/a-state-shaped-by-water-and-stone` page 4: a 3.7 s silence after word 89 ('watersheds.')
- `fiction/a-window-for-the-sea` page 4: a 3.2 s silence after word 10 ('asked.')
- `social-studies/after-victory-what-changed` page 4: a 6.0 s silence after word 61 ('On')
- `fiction/basil-and-the-borrowed-roar` page 3 is read at 0.9 words a second (most pages are 2-3.5)
- `fiction/basil-and-the-borrowed-roar` page 3: a 3.4 s silence after word 4 ('breath.')
- `fiction/clap-it-across-the-market` page 4: a 3.2 s silence after word 7 ('To-ma-to.')
- `fiction/clap-it-across-the-market` page 6: a 3.4 s silence after word 6 ('Wa-ter-mel-on.')
- `math-stories/decimals-to-the-thousandths` page 6: a 4.6 s silence after word 2 ('matters.')
- `social-studies/exploring-and-mapping-a-growing-nation` page 4: a 3.2 s silence after word 50 ('U.S.')
- `fiction/grandmas-hands-remember` page 0: a 3.4 s silence after word 3 ('Remember')
- `cs/key-and-value-looking-things-up-by-name` page 5: a 3.1 s silence after word 8 ('scores["Ana"].')
- `social-studies/latitude-lines-california-places` page 7: a 7.8 s silence after word 46 ('of')
- `fiction/millie-and-the-shifting-wind` page 0: a 3.6 s silence after word 5 ('Wind')
- `math-stories/multi-digit-division-standard-algorithm` page 3: a 3.4 s silence after word 7 ('repeat.')
- `social-studies/native-california-is-here` page 4: a 4.3 s silence after word 69 ('navigation.')
- `fiction/nora-and-the-nighttime-knock` page 4: a 7.1 s silence after word 17 ('together.')
- `fiction/pip-and-the-rainy-day-machine` page 3: a 4.9 s silence after word 16 ('first.”')
- `math-stories/place-value-to-the-millions` page 1: a 3.4 s silence after word 9 ('3,204,516')
- `math-stories/place-value-to-the-millions` page 4: a 3.8 s silence after word 8 ('3,204,561.')
- `fiction/ravi-and-the-stubborn-kite` page 3: a 3.1 s silence after word 10 ('gusts.')
- `fiction/the-acorn-parliament` page 1: a 3.1 s silence after word 50 ('generations.')
- `fiction/the-backyard-bug-band` page 7: a 3.3 s silence after word 22 ('smiled.')
- `fiction/the-bookmobile-at-bluebird-hill` page 3: a 4.2 s silence after word 16 ('ideas,”')
- `sel/the-boundary-under-the-basketball-hoop` page 5: a 3.1 s silence after word 59 ('pattern.')
- `fiction/the-broomsticks-day-off` page 7: a 3.5 s silence after word 12 ('asked.')
- `math-stories/the-coordinate-plane` page 4: a 4.2 s silence after word 28 ('pairs:')
- `fiction/the-goat-and-the-grocery-list` page 7: a 3.2 s silence after word 21 ('smiled.')
- `fiction/the-goose-in-the-class-photo` page 0: a 4.5 s silence after word 6 ('Photo')
- `sel/the-help-signal` page 4: a 3.5 s silence after word 58 ('earlier,')
- `fiction/the-kite-above-glass-lake` page 7: a 5.6 s silence after word 53 ('conclusion.')
- `fiction/the-kite-that-would-not-race` page 6: a 3.1 s silence after word 16 ('swayed.')
- `fiction/the-library-of-lost-sounds` page 5: a 6.4 s silence after word 47 ('part.')
- `fiction/the-map-that-changed-at-midnight` page 7: a 3.2 s silence after word 65 ('a')
- `sel/the-message-saved-as-a-draft` page 7: a 3.1 s silence after word 35 ('reflection.')
- `fiction/the-missing-scene` page 5: a 3.4 s silence after word 28 ('eased.')
- `fiction/the-pancake-that-would-not-flip` page 7: a 3.1 s silence after word 19 ('"No,"')
- `fiction/the-path-of-silver-reeds` page 4: a 6.7 s silence after word 51 ('it.')
- `sel/the-recipe-card-with-an-empty-line` page 5: a 7.0 s silence after word 49 ('knowledge.')
- `social-studies/three-colonial-regions-many-lives` page 7: a 5.8 s silence after word 63 ('choices.')
- `social-studies/trade-networks-before-colonization` page 4: a 3.1 s silence after word 57 ('enough.')
- `fiction/two-plans-for-cedar-bridge` page 3: a 3.1 s silence after word 67 ('so.')
- `fiction/two-plans-for-cedar-bridge` page 4: a 5.0 s silence after word 77 ('supports.')
- `cs/version-control-tracking-changes-to-code` page 1: a 4.4 s silence after word 9 ('final_v2_REAL_use_this.py,')

### pages (5)

- `fiction/arias-little-lantern` the cover shows a line of text (11 words) that the cover narration does not read
- `social-studies/avas-market-morning` the cover shows a line of text (8 words) that the cover narration does not read
- `fiction/milos-busy-garden` the cover shows a line of text (11 words) that the cover narration does not read
- `social-studies/nicos-neighborhood-map` the cover shows a line of text (12 words) that the cover narration does not read
- `fiction/the-moonlight-puzzle` the cover shows a line of text (5 words) that the cover narration does not read

### quiz (197)

- `cs/a-computer-needs-power` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `social-studies/a-constitution-built-through-debate` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/a-forest-under-glass` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `fiction/a-new-look-for-niko` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `fiction/a-sweeping-plan-for-the-last-stone` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `social-studies/a-trip-around-town` the right answer is the longest choice in 80% of the questions: a child can guess by length
- `cs/abstraction-hide-the-details` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `social-studies/after-victory-what-changed` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/aiming-for-the-blue-cone` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `social-studies/ancient-hebrew-traditions-and-history` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/and-or-and-not` comprehension question 5 points to page 7, which does not exist
- `science/animal-life-cycles` the right answer is the longest choice in 83% of the questions: a child can guess by length
- `science/animal-senses-and-behavior` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/badger-and-the-long-way-home` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/balanced-and-unbalanced-forces` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/beep-breaks-it-down` the right answer is the longest choice in 90% of the questions: a child can guess by length
- `sel/before-we-share-the-photo` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/big-job-little-jobs` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/boolean-logic-and-or-not` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/break-a-job-into-steps` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/breaking-big-problems-into-small-steps` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/byte-meets-ai` the right answer is the longest choice in 80% of the questions: a child can guess by length
- `social-studies/california-through-depression-and-war` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/charts-that-tell-the-truth` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/climates-around-the-world` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/cloud-computing-someone-elses-computer` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/collecting-and-organizing-data` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/computers-are-all-around-us` the right answer is the longest choice in 80% of the questions: a child can guess by length
- `cs/computers-everywhere` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/computers-that-learn` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/copyright-and-creative-commons` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/counting-the-steps` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/data-privacy-what-happens-to-your-information` the right answer is the longest choice in 100% of the questions: a child can guess by length
- `cs/databases-and-queries` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `cs/databases-storing-and-organizing-information` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/diego-and-the-open-pass` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/distributed-systems-when-many-computers-work-together` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `math-stories/dot-plots-histograms-and-box-plots` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/earths-four-systems-interact` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/earths-place-in-the-solar-system` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `social-studies/ellen-ochoa-looking-closely-reaching-far` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/everyday-algorithms` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/fast-changes-slow-changes` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `social-studies/fifty-states-many-connections` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/find-the-bug-and-fix-it` the right answer is the longest choice in 80% of the questions: a child can guess by length
- `social-studies/four-governments-one-watershed` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `math-stories/fractions-on-a-number-line` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/functions-naming-a-set-of-steps` comprehension question 5 points to page 7, which does not exist
- `cs/functions-with-parameters` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/getting-ready-for-wild-weather` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/give-instructions-just-right` the right answer is the longest choice in 100% of the questions: a child can guess by length
- `social-studies/gold-changed-the-river` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `fiction/grandmas-hands-remember` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/habitats-meet-survival-needs` the right answer is the longest choice in 100% of the questions: a child can guess by length
- `science/heat-on-the-move` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/how-a-message-travels-the-internet` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `cs/how-recommendations-work` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/human-impact-on-climate` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `science/ideas-from-nature` the right answer is the longest choice in 80% of the questions: a child can guess by length
- `science/inherited-traits` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `cs/inside-a-computer` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `social-studies/jackie-robinson-beyond-the-ballpark` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/keeping-versions-of-your-work` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/kofi-and-the-blanket-balloon` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/lina-and-the-listening-parade` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `math-stories/line-plots-with-fractions` the right answer is the longest choice in 91% of the questions: a child can guess by length
- `science/living-things-compete-for-resources` the right answer is the longest choice in 100% of the questions: a child can guess by length
- `science/magnets-attract-and-repel` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `social-studies/many-roots-main-street` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/mapping-earths-features` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/mapping-land-and-water` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/millie-and-the-shifting-wind` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/milo-and-the-little-seed` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/minas-moving-day-window` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `science/mixtures-and-solutions` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `fiction/my-cardboard-box` the right answer is the longest choice in 80% of the questions: a child can guess by length
- `fiction/nell-and-the-backward-footprints` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/nested-conditionals-if-else-if-else` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `cs/neural-networks-layers-that-learn` the right answer is the longest choice in 82% of the questions: a child can guess by length
- `sel/not-every-friend-gets-every-secret` the right answer is the longest choice in 82% of the questions: a child can guess by length
- ... and more: all of them are in report.json

### text (10)

- `social-studies/athens-sparta-and-the-wars` page 2 says 'Sparta\nSparta' twice in a row
- `science/conservation-of-matter` page 0 says 'Matter Matter' twice in a row
- `math-stories/positive-and-negative-numbers` page 0 says 'Numbers Numbers' twice in a row
- `math-stories/prime-and-composite-numbers` page 0 says 'Numbers Numbers' twice in a row
- `science/stored-energy` page 0 says 'Energy Energy' twice in a row
- `fiction/the-cave-of-echoing-names` page 2 says 'Ben\nBen' twice in a row
- `fiction/the-lantern-parade-mix-up` page 1 says 'Nai Nai' twice in a row
- `fiction/the-lantern-parade-mix-up` page 4 says 'Nai Nai' twice in a row
- `fiction/the-museum-of-unfinished-inventions` page 1 says 'Rain\nRain' twice in a row
- `math-stories/volume-with-fractional-edge-lengths` page 5 says '1 1' twice in a row

## Notes

Notes are in report.json (656 of them); they are not listed here to keep this page short.
