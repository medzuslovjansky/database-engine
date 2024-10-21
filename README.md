# Interslavic CLI Toolkit

[![CI/CD](https://github.com/medzuslovjansky/database-engine/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/medzuslovjansky/database-engine/actions/workflows/ci-cd.yml)
[![npm version](https://badge.fury.io/js/%40interslavic%2Fcli.svg)](https://badge.fury.io/js/%40interslavic%2Fcli)
[![License: GNU GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

The Interslavic CLI Toolkit is a command-line interface tool designed to synchronize the Interslavic language database between Google Sheets and a Git+XML repository. It provides various commands for managing synsets and performing operations on Google Spreadsheets.

## Installation

```bash
npm install -g @interslavic/cli
```

or

```bash
yarn global add @interslavic/cli
```

## Usage

```bash
isv [command] [options]
```

### Available Commands:

- `synsets`: Execute operations on synsets
- `spreadsheets`: Execute operations on Google Spreadsheets
- `users`: Edit the configuration file

For more detailed information on each command, use the `--help` option:

```bash
isv --help
isv synsets --help
isv spreadsheets --help
isv users --help
```

## Development

This project uses Yarn workspaces and requires Node.js version 20.18.0 or higher.

To set up the development environment:

1. Clone the repository
2. Run `yarn install`
3. Build the project with `yarn build`

### Scripts

- `yarn build`: Build the project
- `yarn start`: Run the CLI
- `yarn lint`: Run linter on all workspaces
- `yarn test`: Run tests on all workspaces

## Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests or issues.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
