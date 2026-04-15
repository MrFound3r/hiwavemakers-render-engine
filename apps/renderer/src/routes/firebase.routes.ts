// apps/renderer/src/routes/firebase.routes.ts

import { Router } from "express";
import * as admin from "firebase-admin";
import axios from "axios";

const router = Router();

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
			recipients: recipientsInput,
		} = req.body;

		if (!currentUserId || !templateData || !templateId || !webServiceDomain) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const db = admin.firestore();

		const date = new Date();
		const requestMonth = (date.getMonth() + 1).toString();
		const requestYear = date.getFullYear().toString();

		const normalizedRecipients =
			Array.isArray(recipientsInput) && recipientsInput.length > 0
				? recipientsInput
				: recipientId && recipientData
					? [
						{
							recipientId,
							videoUrl,
							recipientData,
						},
					]
					: [];

		if (normalizedRecipients.length === 0) {
			return res.status(400).json({ error: "No valid recipients provided" });
		}

		const requestRef = db.collection("refs").doc();
		const requestId = requestRef.id;

		const recipients = normalizedRecipients.map((recipient: any) => {
			const templatePathUrl = `${webServiceDomain}/videos/${requestYear}/${currentUserId}/${requestId}/${recipient.recipientId}`;

			return {
				...recipient.recipientData,
				id: recipient.recipientId,
				templatePath: templatePathUrl,
				videoURL: recipient.videoUrl,
				template_thumbnail: recipient.thumbnailUrl ?? null,
			};
		});

		const batch = db.batch();
		const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

		const requestSummaryRef = db.collection("requests").doc(currentUserId).collection(requestYear).doc("summary");

		const requestSummaryData = {
			[requestMonth]: {
				[requestId]: {
					credits: 0,
					recipients,
					template_id: templateId,
					orderDate: serverTimestamp,
					personalization: {
						hasCallToAction: templateData.call_to_action || false,
					},
					orderAlias: recipients.length > 1 ? "Template Sent Manually - Bulk" : "Template Sent Manually",
				},
			},
		};

		batch.set(requestSummaryRef, requestSummaryData, { merge: true });

		const requestDocRef = db.collection("requests").doc(currentUserId).collection(requestYear).doc(requestId);

		const requestDocData = {
			placedOn: serverTimestamp,
			orderDate: serverTimestamp,
			personalization: templateData,
			templateId,
			recipients,
			credits: 0,
			orderAlias: recipients.length > 1 ? "Template Sent Manually - Bulk" : "Template Sent Manually",
		};

		batch.set(requestDocRef, requestDocData, { merge: true });

		await batch.commit();

		console.log(
			`✅ Template data successfully logged to Firebase (Request ID: ${requestId}, recipients: ${recipients.length})`,
		);

		// recipients.map((recipient) => {
		// 	console.log("📧 Sending email to:", {
		// 		data: {
		// 			email: recipient.email,
		// 			url: recipient.templatePath,
		// 		},
		// 	});
		// });

		// const samplePayload = {
		// 	success: true,
		// 	message: "Template successfully queued and saved to Firebase",
		// 	requestId,
		// 	recipientsQueued: recipients.length,
		// 	recipients,
		// 	requestData: requestDocData,
		// };

		// res.status(200).json(samplePayload);
		// return;

		const cloudFunctionUrl = "https://us-central1-mrfounder-builder-prototype.cloudfunctions.net/sendHiwaveMakersEmail";

		const emailResults = await Promise.allSettled(
			recipients.map((recipient) =>
				axios.post(cloudFunctionUrl, {
					data: {
						email: recipient.email,
						url: recipient.templatePath,
					},
				}),
			),
		);

		const successfulEmails = emailResults.filter((result) => result.status === "fulfilled").length;

		const failedEmails = emailResults.length - successfulEmails;

		if (failedEmails > 0) {
			console.warn(`⚠️ Some emails failed to trigger. Success: ${successfulEmails}, Failed: ${failedEmails}`);
		} else {
			console.log("📧 All emails triggered successfully via Cloud Function.");
		}

		res.status(200).json({
			success: true,
			message: "Template successfully queued and saved to Firebase",
			requestId,
			recipientsQueued: recipients.length,
			recipients,
			emailTriggerSuccessCount: successfulEmails,
			emailTriggerFailureCount: failedEmails,
		});
	} catch (error) {
		console.error("❌ Error writing document to Firebase:", error);
		res.status(500).json({
			error: "Internal server error processing template request",
		});
	}
});

export default router;
