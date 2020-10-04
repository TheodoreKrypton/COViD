# COViD
COCO Visual Demonstrator - Web frontend visualizer for COCO format annotations

Supported annotation types:
  * COCO noncrowd (polygons)                    `covid.drawNoncrowd`
  * COCO crowd (compressed/uncompressed RLE)    `covid.drawCompressed` & `covid.drawUncompressed`

## DEMO
https://theodorekrypton.github.io/COViD/index.html


## Usage
HTML
```html
<script src="https://raw.githubusercontent.com/TheodoreKrypton/COViD/master/index.js">
<canvas id="image" width="600" height="600"></canvas>
```

Javascript
```javascript
var annotation = {
  "segmentation": [[376.97, 176.91, 398.81, 176.91, 396.38, 147.78, 447.35, 146.17, 448.16, 172.05, 448.16, 178.53, 464.34, 186.62, 464.34, 192.28, 448.97, 195.51, 447.35, 235.96, 441.69, 258.62, 454.63, 268.32, 462.72, 276.41, 471.62, 290.98, 456.25, 298.26, 439.26, 292.59, 431.98, 308.77, 442.49, 313.63, 436.02, 316.86, 429.55, 322.53, 419.84, 354.89, 402.04, 359.74, 401.24, 312.82, 370.49, 303.92, 391.53, 299.87, 391.53, 280.46, 385.06, 278.84, 381.01, 278.84, 359.17, 269.13, 373.73, 261.85, 374.54, 256.19, 378.58, 231.11, 383.44, 205.22, 385.87, 192.28, 373.73, 184.19]],
  "iscrowd": 0,
  "bbox":[359.17, 146.17, 112.45, 213.57]
};
var imageUrl = "http://farm3.staticflickr.com/2407/2477059973_870efb557b_z.jpg";

covid.drawNoncrowd(document.getElementById("image"), image, annotation);
```

![result](https://i.imgur.com/JEFH2Ag.png)