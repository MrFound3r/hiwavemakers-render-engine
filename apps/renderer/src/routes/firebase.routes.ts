// apps/renderer/src/routes/firebase.routes.ts

import { Router } from "express";
import * as admin from "firebase-admin";
import axios from "axios";

const router = Router();

router.post("/send-template", async (req, res) => {
	try {
		const {
			mode = "create",
			currentUserId,
			templateId,
			webServiceDomain,
			templateData,
			recipients: recipientsInput,
			requestId: existingRequestId,
			requestYear: existingRequestYear,
		} = req.body;

		if (!currentUserId || !templateId || !webServiceDomain || !templateData) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		if (!Array.isArray(recipientsInput) || recipientsInput.length === 0) {
			return res.status(400).json({ error: "No valid recipients provided" });
		}

		const db = admin.firestore();
		const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

		let requestId: string;
		let requestYear: string;

		if (mode === "reuse") {
			if (!existingRequestId || !existingRequestYear) {
				return res.status(400).json({
					error: "Reuse mode requires requestId and requestYear",
				});
			}

			requestId = existingRequestId;
			requestYear = existingRequestYear;
		} else {
			const date = new Date();
			requestYear = date.getFullYear().toString();

			const requestRef = db.collection("refs").doc();
			requestId = requestRef.id;
		}

		const recipients = recipientsInput.map((recipient: any) => {
			const templatePathUrl = `${webServiceDomain}/videos/${requestYear}/${currentUserId}/${requestId}/${recipient.recipientId}`;

			return {
				...recipient.recipientData,
				id: recipient.recipientId,
				templatePath: templatePathUrl,
				videoURL: recipient.videoUrl || "",
				template_thumbnail:
					recipient.thumbnailUrl || templateData.template_thumbnail || "",
			};
		});

		if (mode === "create") {
			const requestMonth = (new Date().getMonth() + 1).toString();

			const batch = db.batch();

			const requestSummaryRef = db
				.collection("requests")
				.doc(currentUserId)
				.collection(requestYear)
				.doc("summary");

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
						orderAlias:
							recipients.length > 1
								? "Template Sent Manually - Bulk"
								: "Template Sent Manually",
					},
				},
			};

			batch.set(requestSummaryRef, requestSummaryData, { merge: true });

			const requestDocRef = db
				.collection("requests")
				.doc(currentUserId)
				.collection(requestYear)
				.doc(requestId);

			const requestDocData = {
				placedOn: serverTimestamp,
				orderDate: serverTimestamp,
				personalization: templateData,
				templateId,
				recipients,
				credits: 0,
				orderAlias:
					recipients.length > 1
						? "Template Sent Manually - Bulk"
						: "Template Sent Manually",
			};

			batch.set(requestDocRef, requestDocData, { merge: true });

			await batch.commit();
		}

		const cloudFunctionUrl =
			"https://us-central1-mrfounder-builder-prototype.cloudfunctions.net/sendHiwaveMakersEmail";

		const emailResults = await Promise.allSettled(
			recipients.map((recipient) =>
				axios.post(cloudFunctionUrl, {
					data: {
						email: recipient.email,
						url: recipient.templatePath,
					},
				})
			)
		);

		const successfulEmails = emailResults.filter(
			(result) => result.status === "fulfilled"
		).length;

		const failedEmails = emailResults.length - successfulEmails;

		res.json({
			success: true,
			mode,
			message:
				mode === "reuse"
					? "Existing template request reused and emails triggered"
					: "Template request created and emails triggered",
			requestId,
			requestYear,
			recipientsQueued: recipients.length,
			emailTriggerSuccessCount: successfulEmails,
			emailTriggerFailureCount: failedEmails,
			recipients: recipients.map((recipient) => ({
				recipientId: recipient.id,
				email: recipient.email,
				templatePath: recipient.templatePath,
			})),
		});
	} catch (error) {
		console.error("❌ Error processing template request:", error);
		res.status(500).json({
			error: "Internal server error processing template request",
		});
	}
});

export default router;
