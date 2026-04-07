// apps/renderer/src/routes/firebase.routes.ts (or wherever you keep your routes)
import { Router } from "express";
import * as admin from "firebase-admin";
import axios from "axios";

const router = Router();

// POST /send-template
router.post("/send-template", async (req, res) => {
	try {
		const {
			currentUserId,
			recipientId,
			templateId,
			videoUrl,
			webServiceDomain,
			templateData, 
			recipientData,
		} = req.body;

		if (!currentUserId || !recipientId || !templateData) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const db = admin.firestore();

		const date = new Date();
		const requestMonth = (date.getMonth() + 1).toString(); // 1 - 12
		const requestYear = date.getFullYear().toString(); // e.g., "2026"

		const requestRef = db.collection("refs").doc();
		const requestId = requestRef.id;

		const templatePathUrl = `${webServiceDomain}/videos/${requestYear}/${currentUserId}/${requestId}/${recipientId}`;

		const recipients = [
			{
				...recipientData,
				id: recipientId,
				templatePath: templatePathUrl,
				videoURL: videoUrl,
			},
		];

		const batch = db.batch();
		const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

		const requestSummaryRef = db.collection("requests").doc(currentUserId).collection(requestYear).doc("summary");
		const requestSummaryData = {
			[requestMonth]: {
				[requestId]: {
					credits: 0,
					recipients: recipients,
					template_id: templateId,
					orderDate: serverTimestamp,
					personalization: {
						hasCallToAction: templateData.call_to_action || false,
					},
					orderAlias: "Template Sent Manually",
				},
			},
		};
		batch.set(requestSummaryRef, requestSummaryData, { merge: true });

		const requestDocRef = db.collection("requests").doc(currentUserId).collection(requestYear).doc(requestId);
		const requestDocData = {
			placedOn: serverTimestamp,
			orderDate: serverTimestamp,
			personalization: templateData,
			templateId: templateId,
			recipients: recipients,
			credits: 0,
			orderAlias: "Template Sent Manually",
		};
		batch.set(requestDocRef, requestDocData, { merge: true });

		await batch.commit();
		console.log(`✅ Template data successfully logged to Firebase (Request ID: ${requestId})`);
		
		const cloudFunctionUrl = "https://us-central1-mrfounder-builder-prototype.cloudfunctions.net/sendHiwaveMakersEmail";

		try {
			await axios.post(cloudFunctionUrl, {
				data: {
					email: recipients[0].email,
					url: templatePathUrl,
				},
			});
			console.log("📧 Email triggered successfully via Cloud Function.");
		} catch (emailError: any) {
			console.error("⚠️ Database updated, but failed to trigger email function:", emailError.message);
		}

		// 10. Return success to the frontend
		res.json({
			success: true,
			message: "Template successfully queued and saved to Firebase",
			requestId: requestId,
		});
	} catch (error) {
		console.error("❌ Error writing document to Firebase:", error);
		res.status(500).json({ error: "Internal server error processing template request" });
	}
});

export default router;
