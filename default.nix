{ mkBunDerivation, ... }:

mkBunDerivation {
	packageJson = ./package.json;
	src = ./src;
	bunNix = ./bun.nix;
	index = "index.ts";
}
