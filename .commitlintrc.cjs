module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',      // New feature
      'fix',       // Bug fix
      'refactor',  // Code change, no behavior change
      'perf',      // Performance improvement
      'test',      // Adding tests
      'docs',      // Documentation only
      'chore',     // Build/tooling changes
      'security',  // Security fixes
      'ci',        // CI/CD changes
      'revert'     // Revert previous commit
    ]],
    'scope-enum': [1, 'always', [
      'search',
      'chunking',
      'embeddings',
      'api',
      'ui',
      'calc',
      'engine',
      'test',
      'docs',
      'deps',
      'release'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100]
  }
};
