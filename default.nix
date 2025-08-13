{ mkBunDerivation, ... }:

mkBunDerivation {
	packageJson = ./package.json;
	src = ./.;
	bunNix = ./bun.nix;
	index = "src/index.ts";
}
