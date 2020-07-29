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
  context.strokeStyle = "lime";
  context.lineWidth = "3";

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

function drawRLE(rle, h, params, context) {
  context.beginPath();
  context.moveTo(...mapXY(...indexToXY(rle[0], h), params));
  var offset = rle[0];
  for (var i = 1; i < rle.length; i += 2) {
    rleFill(offset, rle[i], h, context, params);
    offset += rle[i] + rle[i + 1];
  }
  rleFill(offset, rle[rle.length - 1], h, context, params);
  context.stroke();
}

function draw(annotation, image, canvas, canvasWidth, canvasHeight) {
  var ctx = canvas.getContext('2d');

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  var h = image.height;
  var w = image.width;

  var params = {}
  if (h > w) {
    params.ratio = canvasHeight / h;
    params.dHeight = canvasHeight;
    params.dWidth = Math.floor(params.ratio * w);
    params.dy = 0;
    params.dx = Math.floor((canvasWidth - params.dWidth) / 2);
  } else {
    params.ratio = canvasWidth / w;
    params.dWidth = canvasWidth;
    params.dHeight = Math.floor(params.ratio * h);
    params.dx = 0;
    params.dy = Math.floor((canvasHeight - params.dHeight) / 2);
  }
  ctx.drawImage(image, params.dx, params.dy, params.dWidth, params.dHeight);

  if (annotation.bbox) {
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
      drawRLE(annotation.segmentation.counts, h, params, ctx)
    }
  }
}

function display(tag, url, ann, maxWidth, maxHeight) {
  const image = document.createElement("img");
  const canvas = document.createElement("canvas");
  tag.appendChild(image);
  tag.appendChild(canvas);
  console.log(tag.innerHTML);
  image.style.display = "none";
  image.onload = function (e) {
    draw(ann, image, canvas, maxWidth, maxHeight);
  }
  image.src = url;
}