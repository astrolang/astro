#!/bin/bash
# LANGUAGE INFORMATION
version="0.1.14"
program_name="astro"

# PATHS
# Get current working directory
current_dir=`pwd`

# Get the absolute path of where script is running from
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd)"


main() {
    local flag=""

    for param in "$@"
	do
		if [ "$param" = "-b" ] || [ "$param" = "--build" ]; then
			flag="build"
		elif [ "$param" = "-c" ] || [ "$param" = "--clean" ]; then
            flag="clean"
		elif [ "$param" = "-r" ] || [ "$param" = "--run" ]; then
            flag="run"
		elif [ "$param" = "-br" ] || [ "$param" = "--buid-run" ]; then
            flag="build_run"
        else
            flag="help"
		fi
	done

    run_program $flag

    exit 0
}

run_program() {
    case $1 in
		*help* )
			help
		;;
		*build* )
			build
		;;
		*build_run* )
			build_run
		;;
		*clean* )
			clean
		;;
		*run* )
			run
		;;
	esac
}

build_run() {
    build && run
}


build() {
    cd $script_dir
    make build
    cd $current_dir
}

clean() {
    cd $script_dir
    make clean
    cd $current_dir
}

run() {
    cd $script_dir
    make run
    cd $current_dir
}

help() {
	echo "astro:help:menu"
	echo "Usage: bash build.sh [FLAG]"
	echo "[FLAG] :"
	echo "	-b, --build	build astro llvm codegen executable on your system"
	echo "	-c, --clean	clean all llvm codegen build dependencies from your system"
	echo "	-h, --help	display this help message"
}


main $@
