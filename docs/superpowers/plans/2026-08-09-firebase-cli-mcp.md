# Firebase CLI and MCP Connection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Firebase Tools, authenticate it against `javacrafts-6d675`, and register the official Firebase MCP server with Codex for this repository.

**Architecture:** Firebase Tools is installed globally for direct terminal use, while Codex launches the official MCP server through `npx` to stay current. The MCP process is pinned to this repository and limited to Auth, Firestore, and Storage feature groups; it reuses Firebase CLI user credentials and does not consume application secrets.

**Tech Stack:** Node.js, npm, `firebase-tools`, Firebase MCP server, Codex CLI

## Global Constraints

- Preserve the existing Firebase project binding `javacrafts-6d675`.
- Do not modify application source, Firebase rules, or `.env` values.
- Do not copy service-account credentials or Firebase web configuration into MCP settings.
- Use a user-writable npm prefix if global installation permissions fail; do not use `sudo`.
- Register the MCP server only for Auth, Firestore, and Storage optional feature groups.

---

## File Structure

- Modify outside repository: the user's npm global package directory, managed by `npm install --global firebase-tools`.
- Modify outside repository: Codex's MCP configuration, managed by `codex mcp add` rather than direct file editing.
- Preserve: `.firebaserc`, `firebase.json`, `.env`, `firestore.rules`, and `storage.rules`.

### Task 1: Install and Authenticate Firebase Tools

**Files:**
- Modify: npm global package installation directory
- Preserve: `.firebaserc`

**Interfaces:**
- Consumes: Node.js and npm already installed on the workstation
- Produces: a working `firebase` executable with user credentials able to access `javacrafts-6d675`

- [ ] **Step 1: Capture the clean repository state**

Run:

```bash
git status --short
```

Expected: no changes other than this plan if it has not yet been committed.

- [ ] **Step 2: Install the current Firebase CLI globally**

Run:

```bash
npm install --global firebase-tools@latest
```

Expected: command exits successfully and installs `firebase-tools` beneath the configured user-writable npm prefix.

- [ ] **Step 3: Verify the CLI executable**

Run:

```bash
firebase --version
```

Expected: prints a semantic version and exits successfully.

- [ ] **Step 4: Inspect the current authentication state**

Run:

```bash
firebase login:list
```

Expected: prints one or more logged-in accounts, or reports that no accounts are logged in.

- [ ] **Step 5: Authenticate only if no usable account exists**

Run:

```bash
firebase login
```

Expected: the browser opens Google's authorization flow; after user approval, the terminal reports a successful login. Skip this command when Step 4 already shows a usable account.

- [ ] **Step 6: Verify project access and repository binding**

Run:

```bash
firebase projects:list
firebase use
```

Expected: `firebase projects:list` contains `javacrafts-6d675`, and `firebase use` reports `javacrafts-6d675` as the active project. If access is absent, stop without changing `.firebaserc`.

### Task 2: Register and Verify the Firebase MCP Server

**Files:**
- Modify: Codex MCP configuration through the Codex CLI
- Preserve: all repository application and Firebase configuration files

**Interfaces:**
- Consumes: authenticated Firebase CLI credentials and repository path `/Users/jestherjordanminor/Documents/Projects/Personal/JavaCrafts/javacrafts-website`
- Produces: an enabled Codex MCP entry named `firebase`

- [ ] **Step 1: Confirm that no conflicting MCP entry exists**

Run:

```bash
codex mcp get firebase
```

Expected: reports that `firebase` is not configured. If it exists with different arguments, inspect it and stop before replacing it.

- [ ] **Step 2: Register the official Firebase MCP server**

Run:

```bash
codex mcp add firebase -- npx -y firebase-tools@latest mcp --dir "/Users/jestherjordanminor/Documents/Projects/Personal/JavaCrafts/javacrafts-website" --only auth,firestore,storage
```

Expected: Codex reports that the `firebase` MCP server was added.

- [ ] **Step 3: Verify the registered command and enabled state**

Run:

```bash
codex mcp get firebase
codex mcp list
```

Expected: `firebase` is enabled and uses `npx -y firebase-tools@latest mcp`, the absolute repository directory, and `auth,firestore,storage`.

- [ ] **Step 4: Confirm repository files were preserved**

Run:

```bash
git status --short
git diff -- .firebaserc firebase.json .env firestore.rules storage.rules
```

Expected: no changes to the listed Firebase/application configuration files.

- [ ] **Step 5: Refresh Codex tool discovery**

Action: start a new Codex conversation for this repository.

Expected: the next session can discover the Firebase MCP tools. The current conversation cannot dynamically add a newly configured MCP server to its existing tool inventory.
