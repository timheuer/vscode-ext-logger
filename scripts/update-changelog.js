#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Updates CHANGELOG.md after a successful publish
 * - Moves [Unreleased] section to the published version
 * - Updates the date to today's date
 * - Creates a new [Unreleased] section
 */

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

    // Stage and commit the changelog update
    execSync('git add CHANGELOG.md', { stdio: 'inherit' });
    execSync(`git commit -m "docs: update changelog for v${version}"`, { stdio: 'inherit' });
    
    console.log('✅ Changelog changes committed');

  } catch (error) {
    console.error('❌ Error updating changelog:', error.message);
    process.exit(1);
  }
}

updateChangelog();
