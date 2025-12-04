"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSubmit?: () => void;
}

export function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API route for submitting reviews
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (response.ok) {
        setRating(0);
        setComment("");
        onSubmit?.();
        // Refresh the page to show the new review
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
      <h3 className="text-lg font-semibold">Write a Review</h3>
      
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {comment.length}/1000 characters
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}

