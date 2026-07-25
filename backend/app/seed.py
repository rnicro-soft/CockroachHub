from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.config import settings
from app.database import async_session, init_db
import json as json_mod
from app.models import Admin, Alert, EmergencyContact, FactCheck, LegalRight, MetroStation, SafeZone
from app.metro_data import METRO_STATIONS

SEED_CONTACTS = [
    {"name": "National Human Rights Commission (NHRC)", "phone": "14440", "category": "legal", "description": "National human rights complaint helpline. Toll-free.", "city": "National"},
    {"name": "National Legal Services Authority (NALSA)", "phone": "15100", "category": "legal", "description": "Free legal aid helpline. Available to all citizens.", "city": "National"},
    {"name": "National Commission for Women", "phone": "7827170170", "category": "legal", "description": "Women's rights complaint helpline (WhatsApp). Also dial 181.", "city": "National"},
    {"name": "Women's Helpline (National)", "phone": "181", "category": "legal", "description": "National women's helpline — One Stop Centre Scheme. 24/7.", "city": "National"},
    {"name": "Lawyers Collective", "phone": "011-24372923", "category": "legal", "description": "Legal aid collective for human rights cases.", "city": "Delhi"},
    {"name": "Ambulance - Emergency Medical Services", "phone": "108", "category": "medical", "description": "National emergency medical ambulance service.", "city": "National"},
    {"name": "AIIMS Emergency", "phone": "011-26588500", "category": "medical", "description": "AIIMS Delhi emergency helpline.", "city": "Delhi"},
    {"name": "Medico Friends Circle", "phone": "011-26411265", "category": "medical", "description": "Volunteer medical network for protesters.", "city": "Delhi"},
    {"name": "Child Helpline", "phone": "1098", "category": "helpline", "description": "National child helpline — 24/7. CHILDLINE India Foundation.", "city": "National"},
    {"name": "Women in Distress (Delhi)", "phone": "1091", "category": "helpline", "description": "Women in distress helpline. Available in select states.", "city": "Delhi"},
]

