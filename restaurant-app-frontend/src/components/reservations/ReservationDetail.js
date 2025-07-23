// src/components/reservations/ReservationDetail.js
// ---------------------------------------------------------------------
// ReservationDetail Component
// ---------------------------------------------------------------------
// Fetches and displays detailed information for a single reservation.
// Provides actions to confirm, cancel, or delete the reservation,
// as well as a link to go back to the reservation list.
// Utilizes React hooks for state, React Router for navigation,
// date-fns for formatting, and toast notifications for feedback.
// ---------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import LoadingSpinner from "../common/LoadingSpinner";
import { reservationService } from "../../services/reservationService";
import "./ReservationDetail.css";

/**
 * ReservationDetail
 * A detail view for one reservation. Reads reservation `id` from URL,
 * fetches data from the API, and displays all fields in a styled layout.
 * Also provides buttons to confirm, cancel, or delete the reservation.
 * @returns {JSX.Element}
 */
const ReservationDetail = () => {
	// Extract `id` parameter from URL and get navigate function
	const { id } = useParams();
	const navigate = useNavigate();

	// Local state: reservation data, loading and error flags
	const [reservation, setReservation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch reservation data on mount or when `id` changes
	useEffect(() => {
		const fetchReservation = async () => {
			try {
				setLoading(true);
				const response = await reservationService.getReservation(id);
				setReservation(response.data.attributes);
			} catch (err) {
				setError(err.message || "Failed to load reservation");
				toast.error(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchReservation();
	}, [id]);

	// Handler: Confirm reservation
	const handleConfirm = async () => {
		try {
			await reservationService.confirmReservation(id);
			toast.success("Reservation confirmed");
			navigate("/reservations");
		} catch (err) {
			toast.error(err.message);
		}
	};

	// Handler: Cancel reservation
	const handleCancel = async () => {
		if (window.confirm("Are you sure you want to cancel this reservation?")) {
			try {
				await reservationService.cancelReservation(id);
				toast.success("Reservation cancelled");
				navigate("/reservations");
			} catch (err) {
				toast.error(err.message);
			}
		}
	};

	// Handler: Delete reservation
	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this reservation?")) {
			try {
				await reservationService.deleteReservation(id);
				toast.success("Reservation deleted");
				navigate("/reservations");
			} catch (err) {
				toast.error(err.message);
			}
		}
	};

	// Show loading spinner while fetching
	if (loading) {
		return <LoadingSpinner message="Loading reservation..." />;
	}

	// Show error message if fetch failed
	if (error) {
		return <div className="alert alert-danger">Error: {error}</div>;
	}

	// Destructure reservation fields for rendering
	const {
		customer_name,
		customer_email,
		customer_phone,
		party_size,
		reservation_date,
		status,
		special_requests,
		can_be_cancelled,
	} = reservation;

	return (
		<div className="reservation-detail">
			{/* Title and status badge */}
			<div className="detail-header">
				<h1>{customer_name}</h1>
				<span className={`status-badge status-${status}`}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</span>
			</div>

			{/* Date & Time and Party Size */}
			<div className="detail-info">
				<p>
					<strong>Date:</strong>{" "}
					{format(parseISO(reservation_date), "EEEE, MMMM d, yyyy")}
				</p>
				<p>
					<strong>Time:</strong> {format(parseISO(reservation_date), "h:mm a")}
				</p>
				<p>
					<strong>Party Size:</strong> {party_size}{" "}
					{party_size === 1 ? "person" : "people"}
				</p>
			</div>

			{/* Contact Details */}
			<div className="detail-contact">
				<p>
					<strong>Email:</strong> {customer_email}
				</p>
				<p>
					<strong>Phone:</strong> {customer_phone}
				</p>
			</div>

			{/* Special Requests Section (if any) */}
			{special_requests && (
				<div className="detail-requests">
					<h3>Special Requests</h3>
					<p>{special_requests}</p>
				</div>
			)}

			{/* Action Buttons */}
			<div className="detail-actions">
				{/* Edit navigates back to form */}
				<button
					type="button"
					className="btn btn-secondary"
					onClick={() => navigate(`/reservations/${id}/edit`)}
				>
					Edit
				</button>
				{/* Confirm only if pending */}
				{status === "pending" && (
					<button
						type="button"
						className="btn btn-success"
						onClick={handleConfirm}
					>
						Confirm
					</button>
				)}
				{/* Cancel if cancellable */}
				{can_be_cancelled && (
					<button
						type="button"
						className="btn btn-warning"
						onClick={handleCancel}
					>
						Cancel
					</button>
				)}
				{/* Always allow delete */}
				<button type="button" className="btn btn-danger" onClick={handleDelete}>
					Delete
				</button>
				{/* Back to list */}
				<button
					type="button"
					className="btn btn-link"
					onClick={() => navigate("/reservations")}
				>
					Back to Reservations
				</button>
			</div>
		</div>
	);
};

export default ReservationDetail;
