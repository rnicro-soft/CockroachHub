import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from sqlalchemy import select
from app.database import async_session, init_db
from app.models import EmergencyContact, MentalHealthProvider, AidOrganization, NewsSource

# Key data extracted from helpline.md
CONTACTS = [
    # --- Legal Aid (priority) ---
    {"name": "AILAJ — Manik", "phone": "93542 31296", "category": "legal", "description": "Expert organized legal aid — call first", "city": "Delhi", "is_verified": True},
    {"name": "PUCL — Vertika Tripathi", "phone": "84476 73005", "category": "legal", "description": "People's Union for Civil Liberties", "city": "Delhi", "is_verified": True},
    # --- Lawyers ---
    {"name": "Shivangi Bajpai", "phone": "8306098849", "category": "legal", "description": "Advocate — 97shivangibajpai@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Nishant Gupta", "phone": "9999966244", "category": "legal", "description": "Advocate — nishantgupta.adv@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Prashant Joshi", "phone": "8383941504", "category": "legal", "description": "Advocate — adv.prashantjoshi11@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Teesta Mishra", "phone": "7355685408", "category": "legal", "description": "Advocate — teestamishra98@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Akshya", "phone": "9891959904", "category": "legal", "description": "Advocate — Chambersofadv.akshya@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Nishchay Kapoor", "phone": "9910929353", "category": "legal", "description": "Advocate — nishchay.kapoor@nmlo.in", "city": "Delhi", "is_verified": True},
    {"name": "Mathew M. Philip", "phone": "8588002983", "category": "legal", "description": "Advocate — mathewphilip.1994@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Sai Shwet Choudhary", "phone": "9718252520", "category": "legal", "description": "Advocate — godzickinfo0712@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Chitransha", "phone": "7415121229", "category": "legal", "description": "Advocate — chitransha.sikarwar@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Tanmay Gupta", "phone": "9399594096", "category": "legal", "description": "Advocate — workmail.tanmaygupt", "city": "Delhi", "is_verified": True},
    {"name": "Adv Namisha Jain", "phone": "8076333599", "category": "legal", "description": "Advocate — nnamisha.10@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Simran Singh", "phone": "8554925619", "category": "legal", "description": "Partner — mrsnlegals@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Karan Dhalla", "phone": "7982434774", "category": "legal", "description": "Advocate — karandhalla@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Udita Singh", "phone": "8527870008", "category": "legal", "description": "Advocate — adv.uditasingh@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Ish Chawla", "phone": "8630802075", "category": "legal", "description": "Advocate", "city": "Delhi", "is_verified": True},
    {"name": "Surbhi Soni", "phone": "9571095840", "category": "legal", "description": "Advocate — surbhisoni2428@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Shikhar Garg", "phone": "8800213827", "category": "legal", "description": "Advocate — shikhargarg2909@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Rishabh Kapur", "phone": "7042181838", "category": "legal", "description": "Advocate — mail@rishabhkapur.com", "city": "Delhi", "is_verified": True},
    {"name": "Malvi Dedhia", "phone": "8779473367", "category": "legal", "description": "Advocate — advmalvidedhia@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Aditi Ladda", "phone": "7602672842", "category": "legal", "description": "Advocate — aditiladda1504@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Arjun Sharma", "phone": "9560653625", "category": "legal", "description": "Advocate — asharmawork1998@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Gantavya Vasisht", "phone": "9657372228", "category": "legal", "description": "Advocate — vasishtgantavya@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Shagun Bhadana", "phone": "8178644965", "category": "legal", "description": "Advocate — workwithshagunbhadana@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Saurabh Veer", "phone": "9689008228", "category": "legal", "description": "Advocate — saurabhveer0@gmail.com", "city": "Maharashtra", "is_verified": True},
    {"name": "Bhagyesha Kurane", "phone": "9730197530", "category": "legal", "description": "Advocate", "city": "Mumbai", "is_verified": True},
    {"name": "Piyush Todkar", "phone": "7057106423", "category": "legal", "description": "Advocate", "city": "Mumbai", "is_verified": True},
    {"name": "Ganesh Pandit", "phone": "9112451807", "category": "legal", "description": "Advocate", "city": "Mumbai", "is_verified": True},
    # --- Legal Volunteers ---
    {"name": "Sriram Parakkat", "phone": "9711164693", "category": "legal_volunteer", "description": "Legal volunteer — sriram.nuals@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Varnika Singh", "phone": "7060393939", "category": "legal_volunteer", "description": "Legal volunteer — varnika1708@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Aadya Antya", "phone": "9794920046", "category": "legal_volunteer", "description": "Legal volunteer — aadya.antya@gmail.com", "city": "Delhi/Lucknow", "is_verified": True},
    {"name": "Anushka Singh", "phone": "9582374656", "category": "legal_volunteer", "description": "Legal volunteer — anushkasingh23.adv@gmail.com", "city": "New Delhi", "is_verified": True},
    {"name": "Krishna Raj", "phone": "8287558798", "category": "legal_volunteer", "description": "Legal volunteer — krishnasinghlaw@gmail.com", "city": "New Delhi", "is_verified": True},
    {"name": "Kavana Rao", "phone": "9902372155", "category": "legal_volunteer", "description": "Legal volunteer — kavanarao2025@gmail.com", "city": "New Delhi", "is_verified": True},
    {"name": "Shiyas KR", "phone": "9821152623", "category": "legal_volunteer", "description": "Legal volunteer — advkrshiyas@gmail.com", "city": "New Delhi", "is_verified": True},
    {"name": "Deeksha Dwivedi", "phone": "7355154096", "category": "legal_volunteer", "description": "Legal volunteer — deekshaadwivedi@gmail.com", "city": "Delhi NCR", "is_verified": True},
    {"name": "Sneha Ahmed", "phone": "8761888819", "category": "legal_volunteer", "description": "Legal volunteer — snehaahmed14@gmail.com", "city": "Delhi", "is_verified": True},
    {"name": "Dhruv Bhalla", "phone": "9711375867", "category": "legal_volunteer", "description": "Legal volunteer — bhalladhruv50@gmail.com", "city": "Delhi", "is_verified": True},
    # --- Medical ---
    {"name": "BodyTalks Lajpat Nagar", "phone": "9911988938", "category": "medical", "description": "24/7 post-injury rehab, physiotherapy, on-site first aid. 28 Ring Road, Lajpat Nagar.", "city": "Delhi", "is_verified": True},
    {"name": "Dr Shaurya Pratap", "phone": "7508009004", "category": "medical", "description": "Virtual consults and prescriptions", "city": "Delhi", "is_verified": True},
    {"name": "Anirudh Singh", "phone": "7338234381", "category": "medical", "description": "Orthopaedics Resident, IRPGI & NRCH. Also: 7895087922", "city": "New Delhi", "is_verified": True},
    # --- Helpline / Aid ---
    {"name": "Chatrron ki Goonj", "phone": "8826970690", "category": "helpline", "description": "Also: 9211452848 / 9827048238. Volunteer network at protest sites.", "city": "Delhi", "is_verified": True},
    {"name": "AAP Helpline", "phone": "8588833548", "category": "helpline", "description": "Launched by Arvind Kejriwal", "city": "Delhi", "is_verified": True},
    {"name": "Hemkunt Foundation", "phone": "See Instagram @hemkuntfoundation", "category": "helpline", "description": "Food, accommodation and aid for protesters", "city": "Delhi", "is_verified": True},
    {"name": "Sachkhand Foundation", "phone": "8287007747", "category": "helpline", "description": "On-site volunteers, food, cleaning", "city": "Delhi", "is_verified": True},
    {"name": "Warriors Without Cause", "phone": "9315917909", "category": "helpline", "description": "Food, first aid, clean water. Contact Anusha.", "city": "Delhi", "is_verified": True},
    {"name": "Aashray", "phone": "9815151895", "category": "helpline", "description": "Drinking water, first aid, community langar. Also: 9815157865", "city": "Delhi", "is_verified": True},
    {"name": "Nivritti Counselling", "phone": "8446043977", "category": "helpline", "description": "Mental health counselling — DM/WhatsApp @nivritticounselling", "city": "Online", "is_verified": True},
]

