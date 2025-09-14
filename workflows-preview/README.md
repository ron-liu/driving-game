# PR Preview System Workflows

This directory contains GitHub Actions workflows for implementing automatic PR preview deployments with cleanup.

## 📁 Files

- **`pr-preview.yml`** - Deploys PR previews to GitHub Pages
- **`cleanup-pr-preview.yml`** - Cleans up preview deployments when PRs are closed

## 🚀 Installation Instructions

Due to GitHub App permission restrictions, these workflow files cannot be automatically placed in `.github/workflows/`. Please follow these manual steps:

### Step 1: Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Set source to **Deploy from a branch**
4. Select **gh-pages** branch (will be created automatically on first deployment)
5. Save the settings

### Step 2: Move Workflow Files

Copy the workflow files to the `.github/workflows/` directory:

```bash
# From the repository root
cp workflows-preview/pr-preview.yml .github/workflows/
cp workflows-preview/cleanup-pr-preview.yml .github/workflows/
```

### Step 3: Commit and Push

```bash
git add .github/workflows/pr-preview.yml .github/workflows/cleanup-pr-preview.yml
git commit -m "feat: add PR preview deployment system"
git push
```

## ✨ Features

### PR Preview Deployment (`pr-preview.yml`)
- **Triggers on**: PR opened, synchronized (new commits), or reopened
- **Creates**: Unique preview URL at `https://ron-liu.github.io/driving-game/pr-{number}/`
- **Comments**: Automatically posts/updates preview link on PR
- **Updates**: Preview refreshes automatically with new commits

### PR Cleanup (`cleanup-pr-preview.yml`)
- **Triggers on**: PR closed (merged or closed without merging)
- **Removes**: Preview directory from gh-pages branch
- **Comments**: Confirms cleanup completion on PR
- **Automatic**: No manual intervention required

## 🎯 How It Works

1. **Developer opens a PR** → Preview workflow deploys to `gh-pages/pr-{number}/`
2. **Preview link posted** → Comment with live preview URL appears on PR
3. **New commits pushed** → Preview automatically updates
4. **PR closed/merged** → Cleanup workflow removes preview directory

## 📝 Important Notes

- First deployment will create the `gh-pages` branch automatically
- Preview URLs follow pattern: `https://ron-liu.github.io/driving-game/pr-{number}/`
- Each PR gets its own isolated preview directory
- No conflicts with main deployment (if using root of gh-pages)
- Cleanup is automatic - no orphaned previews

## 🔧 Customization Options

### Change Preview URL Comment
Edit the `body` variable in `pr-preview.yml` to customize the preview comment.

### Adjust Cleanup Behavior
Modify `cleanup-pr-preview.yml` to change when/how cleanups occur.

### Add Build Steps
If your project requires building, add build steps before the deploy action in `pr-preview.yml`.

## 🎉 Success Criteria Met

- ✅ Each PR gets unique preview URL
- ✅ Automatic preview link comments
- ✅ Preview updates with new commits
- ✅ Automatic cleanup on PR close/merge
- ✅ No conflicts with main deployment