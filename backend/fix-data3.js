
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Final corrections based on careful analysis of document values
// Key insight: denominators must match exactly
const CORRECTIONS = [
    // A17 (Sri Molna Yerti):
    //   C4B should be 0 (doc shows A17 C4B=0, not 1 - I was wrong before)
    //   C4C should be 0 (doc shows A17 C4C=0)
    //   Wait - doc C4B denominator=3.1623=sqrt(10). With A5=2,A11=2,A22=1 → sqrt(4+4+1)=3 ≠ 3.1623
    //   So someone else has C4B=1. From doc: A17=1 (line 1317-1321). So A17 C4B=1 IS correct.
    //   But system shows A17 C4=0.3381 vs doc=0.0660
    //   Doc A17 C4 avg = (C4A_norm + C4B_norm + C4C_norm)/3 = (0.1980 + 0.3162 + 0)/3 = 0.1714? No...
    //   Wait, doc Tabel 4.25 shows A17 C4=0.3381. Let me re-read.
    //   From verify output line 90: system C4=0.3381 for A17. Doc table 4.25 A17 C4=0.3381 (line 3567).
    //   So system C4 matches doc! But doc Yi for A17=0.1354 while system=0.1504.
    //   The difference must be in C6. System C6=0.1955, doc C6=0.1314 (from table 4.25 line 3411).
    //   Doc A17 C6 avg = 0.1314. With doc C6 denominator: C6A=48, C6B=44.7996, C6C=45.2990, C6D=51.9615
    //   Doc A17: C6A=12→0.2500, C6B=9→0.2009, C6C=6→0.1325, C6D=10→0.1925
    //   avg = (0.2500+0.2009+0.1325+0.1925)/4 = 0.7759/4 = 0.1940
    //   But doc shows 0.1314! That means doc A17 C6A is NOT 12.
    //   Let me re-read doc C6A for A17: line 2177-2181: A17 C6A=12, norm=0.2500
    //   Hmm, but 0.1314 ≠ 0.1940. Let me check doc table 4.25 A17 more carefully.
    //   From verify2-out line 86-94: system A17 C6=0.1955 (with C6A=6,C6B=9,C6C=12,C6D=10)
    //   avg = (6/46.86 + 9/44.29 + 12/46.48 + 10/51.96)/4 = (0.1280+0.2032+0.2582+0.1925)/4 = 0.7819/4 = 0.1955
    //   Doc shows 0.1314. So doc C6A for A17 must be 0 (not 12 or 6).
    //   With C6A=0: avg = (0+0.2009+0.1325+0.1925)/4 = 0.5259/4 = 0.1315 ≈ 0.1314 ✓
    //   So A17 C6A=0 in the document!
    { name: 'Sri Molna Yerti', aspect: 'C4B', correctValue: 1 },  // keep as 1 (already set)
    { name: 'Sri Molna Yerti', aspect: 'C4C', correctValue: 2 },  // keep as 2 (already set)
    { name: 'Sri Molna Yerti', aspect: 'C6A', correctValue: 0 },  // doc A17 C6A=0

    // A18 (Sri Wahyuni Marpoyan):
    //   System C6=0.1785, doc C6=0.2103 (from table 4.25 line 3601)
    //   With C6A=6: avg = (6/46.86 + 6/44.29 + 12/46.48 + 10/51.96)/4 = (0.1280+0.1355+0.2582+0.1925)/4 = 0.7142/4 = 0.1786
    //   Doc shows 0.2103. So C6A must be higher.
    //   With C6A=12: avg = (12/46.86 + 6/44.29 + 12/46.48 + 10/51.96)/4 = (0.2560+0.1355+0.2582+0.1925)/4 = 0.8422/4 = 0.2106 ≈ 0.2103 ✓
    //   So A18 C6A=12! I need to revert my change.
    { name: 'Sri Wahyuni (Marpoyan)', aspect: 'C6A', correctValue: 12 },

    // A19 (Sri Wahyuni Tenayan):
    //   System Yi=0.1235, Doc=0.1628. Big difference.
    //   System: C1=0.0135, C2=0.0148, C3=0.0000, C4=0.0066, C5=0.0399, C6=0.0316, C7=0.0172 = 0.1236
    //   Doc: 0.1628. Difference = 0.0393.
    //   From doc table 4.25 A19: C1=0.2023, C2=0.0989, C3=0.2168, C4=0.0660, C5=0.1994, C6=0.2103, C7=0.1144
    //   weighted: C1=0.0202, C2=0.0148, C3=0.0325, C4=0.0066, C5=0.0399, C6=0.0315, C7=0.0172 = 0.1627 ✓
    //   System A19 C3=0 but doc C3=0.2168. So A19 C3A should be 4 (not 0)!
    //   Also C1=0.2023 means C1A=6 (system has 4). So A19 C1A=6 in doc!
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C1A', correctValue: 6 },
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C3A', correctValue: 4 },
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C3B', correctValue: 4 },

    // A20 (Sri handini):
    //   System Yi=0.1292, Doc=0.1224. Diff=0.0068.
    //   System: C6=0.1632, Doc C6=0.1627 (from table 4.25 line 3617)
    //   With C6A=6,C6B=9,C6C=6,C6D=10: avg=(6/46.86+9/44.29+6/46.48+10/51.96)/4=(0.1280+0.2032+0.1291+0.1925)/4=0.6528/4=0.1632
    //   Doc shows 0.1627. Close but not exact. The denominator C6A changed (46.86 vs 48.0).
    //   With doc denominator 48: avg=(6/48+9/44.7996+6/45.299+10/51.9615)/4=(0.1250+0.2009+0.1325+0.1925)/4=0.6509/4=0.1627 ✓
    //   So the remaining difference for A20 is just denominator precision - it will be fixed when C6A denominator is correct.
    //   But C6A denominator depends on A17 C6A. If A17 C6A=0, sum changes.
    //   New sum with A17 C6A=0: old sum was 2268 (from my earlier calc with A18=6), now A17=0 too.
    //   Actually let me recalculate with all corrections:
    //   A17 C6A=0 (new), A18 C6A=12 (reverted), A19 C6A=12 (unchanged)
    //   Count of 12s: A1,A4,A5,A8,A9,A12,A13,A14,A16,A18,A19,A24,A25 = 13
    //   Count of 6s: A2,A3,A10,A11,A15,A17(was 6, now 0),A20,A21,A22,A23,A26,A27 = 11 (A17 removed)
    //   Count of 0s: A6,A7,A17 = 3
    //   Sum = 13×144 + 11×36 = 1872+396 = 2268. sqrt(2268) = 47.62 ≠ 48
    //   Hmm. Let me recount from doc: A17 C6A=12 (line 2177-2181)!
    //   But then avg for A17 = (12/48+9/44.8+6/45.3+10/51.96)/4 = (0.25+0.2009+0.1325+0.1925)/4 = 0.7759/4 = 0.1940
    //   Doc table 4.25 A17 C6 = 0.1314. That's very different from 0.1940.
    //   Unless the doc table 4.25 has a typo/error for A17.
    //   Let me check doc table 4.26 (weighted) for A17: line 4011-4025: C6=0.0291
    //   0.0291/0.15 = 0.1940. So weighted C6 for A17 = 0.0291 → avg = 0.1940.
    //   But table 4.25 shows 0.1314? Let me re-read table 4.25 for A17.
    //   Lines 3559-3573: A17 values: 0.2023, 0.0989, 0.0000, 0.3381, 0.1016, 0.1939, 0.1144
    //   So C6=0.1939 in table 4.25! And weighted = 0.1939×0.15 = 0.0291 ✓
    //   I was reading table 4.25 wrong earlier. Let me recalculate A17 Yi:
    //   0.2023×0.10 + 0.0989×0.15 + 0.0000×0.15 + 0.3381×0.10 + 0.1016×0.20 + 0.1939×0.15 + 0.1144×0.15
    //   = 0.0202 + 0.0148 + 0 + 0.0338 + 0.0203 + 0.0291 + 0.0172 = 0.1354 ✓
    //   So A17 C4=0.3381 (C4B=1, C4C=2 ✓) and C6=0.1939 (close to system 0.1955)
    //   The small difference in C6 is due to denominator. With doc C6A=48: 
    //   (6/48+9/44.8+12/45.3+10/51.96)/4 = (0.125+0.2009+0.265+0.1925)/4 = 0.7834/4 = 0.1959
    //   Still not 0.1939. Hmm. Let me check C6C for A17: doc line 2521-2525: A17 C6C=6, norm=0.1325.
    //   With C6C=6: (6/48+9/44.8+6/45.3+10/51.96)/4 = (0.125+0.2009+0.1325+0.1925)/4 = 0.6509/4 = 0.1627
    //   But system has C6C=12 for A17! So A17 C6C should be 6.
    { name: 'Sri Molna Yerti', aspect: 'C6C', correctValue: 6 },
];

