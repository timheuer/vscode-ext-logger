#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Comprehensive release script that:
 * 1. Builds the project
 * 2. Publishes to npm
 * 3. Updates changelog with version and date
 * 4. Tags the release
 * 5. Pushes everything to git
 */

async function release() {
  try {
    console.log('🚀 Starting release process...');

    // 1. Build the project
    console.log('📦 Building project...');
    execSync('npm run build:full', { stdio: 'inherit' });

    // 2. Publish to npm
    console.log('📤 Publishing to npm...');
    execSync('npm publish', { stdio: 'inherit' });

    // 3. Update changelog
    console.log('📝 Updating changelog...');
    execSync('node scripts/update-changelog.js', { stdio: 'inherit' });

    // 4. Tag the release
    console.log('🏷️  Tagging release...');
    execSync('nbgv tag', { stdio: 'inherit' });

    // 5. Push everything
    console.log('⬆️  Pushing to git...');
    execSync('git push origin main --follow-tags', { stdio: 'inherit' });

    console.log('✅ Release completed successfully!');

  } catch (error) {
    console.error('❌ Release failed:', error.message);
    process.exit(1);
  }
}

release();
