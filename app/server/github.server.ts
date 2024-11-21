import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getRepoInfo = async (url: string) => {
  try {
    const { owner, repo } = parseRepoUrl(url);
    const response = await octokit.request(`GET /repos/${owner}/${repo}`, {
      owner,
      repo: repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error("error", error);
    return null;
  }
};

const parseRepoUrl = (url: string) => {
  const parsedUrl = new URL(url);
  const owner = parsedUrl.pathname.split("/")[1];
  const repo = parsedUrl.pathname.split("/")[2];
  return { owner, repo };
};
