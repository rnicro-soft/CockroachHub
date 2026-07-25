"""Schema migration — add missing columns, create tables, seed data. Idempotent."""
import asyncio
from sqlalchemy import text, select
from app.database import async_session, engine, Base
from app.models import MetroStation, SafeZone

SCHEMA_ADDITIONS = [
    ("alerts", "featured", "BOOLEAN DEFAULT FALSE"),
    ("metro_disruptions", "featured", "BOOLEAN DEFAULT FALSE"),
    ("metro_stations", "is_active", "BOOLEAN DEFAULT TRUE"),
    ("emergency_contacts", "source", "VARCHAR(500)"),
    ("emergency_contacts", "last_verified_at", "TIMESTAMP WITH TIME ZONE"),
]


async def run_migrations():
    """Add missing columns, create missing tables, seed data. Safe to run multiple times."""
    # Create all tables (no-op for existing ones)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Add missing columns
        for table, column, col_def in SCHEMA_ADDITIONS:
            exists = await db.execute(
                text("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = :table AND column_name = :column)"),
                {"table": table, "column": column},
            )
            if not exists.scalar():
                await db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_def}"))
                print(f"  Added {table}.{column}")
            else:
                print(f"  {table}.{column} exists")
        await db.commit()

        # Seed metro stations
        result = await db.execute(select(MetroStation).limit(1))
        if not result.scalar_one_or_none():
            from app.metro_data import METRO_STATIONS
            import json
            for s in METRO_STATIONS:
                db.add(MetroStation(
                    id=s["id"], name=s["name"], lines=json.dumps(s["lines"]),
                    interchange=s["interchange"], type=s["type"], area=s["area"],
                    alternatives=json.dumps(s["alternatives"]), lat=s["lat"], lng=s["lng"],
                ))
            await db.commit()
            print(f"  Seeded {len(METRO_STATIONS)} metro stations")

        # Seed safe zones
        result = await db.execute(select(SafeZone).limit(1))
        if not result.scalar_one_or_none():
            from app.seed import SEED_SAFE_ZONES
            for z in SEED_SAFE_ZONES:
                db.add(SafeZone(**z))
            await db.commit()
            print(f"  Seeded {len(SEED_SAFE_ZONES)} safe zones")

    print("Migrations complete")
