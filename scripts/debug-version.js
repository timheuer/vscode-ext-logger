#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Debug script to test version detection and git operations
 */

console.log('🔍 Debugging version and git setup...\n');

try {
  // Test nbgv version detection
  console.log('1. Testing nbgv version detection:');
  const versionOutput = execSync('npx nbgv get-version --format json', { encoding: 'utf8' });
  const versionInfo = JSON.parse(versionOutput);
  
  console.log('   Raw version info:', versionInfo);
  
  const version = versionInfo.SimpleVersion || versionInfo.NpmPackageVersion || versionInfo.MajorMinorVersion;
  console.log(`   Selected version: ${version}\n`);

  // Test git config
  console.log('2. Testing git configuration:');
  try {
    const gitUser = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const gitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    console.log(`   Git user: ${gitUser}`);
    console.log(`   Git email: ${gitEmail}`);
  } catch {
    console.log('   No git user configured');
  }

  // Check current tags
  console.log('\n3. Current tags in repository:');
  try {
    const tags = execSync('git tag -l', { encoding: 'utf8' });
    if (tags.trim()) {
      console.log('   Existing tags:');
      tags.trim().split('\n').forEach(tag => console.log(`   - ${tag}`));
    } else {
      console.log('   No tags found');
    }
  } catch (error) {
    console.log(`   Error listing tags: ${error.message}`);
  }

  // Check if target tag exists
  console.log(`\n4. Checking if tag v${version} exists:`);
  try {
    const tagOutput = execSync(`git tag -l v${version}`, { encoding: 'utf8' });
    if (tagOutput.trim()) {
      console.log(`   ✅ Tag v${version} already exists`);
    } else {
      console.log(`   🆕 Tag v${version} does not exist`);
    }
  } catch (error) {
    console.log(`   Error checking tag: ${error.message}`);
  }

  // Check remote configuration
  console.log('\n5. Remote configuration:');
  try {
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    console.log('   Remotes:');
    remotes.trim().split('\n').forEach(remote => console.log(`   ${remote}`));
  } catch (error) {
    console.log(`   Error checking remotes: ${error.message}`);
  }

  // Check git status
  console.log('\n6. Git status:');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('   Uncommitted changes:');
      status.trim().split('\n').forEach(line => console.log(`   ${line}`));
    } else {
      console.log('   Working directory clean');
    }
  } catch (error) {
    console.log(`   Error checking status: ${error.message}`);
  }

} catch (error) {
  console.error('❌ Error during debugging:', error.message);
}
