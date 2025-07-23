const gulp = require('gulp');
const { execSync } = require('child_process');

// Task to set package version from nbgv
gulp.task('setversion', async function() {
  const nbgv = require('nerdbank-gitversioning');
  
  try {
    // Use the built-in setPackageVersion method
    await nbgv.setPackageVersion();
    console.log('Package version updated from nbgv');
  } catch (error) {
    console.error('Error setting version:', error.message);
    throw error;
  }
});

// Task to build the project
gulp.task('build', gulp.series('setversion', function(done) {
  try {
    execSync('npx tsup', { stdio: 'inherit' });
    done();
  } catch (error) {
    done(error);
  }
}));

// Task to run tests
gulp.task('test', function(done) {
  try {
    execSync('npm test', { stdio: 'inherit' });
    done();
  } catch (error) {
    done(error);
  }
});

// Task to run linting
gulp.task('lint', function(done) {
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    done();
  } catch (error) {
    done(error);
  }
});

// Pre-build tasks
gulp.task('prebuild', gulp.series('lint', 'test'));

// Full build with validation
gulp.task('build:full', gulp.series('prebuild', 'build'));

// Default task
gulp.task('default', gulp.series('build'));

// Clean task
gulp.task('clean', function(done) {
  try {
    execSync('npm run clean', { stdio: 'inherit' });
    done();
  } catch (error) {
    done(error);
  }
});

// Watch task
gulp.task('watch', function() {
  return gulp.watch(['src/**/*.ts', 'test/**/*.ts'], gulp.series('setversion', 'test'));
});

// Task to tag release with nbgv
gulp.task('tag-release', function(done) {
  try {
    // Get the current version from nbgv
    const nbgv = require('nerdbank-gitversioning');
    
    // Create a tag with the current version
    execSync('nbgv tag', { stdio: 'inherit' });
    console.log('Release tagged successfully');
    
    // Push the tag to origin
    execSync('git push origin --tags', { stdio: 'inherit' });
    console.log('Tags pushed to origin');
    
    done();
  } catch (error) {
    console.error('Error tagging release:', error.message);
    done(error);
  }
});

// Task to publish and tag
gulp.task('publish-and-tag', gulp.series('build:full', function(done) {
  try {
    // Publish to npm
    execSync('npm publish', { stdio: 'inherit' });
    console.log('Package published successfully');
    done();
  } catch (error) {
    done(error);
  }
}));

module.exports = gulp;
