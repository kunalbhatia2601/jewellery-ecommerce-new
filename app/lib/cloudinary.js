export const cloudinaryConfig = {
    cloudName: "dolmulfds",
    apiKey: "495511647981186",
    apiSecret: "FvCzDmUOPTQ_cjfKdhqZQrUh6jA"
};

// Common image transformations
export const imageDefaults = {
    quality: "auto",
    format: "auto",
    fetchFormat: "auto"
};

export const cloudinaryLoader = ({ src, width, quality }) => {
  const params = ['f_auto', 'c_limit', 'w_' + width, 'q_' + (quality || 'auto')];
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${params.join(',')}/${src}`;
};