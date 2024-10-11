let
	pkgs = import <nixpkgs> {};
in

pkgs.stdenv.mkDerivation {
	name = "tuxstrap";
	version = "1.0.0";

	# Source code
	src = pkgs.fetchgit {
		url = "https://github.com/ocbwoy3/tuxstrap";
		rev = "main";
	};

	buildInputs = [ pkgs.bun pkgs.npm ];
	buildPhase = ''
	npm run build
	'';

	installPhase = ''
	mkdir -p $out
	mkdir -p $out/usr
	mkdir -p $out/usr/bin
	cp -r dist/* $out/usr/bin/
	'';

	meta = {
		description = "Commandline launcher for Roblox";
		homepage = "https://github.com/ocbwoy3/tuxstrap";
		license = "MIT";
	};
}
