import { useState, useEffect, type ChangeEvent } from "react";
import type {
  AboutData,
  AchievementCard,
  ContactData,
  CredentialItem,
  GitHubConfig,
  HeroData,
  ProjectItem,
  SkillItem,
} from "../types/portfolio";
import { uploadImageToGitHub } from "../services/githubService";
import { resolveAssetUrl } from "../utils/assetResolver";

function GitHubImageUploader({
  label,
  value,
  onChange,
  token,
  config,
  onNotify,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  token?: string;
  config: GitHubConfig;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      onNotify("GitHub token is required to upload files to your repository.", "error");
      return;
    }

    setUploading(true);
    onNotify(`Uploading ${file.name} to GitHub repository...`, "info");

    const result = await uploadImageToGitHub(config, token, file);
    setUploading(false);

    if (result.success && result.rawUrl) {
      // Use rawUrl so it displays immediately across all devices,
      // and upon next git build / deploy, path /uploads/... will also be permanent
      onChange(result.rawUrl);
      onNotify(`Image uploaded to GitHub storage successfully! 🖼️`, "success");
    } else {
      onNotify(result.error || "Failed to upload image to GitHub.", "error");
    }
  };

  const preview = resolveAssetUrl(value);

  return (
    <div className="admin-field-group">
      <label>{label}</label>
      <div className="admin-image-upload-box">
        <div className="admin-image-preview-thumb">
          {preview ? (
            <img src={preview} alt="Asset preview" />
          ) : (
            <div className="admin-image-placeholder">No Image</div>
          )}
        </div>
        <div className="admin-image-inputs">
          <input
            type="text"
            className="admin-input-text"
            placeholder="asset:name, /uploads/file.png, or https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="admin-upload-btn-row">
            <label className={`admin-btn-file-upload ${uploading ? "disabled" : ""}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{uploading ? "Uploading to GitHub..." : "Upload from Computer ➔ GitHub"}</span>
            </label>
            <small className="admin-upload-note">Saves directly into your GitHub repo (`{config.uploadsFolder}`)</small>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// EDIT HERO MODAL
// ----------------------------------------------------
export function EditHeroModal({
  isOpen,
  data,
  onSave,
  onClose,
  token,
  config,
  onNotify,
}: {
  isOpen: boolean;
  data: HeroData;
  onSave: (updated: HeroData) => void;
  onClose: () => void;
  token?: string;
  config: GitHubConfig;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [formData, setFormData] = useState<HeroData>(data);
  const [rolesStr, setRolesStr] = useState(data.roles.join(", "));

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRoles = rolesStr
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    onSave({
      ...formData,
      roles: updatedRoles.length > 0 ? updatedRoles : formData.roles,
    });
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-wide">
        <button className="admin-modal-close" type="button" onClick={onClose}>&times;</button>
        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="admin-modal-title">Edit Hero & Identity</h2>
            <p className="admin-modal-subtitle">Update your headline, roles, bio summary, location, and portrait.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="admin-edit-form">
          <div className="admin-form-grid">
            <div className="admin-field-group">
              <label>Full Name</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Status Pill</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.statusText}
                onChange={(e) => setFormData({ ...formData, statusText: e.target.value })}
                placeholder="e.g. Open to internships & opportunities"
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Roles (comma-separated)</label>
              <input
                type="text"
                className="admin-input-text"
                value={rolesStr}
                onChange={(e) => setRolesStr(e.target.value)}
                placeholder="Web Developer, Security Analyst, Backend Programmer"
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Hero Description</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Location</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="admin-field-group">
              <label>Education</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </div>

            <div className="admin-field-group full-width">
              <GitHubImageUploader
                label="Portrait Image (stored on GitHub)"
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                token={token}
                config={config}
                onNotify={onNotify}
              />
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// EDIT ABOUT MODAL
// ----------------------------------------------------
export function EditAboutModal({
  isOpen,
  data,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  data: AboutData;
  onSave: (updated: AboutData) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<AboutData>(data);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateAchievement = (index: number, updated: AchievementCard) => {
    const list = [...formData.achievements];
    list[index] = updated;
    setFormData({ ...formData, achievements: list });
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-wide">
        <button className="admin-modal-close" type="button" onClick={onClose}>&times;</button>
        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <h2 className="admin-modal-title">Edit About & Achievements</h2>
            <p className="admin-modal-subtitle">Modify your engineering journey, philosophy, and milestone cards.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="admin-edit-form">
          <div className="admin-form-grid">
            <div className="admin-field-group">
              <label>Section Title</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Caption Kicker</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Lead Paragraph</label>
              <textarea
                className="admin-textarea"
                rows={2}
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Full Story / Bio</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>North Star Quote</label>
              <input
                type="text"
                className="admin-input-text"
                value={formData.northStarQuote}
                onChange={(e) => setFormData({ ...formData, northStarQuote: e.target.value })}
                required
              />
            </div>

            {/* Achievement cards */}
            <div className="admin-field-group full-width">
              <label>Achievement Milestone Cards</label>
              <div className="admin-card-list">
                {formData.achievements.map((ach, idx) => (
                  <div key={ach.id} className="admin-card-item">
                    <input
                      type="text"
                      className="admin-input-text"
                      placeholder="Title (e.g. Dean's Lister)"
                      value={ach.title}
                      onChange={(e) => updateAchievement(idx, { ...ach, title: e.target.value })}
                    />
                    <input
                      type="text"
                      className="admin-input-text"
                      placeholder="Badge Tag (e.g. Academic Distinction)"
                      value={ach.badge}
                      onChange={(e) => updateAchievement(idx, { ...ach, badge: e.target.value })}
                    />
                    <input
                      type="text"
                      className="admin-input-text"
                      placeholder="Subtitle (e.g. University of Makati)"
                      value={ach.subtitle}
                      onChange={(e) => updateAchievement(idx, { ...ach, subtitle: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// EDIT PROJECTS MODAL
// ----------------------------------------------------
export function EditProjectsModal({
  isOpen,
  projects,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  projects: ProjectItem[];
  onSave: (updated: ProjectItem[]) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ProjectItem[]>(projects);
  const [editingId, setEditingId] = useState<string | null>(items[0]?.id || null);

  if (!isOpen) return null;

  const currentProject = items.find((p) => p.id === editingId) || items[0];

  const updateCurrentProject = (patch: Partial<ProjectItem>) => {
    if (!currentProject) return;
    setItems((prev) =>
      prev.map((item) => (item.id === currentProject.id ? { ...item, ...patch } : item))
    );
  };

  const handleAddNew = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      number: String(items.length + 1).padStart(2, "0"),
      title: "New Project",
      eyebrow: "Architecture & Systems",
      client: "Enterprise Client",
      date: "2026 — Present",
      role: "Lead Developer",
      copy: "Brief summary description of the problem solved and the architectural impact.",
      details: ["Architected solution...", "Secured baseline controls..."],
      tags: ["Full-Stack", "Security", "Cloud"],
      icon: "terminal",
      accent: "cyan",
    };
    setItems([...items, newProj]);
    setEditingId(newProj.id);
  };

  const handleDelete = (id: string) => {
    if (items.length <= 1) {
      alert("You must keep at least one project showcase.");
      return;
    }
    const filtered = items.filter((p) => p.id !== id);
    setItems(filtered);
    setEditingId(filtered[0]?.id || null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(items);
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-wide admin-modal-projects">
        <button className="admin-modal-close" type="button" onClick={onClose}>&times;</button>
        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <h2 className="admin-modal-title">Manage Featured Projects</h2>
            <p className="admin-modal-subtitle">Add, edit, or remove featured engineering case studies.</p>
          </div>
        </div>

        <div className="admin-projects-master-detail">
          {/* Project Sidebar Tabs */}
          <div className="admin-projects-tabs">
            <div className="admin-projects-tab-list">
              {items.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  className={`admin-proj-tab ${proj.id === editingId ? "active" : ""}`}
                  onClick={() => setEditingId(proj.id)}
                >
                  <span className="tab-num">{proj.number}</span>
                  <span className="tab-title">{proj.title}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="admin-btn-add-item"
              onClick={handleAddNew}
            >
              + Add New Project
            </button>
          </div>

          {/* Form details for selected project */}
          {currentProject && (
            <form onSubmit={handleSave} className="admin-project-detail-form">
              <div className="admin-detail-header-row">
                <span className="admin-detail-title-tag">Editing: {currentProject.title}</span>
                <button
                  type="button"
                  className="admin-btn-delete-item"
                  onClick={() => handleDelete(currentProject.id)}
                >
                  Delete Project
                </button>
              </div>

              <div className="admin-form-grid">
                <div className="admin-field-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="admin-input-text"
                    value={currentProject.title}
                    onChange={(e) => updateCurrentProject({ title: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field-group">
                  <label>Eyebrow Tagline</label>
                  <input
                    type="text"
                    className="admin-input-text"
                    value={currentProject.eyebrow}
                    onChange={(e) => updateCurrentProject({ eyebrow: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field-group">
                  <label>Client / Organization</label>
                  <input
                    type="text"
                    className="admin-input-text"
                    value={currentProject.client}
                    onChange={(e) => updateCurrentProject({ client: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field-group">
                  <label>Date Period</label>
                  <input
                    type="text"
                    className="admin-input-text"
                    value={currentProject.date}
                    onChange={(e) => updateCurrentProject({ date: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field-group full-width">
                  <label>Role</label>
                  <input
                    type="text"
                    className="admin-input-text"
                    value={currentProject.role}
                    onChange={(e) => updateCurrentProject({ role: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field-group full-width">
                  <label>Card Summary Description</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={currentProject.copy}
                    onChange={(e) => updateCurrentProject({ copy: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field-group full-width">
                  <label>Detailed Bullets (one bullet per line)</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={currentProject.details.join("\n\n")}
                    onChange={(e) =>
                      updateCurrentProject({
                        details: e.target.value
                          .split("\n\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Bullet point 1&#10;&#10;Bullet point 2"
                    required
                  />
                </div>

                <div className="admin-field-group full-width">
                  <label>Tech Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="admin-input-text"
                    value={currentProject.tags.join(", ")}
                    onChange={(e) =>
                      updateCurrentProject({
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    required
                  />
                </div>

                <div className="admin-field-group">
                  <label>Accent Color</label>
                  <select
                    className="admin-select"
                    value={currentProject.accent}
                    onChange={(e) =>
                      updateCurrentProject({ accent: e.target.value as ProjectItem["accent"] })
                    }
                  >
                    <option value="cyan">Cyan (Detect)</option>
                    <option value="gold">Gold (Connect)</option>
                    <option value="violet">Violet (Protect)</option>
                    <option value="emerald">Emerald</option>
                  </select>
                </div>
              </div>

              <div className="admin-actions-row">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Apply Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// EDIT ARSENAL (SKILLS) MODAL
// ----------------------------------------------------
export function EditArsenalModal({
  isOpen,
  arsenal,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  arsenal: SkillItem[];
  onSave: (updated: SkillItem[]) => void;
  onClose: () => void;
}) {
  const [skills, setSkills] = useState<SkillItem[]>(arsenal);

  if (!isOpen) return null;

  const handleAdd = () => {
    const newItem: SkillItem = {
      id: `skill-${Date.now()}`,
      name: "New Skill",
      description: "Capability description",
      monogram: "NS",
      category: "build",
    };
    setSkills([...skills, newItem]);
  };

  const handleUpdate = (index: number, patch: Partial<SkillItem>) => {
    setSkills((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const handleDelete = (index: number) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(skills);
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-wide">
        <button className="admin-modal-close" type="button" onClick={onClose}>&times;</button>
        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <h2 className="admin-modal-title">Edit Technical Arsenal</h2>
            <p className="admin-modal-subtitle">Add or edit frameworks, languages, systems, and tools.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="admin-edit-form">
          <div className="admin-skill-editor-list">
            {skills.map((skill, idx) => (
              <div key={skill.id} className="admin-skill-row">
                <input
                  type="text"
                  className="admin-input-text admin-skill-mono"
                  placeholder="Tag (e.g. DJ)"
                  value={skill.monogram}
                  maxLength={3}
                  onChange={(e) => handleUpdate(idx, { monogram: e.target.value.toUpperCase() })}
                />
                <input
                  type="text"
                  className="admin-input-text admin-skill-name"
                  placeholder="Skill Name (e.g. Django)"
                  value={skill.name}
                  onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  className="admin-input-text admin-skill-desc"
                  placeholder="Role description (e.g. Full-stack web framework)"
                  value={skill.description}
                  onChange={(e) => handleUpdate(idx, { description: e.target.value })}
                  required
                />
                <select
                  className="admin-select admin-skill-cat"
                  value={skill.category || "build"}
                  onChange={(e) =>
                    handleUpdate(idx, { category: e.target.value as SkillItem["category"] })
                  }
                >
                  <option value="build">BUILD</option>
                  <option value="operate">OPERATE</option>
                  <option value="defend">DEFEND</option>
                </select>
                <button
                  type="button"
                  className="admin-row-delete-btn"
                  onClick={() => handleDelete(idx)}
                  title="Remove skill"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="admin-btn-add-item" onClick={handleAdd}>
            + Add Another Skill
          </button>

          <div className="admin-actions-row">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// EDIT CREDENTIALS / BADGES MODAL
// ----------------------------------------------------
// EDIT CREDENTIALS / BADGES MODAL
// ----------------------------------------------------
export function EditCredentialsModal({
  isOpen,
  credentials,
  onSave,
  onClose,
  token,
  config,
  onNotify,
}: {
  isOpen: boolean;
  credentials: CredentialItem[];
  onSave: (updated: CredentialItem[]) => void;
  onClose: () => void;
  token?: string;
  config: GitHubConfig;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [items, setItems] = useState<CredentialItem[]>(credentials);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Sync state whenever modal is opened with fresh credentials
  useEffect(() => {
    if (isOpen) {
      setItems(credentials);
    }
  }, [credentials, isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const newItem: CredentialItem = {
      id: `cred-${Date.now()}`,
      name: "New Certification",
      short: "CERT",
      issuer: "Credential Authority",
      category: "Cybersecurity",
      image: "asset:ibmSecurityOperations",
      verifyUrl: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdate = (index: number, patch: Partial<CredentialItem>) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const handleDelete = (index: number) => {
    if (items.length <= 1) {
      alert("You must keep at least one credential item.");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= items.length ||
      toIdx >= items.length
    ) {
      return;
    }
    setItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      const movedItem = items[draggedIdx];
      moveItem(draggedIdx, targetIndex);
      onNotify(`Moved "${movedItem?.name || "Credential"}" to position #${targetIndex + 1}`, "info");
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(items);
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-wide">
        <button className="admin-modal-close" type="button" onClick={onClose}>&times;</button>
        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h2 className="admin-modal-title">Edit Credentials & Badges</h2>
            <p className="admin-modal-subtitle">Reorder badges to choose what goes first and last. Upload custom badge artwork directly to GitHub.</p>
          </div>
        </div>

        <div className="admin-cred-sort-guide">
          <span className="admin-guide-icon">⠿</span>
          <div>
            <strong>Drag cards or use buttons to sort:</strong> Reorder which credentials appear first (No. 01) and last on your public showcase rail.
          </div>
        </div>

        <form onSubmit={handleSave} className="admin-edit-form">
          <div className="admin-cred-editor-list">
            {items.map((cred, idx) => (
              <div
                key={cred.id}
                className={`admin-cred-card-item${draggedIdx === idx ? " is-dragging" : ""}${dragOverIdx === idx ? " is-drag-target" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div className="admin-cred-header">
                  <div className="admin-cred-order-pill">
                    <span className="admin-cred-grip" title="Drag to reorder position">⠿</span>
                    <span className="admin-cred-num">
                      #{idx + 1} {idx === 0 ? "— (First in rail)" : idx === items.length - 1 ? "— (Last in rail)" : ""}
                    </span>
                    <span className={`admin-cat-tag cat-${cred.category?.toLowerCase() || "cyber"}`}>
                      {cred.category}
                    </span>
                  </div>

                  <div className="admin-cred-reorder-btns">
                    <button
                      type="button"
                      className="admin-sort-btn"
                      onClick={() => moveItem(idx, 0)}
                      disabled={idx === 0}
                      title="Make First (jump to No. 01)"
                    >
                      ⏮ First
                    </button>
                    <button
                      type="button"
                      className="admin-sort-btn"
                      onClick={() => moveItem(idx, idx - 1)}
                      disabled={idx === 0}
                      title="Move up"
                    >
                      ▲ Up
                    </button>
                    <button
                      type="button"
                      className="admin-sort-btn"
                      onClick={() => moveItem(idx, idx + 1)}
                      disabled={idx === items.length - 1}
                      title="Move down"
                    >
                      ▼ Down
                    </button>
                    <button
                      type="button"
                      className="admin-sort-btn"
                      onClick={() => moveItem(idx, items.length - 1)}
                      disabled={idx === items.length - 1}
                      title="Make Last (jump to end)"
                    >
                      ⏭ Last
                    </button>
                    <button
                      type="button"
                      className="admin-row-delete-btn"
                      onClick={() => handleDelete(idx)}
                      title="Delete credential"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                <div className="admin-cred-content-grid">
                  <div className="admin-cred-preview-box" title={cred.name}>
                    <img
                      src={resolveAssetUrl(cred.image)}
                      alt={cred.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                  </div>
                  <div className="admin-form-grid">
                    <div className="admin-field-group">
                      <label>Badge Title</label>
                      <input
                        type="text"
                        className="admin-input-text"
                        value={cred.name}
                        onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-field-group">
                      <label>Issuer / Body</label>
                      <input
                        type="text"
                        className="admin-input-text"
                        value={cred.issuer}
                        onChange={(e) => handleUpdate(idx, { issuer: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-field-group">
                      <label>Category</label>
                      <select
                        className="admin-select"
                        value={cred.category}
                        onChange={(e) =>
                          handleUpdate(idx, {
                            category: e.target.value as CredentialItem["category"],
                          })
                        }
                      >
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Community">Community</option>
                        <option value="Accreditation">Accreditation</option>
                        <option value="Cloud">Cloud</option>
                      </select>
                    </div>
                    <div className="admin-field-group">
                      <label>Verification Link (e.g. Credly)</label>
                      <input
                        type="url"
                        className="admin-input-text"
                        placeholder="https://credly.com/..."
                        value={cred.verifyUrl || ""}
                        onChange={(e) => handleUpdate(idx, { verifyUrl: e.target.value })}
                      />
                    </div>
                    <div className="admin-field-group full-width">
                      <GitHubImageUploader
                        label="Badge Image Icon (Upload to GitHub)"
                        value={cred.image}
                        onChange={(url) => handleUpdate(idx, { image: url })}
                        token={token}
                        config={config}
                        onNotify={onNotify}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="admin-btn-add-item" onClick={handleAdd}>
            + Add Another Credential
          </button>

          <div className="admin-actions-row">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// EDIT CONTACT MODAL
// ----------------------------------------------------
export function EditContactModal({
  isOpen,
  data,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  data: ContactData;
  onSave: (updated: ContactData) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ContactData>(data);
  const [topicsStr, setTopicsStr] = useState(data.topics.join(", "));

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTopics = topicsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      ...formData,
      topics: parsedTopics.length > 0 ? parsedTopics : formData.topics,
    });
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-card">
        <button className="admin-modal-close" type="button" onClick={onClose}>&times;</button>
        <div className="admin-modal-header">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <h2 className="admin-modal-title">Edit Contact Section</h2>
            <p className="admin-modal-subtitle">Update your contact email, Formspree endpoint, and discussion topics.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="admin-edit-form">
          <div className="admin-form-grid">
            <div className="admin-field-group">
              <label>Direct Email Address</label>
              <input
                type="email"
                className="admin-input-text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Formspree Endpoint URL</label>
              <input
                type="url"
                className="admin-input-text"
                value={formData.formspreeUrl}
                onChange={(e) => setFormData({ ...formData, formspreeUrl: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Headline Main / Highlight</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="admin-input-text"
                  placeholder="Let's build something"
                  value={formData.headlineMain}
                  onChange={(e) => setFormData({ ...formData, headlineMain: e.target.value })}
                />
                <input
                  type="text"
                  className="admin-input-text"
                  placeholder="remarkable."
                  value={formData.headlineHighlight}
                  onChange={(e) => setFormData({ ...formData, headlineHighlight: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-field-group full-width">
              <label>Contact Description Copy</label>
              <textarea
                className="admin-textarea"
                rows={2}
                value={formData.copy}
                onChange={(e) => setFormData({ ...formData, copy: e.target.value })}
                required
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Topics (comma-separated)</label>
              <input
                type="text"
                className="admin-input-text"
                value={topicsStr}
                onChange={(e) => setTopicsStr(e.target.value)}
                placeholder="Internships, Collaboration, Security & development"
                required
              />
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
