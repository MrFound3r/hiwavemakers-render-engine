"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Types matching our Express database structure
interface Student {
	id: number;
	room_uuid: string;
	student_uuid: string;
	name: string;
	email: string | null;
	videos: string[];
	render_status: string | null;
	render_url: string | null;
	created_at: string;
}

interface Room {
	room_uuid: string;
}

export default function Dashboard() {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
	const [students, setStudents] = useState<Student[]>([]);

	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [emailInput, setEmailInput] = useState("");
	const [isSendingEmail, setIsSendingEmail] = useState(false);

	const API_BASE_URL = "http://localhost:4000";

	useEffect(() => {
		axios
			.get(`${API_BASE_URL}/students/rooms`)
			.then((res) => {
				if (Array.isArray(res.data)) {
					setRooms(res.data);
				} else {
					console.error("⚠️ Expected an array of rooms, but the server sent:", res.data);
					setRooms([]);
				}
			})
			.catch((err) => console.error("Error fetching rooms:", err));
	}, []);

	useEffect(() => {
		if (!selectedRoom) return;

		setIsLoading(true);
		axios
			.get(`${API_BASE_URL}/students/room/${selectedRoom}`)
			.then((res) => setStudents(res.data))
			.catch((err) => console.error("Error fetching students:", err))
			.finally(() => setIsLoading(false));
	}, [selectedRoom]);

	const refreshStudents = async () => {
		if (!selectedRoom) return;

		setIsRefreshing(true);
		try {
			const res = await axios.get(`${API_BASE_URL}/students/room/${selectedRoom}`);
			setStudents(res.data);
		} catch (err) {
			console.error("Error refreshing students:", err);
		} finally {
			setIsRefreshing(false);
		}
	};

	const triggerRender = async (student: Student) => {
		try {
			// Optimistically set to "pending" since we are enqueuing the job
			setStudents((prev) => prev.map((s) => (s.student_uuid === student.student_uuid ? { ...s, render_status: "pending" } : s)));

			const formattedFragments = (student.videos || []).map((videoUrl, index) => ({
				id: String(`f${index + 1}`),
				order: index + 1,
				src: `${API_BASE_URL}${videoUrl}`,
			}));

			// Axios POST request
			const renderResponse = await axios.post(`${API_BASE_URL}/render`, [
				{
					compositionId: "class-video-v1-portrait",
					inputProps: {
						studentName: student.name,
						fragments: formattedFragments,
						outro: "http://localhost:4000/static/assets/videos/logo-outro.mp4",
						background: {
							src: "http://localhost:4000/static/assets/images/backgrounds/video-frames/bg-color1.jpg",
						},
						backgroundAudio: {
							src: "http://localhost:4000/static/assets/sounds/sound1.mp3",
						},
					},
				},
			]);

			const renderData = renderResponse.data;
			const newRenderId = renderData[0].id;

			// Axios PATCH request
			await axios.patch(`${API_BASE_URL}/students/${student.room_uuid || selectedRoom}/${student.student_uuid}/render-id`, {
				renderId: newRenderId,
			});
		} catch (error) {
			console.error("Render error:", error);
			alert(`Failed to start render for ${student.name}. Check server console.`);
			setStudents((prev) => prev.map((s) => (s.student_uuid === student.student_uuid ? { ...s, render_status: "failed" } : s)));
		}
	};

	// Helper function locked exclusively to the "done" status
	const isRenderFinished = (status: string | null) => {
		if (!status) return false;
		return status.toLowerCase() === "done";
	};

	// Modal Handlers
	const openEmailModal = (student: Student) => {
		setSelectedStudent(student);
		// Autofill email if it exists, otherwise leave blank for user to fill
		setEmailInput(student.email || "");
		setIsModalOpen(true);
	};

	const closeEmailModal = () => {
		setIsModalOpen(false);
		setSelectedStudent(null);
		setEmailInput("");
	};

	const handleSendEmail = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStudent) return;

		setIsSendingEmail(true);

		try {
			// Calling the Firebase Endpoint from previous step with placeholder data
			await axios.post(`${API_BASE_URL}/firebase/send-template`, {
				currentUserId: "hiwave_makers", 
				recipientId: selectedStudent.student_uuid,
				templateId: "template_style_hiwave_makers_1", 
				videoUrl: selectedStudent.render_url,
				webServiceDomain: "https://thisvideosiforyou.com", 
				recipientData: {
					name: selectedStudent.name,
					email: emailInput,
				},
				templateData: {
					template_style: "template_style_hiwave_makers_1",
					template_logo: "https://thisvideosiforyou.com/images/static/hiwave-logo.png",
					template_thumbnail: "https://thisvideosiforyou.com/images/static/thumbnails/hiwave-makers-thumbnail.jpg",
					template_favicon: "https://thisvideosiforyou.com/images/static/clapperboard.png",
					template_headline: `We're So Proud of You, ${selectedStudent.name}`,
					template_message: `${selectedStudent.name}, watching you work through ideas, try again when something didn't work, and light up when it finally did has been amazing. Every project you built shows your creativity, patience, and how much you've grown. This video is a small glimpse of your effort, your curiosity, and the confidence you gained along the way—and we couldn't be more proud of you.`,
					template_sub_message: "",
					call_to_action: "no",
					call_to_action_title:"",
					call_to_action_redirect_link: ""
				},
			});

			alert(`Email successfully queued for ${selectedStudent.name}!`);
			closeEmailModal();
		} catch (error) {
			console.error("Error sending email:", error);
			alert("Failed to send email. Check console for details.");
		} finally {
			setIsSendingEmail(false);
		}
	};

	return (
		<div className='flex h-screen bg-gray-50 text-gray-900'>
			{/* Sidebar: Class/Room List */}
			<div className='w-1/4 bg-white border-r border-gray-200 overflow-y-auto'>
				<div className='p-6 border-b border-gray-200'>
					<h1 className='text-xl font-bold'>Class Dashboard</h1>
				</div>
				<ul className='p-4 space-y-2'>
					{rooms.length === 0 && <p className='text-gray-500 text-sm'>No classes found.</p>}
					{Array.isArray(rooms) &&
						rooms.map((room) => (
							<li key={room.room_uuid}>
								<button
									onClick={() => setSelectedRoom(room.room_uuid)}
									className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
										selectedRoom === room.room_uuid
											? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
											: "hover:bg-gray-100 border border-transparent"
									}`}>
									<div className='truncate'>Class: {room.room_uuid.substring(0, 8)}...</div>
								</button>
							</li>
						))}
				</ul>
			</div>

			{/* Main Content: Student List */}
			<div className='flex-1 overflow-y-auto p-8 relative'>
				{!selectedRoom ? (
					<div className='flex h-full items-center justify-center text-gray-400'>Select a class from the sidebar to view students.</div>
				) : isLoading ? (
					<div className='flex items-center justify-center h-64 text-gray-500'>Loading students...</div>
				) : (
					<div>
						{/* Header Area with the Refresh Button */}
						<div className='flex justify-between items-end mb-8'>
							<div>
								<h2 className='text-2xl font-bold'>Students in Class</h2>
								<p className='text-sm text-gray-500 font-mono mt-1'>{selectedRoom}</p>
							</div>

							<button
								onClick={refreshStudents}
								disabled={isRefreshing}
								className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50'>
								<svg
									className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
								{isRefreshing ? "Refreshing..." : "Refresh Status"}
							</button>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{students.length === 0 && <p className='text-gray-500'>No students joined this class yet.</p>}

							{Array.isArray(students) &&
								students.map((student) => {
									const isFinished = isRenderFinished(student.render_status);
									const isProcessing = student.render_status === "pending" || student.render_status === "processing";

									return (
										<div
											key={student.student_uuid}
											className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between'>
											<div>
												<h3 className='text-lg font-bold'>{student.name}</h3>
												{student.email && <p className='text-sm text-gray-500 mb-4'>{student.email}</p>}

												<div className='mb-4'>
													<span
														className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
															isFinished
																? "bg-green-100 text-green-800"
																: isProcessing
																	? "bg-yellow-100 text-yellow-800"
																	: student.render_status === "failed"
																		? "bg-red-100 text-red-800"
																		: "bg-gray-100 text-gray-800"
														}`}>
														Status: {student.render_status || "Not rendered"}
													</span>
												</div>

												<div className='mb-6 text-sm text-gray-600'>
													<p>Videos Recorded: {Array.isArray(student.videos) ? student.videos.length : 0}</p>
												</div>
											</div>

											{/* Action Buttons Container */}
											<div className='mt-auto space-y-2 flex flex-col pt-4 border-t border-gray-100'>
												{student.render_url && (
													<a
														href={student.render_url}
														target='_blank'
														rel='noopener noreferrer'
														className='w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'>
														<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth='2'
																d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'></path>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth='2'
																d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
														</svg>
														Watch Final Video
													</a>
												)}

												{/* DYNAMIC BUTTON LOGIC */}
												{isProcessing ? (
													<button
														disabled
														className='w-full font-medium py-2 px-4 rounded-lg transition-colors mt-auto bg-gray-200 text-gray-500 cursor-not-allowed'>
														{student.render_status === "pending" ? "Pending..." : "Processing..."}
													</button>
												) : isFinished ? (
													<button
														onClick={() => openEmailModal(student)}
														className='w-full font-medium py-2 px-4 rounded-lg transition-colors mt-auto bg-indigo-600 text-white hover:bg-indigo-700'>
														Send Email
													</button>
												) : (
													<button
														onClick={() => triggerRender(student)}
														className='w-full font-medium py-2 px-4 rounded-lg transition-colors mt-auto bg-blue-600 text-white hover:bg-blue-700'>
														Render
													</button>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
				)}

				{/* Email Popup Modal */}
				{isModalOpen && selectedStudent && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
						<div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden'>
							<div className='p-6 border-b border-gray-100'>
								<h3 className='text-xl font-bold text-gray-900'>Send Video to Student</h3>
								<p className='text-sm text-gray-500 mt-1'>Sending finalized video to {selectedStudent.name}.</p>
							</div>

							<form onSubmit={handleSendEmail} className='p-6'>
								<div className='mb-6'>
									<label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
										Email Address
									</label>
									<input
										type='email'
										id='email'
										required
										value={emailInput}
										onChange={(e) => setEmailInput(e.target.value)}
										className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors'
										placeholder='student@example.com'
									/>
								</div>

								<div className='flex justify-end gap-3'>
									<button
										type='button'
										onClick={closeEmailModal}
										disabled={isSendingEmail}
										className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50'>
										Cancel
									</button>
									<button
										type='submit'
										disabled={isSendingEmail}
										className='flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-75'>
										{isSendingEmail ? (
											<>
												<svg className='w-4 h-4 animate-spin text-white' fill='none' viewBox='0 0 24 24'>
													<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
													<path
														className='opacity-75'
														fill='currentColor'
														d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
												</svg>
												Sending...
											</>
										) : (
											"Send Email"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
