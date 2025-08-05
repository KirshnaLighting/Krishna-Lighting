const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary.config");

// Image Uploads
const storage1 = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "/KRISHNA_LIGHTING/PRODUCTS",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage: storage1 });

module.exports = {
  upload,
};
