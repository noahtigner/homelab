#!/usr/bin/env sh

# Colors
C_INFO='\033[0;34m'
C_OK='\033[0;32m'
C_ERROR='\033[0;31m'
C_WARN='\033[0;33m'
C_CLEAR='\033[0m' # No Color

# get current branch name and validate with this regex
branch=$(git branch --show-current --no-color)
pattern="^(master|main|develop){1}$|^(feature|fix|hotfix|release)/.+$"

echo "Branch name: \"${branch}\""
echo "Pattern: \"${pattern}\""

# validate with git check-ref-format --branch <branchname>
output=$(git check-ref-format --branch ${branch} 2>&1)
if [[ ! $? -eq 0 ]]; then
    echo "${C_ERROR}${output}${C_CLEAR}"
    exit 1
fi

if [[ ! ${branch} =~ ${pattern} ]]; then
    echo "${C_ERROR}Branch name is invalid${C_CLEAR}"
    exit 1
fi

echo "${C_OK}Branch name is valid${C_CLEAR}"
exit 0
