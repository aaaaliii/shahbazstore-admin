"use client";

import { useState, useEffect } from "react";
import { reviewsApi, Review } from "../../../lib/api/reviews.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewsClientProps {
  initialReviews: Review[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const refreshReviews = async () => {
    try {
      const reviewsData = await reviewsApi.getAll();
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await reviewsApi.approve(id);
      // Refresh reviews to get updated data
      await refreshReviews();
      toast.success("Review approved!");
      refreshReviews();
    } catch (err) {
      toast.error("Failed to approve review");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Reviews Management
        </h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No reviews yet.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {review.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{review.customerName}</div>
                    <div className="text-xs text-gray-400">
                      {review.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.rating} ★
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                    title={review.comment}
                  >
                    {review.comment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {review.status === "pending" && (
                      <button
                        onClick={() => handleApprove(review.id!)}
                        disabled={approvingId === review.id}
                        className="text-custom-blue hover:text-custom-blue-light disabled:opacity-50"
                      >
                        {approvingId === review.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
