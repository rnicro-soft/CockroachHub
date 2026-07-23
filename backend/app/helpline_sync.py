from sqlalchemy import select

from app.database import async_session
from app.models import EmergencyContact, MentalHealthProvider, AidOrganization, NewsSource

CONTACTS = [
    {"name": "AILAJ — Manik", "phone": "93542 31296", "category": "legal", "description": "Expert organized legal aid — call first", "city": "Delhi", "is_verified": True},
    {"name": "PUCL — Vertika Tripathi", "phone": "84476 73005", "category": "legal", "description": "People's Union for Civil Liberties", "city": "Delhi", "is_verified": True},
    {"name": "Shivangi Bajpai", "phone": "8306098849", "category": "legal", "description": "Advocate — 97shivangibajpai@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Nishant Gupta", "phone": "9999966244", "category": "legal", "description": "Advocate — nishantgupta.adv@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Prashant Joshi", "phone": "8383941504", "category": "legal", "description": "Advocate — adv.prashantjoshi11@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Teesta Mishra", "phone": "7355685408", "category": "legal", "description": "Advocate — teestamishra98@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Akshya", "phone": "9891959904", "category": "legal", "description": "Advocate — Chambersofadv.akshya@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Nishchay Kapoor", "phone": "9910929353", "category": "legal", "description": "Advocate — nishchay.kapoor@nmlo.in", "city": "Delhi", "is_verified": True},
    {"name": "Mathew M. Philip", "phone": "8588002983", "category": "legal", "description": "Advocate", "city": "Delhi", "is_verified": True},
    {"name": "Chitransha", "phone": "7415121229", "category": "legal", "description": "Advocate — chitransha.sikarwar@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Simran Singh", "phone": "8554925619", "category": "legal", "description": "Partner — mrsnlegals@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Karan Dhalla", "phone": "7982434774", "category": "legal", "description": "Advocate — karandhalla@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Rishabh Kapur", "phone": "7042181838", "category": "legal", "description": "Advocate — mail@rishabhkapur.com", "city": "Delhi", "is_verified": True},
    {"name": "Saurabh Veer", "phone": "9689008228", "category": "legal", "description": "Advocate — saurabhveer0@gmail.com", "city": "Maharashtra", "is_verified": True},
    {"name": "Bhagyesha Kurane", "phone": "9730197530", "category": "legal", "description": "Advocate", "city": "Mumbai", "is_verified": True},
    {"name": "Piyush Todkar", "phone": "7057106423", "category": "legal", "description": "Advocate", "city": "Mumbai", "is_verified": True},
    {"name": "Ganesh Pandit", "phone": "9112451807", "category": "legal", "description": "Advocate", "city": "Mumbai", "is_verified": True},
    {"name": "BodyTalks Lajpat Nagar", "phone": "9911988938", "category": "medical", "description": "24/7 post-injury rehab, physiotherapy, on-site first aid", "city": "Delhi", "is_verified": True},
    {"name": "Dr Shaurya Pratap", "phone": "7508009004", "category": "medical", "description": "Virtual consults and prescriptions", "city": "Delhi", "is_verified": True},
    {"name": "Anirudh Singh", "phone": "7338234381", "category": "medical", "description": "Orthopaedics Resident. Also: 7895087922", "city": "New Delhi", "is_verified": True},
    {"name": "Chatrron ki Goonj", "phone": "8826970690", "category": "helpline", "description": "Also: 9211452848 / 9827048238", "city": "Delhi", "is_verified": True},
    {"name": "Hemkunt Foundation", "phone": "@hemkuntfoundation (IG)", "category": "helpline", "description": "Food, accommodation, aid for protesters", "city": "Delhi", "is_verified": True},
    {"name": "Sachkhand Foundation", "phone": "8287007747", "category": "helpline", "description": "On-site volunteers, food, cleaning", "city": "Delhi", "is_verified": True},
    {"name": "Aashray", "phone": "9815151895", "category": "helpline", "description": "Drinking water, first aid, langar. Also: 9815157865", "city": "Delhi", "is_verified": True},
]

