const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 100;

const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export const uploadToCloudinary = async (file, folder = "WithGodDaily", resourceType = 'image') => {
  if (!file) throw new Error("No file provided");

  const maxSizeMB = resourceType === 'video' ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB;
  const allowedTypes = resourceType === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: ${allowedTypes.join(", ")}.`
    );
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed is ${maxSizeMB} MB.`
    );
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dpmklbfbt";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "WithGodDaily";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message || "Cloudinary upload failed";
    throw new Error(msg);
  }

  if (!isValidUrl(data.secure_url)) {
    throw new Error("Cloudinary returned an invalid URL.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
};

const extractYouTubeId = (urlOrId) => {
  const watchMatch = (urlOrId || "").match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  return watchMatch ? watchMatch[1] : /^[\w-]{6,}$/.test(urlOrId) ? urlOrId : null;
};

export const buildYouTubeEmbed = (urlOrId) => {
  const id = extractYouTubeId(urlOrId);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
};

const TRUSTED_EMBED_HOSTS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "open.spotify.com",
  "soundcloud.com",
  "w.soundcloud.com",
];

export const buildEmbedUrl = (url) => {
  if (!url) return null;
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  const hostname = parsed.hostname.replace(/^www\./, "");
  const isTrusted = TRUSTED_EMBED_HOSTS.some((h) => hostname === h || hostname.endsWith("." + h));
  if (!isTrusted) return null;
  if (hostname.includes("youtube.") || hostname === "youtu.be") return buildYouTubeEmbed(parsed.href);
  if (hostname.includes("vimeo.")) {
    const m = parsed.href.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }
  return parsed.href;
};

export default uploadToCloudinary;