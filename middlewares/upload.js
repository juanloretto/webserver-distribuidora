import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `productos-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos CSV"));
    }
  },
});
