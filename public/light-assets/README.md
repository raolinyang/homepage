# Light page images (optional local mirror)

`src/light/Light.tsx` loads rasters from the published Figma Make site:

`https://trass-adobe-58736858.figma.site/_assets/v11/<hash>.png`

You normally **do not** need files in this folder. To work fully offline or if the remote CDN is blocked, download those PNGs by hash and either switch `LIGHT_PAGE_ASSET_BASE` in `Light.tsx` to `/light-assets` (and keep `/<hash>.png` paths) or serve copies here with matching filenames.
