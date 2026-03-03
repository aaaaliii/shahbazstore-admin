"use client";

import { useEffect, useState } from "react";
import ReviewsClient from "./ReviewsClient";
import { reviewsApi, Review } from "../../../lib/api/reviews.api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const reviewsData = await reviewsApi.getAll();
        setReviews(reviewsData.reviews || []);
      } catch (error: any) {
        console.error('Error fetching reviews:', error);
        console.error('Error details:', error.response?.data || error.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reviews...</div>
      </div>
    );
  }

  return (
    <ReviewsClient
      initialReviews={reviews}
    />
  );
}
