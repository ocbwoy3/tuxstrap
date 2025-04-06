{
  description = "Alternative Roblox bootstrapper for Linux";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      gtkDeps = with pkgs; [
        gjs
        gtk3
        glib
        gobject-introspection
      ];
    in {
      devShell = pkgs.mkShell {
        nativeBuildInputs = [ pkgs.bashInteractive ];
        buildInputs = gtkDeps;

        shellHook = ''
          export PATH=${pkgs.bun}/bin:${pkgs.nodejs}/bin:${pkgs.nodePackages.npm}/bin:$PWD/dist:$PATH

          export GI_TYPELIB_PATH=${pkgs.gtk3}/lib/girepository-1.0:${pkgs.glib}/lib/girepository-1.0:${pkgs.gobject-introspection}/lib/girepository-1.0
          export LD_LIBRARY_PATH=${pkgs.glib.out}/lib:${pkgs.gtk3.out}/lib:$LD_LIBRARY_PATH
        '';
      };
    });
}