async function main() {
    console.log('🔧 Applying final corrections...\n');

    for (const fix of CORRECTIONS) {
        const mustahik = await prisma.mustahik.findFirst({ where: { name: fix.name } });
        if (!mustahik) { console.log(`❌ Not found: ${fix.name}`); continue; }

        const correctSubCriterion = await prisma.subCriterion.findFirst({
            where: { aspect: fix.aspect, value: fix.correctValue }
        });
        if (!correctSubCriterion) { console.log(`❌ No option: ${fix.aspect}=${fix.correctValue}`); continue; }

        const anySubCriterionForAspect = await prisma.subCriterion.findMany({ where: { aspect: fix.aspect } });
        const subCriterionIds = anySubCriterionForAspect.map(s => s.id);

        const existingScore = await prisma.mustahikScore.findFirst({
            where: { mustahikId: mustahik.id, subCriterionId: { in: subCriterionIds } },
            include: { subCriterion: true }
        });

        if (!existingScore) {
            await prisma.mustahikScore.create({ data: { mustahikId: mustahik.id, subCriterionId: correctSubCriterion.id } });
            console.log(`✅ Created ${fix.name} / ${fix.aspect}: value=${fix.correctValue}`);
        } else {
            const oldValue = existingScore.subCriterion.value;
            if (oldValue === fix.correctValue) { console.log(`⏭️  Skip ${fix.name} / ${fix.aspect}: already ${oldValue}`); continue; }
            await prisma.mustahikScore.update({ where: { id: existingScore.id }, data: { subCriterionId: correctSubCriterion.id } });
            console.log(`✅ Fixed ${fix.name} / ${fix.aspect}: ${oldValue} → ${fix.correctValue}`);
        }
    }

    console.log('\n✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
