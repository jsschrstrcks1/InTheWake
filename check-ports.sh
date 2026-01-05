#!/bin/bash
for f in ports/*.html; do
  result=$(node admin/validate-port-page-v2.js "$f" 2>&1 | grep "Score:" | head -1 | sed 's/\x1b\[[0-9;]*m//g')
  if ! echo "$result" | grep -q "100/100"; then
    echo "$(basename "$f"): $result"
  fi
done
