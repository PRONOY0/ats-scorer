import cloudinary  from "@/lib/cloudinary";

type UploadImageInput<T> = {
  typeOfImage: T;
  image: string;
};

type UploadedImageResult<T> = {
  typeOfImage: T;
  imageUrl: string;
  publicId: string;
};

export async function uploadToCloudinary<T extends string>(
  images: UploadImageInput<T>[],
  generationId: string,
): Promise<UploadedImageResult<T>[]> {
  const uploadedImages: UploadedImageResult<T>[] = [];

  for (const item of images) {
    const result = await cloudinary.uploader.upload(item.image, {
      folder: `catalogs/${generationId}`,
      public_id: `${item.typeOfImage.toLowerCase()}-${Date.now()}`,
    });

    uploadedImages.push({
      typeOfImage: item.typeOfImage,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  }

  return uploadedImages;
}
