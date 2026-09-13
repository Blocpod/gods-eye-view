/**
 * Curated, source-linked background briefings. This is a reviewed snapshot, not
 * an incident feed or a legal classification of conflicts. See docs/CONFLICT-DATA.md.
 */
export const CONFLICT_COVERAGE = Object.freeze({
  label: 'Curated conflict briefings',
  updatedAt: '2026-09-13',
  live: false,
  exhaustive: false,
  disclaimer:
    'A curated worldwide snapshot of conflicts, security crises and flashpoints. Coverage is not exhaustive; briefings are not live incident reports. Open the linked sources for subsequent developments.',
  markerNote:
    'Markers indicate representative briefing locations, not conflict boundaries, territorial control or individual incidents.',
  severityNote:
    'Critical, high and elevated are editorial attention levels, not casualty estimates, forecasts or official source ratings.',
});

const icrc = (slug) => ({
  name: 'ICRC · Humanitarian context',
  url: `https://www.icrc.org/en/where-we-work/${slug}`,
});
const cfr = (slug) => ({
  name: 'CFR · Conflict background',
  url: `https://www.cfr.org/global-conflict-tracker/conflict/${slug}`,
});

const catalog = [
  {
    id: 'ukraine',
    title: 'Russia–Ukraine',
    region: 'Europe & Eurasia',
    latitude: 48.6,
    longitude: 37.8,
    severity: 'critical',
    status: 'Armed conflict',
    summary:
      'The international armed conflict has caused extensive civilian harm, displacement and damage to essential services.',
    context:
      'ICRC operations cover communities on both sides of the conflict. This briefing represents the wider war; its map point does not locate a front line.',
    actors: ['Russian armed forces', 'Ukrainian armed forces'],
    humanitarian:
      'Priorities include medical care, water and heating systems, assistance to displaced families, and tracing missing people.',
    sources: [icrc('ukraine')],
  },
  {
    id: 'sudan',
    title: 'Sudan',
    region: 'Africa',
    latitude: 13.63,
    longitude: 25.35,
    severity: 'critical',
    status: 'Armed conflict',
    summary:
      'War has devastated civilian life across Sudan, including Darfur and Kordofan, and severely disrupted basic services.',
    context:
      'Fighting that began in 2023 compounds earlier conflicts and displacement. Conditions and access vary greatly between regions.',
    actors: [
      'Sudanese Armed Forces',
      'Rapid Support Forces',
      'Other armed groups',
    ],
    humanitarian:
      'Safe water, emergency food, functioning hospitals and contact between separated relatives remain central humanitarian needs.',
    sources: [icrc('sudan'), cfr('power-struggle-sudan')],
  },
  {
    id: 'israel-palestine',
    title: 'Israel & Palestinian territories',
    region: 'Middle East & North Africa',
    latitude: 31.42,
    longitude: 34.4,
    severity: 'critical',
    status: 'Conflict aftermath',
    summary:
      'The effects of war, occupation and other violence continue to shape civilian life in Gaza, the West Bank and Israel.',
    context:
      'The reviewed ICRC overview describes a ceasefire as an opportunity for relief. Conditions differ across locations; this briefing does not assert current ceasefire compliance.',
    actors: [
      'Israeli authorities and forces',
      'Hamas and other Palestinian armed groups',
      'Palestinian authorities',
    ],
    humanitarian:
      'Medical care, water and sanitation, family reunification, and the protection of hostages and detainees are key concerns.',
    sources: [
      icrc('israel-and-occupied-territories'),
      cfr('israeli-palestinian-conflict'),
    ],
  },
  {
    id: 'iran',
    title: 'Iran & regional hostilities',
    region: 'Middle East & North Africa',
    latitude: 32.65,
    longitude: 51.67,
    severity: 'critical',
    status: 'Armed conflict',
    summary:
      'Regional hostilities have created humanitarian needs in Iran and heightened concern about further escalation.',
    context:
      'ICRC reports scaling up its response after the February 2026 escalation. This is a regional context point, not a verified strike location.',
    actors: [
      'Iranian authorities and forces',
      'Israeli armed forces',
      'United States armed forces',
    ],
    humanitarian:
      'Emergency health care, rehabilitation and restoring contact between relatives are central to the humanitarian response.',
    sources: [
      icrc('iran'),
      cfr('confrontation-between-united-states-and-iran'),
    ],
  },
  {
    id: 'myanmar',
    title: 'Myanmar',
    region: 'Asia & Pacific',
    latitude: 22.1,
    longitude: 95.6,
    severity: 'critical',
    status: 'Armed conflict',
    summary:
      'Multiple armed conflicts affect communities across Myanmar, from ethnic borderlands to central and southern regions.',
    context:
      'Conflict and violence overlap with recovery from the March 2025 earthquake, placing additional pressure on livelihoods and services.',
    actors: [
      'Myanmar military',
      'Ethnic armed organizations',
      'Resistance forces',
    ],
    humanitarian:
      'Displaced families need food, water, shelter and health care. Landmines, lost livelihoods and family separation add lasting risks.',
    sources: [icrc('myanmar'), cfr('rohingya-crisis-myanmar')],
  },
  {
    id: 'eastern-drc',
    title: 'Eastern DR Congo',
    region: 'Africa',
    latitude: -1.68,
    longitude: 29.22,
    severity: 'critical',
    status: 'Armed conflict',
    summary:
      'Recurring armed conflicts in eastern Democratic Republic of the Congo threaten civilians and displace communities.',
    context:
      'Different armed groups and overlapping conflicts affect the region. A single marker represents a broad briefing area around the Kivus.',
    actors: ['Congolese armed forces', 'M23', 'Other armed groups'],
    humanitarian:
      'Protection of civilians, treatment of wounded people, essential supplies and reconnecting separated families are persistent priorities.',
    sources: [
      icrc('democratic-republic-congo'),
      cfr('violence-democratic-republic-congo'),
    ],
  },
  {
    id: 'lebanon',
    title: 'Lebanon',
    region: 'Middle East & North Africa',
    latitude: 33.27,
    longitude: 35.2,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Hostilities and displacement put pressure on communities and essential services, particularly in southern Lebanon.',
    context:
      'ICRC reports acute humanitarian needs amid continued uncertainty. Lebanon also hosts people displaced by other conflicts in the region.',
    actors: ['Israeli armed forces', 'Hezbollah', 'Lebanese authorities'],
    humanitarian:
      'Safe access to health care, food and water is essential for displaced families and communities receiving them.',
    sources: [
      icrc('lebanon'),
      {
        name: 'CFR · Regional background',
        url: 'https://www.cfr.org/backgrounders/lebanon-how-israel-hezbollah-and-regional-powers-are-shaping-its-future',
      },
    ],
  },
  {
    id: 'yemen-red-sea',
    title: 'Yemen & the Red Sea',
    region: 'Middle East & North Africa',
    latitude: 15.35,
    longitude: 43.15,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Years of conflict and economic hardship have weakened livelihoods and essential services in Yemen.',
    context:
      'The country is part of a wider Red Sea security crisis. This briefing focuses on the civilian consequences of the protracted conflict.',
    actors: [
      'Ansar Allah (Houthis)',
      'Yemeni government and associated forces',
      'Regional and international forces',
    ],
    humanitarian:
      'Water, sanitation, health care, livelihood support and the safe return of detainees remain major concerns.',
    sources: [icrc('yemen'), cfr('war-yemen')],
  },
  {
    id: 'syria',
    title: 'Syria',
    region: 'Middle East & North Africa',
    latitude: 34.8,
    longitude: 38.7,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'A long legacy of war and continuing violence leaves communities facing damaged services and unresolved displacement.',
    context:
      'ICRC highlights protection needs, missing people and local humanitarian crises, including southern Syria. Conditions are not uniform across the country.',
    actors: [
      'Syrian authorities and forces',
      'Local armed groups',
      'External military actors',
    ],
    humanitarian:
      'Families need access to health care, clean water and livelihoods, alongside information about missing relatives.',
    sources: [icrc('syria')],
  },
  {
    id: 'sahel',
    title: 'Central Sahel',
    region: 'Africa',
    latitude: 14.5,
    longitude: -0.8,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Armed conflicts cross national borders and disrupt civilian life across the central Sahel.',
    context:
      'The briefing groups Mali, Burkina Faso and neighboring affected areas. Violence and climatic pressures interact with fragile public services.',
    actors: [
      'National armed forces',
      'Non-state armed groups',
      'Local militias',
    ],
    humanitarian:
      'Displacement places pressure on schools and hospitals. Access to water, farming and pastoral livelihoods is increasingly difficult.',
    sources: [icrc('sahel')],
  },
  {
    id: 'nigeria-lake-chad',
    title: 'Nigeria & Lake Chad basin',
    region: 'Africa',
    latitude: 11.85,
    longitude: 13.16,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Armed conflict and violence affect northeastern Nigeria and communities around the Lake Chad basin.',
    context:
      'The marker is anchored near Maiduguri for regional orientation. It does not describe the security situation of an individual neighborhood.',
    actors: ['National security forces', 'Non-state armed groups'],
    humanitarian:
      'Displaced people and host communities need health care, clean water, livelihood support and help finding missing relatives.',
    sources: [icrc('nigeria')],
  },
  {
    id: 'somalia',
    title: 'Somalia',
    region: 'Africa',
    latitude: 3.1,
    longitude: 43.65,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Decades of armed conflict and climatic shocks have eroded civilian livelihoods and contributed to repeated displacement.',
    context:
      'Humanitarian conditions differ across Somalia. The briefing covers broad conflict impacts rather than a single battle or military operation.',
    actors: ['Somali security forces', 'Al-Shabaab', 'Other armed groups'],
    humanitarian:
      'Emergency assistance, reliable livelihoods, detainee protection and reconnecting families remain key priorities.',
    sources: [icrc('somalia'), cfr('al-shabab-somalia')],
  },
  {
    id: 'ethiopia',
    title: 'Ethiopia',
    region: 'Africa',
    latitude: 11.6,
    longitude: 39.2,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Conflict-affected communities face disrupted health services, displacement and the lasting effects of violence.',
    context:
      'ICRC supports communities in several regions, including care for people wounded in Amhara and Oromia and assistance in Tigray.',
    actors: ['Ethiopian federal and regional forces', 'Regional armed groups'],
    humanitarian:
      'Medical care, support for survivors of sexual violence, safe water and assistance to farming communities are important needs.',
    sources: [icrc('ethiopia')],
  },
  {
    id: 'south-sudan',
    title: 'South Sudan',
    region: 'Africa',
    latitude: 8.6,
    longitude: 31.6,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Armed conflict and other violence continue to harm communities and separate families in South Sudan.',
    context:
      'Humanitarian work addresses both immediate injuries and prolonged disruption of civilian life. This representative point is not a conflict perimeter.',
    actors: ['Government forces', 'Opposition and other armed groups'],
    humanitarian:
      'Needs include treatment of weapon wounds, rehabilitation, safe water, emergency relief and finding missing relatives.',
    sources: [icrc('republic-south-sudan')],
  },
  {
    id: 'central-african-republic',
    title: 'Central African Republic',
    region: 'Africa',
    latitude: 6.0,
    longitude: 20.6,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Armed violence damages homes, interrupts basic services and exposes communities to recurring humanitarian crises.',
    context:
      'ICRC operations respond to needs across several regions; its recent reporting also highlights insecurity in the southeast.',
    actors: ['Government security forces', 'Non-state armed groups'],
    humanitarian:
      'Food, safe water, medical care, seeds and materials to repair damaged homes support affected communities.',
    sources: [icrc('central-african-republic')],
  },
  {
    id: 'cameroon',
    title: 'Cameroon',
    region: 'Africa',
    latitude: 6.0,
    longitude: 10.1,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Armed conflict and other violence affect communities in the North-West, South-West and Far North.',
    context:
      'Distinct local crises affect Cameroon. The marker anchors the western briefing area; it does not merge their causes or armed groups.',
    actors: ['Cameroonian security forces', 'Non-state armed groups'],
    humanitarian:
      'Safe water, health care and emergency assistance are needed alongside support for farming and separated families.',
    sources: [icrc('cameroon')],
  },
  {
    id: 'mozambique',
    title: 'Northern Mozambique',
    region: 'Africa',
    latitude: -12.2,
    longitude: 40.1,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Armed conflict in northern Mozambique disrupts lives and livelihoods, including in Cabo Delgado.',
    context:
      'Displaced families and host communities require both immediate relief and sustained access to essential services.',
    actors: ['Mozambican security forces', 'Non-state armed groups'],
    humanitarian:
      'Emergency household supplies, drinking water, health care, livelihoods and restoring family contact are central needs.',
    sources: [icrc('mozambique')],
  },
  {
    id: 'afghanistan-pakistan',
    title: 'Afghanistan–Pakistan',
    region: 'Asia & Pacific',
    latitude: 34.1,
    longitude: 70.8,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Cross-border hostilities compound the humanitarian consequences of long conflicts in Afghanistan and insecurity in Pakistan.',
    context:
      'ICRC called for restraint during hostilities in February 2026. CFR describes cross-border militancy as a central dispute between the governments.',
    actors: [
      'Afghan Taliban authorities and forces',
      'Pakistani armed forces',
      'Tehrik-e-Taliban Pakistan',
    ],
    humanitarian:
      'People need basic health care, rehabilitation, safe water and help restoring family contact across disrupted communities.',
    sources: [icrc('afghanistan'), icrc('pakistan'), cfr('war-afghanistan')],
  },
  {
    id: 'haiti',
    title: 'Haiti',
    region: 'Americas',
    latitude: 18.54,
    longitude: -72.34,
    severity: 'high',
    status: 'Security crisis',
    summary:
      'Persistent armed violence restricts access to essential services and creates growing humanitarian needs.',
    context:
      'This security-crisis briefing is centered on Port-au-Prince. It does not classify every part of Haiti as an active battlefield.',
    actors: ['Haitian security forces', 'Armed groups'],
    humanitarian:
      'Safe access to hospitals, clean water and shelter is a priority, including evacuation of wounded people and assistance at displacement sites.',
    sources: [icrc('haiti')],
  },
  {
    id: 'colombia',
    title: 'Colombia',
    region: 'Americas',
    latitude: 7.8,
    longitude: -73.0,
    severity: 'high',
    status: 'Armed conflict',
    summary:
      'Decades of armed conflict and continuing violence affect communities across Colombia.',
    context:
      'The briefing covers multiple conflicts and affected regions, using a representative northern location. Rural and urban communities face different pressures.',
    actors: ['Colombian security forces', 'Non-state armed groups'],
    humanitarian:
      'Priorities include tracing missing people, protecting health care and education, and reducing risks from mines and explosive remnants.',
    sources: [icrc('colombia')],
  },
  {
    id: 'mexico',
    title: 'Mexico',
    region: 'Americas',
    latitude: 24.8,
    longitude: -107.4,
    severity: 'high',
    status: 'Security crisis',
    summary:
      'Armed violence creates humanitarian consequences including disappearance, displacement and barriers to health care.',
    context:
      'This is a countrywide security-crisis briefing with a representative northwestern location, not a legal designation of war or a neighborhood risk rating.',
    actors: ['Mexican security forces', 'Organized armed groups'],
    humanitarian:
      'Families need help locating missing relatives; displaced communities require protection and continued access to essential services.',
    sources: [icrc('mexico')],
  },
  {
    id: 'iraq',
    title: 'Iraq',
    region: 'Middle East & North Africa',
    latitude: 35.46,
    longitude: 44.39,
    severity: 'elevated',
    status: 'Conflict aftermath',
    summary:
      'Recovery and reconstruction coexist with humanitarian needs left by past conflicts and exposure to renewed violence.',
    context:
      'ICRC describes an adapted response focused on remaining needs after 2017, including displaced families, returnees and contaminated areas.',
    actors: ['Iraqi authorities and security forces', 'Armed groups'],
    humanitarian:
      'Missing people, detainees, disability support and explosive contamination remain central protection issues.',
    sources: [icrc('iraq')],
  },
  {
    id: 'libya',
    title: 'Libya',
    region: 'Middle East & North Africa',
    latitude: 32.88,
    longitude: 13.19,
    severity: 'elevated',
    status: 'Conflict aftermath',
    summary:
      'Instability and the legacy of prolonged conflict continue to affect communities despite some humanitarian improvement.',
    context:
      'ICRC emphasizes protection and preparedness for renewed hostilities. The marker does not indicate that active fighting is occurring at its location.',
    actors: ['Libyan authorities', 'Armed groups'],
    humanitarian:
      'Clarifying the fate of missing people, protecting detainees and maintaining emergency response capacity are ongoing priorities.',
    sources: [icrc('libya')],
  },
  {
    id: 'india-pakistan',
    title: 'India–Pakistan / Kashmir',
    region: 'Asia & Pacific',
    latitude: 34.2,
    longitude: 74.3,
    severity: 'elevated',
    status: 'Flashpoint',
    summary:
      'The dispute over Kashmir remains a source of tension between two nuclear-armed states.',
    context:
      'CFR describes a ceasefire following the May 2025 confrontation. Territorial labels and the representative point do not endorse a sovereignty claim.',
    actors: [
      'Indian authorities and armed forces',
      'Pakistani authorities and armed forces',
      'Militant groups',
    ],
    humanitarian:
      'Civilian protection and access to basic services are concerns during renewed hostilities; this briefing makes no current casualty estimate.',
    sources: [cfr('conflict-between-india-and-pakistan')],
  },
  {
    id: 'armenia-azerbaijan',
    title: 'Armenia–Azerbaijan',
    region: 'Europe & Eurasia',
    latitude: 39.5,
    longitude: 46.3,
    severity: 'elevated',
    status: 'Conflict aftermath',
    summary:
      'The consequences of conflict persist for missing people, their families and communities along the border.',
    context:
      'ICRC supports border communities and acts as a neutral intermediary. This briefing does not assert that a new war is underway.',
    actors: ['Armenian authorities', 'Azerbaijani authorities'],
    humanitarian:
      'Tracing missing people, family contact, emergency health care and support for affected border communities are continuing priorities.',
    sources: [icrc('armenia')],
  },
  {
    id: 'taiwan-strait',
    title: 'Taiwan Strait',
    region: 'Asia & Pacific',
    latitude: 24.0,
    longitude: 119.4,
    severity: 'elevated',
    status: 'Flashpoint',
    summary:
      'Military pressure and competing political positions make the Taiwan Strait a significant regional flashpoint.',
    context:
      'CFR tracks the risk of escalation around Taiwan. This is a contingency briefing, not a report of an ongoing invasion.',
    actors: [
      'People’s Republic of China',
      'Taiwan authorities',
      'United States',
    ],
    humanitarian:
      'Planning concern: a major escalation could endanger civilians and disrupt critical supply chains. No current humanitarian impact estimate is supplied.',
    sources: [cfr('confrontation-over-taiwan')],
  },
  {
    id: 'south-china-sea',
    title: 'South China Sea',
    region: 'Asia & Pacific',
    latitude: 14.0,
    longitude: 114.5,
    severity: 'elevated',
    status: 'Flashpoint',
    summary:
      'Overlapping maritime claims create recurring friction around disputed islands, reefs and shoals.',
    context:
      'CFR tracks encounters at sea and the risk of wider escalation. The map marker conveys no position on sovereignty or maritime boundaries.',
    actors: [
      'China',
      'Philippines',
      'Vietnam',
      'Other claimant states and regional partners',
    ],
    humanitarian:
      'Planning concern: escalation could threaten civilian mariners, fishing livelihoods and commercial navigation.',
    sources: [cfr('territorial-disputes-south-china-sea')],
  },
  {
    id: 'korean-peninsula',
    title: 'Korean Peninsula',
    region: 'Asia & Pacific',
    latitude: 38.1,
    longitude: 127.1,
    severity: 'elevated',
    status: 'Flashpoint',
    summary:
      'North Korea’s nuclear and missile programs and regional military confrontation sustain the risk of escalation.',
    context:
      'CFR monitors this strategic flashpoint. The briefing does not indicate that full-scale hostilities have resumed on the peninsula.',
    actors: ['North Korea', 'South Korea', 'United States', 'Regional powers'],
    humanitarian:
      'Planning concern: a renewed war would put civilian populations at risk. This snapshot provides no current displacement or casualty count.',
    sources: [cfr('north-korea-crisis')],
  },
];

// Freeze nested records so filtering and UI selection cannot change the source snapshot.
export const CONFLICT_ZONES = Object.freeze(
  catalog.map((zone) =>
    Object.freeze({
      ...zone,
      updatedAt: CONFLICT_COVERAGE.updatedAt,
      actors: Object.freeze([...zone.actors]),
      sources: Object.freeze(
        zone.sources.map((source) => Object.freeze(source)),
      ),
    }),
  ),
);

export const CONFLICT_REGIONS = Object.freeze(
  [...new Set(CONFLICT_ZONES.map((zone) => zone.region))].sort(),
);

/** Filters the published snapshot without mutating its order or records. */
export function filterConflicts({
  query = '',
  region = 'all',
  severity = 'all',
} = {}) {
  const terms = String(query ?? '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return CONFLICT_ZONES.filter((zone) => {
    if (region && region !== 'all' && zone.region !== region) return false;
    if (severity && severity !== 'all' && zone.severity !== severity)
      return false;
    const haystack = [
      zone.title,
      zone.region,
      zone.summary,
      zone.context,
      zone.status,
      ...zone.actors,
    ]
      .join(' ')
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
