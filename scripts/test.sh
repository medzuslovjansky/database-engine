#!/usr/bin/env bash

jest
find __e2e__ -name "*.test.js" -exec node "{}" \;