SEED_RIGHTS = [
    {
        "title": "Right to Remain Silent (Article 20(3))",
        "content": "Under Article 20(3) of the Constitution of India, no person accused of any offence shall be compelled to be a witness against themselves. This means:\n\n• You have the right to remain silent during police questioning.\n• Police cannot force you to confess or make statements.\n• Silence cannot be held against you in court.\n• You have the right to consult a lawyer before answering any questions.\n\n**What to do:**\n- When detained, immediately ask for a lawyer.\n- Do not sign any documents without your lawyer present.\n- You may say: \"I wish to remain silent and will speak only in the presence of my lawyer.\"",
        "category": "detention",
        "sort_order": 1,
    },
    {
        "title": "Right to Inform Family / Friend (BNSS Section 36)",
        "content": "Under the Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Section 36, every arrested person has the right to have a nominated person informed of their arrest.\n\n• Police must inform you of this right immediately upon arrest.\n• You have the right to make a phone call to inform someone.\n• This right exists regardless of the alleged offence.\n\n**What to do:**\n- Immediately ask to make a phone call.\n- Memorize at least one emergency contact number.\n- If police refuse, note their names and badge numbers.",
        "category": "detention",
        "sort_order": 2,
    },
    {
        "title": "Produced Before Magistrate Within 24 Hours (Article 22(2), BNSS Section 176)",
        "content": "Article 22(2) of the Constitution and BNSS Section 176 mandate that an arrested person must be produced before a magistrate within 24 hours of arrest (excluding travel time).\n\n• This prevents illegal detention.\n• The magistrate reviews whether the arrest is lawful.\n• If the 24-hour limit is violated, the detention becomes illegal.\n\n**What to do:**\n- Keep track of the time of your arrest.\n- Inform your lawyer if not produced within 24 hours.\n- File a habeas corpus petition if illegally detained.",
        "category": "detention",
        "sort_order": 3,
    },
    {
        "title": "Rights During Search & Seizure (BNSS Sections 104-105)",
        "content": "BNSS Sections 104-105 provide protections during searches:\n\n• Police must conduct searches in the presence of two independent witnesses (panchas).\n• You have the right to be present during the search of your premises.\n• A search warrant must be shown before entering your premises (with limited exceptions).\n• You have the right to receive a copy of the search list/inventory.\n• Women cannot be searched by male officers — only by female officers.\n• Searches may be video recorded as a safeguard.\n\n**What to do:**\n- Ask to see the search warrant.\n- Record the search on your phone if possible.\n- Note names of the police officers and panch witnesses.\n- Demand a copy of the search inventory.",
        "category": "search_seizure",
        "sort_order": 4,
    },
    {
        "title": "Right to Free Legal Aid (Article 39A, BNSS Section 386)",
        "content": "Article 39A of the Constitution guarantees free legal aid. BNSS Section 386 provides legal aid at state expense:\n\n• If you cannot afford a lawyer, the state must provide one free of cost.\n• This right applies from the moment of arrest.\n• The magistrate must inform you of this right at first production.\n• Legal aid lawyers available at all district courts.\n\n**What to do:**\n- State clearly: \"I cannot afford a lawyer. I request free legal aid.\"\n- Contact District Legal Services Authority (DLSA).\n- NALSA helpline: 15100",
        "category": "questioning",
        "sort_order": 5,
    },
    {
        "title": "No Torture or Cruel Treatment (Article 21, BNS Section 330)",
        "content": "Article 21 of the Constitution guarantees the right against torture. BNS Section 330 (replacing IPC) makes it a crime to cause hurt to extort confession:\n\n• Police cannot use physical force, threats, or intimidation.\n• Confessions under duress are not admissible as evidence.\n• You have the right to medical examination immediately upon arrest.\n\n**What to do:**\n- If tortured, demand immediate medical examination.\n- File complaint with magistrate or NHRC (helpline: 14440).\n- Preserve evidence of injuries (photos, medical reports).",
        "category": "questioning",
        "sort_order": 6,
    },
    {
        "title": "Right to Bail for Bailable Offences (BNSS Section 478)",
        "content": "BNSS Section 478 provides that a person arrested for a bailable offence has the right to be released on bail:\n\n• Bail is a right, not a favour, for bailable offences.\n• Police cannot keep you in custody if you provide bail.\n• For non-bailable offences, bail is at court discretion.\n\n**What to do:**\n- Ask what section you are being arrested under.\n- Check if the offence is bailable.\n- Arrange for bail as quickly as possible.",
        "category": "detention",
        "sort_order": 7,
    },
    {
        "title": "Rights of Women During Arrest (BNSS Section 47)",
        "content": "BNSS Section 47 provides special protections for women during arrest:\n\n• A woman cannot be arrested before sunrise or after sunset without magistrate permission.\n• Only a female police officer can arrest a woman.\n• Female arrestees must be searched only by female officers.\n• Women have the right to be kept in separate lock-ups.\n\n**What to do:**\n- Assert these rights if violated.\n- Note time if arrested at night illegally.\n- Contact women's helpline: 181 or 1091.",
        "category": "detention",
        "sort_order": 8,
    },
]

SEED_ALERTS = [
    {
        "type": "safety",
        "title": "Active Police Blockade at Jantar Mantar",
        "description": "Large police presence reported at Jantar Mantar. Multiple barricades set up. Protesters advised to avoid the area and use alternative routes to reach the venue.",
        "severity": "red",
        "location": "Jantar Mantar, Delhi",
    },
    {
        "type": "medical",
        "title": "Medical Aid Tent at India Gate",
        "description": "Volunteer medical team stationed near India Gate roundabout. Providing first aid, ORS, and basic medical supplies free of charge.",
        "severity": "green",
        "location": "India Gate, Delhi",
    },
    {
        "type": "general",
        "title": "Hydration Points Available",
        "description": "Free water bottles and ORS packets available at multiple locations along the protest route. Look for white and green flags.",
        "severity": "green",
        "location": "Multiple locations, Delhi",
    },
    {
        "type": "legal",
        "title": "Pro Bono Legal Aid Available",
        "description": "Lawyers from the Legal Aid Collective are present at the protest site. Any detained protester will receive free legal representation. Contact the helpline for immediate assistance.",
        "severity": "yellow",
        "location": "Protest site, Delhi",
    },
    {
        "type": "safety",
        "title": "Tear Gas Reported Near Central Secretariat",
        "description": "Police have deployed tear gas near Central Secretariat metro station. Move to higher ground immediately. Use wet cloth over nose and mouth. Do not rub eyes.",
        "severity": "red",
        "location": "Central Secretariat, Delhi",
    },
    {
        "type": "general",
        "title": "Massive Crowd Gathers at Ramlila Maidan",
        "description": "Over 50,000 protesters gathered peacefully at Ramlila Maidan. Student leaders addressing the crowd. Arrangements for food and water being made.",
        "severity": "yellow",
        "location": "Ramlila Maidan, Delhi",
    },
]

