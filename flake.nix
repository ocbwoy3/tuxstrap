{
  description = "Alternative Roblox bootstrapper for Linux";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell = pkgs.mkShell {
        nativeBuildInputs = [ pkgs.bashInteractive ];
        buildInputs = with pkgs; [ gtk3 glib ];
        shellHook = ''
        export PATH=${pkgs.bun}/bin:${pkgs.nodejs}/bin:${pkgs.nodePackages.npm}/bin:$PWD/dist:$PATH
        '';
      };
    });
}
