/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'media.istockphoto.com'],
        qualities: [75, 90, 100], // Fix the image quality warning
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
};

export default nextConfig;
