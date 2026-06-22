import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  turbopack: {},
  allowedDevOrigins: ["192.168.0.101"],
};

export default withPWA(nextConfig);