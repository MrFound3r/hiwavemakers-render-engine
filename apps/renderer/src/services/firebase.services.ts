import * as admin from "firebase-admin";
import path from "node:path";

// Initialize Firebase Admin (You might already be doing this elsewhere in your server)
// Ensure you have your service account JSON and storage bucket URL configured
if (!admin.apps.length) {
  const serviceAccount = require("./../../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mrfounder-builder-prototype-default-rtdb.firebaseio.com",
    storageBucket: "mrfounder-builder-prototype.appspot.com",
  });
}

/**
 * Uploads a local video and (optionally) thumbnail to Firebase Storage.
 * Returns signed URLs for uploaded assets.
 */
export async function uploadRenderToFirebase(
  { videoPath, thumbnailPath }: { videoPath: string; thumbnailPath: string | null },
  jobId: string,
): Promise<{ videoUrl: string; thumbnailUrl: string | null }> {
  const bucket = admin.storage().bucket();

  // ---- Video upload ----
  const videoDestination = `class_renders/${jobId}.mp4`;

  await bucket.upload(videoPath, {
    destination: videoDestination,
    metadata: {
      contentType: "video/mp4",
    },
  });

  const videoFile = bucket.file(videoDestination);

  const [videoUrl] = await videoFile.getSignedUrl({
    action: "read",
    expires: "01-01-2100",
  });

  let thumbnailUrl: string | null = null;

  // ---- Thumbnail upload (only if provided) ----
  if (thumbnailPath) {
    const ext = path.extname(thumbnailPath) || ".jpg";
    const cleanExt = ext.replace(".", "").toLowerCase();

    const thumbnailDestination = `class_renders/${jobId}-thumbnail${ext}`;

    await bucket.upload(thumbnailPath, {
      destination: thumbnailDestination,
      metadata: {
        contentType: `image/${cleanExt}`,
      },
    });

    const thumbnailFile = bucket.file(thumbnailDestination);

    const [url] = await thumbnailFile.getSignedUrl({
      action: "read",
      expires: "01-01-2100",
    });

    thumbnailUrl = url;
  }

  return { videoUrl, thumbnailUrl };
}
