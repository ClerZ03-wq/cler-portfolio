import clerdevPortrait from "../assets/clerdev-portrait.jpg";
import dictCyberproCredential from "../assets/dict-cyberpro-level-2.png";
import awsBuilderLogo from "../assets/aws-builder-logo.png";
import awsStudentBuilderBadge from "../assets/badges/aws-student-builder.png";
import ibmCloudBadge from "../assets/badges/ibm-cloud-security.png";
import ibmGrcBadge from "../assets/badges/ibm-grc.png";
import ibmForensicsBadge from "../assets/badges/ibm-incident-forensics.png";
import ibmSecurityOperationsBadge from "../assets/badges/ibm-security-operations.png";
import ibmSystemNetworkBadge from "../assets/badges/ibm-system-network-security.png";
import ibmVulnerabilityBadge from "../assets/badges/ibm-vulnerability-management.png";
import isc2Badge from "../assets/badges/isc2-badge.png";

const bundledAssets: Record<string, string> = {
  "asset:clerdevPortrait": clerdevPortrait,
  "asset:dictCyberproCredential": dictCyberproCredential,
  "asset:awsBuilderLogo": awsBuilderLogo,
  "asset:awsStudentBuilder": awsStudentBuilderBadge,
  "asset:ibmCloudSecurity": ibmCloudBadge,
  "asset:ibmGrc": ibmGrcBadge,
  "asset:ibmIncidentForensics": ibmForensicsBadge,
  "asset:ibmSecurityOperations": ibmSecurityOperationsBadge,
  "asset:ibmSystemNetworkSecurity": ibmSystemNetworkBadge,
  "asset:ibmVulnerabilityManagement": ibmVulnerabilityBadge,
  "asset:isc2Badge": isc2Badge,
};

export function resolveAssetUrl(src: string | undefined): string {
  if (!src) return "";

  // Check bundled dictionary key
  if (bundledAssets[src]) {
    return bundledAssets[src];
  }

  // Already a full web URL or data URL
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  // Relative path (like /uploads/photo.png)
  return src;
}
