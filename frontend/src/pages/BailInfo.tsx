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

const bailContentHi: Record<string, string> = {
  bailable: `कुछ अपराधों के लिए, ज़मानत एक अधिकार है, एहसान नहीं। पुलिस को आपको ज़मानत पर रिहा करना होगा।\n\n**प्रदर्शनकारियों के लिए सामान्य ज़मानती अपराध:**\n- गैरकानूनी सभा (BNS 189)\n- दंगा (BNS 191) — यदि हथियारों का उपयोग नहीं किया गया\n- सार्वजनिक उपद्रव\n- हमला या आपराधिक बल (BNS 131)\n- मानहानि\n\n**ज़मानत प्रक्रिया:**\n1. पुलिस ज़मानत बॉन्ड तैयार करती है\n2. आप या कोई मित्र बॉन्ड राशि का भुगतान करते हैं (आमतौर पर ₹5,000 - ₹25,000)\n3. आप अदालत में पेश होने का वादा करते हैं\n4. आपको घंटों के भीतर रिहा कर दिया जाता है\n\n**मुख्य बात:** यदि आप ज़मानती अपराध के लिए ज़मानत देने को तैयार हैं तो पुलिस आपको हिरासत में नहीं रख सकती। यदि वे मना करते हैं, तो तुरंत वकील से संपर्क करें।\n\n**क्या करें:**\n- पूछें: \"मुझे किस धारा में गिरफ़्तार किया जा रहा है?\"\n- पूछें: \"क्या यह ज़मानती अपराध है?\"\n- यदि पुलिस ज़मानत से इनकार करे तो अपने वकील या NALSA (15100) को कॉल करें\n- ज़मानत के लिए ₹10,000-20,000 नकद रखें`,
  "non-bailable": `गंभीर अपराधों के लिए, ज़मानत अदालत के विवेक पर निर्भर करती है। आपको मजिस्ट्रेट के समक्ष आवेदन करना होगा।\n\n**प्रदर्शनकारियों के लिए सामान्य गैर-ज़मानती अपराध:**\n- राजद्रोह/संप्रभुता को खतरे में डालने वाले कार्य (BNS 147) — आजीवन कारावास या 7 वर्ष तक\n- घातक हथियारों से दंगा\n- लोक सेवक को चोट पहुँचाना\n- आगजनी\n- ₹10,000 से अधिक की सार्वजनिक संपत्ति को नुकसान\n\n**गैर-ज़मानती के लिए प्रक्रिया:**\n1. आपको 24 घंटे के भीतर मजिस्ट्रेट के सामने पेश किया जाएगा\n2. आपका वकील ज़मानत आवेदन दाखिल करता है\n3. लोक अभियोजक ज़मानत का विरोध कर सकता है\n4. मजिस्ट्रेट गंभीरता, भागने के जोखिम, सबूतों की ताकत के आधार पर निर्णय लेता है\n5. यदि मजिस्ट्रेट ज़मानत नकारता है, तो सेशन कोर्ट या हाई कोर्ट में अपील करें\n\n**क्या करें:**\n- यदि वकील नहीं खरीद सकते तो मुफ़्त कानूनी सहायता (NALSA: 15100) माँगें\n- कम से कम 2 लोगों के फोन नंबर याद रखें जो ज़मानत पर हस्ताक्षर कर सकें\n- ज़मानत के लिए ₹25,000-50,000 नकद रखें`,
  anticipatory: `यदि आपको लगता है कि आपको गिरफ़्तार किया जा सकता है, तो आप गिरफ़्तारी से पहले अग्रिम ज़मानत के लिए आवेदन कर सकते हैं।\n\n**कब आवेदन करें:**\n- आपने सुना कि आपके खिलाफ FIR दर्ज हो सकती है\n- आपने प्रदर्शन में भाग लिया और पुलिस कार्रवाई की उम्मीद है\n- किसी ने आपका नाम लेकर शिकायत दर्ज कराई है\n\n**प्रक्रिया:**\n1. सेशन कोर्ट या हाई कोर्ट में आवेदन दाखिल करें\n2. अदालत पुलिस को नोटिस जारी करती है\n3. अदालत शर्तों के साथ पूर्व-गिरफ़्तारी ज़मानत दे सकती है\n4. यदि मिल जाती है, तो पुलिस आपको गिरफ़्तार नहीं कर सकती — केवल पेश होने का नोटिस दे सकती है\n\n**मुख्य बात:** अग्रिम ज़मानत एक शक्तिशाली उपकरण है। यदि आप आयोजक या दृश्य भागीदार हैं, तो पहले से आवेदन करें।\n\n**कहाँ आवेदन करें:**\n- जिला सेशन कोर्ट — ज़मानत आवेदन शुल्क ₹100-500\n- हाई कोर्ट — अधिक खर्चीला लेकिन तत्काल मामलों के लिए तेज़`,
  procedure: `1. **गिरफ़्तारी** — पुलिस आपको कारण बताती है (BNSS धारा 35)\n2. **फोन कॉल** — आपको किसी मित्र/परिवार को सूचित करने का अधिकार है (BNSS धारा 36)\n3. **मेडिकल जाँच** — आपको डॉक्टर से जाँच कराने का अधिकार है\n4. **पेशी** — आपको 24 घंटे के भीतर मजिस्ट्रेट के सामने पेश किया जाना चाहिए (अनुच्छेद 22(2))\n5. **पहली पेशी** — मजिस्ट्रेट गिरफ़्तारी की वैधता की समीक्षा करता है, अधिकारों की जानकारी देता है, ज़मानत दे सकता है\n6. **रिमांड** — यदि ज़मानत नकारी जाती है, तो पुलिस हिरासत 15 दिन तक या न्यायिक हिरासत 60/90 दिन तक\n7. **ज़मानत सुनवाई** — वकील ज़मानत आवेदन दाखिल करता है। आवेदन के 24 घंटे के भीतर सुनवाई होनी चाहिए\n8. **रिहाई** — यदि ज़मानत मिलती है, तो आप बॉन्ड पर हस्ताक्षर करते हैं और रिहा हो जाते हैं। आमतौर पर आदेश के 2-12 घंटे बाद\n\n**ज़मानती अपराध में कुल समय:** 6-24 घंटे\n**गैर-ज़मानती अपराध में कुल समय:** 2-30 दिन (अदालत के बैकलॉग पर निर्भर)`,
  "legal-aid": `**NALSA हेल्पलाइन: 15100** — सभी नागरिकों के लिए मुफ़्त कानूनी सहायता उपलब्ध। महिलाएँ, बच्चे, SC/ST, हिरासत में लिए गए व्यक्ति स्वतः पात्र हैं।\n\n**जिला कानूनी सेवा प्राधिकरण (DLSA):**\n- हर जिला अदालत में मौजूद\n- घंटों के भीतर मुफ़्त वकील उपलब्ध\n- ज़मानत आवेदन, कानूनी प्रतिनिधित्व शामिल\n\n**प्रदर्शन स्थल पर कानूनी सहायता:**\n- लीगल एड कलेक्टिव के वकील आमतौर पर प्रमुख प्रदर्शन स्थलों पर मौजूद होते हैं\n- सफ़ेद/खादी वर्दी या \"कानूनी सहायता\" के संकेत देखें\n- स्थानीय लॉ स्कूलों के प्रो बोनो वकील भी मौजूद हो सकते हैं\n\n**साथ रखने की सलाह:**\n- आधार कार्ड या कोई पहचान पत्र (ज़मानत बॉन्ड के लिए)\n- 2 परिवार/मित्रों के फोन नंबर जो ज़मानत पर हस्ताक्षर कर सकें\n- कम से कम ₹10,000-20,000 नकद\n- NALSA हेल्पलाइन: 15100 (फ़ोन में सेव करें)`,
};

const bailGuideIds = ["bailable", "nonBailable", "anticipatory", "procedure", "legalAid"];

export default function BailInfo() {
  const { t, locale } = useLocale();
  const content = locale === "hi" ? bailContentHi : bailContent;
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
          content: content[id] || "",
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