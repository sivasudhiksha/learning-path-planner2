import axios from "axios";

export const verifyGithubRepo = async (req, res) => {
  try {
    const { githubLink } = req.body;
    if (!githubLink) return res.status(400).json({ message: "GitHub link required" });

    // Extract owner and repo from link
    const parts = githubLink.replace("https://github.com/", "").split("/");
    if (parts.length < 2) return res.status(400).json({ message: "Invalid GitHub link" });

    const owner = parts[0];
    const repo = parts[1].replace(".git", "");

    // Verify Repo Existence
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoResponse = await axios.get(repoUrl);

    // Verify Commits
    const commitsUrl = `${repoUrl}/commits`;
    const commitsResponse = await axios.get(commitsUrl);

    res.status(200).json({
      message: "GitHub Repository Verified",
      data: {
        name: repoResponse.data.name,
        description: repoResponse.data.description,
        commitsCount: commitsResponse.data.length,
        isValid: commitsResponse.data.length > 0,
      },
    });
  } catch (error) {
    res.status(404).json({ message: "GitHub Repository not found or private", error: error.message });
  }
};
