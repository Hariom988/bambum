import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Convert File to base64 for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "bambumm/products",
      transformation: [
        { width: 1200, height: 1600, crop: "limit" }, // max dimensions
        { quality: "auto", fetch_format: "auto" },     // auto compress + format
      ],
    });

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (err) {
    console.error("[upload POST]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}