MENTAL_HEALTH = [
    {"name": "Aaisha Khan", "contact": "@aaisha.psychologist (Instagram)", "email": "", "service_type": "online", "details": "Psychologist", "location": "Online"},
    {"name": "Dr. Nishat Begum", "contact": "@vaasi.healthcare (Instagram)", "email": "", "service_type": "online", "details": "Healthcare", "location": "Online"},
    {"name": "Aditi Pandey", "contact": "ap.work.psych@gmail.com", "email": "ap.work.psych@gmail.com", "service_type": "online", "details": "Counselling Psychologist — Lucknow/Delhi", "location": "Lucknow/Delhi"},
    {"name": "Anvitha Satheesh", "contact": "thethirdspace1507@gmail.com", "email": "thethirdspace1507@gmail.com", "service_type": "online", "details": "Counselling Psychologist / M.Sc Clinical Psychology", "location": "Online"},
    {"name": "Maria Senora", "contact": "maria.senora1997@gmail.com", "email": "maria.senora1997@gmail.com", "service_type": "online", "details": "Counselling Psychologist / M.Sc Clinical Psychology", "location": "Online"},
    {"name": "Batul M", "contact": "7850810877", "email": "batmat786@gmail.com", "service_type": "online", "details": "WhatsApp counselling", "location": "Online"},
    {"name": "Vaasi Healthcare", "contact": "8867688682", "email": "", "service_type": "online", "details": "Online sessions available", "location": "Online"},
    {"name": "Sonali Dayal", "contact": "thriversweb@gmail.com", "email": "thriversweb@gmail.com", "service_type": "online", "details": "Counselling Psychologist", "location": "Online"},
    {"name": "Chippy Elizabeth J.", "contact": "chippyej@gmail.com", "email": "chippyej@gmail.com", "service_type": "online", "details": "Counselling Psychologist", "location": "Online"},
    {"name": "Shreya Maheswary", "contact": "shreyamaheshwari977@gmail.com", "email": "shreyamaheshwari977@gmail.com", "service_type": "online", "details": "Narrative practitioner", "location": "Online"},
    {"name": "Simran Gera", "contact": "simrangera02@gmail.com", "email": "simrangera02@gmail.com", "service_type": "online", "details": "CBT, Trauma-informed, Gen Z & Millennial Women", "location": "Online"},
    {"name": "Tanishqa", "contact": "8750388175", "email": "", "service_type": "online", "details": "Clinical Psychology", "location": "Online"},
    {"name": "Akshita Desore", "contact": "desore.akshita@gmail.com", "email": "desore.akshita@gmail.com", "service_type": "online", "details": "Expressive Arts Therapy", "location": "Online"},
    {"name": "Vanika Kapoor", "contact": "kapoor.vamika24@gmail.com", "email": "kapoor.vamika24@gmail.com", "service_type": "online", "details": "School Counsellor", "location": "Online"},
    {"name": "Khushi Bhutani", "contact": "9873188163", "email": "", "service_type": "online", "details": "Psychologist", "location": "Online"},
    {"name": "Jayeesha Taneja", "contact": "firgunmentalhealth@gmail.com", "email": "firgunmentalhealth@gmail.com", "service_type": "online", "details": "Counselling, Psychotherapy, Queer & neurodivergence affirmative", "location": "Online"},
    {"name": "Agatsu Foundation", "contact": "9004489010", "email": "contact@agatsufoundation.org", "service_type": "offline", "details": "Community center & clinic. 51 Pali Village, Bandra (W), Mumbai.", "location": "Mumbai"},
]

