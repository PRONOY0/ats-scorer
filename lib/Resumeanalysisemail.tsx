import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";

interface ResumeAnalysisEmailProps {
    userName: string;
    resumeTitle: string;
    targetRole: string;
    atsScore: number;
    scoreLabel: string;
    strengthsCount: number;
    weaknessesCount: number;
    suggestionsCount: number;
    topImprovementMessage: string;
    scanCount: number;
    resultUrl: string;
    analyzedDate: string;
}

const LOGO_SRC = "https://ats-scorer-pearl.vercel.app/favicon.ico";

const colors = {
    bg: "#f5f4f0",
    dark: "#5a5a40",
    muted: "#abab9d",
    ink: "#2b2b22",
    inkSoft: "#3a3a2f",
    border: "#e2e0d8",
    borderDashed: "#c9c7b8",
    noteBg: "#efeee7",
    text: "#7a7a6e",
};

export function formatTargetRole(role: string) {
    const special: Record<string, string> = {
        AI: "AI",
        ML: "ML",
        UI: "UI",
        UX: "UX",
        IOS: "iOS",
        DEVOPS: "DevOps",
    };

    return role
        .split("_")
        .map((word) => special[word] ?? word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

export const ResumeAnalysisEmail = ({
    userName = "there",
    targetRole = "Fullstack Developer",
    atsScore = 0,
    scoreLabel = "Analysis complete",
    strengthsCount = 0,
    weaknessesCount = 0,
    suggestionsCount = 0,
    topImprovementMessage = "Add measurable impact to your bullet points.",
    scanCount = 1,
    resultUrl = "https://example.com",
    analyzedDate = "",
}: ResumeAnalysisEmailProps) => {
    const previewText = `Your resume scored ${atsScore}/100 for ${formatTargetRole(targetRole)}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Row>
                            <Column>
                                <table cellPadding={0} cellSpacing={0} role="presentation">
                                    <tbody>
                                        <tr>
                                            <td style={{ paddingRight: "10px" }}>
                                                <Img
                                                    src={LOGO_SRC}
                                                    width="32"
                                                    height="32"
                                                    alt="ATSS'S"
                                                    style={logoImg}
                                                />
                                            </td>
                                            <td style={brandText}>ATSS&apos;S</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Column>
                            <Column align="right">
                                <Text style={headerLabel}>RESUME&nbsp;ANALYSIS</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Headline */}
                    <Section style={{ paddingTop: "40px" }}>
                        <Text style={headline}>
                            Your analysis is <span style={headlineEm}>complete</span>.
                        </Text>
                        <Text style={subhead}>
                            Hi {userName}, the algorithms have finished reading your resume for the {formatTargetRole(targetRole)} role. Here&apos;s where you stand.
                        </Text>
                    </Section>

                    {/* Score card */}
                    <Section style={scoreCard}>
                        <Row>
                            <Column>
                                <Text style={cardLabel}>ATS&nbsp;SCORE&nbsp;RESULT</Text>
                            </Column>
                            <Column align="right">
                                <Text style={cardLabelMuted}>SCAN&nbsp;#{scanCount}</Text>
                            </Column>
                        </Row>
                        <Row>
                            <Column align="center">
                                <Text style={scoreNumber}>
                                    {atsScore}
                                    <span style={scoreOutOf}>/100</span>
                                </Text>
                                <Text style={scoreLabelText}>{scoreLabel}</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Stats row */}
                    <Section style={{ paddingTop: "20px" }}>
                        <Row>
                            <Column style={statBox}>
                                <Text style={{ ...statNumber, color: colors.dark }}>
                                    {strengthsCount}
                                </Text>
                                <Text style={statLabel}>STRENGTHS</Text>
                            </Column>
                            <Column style={{ width: "12px" }} />
                            <Column style={statBox}>
                                <Text style={{ ...statNumber, color: "#9c8f6e" }}>
                                    {weaknessesCount}
                                </Text>
                                <Text style={statLabel}>WEAKNESSES</Text>
                            </Column>
                            <Column style={{ width: "12px" }} />
                            <Column style={statBox}>
                                <Text style={{ ...statNumber, color: colors.ink }}>
                                    {suggestionsCount}
                                </Text>
                                <Text style={statLabel}>SUGGESTIONS</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Top improvement note */}
                    <Section style={noteBox}>
                        <Text style={noteLabel}>TOP&nbsp;PRIORITY</Text>
                        <Text style={noteText}>{topImprovementMessage}</Text>
                    </Section>

                    {/* CTA */}
                    <Section style={{ paddingTop: "36px", textAlign: "center" }}>
                        <Button href={resultUrl} style={ctaButton}>
                            VIEW FULL REPORT &nbsp;→
                        </Button>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>Analyzed on {analyzedDate}</Text>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} ATSS&apos;S — Precision resume
                            intelligence.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default ResumeAnalysisEmail;

// ---- styles ----

const main = {
    backgroundColor: colors.bg,
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: "48px 0",
};

const container = {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: colors.bg,
};

const header = {
    paddingBottom: "28px",
    borderBottom: `1px solid ${colors.border}`,
};

const logoImg = {
    display: "block",
    borderRadius: "50%",
};

const brandText = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "18px",
    fontWeight: 700,
    color: colors.ink,
    letterSpacing: "0.5px",
};

const headerLabel = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "11px",
    letterSpacing: "1px",
    color: colors.muted,
    margin: 0,
};

const headline = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "38px",
    lineHeight: "1.2",
    color: colors.ink,
    fontWeight: 400,
    margin: 0,
};

const headlineEm = {
    color: colors.dark,
    fontStyle: "italic",
};

const subhead = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "14.5px",
    lineHeight: "1.7",
    color: colors.text,
    maxWidth: "480px",
    marginTop: "18px",
};

const scoreCard = {
    border: `1px dashed ${colors.borderDashed}`,
    borderRadius: "10px",
    padding: "24px 32px 28px 32px",
    marginTop: "36px",
};

const cardLabel = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "10.5px",
    letterSpacing: "1.5px",
    color: colors.muted,
    margin: 0,
};

const cardLabelMuted = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "10.5px",
    letterSpacing: "1px",
    color: colors.muted,
    margin: 0,
};

const scoreNumber = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "72px",
    lineHeight: "1",
    color: colors.ink,
    fontWeight: 400,
    marginTop: "8px",
    marginBottom: 0,
};

const scoreOutOf = {
    fontSize: "24px",
    color: colors.muted,
};

const scoreLabelText = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "12px",
    letterSpacing: "0.5px",
    color: colors.text,
    marginTop: "8px",
};

const statBox = {
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    padding: "18px 16px",
    textAlign: "center" as const,
    width: "32%",
};

const statNumber = {
    fontFamily: "Georgia, serif",
    fontSize: "24px",
    margin: 0,
};

const statLabel = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "1px",
    color: colors.muted,
    marginTop: "4px",
};

const noteBox = {
    borderLeft: `2px solid ${colors.dark}`,
    backgroundColor: colors.noteBg,
    padding: "16px 22px",
    marginTop: "28px",
};

const noteLabel = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: colors.dark,
    margin: "0 0 5px 0",
};

const noteText = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "13.5px",
    lineHeight: "1.6",
    color: colors.inkSoft,
    margin: 0,
};

const ctaButton = {
    backgroundColor: colors.dark,
    borderRadius: "24px",
    color: colors.bg,
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "12px",
    letterSpacing: "1px",
    fontWeight: 600,
    textDecoration: "none",
    padding: "14px 34px",
    display: "inline-block",
};

const footer = {
    paddingTop: "44px",
    borderTop: `1px solid ${colors.border}`,
    marginTop: "36px",
};

const footerText = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "11px",
    color: colors.muted,
    textAlign: "center" as const,
    lineHeight: "1.7",
    margin: "6px 0",
};