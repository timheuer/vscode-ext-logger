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
      
      // Use the actual version that was published (MajorMinorVersion or SimpleVersion)
      const version = versionInfo.MajorMinorVersion || versionInfo.SimpleVersion || versionInfo.Version;
      console.log(`📋 Working with published version: v${version}`);
      console.log(`🔍 Version info:`, {
        SimpleVersion: versionInfo.SimpleVersion,
        MajorMinorVersion: versionInfo.MajorMinorVersion,
        Version: versionInfo.Version
      });
      
      // Create the tag FIRST with the current version (before changelog commit)
      execSync(`git tag v${version}`, { stdio: 'inherit' });
      console.log(`🏷️  Created tag v${version}`);
      
      // Now update changelog
      execSync('npm run update-changelog-only', { stdio: 'inherit' });
      
      // Stage and commit changelog
      execSync('git add CHANGELOG.md', { stdio: 'inherit' });
      execSync(`git commit -m "docs: update changelog for v${version}"`, { stdio: 'inherit' });
      
      // Push everything
      execSync('git push origin main --follow-tags', { stdio: 'inherit' });
      
      console.log(`✅ Changelog updated, tagged v${version}, and pushed to repository`);
    } catch (error) {
      console.error('❌ Error in CI git operations:', error.message);
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
