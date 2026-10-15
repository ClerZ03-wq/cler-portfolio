import { FormEvent, useEffect, useRef, useState } from "react";
import clerdevPortrait from "./assets/clerdev-portrait.jpg";
import dictCyberproCredential from "./assets/dict-cyberpro-level-2.png";
import awsBuilderLogo from "./assets/aws-builder-logo.png";
import awsStudentBuilderBadge from "./assets/badges/aws-student-builder.png";
import ibmCloudBadge from "./assets/badges/ibm-cloud-security.png";
import ibmGrcBadge from "./assets/badges/ibm-grc.png";
import ibmForensicsBadge from "./assets/badges/ibm-incident-forensics.png";
import ibmSecurityOperationsBadge from "./assets/badges/ibm-security-operations.png";
import ibmSystemNetworkBadge from "./assets/badges/ibm-system-network-security.png";
import ibmVulnerabilityBadge from "./assets/badges/ibm-vulnerability-management.png";
import isc2Badge from "./assets/badges/isc2-badge.png";
import SpaceFighter from "./SpaceFighter";
import CollectionDialog from "./CollectionDialog";

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

const projects = [
  {
    number: "01",
    title: "FIL-NODE",
    eyebrow: "Telemetry & Detection Engine",
    client: "Filoil Philippines Corporation",
    date: "August 2026 — Present",
    role: "Lead Developer | Security Architect",
    copy: "A secure, VPN-independent endpoint telemetry and detection platform built for proactive remote asset management.",
    details: [
      "Architected a secure, VPN-independent telemetry pipeline using a C#/.NET endpoint agent and Django REST backend, continuously synchronizing remote device health and network data into a centralized PostgreSQL database.",
      "Engineered a custom rule-based detection engine to analyze historical telemetry and baseline deviations, accelerating IT incident resolution through automated, human-in-the-loop remediation workflows.",
      "Automated endpoint security baseline checks for firewall, antivirus, and storage configurations using AES-256-GCM encryption, transforming remote asset management into a proactive system aligned with ISO/IEC 27001:2022, NIST, and CIS Benchmarks.",
    ],
    tags: ["C# / .NET", "Django REST", "PostgreSQL", "SecOps"],
    icon: "terminal" as IconName,
    accent: "cyan",
  },
  {
    number: "02",
    title: "FIL-TRACK",
    eyebrow: "Filoil Logistics Asset Tracker",
    client: "Filoil Philippines Corporation",
    date: "February 2026 — May 2026",
    role: "Lead Programmer | Systems Administrator",
    copy: "A centralized, multi-department asset lifecycle platform connecting IT, HR, Finance, remote terminals, and the head office.",
    details: [
      "Developed a centralized web-based, multi-department digital ecosystem, eliminating isolated information silos across IT, HR, and Finance while replacing manual, version-control-prone spreadsheet tracking.",
      "Engineered end-to-end asset lifecycle tracking to trace the physical movement and operational status of equipment across remote terminals and the central head office, giving management real-time global oversight and reducing the risk of unrecorded corporate losses.",
      "Secured enterprise asset data by enforcing Role-Based Access Control (RBAC) and a client-mandated VPN network architecture, ensuring strict data confidentiality and safe geographic tracking of equipment across all terminal locations.",
    ],
    tags: ["Full-Stack", "Asset Lifecycle", "RBAC", "Systems Admin"],
    icon: "map" as IconName,
    accent: "gold",
  },
  {
    number: "03",
    title: "Makati City Hall",
    eyebrow: "Vulnerability Assessment",
    client: "ICTO, Makati City Hall",
    date: "March 2026 — May 2026",
    role: "Information Security Analyst (Academic Project)",
    copy: "A comprehensive information assurance and security assessment translating municipal vulnerabilities into a prioritized remediation roadmap.",
    details: [
      "Reviewed a comprehensive Information Assurance and Security Plan, synthesizing multi-domain vulnerability data into a cohesive executive risk mitigation strategy.",
      "Designed actionable security controls for software and hardware inventory, secure endpoint configurations, malware defenses, and wireless access, aligning municipal IT operations with NIST and DICT Cybersecurity Frameworks.",
      "Authored targeted vulnerability findings addressing personnel security, backup recovery processes, and Data Privacy Act of 2012 (RA 10173) compliance, establishing a prioritized remediation roadmap for the city government.",
    ],
    tags: ["NIST", "DICT Framework", "Risk", "RA 10173"],
    icon: "shield" as IconName,
    accent: "violet",
  },
];

