all:
	echo "mrproper or deploy at this point"

mrproper:
	echo rm -rf ~/.meteor ~/.meteorite/ ./packages/

publish deploy:
	meteor publish


