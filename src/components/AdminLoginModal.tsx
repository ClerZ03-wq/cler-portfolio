import { useState, type FormEvent, useEffect, useRef } from "react";
import { validateGitHubToken } from "../services/githubService";
import type { GitHubUser } from "../types/portfolio";

export function AdminLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: GitHubUser, remember: boolean) => void;
}) {
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState<GitHubUser | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setAuthenticatedUser(null);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter your GitHub token.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await validateGitHubToken(token.trim());

    if (!result.valid || !result.user) {
      setLoading(false);
      setError(result.error || "Authentication failed. Check your GitHub token.");
      return;
    }

    setAuthenticatedUser(result.user);
    setLoading(false);

    // Smooth delay so user sees their authenticated profile
    setTimeout(() => {
      onSuccess(token.trim(), result.user!, remember);
      onClose();
    }, 1200);
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <div className="admin-modal-card">
        <button
          className="admin-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          &times;
        </button>

        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 id="admin-login-title" className="admin-modal-title">Admin Terminal</h2>
            <p className="admin-modal-subtitle">Authenticate to manage content, upload images, and commit changes.</p>
          </div>
        </div>

        {authenticatedUser ? (
          <div className="admin-login-success">
            <div className="success-avatar-ring">
              <img
                src={authenticatedUser.avatar_url}
                alt={authenticatedUser.login}
                className="success-avatar"
              />
              <span className="success-badge">✓</span>
            </div>
            <h3>Access Granted</h3>
            <p>Welcome back, <strong>@{authenticatedUser.login}</strong>!</p>
            <span className="admin-pulse-bar" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-input-group">
              <label htmlFor="github-pat-token">GitHub Personal Access Token (PAT)</label>
              <div className="admin-password-field">
                <input
                  ref={inputRef}
                  id="github-pat-token"
                  type={showPassword ? "text" : "password"}
                  placeholder="github_pat_11A... or ghp_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className="admin-visibility-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide token" : "Show token"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="admin-checkbox-row">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember token on this browser</span>
              </label>

              <button
                type="button"
                className="admin-help-link"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? "Hide token guide" : "Need a token?"}
              </button>
            </div>

            {showInstructions && (
              <div className="admin-instructions-box">
                <h4>How to get a GitHub Personal Access Token:</h4>
                <ol>
                  <li>Go to <strong>GitHub</strong> ➔ <strong>Settings</strong> ➔ <strong>Developer Settings</strong> ➔ <strong>Personal access tokens</strong> (or <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">click here</a>).</li>
                  <li>Click <strong>Generate new token (classic)</strong> or <strong>Fine-grained</strong>.</li>
                  <li>Grant <code>repo</code> scope (Full control of private repositories) or <code>Contents: Read and write</code>.</li>
                  <li>Copy the generated token and paste it above!</li>
                </ol>
              </div>
            )}

            {error && (
              <div className="admin-error-box" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="admin-actions-row">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="admin-spinner" aria-hidden="true" />
                    <span>Connecting to GitHub...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Admin Mode</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