type Project = typeof projects[number];

const arsenal = [
  ["Django", "Full-stack web framework", "DJ"],
  ["PostgreSQL", "Relational data systems", "PG"],
  ["C++", "Systems programming", "C+"],
  ["Cisco", "Network infrastructure", "CS"],
  ["Windows Server", "Enterprise administration", "WS"],
  ["Vulnerability Assessment", "Security testing", "VA"],
];

const badges = [
  { name: "Security Operations and Management", short: "SecOps", image: ibmSecurityOperationsBadge },
  { name: "Incident Response and Systems Forensics", short: "Forensics", image: ibmForensicsBadge },
  { name: "Cloud Security", short: "Cloud", image: ibmCloudBadge },
  { name: "System and Network Security", short: "SNS", image: ibmSystemNetworkBadge },
  { name: "Vulnerability Management", short: "VM", image: ibmVulnerabilityBadge },
  { name: "Governance, Risk, Compliance, and Data Privacy", short: "GRC", image: ibmGrcBadge },
];

const communityBadges = [
  { name: "AWS Student Builder Group", role: "Participant", image: awsStudentBuilderBadge },
  { name: "ISC2 Cybersecurity Community", role: "Professional development", image: isc2Badge },
];

const credentialCollection = [
  ...badges.map((badge) => ({ ...badge, issuer: "IBM SkillsBuild", category: "Cybersecurity" })),
  ...communityBadges.map((badge) => ({ ...badge, issuer: badge.role, category: "Community" })),
];

function CredentialCard({ badge, index }: { badge: typeof credentialCollection[number]; index: number }) {
  return (
    <article className={`accreditation-card credential-ticket${index >= 6 ? " community-ticket" : ""}`}>
      <div className="ticket-header"><span>{badge.category}</span><span>NO. {String(index + 1).padStart(2, "0")}</span></div>
      <div className="badge-display"><img src={badge.image} alt={`${badge.name} badge`} loading="lazy" /></div>
      <div className="ticket-caption"><span>{badge.issuer}</span><h3>{badge.name}</h3></div>
      <div className="ticket-footer"><span><Icon name={index >= 6 ? "spark" : "shield"} size={12} />{index >= 6 ? "Connect & grow" : "Learn & defend"}</span><span className="ticket-barcode" aria-hidden="true" /></div>
    </article>
  );
}

function ArsenalCard({ skill, index }: { skill: string[]; index: number }) {
  const [name, description, monogram] = skill;
  return (
    <article className="arsenal-item">
      <div className="capability-index"><span>{index < 3 ? "BUILD" : index < 5 ? "OPERATE" : "DEFEND"}</span><span>0{index + 1}</span></div>
      <span className={`tech-mark tech-${index}`}>{monogram}</span>
      <div><h3>{name}</h3><p>{description}</p></div>
    </article>
  );
}

function ProjectCard({ project, onView }: { project: Project; onView: (project: Project) => void }) {
  return (
    <article className={`project-card ${project.accent}`}>
      <div className="project-visual">
        <span className="project-number">{project.number}</span>
        <span className="mission-caption">MISSION / {project.accent === "cyan" ? "DETECT" : project.accent === "gold" ? "CONNECT" : "PROTECT"}</span>
        <div className="project-icon"><Icon name={project.icon} size={34} /></div>
        <div className="visual-lines"><i /><i /><i /><i /></div>
      </div>
      <div className="project-content">
        <span className="project-eyebrow">{project.eyebrow}</span>
        <h3>{project.title}</h3>
        <div className="project-card-meta"><span>{project.client}</span><span>{project.date}</span></div>
        <p>{project.copy}</p>
        <div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <button className="project-detail-trigger" type="button" onClick={() => onView(project)}>View project details <Icon name="arrow" size={16} /></button>
      </div>
    </article>
  );
}

function ProjectDetailsDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const requestClose = () => {
    if (closeTimer.current !== null) return;
    setClosing(true);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
    closeTimer.current = window.setTimeout(onClose, delay);
  };

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      className={`project-detail-dialog ${project.accent}${closing ? " is-closing" : ""}`}
      ref={dialog}
      aria-labelledby="project-detail-title"
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
      }}
    >
      <button className="icon-button project-detail-close" type="button" onClick={requestClose} aria-label="Close project details">
        <Icon name="x" size={18} />
      </button>
      <div className="project-detail-visual">
        <span className="project-detail-number">{project.number}</span>
        <div className="project-detail-graphic" aria-hidden="true">
          <span className="project-detail-orbit"><i /><i /><i /></span>
          <div className="project-detail-icon"><Icon name={project.icon} size={38} /></div>
        </div>
        <div>
          <span>{project.eyebrow}</span>
          <strong>{project.client}</strong>
          <small>{project.date}</small>
        </div>
      </div>
      <div className="project-detail-content">
        <span className="eyebrow">CLERDEV / PROJECT DOSSIER</span>
        <h2 id="project-detail-title">{project.title}</h2>
        <p className="project-detail-summary">{project.copy}</p>
        <div className="project-detail-meta">
          <div><span>Organization</span><strong>{project.client}</strong></div>
          <div><span>Timeline</span><strong>{project.date}</strong></div>
          <div><span>Role</span><strong>{project.role}</strong></div>
        </div>
        <div className="project-detail-scope">
          <span>Scope &amp; impact</span>
          <ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </div>
        <div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
    </dialog>
  );
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [collectionOpen, setCollectionOpen] = useState<"credentials" | "arsenal" | "projects" | null>(null);
  const [collectionQuery, setCollectionQuery] = useState("");
  const openCollection = (collection: "credentials" | "arsenal" | "projects") => {
    setCollectionQuery("");
    setCollectionOpen(collection);
  };
  const matchesCollection = (text: string) => text.toLowerCase().includes(collectionQuery.trim().toLowerCase());
  const filteredCredentials = credentialCollection.map((badge, index) => ({ badge, index })).filter(({ badge }) => matchesCollection(`${badge.name} ${badge.issuer} ${badge.category}`));
  const filteredArsenal = arsenal.map((skill, index) => ({ skill, index })).filter(({ skill }) => matchesCollection(skill.join(" ")));
  const filteredProjects = projects.filter((project) => matchesCollection(`${project.title} ${project.eyebrow} ${project.client} ${project.date} ${project.role} ${project.copy} ${project.details.join(" ")} ${project.tags.join(" ")}`));
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
    setCredentialPosition(Math.min(credentialCollection.length, Math.round(rail.scrollLeft / step) + 1));
  };

  useEffect(() => {
    let cancelled = false;
    const portrait = new Image();
    portrait.src = clerdevPortrait;
    const minimum = new Promise((resolve) => window.setTimeout(resolve, 1100));
    const deadline = new Promise((resolve) => window.setTimeout(resolve, 3500));
    const assets = Promise.allSettled([portrait.decode(), document.fonts.ready]);
    void Promise.race([Promise.all([minimum, assets]), deadline]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

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
      setLightMode((current) => !current);
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
    const targets = document.querySelectorAll<HTMLElement>(
      ".section-heading, .about-copy, .achievement-card, .project-card, .arsenal-item, .accreditation-card, .cisco-minimal, .contact-copy, .contact-form",
    );
    const sections = document.querySelectorAll<HTMLElement>(".section");

    targets.forEach((target, index) => {
      target.classList.add("scroll-reveal");
      target.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
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
      { threshold: 0.12, rootMargin: "0px 0px -45px" },
    );

    targets.forEach((target) => observer.observe(target));
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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

  return (
    <main>
      {loaderVisible && <div className={`cosmic-loader${loading ? "" : " is-ready"}`} role="status" aria-live="polite">
        <div className="loader-system" aria-hidden="true"><i /><i /><i /><span /></div>
        <div className="loader-wordmark">Cler<span>Dev</span></div>
        <p>{loading ? "Aligning the stars" : "Welcome to my universe"}</p>
        <div className="loader-track" aria-hidden="true"><span /></div>
        <small>CODE · SECURITY · CURIOSITY</small>
      </div>}
      <div className="sky" aria-hidden="true"><div className="stars stars-one" /><div className="stars stars-two" /></div>
      <div className="scroll-warp" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
      </div>
      <div className="scroll-progress" aria-hidden="true"><span /></div>

      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="ClerDev home">
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

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="status-pill"><span className="status-dot" /> Open to internships &amp; opportunities</div>
          <p className="intro">Hello, world. I&apos;m</p>
          <h1>John Clerwin<br /><span>Dela Cruz.</span></h1>
          <div className="role-row">
            <span>&lt;Web Developer /&gt;</span>
            <span>&lt;Security Analyst /&gt;</span>
          </div>
          <p className="hero-description">4th-Year IT Student at the University of Makati, building resilient digital experiences at the intersection of <strong>code</strong> and <strong>cybersecurity</strong>.</p>
          <div className="hero-buttons">
            <a className="button" href="#projects">Explore my work <Icon name="arrow" size={18} /></a>
            <a className="text-link" href="#contact">Contact me <Icon name="chevron" size={16} /></a>
          </div>
          <div className="social-row">
            <span>Find me on</span>
            <a className="social-chip" href="https://github.com/ClerZ03-wq" target="_blank" rel="noreferrer" aria-label="GitHub"><Icon name="github" size={16} /><span>GitHub</span></a>
            <a className="social-chip" href="https://www.linkedin.com/in/clerz/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" size={16} /><span>LinkedIn</span></a>
            <a className="social-chip" href="https://www.facebook.com/clerz.pogi.meow/" target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="facebook" size={16} /><span>Facebook</span></a>
            <a className="aws-builder-link" href="https://builder.aws.com/community/@clerz" target="_blank" rel="noreferrer" aria-label="AWS Builder profile">
              <img src={awsBuilderLogo} alt="AWS Builder" />
              <span>AWS Builder</span>
            </a>
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
              <img className="avatar-photo" src={clerdevPortrait} alt="John Clerwin Dela Cruz at AWS" />
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

      <section className="section about-section" id="about" data-chapter="01">
        <span className="section-planet section-planet-cyan" aria-hidden="true"><i /></span>
        <SectionTitle eyebrow="01 / About" title="Driven by curiosity. Built for impact." />
        <div className="about-grid">
          <div className="about-copy">
            <div className="chapter-caption"><Icon name="code" size={16} /><span>THE MIND BEHIND THE MACHINE</span></div>
            <p className="lead">I&apos;m an aspiring SOC and Full-Stack Engineer who believes the best technology isn&apos;t just functional—it&apos;s <em>secure by design.</em></p>
            <p>My journey spans network defense, server administration, and thoughtful software engineering. I turn complex problems into reliable systems while constantly sharpening my understanding of the threats that challenge them.</p>
            <div className="about-meta">
              <div><span>Current base</span><strong>Makati City, PH</strong></div>
              <div><span>Education</span><strong>BS Information Technology</strong></div>
            </div>
            <div className="personal-principle"><span>MY NORTH STAR</span><p>Build thoughtfully.<br />Defend relentlessly.<br /><em>Never stop learning.</em></p><Icon name="spark" size={24} /></div>
          </div>
          <div className="achievements">
            <article className="achievement-card featured">
              <div className="achievement-icon"><Icon name="spark" /></div>
              <span>Academic Distinction</span>
              <h3>Dean&apos;s Lister</h3>
              <p>University of Makati</p>
              <b>Consistent excellence</b>
            </article>
            <article className="achievement-card">
              <div className="achievement-icon gold"><Icon name="badge" /></div>
              <span>Competition</span>
              <h3>1st Runner Up</h3>
              <p>Infotechnolympics</p>
            </article>
            <article className="achievement-card">
              <div className="achievement-icon violet"><Icon name="server" /></div>
              <span>TESDA Certified</span>
              <h3>NC II</h3>
              <p>Computer Systems Servicing</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section projects-section" id="projects" data-chapter="02">
        <span className="section-planet section-planet-gold" aria-hidden="true" />
        <div className="section-collection-header"><SectionTitle eyebrow="02 / Selected work" title="Featured projects." copy="Practical systems built to observe, protect, and improve the way organizations operate." /><button className="view-all-button" type="button" aria-haspopup="dialog" onClick={() => openCollection("projects")}>View all projects <span>{projects.length}</span><Icon name="arrow" size={16} /></button></div>
        <div className="project-grid">
          {projects.map((project) => <ProjectCard key={project.title} project={project} onView={setSelectedProject} />)}
        </div>
      </section>

      <section className="section arsenal-section" id="arsenal" data-chapter="03">
        <span className="section-planet section-planet-blue" aria-hidden="true"><i /></span>
        <div className="section-collection-header"><SectionTitle eyebrow="03 / Capabilities" title="Technical arsenal." copy="A versatile toolkit built for engineering modern systems and defending the infrastructure behind them." /><button className="view-all-button" type="button" aria-haspopup="dialog" onClick={() => openCollection("arsenal")}>View all skills <span>{arsenal.length}</span><Icon name="arrow" size={16} /></button></div>
        <div className="arsenal-grid">
          {arsenal.map((skill, index) => <ArsenalCard key={skill[0]} skill={skill} index={index} />)}
        </div>
      </section>

      <section className="section credentials-section" id="credentials" data-chapter="04">
        <span className="section-planet section-planet-indigo" aria-hidden="true"><i /></span>
        <div className="section-collection-header"><SectionTitle eyebrow="04 / Credentials" title="Verified accreditations." copy="Industry-recognized learning across the pillars of modern cybersecurity." /><button className="view-all-button" type="button" aria-haspopup="dialog" onClick={() => openCollection("credentials")}>View all credentials <span>{credentialCollection.length}</span><Icon name="arrow" size={16} /></button></div>
        <div className="accreditation-summary">
          <div className="collection-title"><Icon name="badge" size={18} /><div><strong>The credential collection</strong><small>06 cybersecurity · 02 community</small></div></div>
          <div className="collection-navigation"><span>{String(credentialPosition).padStart(2, "0")} / 08</span><button type="button" onClick={() => scrollCredentials(-1)} aria-label="Previous credentials"><Icon name="chevron" size={17} /></button><button type="button" onClick={() => scrollCredentials(1)} aria-label="Next credentials"><Icon name="chevron" size={17} /></button></div>
        </div>
        <div className="accreditation-rail" ref={credentialRail} onScroll={updateCredentialPosition} tabIndex={0} aria-label="Credential collection. Use arrow keys or swipe to browse.">
          {credentialCollection.map((badge, index) => <CredentialCard key={badge.name} badge={badge} index={index} />)}
        </div>
        <div className="cisco-minimal">
          <strong>CISCO</strong>
          <span>Networking Academy</span>
          <div><span>Cybersecurity</span><span>Networking</span><span>Endpoint Security</span></div>
        </div>
      </section>

      <section className="section contact-section" id="contact" data-chapter="05">
        <span className="section-planet section-planet-contact" aria-hidden="true" />
        <div className="contact-copy">
          <span className="eyebrow"><span className="eyebrow-line" />05 / Contact</span>
          <h2>Let&apos;s build something<br /><span>remarkable.</span></h2>
          <p>Have an opportunity, a security challenge, or an ambitious idea? I&apos;d love to hear about it.</p>
          <div className="contact-topics"><span>Internships</span><span>Collaboration</span><span>Security &amp; development</span></div>
          <a className="email-link" href="mailto:johnclerwindelacruz@gmail.com"><span><Icon name="mail" /></span><div><small>Drop me a line</small>johnclerwindelacruz@gmail.com</div></a>
          <div className="availability"><span /><div><strong>Available for opportunities</strong><small>Usually responds within 24 hours</small></div></div>
        </div>
        <form className="contact-form" action="https://formspree.io/f/xkoypkaa" method="POST" onSubmit={submitForm} aria-busy={sending}>
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

      {cyberproOpen && (
        <div className={`cyber-modal-backdrop${cyberproClosing ? " is-closing" : ""}`} role="presentation" onMouseDown={closeCyberpro}>
          <div className="cyber-modal" role="dialog" aria-modal="true" aria-labelledby="cyberpro-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="cyber-modal-close" type="button" onClick={closeCyberpro} aria-label="Close credential">
              <Icon name="x" size={18} />
            </button>

            <div className="cyber-id-visual">
              <div className="cyber-credential-frame">
                <img src={dictCyberproCredential} alt="QR code for John Clerwin Dela Cruz's DICT CyberPro verification" />
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

      <footer>
        <a className="brand" href="#home" aria-label="ClerDev home"><span>Cler<span>Dev</span></span></a>
        <p>Designed &amp; engineered under the stars by ClerDev.</p>
        <div><span>© 2025 John Clerwin Dela Cruz</span><button className="arcade-trigger" type="button" onClick={() => setArcadeOpen(true)} aria-label="Discover the Starfighter secret arcade" title="A little detour among the stars"><Icon name="spark" size={14} /><span>Secret sector</span></button><a href="#home" aria-label="Back to top">↑</a></div>
      </footer>
      {arcadeOpen && <SpaceFighter onClose={() => setArcadeOpen(false)} />}
      {collectionOpen && <CollectionDialog
        title={collectionOpen === "credentials" ? "Credential collection." : collectionOpen === "arsenal" ? "Technical arsenal." : "Project collection."}
        count={collectionOpen === "credentials" ? credentialCollection.length : collectionOpen === "arsenal" ? arsenal.length : projects.length}
        query={collectionQuery}
        onQueryChange={setCollectionQuery}
        onClose={() => setCollectionOpen(null)}
      >
        {(closeCollection) => <>
        <p className="collection-results" role="status">{collectionOpen === "credentials" ? filteredCredentials.length : collectionOpen === "arsenal" ? filteredArsenal.length : filteredProjects.length} results</p>
        {collectionOpen === "credentials" && <div className="credentials-section collection-credential-grid">{filteredCredentials.map(({ badge, index }) => <CredentialCard key={badge.name} badge={badge} index={index} />)}</div>}
        {collectionOpen === "arsenal" && <div className="arsenal-section"><div className="arsenal-grid">{filteredArsenal.map(({ skill, index }) => <ArsenalCard key={skill[0]} skill={skill} index={index} />)}</div></div>}
        {collectionOpen === "projects" && <div className="collection-project-list">{filteredProjects.map((project) => <article className="collection-project-row" key={project.title}>
          <span className="collection-project-number">{project.number}</span>
          <div className="collection-project-info"><span>{project.eyebrow}</span><h3>{project.title}</h3><div className="collection-project-meta"><span>{project.client}</span><span>{project.date}</span></div><p>{project.copy}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
          <button className="collection-project-link" type="button" onClick={() => closeCollection(() => setSelectedProject(project))} aria-label={`View details for ${project.title}`}>View details <Icon name="arrow" size={16} /></button>
        </article>)}</div>}
        {(collectionOpen === "credentials" ? filteredCredentials.length : collectionOpen === "arsenal" ? filteredArsenal.length : filteredProjects.length) === 0 && <div className="collection-empty"><Icon name="spark" size={28} /><h3>No matches in this constellation.</h3><p>Try another name, topic, or technology.</p><button type="button" className="text-link" onClick={() => setCollectionQuery("")}>Clear search</button></div>}
        </>}
      </CollectionDialog>}
      {selectedProject && <ProjectDetailsDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}

export default App;
