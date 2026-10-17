import { FormEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import SpaceFighter from "./SpaceFighter";
import CollectionDialog from "./CollectionDialog";
import { defaultPortfolioData } from "./data/defaultData";
import type {
  AdminState,
  GitHubUser,
  PortfolioData,
  ProjectItem,
} from "./types/portfolio";
import {
  commitPortfolioData,
  fetchRepoData,
  validateGitHubToken,
} from "./services/githubService";
import { resolveAssetUrl } from "./utils/assetResolver";
import { ToastContainer, type ToastMessage } from "./components/Toast";
import { AdminBar } from "./components/AdminBar";
import { AdminLoginModal } from "./components/AdminLoginModal";
import {
  EditHeroModal,
  EditAboutModal,
  EditProjectsModal,
  EditArsenalModal,
  EditCredentialsModal,
  EditContactModal,
} from "./components/EditModals";

type IconName =
  | "arrow"
  | "aws"
  | "badge"
  | "check"
  | "chevron"
  | "code"
  | "facebook"
  | "github"
  | "linkedin"
  | "mail"
  | "map"
  | "menu"
  | "moon"
  | "server"
  | "shield"
  | "spark"
  | "sun"
  | "terminal"
  | "x";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    aws: <><path d="M5 15c4 2.7 9.8 2.8 14 0" /><path d="M17 18.5 19.5 15l-4-.2" /><path d="M8.3 12V7.8c0-2.1-4.8-1.8-4.8.4" /><path d="M3.5 10.5c0 2.4 4.8 2 4.8-.2H3.5Z" /><path d="M11 6v6" /><path d="M11 9.2c1-1.2 3.1-1.1 3.1.8v2" /></>,
    badge: <><path d="m12 3 2 1.4 2.5-.2.7 2.4 2 1.5-.8 2.4.8 2.4-2 1.5-.7 2.4-2.5-.2-2 1.4-2-1.4-2.5.2-.7-2.4-2-1.5.8-2.4-.8-2.4 2-1.5.7-2.4 2.5.2L12 3Z" /><path d="m9 11 2 2 4-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    code: <><path d="m8 9-3 3 3 3" /><path d="m16 9 3 3-3 3" /><path d="m14 5-4 14" /></>,
    facebook: <path d="M13.8 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.5-1.8 1.9-1.8h1.5V3.8s-1.4-.2-2.7-.2c-2.8 0-4.6 1.7-4.6 4.8v2.1H7.2v3.3h2.7V22h3.9Z" />,
    github: <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.58 9.58 0 0 1 12 6.83c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z" />,
    linkedin: <><rect x="3" y="9" width="4" height="12" rx=".3" /><circle cx="5" cy="5" r="2.2" /><path d="M10 9h3.8v1.7c.7-1.2 1.9-2 3.6-2 3.4 0 4.6 2.2 4.6 5.5V21h-4v-6c0-1.6-.3-2.8-1.9-2.8-1.8 0-2.1 1.4-2.1 2.8v6h-4V9Z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
    server: <><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /><path d="M7 7h.01M7 17h.01" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></>,
    terminal: <><path d="m4 17 6-5-6-5" /><path d="M12 19h8" /></>,
    x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  };

  const isBrand = name === "facebook" || name === "github" || name === "linkedin";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={isBrand ? "currentColor" : "none"} stroke={isBrand ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function CredentialCard({
  badge,
  index,
  total,
  isEditing,
  isDragging,
  isDragTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
  onMoveToFirst,
  onMoveToLast,
}: {
  badge: { name: string; issuer: string; category: string; image: string; verifyUrl?: string };
  index: number;
  total?: number;
  isEditing?: boolean;
  isDragging?: boolean;
  isDragTarget?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onMoveToFirst?: () => void;
  onMoveToLast?: () => void;
}) {
  const isCommunity = badge.category === "Community";
  const isFirst = index === 0;
  const isLast = total !== undefined && index === total - 1;

  return (
    <article
      className={`accreditation-card credential-ticket${isCommunity ? " community-ticket" : ""}${isDragging ? " is-dragging" : ""}${isDragTarget ? " is-drag-target" : ""}${isEditing ? " is-editing" : ""}`}
      draggable={Boolean(isEditing || onDragStart)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      aria-grabbed={isDragging}
    >
      {isEditing && (
        <div className="card-admin-sort-bar" onClick={(e) => e.stopPropagation()}>
          <div className="card-sort-actions">
            <button
              type="button"
              className="card-sort-btn"
              onClick={onMoveToFirst}
              disabled={isFirst}
              title="Move to first position (No. 01)"
            >
              ⏮
            </button>
            <button
              type="button"
              className="card-sort-btn"
              onClick={onMoveLeft}
              disabled={isFirst}
              title="Move left (earlier in rail)"
            >
              ◀
            </button>
            <span className="card-sort-badge">#{index + 1}</span>
            <button
              type="button"
              className="card-sort-btn"
              onClick={onMoveRight}
              disabled={isLast}
              title="Move right (later in rail)"
            >
              ▶
            </button>
            <button
              type="button"
              className="card-sort-btn"
              onClick={onMoveToLast}
              disabled={isLast}
              title="Move to last position"
            >
              ⏭
            </button>
          </div>
          <span className="card-drag-grip" title="Drag card to sort position">⠿</span>
        </div>
      )}

      <div className="ticket-header">
        <span className="ticket-category-tag">{badge.category}</span>
        <span className="ticket-index-number">NO. {String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="badge-display">
        <span className="badge-rivet rivet-tl" aria-hidden="true" />
        <span className="badge-rivet rivet-tr" aria-hidden="true" />
        <span className="badge-rivet rivet-bl" aria-hidden="true" />
        <span className="badge-rivet rivet-br" aria-hidden="true" />
        <img
          src={resolveAssetUrl(badge.image)}
          alt={`${badge.name} badge`}
          loading="lazy"
        />
      </div>

      <div className="ticket-caption">
        <span className="ticket-issuer-label">{badge.issuer}</span>
        <h3 title={badge.name}>{badge.name}</h3>
      </div>

      <div className="ticket-footer">
        <span className="ticket-action-note">
          <Icon name={isCommunity ? "spark" : "shield"} size={12} />
          {isCommunity ? "Connect & grow" : "Learn & defend"}
        </span>
        <span className="ticket-barcode" aria-hidden="true" />
      </div>
    </article>
  );
}

function ArsenalCard({ skill, index }: { skill: [string, string, string]; index: number }) {
  const [name, description, monogram] = skill;
  return (
    <article className="arsenal-item">
      <div className="capability-index">
        <span>{index < 3 ? "BUILD" : index < 5 ? "OPERATE" : "DEFEND"}</span>
        <span>0{index + 1}</span>
      </div>
      <span className={`tech-mark tech-${index}`}>{monogram}</span>
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

function ProjectCard({
  project,
  onView,
}: {
  project: ProjectItem;
  onView: (project: ProjectItem) => void;
}) {
  return (
    <article className={`project-card ${project.accent}`}>
      <div className="project-visual">
        <span className="project-number">{project.number}</span>
        <span className="mission-caption">
          MISSION / {project.accent === "cyan" ? "DETECT" : project.accent === "gold" ? "CONNECT" : "PROTECT"}
        </span>
        <div className="project-icon"><Icon name={project.icon} size={34} /></div>
        <div className="visual-lines"><i /><i /><i /><i /></div>
      </div>
      <div className="project-content">
        <span className="project-eyebrow">{project.eyebrow}</span>
        <h3>{project.title}</h3>
        <div className="project-card-meta">
          <span>{project.client}</span>
          <span>{project.date}</span>
        </div>
        <p>{project.copy}</p>
        <div className="tag-row">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <button
          className="project-detail-trigger"
          type="button"
          onClick={() => onView(project)}
          aria-haspopup="dialog"
          aria-label={`View details for ${project.title}`}
        >
          <span>View project details</span>
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </article>
  );
}

function ProjectDetailsDialog({ project, onClose }: { project: ProjectItem; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const requestClose = () => {
    if (closeTimer.current !== null) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      dialog.current?.close();
      onClose();
      closeTimer.current = null;
    }, 240);
  };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <dialog
      className={`project-dialog-backdrop ${closing ? "is-closing" : ""}`}
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) requestClose();
      }}
    >
      <article className={`project-dialog ${project.accent}`} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title-group">
            <span className="project-dialog-eyebrow">{project.eyebrow}</span>
            <div className="dialog-heading-row">
              <span className="dialog-number">{project.number}</span>
              <h2>{project.title}</h2>
            </div>
            <div className="project-dialog-meta">
              <span>{project.client}</span>
              <span>{project.date}</span>
              <span>{project.role}</span>
            </div>
          </div>
          <button className="project-dialog-close" type="button" onClick={requestClose} aria-label="Close dialog">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="dialog-body">
          <p className="dialog-summary">{project.copy}</p>
          <div className="dialog-bullets">
            <h4>Key Architecture &amp; Implementation</h4>
            <ul>
              {project.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
          <div className="dialog-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </article>
    </dialog>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <span className="eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
        {action}
      </div>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function App() {
  // ----------------------------------------------------
  // DATA & ADMIN STATE
  // ----------------------------------------------------
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() => {
    try {
      const draft = localStorage.getItem("admin_portfolio_draft");
      if (draft) return JSON.parse(draft);
    } catch {
      // ignore JSON parse error
    }
    return defaultPortfolioData;
  });

  const [adminState, setAdminState] = useState<AdminState>({
    isLoggedIn: false,
    token: "",
    user: null,
    mode: "edit",
    hasUnsavedChanges: !!localStorage.getItem("admin_portfolio_draft"),
    fileSha: null,
  });

  const [activeEditModal, setActiveEditModal] = useState<
    "hero" | "about" | "projects" | "arsenal" | "credentials" | "contact" | null
  >(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ----------------------------------------------------
  // INITIAL DATA & AUTH CHECK
  // ----------------------------------------------------
  useEffect(() => {
    // If no draft in localStorage, load published data from public/data/portfolio-data.json
    const hasDraft = !!localStorage.getItem("admin_portfolio_draft");
    if (!hasDraft) {
      fetch(`/data/portfolio-data.json?_t=${Date.now()}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Local data file not found");
        })
        .then((data: PortfolioData) => {
          if (data && data.hero) {
            setPortfolioData(data);
          }
        })
        .catch(() => {
          // fallback to bundled default
        });
    }

    // Check saved token for automatic persistent login
    const savedToken =
      localStorage.getItem("admin_github_pat") ||
      sessionStorage.getItem("admin_github_pat");

    if (savedToken) {
      validateGitHubToken(savedToken).then((res) => {
        if (res.valid && res.user) {
          setAdminState((prev) => ({
            ...prev,
            isLoggedIn: true,
            token: savedToken,
            user: res.user!,
            mode: "edit",
          }));
          // Fetch current file SHA
          fetchRepoData(portfolioData.githubConfig, savedToken).then((repoRes) => {
            if (repoRes.sha) {
              setAdminState((prev) => ({ ...prev, fileSha: repoRes.sha! }));
            }
          });
        } else {
          localStorage.removeItem("admin_github_pat");
          sessionStorage.removeItem("admin_github_pat");
        }
      });
    }
  }, []);

  // Keyboard shortcut Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        if (!adminState.isLoggedIn) {
          setLoginModalOpen(true);
        } else {
          setAdminState((prev) => ({
            ...prev,
            mode: prev.mode === "edit" ? "preview" : "edit",
          }));
          addToast(
            adminState.mode === "edit" ? "Preview Mode (Controls hidden)" : "Edit Mode Active ✏️",
            "info"
          );
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adminState.isLoggedIn, adminState.mode]);

  // Triple-click on brand logo to trigger admin
  const logoClicks = useRef<number[]>([]);
  const handleLogoClick = () => {
    const now = Date.now();
    logoClicks.current = logoClicks.current.filter((t) => now - t < 1500);
    logoClicks.current.push(now);
    if (logoClicks.current.length >= 3) {
      logoClicks.current = [];
      if (!adminState.isLoggedIn) {
        setLoginModalOpen(true);
      } else {
        setAdminState((prev) => ({
          ...prev,
          mode: prev.mode === "edit" ? "preview" : "edit",
        }));
        addToast(
          adminState.mode === "edit" ? "Preview Mode (Controls hidden)" : "Edit Mode Active ✏️",
          "info"
        );
      }
    }
  };

  // ----------------------------------------------------
  // ADMIN ACTIONS
  // ----------------------------------------------------
  const handleLoginSuccess = (token: string, user: GitHubUser, remember: boolean) => {
    if (remember) {
      localStorage.setItem("admin_github_pat", token);
    } else {
      sessionStorage.setItem("admin_github_pat", token);
    }

    setAdminState((prev) => ({
      ...prev,
      isLoggedIn: true,
      token,
      user,
      mode: "edit",
    }));

    addToast(`Authenticated as @${user.login}! Admin Mode active. ✨`, "success");

    // Fetch SHA
    fetchRepoData(portfolioData.githubConfig, token).then((repoRes) => {
      if (repoRes.sha) {
        setAdminState((prev) => ({ ...prev, fileSha: repoRes.sha! }));
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_github_pat");
    sessionStorage.removeItem("admin_github_pat");
    setAdminState({
      isLoggedIn: false,
      token: "",
      user: null,
      mode: "preview",
      hasUnsavedChanges: false,
      fileSha: null,
    });
    addToast("Logged out of Admin Mode.", "info");
  };

  const updatePortfolio = (updater: (prev: PortfolioData) => PortfolioData) => {
    setPortfolioData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem("admin_portfolio_draft", JSON.stringify(next));
      } catch (e) {
        console.error("Local draft save error:", e);
      }
      setAdminState((s) => ({ ...s, hasUnsavedChanges: true }));
      return next;
    });
    addToast("Draft saved locally! Click 'Commit to GitHub' to publish. 💾", "info");
  };

  const handleSaveToGitHub = async () => {
    if (!adminState.token) {
      setLoginModalOpen(true);
      return;
    }

    setIsSaving(true);
    addToast("Committing changes to GitHub repository... ⏳", "info");

    const result = await commitPortfolioData(
      portfolioData.githubConfig,
      adminState.token,
      portfolioData,
      adminState.fileSha || undefined
    );

    setIsSaving(false);

    if (result.success) {
      setAdminState((s) => ({
        ...s,
        hasUnsavedChanges: false,
        fileSha: result.sha || s.fileSha,
      }));
      localStorage.removeItem("admin_portfolio_draft");
      addToast("Changes committed to GitHub! Automatic deployment started. 🚀", "success");
    } else {
      addToast(result.error || "Failed to commit changes to GitHub.", "error");
    }
  };

  const handleDiscardChanges = () => {
    if (!confirm("Are you sure you want to discard your local draft and revert to the published version?")) {
      return;
    }
    localStorage.removeItem("admin_portfolio_draft");
    setAdminState((s) => ({ ...s, hasUnsavedChanges: false }));

    fetch(`/data/portfolio-data.json?_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        setPortfolioData(data);
        addToast("Draft discarded. Reverted to repository state.", "info");
      })
      .catch(() => {
        setPortfolioData(defaultPortfolioData);
        addToast("Draft discarded. Reverted to default.", "info");
      });
  };

  // ----------------------------------------------------
  // APP INTERACTIVE STATES
  // ----------------------------------------------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [collectionOpen, setCollectionOpen] = useState<"credentials" | "arsenal" | "projects" | null>(null);
  const [collectionQuery, setCollectionQuery] = useState("");

  const openCollection = (collection: "credentials" | "arsenal" | "projects") => {
    setCollectionQuery("");
    setCollectionOpen(collection);
  };

  const matchesCollection = (text: string) => text.toLowerCase().includes(collectionQuery.trim().toLowerCase());

  // Dynamic collections derived from portfolioData
  const dynamicCredentials = portfolioData.credentials.map((badge, index) => ({
    badge: {
      name: badge.name,
      issuer: badge.issuer,
      category: badge.category,
      image: resolveAssetUrl(badge.image),
      verifyUrl: badge.verifyUrl,
    },
    index,
  }));

  const dynamicArsenal = portfolioData.arsenal.map((skill, index) => ({
    skill: [skill.name, skill.description, skill.monogram] as [string, string, string],
    index,
  }));

  const filteredCredentials = dynamicCredentials.filter(({ badge }) =>
    matchesCollection(`${badge.name} ${badge.issuer} ${badge.category}`)
  );
  const filteredArsenal = dynamicArsenal.filter(({ skill }) => matchesCollection(skill.join(" ")));
  const filteredProjects = portfolioData.projects.filter((project) =>
    matchesCollection(`${project.title} ${project.eyebrow} ${project.copy} ${project.tags.join(" ")} ${project.client}`)
  );

  const [lightMode, setLightMode] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState("");
  const contactRequest = useRef<AbortController | null>(null);
  const contactSuccess = useRef<HTMLDivElement>(null);
  const [cyberproOpen, setCyberproOpen] = useState(false);
  const [cyberproClosing, setCyberproClosing] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const credentialRail = useRef<HTMLDivElement>(null);
  const [credentialPosition, setCredentialPosition] = useState(1);

  const scrollCredentials = (direction: number) => {
    const rail = credentialRail.current;
    const card = rail?.querySelector<HTMLElement>(".accreditation-card");
    if (!rail || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(rail).gap);
    rail.scrollBy({
      left: direction * step,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  const updateCredentialPosition = () => {
    const rail = credentialRail.current;
    const card = rail?.querySelector<HTMLElement>(".accreditation-card");
    if (!rail || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(rail).gap);
    setCredentialPosition(Math.min(portfolioData.credentials.length, Math.round(rail.scrollLeft / step) + 1));
  };

  // Drag-and-drop & sorting state for credentials showcase
  const [draggedCredIndex, setDraggedCredIndex] = useState<number | null>(null);
  const [dragOverCredIndex, setDragOverCredIndex] = useState<number | null>(null);

  const reorderCredentials = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= portfolioData.credentials.length || toIndex >= portfolioData.credentials.length) return;
    updatePortfolio((prev) => {
      const updated = [...prev.credentials];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, credentials: updated };
    });
  };

  const moveCredentialRelative = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= portfolioData.credentials.length) return;
    reorderCredentials(index, target);
    addToast(`Moved "${portfolioData.credentials[index]?.name || "Credential"}" to position #${target + 1}`, "info");
  };

  const moveCredentialToFirst = (index: number) => {
    if (index === 0) return;
    reorderCredentials(index, 0);
    addToast(`Moved "${portfolioData.credentials[index]?.name || "Credential"}" to 1st position 🚀`, "success");
  };

  const moveCredentialToLast = (index: number) => {
    const lastIndex = portfolioData.credentials.length - 1;
    if (index === lastIndex) return;
    reorderCredentials(index, lastIndex);
    addToast(`Moved "${portfolioData.credentials[index]?.name || "Credential"}" to last position 🏁`, "info");
  };

  const handleCredDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedCredIndex(index);
  };

  const handleCredDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCredIndex !== index) {
      setDragOverCredIndex(index);
    }
  };

  const handleCredDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedCredIndex !== null && draggedCredIndex !== targetIndex) {
      const movedItem = portfolioData.credentials[draggedCredIndex];
      reorderCredentials(draggedCredIndex, targetIndex);
      addToast(
        `Moved "${movedItem?.name || "Credential"}" to position #${targetIndex + 1} 🎯 Click "Publish Changes" to push to GitHub.`,
        "success"
      );
    }
    setDraggedCredIndex(null);
    setDragOverCredIndex(null);
  };

  const handleCredDragEnd = () => {
    setDraggedCredIndex(null);
    setDragOverCredIndex(null);
  };

  useEffect(() => {
    let cancelled = false;
    const portrait = new Image();
    portrait.src = resolveAssetUrl(portfolioData.hero.avatar);
    const minimum = new Promise((resolve) => window.setTimeout(resolve, 1100));
    const deadline = new Promise((resolve) => window.setTimeout(resolve, 3500));
    const assets = Promise.allSettled([portrait.decode(), document.fonts.ready]);
    void Promise.race([Promise.all([minimum, assets]), deadline]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [portfolioData.hero.avatar]);

  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => setLoaderVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hero = document.querySelector<HTMLElement>(".hero");
    const planets = [...document.querySelectorAll<HTMLElement>(".section-planet")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty("--page-progress", `${range > 0 ? y / range : 0}`);
      if (motion.matches) {
        hero?.style.removeProperty("--hero-drift");
        planets.forEach((planet) => planet.style.removeProperty("--scroll-depth"));
        return;
      }
      hero?.style.setProperty("--hero-drift", `${Math.min(y * .12, 85)}px`);
      planets.forEach((planet) => {
        const bounds = planet.parentElement!.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
          const depth = (window.innerHeight * .5 - bounds.top - bounds.height * .5) * .14;
          planet.style.setProperty("--scroll-depth", `${Math.max(-70, Math.min(70, depth))}px`);
        }
      });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  const openCyberpro = () => {
    setCyberproClosing(false);
    setCyberproOpen(true);
  };

  const closeCyberpro = () => {
    if (cyberproClosing) return;
    setCyberproClosing(true);
    window.setTimeout(() => {
      setCyberproOpen(false);
      setCyberproClosing(false);
    }, 280);
  };

  const toggleTheme = () => {
    const viewTransitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => void;
    };

    if (!viewTransitionDocument.startViewTransition) {
      setLightMode((current) => !current);
      return;
    }

    viewTransitionDocument.startViewTransition(() => {
      flushSync(() => {
        setLightMode((current) => !current);
      });
    });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = lightMode ? "dawn" : "night";
  }, [lightMode]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("#home, #about, #projects, #arsenal, #credentials");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -62%", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const warp = document.querySelector<HTMLElement>(".scroll-warp");
    if (!warp) return;

    let previousY = window.scrollY;
    let previousTime = performance.now();
    let framePending = false;
    let stopTimer = 0;

    const updateWarp = () => {
      const now = performance.now();
      const distance = Math.abs(window.scrollY - previousY);
      const elapsed = Math.max(now - previousTime, 16);
      const speed = distance / elapsed;
      const strength = Math.min(Math.max(speed * 0.5, 0.16), 0.62);

      warp.style.setProperty("--warp-strength", strength.toFixed(2));
      warp.classList.add("is-active");
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => warp.classList.remove("is-active"), 150);

      previousY = window.scrollY;
      previousTime = now;
      framePending = false;
    };

    const onScroll = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateWarp);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(stopTimer);
    };
  }, []);

  useEffect(() => {
    if (!cyberproOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCyberpro();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("modal-open");
    };
  }, [cyberproOpen]);

  useEffect(() => {
    const compactMotion = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    const targets = document.querySelectorAll<HTMLElement>(
      ".section-heading, .about-copy, .achievement-card, .project-card, .arsenal-item, .accreditation-card, .cisco-minimal, .contact-copy, .contact-form",
    );
    const sections = document.querySelectorAll<HTMLElement>(".section");

    targets.forEach((target, index) => {
      target.classList.add("scroll-reveal");
      target.style.setProperty("--reveal-delay", `${compactMotion ? (index % 2) * 35 : (index % 3) * 90}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(entry.target.classList.contains("section") ? "section-active" : "is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: compactMotion ? 0.06 : 0.12, rootMargin: compactMotion ? "0px 0px -20px" : "0px 0px -45px" },
    );

    targets.forEach((target) => observer.observe(target));
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [portfolioData]);

  useEffect(() => {
    if (sent) contactSuccess.current?.focus();
  }, [sent]);

  useEffect(() => () => contactRequest.current?.abort(), []);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contactRequest.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const controller = new AbortController();
    contactRequest.current = controller;
    setSending(true);
    setContactError("");
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) {
        setContactError(response.status === 429
          ? "Too many attempts. Please wait a little before trying again."
          : "Your message couldn't be sent. Please try again or use the email link.");
        return;
      }
      form.reset();
      setSent(true);
    } catch {
      setContactError(controller.signal.aborted
        ? "The request timed out. Please try again or use the email link."
        : "Couldn't connect. Check your internet connection and try again.");
    } finally {
      window.clearTimeout(timeout);
      contactRequest.current = null;
      setSending(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const isEditing = adminState.isLoggedIn && adminState.mode === "edit";

  return (
    <main>
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Floating Admin Dock */}
      {adminState.isLoggedIn && (
        <AdminBar
          user={adminState.user}
          mode={adminState.mode}
          hasUnsavedChanges={adminState.hasUnsavedChanges}
          isSaving={isSaving}
          onToggleMode={() =>
            setAdminState((prev) => ({
              ...prev,
              mode: prev.mode === "edit" ? "preview" : "edit",
            }))
          }
          onSaveToGitHub={handleSaveToGitHub}
          onDiscardChanges={handleDiscardChanges}
          onLogout={handleLogout}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Section Edit Modals */}
      <EditHeroModal
        isOpen={activeEditModal === "hero"}
        data={portfolioData.hero}
        token={adminState.token}
        config={portfolioData.githubConfig}
        onNotify={addToast}
        onClose={() => setActiveEditModal(null)}
        onSave={(updated) => updatePortfolio((p) => ({ ...p, hero: updated }))}
      />

      <EditAboutModal
        isOpen={activeEditModal === "about"}
        data={portfolioData.about}
        onClose={() => setActiveEditModal(null)}
        onSave={(updated) => updatePortfolio((p) => ({ ...p, about: updated }))}
      />

      <EditProjectsModal
        isOpen={activeEditModal === "projects"}
        projects={portfolioData.projects}
        onClose={() => setActiveEditModal(null)}
        onSave={(updated) => updatePortfolio((p) => ({ ...p, projects: updated }))}
      />

      <EditArsenalModal
        isOpen={activeEditModal === "arsenal"}
        arsenal={portfolioData.arsenal}
        onClose={() => setActiveEditModal(null)}
        onSave={(updated) => updatePortfolio((p) => ({ ...p, arsenal: updated }))}
      />

      <EditCredentialsModal
        isOpen={activeEditModal === "credentials"}
        credentials={portfolioData.credentials}
        token={adminState.token}
        config={portfolioData.githubConfig}
        onNotify={addToast}
        onClose={() => setActiveEditModal(null)}
        onSave={(updated) => updatePortfolio((p) => ({ ...p, credentials: updated }))}
      />

      <EditContactModal
        isOpen={activeEditModal === "contact"}
        data={portfolioData.contact}
        onClose={() => setActiveEditModal(null)}
        onSave={(updated) => updatePortfolio((p) => ({ ...p, contact: updated }))}
      />

      {/* Cosmic Intro Loader */}
      {loaderVisible && (
        <div className={`cosmic-loader${loading ? "" : " is-ready"}`} role="status" aria-live="polite">
          <div className="loader-system" aria-hidden="true"><i /><i /><i /><span /></div>
          <div className="loader-wordmark">Cler<span>Dev</span></div>
          <p>{loading ? "Aligning the stars" : "Welcome to my universe"}</p>
          <div className="loader-track" aria-hidden="true"><span /></div>
          <small>CODE · SECURITY · CURIOSITY</small>
        </div>
      )}

      <div className="sky" aria-hidden="true">
        <div className="stars stars-one" />
        <div className="stars stars-two" />
      </div>

      <div className="scroll-warp" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
      </div>

      <div className="scroll-progress" aria-hidden="true"><span /></div>

      {/* Header */}
      <header className="site-header">
        <a className="brand" href="#home" onClick={(e) => { closeMenu(); handleLogoClick(); }} aria-label="ClerDev home">
          <span>Cler<span>Dev</span></span>
        </a>
        <nav id="primary-navigation" className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Primary navigation">
          <a className={activeSection === "home" ? "active" : ""} href="#home" onClick={closeMenu} aria-current={activeSection === "home" ? "page" : undefined}>Home</a>
          <a className={activeSection === "about" ? "active" : ""} href="#about" onClick={closeMenu} aria-current={activeSection === "about" ? "page" : undefined}>About</a>
          <a className={activeSection === "projects" ? "active" : ""} href="#projects" onClick={closeMenu} aria-current={activeSection === "projects" ? "page" : undefined}>Projects</a>
          <a className={activeSection === "arsenal" ? "active" : ""} href="#arsenal" onClick={closeMenu} aria-current={activeSection === "arsenal" ? "page" : undefined}>Arsenal</a>
          <a className={activeSection === "credentials" ? "active" : ""} href="#credentials" onClick={closeMenu} aria-current={activeSection === "credentials" ? "page" : undefined}>Credentials</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={toggleTheme} aria-label="Toggle color theme" aria-pressed={lightMode} title={lightMode ? "Use dark mode" : "Use light mode"}>
            <Icon name={lightMode ? "moon" : "sun"} size={18} />
          </button>
          <a className="button button-small" href="#contact">Let&apos;s Connect <Icon name="arrow" size={17} /></a>
          <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="primary-navigation">
            <Icon name={menuOpen ? "x" : "menu"} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        {isEditing && (
          <button
            className="admin-section-edit-trigger admin-hero-edit-btn"
            type="button"
            onClick={() => setActiveEditModal("hero")}
          >
            ✏️ Edit Hero
          </button>
        )}

        <div className="hero-copy">
          <div className="status-pill">
            <span className="status-dot" /> {portfolioData.hero.statusText}
          </div>
          <p className="intro">{portfolioData.hero.intro}</p>
          <h1>
            {portfolioData.hero.name.split(" ").slice(0, -2).join(" ")} {portfolioData.hero.name.split(" ").slice(-2, -1).join(" ")}<br />
            <span>{portfolioData.hero.name.split(" ").slice(-1).join(" ")}.</span>
          </h1>
          <div className="role-row">
            {portfolioData.hero.roles.map((role) => (
              <span key={role}>&lt;{role} /&gt;</span>
            ))}
          </div>
          <p className="hero-description">{portfolioData.hero.description}</p>
          <div className="hero-buttons">
            <a className="button" href="#projects">Explore my work <Icon name="arrow" size={18} /></a>
            <a className="text-link" href="#contact">Contact me <Icon name="chevron" size={16} /></a>
          </div>
          <div className="social-row">
            <span>Find me on</span>
            {portfolioData.hero.socials.map((social) => {
              if (social.icon === "aws") {
                return (
                  <a key={social.name} className="aws-builder-link" href={social.url} target="_blank" rel="noreferrer" aria-label="AWS Builder profile">
                    <img src={resolveAssetUrl("asset:awsBuilderLogo")} alt="AWS Builder" />
                    <span>{social.name}</span>
                  </a>
                );
              }
              return (
                <a key={social.name} className="social-chip" href={social.url} target="_blank" rel="noreferrer" aria-label={social.name}>
                  <Icon name={social.icon} size={16} />
                  <span>{social.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="avatar-stage" aria-label="ClerDev digital identity">
          <div className="orbit orbit-outer" aria-hidden="true"><span /><span /></div>
          <div className="orbit orbit-inner" aria-hidden="true"><span /></div>
          <div className="avatar-glow" aria-hidden="true" />
          <div className="identity-frame">
            <div className="frame-heading"><span>01 / THE BUILDER</span><Icon name="spark" size={14} /></div>
            <div className="frame-trim" aria-hidden="true" />
            <div className="avatar-shell">
              <img className="avatar-photo" src={resolveAssetUrl(portfolioData.hero.avatar)} alt={portfolioData.hero.name} />
              <div className="avatar-grid" aria-hidden="true" />
              <span className="avatar-label">CODE WITH PURPOSE.</span>
            </div>
            <div className="frame-signature"><span>Cler<span>Dev</span></span><span>DEVELOPER<br />&amp; DEFENDER</span></div>
          </div>
          <button className="floating-card clearance" type="button" onClick={openCyberpro} aria-haspopup="dialog">
            <Icon name="shield" />
            <span><small>Cybersecurity Professional</small>DICT CyberPro · Level 2</span>
            <span className="credential-action"><i /> View ID</span>
          </button>
          <div className="floating-card coordinates"><span>14.5547° N<br />121.0244° E</span><b>MAKATI</b></div>
          <div className="signal"><i /><i /><i /><span>ONLINE</span></div>
        </div>

        <a className="scroll-cue" href="#about"><span>Scroll to discover</span><i><Icon name="chevron" size={15} /></i></a>
      </section>

      {/* About Section */}
      <section className="section about-section" id="about" data-chapter="01">
        <span className="section-planet section-planet-cyan" aria-hidden="true"><i /></span>
        <SectionTitle
          eyebrow={portfolioData.about.chapter}
          title={portfolioData.about.title}
          action={
            isEditing && (
              <button className="admin-section-edit-trigger" type="button" onClick={() => setActiveEditModal("about")}>
                ✏️ Edit About
              </button>
            )
          }
        />
        <div className="about-grid">
          <div className="about-copy">
            <div className="chapter-caption"><Icon name="code" size={16} /><span>{portfolioData.about.caption}</span></div>
            <p className="lead">{portfolioData.about.lead}</p>
            <p>{portfolioData.about.bio}</p>
            <div className="about-meta">
              <div><span>Current base</span><strong>{portfolioData.about.location}</strong></div>
              <div><span>Education</span><strong>{portfolioData.about.education}</strong></div>
            </div>
            <div className="personal-principle">
              <span>MY NORTH STAR</span>
              <p>{portfolioData.about.northStarQuote}</p>
              <Icon name="spark" size={24} />
            </div>
          </div>
          <div className="achievements">
            {portfolioData.about.achievements.map((ach) => (
              <article key={ach.id} className={`achievement-card ${ach.featured ? "featured" : ""}`}>
                <div className={`achievement-icon ${ach.theme === "gold" ? "gold" : ""}`}>
                  <Icon name={ach.theme === "gold" ? "badge" : ach.featured ? "spark" : "shield"} />
                </div>
                <span>{ach.badge}</span>
                <h3>{ach.title}</h3>
                <p>{ach.subtitle}</p>
                {ach.detail && <b>{ach.detail}</b>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="section projects-section" id="projects" data-chapter="02">
        <span className="section-planet section-planet-gold" aria-hidden="true" />
        <div className="section-header-row">
          <SectionTitle
            eyebrow="02 / Selected Works"
            title="Systems built to endure."
            copy="A focused selection of platforms engineered with secure architectures, resilient data flows, and production-ready reliability."
            action={
              isEditing && (
                <button className="admin-section-edit-trigger" type="button" onClick={() => setActiveEditModal("projects")}>
                  ✏️ Manage Projects ({portfolioData.projects.length})
                </button>
              )
            }
          />
          <button className="text-link view-all-link" type="button" onClick={() => openCollection("projects")}>
            View full index <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="projects-grid">
          {portfolioData.projects.map((project) => (
            <ProjectCard key={project.id} project={project} onView={setSelectedProject} />
          ))}
        </div>
      </section>

      {/* Arsenal Section */}
      <section className="section arsenal-section" id="arsenal" data-chapter="03">
        <span className="section-planet section-planet-violet" aria-hidden="true" />
        <div className="section-header-row">
          <SectionTitle
            eyebrow="03 / Capability"
            title="The technical arsenal."
            copy="Languages, frameworks, and security disciplines that form the backbone of my software engineering and operations work."
            action={
              isEditing && (
                <button className="admin-section-edit-trigger" type="button" onClick={() => setActiveEditModal("arsenal")}>
                  ✏️ Edit Arsenal ({portfolioData.arsenal.length})
                </button>
              )
            }
          />
          <button className="text-link view-all-link" type="button" onClick={() => openCollection("arsenal")}>
            View all skills <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="arsenal-grid">
          {portfolioData.arsenal.map((skill, index) => (
            <ArsenalCard key={skill.id} skill={[skill.name, skill.description, skill.monogram]} index={index} />
          ))}
        </div>
      </section>

      {/* Credentials Section */}
      <section className="section credentials-section accreditations-section" id="credentials" data-chapter="04">
        <span className="section-planet section-planet-credentials" aria-hidden="true" />
        <div className="section-header-row">
          <SectionTitle
            eyebrow="04 / Verified Knowledge"
            title="Accreditations &amp; Badges."
            copy="Industry-recognized credentials earned through verified coursework and community participation."
            action={
              isEditing && (
                <button className="admin-section-edit-trigger" type="button" onClick={() => setActiveEditModal("credentials")}>
                  ✏️ Edit Badges ({portfolioData.credentials.length})
                </button>
              )
            }
          />
          <button className="text-link view-all-link" type="button" onClick={() => openCollection("credentials")}>
            Browse repository <Icon name="arrow" size={16} />
          </button>
        </div>

        {isEditing && (
          <div className="admin-rail-reorder-hint">
            <span className="admin-reorder-icon">⠿</span>
            <span>
              <strong>Draggable showcase active:</strong> Click and drag any card to reorder your collection, or use the ◀ ▶ buttons on the cards to sort what goes first and last. Click <em>Publish Changes</em> to push to GitHub.
            </span>
          </div>
        )}

        <div className="collection-control-bar">
          <div className="collection-title">
            <Icon name="badge" size={18} />
            <div>
              <strong>The credential collection</strong>
              <small>{portfolioData.credentials.filter(c => c.category === "Cybersecurity").length} cybersecurity · {portfolioData.credentials.filter(c => c.category === "Community").length} community</small>
            </div>
          </div>
          <div className="collection-navigation">
            <span>{String(credentialPosition).padStart(2, "0")} / {String(portfolioData.credentials.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => scrollCredentials(-1)} aria-label="Previous credentials"><Icon name="chevron" size={17} /></button>
            <button type="button" onClick={() => scrollCredentials(1)} aria-label="Next credentials"><Icon name="chevron" size={17} /></button>
          </div>
        </div>
        <div className="accreditation-rail" ref={credentialRail} onScroll={updateCredentialPosition} tabIndex={0} aria-label="Credential collection. Use arrow keys or swipe to browse.">
          {portfolioData.credentials.map((badge, index) => (
            <CredentialCard
              key={badge.id}
              badge={badge}
              index={index}
              total={portfolioData.credentials.length}
              isEditing={isEditing}
              isDragging={draggedCredIndex === index}
              isDragTarget={dragOverCredIndex === index}
              onDragStart={(e) => handleCredDragStart(e, index)}
              onDragOver={(e) => handleCredDragOver(e, index)}
              onDrop={(e) => handleCredDrop(e, index)}
              onDragEnd={handleCredDragEnd}
              onMoveLeft={() => moveCredentialRelative(index, -1)}
              onMoveRight={() => moveCredentialRelative(index, 1)}
              onMoveToFirst={() => moveCredentialToFirst(index)}
              onMoveToLast={() => moveCredentialToLast(index)}
            />
          ))}
        </div>
        <div className="cisco-minimal">
          <strong>CISCO</strong>
          <span>Networking Academy</span>
          <div><span>Cybersecurity</span><span>Networking</span><span>Endpoint Security</span></div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-section" id="contact" data-chapter="05">
        <span className="section-planet section-planet-contact" aria-hidden="true" />
        <div className="contact-copy">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span className="eyebrow"><span className="eyebrow-line" />{portfolioData.contact.chapter}</span>
            {isEditing && (
              <button className="admin-section-edit-trigger" type="button" onClick={() => setActiveEditModal("contact")}>
                ✏️ Edit Contact
              </button>
            )}
          </div>
          <h2>{portfolioData.contact.headlineMain}<br /><span>{portfolioData.contact.headlineHighlight}</span></h2>
          <p>{portfolioData.contact.copy}</p>
          <div className="contact-topics">
            {portfolioData.contact.topics.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
          <a className="email-link" href={`mailto:${portfolioData.contact.email}`}>
            <span><Icon name="mail" /></span>
            <div><small>Drop me a line</small>{portfolioData.contact.email}</div>
          </a>
          <div className="availability">
            <span />
            <div><strong>Available for opportunities</strong><small>{portfolioData.contact.responseTime}</small></div>
          </div>
        </div>
        <form className="contact-form" action={portfolioData.contact.formspreeUrl} method="POST" onSubmit={submitForm} aria-busy={sending}>
          <div className="message-window"><span className="window-lights" aria-hidden="true"><i /><i /><i /></span><span>new-message / clerdev</span><Icon name="terminal" size={15} /></div>
          {sent ? (
            <div className="form-success contact-transmitted" ref={contactSuccess} tabIndex={-1} role="status"><span><Icon name="check" size={28} /></span><small>SIGNAL DELIVERED</small><h3>Message sent!</h3><p>Thanks for reaching out. Your message is on its way to my inbox.</p><button type="button" className="text-link" onClick={() => setSent(false)}>Send another message <Icon name="arrow" size={16} /></button></div>
          ) : (
            <>
              <div className="field-row">
                <label><span>Your name</span><input required name="name" autoComplete="name" readOnly={sending} placeholder="Juan Dela Cruz" /></label>
                <label><span>Email address</span><input required type="email" name="email" autoComplete="email" readOnly={sending} placeholder="juan@email.com" /></label>
              </div>
              <label><span>Subject</span><input required name="subject" readOnly={sending} placeholder="What would you like to discuss?" /></label>
              <label><span>Message</span><textarea required name="message" readOnly={sending} rows={5} placeholder="Tell me about your project or opportunity..." /></label>
              {contactError && <p className="contact-error" role="alert">{contactError}</p>}
              <button className="button submit-button" type="submit" disabled={sending}>{sending ? "Sending message..." : "Send message"}{sending ? <span className="contact-spinner" aria-hidden="true" /> : <Icon name="arrow" size={18} />}</button>
              <p className="form-preview-note" role="status">{sending ? "Transmitting your message. Please stay on this page." : "Delivered via Formspree · No page redirect."}</p>
            </>
          )}
        </form>
      </section>

      {/* Cyberpro ID Dialog */}
      {cyberproOpen && (
        <div className={`cyber-modal-backdrop${cyberproClosing ? " is-closing" : ""}`} role="presentation" onMouseDown={closeCyberpro}>
          <div className="cyber-modal" role="dialog" aria-modal="true" aria-labelledby="cyberpro-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="cyber-modal-close" type="button" onClick={closeCyberpro} aria-label="Close credential">
              <Icon name="x" size={18} />
            </button>

            <div className="cyber-id-visual">
              <div className="cyber-credential-frame">
                <img src={resolveAssetUrl("asset:dictCyberproCredential")} alt="QR code for John Clerwin Dela Cruz's DICT CyberPro verification" />
                <span className="credential-scan-line" />
              </div>
            </div>

            <div className="cyber-id-content">
              <div className="cyber-verified"><Icon name="check" size={13} /> Official CyberPro profile</div>
              <span className="cyber-kicker">Department of Information and Communications Technology</span>
              <h2 id="cyberpro-title">CyberPro<br /><span>Level 2 — Intermediate</span></h2>
              <p>Official Cybersecurity Professionals Portal recognition for <strong>John Clerwin Dela Cruz</strong>.</p>

              <div className="cyber-details">
                <div><span>Credential</span><strong>CyberPro Level 2</strong></div>
                <div><span>Specialization</span><strong>Cybersecurity</strong></div>
                <div><span>Recognition date</span><strong>8 October 2026</strong></div>
                <div><span>Level</span><strong className="active-status"><i /> Intermediate</strong></div>
              </div>

              <div className="cyber-signature">
                <span>CYBERPRO.DICT.GOV.PH</span>
                <button className="button button-small" type="button" onClick={closeCyberpro}>Close credential <Icon name="check" size={15} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <a className="brand" href="#home" onClick={handleLogoClick} aria-label="ClerDev home"><span>Cler<span>Dev</span></span></a>
        <p>Designed &amp; engineered under the stars by ClerDev.</p>
        <div>
          <span>© 2026 John Clerwin Dela Cruz</span>
          {/* Secret Sector Arcade */}
          <button className="arcade-trigger" type="button" onClick={() => setArcadeOpen(true)} aria-label="Discover the Secret Sector retro arcade" title="Seven playable classics hidden among the stars">
            <Icon name="spark" size={14} />
            <span>Secret sector</span>
          </button>
          {/* Admin Terminal Trigger */}
          <button
            className="arcade-trigger"
            type="button"
            onClick={() => adminState.isLoggedIn ? setAdminState(s => ({ ...s, mode: s.mode === 'edit' ? 'preview' : 'edit' })) : setLoginModalOpen(true)}
            aria-label="Admin Terminal"
            title="Admin Terminal (or press Ctrl+Shift+A)"
          >
            <Icon name="shield" size={14} />
            <span>{adminState.isLoggedIn ? (adminState.mode === 'edit' ? 'Editing' : 'Preview') : 'Admin'}</span>
          </button>
          <a href="#home" aria-label="Back to top">↑</a>
        </div>
      </footer>

      {arcadeOpen && <SpaceFighter onClose={() => setArcadeOpen(false)} />}

      {collectionOpen && (
        <CollectionDialog
          title={collectionOpen === "credentials" ? "Credential collection." : collectionOpen === "arsenal" ? "Technical arsenal." : "Project collection."}
          count={collectionOpen === "credentials" ? dynamicCredentials.length : collectionOpen === "arsenal" ? dynamicArsenal.length : portfolioData.projects.length}
          query={collectionQuery}
          onQueryChange={setCollectionQuery}
          onClose={() => setCollectionOpen(null)}
        >
          {(closeCollection) => <>
            <p className="collection-results" role="status">
              {collectionOpen === "credentials" ? filteredCredentials.length : collectionOpen === "arsenal" ? filteredArsenal.length : filteredProjects.length} results
            </p>
            {collectionOpen === "credentials" && (
              <div className="credentials-section collection-credential-grid">
                {filteredCredentials.map(({ badge, index }) => (
                  <CredentialCard key={badge.name} badge={badge} index={index} />
                ))}
              </div>
            )}
            {collectionOpen === "arsenal" && (
              <div className="arsenal-section">
                <div className="arsenal-grid">
                  {filteredArsenal.map(({ skill, index }) => (
                    <ArsenalCard key={skill[0]} skill={skill} index={index} />
                  ))}
                </div>
              </div>
            )}
            {collectionOpen === "projects" && (
              <div className="collection-project-list">
                {filteredProjects.map((project) => (
                  <article className="collection-project-row" key={project.title}>
                    <span className="collection-project-number">{project.number}</span>
                    <div className="collection-project-info">
                      <span>{project.eyebrow}</span>
                      <h3>{project.title}</h3>
                      <div className="collection-project-meta">
                        <span>{project.client}</span>
                        <span>{project.date}</span>
                      </div>
                      <p>{project.copy}</p>
                      <div className="tag-row">
                        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>
                    <button
                      className="collection-project-link"
                      type="button"
                      onClick={() => closeCollection(() => setSelectedProject(project))}
                      aria-label={`View details for ${project.title}`}
                    >
                      View details <Icon name="arrow" size={16} />
                    </button>
                  </article>
                ))}
              </div>
            )}
            {(collectionOpen === "credentials" ? filteredCredentials.length : collectionOpen === "arsenal" ? filteredArsenal.length : filteredProjects.length) === 0 && (
              <div className="collection-empty">
                <Icon name="spark" size={28} />
                <h3>No matches in this constellation.</h3>
                <p>Try another name, topic, or technology.</p>
                <button type="button" className="text-link" onClick={() => setCollectionQuery("")}>Clear search</button>
              </div>
            )}
          </>}
        </CollectionDialog>
      )}

      {selectedProject && <ProjectDetailsDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}

export default App;
