# How to package/release new intraSocial frontend

## Front-end
### Webhosting

1. Make sure it builds correctly `npm run build-production`
2. Update `./CHANGELOG.rst`
3. Update `./package.json` with new version number
4. Update `src/app/utilities/Settings.ts` with the new compatMajor/compatMinor if backwards-compatibilty is broken in this version
5. Commit any changes to master
6. Add relase tag: `git tag -a X.X.X -m "description"`
7. Switch to branded branch: `intra.work-live` or `city.live-beta` etc.

### These branches include changes such as:
	index.html: Custom CSP, GA and CDN settings
	electron/electron.html: Custom CSP settings
	electron/assets/*: Icons and images with custom logo
	electron/menu.js: Custom links for ToU/PP etc.
	src/app/utilities/Settings.ts: Settings for CDN/Social Client IDs etc.
	src/app/redux/endpoint.ts: Only allow endpoint for the correct backend
	src/app/views/signin/Signin.tsx: Removed the default set username
	src/app/components/dev/DevTool.tsx: Removed some DevTool options

8. If using CDN: Update `src/app/utilities/Settings.ts` with the new CDN folder location in `CDNPath`
9. If using CDN: Update `./index.html` CDN paths
10. Update `./index.html` title
11. Update `electron/electron.html`: title
12. Delete old `./app` folder `rm -rf app`
13. Rebuild bundle `npm run build-production`
14. If using CDN: Create new folder structure in AWS S3 (format: "version/build/" ie. `0.5.6/1/`)
15. If using CDN: Upload entire `./app` folder to AWS S3 build folder. Make sure to grant public read access!
16. If NOT using CDN: tar, upload and untar `./app` folder to www-root of the front-end host
17. Upload `./index.html` to www-root of the front-end host


### Electron
1. Follow steps for [Webhosting](###Webhosting) up to and including step 13.
2. Enter directory with electron-forge config`./intra.work-BETA` or `city.live` etc.
3. Update version number in `package.json` to new version (same as Webhosting step 3.)
4. Remove old app folder (if exists) and copy app folder from project root here `rm -rf app && cp -r ../app app`
5. Build electron package `electron-forge package`
6. Optional: Test package by running the excutable in `out/{package}` folder
7. Make the installer binaries `electron-forge make`
8. Binaries are located in the `out/make` folder
