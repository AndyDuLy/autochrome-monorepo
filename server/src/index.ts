import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { processImage } from "./services/imageProcessor";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const app = express();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

interface ProcessingOptions {
  yellowTint?: number;
  greenTint?: number;
  magentaTint?: number;
  filmGrain?: number;
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

app.post(
  "/api/process-image",
  upload.single("image"),
  async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      const options: ProcessingOptions = {
        yellowTint: parseFloat(req.body.yellowTint) || undefined,
        greenTint: parseFloat(req.body.greenTint) || undefined,
        magentaTint: parseFloat(req.body.magentaTint) || undefined,
        filmGrain: parseFloat(req.body.filmGrain) || undefined,
      };

      const inputPath = req.file.path;
      const outputFileName = `processed-${Date.now()}-${path.basename(
        req.file.originalname
      )}`;
      const outputPath = path.join(uploadsDir, outputFileName);

      await processImage(inputPath, outputPath, options);

      res.json({
        original: `/uploads/${path.basename(inputPath)}`,
        processed: `/uploads/${outputFileName}`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Error processing image" });
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
