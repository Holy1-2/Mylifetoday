export const uploadToCloudinary = async (file, folder = "providence") => {
  if (!file) throw new Error("No file provided");

  const cloudName = "dpmklbfbt";
  const uploadPreset = "mylifetoday";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();

  // ✅ If Cloudinary returns an error, show it clearly
  if (!response.ok) {
    const msg = data?.error?.message || "Cloudinary upload failed";
    throw new Error(msg);
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
};