AID_ORGS = [
    {"name": "Hemkunt Foundation", "purpose": "Food, accommodation, aid for protesters", "contact": "@hemkuntfoundation (Instagram)", "link": "https://www.instagram.com/p/DbDf8WVhvYR/", "category": "aid"},
    {"name": "Gurudwara Bangla Sahib", "purpose": "Langar (free meals), accommodation", "contact": "Bangla Sahib, Delhi", "link": "https://www.instagram.com/p/DbDJQvKzob6/", "category": "aid"},
    {"name": "Gurudwara Rakab Ganj Sahib", "purpose": "Langar (free meals), accommodation", "contact": "Rakab Ganj, Delhi", "link": "", "category": "aid"},
    {"name": "Gurudwara Sis Ganj Sahib", "purpose": "Langar (free meals), accommodation", "contact": "Chandni Chowk, Delhi", "link": "", "category": "aid"},
    {"name": "Sachkhand Foundation", "purpose": "On-site volunteers, food, cleaning", "contact": "8287007747", "link": "https://www.instagram.com/reel/DbBXXpFyEP-/", "category": "aid"},
    {"name": "Warriors Without Cause", "purpose": "Food, first aid, clean water", "contact": "Anusha: 9315917909", "link": "https://www.instagram.com/warriorswithoutcausengo", "category": "aid"},
    {"name": "Aashray", "purpose": "Drinking water, first aid, community langar", "contact": "9815151895 / 9815157865", "link": "https://www.instagram.com/p/DbDoDvLkpPa/", "category": "aid"},
]

