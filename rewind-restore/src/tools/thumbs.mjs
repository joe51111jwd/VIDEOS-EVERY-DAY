// renders the Rewind strip thumbnails into public/thumbs (bundle once, many stills)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const jobs = JSON.parse(process.argv[2]); // [{name, props}]
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
for (const j of jobs) {
	const composition = await selectComposition({serveUrl, id: 'THUMB', browserExecutable, inputProps: j.props, chromiumOptions: {gl: 'swiftshader'}});
	await renderStill({composition, serveUrl, browserExecutable, inputProps: j.props, frame: 0, output: `public/thumbs/${j.name}.jpg`, imageFormat: 'jpeg', jpegQuality: 82, scale: 0.16, chromiumOptions: {gl: 'swiftshader'}});
	console.log('thumb', j.name);
}
