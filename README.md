# Go2-3D Mapping (public build)

This repository holds only the built static website, published with GitHub Pages at `/go2-3d-mapping/`.

- The whole site: home, maps by building and floor, 3D viewer, comparison, dataset, Download Center, learning lab and SLAM playground.
- Maps published: information 1F LIO-SAM, information 2F FAST-LIO, information 2F LIO-SAM, information 3F FAST-LIO, information 3F LIO-SAM, information 4F LIO-SAM, information 5F LIO-SAM, information 6F FAST-LIO, information 8F FAST-LIO, engineering 1F LIO-SAM, industry-cooperation 1F LIO-SAM. Only their approved files are here; who approved what, and on which evidence (operator declaration or institutional permission), is in `metadata/packages.json`.
- Licences: the site code is MIT; each map's data carries the licence of its approval record (`license` in `metadata/packages.json`).
- The robot image is a render, not a photograph; its source and rights are in `figures/hardware/photos.json`.
- Every other map is listed with its description and checksums but **without any of its files**: no point cloud, trajectory, image or download.
- No source code, no development history, no review data.
- Every file is listed with its SHA-256 in `SHA256SUMS.txt`.
