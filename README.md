# ImageInsight

## Files
- `index.html`: webpage structure and links CSS and JS.
- `style.css`: visual design and responsive media queries.
- `script.js`: file validation, preview, drag/drop, API call, copy and download.
- `api/analyze.js`: Vercel backend function. It calls Gemini Vision without exposing the API key.
- `package.json`: local Vercel development dependency.

## Run locally
1. Install Node.js LTS and VS Code.
2. Open this folder in VS Code.
3. Open Terminal > New Terminal.
4. Run `npm install`.
5. Create `.env.local` beside `index.html`.
6. Add `GEMINI_API_KEY=YOUR_GEMINI_API_KEY` to `.env.local`.
7. Run `npx vercel dev` and open the localhost URL shown.

Get a Gemini API key from Google AI Studio: https://aistudio.google.com/app/apikey

## Deploy
1. Push the complete folder to a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. In Vercel Project Settings > Environment Variables, add `GEMINI_API_KEY` with your key.
4. Deploy or redeploy. Test the live URL with sample images.

Never put the API key in `script.js` or `index.html`. The UI accepts JPG, JPEG, PNG, WEBP, GIF and BMP. Gemini's documented image MIME types are JPEG, PNG and WEBP; GIF/BMP are converted to PNG in the browser before analysis (for GIF, only the displayed frame is analysed). TIFF and HEIC are not included. Add rate limiting, privacy notice and stronger production validation before public launch.