NEWS_SOURCES = [
    {"name": "PeekTV", "platform": "instagram", "link": "https://www.instagram.com/peektv_in/", "description": "News page — all footage of protest violence and credible info"},
    {"name": "The News Pinch", "platform": "instagram", "link": "https://www.instagram.com/thenewspinch/", "description": "News page — credible news with on-ground visuals"},
    {"name": "Nakshi T", "platform": "instagram", "link": "https://www.instagram.com/naksimanicpixie/", "description": "Volunteer on site — live info from individual perspective"},
    {"name": "Sarthak Goswami", "platform": "instagram", "link": "https://www.instagram.com/sundaysarthak/", "description": "Individual creator sharing protest narrative"},
    {"name": "Faye D'Souza", "platform": "instagram", "link": "https://www.instagram.com/fayedsouza/", "description": "News page — credible source for latest news"},
    {"name": "Faizan Siddiqui", "platform": "instagram", "link": "https://www.instagram.com/faizansiddiqui56/", "description": "On-site updates on IG stories and posts"},
    {"name": "Cockroach Janta Party", "platform": "instagram", "link": "https://www.instagram.com/cockroachjantaparty/", "description": "Official CJP page — all on-site footage and regular updates"},
    {"name": "Harsh Yadav", "platform": "instagram", "link": "https://www.instagram.com/harshdelhise/", "description": "Individual news page — footage of protest violence"},
    {"name": "Tanushree Pandey", "platform": "instagram", "link": "https://www.instagram.com/tanushree_pandey/", "description": "Independent journalist — credible information"},
    {"name": "Pyaari Delhi", "platform": "instagram", "link": "https://www.instagram.com/pyari_delhi1/", "description": "Individual reel creator — independent journalism"},
    {"name": "Indian Express Hindi", "platform": "instagram", "link": "https://www.instagram.com/expresshindi/", "description": "News page — credible news with on-ground visuals"},
]


async def run():
    await init_db()
    async with async_session() as db:
        # Upsert contacts
        existing = {(c.name, c.phone) for c in (await db.execute(select(EmergencyContact))).scalars().all()}
        added = 0
        for c in CONTACTS:
            if (c["name"], c["phone"]) not in existing:
                db.add(EmergencyContact(**c))
                existing.add((c["name"], c["phone"]))
                added += 1
        
        mh_existing = {m.name for m in (await db.execute(select(MentalHealthProvider))).scalars().all()}
        mh_added = 0
        for m in MENTAL_HEALTH:
            if m["name"] not in mh_existing:
                db.add(MentalHealthProvider(**m))
                mh_existing.add(m["name"])
                mh_added += 1
        
        ao_existing = {a.name for a in (await db.execute(select(AidOrganization))).scalars().all()}
        ao_added = 0
        for a in AID_ORGS:
            if a["name"] not in ao_existing:
                db.add(AidOrganization(**a))
                ao_existing.add(a["name"])
                ao_added += 1
        
        ns_existing = {n.name for n in (await db.execute(select(NewsSource))).scalars().all()}
        ns_added = 0
        for n in NEWS_SOURCES:
            if n["name"] not in ns_existing:
                db.add(NewsSource(**n))
                ns_existing.add(n["name"])
                ns_added += 1
        
        await db.commit()
        print(f"Added: {added} contacts, {mh_added} mental health, {ao_added} aid orgs, {ns_added} news sources")

asyncio.run(run())
