var covid =
  (function () {
    function randNumber() {
      return Math.floor(Math.random() * 255);
    }

    function getRandomColor() {
      return `rgba(${randNumber()},${randNumber()},${randNumber()},0.5)`;
    }

    function indexToXY(index, h) {
      var x = Math.floor(index / h);
      var y = index - x * h;
      return [x, y]
    }

    function mapX(x, params) {
      return x * params.ratio + params.dx;
    }

    function mapY(y, params) {
      return y * params.ratio + params.dy
    }

    function mapXY(x, y, params) {
      return [mapX(x, params), mapY(y, params)];
    }

    function getResizeParams(canvas, { height, width }) {
      var params = {
        h: height,
        w: width,
      };

      if (params.h > params.w) {
        params.ratio = canvas.height / params.h;
        params.dHeight = canvas.height;
        params.dWidth = Math.floor(params.ratio * params.w);
        params.dy = 0;
        params.dx = Math.floor((canvas.width - params.dWidth) / 2);
      } else {
        params.ratio = canvas.width / params.w;
        params.dWidth = canvas.width;
        params.dHeight = Math.floor(params.ratio * params.h);
        params.dx = 0;
        params.dy = Math.floor((canvas.height - params.dHeight) / 2);
      }

      return params;
    };


    function rleFill(startIndex, offset, h, context, params) {
      var xy = indexToXY(startIndex, h);
      var x1 = xy[0];
      var y1 = xy[1];

      var mapped = {};
      mapped.x1 = mapX(x1, params);
      mapped.y1 = mapY(y1, params);
      context.moveTo(mapped.x1, mapped.y1);
      if (y1 + offset <= h) {
        context.lineTo(mapped.x1, mapY(y1 + offset, params));
      } else {
        var x2y2 = indexToXY(startIndex + offset, h);
        var x2 = x2y2[0];
        var y2 = x2y2[1];
        mapped.top = params.dy;
        mapped.bottom = params.dHeight + params.dy;
        context.lineTo(x1, mapped.bottom);
        for (var i = x1 + 1; i < x2; i++) {
          context.moveTo(i, mapped.top);
          context.lineTo(i, mapped.bottom);
        }
        mapped.x2 = mapX(x2, params);
        context.moveTo(mapped.x2, mapped.top);
        context.lineTo(mapped.x2, y2);
      }
    }

    function drawBbox(bbox, params, context) {
      var x = mapX(bbox[0], params);
      var y = mapY(bbox[1], params);
      var width = bbox[2] * params.ratio;
      var height = bbox[3] * params.ratio;

      context.beginPath();
      context.rect(x, y, width, height);
      context.stroke();
    }

    function drawPolygon(polygon, params, context) {
      var region = new Path2D();
      region.moveTo(mapX(polygon[0], params), mapY(polygon[1], params));
      for (var i = 2; i < polygon.length; i += 2) {
        region.lineTo(mapX(polygon[i], params), mapY(polygon[i + 1], params));
      }
      region.lineTo(mapX(polygon[0], params), mapY(polygon[1], params));
      region.closePath();
      context.fill(region);
    }

    function drawRLE(rle, params, context) {
      context.beginPath();
      context.moveTo(...mapXY(...indexToXY(rle[0], params.h), params));
      var offset = rle[0];
      for (var i = 1; i < rle.length; i += 2) {
        rleFill(offset, rle[i], params.h, context, params);
        offset += rle[i] + rle[i + 1];
      }
      rleFill(offset, rle[rle.length - 1], params.h, context, params);
      context.stroke();
    }

    function draw(canvas, image, annotation) {
      var ctx = canvas.getContext('2d');

      var params = getResizeParams(canvas, image);
      ctx.drawImage(image, params.dx, params.dy, params.dWidth, params.dHeight);

      if (annotation.bbox) {
        ctx.strokeStyle = "lime";
        ctx.lineWidth = "3";
        drawBbox(annotation.bbox, params, ctx);
      }

      if (annotation.segmentation) {
        if (annotation.iscrowd === 0) {
          ctx.lineWidth = "1";
          ctx.fillStyle = getRandomColor();
          for (var i = 0; i < annotation.segmentation.length; i++) {
            drawPolygon(annotation.segmentation[i], params, ctx);
          }
        } else {
          ctx.strokeStyle = getRandomColor();
          drawRLE(annotation.segmentation.counts, params, ctx)
        }
      }
    }

    function uncompressRLE(rle) {
      let m = 0;
      let p = 0;
      let k = 0;
      let x = 0;
      let more = true;
      let cnts = new Uint32Array(rle.length);

      while (rle[p]) {
        x = 0;
        k = 0;
        more = true;
        while (more) {
          let c = rle.charCodeAt(p) - 48;
          x |= (c & 0x1F) << 5 * k;
          more = c & 0x20;
          p++;
          k++;
          if (!more && (c & 0x10)) {
            x |= -1 << 5 * k;
          }
        }
        if (m > 2) {
          x += cnts[m - 2];
        }
        cnts[m++] = x;
      }
      return cnts;
    }

    function drawNoncrowd(canvas, url, ann) {
      const image = document.createElement("img");
      image.style.display = "none";
      image.onload = function (e) {
        draw(canvas, image, ann);
      }
      image.src = url;
    }

    function drawUncompressed(canvas, url, ann) {
      const image = document.createElement("img");
      image.style.display = "none";
      image.onload = function (e) {
        draw(canvas, image, ann);
      }
      image.src = url;
    }

    function drawCompressed(canvas, url, ann) {
      const image = document.createElement("img");
      image.style.display = "none";
      image.onload = function (e) {
        ann.segmentation.counts = uncompressRLE(ann.segmentation.counts);
        draw(canvas, image, ann);
      }
      image.src = url;
    }

    return {
      drawNoncrowd,
      drawUncompressed,
      drawCompressed,
    }
  })();
