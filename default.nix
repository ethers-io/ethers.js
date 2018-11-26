#with import (builtins.fetchTarball "https://nixos.org/channels/nixpkgs-unstable/nixexprs.tar.xz") {};
with (import <nixpkgs> {});

mkShell {
  buildInputs = [
    nodejs-10_x
  ];

  shellHook = ''
    export PATH=$(pwd)/node_modules/.bin:$PATH
  '';
}

