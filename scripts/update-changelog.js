#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Updates CHANGELOG.md after a successful publish
 * - Moves [Unreleased] section to the published version
 * - Updates the date to today's date
 * - Creates a new [Unreleased] section
 * - Handles CI environments properly
 */

function isCI() {
  return !!(
    process.env.CI || // Generic CI
    process.env.GITHUB_ACTIONS || // GitHub Actions
    process.env.TRAVIS || // Travis CI
    process.env.CIRCLECI || // CircleCI
    process.env.AZURE_PIPELINES || // Azure Pipelines
    process.env.JENKINS_URL // Jenkins
  );
}

function setupGitIdentity() {
  try {
    // Check if git user is already configured
    execSync('git config user.name', { encoding: 'utf8', stdio: 'pipe' });
    execSync('git config user.email', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    // No git identity configured, set up CI identity
    if (isCI()) {
      console.log('🔧 Setting up Git identity for CI environment...');
      execSync('git config user.name "github-actions[bot]"', { stdio: 'pipe' });
      execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'pipe' });
      return true;
    } else {
      console.log('⚠️ No Git identity configured. Skipping commit.');
      return false;
    }
  }
}

function updateChangelog() {
  try {
    // Get the current version from nbgv
    const nbgvOutput = execSync('nbgv get-version --format json', { encoding: 'utf8' });
    const versionInfo = JSON.parse(nbgvOutput);
    const version = versionInfo.SimpleVersion || versionInfo.MajorMinorVersion;
    
    console.log(`Updating changelog for version ${version}`);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Read the current changelog
    const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    const changelog = fs.readFileSync(changelogPath, 'utf8');

    // Replace [Unreleased] with the actual version and date
    const updatedChangelog = changelog.replace(
      /## \[Unreleased\]/,
      `## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [${version}] - ${today}`
    );

    // Write the updated changelog back
    fs.writeFileSync(changelogPath, updatedChangelog);

    console.log(`✅ Changelog updated: [Unreleased] → [${version}] - ${today}`);

    // Try to commit the changelog update
    const canCommit = setupGitIdentity();
    if (canCommit) {
      try {
        execSync('git add CHANGELOG.md', { stdio: 'inherit' });
        execSync(`git commit -m "docs: update changelog for v${version}"`, { stdio: 'inherit' });
        console.log('✅ Changelog changes committed');
      } catch (commitError) {
        console.log('⚠️ Could not commit changelog changes:', commitError.message);
        console.log('📝 Changelog file has been updated but not committed');
      }
    } else {
      console.log('📝 Changelog file updated successfully (commit skipped)');
    }

  } catch (error) {
    console.error('❌ Error updating changelog:', error.message);
    process.exit(1);
  }
}

updateChangelog();
