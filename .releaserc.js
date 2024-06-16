module.exports = {
    extends: 'semantic-release-monorepo',
    branches: ['main'],
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/npm',
      '@semantic-release/github'
    ]
  }
