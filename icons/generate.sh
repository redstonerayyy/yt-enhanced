filename=${1%.*};
convert -resize 16x16 $1 "${filename}-16.png";
convert -resize 32x32 $1 "${filename}-32.png";
convert -resize 64x64 $1 "${filename}-64.png";
convert -resize 128x128 $1 "${filename}-128.png";
