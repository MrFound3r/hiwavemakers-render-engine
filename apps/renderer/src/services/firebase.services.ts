import * as admin from "firebase-admin";

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
 * Uploads a local file to Firebase Storage and returns a long-lived download URL.
 */
export async function uploadRenderToFirebase(localFilePath: string, jobId: string): Promise<string> {
	const bucket = admin.storage().bucket();
	const destination = `class_renders/${jobId}.mp4`;

	await bucket.upload(localFilePath, {
		destination: destination,
		metadata: {
			contentType: "video/mp4",
		},
	});

	const file = bucket.file(destination);

	const [url] = await file.getSignedUrl({
		action: "read",
		expires: "01-01-2100",
	});

	return url;
}
