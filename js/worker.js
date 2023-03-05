self.onmessage = function (e) {
  let fractal = e.data.fractal;
  let startRow = e.data.startRow;
  let endRow = e.data.endRow;
  let width = e.data.width;
  let height = e.data.height;
  let zoom = fractal.zoom;
  let maxIterations = fractal.maxIterations;
  let color = fractal.color;

  for (let row = startRow; row < endRow; row++) {
    let rowData = [];
    for (let x = 0; x < width; x++) {
      let a = map(x, 0, width, -zoom, zoom);
      let b = map(row, 0, height, -zoom, zoom);

      let ca = a;
      let cb = b;

      let n = 0;
      let z = 0;
      while (n < maxIterations) {
        let aa = a * a - b * b;
        let bb = 2 * a * b;

        a = aa + ca;
        b = bb + cb;

        if (sqrt(a * a + b * b) > 2) {
          break;
        }

        n++;
      }

      let bright = map(n, 0, maxIterations, 0, 1);
      bright = map(sqrt(bright), 0, 1, 0, 255);

      if (n === maxIterations) {
        bright = 0;
      }

      let pix = {
        r: abs(bright - color.r) % 255,
        g: abs(bright - color.g) % 255,
        b: abs(bright - color.b) % 255,
        a: 255
      };

      rowData.push(pix);
    }

    postMessage({"row": row, "rowData": rowData});
  }

  postMessage("done");
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function sqrt(value) {
  return Math.sqrt(value);
}

function abs(value) {
  return Math.abs(value);
}

function log(value) {
  return Math.log(value);
}
