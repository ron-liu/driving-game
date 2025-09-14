#!/bin/bash

# SuperClaude Task Trigger Script
# Usage: ./scripts/superclaude-task.sh "Add dark mode toggle to settings page"

if [ -z "$1" ]; then
    echo "Usage: $0 \"<task description>\""
    echo "Example: $0 \"Add user authentication with JWT tokens\""
    exit 1
fi

TASK_DESCRIPTION="$1"
PRIORITY="${2:-medium}"

echo "🚀 Triggering SuperClaude for task: $TASK_DESCRIPTION"
echo "📊 Priority: $PRIORITY"

# Trigger GitHub Actions workflow
gh workflow run superclaude-task-handler.yml \
    --field task_description="$TASK_DESCRIPTION" \
    --field priority="$PRIORITY"

echo "✅ SuperClaude task triggered!"
echo "📝 SuperClaude will:"
echo "   1. Analyze your request"
echo "   2. Create GitHub issue(s)"
echo "   3. Implement the solution"
echo "   4. Create pull request"
echo ""
echo "🔗 Monitor progress at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"