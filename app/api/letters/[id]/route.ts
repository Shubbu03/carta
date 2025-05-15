import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Letter from "@/lib/models/Letter";
import mongoose from "mongoose";

function getDeviceId(request: NextRequest): string | null {
  return request.headers.get("x-device-id");
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();
  const deviceId = getDeviceId(request);
  const letterId = (await params).id;

  if (!deviceId) {
    return NextResponse.json(
      { message: "x-device-id header is required" },
      { status: 400 }
    );
  }

  if (!letterId || !mongoose.Types.ObjectId.isValid(letterId)) {
    return NextResponse.json(
      { message: "Valid letter ID is required" },
      { status: 400 }
    );
  }

  try {
    const letter = await Letter.findOne({ _id: letterId, deviceId });

    if (!letter) {
      return NextResponse.json(
        { message: "Letter not found or access denied" },
        { status: 404 }
      );
    }
    return NextResponse.json(letter.toJSON(), { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Server error while fetching letter", error: error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  await dbConnect();
  const deviceId = getDeviceId(request);
  const letterId = (await params).id;

  if (!deviceId) {
    return NextResponse.json(
      { message: "x-device-id header is required" },
      { status: 400 }
    );
  }

  if (!letterId || !mongoose.Types.ObjectId.isValid(letterId)) {
    return NextResponse.json(
      { message: "Valid letter ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    const letter = await Letter.findOne({ _id: letterId, deviceId });

    if (!letter) {
      return NextResponse.json(
        { message: "Letter not found or access denied for update" },
        { status: 404 }
      );
    }

    if (title !== undefined) letter.title = title;
    if (content !== undefined) letter.content = content;

    const updatedLetter = await letter.save();
    return NextResponse.json(updatedLetter.toJSON(), { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Server error while updating letter", error: error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  await dbConnect();
  const deviceId = getDeviceId(request);
  const letterId = (await params).id;

  if (!deviceId) {
    return NextResponse.json(
      { message: "x-device-id header is required" },
      { status: 400 }
    );
  }

  if (!letterId || !mongoose.Types.ObjectId.isValid(letterId)) {
    return NextResponse.json(
      { message: "Valid letter ID is required" },
      { status: 400 }
    );
  }

  try {
    const letter = await Letter.deleteOne({ _id: letterId, deviceId });

    if (!letter) {
      return NextResponse.json(
        { message: "Letter not found or access denied" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: letter.acknowledged }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Server error while fetching letter", error: error },
      { status: 500 }
    );
  }
}
