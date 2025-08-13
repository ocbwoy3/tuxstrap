{ mkBunDerivation, ... }:

mkBunDerivation {
	packageJson = ./package.json;
	src = ./src;
	bunNix = ./bun.nix;
	index = "index.ts";
	installPhase = ''
		mkdir -p $out/bin
		cp ./tuxstrap $out/bin
	
		mkdir -p $out/share/applications
		$out/bin/tuxstrap "tuxstrap://gendesktoproblox" > $out/share/applications/tuxstrap.desktop
	'';
}
