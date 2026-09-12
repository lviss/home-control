# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Layout

Four independently deployable Node services, each with its own `package.json`/`config.js`: root (`index.js`, the Express/socket.io backend, packaged as `web` and served together with the Angular frontend under `web/`), `scheduler`, `hold_press_handler`, `onkyo_control`. `notify_me` and `logger` exist on disk but are dead/commented out in `docker-compose.yml` - do not resurrect them without checking they're actually wired up somewhere.

## Nix packaging (`flake.nix`)

`nix build .#web`, `.#scheduler`, `.#hold_press_handler`, `.#onkyo_control` build each service via `buildNpmPackage` under `nodejs_22` (Node 14, the app's original target, is EOL and gone from nixpkgs). Each sub-service's `package-lock.json` is generated (not hand-written) - regenerate with `nix shell nixpkgs#nodejs_22 -c npm install --package-lock-only` in that sub-service's directory if `package.json` changes, then refresh the corresponding `npmDepsHash` in `flake.nix` (get it with `nix run nixpkgs#prefetch-npm-deps -- <path>/package-lock.json`).

The Angular 8.2 frontend (`web/`) needs three fixes to build under modern Node/OpenSSL - all baked into `flake.nix`'s `webFrontend` derivation, don't drop them:
1. `npm install --legacy-peer-deps` - a floating `ngx-socket-io` range now resolves to a version whose peer deps need Angular 12+.
2. `NODE_OPTIONS=--openssl-legacy-provider` for the build - webpack 4 under OpenSSL 3.
3. No `--source-map` flag (unlike the original `Dockerfile`) - webpack's build-optimizer's source-map handling breaks under modern Node, and it's a dev nicety, not needed for a production build.

When verifying `web`, always check `result/lib/web/public/` actually contains hashed JS/CSS chunks - a zero exit code alone doesn't prove the Angular build produced a real bundle.

## Secrets and PII hygiene

`config.js` (root) reads `GOOGLE_CLIENT_SECRET` and `JWT_SECRET` from the environment rather than storing them in the file; in production NixOS populates these from an agenix-managed secret (wired up in the separate `laneos` repo). `google_auth.clientID` and `allowed_user_ids` are not secret and stay as plain config.

This repo's committed configs (root `config.js`, `notify_me/config.js`, `onkyo_control/config.js`, `scheduler/config.js`, `hold_press_handler/config.js`, `docker-compose.yml`, `web/src/environments/environment.prod.ts`) intentionally use placeholder LAN IPs (`192.168.1.100`), hostnames (`example.com`), and generic user IDs/names instead of the real production values - preserve that pattern when reconciling from a real deployment copy; don't paste real infra details or personal identifiers into this repo.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
