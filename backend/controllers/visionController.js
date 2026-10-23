const FASTAPI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Forward image buffer to FastAPI for Azure Computer Vision text extraction
const extractText = async (req, res) => {
  try {
    // If multipart/form-data forwarded or binary image
    const fastApiResponse = await fetch(`${FASTAPI_URL}/api/v1/vision/extract-text`, {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"],
      },
      body: req, // stream request body directly
      duplex: "half",
    });

    const data = await fastApiResponse.json();
    return res.status(fastApiResponse.status).json(data);
  } catch (error) {
    console.error("[Vision Controller Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to connect to AI Vision Service on port 8000",
    });
  }
};

// Forward image stream to FastAPI for full analysis (OCR + AI Humanization)
const analyzePrescription = async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fastApiResponse = await fetch(`${FASTAPI_URL}/api/v1/vision/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"],
      },
      body: req,
      duplex: "half",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await fastApiResponse.json();
    return res.status(fastApiResponse.status).json(data);
  } catch (error) {
    console.error("[Vision Controller Analyze Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to connect to AI Vision Service on port 8000 or request timed out",
    });
  }
};

module.exports = {
  extractText,
  analyzePrescription,
};
