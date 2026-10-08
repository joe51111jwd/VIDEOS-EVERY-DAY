import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, FontFaceDescriptors][] = [
  ['Archivo', 'fonts/Archivo-normal-var.woff2', {weight: '100 900', stretch: '62% 125%'}],
  ['Geist', 'fonts/Geist-var.woff2', {weight: '100 900'}],
  ['GeistMono', 'fonts/GeistMono-var.woff2', {weight: '100 900'}],
  ['Instrument Serif', 'fonts/InstrumentSerif-400-normal.woff2', {weight: '400'}],
  ['Instrument Serif', 'fonts/InstrumentSerif-400-italic.woff2', {weight: '400', style: 'italic'}],
  ['JetBrains Mono', 'fonts/JetBrainsMono-500-normal.woff2', {weight: '500'}],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const h = delayRender('fonts');
  Promise.all(
    faces.map(async ([family, file, desc]) => {
      const f = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, desc);
      await f.load();
      document.fonts.add(f);
    }),
  )
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
};
