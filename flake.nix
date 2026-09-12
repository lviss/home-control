{
  description = "home-control: MQTT-based home automation services (web, scheduler, hold_press_handler, onkyo_control)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_22;

        # A plain node/mqtt service with no build step: install deps, wrap `node index.js`.
        mkNodeService = { pname, src, npmDepsHash }:
          pkgs.buildNpmPackage {
            inherit pname src npmDepsHash nodejs;
            version = "1.0.0";
            dontNpmBuild = true;
            nativeBuildInputs = [ pkgs.makeWrapper ];
            installPhase = ''
              runHook preInstall
              mkdir -p $out/lib/${pname}
              cp -r . $out/lib/${pname}
              mkdir -p $out/bin
              makeWrapper ${nodejs}/bin/node $out/bin/${pname} \
                --run "cd $out/lib/${pname}" \
                --add-flags "$out/lib/${pname}/index.js"
              runHook postInstall
            '';
          };

        scheduler = mkNodeService {
          pname = "scheduler";
          src = ./scheduler;
          npmDepsHash = "sha256-PIBugzw3VYYMUeVJ9broUBFy9Tv/M8V63xy35hEMBXg=";
        };

        hold_press_handler = mkNodeService {
          pname = "hold_press_handler";
          src = ./hold_press_handler;
          npmDepsHash = "sha256-D/mxzM4JMXoS0ALU5kz4wmOEmyRkys4E69ExaCqomYs=";
        };

        onkyo_control = mkNodeService {
          pname = "onkyo_control";
          src = ./onkyo_control;
          npmDepsHash = "sha256-sZmvcxmpISLD8e3qPbTbm6yTwSHUt6LscxOTS5KK1oM=";
        };

        # The Angular 8 frontend, built into a static `public/`-style bundle.
        # Recipe proven by a prior investigation for building this app under nodejs_22
        # (Node 14, the app's original target, is EOL and gone from nixpkgs):
        #  - `npm install --legacy-peer-deps`: a floating ngx-socket-io dependency now
        #    resolves to a version whose peer deps need Angular 12+; the original
        #    package.json was written against npm 6's looser peer-dep enforcement.
        #  - `NODE_OPTIONS=--openssl-legacy-provider`: standard fix for webpack 4 under
        #    OpenSSL 3.
        #  - no `--source-map` flag (unlike the original Dockerfile): webpack's bundled
        #    build-optimizer's source-map handling breaks under modern Node; source maps
        #    are a dev nicety, not needed for a production build.
        webFrontend = pkgs.buildNpmPackage {
          pname = "home-control-web-frontend";
          version = "1.0.0";
          src = ./web;
          inherit nodejs;
          npmDepsHash = "sha256-2ZwN6JO1DjMqRJZCRcTXAVSC9ADiFzH32kXZ5EtCr9Q=";
          npmFlags = [ "--legacy-peer-deps" ];
          env.NODE_OPTIONS = "--openssl-legacy-provider";
          buildPhase = ''
            runHook preBuild
            npm run ng build -- --prod --output-path=dist
            runHook postBuild
          '';
          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist/. $out/
            runHook postInstall
          '';
        };

        # node_modules for the root Express/socket.io backend that serves the web UI.
        webBackendDeps = pkgs.buildNpmPackage {
          pname = "home-control-web-backend-deps";
          version = "1.0.0";
          src = ./.;
          inherit nodejs;
          npmDepsHash = "sha256-BWbKKx+kf9tUFy5bph64rQBD5bFrH3gOG4LUPbpTq+s=";
          dontNpmBuild = true;
          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r node_modules $out/
            runHook postInstall
          '';
        };

        # Combines the Express backend with the built Angular frontend (served from
        # ./public, matching the layout the original Dockerfile produced).
        web = pkgs.stdenv.mkDerivation {
          pname = "home-control-web";
          version = "1.0.0";
          dontUnpack = true;
          nativeBuildInputs = [ pkgs.makeWrapper ];
          installPhase = ''
            runHook preInstall
            mkdir -p $out/lib/web
            cp -r ${webBackendDeps}/node_modules $out/lib/web/node_modules
            cp ${./index.js} $out/lib/web/index.js
            cp ${./config.js} $out/lib/web/config.js
            mkdir -p $out/lib/web/public
            cp -r ${webFrontend}/. $out/lib/web/public/
            mkdir -p $out/bin
            makeWrapper ${nodejs}/bin/node $out/bin/home-control-web \
              --run "cd $out/lib/web" \
              --add-flags "$out/lib/web/index.js"
            runHook postInstall
          '';
        };
      in
      {
        packages = {
          inherit web scheduler hold_press_handler onkyo_control;
          default = web;
        };
      });
}
