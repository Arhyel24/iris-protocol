import { generateBasicEmail, generateClaimEmail, generateInsuranceEmail } from "@/services/emailService";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, type, data } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let subject = "IRIS Protocol Notification";
    let html = `<p>You have a new notification from IRIS Protocol.</p>`;

    switch (type) {
      case "insurancePurchase":
        subject = "Insurance Purchase Confirmation";
        html = generateInsuranceEmail(
          "Insurance Purchased Successfully",
          `Your ${data.tier} insurance policy has been purchased and is now active.`,
          data.tier,
          data.coverage,
          data.expiry
        );
        break;
      case "insuranceRenew":
        subject = "Insurance Renewed Successfully";
        html = generateInsuranceEmail(
          "Insurance Renewed Successfully",
          `Your ${data.tier} insurance policy has been renewed and is now active.`,
          data.tier,
          data.coverage,
          data.expiry
        );
        break;
      case "insuranceUpgrade":
        subject = "Insurance Upgraded Successfully";
        html = generateInsuranceEmail(
          "Insurance Upgraded Successfully",
          `Your insurance policy has been upgraded from ${data.oldTier} to ${data.newTier}.`,
          data.newTier,
          data.coverage,
          data.expiry || "30 days from today"
        );
        break;
      case "insuranceDowngrade":
        subject = "Insurance Plan Changed";
        html = generateInsuranceEmail(
          "Insurance Plan Changed",
          `Your insurance policy has been changed from ${data.oldTier} to ${data.newTier}.`,
          data.newTier,
          data.coverage,
          data.expiry || "30 days from today"
        );
        break;
      case "insuranceCancel":
        subject = "Insurance Cancellation Confirmation";
        html = generateBasicEmail(
          "Insurance Cancelled",
          `Your ${data.tier} insurance policy has been cancelled successfully. We hope to see you back soon!`
        );
        break;
      case "claimSubmitted":
        subject = "Claim Submitted Successfully";
        html = generateClaimEmail(
          "Claim Submitted Successfully",
          `Your claim #${data.claimId} for ${data.amount} has been submitted successfully and is now being processed.`
        );
        break;
      case "claimApproved":
        subject = "Claim Approved";
        html = generateClaimEmail(
          "Claim Approved",
          `Great news! Your claim #${data.claimId} for ${data.amount} has been approved.`
        );
        break;
      case "claimRejected":
        subject = "Claim Update";
        html = generateClaimEmail(
          "Claim Update",
          `Your claim #${data.claimId} for ${data.amount} could not be approved at this time.`
        );
        break;
      case "protectionEnabled":
        subject = "Protection Enabled";
        html = generateBasicEmail(
          "Protection Enabled",
          `Protection has been enabled for your account. Your assets are now being monitored for risks.`
        );
        break;
      case "protectionDisabled":
        subject = "Protection Disabled";
        html = generateBasicEmail(
          "Protection Disabled",
          `Protection has been disabled for your account. Your assets are no longer being monitored for risks.`
        );
        break;
      default:
        html = generateBasicEmail(
          "Notification",
          "You have a new notification from IRIS Protocol."
        );
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "IRIS Protocol <notifications@irisprotocol.com>",
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("Email error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ data: emailData }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export function OPTIONS() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return new NextResponse(null, { status: 200, headers });
}
