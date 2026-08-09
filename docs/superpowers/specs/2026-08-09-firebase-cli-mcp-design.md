# Firebase CLI and MCP Connection Design

## Goal

Connect Codex to the existing Firebase project for this repository through Firebase's official MCP server. Preserve the application's existing Firebase SDK configuration and project binding.

## Existing State

- The repository is already bound to Firebase project `javacrafts-6d675` through `.firebaserc`.
- `firebase.json` already configures Firestore and Cloud Storage rules.
- Firebase Web and Admin SDKs are installed and configured separately from the CLI.
- The Firebase CLI is not currently available as a global `firebase` command.
- Codex does not currently list a Firebase MCP server.

## Chosen Approach

1. Install the current `firebase-tools` package globally with npm so normal Firebase CLI commands are available.
2. Authenticate the Firebase CLI with the user's Google account using Firebase's supported interactive login flow.
3. Confirm that the authenticated account can access `javacrafts-6d675` and that the repository resolves to that project.
4. Register an MCP server named `firebase` in Codex. Run the official server through `npx -y firebase-tools@latest mcp` so MCP startup uses the current Firebase implementation.
5. Pin the MCP working directory with `--dir` to this repository and limit optional feature groups with `--only auth,firestore,storage`. Core Firebase MCP tools remain available.
6. Verify the global CLI version, active Firebase project, and Codex MCP registration. A new Codex session will be required before the newly registered MCP tools can appear in the model's tool inventory.

## Authentication and Security

- The Firebase MCP server uses the same user credentials as the Firebase CLI.
- No service-account private key, Firebase web configuration, or application `.env` value will be copied into MCP configuration.
- Login occurs through Firebase's interactive authorization flow. If browser interaction is required, the user completes the Google authorization step.
- MCP access is intentionally limited to this repository's Firebase context and the Auth, Firestore, and Storage feature groups.

## Failure Handling

- If global npm installation fails because of prefix permissions, use a user-writable npm prefix rather than `sudo`.
- If Firebase authentication is absent or expired, run `firebase login` and wait for the browser authorization result.
- If the authenticated account cannot access `javacrafts-6d675`, stop without changing the repository's project binding.
- If MCP registration succeeds but tools are unavailable in the current conversation, verify with `codex mcp list` and start a new Codex session.

## Verification

The setup is complete only when:

- `firebase --version` succeeds.
- `firebase projects:list` includes `javacrafts-6d675`.
- `firebase use` resolves this repository to `javacrafts-6d675`.
- `codex mcp list` shows an enabled Firebase server with the expected command, directory, and feature limits.
- No application source, Firebase rules, or secret environment values were modified.
