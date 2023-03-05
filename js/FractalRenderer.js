
class FractalRenderer {

  constructor(canvas) {
    this.canvas = document.getElementById(canvas)
    this.progressBar = new ProgressBar();
    this.fractal = new Fractal();
    this.threads = 4;
  }

  render() {
    let context = this.canvas.getContext("2d");
    let imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let data = imageData.data;
    let width = this.canvas.width;
    let height = this.canvas.height;

    this.fractal.color.r = Math.floor(Math.random() * 255);
    this.fractal.color.g = Math.floor(Math.random() * 255);
    this.fractal.color.b = Math.floor(Math.random() * 255);

    let workers = [];
    let rowsPerThread = Math.floor(height / this.threads);
    let startRow = 0;
    let endRow = rowsPerThread;
    let progress = 0;

    this.progressBar.start()

    for (let i = 0; i < this.threads; i++) {
      workers[i] = new Worker("js/worker.js");
      workers[i].running = true;
      workers[i].onmessage = (e) => {
        if (e.data === "done") {
          workers[i].running = false;

          if (allThreadsFinished()) {
            this.progressBar.finish(this.threads);
          }
          return;
        }

        let row = e.data.row;
        let rowData = e.data.rowData;
        for (let y = 0; y < rowData.length; y++) {
          let index = (row * width + y) * 4;
          data[index] = rowData[y].r;
          data[index + 1] = rowData[y].g;
          data[index + 2] = rowData[y].b;
          data[index + 3] = rowData[y].a;
        }
        context.putImageData(imageData, 0, 0);

        progress += 100 / height;
        this.progressBar.setProgress(progress);
      };
      workers[i].postMessage({
        "startRow": startRow,
        "endRow": endRow,
        "width": width,
        "height": height,
        "fractal": this.fractal
      });
      startRow = endRow;
      endRow += rowsPerThread;
    }

    let allThreadsFinished = () => {
      let finished = true;
      for (let i = 0; i < workers.length; i++) {
        if (workers[i].running) {
          finished = false;
        }
      }
      return finished;
    }

  }

  setPixelDensity(density) {
    this.canvas.width = this.canvas.clientWidth * density;
    this.canvas.height = this.canvas.clientHeight * density;
  }

  setZoom(zoom) {
    this.fractal.zoom = zoom;
  }

  reset() {
    this.fractal.zoom = 1;
    this.fractal.color.r = 0;
    this.fractal.color.g = 0;
    this.fractal.color.b = 0;

    this.render();
  }

  setComputeThreads(threads) {
    this.threads = threads;
  }
}

class Fractal {
  constructor() {
    this.zoom = 1;
    this.maxIterations = 100;
    this.color = {
      r: 0,
      g: 0,
      b: 0,
      a: 255
    };
  }
}

class ProgressBar {

  constructor() {
    this.bar = document.getElementById("progress-bar");
    this.text = document.getElementById("progress-text");
    this.time_start = null;
  }

  async setProgress(progress) {
    if (progress > 100) {
      progress = 100;
    }

    if (progress === undefined)
      return;

    this.bar.value = progress.toFixed(2);
    this.text.innerHTML = progress.toFixed(2) + "%";
  }

  start() {
    this.time_start = new Date();
    this.bar.value = 0;
  }

  finish(threadCount) {
    let time_end = new Date();
    let time_elapsed = (time_end - this.time_start) / 1000;
    this.text.innerHTML = "Rendered in " + time_elapsed.toFixed(2) + " seconds using " + threadCount + " threads";
  }

}
