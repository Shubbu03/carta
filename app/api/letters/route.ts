import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Letter from "@/lib/models/Letter";

function getDeviceId(request: NextRequest): string | null {
  return request.headers.get("x-device-id");
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const deviceId = getDeviceId(request);

  if (!deviceId) {
    return NextResponse.json(
      { message: "x-device-id header is required" },
      { status: 400 }
    );
  }

  try {
    const letters = await Letter.find({ deviceId })
      .select("title updatedAt")
      .sort({ updatedAt: -1 })
      .lean({ virtuals: true });

    return NextResponse.json(letters, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Server error while fetching letters", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const deviceId = getDeviceId(request);

  if (!deviceId) {
    return NextResponse.json(
      { message: "x-device-id header is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    const newLetter = new Letter({
      title: title || "Untitled Letter",
      content: content || "",
      deviceId: deviceId,
    });

    const savedLetter = await newLetter.save();
    return NextResponse.json(savedLetter.toJSON(), { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Server error while creating letter", error: error },
      { status: 500 }
    );
  }
}
