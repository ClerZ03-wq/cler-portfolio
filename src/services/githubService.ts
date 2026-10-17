import type { GitHubConfig, GitHubUser, PortfolioData } from "../types/portfolio";

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(str: string): string {
  const binary = atob(str.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function validateGitHubToken(token: string): Promise<{
  valid: boolean;
  user?: GitHubUser;
  error?: string;
}> {
  if (!token || token.trim().length < 10) {
    return { valid: false, error: "Please enter a valid GitHub Personal Access Token." };
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 401) {
      return { valid: false, error: "Invalid or expired GitHub token. Check token permissions." };
    }

    if (!response.ok) {
      return { valid: false, error: `GitHub API error (${response.status}): ${response.statusText}` };
    }

    const data = await response.json();
    return {
      valid: true,
      user: {
        login: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
      },
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Network error connecting to GitHub API.",
    };
  }
}

export async function fetchRepoData(
  config: GitHubConfig,
  token?: string
): Promise<{ sha?: string; data?: PortfolioData; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.dataPath}?ref=${config.branch}&_t=${Date.now()}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return { error: `Could not fetch repo data: status ${response.status}` };
    }

    const result = await response.json();
    const decoded = base64ToUtf8(result.content);
    const parsed = JSON.parse(decoded) as PortfolioData;

    return {
      sha: result.sha,
      data: parsed,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to parse data from GitHub repository.",
    };
  }
}

export async function commitPortfolioData(
  config: GitHubConfig,
  token: string,
  data: PortfolioData,
  sha?: string,
  message?: string
): Promise<{ success: boolean; sha?: string; error?: string }> {
  try {
    let currentSha = sha;
    if (!currentSha) {
      const existing = await fetchRepoData(config, token);
      if (existing.sha) {
        currentSha = existing.sha;
      }
    }

    const jsonString = JSON.stringify(data, null, 2);
    const base64Content = utf8ToBase64(jsonString);

    const payload: {
      message: string;
      content: string;
      branch: string;
      sha?: string;
    } = {
      message: message || "Update portfolio content via Admin Dashboard ✨",
      content: base64Content,
      branch: config.branch || "main",
    };

    if (currentSha) {
      payload.sha = currentSha;
    }

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.dataPath}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `Failed to commit to GitHub (HTTP ${response.status})`,
      };
    }

    return {
      success: true,
      sha: result.content?.sha,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error saving to GitHub repository.",
    };
  }
}

export async function uploadImageToGitHub(
  config: GitHubConfig,
  token: string,
  file: File
): Promise<{
  success: boolean;
  path?: string;
  rawUrl?: string;
  previewUrl?: string;
  sha?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read the selected file." });
    };

    reader.onload = async () => {
      try {
        const fullDataUrl = reader.result as string;
        // Strip data:image/...;base64,
        const base64Content = fullDataUrl.split(",")[1];
        if (!base64Content) {
          resolve({ success: false, error: "Could not extract base64 data from file." });
          return;
        }

        const cleanName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9.]/g, "-")
          .replace(/-+/g, "-");
        const filename = `${Date.now()}-${cleanName}`;
        const targetPath = `${config.uploadsFolder}/${filename}`;

        const payload = {
          message: `Upload asset ${filename} via Admin Dashboard 🖼️`,
          content: base64Content,
          branch: config.branch || "main",
        };

        const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${targetPath}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          resolve({
            success: false,
            error: result.message || `Upload failed with status ${response.status}`,
          });
          return;
        }

        // The path on the deployed site will be /uploads/{filename} (because public/ is Vite's root)
        const sitePath = `/uploads/${filename}`;
        // Direct raw github URL so it works immediately without waiting for GitHub actions build!
        const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${targetPath}`;

        resolve({
          success: true,
          path: sitePath,
          rawUrl,
          previewUrl: fullDataUrl,
          sha: result.content?.sha,
        });
      } catch (err) {
        resolve({
          success: false,
          error: err instanceof Error ? err.message : "Failed to upload asset to GitHub.",
        });
      }
    };

    reader.readAsDataURL(file);
  });
}