SEED_FACT_CHECKS = [
    {
        "title": "NEET 2024 Paper Leak Verdict",
        "claim": "The CBI has confirmed a coordinated leak involving multiple examination centers across 6 states.",
        "verdict": "true",
        "explanation": "The CBI investigation found evidence of a coordinated paper leak in NEET-UG 2024 across Bihar, Gujarat, Maharashtra, Rajasthan, Haryana, and Uttar Pradesh. Multiple arrests have been made. The Supreme Court took suo moto cognizance. As of July 2026, PM Modi announced fast-track courts for paper leak cases.",
        "source": "CBI official statement, Supreme Court records, Times of India",
        "is_published": True,
    },
    {
        "title": "PM Modi Announces Fast-Track Courts for Paper Leaks",
        "claim": "PM Modi announced fast-track courts for NEET and other exam paper leak cases.",
        "verdict": "true",
        "explanation": "On July 23, 2026, PM Modi confirmed fast-track courts for paper leak cases, stating 'Nothing is more important than the welfare and future of our youth.' Education Minister Pradhan continues to face sustained resignation demands from CJP-led protests at Jantar Mantar.",
        "source": "Times of India, PMO India, July 23, 2026",
        "is_published": True,
    },
    {
        "title": "CBI Gives Clean Chit to NEET Kingpin",
        "claim": "CBI gave clean chit to alleged kingpin Sanjeev Mukhiya in the NEET paper leak case.",
        "verdict": "true",
        "explanation": "The CBI found 'no evidence' against Sanjeev Mukhiya, the alleged kingpin in the NEET-UG 2024 paper leak case. 13 others remain arrested. This has sparked further outrage among student protesters led by the Cockroach Janta Party (CJP).",
        "source": "Times of India, July 23, 2026",
        "is_published": True,
    },
    {
        "title": "Rumor: 10,000 students arrested at protests",
        "claim": "Over 10,000 students arrested during NEET protests across India.",
        "verdict": "false",
        "explanation": "Exaggerated. ~350-400 detained across Delhi, Lucknow, Patna over 3 days. Most released within 24h.",
        "source": "Verified news reports, legal aid volunteers",
        "is_published": True,
    },
    {
        "title": "Supreme Court Hearing on NEET Scam",
        "claim": "The Supreme Court is hearing a petition to cancel NEET-UG 2024 results.",
        "verdict": "true",
        "explanation": "SC hearing multiple petitions. Court sought NTA and CBI responses. Final decision pending. As of July 2026, the SC expressed reluctance to take up a fresh PIL on the issue.",
        "source": "Supreme Court orders, LiveLaw, Bar & Bench",
        "is_published": True,
    },
    {
        "title": "Rumor: Government declared holidays due to protests",
        "claim": "The Delhi government has declared holidays for all schools and colleges due to student protests.",
        "verdict": "misleading",
        "explanation": "Misleading. Some individual institutions voluntarily closed 1-2 days. No government-wide mandate. Delhi govt issued advisory only.",
        "source": "Delhi Govt Education Department advisories",
        "is_published": True,
    },
]


