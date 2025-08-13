{
	description = "Bun2Nix minimal sample";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
		systems.url = "github:nix-systems/default";

		bun2nix = {
			url = "github:baileyluTCD/bun2nix";
			inputs.nixpkgs.follows = "nixpkgs";
			inputs.systems.follows = "systems";
		};
	};

	nixConfig = {
		extra-substituters = [
			"https://cache.nixos.org"
			"https://cache.garnix.io"
		];
		extra-trusted-public-keys = [
			"cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
			"cache.garnix.io:CTFPyKSLcx5RMJKfLo5EEPUObbA78b0YQ2DTCJXqr9g="
		];
	};

	outputs =
		{
			nixpkgs,
			systems,
			bun2nix,
			...
		}:
	let
		eachSystem = nixpkgs.lib.genAttrs (import systems);
		pkgsFor = eachSystem (system: import nixpkgs { inherit system; });
	in
		{
			packages = eachSystem (system: {
				default = pkgsFor.${system}.callPackage ./default.nix {
					inherit (bun2nix.lib.${system}) mkBunDerivation;
				};
			});

			devShells = eachSystem (system: {
				default = pkgsFor.${system}.mkShell {
					packages = with pkgsFor.${system}; [
						bun
						bun2nix.packages.${system}.default
					];

					shellHook = ''
						bun install --frozen-lockfile
					'';
				};
			}
		);
	};
}
