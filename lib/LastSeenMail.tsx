import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

type LastSeenMailProps = {
    userName?: string;
    dashboardUrl: string;
    daysSinceLastSeen?: number;
};

export function LastSeenMail({
    userName = "there",
    dashboardUrl,
    daysSinceLastSeen = 7,
}: LastSeenMailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your resume is waiting for you.</Preview>

            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Text style={heading}>Your resume is waiting.</Text>

                        <Text style={paragraph}>
                            Hi {userName},
                        </Text>

                        <Text style={paragraph}>
                            It&apos;s been {daysSinceLastSeen} days since your last visit to
                            ATSS&apos;S. Your resume is still ready to review whenever you are.
                        </Text>

                        <Text style={paragraph}>
                            You can open your dashboard, update your resume, or run another
                            ATS analysis to see where you stand.
                        </Text>

                        <Button href={dashboardUrl} style={button}>
                            Open Dashboard
                        </Button>

                        <Text style={footer}>
                            You&apos;re receiving this reminder because you have an ATSS&apos;S
                            account.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

export default LastSeenMail;

const main = {
    backgroundColor: "#f5f4f0",
    fontFamily: "Arial, sans-serif",
    padding: "40px 0",
};

const container = {
    backgroundColor: "#ffffff",
    maxWidth: "560px",
    margin: "0 auto",
    padding: "32px",
    borderRadius: "12px",
};

const heading = {
    fontSize: "26px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#2b2b22",
    margin: "0 0 20px",
};

const paragraph = {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#555",
    margin: "0 0 16px",
};

const button = {
    backgroundColor: "#5a5a40",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    display: "inline-block",
    marginTop: "12px",
};

const footer = {
    fontSize: "12px",
    lineHeight: "1.6",
    color: "#999",
    marginTop: "32px",
};