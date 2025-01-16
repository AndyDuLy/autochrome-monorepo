import jimp from "jimp";

interface ProcessingOptions {
  yellowTint?: number;
  greenTint?: number;
  magentaTint?: number;
  filmGrain?: number;
}

function applyColorTint(image: jimp, color: string, opacity: number): void {
  const tint = new jimp(image.bitmap.width, image.bitmap.height, color);

  image.composite(tint, 0, 0, {
    mode: jimp.BLEND_MULTIPLY,
    opacitySource: opacity,
    opacityDest: 0.5,
  });
}

export async function processImage(
  inputPath: string,
  outputPath: string,
  options: ProcessingOptions = {}
): Promise<void> {
  try {
    const image = await jimp.read(inputPath);

    if (!image) {
      throw new Error("Failed to load image");
    }

    if (options.greenTint) {
      // todo: sliders
      applyColorTint(image, "#00FF00", options.greenTint / 100);
    }
    if (options.magentaTint) {
      applyColorTint(image, "#FF00FF", options.magentaTint / 100);
    }
    if (options.yellowTint) {
      applyColorTint(image, "#FFFF00", options.yellowTint / 100);
    }

    image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x: number, y: number, idx: number) {
        const red = this.bitmap.data[idx];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const gray = Math.floor((red + green + blue) / 3);

        this.bitmap.data[idx] = Math.floor(red * 0.7 + gray * 0.3);
        this.bitmap.data[idx + 1] = Math.floor(green * 0.7 + gray * 0.3);
        this.bitmap.data[idx + 2] = Math.floor(blue * 0.7 + gray * 0.3);
      }
    );

    const grainIntensity = options.filmGrain
      ? (options.filmGrain / 100) * 30
      : 15;

    image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x: number, y: number, idx: number) {
        const noise =
          Math.floor(Math.random() * grainIntensity) - grainIntensity / 2;

        this.bitmap.data[idx] = Math.max(
          0,
          Math.min(255, this.bitmap.data[idx] + noise)
        );
        this.bitmap.data[idx + 1] = Math.max(
          0,
          Math.min(255, this.bitmap.data[idx + 1] + noise)
        );
        this.bitmap.data[idx + 2] = Math.max(
          0,
          Math.min(255, this.bitmap.data[idx + 2] + noise)
        );
      }
    );

    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

    image.scan(
      0,
      0,
      width,
      height,
      function (x: number, y: number, idx: number) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const vignetteFactor = (distance / maxDistance) ** 2;
        const factor = 1 - vignetteFactor * 0.5;

        this.bitmap.data[idx] = Math.floor(this.bitmap.data[idx] * factor);
        this.bitmap.data[idx + 1] = Math.floor(
          this.bitmap.data[idx + 1] * factor
        );
        this.bitmap.data[idx + 2] = Math.floor(
          this.bitmap.data[idx + 2] * factor
        );
      }
    );

    await image.writeAsync(outputPath);
  } catch (error) {
    console.error("Error in processImage:", error);
    throw error;
  }
}
