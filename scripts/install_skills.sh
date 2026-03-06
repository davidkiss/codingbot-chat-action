#!/bin/bash

set -e

SKILLS="$1"

if [ -z "$SKILLS" ]; then
  echo "No skills specified, skipping."
  exit 0
fi

IFS=';' read -ra PACKAGE_SPECS <<< "$SKILLS"

for spec in "${PACKAGE_SPECS[@]}"; do
  [ -z "$spec" ] && continue
  
  IFS=':' read -ra PARTS <<< "$spec"
  package="${PARTS[0]}"
  skills_list="${PARTS[1]:-}"
  
  if [ -z "$skills_list" ] || [ "$skills_list" = "*" ]; then
    echo "Installing all skills from $package"
    npx skills add "$package" -a opencode -g --skill '*' --yes || echo "Warning: Failed to install skills from $package"
  else
    IFS=',' read -ra SKILLS <<< "$skills_list"
    skill_flags=""
    for skill in "${SKILLS[@]}"; do
      skill_flags="$skill_flags --skill $skill"
    done
    echo "Installing skills from $package: $skills_list"
    npx skills add "$package" -a opencode -g $skill_flags --yes || echo "Warning: Failed to install skills from $package"
  fi
done
