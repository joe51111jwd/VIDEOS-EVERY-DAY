import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setChromiumOpenGlRenderer('swiftshader');
Config.setConcurrency(4);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setDelayRenderTimeoutInMilliseconds(120000);
