import Feedback, { IFeedback } from "../models/feedback";
import { analyzeFeedbackWithGemini } from "../services/gemini.service";

import { Request, Response } from "express";

export const postFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({
        success: false,
        message: "title, description, and category are required",
      });
      return;
    }

    const feedback = await Feedback.create({
      title,
      description,
      category,
      submitterName,
      submitterEmail,
    });

    const aiResult = await analyzeFeedbackWithGemini({
      title,
      description,
      category,
    });

    if (aiResult) {
      feedback.ai_category = aiResult.category;
      feedback.ai_sentiment = aiResult.sentiment;
      feedback.ai_priority = aiResult.priority_score;
      feedback.ai_summary = aiResult.summary;
      feedback.ai_tags = aiResult.tags;
      feedback.ai_processed = true;
      await feedback.save();
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const sortBy = (req.query.sortBy as string | undefined) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const allowedSortFields = new Set(["createdAt", "ai_priority", "status", "category"]);
    const finalSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .sort({ [finalSortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { status: status ?? null, category: category ?? null },
      sort: { sortBy: finalSortBy, sortOrder: sortOrder === 1 ? "asc" : "desc" },
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Server error" });
  }
};