async def seed_database():
    await init_db()

    async with async_session() as db:
        # Seed admin
        result = await db.execute(select(Admin).where(Admin.email == settings.admin_email))
        if not result.scalar_one_or_none():
            pw = settings.admin_password
            if not pw:
                print("ERROR: ADMIN_PASSWORD env var not set. Cannot seed admin.")
                return
            admin = Admin(
                email=settings.admin_email,
                password_hash=hash_password(pw),
                name=settings.admin_name,
                is_super=True,
                must_reset_pw=True,
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            print(f"Created super admin: {admin.email}")
        else:
            result = await db.execute(select(Admin).where(Admin.email == settings.admin_email))
            admin = result.scalar_one()

        # Seed emergency contacts
        result = await db.execute(select(EmergencyContact).limit(1))
        if not result.scalar_one_or_none():
            for c in SEED_CONTACTS:
                db.add(EmergencyContact(**c))
            await db.commit()
            print(f"Seeded {len(SEED_CONTACTS)} emergency contacts")

        # Seed legal rights
        result = await db.execute(select(LegalRight).limit(1))
        if not result.scalar_one_or_none():
            for r in SEED_RIGHTS:
                db.add(LegalRight(**r))
            await db.commit()
            print(f"Seeded {len(SEED_RIGHTS)} legal rights")

        # Seed alerts
        result = await db.execute(select(Alert).limit(1))
        if not result.scalar_one_or_none():
            for a in SEED_ALERTS:
                db.add(Alert(**a, created_by=admin.id))
            await db.commit()
            print(f"Seeded {len(SEED_ALERTS)} alerts")

        # Seed fact checks
        result = await db.execute(select(FactCheck).limit(1))
        if not result.scalar_one_or_none():
            for f in SEED_FACT_CHECKS:
                db.add(FactCheck(**f, created_by=admin.id))
            await db.commit()
            print(f"Seeded {len(SEED_FACT_CHECKS)} fact checks")

    print("Database seeding complete!")


SEED_SAFE_ZONES = [
    {"name": "Legal Aid Desk — Jantar Mantar", "type": "legal", "description": "Pro bono lawyers stationed near main protest entrance", "status": "active", "lat": 28.6271, "lng": 77.2174},
    {"name": "Medical Tent — India Gate Lawns", "type": "medical", "description": "First aid, ORS, and volunteer doctors. Look for Red Cross flag.", "status": "active", "lat": 28.6129, "lng": 77.2295},
    {"name": "Safe House — Central Delhi", "type": "safe", "description": "Temporary shelter for protesters. Women and injured prioritized.", "status": "active", "lat": 28.6268, "lng": 77.2163},
    {"name": "Hydration Point — Patel Chowk", "type": "medical", "description": "Free water, ORS, and glucose. Green and white flags.", "status": "active", "lat": 28.6265, "lng": 77.2182},
    {"name": "Lawyer Coordination — Supreme Court", "type": "legal", "description": "Legal team coordinating bail and detainee tracking.", "status": "active", "lat": 28.6226, "lng": 77.2395},
    {"name": "Metro Station — Central Secretariat", "type": "alert", "description": "Police checkpoints near gate 2. Use gate 4 instead.", "status": "caution", "lat": 28.6156, "lng": 77.2131},
]


async def seed_safe_zones():
    async with async_session() as db:
        result = await db.execute(select(SafeZone).limit(1))
        if not result.scalar_one_or_none():
            for z in SEED_SAFE_ZONES:
                db.add(SafeZone(**z))
            await db.commit()
            print(f"Seeded {len(SEED_SAFE_ZONES)} safe zones")


async def seed_metro_stations():
    async with async_session() as db:
        result = await db.execute(select(MetroStation).limit(1))
        if not result.scalar_one_or_none():
            for s in METRO_STATIONS:
                station = MetroStation(
                    id=s["id"],
                    name=s["name"],
                    lines=json_mod.dumps(s["lines"]),
                    interchange=s["interchange"],
                    type=s["type"],
                    area=s["area"],
                    alternatives=json_mod.dumps(s["alternatives"]),
                    lat=s["lat"],
                    lng=s["lng"],
                )
                db.add(station)
            await db.commit()
            print(f"Seeded {len(METRO_STATIONS)} metro stations")
