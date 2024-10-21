let
	pkgs = import <nixpkgs> {};
in

pkgs.stdenv.mkDerivation {
	name = "tuxstrap";
	version = "1.0.0";

	# Source code
	src = ./.;

	buildInputs = [ pkgs.bun pkgs.nodejs pkgs.nodePackages.npm ];
	buildPhase = ''
	npm i
	bun build --minify --compile src/ --outfile dist/tuxstrap
	'';

	installPhase = ''
	mkdir -p $out
	mkdir -p $out/bin
	cp -r dist/* $out/bin/
	'';

	meta = {
		description = "Commandline launcher for Roblox";
		homepage = "https://github.com/ocbwoy3/tuxstrap";
		license = "MIT";
	};
}
