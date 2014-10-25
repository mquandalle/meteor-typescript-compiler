all:
	echo "mrproper or deploy at this point"

mrproper:
	echo rm -rf ~/.meteor ~/.meteorite/ ./packages/

deploy:
	meteor publish


