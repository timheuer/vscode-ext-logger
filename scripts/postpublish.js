#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * CI-aware postpublish script
 * - In CI: Only updates changelog file (no git operations)
 * - Locally: Does full changelog update and tagging
 */

function isCI() {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.TRAVIS ||
    process.env.CIRCLECI ||
    process.env.AZURE_PIPELINES ||
    process.env.JENKINS_URL
  );
}

function postPublish() {
  console.log('📦 Post-publish tasks starting...');

  if (isCI()) {
    console.log('🤖 Running in CI environment - updating changelog and tagging');
    
    // Configure git for CI
    try {
      execSync('git config user.name "github-actions[bot]"', { stdio: 'pipe' });
      execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'pipe' });
      
      // Get the version info from nbgv
      const versionOutput = execSync('npx nbgv get-version --format json', { encoding: 'utf8' });
      const versionInfo = JSON.parse(versionOutput);
      
      // Use SimpleVersion for tagging (this includes patch version: 0.1.5)
      // MajorMinorVersion only gives us 0.1, but we want the full version
      const version = versionInfo.SimpleVersion || versionInfo.NpmPackageVersion || versionInfo.MajorMinorVersion;
      console.log(`📋 Working with published version: v${version}`);
      console.log(`🔍 Version info:`, {
        SimpleVersion: versionInfo.SimpleVersion,
        NpmPackageVersion: versionInfo.NpmPackageVersion,
        MajorMinorVersion: versionInfo.MajorMinorVersion,
        Version: versionInfo.Version
      });
      
      // Check if tag already exists
      try {
        execSync(`git tag -l v${version}`, { stdio: 'pipe' });
        console.log(`⚠️  Tag v${version} already exists, skipping tag creation`);
      } catch {
        // Tag doesn't exist, create it
        console.log(`🏷️  Creating tag v${version}...`);
        execSync(`git tag v${version}`, { stdio: 'inherit' });
        console.log(`✅ Created tag v${version}`);
      }
      
      // Now update changelog
      console.log(`📝 Updating changelog...`);
      execSync('npm run update-changelog-only', { stdio: 'inherit' });
      
      // Check if there are changes to commit
      try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
          console.log(`📋 Changes detected, committing...`);
          // Stage and commit changelog
          execSync('git add CHANGELOG.md', { stdio: 'inherit' });
          execSync(`git commit -m "docs: update changelog for v${version}"`, { stdio: 'inherit' });
          console.log(`✅ Committed changelog changes`);
        } else {
          console.log(`ℹ️  No changelog changes to commit`);
        }
      } catch (commitError) {
        console.log(`⚠️  Could not commit changes: ${commitError.message}`);
      }
      
      // Push everything (tags and commits)
      console.log(`⬆️  Pushing to repository...`);
      execSync('git push origin main --follow-tags', { stdio: 'inherit' });
      
      console.log(`✅ Changelog updated, tagged v${version}, and pushed to repository`);
    } catch (error) {
      console.error('❌ Error in CI git operations:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  } else {
    console.log('💻 Running locally - performing full changelog update and tagging');
    // Locally, do the full process
    execSync('npm run update-changelog', { stdio: 'inherit' });
    execSync('npm run tag-release', { stdio: 'inherit' });
  }

  console.log('✅ Post-publish tasks completed');
}

postPublish();
