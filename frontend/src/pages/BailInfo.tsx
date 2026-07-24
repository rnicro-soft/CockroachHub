import { Scale, Gavel, BookOpen } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Accordion } from "../components/ui/Accordion";
import { SEO } from "../components/SEO";
import { useLocale } from "../hooks/useLocale";

const bailContent: Record<string, string> = {
  bailable: `For certain offences, bail is a RIGHT, not a favour. The police must release you on bail.\n\n**Common bailable offences relevant to protesters:**\n- Unlawful assembly (BNS 189)\n- Rioting (BNS 191) — if no weapons used\n- Public nuisance\n- Assault or criminal force (BNS 131)\n- Defamation\n\n**Bail process:**\n1. Police prepare a bail bond\n2. You or a friend pay the bond amount (typically ₹5,000 - ₹25,000)\n3. You sign a promise to appear in court\n4. You are released within hours\n\n**Key point:** Police CANNOT keep you in custody if you're willing to provide bail for a bailable offence. If they refuse, contact a lawyer immediately.\n\n**What to do:**\n- Ask: \"What section am I being arrested under?\"\n- Ask: \"Is this a bailable offence?\"\n- Call your lawyer or NALSA (15100) if police refuse bail\n- Arrange bail money — aim for ₹10,000-20,000 in cash`,
  "non-bailable": `For serious offences, bail is at the court's discretion. You must apply before a magistrate.\n\n**Common non-bailable offences relevant to protesters:**\n- Sedition/Acts endangering sovereignty (BNS 147) — up to life imprisonment or 7 years\n- Rioting with deadly weapons\n- Causing hurt to public servant\n- Arson\n- Damage to public property over ₹10,000\n\n**Bail process for non-bailable:**\n1. You will be produced before a magistrate within 24 hours\n2. Your lawyer files a bail application\n3. Public prosecutor may oppose bail\n4. Magistrate decides based on: severity, flight risk, evidence strength\n5. If magistrate denies bail, apply to Sessions Court or High Court\n\n**Typical bail amounts for protest-related NB offences:**\n- Personal bond: ₹10,000 - ₹50,000\n- Surety: One or two sureties of similar amount\n- Cash deposit in some cases\n\n**What to do:**\n- Ask for free legal aid (NALSA: 15100) if you can't afford a lawyer\n- Memorize phone numbers of at least 2 people who can act as sureties\n- Keep cash available for bail (₹25,000-50,000 recommended)`,
  anticipatory: `If you believe you MAY be arrested, you can apply for anticipatory bail BEFORE any arrest happens.\n\n**When to apply:**\n- You heard an FIR may be filed against you\n- You participated in a protest and expect police action\n- Someone has filed a complaint naming you\n\n**Process:**\n1. File application in Sessions Court or High Court\n2. Court issues notice to police\n3. Court may grant pre-arrest bail with conditions\n4. If granted, police cannot arrest you — only issue notice to appear\n\n**Key point:** Anticipatory bail is a powerful tool. If you're an organizer or visible participant, apply preemptively.\n\n**Where to apply:**\n- District Sessions Court — bail application fee ₹100-500\n- High Court — more expensive but faster for urgent matters\n- Legal aid lawyers can help file for free`,
  procedure: `1. **Arrest** — Police inform you of grounds (BNSS Section 35)\n2. **Phone call** — You have the right to inform a friend/family (BNSS Section 36)\n3. **Medical exam** — You have the right to be examined by a doctor\n4. **Production** — You must be produced before magistrate within 24 hours (Article 22(2))\n5. **First production** — Magistrate reviews arrest legality, informs you of rights, may grant bail\n6. **Remand** — If bail denied, police custody up to 15 days or judicial custody up to 60/90 days\n7. **Bail hearing** — Lawyer files bail application. Must be heard within 24 hours of application\n8. **Release** — If bail granted, you sign bond and are released. Usually takes 2-12 hours after order\n\n**Total time if arrested for bailable offence:** 6-24 hours before release\n**Total time if arrested for non-bailable:** 2-30 days depending on court backlog`,
  "legal-aid": `**NALSA Helpline: 15100** — Free legal aid available to all citizens. Women, children, SC/ST, persons in custody are automatically eligible.\n\n**District Legal Services Authority (DLSA):**\n- Present at every district court\n- Free lawyer provided within hours\n- Covers bail applications, legal representation\n\n**On-site legal aid at protests:**\n- Legal Aid Collective lawyers are typically present at major protest sites\n- Look for white/khadi uniforms or \"Legal Aid\" signs\n- Pro bono lawyers from local law schools may also be present\n\n**Recommended to carry:**\n- Aadhaar card or any ID (for bail bond)\n- Phone number of 2 family/friends who can act as sureties\n- ₹10,000-20,000 cash minimum\n- NALSA helpline: 15100 (save in phone)`,
};

const bailGuideIds = ["bailable", "non-bailable", "anticipatory", "procedure", "legal-aid"];

export default function BailInfo() {
  const { t } = useLocale();
  return (
      <>
      <SEO title={t("bail.seoTitle")} description={t("bail.seoDesc")} path="/bail-info" />
<div className="mx-auto max-w-4xl space-y-5">
      <div className="ph-section">
        <div>
          <h2>{t("bail.title")}</h2>
          <div className="ph-section-accent" />
        </div>
      </div>

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <div className="flex items-start gap-3">
          <Gavel className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
          <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
            <p className="font-bold text-ph-text-dark dark:text-white">{t("bail.important")}</p>
            <p className="mt-1">{t("bail.importantText")}</p>
          </div>
        </div>
      </Card>

      <Accordion
        items={bailGuideIds.map((id) => ({
          id,
          title: t(`bailGuide.${id}.title`),
          content: bailContent[id] || "",
        }))}
      />

      <Card className="border-ph-orange/20 bg-ph-orange-muted p-4">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-ph-orange" />
          <div className="text-sm text-ph-text-dark dark:text-ph-text-secondary">
            <p className="font-bold text-ph-text-dark dark:text-white">{t("bail.memorize")}</p>
            <p className="mt-1">{t("bail.memorizeText")}</p>
          </div>
        </div>
      </Card>
    </div>
      </>
);
}