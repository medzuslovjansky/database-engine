# @interslavic/razumlivost

[![npm version](https://badge.fury.io/js/%40interslavic%2Frazumlivost.svg)](https://badge.fury.io/js/%40interslavic%2Frazumlivost)
[![Build Status](https://github.com/medzuslovjansky/razumlivost/actions/workflows/ci.yml/badge.svg)](https://github.com/medzuslovjansky/razumlivost/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/medzuslovjansky/razumlivost/badge.svg?branch=main)](https://coveralls.io/github/medzuslovjansky/razumlivost?branch=main)

Utilities to flavorize dictionary entries and calculate a smarter distance between languages.


To install in your project, use:

```
npm install @interslavic/razumlivost --save
```

### Flavorization rules

At the moment, rules are stored in CSV files under [\_\_fixture\_\_/rules](../__fixtures__/rules) directory.

To calculate written intelligibility between Interslavic words and words from
another Slavic language, this repository relies on the following algorithm:

1. Every Interslavic entry gets processed in three separate ways:
   1. **Etymological.** The entry goes through the replacement rules,
   that have `E` letter in their respective `flavorizationLevel` column.
   2. **Standard.** Only rules with `S` letter in the `flavorizationLevel` column
   will be applied for the transformation.
   3. **Mistaken.** Same as above, but for `M` letter.
2. The translation variants undergo all transformations with `R` (i.e., `Reverse`)
letter defined in their flavorization level column.

In the end, there will be multiple variants to compare, e.g.:

```
Interslavic word: jęčmenny
Russian translation: ячменный (jačmennyj)

Mistaken reading (distance = 6):
jęčmenny -> jecmenny -> джецменну (džecmennu)

Standard reading (distance = 2):
jęčmenny -> ječmenny -> йечменны -> ечменны

Etymological reading (distance = 0):
jęčmenny (adj.) -> jačmenny -> jačmennyj -> йачменный -> ячменный
```

The algorithm uses Levenshtein's editing distance to tell how close
the Interslavic word and its translation are. If the base letters are the
same except for diacrictics, the editing distance is considered to be
`0.5` characters instead of 1.
