bookmarklet:
	mkdir -p output
	uglifyjs -o output/index.min.js index.js
	echo -n "javascript: " > output/bookmarklet.js
	cat output/index.min.js >> output/bookmarklet.js

tampermonkey:
	mkdir -p output
	cat tampermonkey.header.js > output/placebot.user.js
	cat index.js >> output/placebot.user.js