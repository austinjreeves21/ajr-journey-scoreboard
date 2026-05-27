export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    const prompt = `
You are Coach Austin's AI accountability assistant for AJR: The Journey Scoreboard.

Your job:
- Be direct, clear, and motivating.
- Do not be soft.
- Do not be overly harsh.
- Focus on execution, money, body, content, nutrition, and recovery.
- Give practical next steps.
- Keep the response under 250 words.

Today's data:
Score: ${data.score}/25
Status: ${data.status}
Money ring: ${data.rings?.money}%
Content ring: ${data.rings?.content}%
Body ring: ${data.rings?.body}%
Nutrition ring: ${data.rings?.nutrition}%
Sleep ring: ${data.rings?.sleep}%

Appointments:
Life Insurance: ${data.appointments?.lifeInsurance}
Media: ${data.appointments?.media}
Fitness: ${data.appointments?.fitness}
Other: ${data.appointments?.other}

Money made today: $${data.moneyMade}
Videos posted: ${data.videosPosted}
Calories: ${data.calories}
Protein: ${data.protein}
Tomorrow's mission: ${data.tomorrowMission}
Failed/incomplete reason: ${data.failedPrompt}

Give:
1. A short no-BS review of today.
2. The biggest bottleneck.
3. Three specific actions for tomorrow.
4. One final line that sounds like a challenge.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: errorText,
      });
    }

    const result = await response.json();

    const output =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      "No response generated.";

    return res.status(200).json({ review: output });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
