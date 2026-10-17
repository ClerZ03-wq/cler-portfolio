import type { GitHubUser } from "../types/portfolio";

export function AdminBar({
  user,
  mode,
  hasUnsavedChanges,
  isSaving,
  onToggleMode,
  onSaveToGitHub,
  onDiscardChanges,
  onLogout,
}: {
  user: GitHubUser | null;
  mode: "edit" | "preview";
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onToggleMode: () => void;
  onSaveToGitHub: () => void;
  onDiscardChanges: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="admin-dock" aria-label="Admin Control Bar">
      <div className="admin-dock-inner">
        {/* User Identity */}
        <div className="admin-dock-user">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.login} className="admin-dock-avatar" />
          ) : (
            <span className="admin-dock-avatar-placeholder">ADM</span>
          )}
          <div className="admin-dock-user-info">
            <span className="admin-dock-name">@{user?.login || "Admin"}</span>
            <span className="admin-dock-badge">Authorized Maintainer</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="admin-dock-status">
          {hasUnsavedChanges ? (
            <span className="admin-status-pill pill-dirty" title="Changes saved in local browser draft, not yet committed to GitHub">
              <span className="status-pulse-dot" />
              <span>Unsaved Draft</span>
            </span>
          ) : (
            <span className="admin-status-pill pill-clean" title="Local draft is synced with GitHub repository">
              <span className="status-solid-dot" />
              <span>Synced with GitHub</span>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="admin-dock-actions">
          {/* Mode Switcher */}
          <button
            type="button"
            className={`admin-dock-btn ${mode === "edit" ? "btn-active" : ""}`}
            onClick={onToggleMode}
            title={mode === "edit" ? "Hide edit pencils & preview site" : "Show edit controls"}
          >
            {mode === "edit" ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Mode</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Preview Mode</span>
              </>
            )}
          </button>

          {/* Discard draft if dirty */}
          {hasUnsavedChanges && (
            <button
              type="button"
              className="admin-dock-btn btn-ghost"
              onClick={onDiscardChanges}
              disabled={isSaving}
              title="Discard local draft and reload from GitHub"
            >
              <span>Discard</span>
            </button>
          )}

          {/* Commit to GitHub */}
          <button
            type="button"
            className={`admin-dock-btn btn-commit ${hasUnsavedChanges ? "btn-glow" : ""}`}
            onClick={onSaveToGitHub}
            disabled={isSaving}
            title="Commit changes directly to GitHub repository"
          >
            {isSaving ? (
              <>
                <span className="admin-spinner admin-spinner-small" aria-hidden="true" />
                <span>Committing to GitHub...</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Commit to GitHub</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            className="admin-dock-btn btn-logout"
            onClick={onLogout}
            title="Exit Admin Mode"
            aria-label="Logout"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