MENTAL_HEALTH = [
    {"name": "Aditi Pandey", "contact": "ap.work.psych@gmail.com", "email": "ap.work.psych@gmail.com", "service_type": "online", "details": "Counselling Psychologist", "location": "Lucknow/Delhi"},
    {"name": "Anvitha Satheesh", "contact": "thethirdspace1507@gmail.com", "email": "thethirdspace1507@gmail.com", "service_type": "online", "details": "Counselling Psychologist", "location": "Online"},
    {"name": "Maria Senora", "contact": "maria.senora1997@gmail.com", "email": "maria.senora1997@gmail.com", "service_type": "online", "details": "Counselling Psychologist", "location": "Online"},
    {"name": "Batul M", "contact": "7850810877 (WhatsApp)", "email": "batmat786@gmail.com", "service_type": "online", "details": "WhatsApp counselling", "location": "Online"},
    {"name": "Sonali Dayal", "contact": "thriversweb@gmail.com", "email": "thriversweb@gmail.com", "service_type": "online", "details": "Counselling Psychologist", "location": "Online"},
    {"name": "Simran Gera", "contact": "simrangera02@gmail.com", "email": "simrangera02@gmail.com", "service_type": "online", "details": "CBT, Trauma-informed therapy", "location": "Online"},
    {"name": "Jayeesha Taneja", "contact": "firgunmentalhealth@gmail.com", "email": "firgunmentalhealth@gmail.com", "service_type": "online", "details": "Counselling, Queer & neurodivergence affirmative", "location": "Online"},
    {"name": "Agatsu Foundation", "contact": "9004489010", "email": "contact@agatsufoundation.org", "service_type": "offline", "details": "Community center & clinic. Bandra (W), Mumbai.", "location": "Mumbai"},
]

AID_ORGS = [
    {"name": "Hemkunt Foundation", "purpose": "Food, accommodation, aid for protesters", "contact": "@hemkuntfoundation (IG)", "link": "", "category": "aid"},
    {"name": "Gurudwara Bangla Sahib", "purpose": "Free meals (langar) and accommodation", "contact": "Bangla Sahib, Delhi", "link": "", "category": "aid"},
    {"name": "Sachkhand Foundation", "purpose": "On-site volunteers, food, cleaning", "contact": "8287007747", "link": "", "category": "aid"},
    {"name": "Warriors Without Cause", "purpose": "Food, first aid, clean water", "contact": "Anusha: 9315917909", "link": "", "category": "aid"},
    {"name": "Aashray", "purpose": "Drinking water, first aid, community langar", "contact": "9815151895", "link": "", "category": "aid"},
]

NEWS_SOURCES = [
    {"name": "Cockroach Janta Party", "platform": "instagram", "link": "https://www.instagram.com/cockroachjantaparty/", "description": "Official CJP page — all on-site footage and updates"},
    {"name": "PeekTV", "platform": "instagram", "link": "https://www.instagram.com/peektv_in/", "description": "Protest violence footage and credible info"},
    {"name": "Faye D'Souza", "platform": "instagram", "link": "https://www.instagram.com/fayedsouza/", "description": "Credible news source with on-ground reporting"},
    {"name": "Indian Express Hindi", "platform": "instagram", "link": "https://www.instagram.com/expresshindi/", "description": "Credible news with on-ground visuals"},
    {"name": "The News Pinch", "platform": "instagram", "link": "https://www.instagram.com/thenewspinch/", "description": "News page with on-ground visuals"},
]


async def sync_helpline_data():
    async with async_session() as db:
        existing = {(c.name, c.phone) for c in (await db.execute(select(EmergencyContact))).scalars().all()}
        for c in CONTACTS:
            if (c["name"], c["phone"]) not in existing:
                db.add(EmergencyContact(**c))
                existing.add((c["name"], c["phone"]))

        mh_names = {m.name for m in (await db.execute(select(MentalHealthProvider))).scalars().all()}
        for m in MENTAL_HEALTH:
            if m["name"] not in mh_names:
                db.add(MentalHealthProvider(**m))
                mh_names.add(m["name"])

        ao_names = {a.name for a in (await db.execute(select(AidOrganization))).scalars().all()}
        for a in AID_ORGS:
            if a["name"] not in ao_names:
                db.add(AidOrganization(**a))
                ao_names.add(a["name"])

        ns_names = {n.name for n in (await db.execute(select(NewsSource))).scalars().all()}
        for n in NEWS_SOURCES:
            if n["name"] not in ns_names:
                db.add(NewsSource(**n))
                ns_names.add(n["name"])

        await db.commit()
        print(f"Synced helpline data")
