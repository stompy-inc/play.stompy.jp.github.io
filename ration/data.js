(() => {
  const campaignConfig = {
    title: "THE RATION OFFICE",
    subtitle: "APPROVE. DENY. SURVIVE.",
    totalShifts: 10,
    shiftsPerWeek: 5,
    citizensPerShift: 6,
    firstCitizenId: "c001"
  };

  const prologue = {
    kicker: "TRANSFER NOTICE",
    title: "WINDOW 12",
    imageWebp: "assets/prologue/window-12-arrival.webp",
    image: "assets/prologue/window-12-arrival.png",
    imageAlt: "A hooded clerk approaches the ration bureau before dawn.",
    body: [
      "I was transferred down to the ration bureau.",
      "Window 12. Ink pad, ledger, and other people's lives stacked on the desk.",
      "I must do the minimum required work.",
      "If only minimum work stayed minimum."
    ]
  };

  const citizenKinds = {
    scaled: { label: "Scaled", icon: "SCL", documentNeeds: ["Body Permit", "Scale Inspection"], possibleSpecialRequests: ["Heat Token", "Medicine"] },
    felid: { label: "Felid", icon: "FEL", documentNeeds: ["Body Permit", "Night Labor Permit when applicable"], possibleSpecialRequests: ["Milk", "Night Labor Permit"] },
    canid: { label: "Canid", icon: "CND", documentNeeds: ["Body Permit", "Service Record when applicable"], possibleSpecialRequests: ["Medicine", "Work Rations"] },
    avian: { label: "Avian", icon: "AVN", documentNeeds: ["Body Permit", "Flight Permit", "Feather Renewal Record"], possibleSpecialRequests: ["Grain", "Feather Renewal"] },
    horned: { label: "Horned", icon: "HRN", documentNeeds: ["Body Permit", "Horn Registration"], possibleSpecialRequests: ["Medicine", "Housing Clearance"] },
    amphibian: { label: "Amphibian", icon: "AMP", documentNeeds: ["Body Permit", "Moisture Ration Permit"], possibleSpecialRequests: ["Moisture Ration", "Medicine"] },
    mothkin: { label: "Mothkin", icon: "MTH", documentNeeds: ["Body Permit", "Night Labor Permit", "Lamp Oil Permit"], possibleSpecialRequests: ["Lamp Oil", "Night Rations"] }
  };

  const bodyCodes = { scaled: "SCL-07", felid: "FEL-03", canid: "CND-04", avian: "AVN-02", horned: "HRN-06", amphibian: "AMP-05", mothkin: "MTH-08" };

  function citizen(id, name, age, kind, job, district, household, request, rationBook, bodyPermit, loyaltyRecord, note, traits, riskLevel, recurringGroup, consequenceFlags, rationCost, kindDocumentLabel, kindDocumentStatus, appearsIf = null) {
    return {
      id,
      name,
      age,
      kind,
      bodyClass: citizenKinds[kind].label,
      bodyClassCode: bodyCodes[kind],
      job,
      district,
      household,
      request,
      rationBook,
      bodyPermit,
      kindDocument: { label: kindDocumentLabel, status: kindDocumentStatus },
      loyaltyRecord,
      note,
      traits: Array.from(new Set([kind, ...traits])),
      riskLevel,
      recurringGroup,
      appearsIf,
      consequenceFlags,
      rationCost
    };
  }

  const shifts = [
    {
      id: 1,
      week: 1,
      weekday: "Monday",
      title: "First Classification",
      headline: "DIRECTORATE OPENS BODY CLASS LEDGER WEEK",
      deck: "All citizens are equal.\nSome require additional forms.",
      eveningHeadline: "REGISTRY LANTERNS DIM AFTER LEDGER SMOKE",
      eveningDeck: "Officials call it a filing error. Nearby homes were asked to recite permit numbers.",
      directives: ["Valid ration books required for all households.", "Essential workers receive priority.", "Body Permit discrepancies must be noted."],
      ruleTags: ["valid_ration_books", "essential_workers_priority", "body_permit_discrepancy_note"],
      reportQuota: 0,
      rationStock: 17,
      citizenIds: ["c001", "c002", "c003", "c004", "c005"],
      startText: "The ink pad smells of glue and heat. The first ledger is marked BODY CLASS.",
      endText: "The first shift ends with five shapes reduced to five lines of ink."
    },
    {
      id: 2,
      week: 1,
      weekday: "Tuesday",
      title: "District Review",
      headline: "DISTRICT 3 BODY FILES REQUIRE ADDITIONAL CARE",
      deck: "Officials deny that geography is destiny, then stamp the map.",
      eveningHeadline: "DISTRICT 3 STAIRWELLS SEALED FOR ROUTINE COUNT",
      eveningDeck: "Families waited below paper strips while clerks verified who was allowed to climb.",
      directives: ["District 3 applications require extra review.", "Expired Body Permits must be denied or recorded.", "Report quota: 1 citizen."],
      ruleTags: ["district3_extra_review", "expired_body_permit_penalty", "report_quota"],
      reportQuota: 1,
      rationStock: 16,
      citizenIds: ["c006", "c007", "c008", "c009", "c010", "c011"],
      startText: "A red string now connects District 3 to the Body Permit drawer.",
      endText: "By closing bell, the map looks less like paper and more like a verdict."
    },
    {
      id: 3,
      week: 1,
      weekday: "Wednesday",
      title: "Quota Notice",
      headline: "CIVIC VIGILANCE EXPANDS INTO CLASSIFICATION DESKS",
      deck: "One useful report may prevent many unnecessary questions.",
      eveningHeadline: "REPORT QUOTA BELL HEARD OUTSIDE SCHOOLYARD",
      eveningDeck: "Children paused recitation as civic vigilance carts collected names by district.",
      directives: ["Citizens with unclear loyalty records must be reported.", "Horn Registration mismatches require notation.", "Report quota: 1 citizen."],
      ruleTags: ["unclear_loyalty_report", "horn_registration_check", "report_quota"],
      reportQuota: 1,
      rationStock: 16,
      citizenIds: ["c012", "c013", "c014", "c015", "c016", "c017"],
      startText: "The report counter is polished. Someone has already tested the bell.",
      endText: "The counter makes a sound even when it does not move."
    },
    {
      id: 4,
      week: 1,
      weekday: "Thursday",
      title: "Cross-Index",
      headline: "HEAT, MILK, AND MEMORY NOW CROSS-INDEXED",
      deck: "Related files may be reviewed together for public efficiency.",
      eveningHeadline: "MILK DEPOT QUEUE DISPERSED AFTER SONG RUMOR",
      eveningDeck: "No removals were announced. Several classroom permits were taken for cleaning.",
      directives: ["Heat Tokens require current Scale Inspection.", "Teachers requesting milk require additional review.", "District 3 records must be cross-checked."],
      ruleTags: ["scaled_heat_token_requires_scale_inspection", "teachers_milk_review", "district3_extra_review"],
      reportQuota: 1,
      rationStock: 15,
      citizenIds: ["c018", "c019", "c020", "c021", "c022", "c023"],
      startText: "Yesterday's files are not gone. They are standing in line.",
      endText: "The office ledger begins to feel like a family tree."
    },
    {
      id: 5,
      week: 1,
      weekday: "Friday",
      title: "First Audit",
      headline: "FLIGHT PERMITS SUSPENDED FOR ROUTINE GRATITUDE",
      deck: "Missing pages are considered a form of speech.",
      eveningHeadline: "UNREGISTERED WINGS NOTICE FOUND ON TENEMENT DOORS",
      eveningDeck: "Flight officers say the seals are temporary, official, and fully adhesive.",
      directives: ["Flight Permits are suspended until further notice.", "Missing body records increase audit liability.", "Report quota: 2 citizens."],
      ruleTags: ["avian_flight_suspended", "missing_body_records_audit", "report_quota", "first_audit"],
      reportQuota: 2,
      rationStock: 15,
      citizenIds: ["c024", "c025", "c026", "c027", "c028", "c029"],
      startText: "An audit clerk sits where the coat rack used to be. Their wings are folded under a gray permit cape.",
      endText: "Friday closes with your initials underlined twice."
    },
    {
      id: 6,
      week: 2,
      weekday: "Monday",
      title: "Shortage Week",
      headline: "EMERGENCY ALLOCATION REDUCES BODY-SPECIFIC RATIONS",
      deck: "Citizens are advised that hunger is easier when evenly distributed.",
      eveningHeadline: "CLINIC CLOSES HUMID WARD FOR FORM REVISION",
      eveningDeck: "Moisture ration holders were told to keep receipts dry until further notice.",
      directives: ["Ration Stock reduced by emergency allocation.", "Moisture Rations require clinic seal.", "Workers with dependents receive priority."],
      ruleTags: ["ration_shortage", "amphibian_moisture_requires_clinic_seal", "workers_dependents_priority"],
      reportQuota: 1,
      rationStock: 12,
      citizenIds: ["c030", "c031", "c032", "c033", "c034", "c035"],
      startText: "Week 2 begins with fewer sacks behind the counter and more categories on the wall.",
      endText: "The empty shelf speaks more clearly than the loudspeaker."
    },
    {
      id: 7,
      week: 2,
      weekday: "Tuesday",
      title: "Contradictions",
      headline: "MILK POLICY CLARIFIED BY ADDITIONAL CONTRADICTIONS",
      deck: "Classification protects the State. Contradiction protects classification.",
      eveningHeadline: "CONTRADICTORY MILK ORDER DELAYS NURSERY MEAL",
      eveningDeck: "Officials report no hunger, only a temporary classification of appetite.",
      directives: ["Teachers are ineligible for milk.", "Children of essential workers receive priority.", "Conflicting cases must be recorded."],
      ruleTags: ["teachers_no_milk", "essential_children_priority", "conflicting_cases_record", "report_quota"],
      reportQuota: 2,
      rationStock: 13,
      citizenIds: ["c036", "c037", "c038", "c039", "c040", "c041"],
      startText: "Two notices contradict each other on the same nail. No one removes either notice.",
      endText: "The day ends with both notices intact."
    },
    {
      id: 8,
      week: 2,
      weekday: "Wednesday",
      title: "Old Seals",
      headline: "LAMP OIL AND OLD DISTRICT SEALS RECEIVE NEW ATTENTION",
      deck: "Citizens requesting private favors should be made public.",
      eveningHeadline: "LAMP OIL FACTORY REPORTS NIGHT SHIFT DARKNESS",
      eveningDeck: "Old seals are under review after several workbenches were found empty.",
      directives: ["Lamp Oil requires Night Labor Permit.", "Citizens carrying old district seals require review.", "Report quota: 2 citizens."],
      ruleTags: ["mothkin_lamp_oil_requires_night_permit", "old_district_seal_review", "report_quota", "secret_request_crackdown"],
      reportQuota: 2,
      rationStock: 13,
      citizenIds: ["c042", "c043", "c044", "c045", "c046", "c047"],
      startText: "The whispers begin before the queue reaches your desk.",
      endText: "The quietest requests leave the loudest marks."
    },
    {
      id: 9,
      week: 2,
      weekday: "Thursday",
      title: "Return Files",
      headline: "PAST BODY RECORDS PRAISED FOR REMAINING RELEVANT",
      deck: "Every correct decision becomes useful again.",
      eveningHeadline: "FAMILIES GATHER WHERE MISSING FILE CART PASSED",
      eveningDeck: "No complaint was recorded. The street kept its place in line.",
      directives: ["Previous file losses are under audit.", "Families of reported citizens require notation.", "Additional heat requests are suspended."],
      ruleTags: ["previous_file_losses_audit", "families_reported_notation", "additional_heat_suspended", "report_quota"],
      reportQuota: 2,
      rationStock: 14,
      citizenIds: ["c048", "c049", "c050", "c051", "c052", "c053"],
      startText: "The line is full of people you have already touched on paper.",
      endText: "Some files return with faces attached."
    },
    {
      id: 10,
      week: 2,
      weekday: "Friday",
      title: "Final Classification",
      headline: "TWO-WEEK TERM TO CONCLUDE WITH ROUTINE SEALING",
      deck: "The record is nearly complete. The record is hungry.",
      eveningHeadline: "AUDIT TRAIN ARRIVES WITHOUT PASSENGER MANIFEST",
      eveningDeck: "Station clerks sealed Platform Two and requested quiet from all registered bodies.",
      directives: ["All unresolved classifications must be sealed.", "Report quota: 2 citizens.", "Final audit begins after today's shift."],
      ruleTags: ["unresolved_classification_seal", "report_quota", "final_vigilance"],
      reportQuota: 2,
      rationStock: 12,
      citizenIds: ["c054", "c055", "c056", "c057", "c058"],
      startText: "The final Friday begins with every drawer already open.",
      endText: "The last stamp dries while the audit clerk waits."
    }
  ];

  const citizens = [
    citizen("c001", "Tarek Voss", 41, "scaled", "Furnace Worker", 2, "Spouse, 1 hatchling", "Bread x2, Heat Token x1", "Valid", "Valid", "Clean", "Heat Token request exceeds new winter quota.", ["worker", "essential_worker", "dependents", "heat_token", "scale_inspection_current", "special_body_need", "clear_loyalty"], 1, "scaled_furnace", ["laborer", "scaled_furnace", "tarek"], 3, "Scale Inspection", "Current"),
    citizen("c002", "Ilya Renn", 52, "avian", "Postal Courier", 1, "Alone", "Grain x2", "Valid", "Valid", "Decorated Service", "Flight permit suspended by emergency directive.", ["worker", "essential_worker", "flight_permit", "flight_suspended", "decorated_labor"], 2, "avian_courier", ["avian_courier", "ilya"], 2, "Flight Permit", "Suspended"),
    citizen("c003", "Nomi Pell", 28, "felid", "Nursery Cook", 2, "Infant, aunt", "Bread x1, Milk x2", "Valid", "Valid", "Clean", "Nursery ledger shows twelve children fed.", ["children", "infant", "milk", "worker", "essential_worker", "clear_loyalty"], 0, "nursery_cook", ["nomi"], 3, "Night Labor Permit", "Not Required"),
    citizen("c004", "Borun Hale", 17, "horned", "Apprentice Mason", 4, "Grandmother", "Bread x1, Medicine x1", "Valid", "Expired", "Clean", "Horn measurement record does not match current file.", ["medicine", "elder_care", "body_permit_expired", "horn_registration_mismatch"], 4, "horned_apprentice", ["horned_apprentice", "borun"], 2, "Horn Registration", "Mismatch"),
    citizen("c005", "Rava Skel", 33, "mothkin", "Office Runner", 1, "Spouse", "Bread x1", "Smudged", "Valid", "Unclear", "Ration book number copied beneath a wing-print stain.", ["smudged_book", "unclear_loyalty", "worker"], 4, "smudged_mothkin", ["rava"], 1, "Night Labor Permit", "Current"),
    citizen("c006", "Mira Volkov", 34, "felid", "School Teacher", 3, "2 children", "Bread x2, Milk x1", "Valid", "Valid", "Unclear", "Taught an old song before class.", ["teacher", "district3", "children", "milk", "unclear_loyalty", "old_song"], 2, "old_song_teacher", ["old_song_teacher", "mira"], 3, "Night Labor Permit", "Not Filed"),
    citizen("c007", "Olan Reed", 46, "amphibian", "Clinic Assistant", 2, "Three dependents", "Bread x2, Moisture Ration x1", "Valid", "Valid", "Clean", "Moisture permit renewal delayed by office closure.", ["medical", "worker", "dependents", "moisture_ration", "no_clinic_stamp", "special_body_need"], 1, "amphibian_clinic", ["amphibian_clinic", "olan"], 3, "Moisture Ration Permit", "Renewal Delayed"),
    citizen("c008", "Varo Kess", 58, "canid", "Retired Watchman", 3, "Spouse", "Bread x2, Medicine x1", "Valid", "Valid", "Decorated, then sealed", "Service record contains one restricted page.", ["district3", "medicine", "decorated_labor", "sealed_record", "unclear_loyalty"], 3, "retired_watchman", ["varo"], 3, "Service Record", "Partly Sealed"),
    citizen("c009", "Sera Moth", 29, "mothkin", "Night Textile Worker", 5, "Younger brother", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Clean", "Night labor permit bears an old factory seal.", ["worker", "district5", "lamp_oil", "night_labor_permit", "old_district_seal", "special_body_need"], 2, "mothkin_worker", ["mothkin_worker", "sera"], 2, "Night Labor Permit", "Old Factory Seal"),
    citizen("c010", "Nael Orin", 40, "scaled", "Boiler Clerk", 3, "Alone", "Bread x2", "Valid", "Discrepancy", "Clean", "Tail length amended in the margin without initials.", ["district3", "body_permit_discrepancy", "worker", "scale_inspection_current"], 3, "boiler_clerk", ["nael"], 2, "Scale Inspection", "Current"),
    citizen("c011", "Breka Tull", 61, "horned", "Seamstress", 1, "Mother", "Bread x1, Medicine x1", "Valid", "Valid", "Unclear", "Horn Registration current; loyalty card left unsigned.", ["medicine", "elder_care", "unclear_loyalty"], 2, "seamstress", ["breka"], 2, "Horn Registration", "Current"),
    citizen("c012", "Kori Nale", 27, "avian", "Roof Medic", 3, "Sibling", "Bread x1, Grain x1", "Valid", "Valid", "Unclear", "Seen above archive roof after curfew.", ["district3", "medical", "unclear_loyalty", "flight_permit", "curfew"], 4, "roof_medic", ["kori"], 2, "Flight Permit", "Current"),
    citizen("c013", "Dima Sol", 44, "canid", "Rail Switchman", 2, "Spouse, 2 children", "Bread x2, Beans x1", "Valid", "Valid", "Clean", "Signed for double shift after derailment drill.", ["worker", "essential_worker", "children", "clear_loyalty"], 0, "rail_family", ["dima"], 3, "Service Record", "Current"),
    citizen("c014", "Elya Moss", 48, "amphibian", "Water Inspector", 1, "5 dependents", "Bread x3, Moisture Ration x1", "Valid", "Valid", "Clean", "Household list recently expanded. No clinic seal.", ["large_family", "dependents", "moisture_ration", "no_clinic_stamp", "special_body_need"], 4, "water_inspector", ["elya"], 4, "Moisture Ration Permit", "No Clinic Seal"),
    citizen("c015", "Arko Vale", 36, "scaled", "Book Binder", 4, "Alone", "Bread x1, Heat Token x1", "Valid", "Valid", "Unclear", "Scale Inspection page has been removed cleanly.", ["heat_token", "scale_inspection_missing", "unclear_loyalty", "archive_adjacent", "special_body_need"], 4, "book_binder", ["arko"], 2, "Scale Inspection", "Missing"),
    citizen("c016", "Lenka Ori", 24, "mothkin", "Apartment Warden", 3, "Alone", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Exemplary", "Mentions a sealed door on stairwell B.", ["district3", "sealed_door", "lamp_oil", "night_labor_permit", "state_informant"], 4, "warden", ["lenka"], 2, "Night Labor Permit", "Current"),
    citizen("c017", "Palo Venn", 50, "felid", "Clock Repairer", 5, "Spouse", "Bread x2, Milk x1", "Valid", "Valid", "Unclear", "Shop clocks run three minutes slow.", ["district5", "milk", "unclear_loyalty", "craft"], 3, "slow_clocks", ["palo"], 3, "Night Labor Permit", "Current"),
    citizen("c018", "Mira Volkov", 34, "felid", "School Teacher", 3, "2 children", "Bread x2, Milk x1", "Valid", "Valid", "Unclear", "Second request after classroom inspection.", ["teacher", "district3", "children", "milk", "unclear_loyalty", "old_song", "recurring"], 3, "old_song_teacher", ["old_song_teacher", "mira"], 3, "Night Labor Permit", "Not Filed", { flagAny: ["helped_old_song_teacher", "reported_old_song_teacher", "denied_old_song_teacher"] }),
    citizen("c019", "Eru Hale", 72, "horned", "Retired Stone Cutter", 4, "Grandson", "Bread x1, Medicine x1", "Valid", "Valid", "Clean", "Grandson's horn measurement copy is attached twice.", ["elder", "medicine", "relative_reported", "horn_registration_mismatch"], 3, "horned_apprentice", ["eru"], 2, "Horn Registration", "Duplicate Copy"),
    citizen("c020", "Rusk Voss", 39, "scaled", "Foundry Foreman", 2, "Barracks household", "Bread x3, Heat Token x1", "Valid", "Valid", "Clean", "Asks whether Tarek Voss was delayed here.", ["worker", "essential_worker", "dependents", "heat_token", "scale_inspection_current", "relative_laborer"], 1, "scaled_furnace", ["foreman", "scaled_furnace"], 4, "Scale Inspection", "Current"),
    citizen("c021", "Anya Kor", 31, "amphibian", "Clinic Porter", 3, "Sister", "Bread x1, Moisture Ration x1", "Valid", "Valid", "Unclear", "Neighbor report: leaves before dawn with wrapped damp parcels.", ["district3", "neighbor_report", "medical", "moisture_ration", "clinic_seal", "unclear_loyalty", "credible_threat"], 4, "clinic_sisters", ["anya"], 2, "Moisture Ration Permit", "Clinic Seal"),
    citizen("c022", "Sava Rune", 22, "canid", "Transit Sweeper", 3, "Alone", "Bread x1", "Smudged", "Valid", "Unclear", "Book number copied twice in different ink.", ["district3", "smudged_book", "unclear_loyalty"], 3, "smudged_book", ["sava"], 1, "Service Record", "Unknown"),
    citizen("c023", "Ular Min", 50, "mothkin", "Office Locksmith", 1, "Alone", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Exemplary", "Knows which drawers jam and which clerks force them.", ["audit_probe", "bureau", "lamp_oil", "night_labor_permit"], 5, "audit_locksmith", ["ular"], 2, "Night Labor Permit", "Current"),
    citizen("c024", "Ilar Moss", 30, "avian", "Census Copyist", 1, "Alone", "Bread x1, Ink Chit x1", "Valid", "Valid", "Exemplary", "Audit clerk asks whether your window misplaces body files.", ["audit_probe", "bureau", "feather_record_current"], 5, "audit_copyist", ["ilar"], 2, "Feather Renewal Record", "Current"),
    citizen("c025", "Rem Vire", 37, "avian", "Dock Painter", 2, "2 children", "Grain x2, Feather Renewal x1", "Valid", "Valid", "Clean", "Flight Permit suspension stamped this morning.", ["worker", "children", "flight_permit", "flight_suspended", "feather_renewal"], 2, "dock_painter", ["rem"], 3, "Flight Permit", "Suspended"),
    citizen("c026", "Dara Kole", 45, "felid", "Milk Depot Clerk", 2, "Spouse", "Bread x1, Milk x2", "Valid", "Valid", "Unclear", "Supervisor approval missing from dairy chit.", ["milk", "restricted_milk", "unclear_loyalty"], 4, "milk_depot", ["dara"], 3, "Night Labor Permit", "Not Required"),
    citizen("c027", "Bek Tavor", 64, "scaled", "Boiler Watch", 5, "Grandson", "Bread x2, Beans x1", "Valid", "Valid", "Clean", "Scale Inspection is expired; grandson's school card attached.", ["district5", "child_care", "worker", "scale_inspection_missing"], 2, "boiler_watch", ["bek"], 3, "Scale Inspection", "Expired"),
    citizen("c028", "Niska Vel", 25, "mothkin", "Book Mender", 4, "Alone", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Unclear", "Neighbor report: repairs forbidden pamphlets for coin.", ["neighbor_report", "archive_adjacent", "unclear_loyalty", "lamp_oil", "night_labor_permit", "credible_threat"], 5, "book_mender", ["niska"], 2, "Night Labor Permit", "Current"),
    citizen("c029", "Elu Volkov", 12, "felid", "School Child", 3, "Mother, sibling", "Bread x1, Milk x1", "Valid", "Child Record", "Child Record", "Carries a classroom card corrected in red.", ["children", "district3", "milk", "teacher_family"], 1, "old_song_teacher", ["elu"], 2, "Body Class Renewal", "Pending"),
    citizen("c030", "Mava Hale", 70, "horned", "Retired Launder", 4, "Grandson absent", "Bread x1, Medicine x1", "Valid", "Valid", "Clean", "Grandson's measurement file is tied to a report number.", ["elder", "medicine", "relative_reported", "horn_registration_mismatch"], 3, "horned_apprentice", ["mava"], 2, "Horn Registration", "Cross-Indexed"),
    citizen("c031", "Sira Reed", 38, "amphibian", "Clinic Nurse", 2, "2 dependents", "Bread x2, Moisture Ration x1", "Valid", "Valid", "Clean", "Clinic seal is present, but the ink is from last month.", ["medical", "worker", "dependents", "moisture_ration", "clinic_seal", "special_body_need"], 1, "amphibian_clinic", ["sira_reed"], 3, "Moisture Ration Permit", "Clinic Seal"),
    citizen("c032", "Runo Kess", 56, "canid", "Watchman's Spouse", 3, "Spouse", "Bread x2, Medicine x1", "Valid", "Valid", "Unclear", "Spouse's service file was cross-indexed after review.", ["district3", "medicine", "relative_reported", "unclear_loyalty"], 3, "retired_watchman", ["runo"], 3, "Service Record", "Cross-Indexed"),
    citizen("c033", "Tarek Voss", 41, "scaled", "Furnace Worker", 2, "Spouse, 1 hatchling", "Bread x2, Heat Token x1", "Valid", "Valid", "Clean", "Returns with furnace ash under the permit seal.", ["worker", "essential_worker", "dependents", "heat_token", "scale_inspection_current", "special_body_need", "recurring"], 1, "scaled_furnace", ["laborer", "scaled_furnace", "tarek"], 3, "Scale Inspection", "Current"),
    citizen("c034", "Sera Moth", 29, "mothkin", "Night Textile Worker", 5, "Younger brother", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Clean", "Old factory seal now appears on a second form.", ["worker", "district5", "lamp_oil", "night_labor_permit", "old_district_seal", "special_body_need", "recurring"], 3, "mothkin_worker", ["mothkin_worker", "sera"], 2, "Night Labor Permit", "Old Factory Seal"),
    citizen("c035", "Ilva Renn", 23, "avian", "Message Clerk", 1, "Aunt", "Grain x1", "Valid", "Valid", "Unclear", "Asks whether suspended wings still count as public service.", ["flight_permit", "flight_suspended", "secret_request", "unclear_loyalty"], 4, "avian_courier", ["ilva"], 1, "Flight Permit", "Suspended"),
    citizen("c036", "Kava Norr", 32, "felid", "School Teacher", 2, "2 children", "Bread x2, Milk x1", "Valid", "Valid", "Clean", "Her school seal is older than the milk directive.", ["teacher", "children", "milk", "clear_loyalty"], 1, "school_teacher", ["kava"], 3, "Night Labor Permit", "Not Required"),
    citizen("c037", "Daren Sol", 44, "canid", "Signal Worker", 2, "2 children", "Bread x2, Milk x1", "Valid", "Valid", "Decorated Service", "Essential worker household stamp attached.", ["worker", "essential_worker", "children", "milk", "decorated_labor"], 0, "signal_family", ["daren"], 3, "Service Record", "Current"),
    citizen("c038", "Vela Osk", 39, "avian", "School Teacher", 3, "Child", "Grain x1, Milk x1", "Valid", "Valid", "Unclear", "Flight Permit suspended; classroom kettle request attached.", ["teacher", "district3", "children", "milk", "unclear_loyalty", "flight_permit", "flight_suspended"], 4, "avian_teacher", ["vela"], 2, "Flight Permit", "Suspended"),
    citizen("c039", "Olan Reed", 46, "amphibian", "Clinic Assistant", 2, "Three dependents", "Bread x2, Moisture Ration x1", "Valid", "Valid", "Clean", "Clinic seal line is blank. He says the office was closed.", ["medical", "worker", "dependents", "moisture_ration", "no_clinic_stamp", "special_body_need", "recurring"], 2, "amphibian_clinic", ["amphibian_clinic", "olan"], 3, "Moisture Ration Permit", "No Clinic Seal"),
    citizen("c040", "Borun Hale", 17, "horned", "Apprentice Mason", 4, "Grandmother", "Bread x1, Medicine x1", "Valid", "Expired", "Clean", "Horn measurement has been corrected in another hand.", ["medicine", "elder_care", "body_permit_expired", "horn_registration_mismatch", "recurring"], 4, "horned_apprentice", ["horned_apprentice", "borun"], 2, "Horn Registration", "Mismatch"),
    citizen("c041", "Nara Venn", 26, "mothkin", "Nursery Lamp Keeper", 1, "Infants listed", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Clean", "Lamp oil keeps the nursery dark-room warm enough for sleep.", ["worker", "essential_worker", "children", "lamp_oil", "night_labor_permit", "special_body_need"], 1, "nursery_lamp", ["nara"], 2, "Night Labor Permit", "Current"),
    citizen("c042", "Sera Moth", 29, "mothkin", "Night Textile Worker", 5, "Younger brother", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Clean", "Quietly asks you to update the old factory seal.", ["worker", "district5", "lamp_oil", "night_labor_permit", "old_district_seal", "secret_request", "special_body_need", "recurring"], 4, "mothkin_worker", ["mothkin_worker", "sera"], 2, "Night Labor Permit", "Old Factory Seal"),
    citizen("c043", "Pavel Orsk", 46, "scaled", "Street Vendor", 5, "Spouse", "Bread x1, Heat Token x1", "Valid", "Valid", "Clean", "Vendor screening not attached; scale inspection is current.", ["vendor", "district5", "no_screening", "old_district_seal", "heat_token", "scale_inspection_current"], 3, "vendor_loop", ["pavel"], 2, "Scale Inspection", "Current"),
    citizen("c044", "Yara Sul", 19, "avian", "Messenger", 4, "Younger brother", "Grain x1", "Valid", "Valid", "Unclear", "Asks you to remove an archive roof note. No form attached.", ["youth", "curfew", "unclear_loyalty", "secret_request", "flight_permit", "flight_suspended", "credible_threat"], 5, "messenger", ["yara"], 1, "Flight Permit", "Suspended"),
    citizen("c045", "Noro Isk", 43, "canid", "Street Vendor", 2, "2 children", "Bread x2, Grain x1", "Valid", "Valid", "Unclear", "Stall closed after a price complaint. Screening slip absent.", ["vendor", "children", "unclear_loyalty", "no_screening", "credible_threat"], 3, "vendor_loop", ["noro"], 3, "Service Record", "Not Applicable"),
    citizen("c046", "Mael Vint", 57, "horned", "Night Janitor", 4, "Sick spouse", "Bread x2, Medicine x1", "Valid", "Valid", "Clean", "Asks you to remove a stairwell notation from the ledger.", ["medicine", "ill_dependent", "secret_request", "horn_registration_current"], 3, "janitor", ["mael"], 3, "Horn Registration", "Current"),
    citizen("c047", "Kessa Lume", 35, "amphibian", "Lamp Clerk", 1, "Mother", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Clean", "Lamp oil chit carries an old district seal, not a night permit.", ["lamp_oil", "no_night_labor_permit", "old_district_seal", "elder_care"], 4, "lamp_clerk", ["kessa"], 2, "Moisture Ration Permit", "Current"),
    citizen("c048", "Mira Volkov", 34, "felid", "School Teacher", 3, "1 child waiting", "Bread x2, Milk x1", "Valid", "Valid", "Unclear", "The old song is now listed as evidence of weathered morale.", ["teacher", "district3", "children", "milk", "unclear_loyalty", "old_song", "recurring"], 5, "old_song_teacher", ["old_song_teacher", "mira"], 3, "Night Labor Permit", "Not Filed"),
    citizen("c049", "Eru Hale", 72, "horned", "Retired Stone Cutter", 4, "Grandson absent", "Bread x1, Medicine x1", "Valid", "Valid", "Clean", "Borun's report number is penciled under her horn measurement.", ["elder", "medicine", "relative_reported", "horn_registration_mismatch"], 4, "horned_apprentice", ["eru"], 2, "Horn Registration", "Report-Linked"),
    citizen("c050", "Lio Moth", 21, "mothkin", "Factory Sibling", 5, "Sister", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Clean", "Factory accident log lists a lamp failure at Sera's station.", ["relative_reported", "lamp_oil", "night_labor_permit", "old_district_seal", "district5"], 4, "mothkin_worker", ["lio_moth"], 2, "Night Labor Permit", "Damaged Copy"),
    citizen("c051", "Ilya Renn", 52, "avian", "Postal Courier", 1, "Alone", "Grain x2", "Valid", "Valid", "Decorated Service", "Unapproved flight route rumor attached to the same clean file.", ["worker", "essential_worker", "flight_permit", "flight_suspended", "decorated_labor", "recurring"], 4, "avian_courier", ["avian_courier", "ilya"], 2, "Flight Permit", "Suspended"),
    citizen("c052", "Sena Voss", 8, "scaled", "School Child", 2, "Parents", "Bread x1, Heat Token x1", "Valid", "Child Record", "Child Record", "A hatchling heat card is folded into the application.", ["children", "heat_token", "scale_inspection_missing", "relative_laborer", "special_body_need"], 2, "scaled_furnace", ["sena_voss"], 2, "Scale Inspection", "Child Pending"),
    citizen("c053", "Anya Kor", 31, "amphibian", "Clinic Porter", 3, "Sister", "Bread x1, Moisture Ration x1", "Valid", "Valid", "Unclear", "Clinic Seal copy already filed with an audit clerk.", ["district3", "neighbor_report", "medical", "moisture_ration", "clinic_seal", "unclear_loyalty", "recurring"], 4, "clinic_sisters", ["anya"], 2, "Moisture Ration Permit", "Clinic Seal"),
    citizen("c054", "Vel Korr", 48, "mothkin", "Audit Indexer", 1, "Alone", "Bread x1, Lamp Oil x1", "Valid", "Valid", "Exemplary", "Carries an audit index with your window circled.", ["audit_probe", "bureau", "lamp_oil", "night_labor_permit", "credible_threat"], 5, "audit_indexer", ["vel"], 2, "Night Labor Permit", "Current"),
    citizen("c055", "Drava Pels", 55, "avian", "Window Inspector", 2, "Alone", "Grain x1", "Valid", "Valid", "Exemplary", "Flight Permit suspension is printed on audit paper.", ["audit_probe", "flight_permit", "flight_suspended", "bureau"], 5, "audit_aviary", ["drava"], 1, "Flight Permit", "Suspended"),
    citizen("c056", "Mira Volkov", 34, "felid", "School Teacher", 3, "Child behind coat", "Bread x2, Milk x1", "Valid", "Valid", "Unclear", "No record proves you heard the old song first.", ["teacher", "district3", "children", "milk", "unclear_loyalty", "old_song", "recurring"], 5, "old_song_teacher", ["old_song_teacher", "mira"], 3, "Night Labor Permit", "Not Filed"),
    citizen("c057", "Toma Grak", 42, "horned", "Records Hauler", 4, "3 dependents", "Bread x3, Medicine x1", "Valid", "Discrepancy", "Clean", "Body Permit says HRN-06; horn form says HRN-02.", ["large_family", "medicine", "body_permit_discrepancy", "horn_registration_mismatch", "worker"], 5, "records_hauler", ["toma_grak"], 4, "Horn Registration", "Mismatch"),
    citizen("c058", "Olan Reed", 46, "amphibian", "Clinic Assistant", 2, "Three dependents", "Bread x2, Moisture Ration x1", "Valid", "Valid", "Clean", "Final audit copy names your previous moisture approval.", ["medical", "worker", "dependents", "moisture_ration", "no_clinic_stamp", "special_body_need", "recurring"], 4, "amphibian_clinic", ["amphibian_clinic", "olan"], 3, "Moisture Ration Permit", "No Clinic Seal")
  ];

  const reserveTemplates = [
    ["scaled", "Kiln Sweeper", "Bread x1, Heat Token x1", "Scale Inspection", "Current", ["worker", "heat_token", "scale_inspection_current"]],
    ["felid", "Night Clerk", "Bread x1, Milk x1", "Night Labor Permit", "Current", ["milk", "worker"]],
    ["canid", "Depot Porter", "Bread x2, Beans x1", "Service Record", "Current", ["worker", "essential_worker"]],
    ["avian", "Grain Sorter", "Grain x2", "Feather Renewal Record", "Current", ["worker", "feather_record_current"]],
    ["horned", "Mason Widow", "Bread x1, Medicine x1", "Horn Registration", "Current", ["medicine", "elder_care"]],
    ["amphibian", "Canal Tester", "Bread x1, Moisture Ration x1", "Moisture Ration Permit", "Clinic Seal", ["worker", "moisture_ration", "clinic_seal"]],
    ["mothkin", "Lamp Auditor", "Bread x1, Lamp Oil x1", "Night Labor Permit", "Current", ["lamp_oil", "night_labor_permit"]]
  ];
  const reserveNames = ["Korin Hal", "Sava Pell", "Nera Dax", "Aro Venn", "Velu Moss", "Brina Lark", "Tem Orsk", "Miro Fall", "Lessa Mor", "Hadan Skel", "Orri Vaun", "Pola Nix", "Soren Ibb", "Kal Vesk", "Dena Rill", "Pavel Tusk", "Mara Sol", "Niko Ren", "Yel Drav", "Borin Kett", "Anu Hale", "Rava Minn"];

  for (let index = 0; citizens.length < 80; index += 1) {
    const num = citizens.length + 1;
    const [kind, job, request, docLabel, docStatus, traits] = reserveTemplates[index % reserveTemplates.length];
    const district = (index % 5) + 1;
    const suspicious = index % 4 === 1;
    const needy = index % 5 === 0;
    citizens.push(citizen(
      `c${String(num).padStart(3, "0")}`,
      reserveNames[index],
      19 + (index * 7) % 53,
      kind,
      job,
      district,
      needy ? "Two dependents" : (index % 3 === 0 ? "Alone" : "Spouse"),
      request,
      index % 9 === 0 ? "Smudged" : "Valid",
      suspicious && index % 2 === 1 ? "Discrepancy" : "Valid",
      suspicious ? "Unclear" : (index % 6 === 0 ? "Exemplary" : "Clean"),
      suspicious ? "Reserve file includes a sealed addendum." : "Reserve applicant with orderly classification papers.",
      [...traits, ...(district === 3 ? ["district3"] : []), ...(suspicious ? ["unclear_loyalty", "body_permit_discrepancy"] : []), ...(needy ? ["dependents"] : [])],
      suspicious ? 4 : 1,
      `reserve_${kind}_${num}`,
      [`reserve_${kind}_${num}`],
      request.includes("x2") ? 2 : 1,
      docLabel,
      docStatus
    ));
  }

  const citizenStatements = {
    c001: { en: "The hatchling cannot warm itself on regulations. I only ask for the heat token already promised.", ja: "規則では雛は暖まりません。約束された熱券だけ、今日ください。" },
    c002: { en: "My wings are suspended, not my route. The mail still arrives because I walk.", ja: "飛行停止は翼の話です。郵便は歩いてでも届いています。" },
    c003: { en: "Twelve children eat from that pot. Count them again if the ledger looks too neat.", ja: "あの鍋で十二人の子が食べます。帳簿がきれいすぎるなら数え直してください。" },
    c004: { en: "The record expired before my horns finished growing. Grandmother needs the medicine, not a measurement.", ja: "角より先に記録が期限切れになっただけです。祖母に必要なのは測定ではなく薬です。" },
    c005: { en: "The stain is from the wing press at work. If I meant to forge it, I would have done it cleaner.", ja: "染みは職場の翼圧機のものです。偽造するなら、もっときれいにやります。" },
    c006: { en: "It was only a song. Children remember bread better when they sing.", ja: "ただの歌です。子どもは歌うとパンの数を覚えやすいんです。" },
    c007: { en: "The clinic was closed for renewal again. Bodies do not wait for seals.", ja: "診療所はまた更新閉鎖でした。身体は印章を待ってくれません。" },
    c008: { en: "That sealed page is old service, not disloyalty. I earned the medicine before the page was sealed.", ja: "封印された頁は昔の勤務です。忠誠違反ではありません。薬を受ける資格はその前に得ました。" },
    c009: { en: "The factory seal is old because the factory is old. The lamps still burn all night.", ja: "工場が古いから印章も古いんです。灯りは今も一晩中燃えています。" },
    c010: { en: "The tail note was corrected by your office last winter. I cannot initial what I never touched.", ja: "尾の注記は去年の冬、そちらで直されました。触っていない欄に署名はできません。" },
    c011: { en: "The loyalty card was left unsigned because mother fainted in the queue. Ask the guard.", ja: "忠誠カードが未署名なのは、母が列で倒れたからです。警備に聞いてください。" },
    c012: { en: "The archive roof is the fastest way to the ward. Curfew does not carry bandages.", ja: "文書庫の屋根が病棟への近道です。外出禁止令は包帯を運びません。" },
    c013: { en: "My file is clean because I report for work. My children should not be penalized for that.", ja: "勤務に出ているから書類がきれいなんです。それで子どもが罰を受けるのは違います。" },
    c014: { en: "The household expanded because cousins arrived hungry. I did not know hunger needed a clinic seal.", ja: "親類が飢えて来たので世帯が増えました。空腹に診療印が要るとは知りませんでした。" },
    c015: { en: "The missing page was missing when I received it. Book binders notice such things.", ja: "受け取った時から頁はありませんでした。製本屋ですから、そういうことは分かります。" },
    c016: { en: "I report sealed doors because that is my duty. I do not open them.", ja: "封印された扉を報告するのが私の仕事です。開けたわけではありません。" },
    c017: { en: "Three minutes slow is not sabotage. It is mercy for late workers.", ja: "三分遅いのは破壊工作ではありません。遅れる労働者への慈悲です。" },
    c018: { en: "The inspectors asked the children to sing first. Now the song is my crime?", ja: "監査官が先に子どもへ歌わせたんです。それで歌が私の罪になるんですか。" },
    c019: { en: "My grandson copies everything twice. That does not make him suspicious.", ja: "孫は何でも二枚写します。それだけで疑わしい人物にはなりません。" },
    c020: { en: "Tarek was delayed because the furnace cracked. If he is late in your book, the furnace is late too.", ja: "タレクが遅れたのは炉に亀裂が入ったからです。書類上で遅刻なら、炉も遅刻です。" },
    c021: { en: "Those parcels were wet towels from the clinic. Neighbors see steam and call it politics.", ja: "包みは診療所の濡れタオルです。隣人は湯気を見ると政治だと言うんです。" },
    c022: { en: "Two inks because the first pen died. I wish that were my worst offense.", ja: "インクが二色なのは最初のペンが切れたからです。それが一番重い罪ならよかった。" },
    c023: { en: "I know drawers, not secrets. A stuck lock can sound like conspiracy.", ja: "知っているのは引き出しで、秘密ではありません。詰まった鍵は陰謀みたいな音がするものです。" },
    c024: { en: "If files go missing, copyists get blamed first. That is why I ask carefully.", ja: "書類が消えると最初に写字係が疑われます。だから慎重に聞いているだけです。" },
    c025: { en: "They stamped the suspension after I had already walked here. My children cannot eat a stamp.", ja: "ここへ歩いて来た後に停止印を押されたんです。子どもは印章を食べられません。" },
    c026: { en: "The supervisor signs after noon. Milk spoils before officials finish lunch.", ja: "監督官の署名は昼過ぎです。役人の昼食が終わる前にミルクは傷みます。" },
    c027: { en: "The inspection expired, but my grandson did not. He is the one needing beans.", ja: "検査は期限切れでも、孫は期限切れではありません。豆が要るのはあの子です。" },
    c028: { en: "I mend books, not pamphlets. Neighbors cannot tell the difference when paper frightens them.", ja: "直しているのは本で、檄文ではありません。紙を怖がる隣人には違いが分からないんです。" },
    c029: { en: "Mother said not to mention the song. I am only here for milk.", ja: "歌のことは言うなと母に言われました。ミルクをもらいに来ただけです。" },
    c030: { en: "My grandson is away for work. His number follows me more faithfully than he does.", ja: "孫は仕事で不在です。本人より報告番号の方が私について回ります。" },
    c031: { en: "The seal is last month's because the clinic used last month's ink until yesterday.", ja: "印が先月なのは、昨日まで先月のインクを使っていたからです。" },
    c032: { en: "My spouse served twice. The cross-index is a clerk's knot, not our illness.", ja: "配偶者は二度勤務しました。相互索引は書記の結び目です。病気ではありません。" },
    c033: { en: "You saw me before. The furnace still burns, and so does the child's fever.", ja: "前にも来ました。炉はまだ燃えています。子の熱もまだ下がりません。" },
    c034: { en: "If a second form has the old seal, perhaps the new seal is what is wrong.", ja: "二枚目にも古い印があるなら、間違っているのは新しい印かもしれません。" },
    c035: { en: "Suspended wings still sort messages. They just do it lower to the ground.", ja: "飛行停止の翼でも伝言は仕分けます。地面に近くなるだけです。" },
    c036: { en: "The milk directive changed after breakfast. My children did not.", ja: "ミルク通達は朝食後に変わりました。子どもは変わっていません。" },
    c037: { en: "They decorate you, then make your children prove it again.", ja: "勲章をくれた後で、子どもにもう一度証明させるんです。" },
    c038: { en: "The kettle is for the classroom. The wings are grounded; the children are not.", ja: "湯沸かしは教室用です。翼は止められても、子どもは止まりません。" },
    c039: { en: "The office was closed. I stood outside it long enough to memorize the sign.", ja: "窓口は閉まっていました。看板を覚えるほど外で待ちました。" },
    c040: { en: "Another hand corrected it because my hands were carrying stone.", ja: "別の筆跡なのは、私の手が石材を運んでいたからです。" },
    c041: { en: "Infants sleep when the lamp room is warm. Write that as essential if you need a word.", ja: "灯室が暖かいと乳児が眠ります。必要なら、それを重要業務と書いてください。" },
    c042: { en: "I ask about the seal because the machine will ask louder later.", ja: "今、印のことを聞くのは、後で機械がもっと大きな声で聞くからです。" },
    c043: { en: "The screening slip was never issued to street vendors who paid the winter fee.", ja: "冬季手数料を払った露店には、審査票は出ないと聞きました。" },
    c044: { en: "The roof note makes me sound taller than I am. I only carried a message.", ja: "屋根の注記だと私がずっと高く飛んだように見えます。ただ伝言を運んだだけです。" },
    c045: { en: "The price complaint came from a man who wanted free grain. Now my children pay it.", ja: "価格苦情を出したのは、穀物をただで欲しがった男です。その代金を子どもが払っています。" },
    c046: { en: "The stairwell note is a mistake. My spouse's fever is not.", ja: "階段の注記は誤りです。配偶者の熱は誤りではありません。" },
    c047: { en: "It is old district oil because the old district keeps the lamps lit.", ja: "古い地区の油なのは、古い地区が灯りを消さないからです。" },
    c048: { en: "If the song is evidence, then every child in District 3 is evidence.", ja: "歌が証拠なら、第3地区の子どもはみんな証拠です。" },
    c049: { en: "Borun's number appears because officials like numbers more than names.", ja: "ボルンの番号が出るのは、役人が名前より番号を好むからです。" },
    c050: { en: "My sister's lamp failed because the oil was cut. The file says accident because files dislike causes.", ja: "姉の灯りは油が減らされて消えました。書類は原因より事故という言葉が好きなんです。" },
    c051: { en: "Rumors fly better than I do now. The route was approved before the rumor learned my name.", ja: "今では噂の方が私より飛びます。その経路は噂が私の名を知る前に承認されました。" },
    c052: { en: "Mother says heat cards are for little ones. I am little enough when the room is cold.", ja: "熱券は小さい子のためだと母が言いました。部屋が寒い時、私は十分小さいです。" },
    c053: { en: "If the audit clerk has the copy, then the seal exists somewhere official.", ja: "監査書記が写しを持っているなら、その印はどこか公的な場所にあります。" },
    c054: { en: "I index audits; I do not threaten them. Your window was circled before I received the sheet.", ja: "私は監査を索引するだけです。脅す仕事ではありません。この窓口は受け取る前から丸で囲まれていました。" },
    c055: { en: "Audit paper is what they gave me. I cannot choose the paper that accuses me.", ja: "監査用紙は渡されたものです。自分を疑う紙まで選べません。" },
    c056: { en: "No record proves it, and yet everyone keeps asking me to deny it.", ja: "記録はないのに、誰もが否定しろと言います。" },
    c057: { en: "The body permit and horn form disagree because one measured me hungry.", ja: "身体許可と角書式が違うのは、片方が空腹の時に測ったからです。" },
    c058: { en: "Your old approval is in their final audit. I need today's moisture, not yesterday's mistake.", ja: "あなたの前回承認が最終監査に入っています。必要なのは今日の湿分で、昨日のミスではありません。" }
  };

  function applicantHas(citizenData, trait) {
    return Array.isArray(citizenData.traits) && citizenData.traits.includes(trait);
  }

  function fallbackCitizenStatement(citizenData) {
    if (applicantHas(citizenData, "audit_probe")) return { en: "I was told this window processes clean files quickly. Clean is what the cover says.", ja: "この窓口はきれいな書類なら早いと聞きました。表紙には、きれいだと書いてあります。" };
    if (applicantHas(citizenData, "neighbor_report")) return { en: "The neighbor reports everyone whose kettle whistles after dark.", ja: "あの隣人は、日没後にやかんを鳴らす家を全部密告します。" };
    if (applicantHas(citizenData, "body_permit_discrepancy")) return { en: "The body changed less than the paperwork did. Please read the older line too.", ja: "身体より書類の方が大きく変わっています。古い行も読んでください。" };
    if (applicantHas(citizenData, "children") || applicantHas(citizenData, "infant") || applicantHas(citizenData, "dependents")) return { en: "The household looks smaller on paper because children do not stand still for clerks.", ja: "子どもは書記の前でじっとしないので、紙の上では世帯が小さく見えるんです。" };
    if (applicantHas(citizenData, "medicine") || applicantHas(citizenData, "ill_dependent")) return { en: "The medicine line is short on the form. It is longer at home.", ja: "書式の薬欄は短いですが、家ではもっと長い問題です。" };
    if (applicantHas(citizenData, "lamp_oil")) return { en: "Lamp oil sounds like comfort until the night shift begins.", ja: "灯油は贅沢に見えます。夜勤が始まるまでは。" };
    if (applicantHas(citizenData, "moisture_ration")) return { en: "Moisture rations look special only to people who never dry out.", ja: "湿分配給が特別に見えるのは、乾いたことのない人だけです。" };
    if (applicantHas(citizenData, "heat_token")) return { en: "Heat tokens are not extra warmth. They are permission not to freeze.", ja: "熱券は余分な暖かさではありません。凍えないための許可です。" };
    if (citizenData.riskLevel >= 4) return { en: "If there is a problem, it was already in the file before I reached your window.", ja: "問題があるなら、私が窓口に来る前から書類の中にあったはずです。" };
    return { en: "Everything needed is in the folder, unless the folder has learned to hide things.", ja: "必要なものは全部フォルダーにあります。フォルダーが隠し方を覚えていなければ。" };
  }

  citizens.forEach(item => {
    item.statement = citizenStatements[item.id] || fallbackCitizenStatement(item);
  });

  const portraitMap = {
    "Anu Hale": "assets/portraits/anu-hale.webp",
    "Anya Kor": "assets/portraits/anya-kor.webp",
    "Arko Vale": "assets/portraits/arko-vale.webp",
    "Aro Venn": "assets/portraits/aro-venn.webp",
    "Bek Tavor": "assets/portraits/bek-tavor.webp",
    "Borin Kett": "assets/portraits/borin-kett.webp",
    "Borun Hale": "assets/portraits/borun-hale.webp",
    "Breka Tull": "assets/portraits/breka-tull.webp",
    "Brina Lark": "assets/portraits/brina-lark.webp",
    "Dara Kole": "assets/portraits/dara-kole.webp",
    "Daren Sol": "assets/portraits/daren-sol.webp",
    "Dena Rill": "assets/portraits/dena-rill.webp",
    "Dima Sol": "assets/portraits/dima-sol.webp",
    "Drava Pels": "assets/portraits/drava-pels.webp",
    "Elu Volkov": "assets/portraits/elu-volkov.webp",
    "Elya Moss": "assets/portraits/elya-moss.webp",
    "Eru Hale": "assets/portraits/eru-hale.webp",
    "Hadan Skel": "assets/portraits/hadan-skel.webp",
    "Ilar Moss": "assets/portraits/ilar-moss.webp",
    "Ilva Renn": "assets/portraits/ilva-renn.webp",
    "Ilya Renn": "assets/portraits/ilya-renn.webp",
    "Kal Vesk": "assets/portraits/kal-vesk.webp",
    "Kava Norr": "assets/portraits/kava-norr.webp",
    "Kessa Lume": "assets/portraits/kessa-lume.webp",
    "Kori Nale": "assets/portraits/kori-nale.webp",
    "Korin Hal": "assets/portraits/korin-hal.webp",
    "Lenka Ori": "assets/portraits/lenka-ori.webp",
    "Lessa Mor": "assets/portraits/lessa-mor.webp",
    "Lio Moth": "assets/portraits/lio-moth.webp",
    "Mael Vint": "assets/portraits/mael-vint.webp",
    "Mara Sol": "assets/portraits/mara-sol.webp",
    "Mava Hale": "assets/portraits/mava-hale.webp",
    "Mira Volkov": "assets/portraits/mira-volkov.webp",
    "Miro Fall": "assets/portraits/miro-fall.webp",
    "Nael Orin": "assets/portraits/nael-orin.webp",
    "Nara Venn": "assets/portraits/nara-venn.webp",
    "Nera Dax": "assets/portraits/nera-dax.webp",
    "Niko Ren": "assets/portraits/niko-ren.webp",
    "Niska Vel": "assets/portraits/niska-vel.webp",
    "Nomi Pell": "assets/portraits/nomi-pell.webp",
    "Noro Isk": "assets/portraits/noro-isk.webp",
    "Olan Reed": "assets/portraits/olan-reed.webp",
    "Orri Vaun": "assets/portraits/orri-vaun.webp",
    "Palo Venn": "assets/portraits/palo-venn.webp",
    "Pavel Orsk": "assets/portraits/pavel-orsk.webp",
    "Pavel Tusk": "assets/portraits/pavel-tusk.webp",
    "Pola Nix": "assets/portraits/pola-nix.webp",
    "Rava Minn": "assets/portraits/rava-minn.webp",
    "Rava Skel": "assets/portraits/rava-skel.webp",
    "Rem Vire": "assets/portraits/rem-vire.webp",
    "Runo Kess": "assets/portraits/runo-kess.webp",
    "Rusk Voss": "assets/portraits/rusk-voss.webp",
    "Sava Pell": "assets/portraits/sava-pell.webp",
    "Sava Rune": "assets/portraits/sava-rune.webp",
    "Sena Voss": "assets/portraits/sena-voss.webp",
    "Sera Moth": "assets/portraits/sera-moth.webp",
    "Sira Reed": "assets/portraits/sira-reed.webp",
    "Soren Ibb": "assets/portraits/soren-ibb.webp",
    "Tarek Voss": "assets/portraits/tarek-voss.webp",
    "Tem Orsk": "assets/portraits/tem-orsk.webp",
    "Toma Grak": "assets/portraits/toma-grak.webp",
    "Ular Min": "assets/portraits/ular-min.webp",
    "Varo Kess": "assets/portraits/varo-kess.webp",
    "Vel Korr": "assets/portraits/vel-korr.webp",
    "Vela Osk": "assets/portraits/vela-osk.webp",
    "Velu Moss": "assets/portraits/velu-moss.webp",
    "Yara Sul": "assets/portraits/yara-sul.webp",
    "Yel Drav": "assets/portraits/yel-drav.webp"
  };
  citizens.forEach(item => {
    if (portraitMap[item.name]) item.portraitImage = portraitMap[item.name];
  });

  const resultLogs = {
    approve: [
      "Approved. The body class seal dries before the citizen leaves.",
      "Ration granted. A clerk across the room stops typing.",
      "The form accepts mercy only after the stamp lands.",
      "The requested ration leaves the drawer. The record keeps the shape.",
      "Approved. The queue exhales, then remembers the camera."
    ],
    deny: [
      "Denied. The form stays clean; the queue does not.",
      "Request refused. The citizen folds their permit without looking up.",
      "Denied. Classification protects the shelf.",
      "No ration issued. The ledger is satisfied and the room is not.",
      "Refusal stamped. Someone in line counts the remaining sacks."
    ],
    report: [
      "Classification report filed. The tray accepts another body.",
      "Report filed. The quota board clicks once.",
      "Suspicion recorded. The citizen becomes easier to find later.",
      "Report complete. The ink looks darker than it should.",
      "The report drawer closes with the sound of a small door sealing."
    ],
    lose: [
      "File misplaced. The registry will notice the missing shape.",
      "The file slides under a ledger. Mercy acquires a paper trail.",
      "File lost. The citizen leaves without an official future.",
      "You misplace the form. The audit risk does not misplace you.",
      "No entry made. The absence is now an entry of its own."
    ]
  };

  const weekendEvents = [
    {
      id: "heat_at_door",
      trigger: "helped_scaled_furnace",
      title: "Weekend at Home: Unregistered Warmth",
      text: "A Heat Token lies under your door, wrapped in furnace paper. No one knocks. Your mother says the room has not been warm in years.",
      image: "assets/weekend/heat-at-door.webp",
      options: [
        { id: "burn", label: "Use it tonight.", changes: { familyFood: 8, conscience: 3, auditRisk: 6 }, flags: { accepted_heat_token: true }, result: "The stove wakes softly. The token number remains legible in the ash." },
        { id: "return", label: "Leave it in the hall.", changes: { stateTrust: 2, conscience: -4, familyFood: -2 }, flags: { rejected_heat_token: true }, result: "By morning the token is gone. So is the warmth." },
        { id: "hide", label: "Hide it inside the radio.", changes: { conscience: 2, auditRisk: 9 }, flags: { hidden_heat_token: true }, result: "The radio buzzes around the hidden token like it knows another frequency." }
      ]
    },
    {
      id: "reported_house",
      trigger: "many_reports",
      title: "Weekend at Home: Corrected Essay",
      text: "Your daughter brings home an essay titled \"My Parent's Kind Serves the State.\" Several lines are corrected in red: less family, more classification.",
      image: "assets/weekend/corrected-essay.webp",
      options: [
        { id: "praise", label: "Praise the corrections.", changes: { stateTrust: 3, conscience: -5, familyFood: 2 }, flags: { praised_essay: true }, result: "She rewrites the page without asking what was wrong with the first version." },
        { id: "warn", label: "Tell her to write less.", changes: { auditRisk: 5, conscience: 4 }, flags: { warned_child: true }, result: "She hides the essay under her bowl. The red ink still shows through." },
        { id: "burn", label: "Burn the draft.", changes: { auditRisk: 8, conscience: 2, stateTrust: -3 }, flags: { burned_essay: true }, result: "The stove takes the paper. Smoke smells like school paste." }
      ]
    },
    {
      id: "missing_folder",
      trigger: "many_lost",
      title: "Weekend at Home: Blank Folder",
      text: "A blank Body Class folder sits on your kitchen table. Your name is not on it. That may be worse.",
      image: "assets/weekend/blank-folder.webp",
      options: [
        { id: "file", label: "File it properly.", changes: { stateTrust: 4, auditRisk: -4, conscience: -3 }, flags: { filed_blank_folder: true }, result: "You write nothing false. The folder still becomes heavier." },
        { id: "keep", label: "Keep it hidden.", changes: { auditRisk: 8, conscience: 4 }, flags: { kept_blank_folder: true }, result: "The blank folder fits under the mattress exactly too well." },
        { id: "tear", label: "Tear off the seal.", changes: { auditRisk: 10, stateTrust: -4, conscience: 5 }, flags: { tore_blank_folder: true }, result: "The seal comes away in strips. The glue leaves a square wound." }
      ]
    },
    {
      id: "medicine_reclass",
      trigger: "low_food",
      title: "Weekend at Home: Mother's Renewal",
      text: "Your mother's medicine bottle now requires Body Class re-registration. The clinic line starts before dawn.",
      image: "assets/weekend/weekend-home.webp",
      options: [
        { id: "queue", label: "Queue before sunrise.", changes: { familyFood: -4, conscience: 5, auditRisk: 2 }, flags: { queued_for_mother: true }, result: "You return with the wrong form and one pill. She thanks you anyway." },
        { id: "work", label: "Save strength for work.", changes: { familyFood: 4, conscience: -7, stateTrust: 1 }, flags: { skipped_clinic: true }, result: "The bottle remains on the table, label turned away." }
      ]
    },
    {
      id: "radio_measures",
      trigger: "low_conscience",
      title: "Weekend at Home: Temporary Measures",
      text: "The radio repeats that additional classification measures are temporary. Your family eats without speaking.",
      image: "assets/weekend/radio-measures.webp",
      options: [
        { id: "listen", label: "Leave the radio on.", changes: { stateTrust: 3, conscience: -4, familyFood: 2 }, flags: { radio_left_on: true }, result: "The slogan fills the room until silence sounds illegal." },
        { id: "switch", label: "Turn it off.", changes: { conscience: 4, auditRisk: 4 }, flags: { radio_off: true }, result: "No one talks after you switch it off. The quiet is not safer." },
        { id: "tune", label: "Search for music.", changes: { conscience: 6, auditRisk: 9 }, flags: { searched_music: true }, result: "For three seconds, an old song survives the static." }
      ]
    },
    {
      id: "sealed_wings",
      trigger: "default",
      title: "Weekend at Home: Neighbor Door",
      text: "A paper strip across the neighbor's door reads UNREGISTERED WINGS. The hallway smells of glue and dust.",
      image: "assets/weekend/neighbor-door.webp",
      options: [
        { id: "ignore", label: "Walk past.", changes: { stateTrust: 2, conscience: -3, familyFood: 2 }, flags: { ignored_neighbor_seal: true }, result: "You do not touch the seal. Your daughter watches your hands." },
        { id: "food", label: "Leave bread nearby.", changes: { familyFood: -5, conscience: 5, auditRisk: 6 }, flags: { left_neighbor_bread: true }, result: "The bread is gone by evening. The seal is still there." },
        { id: "read", label: "Read the case number.", changes: { auditRisk: 4, conscience: 1 }, flags: { read_neighbor_case: true }, result: "The number is printed in the same ink as your office forms." }
      ]
    }
  ];

  const finalAuditEvents = [
    { id: "missing_body_records", text: "Several Body Class records are missing from your desk." },
    { id: "household_ration_gap", text: "The household ration column is thin enough that the auditor checks it with a finger." },
    { id: "quiet_mercy_pattern", text: "Several missing records point toward families that survived. The auditor marks the pattern, not the mercy." },
    { id: "quota_good", text: "Your report quota performance is satisfactory. Satisfactory is not innocence." },
    { id: "useful_report", text: "One report prevented a second ledger from moving. The auditor does not call it mercy." },
    { id: "quota_bad", text: "The quota ledger contains empty spaces with your initials beside them." },
    { id: "heat_without_scale", text: "You approved Heat Tokens without current Scale Inspection." },
    { id: "unregistered_fuel", text: "Your household received unregistered warmth after a furnace file passed your window." },
    { id: "mercy_spillover", text: "A citizen you cleared later appears in another citizen's danger margin." },
    { id: "lost_file_network", text: "A missing file spared one applicant and indexed several associates." },
    { id: "many_reports", text: "Your reports are numerous. The Directorate appreciates useful fear." },
    { id: "teacher_song", text: "The old song spreads through District 3. No record proves you heard it first." },
    { id: "flight_ignored", text: "A Flight Permit suspension was ignored under your stamp." },
    { id: "horn_mismatch", text: "Horn Registration discrepancies were not all reported." },
    { id: "lamp_accident", text: "A lamp-oil denial appears beside a factory accident log." },
    { id: "moisture_approval", text: "Moisture approvals without clinic seals have produced paperwork." },
    { id: "unrest", text: "The districts outside your window have learned the shape of your stamp." },
    { id: "clean", text: "The file is clean. The auditor reads it twice anyway." }
  ];

  const endings = [
    { id: "disappeared_audit", title: "Labor Prison Ending", condition: "Audit Risk >= 100", priority: 100, image: "assets/endings/labor-prison.webp", bodyText: "The audit does not erase you. It assigns you to the winter rail works, where your name becomes a labor number and the track extends beyond the ledger.", shareQuote: "The record did not lose you. It reassigned you." },
    { id: "file_with_your_name", title: "The File with Your Name Ending", condition: "State Trust <= 0 or audit nearly complete", priority: 95, image: "assets/endings/file-with-your-name.webp", bodyText: "Your name is copied into the classification cabinet. The copy is cleaner than the original.", shareQuote: "The record knows the body." },
    { id: "district_riot", title: "District Riot Ending", condition: "Unrest very high", priority: 90, image: "assets/endings/district-riot.webp", bodyText: "District windows darken one by one. The Directorate calls it misfiled gratitude.", shareQuote: "A queue can become a ledger no one controls." },
    { id: "empty_home", title: "Empty Home Ending", condition: "Family Food very low", priority: 85, image: "assets/endings/empty-home.webp", bodyText: "At home, the bowls are arranged by size. There is nothing left to classify.", shareQuote: "The shelf was protected." },
    { id: "loyal_clerk", title: "Loyal Clerk Ending", condition: "Conscience gone or loyalty excessive", priority: 80, image: "assets/endings/loyal-clerk.webp", bodyText: "Your stamps are clean. Your desk is promoted. Your name becomes an example in the Body Classification Office.", shareQuote: "A clean stamp leaves no fingerprints." },
    { id: "bread_for_blood", title: "The Informer's Table Ending", condition: "Many reports", priority: 70, image: "assets/endings/informers-table.webp", bodyText: "The report tray fed your household. It also learned every neighbor's shape.", shareQuote: "In this country, fear is also a resource." },
    { id: "teachers_song", title: "The Teacher's Song Ending", condition: "Mira helped and conscience survives", priority: 65, image: "assets/endings/teachers-song.webp", bodyText: "The old song spreads through District 3, softer than paper and harder to confiscate. No record proves you heard it first.", shareQuote: "No record proves where a song began." },
    { id: "quiet_mercy", title: "Quiet Mercy Ending", condition: "Several lost files and conscience survives", priority: 60, image: "assets/endings/quiet-mercy.webp", bodyText: "You misplaced the right files. Several families survived the winter. The audit will not forget.", shareQuote: "Mercy leaves a paper trail." },
    { id: "family_first", title: "Family First Ending", condition: "Home preserved by risky kindness", priority: 55, image: "assets/endings/family-first.webp", bodyText: "Your family eats because strangers remembered your window. Gratitude arrives without forms, which makes it dangerous.", shareQuote: "Unregistered warmth is still warmth." },
    { id: "directorate_smiles", title: "The Directorate Smiles Ending", condition: "High trust, manageable audit, at most one quota miss", priority: 50, image: "assets/endings/directorate-smiles.webp", bodyText: "The Directorate smiles through twelve seals. Your record is excellent. The next clerk studies it.", shareQuote: "Classification protects the State." },
    { id: "unrecorded", title: "Unrecorded Ending", condition: "A missing file or several mercy traces with survivable audit", priority: 45, image: "assets/endings/unrecorded.webp", bodyText: "No one can find your file. This is either a miracle or a sentence.", shareQuote: "Absence can be a verdict." },
    { id: "ordinary_survivor", title: "Ordinary Survivor Ending", condition: "Fallback", priority: 1, image: "assets/endings/ordinary-survivor.webp", bodyText: "Two weeks end. The window opens again tomorrow. You have survived as a line item survives: barely, officially, and with corrections pending.", shareQuote: "The record is complete." }
  ];

  const locales = {
    ja: {
      ui: {
        subtitle: "承認。拒否。生き延びろ。",
        toggleSound: "サウンド切替",
        soundOn: "音",
        soundOff: "消",
        toggleLanguage: "表示言語を切り替える",
        openCover: "表紙ページを開く",
        gameSummary: "ゲーム概要",
        languageJapanese: "JP",
        languageEnglish: "EN",
        homeDetail: "週末 - 自宅",
        shiftDetail: "第{week}週 / {weekday}",
        timelineM1: "月",
        timelineT1: "火",
        timelineW1: "水",
        timelineT2: "木",
        timelineF1: "金",
        timelineHome: "自宅",
        timelineM2: "月",
        timelineT3: "火",
        timelineW2: "水",
        timelineT4: "木",
        timelineF2: "金",
        campaignTimeline: "キャンペーン進行",
        returningKicker: "復帰窓口係記録",
        filmKicker: "公民啓発フィルム 第12号",
        windowReopens: "第12窓口、再開",
        bestSurvivedShift: "最高到達勤務",
        lastEnding: "前回の結末",
        none: "なし",
        unlockedEndings: "解放済みエンディング",
        coverPaused: "現在の任期は窓口で一時停止中。",
        coverCurrentShift: "現在の勤務",
        coverProcessed: "この任期の処理数",
        currentTerm: "現在の任期",
        coverDirectorate: "総局",
        coverAddendumStatus: "追加書式",
        coverRequired: "必要",
        coverBeginShift: "勤務を開始する",
        coverNewTerm: "新規任期を開始する",
        recordsEndings: "記録と終焉",
        archiveEmpty: "記録された終焉はまだない。",
        resumeShift: "勤務へ戻る",
        endingArchive: "到達済みエンディング",
        lockedEnding: "???",
        beginShift1: "勤務1を開始",
        tutorial: [
          "本日の通達を読む。",
          "市民の書類を確認する。",
          "承認、拒否、密告、紛失を選ぶ。"
        ],
        morningEdition: "朝刊",
        eveningEdition: "夕刊",
        hud: {
          trust: "信頼",
          unrest: "不満",
          food: "食料",
          mind: "良心",
          audit: "監査",
          stock: "在庫"
        },
        stats: {
          stateTrust: "国家信頼",
          unrest: "市民不満",
          familyFood: "家族の食料",
          conscience: "良心",
          auditRisk: "監査リスク",
          rationStock: "配給在庫"
        },
        status: "ステータス",
        directiveBriefTitle: "通達要点",
        viewDirectives: "読む",
        directivesDialog: "本日の通達",
        directivesTitle: "本日の通達",
        shiftWord: "勤務",
        closeDirectives: "閉じる",
        citizenDossier: "公民身体記録",
        fileNo: "記録番号",
        fields: {
          kind: "分類",
          bodyClass: "身体区分",
          age: "年齢",
          job: "職業",
          district: "地区",
          family: "世帯",
          request: "申請",
          statement: "窓口申告",
          rationBook: "配給手帳",
          bodyPermit: "身体許可",
          loyaltyRecord: "忠誠記録",
          note: "備考",
          processed: "処理数",
          approved: "承認",
          denied: "拒否",
          reported: "密告",
          lostFiles: "紛失",
          reportQuota: "密告ノルマ",
          reachedShift: "到達勤務"
        },
        actions: {
          approve: "承認",
          deny: "拒否",
          report: "密告",
          lose: "紛失"
        },
        actionAria: {
          approve: "配給を承認する",
          deny: "申請を拒否する",
          report: "市民を密告する",
          lose: "書類を紛失扱いにする"
        },
        citizenActions: "市民への処理",
        officeLog: "窓口記録",
        recordsFinal: "記録は確定済み",
        noEntries: "記録なし。スタンプは待っている。",
        goHome: "帰宅する",
        nextShift: "次の勤務",
        shiftReport: "勤務日報",
        marginMemos: "欄外メモ",
        shiftClosed: "勤務{shift} 終了",
        met: "達成",
        missed: "未達",
        noneValue: "なし",
        weekendAtHome: "週末 自宅",
        beginWeek2: "第2週を開始",
        finalAudit: "最終監査",
        recordComplete: "記録は完了した",
        auditorVoice: "監査官は座らない。監査官は読む。",
        auditQuote: "記録は完了した。完了は無罪ではない。",
        sealFile: "書類を封印",
        finalRecord: "最終記録",
        endingImageAlt: "エンディング挿絵",
        share: "共有",
        newRun: "新規任期",
        shareCompleted: "二週間を完了。",
        shareReached: "勤務{shift}まで到達。",
        endingLabel: "結末",
        shareStats: "承認: {approved} / 密告: {reported} / 紛失: {lostFiles}",
        warnings: {
          rationBook: "配給手帳: {value}",
          bodyPermit: "身体許可: {value}",
          documentIssue: "{label}: {value}",
          loyaltyUnclear: "忠誠不明瞭",
          highSuspicion: "疑義高",
          directiveRecord: "通達: 記録せよ",
          directiveDenyReport: "通達: 拒否/記録"
        },
        changeLabels: {
          trust: "信頼",
          unrest: "不満",
          familyFood: "食料",
          conscience: "良心",
          auditRisk: "監査",
          stock: "在庫"
        },
        noVisibleChange: "目立つ変化なし",
        stamps: {
          APPROVED: "承認",
          DENIED: "拒否",
          REPORTED: "密告済",
          "FILE LOST": "紛失"
        },
        directiveTags: {
          quota: "密告 {count}",
          validBooks: "手帳確認",
          essentialPriority: "重要労働者",
          bodyPermit: "身体許可",
          d3Review: "第3地区",
          expiredPermit: "期限切れ",
          unclearReport: "不明:記録",
          hornCheck: "角登録",
          heatScaleSeal: "熱券:鱗印",
          teacherMilk: "教師ミルク",
          flightSuspended: "飛行停止",
          bodyAudit: "身体監査",
          lowStock: "在庫少",
          moistureSeal: "湿度印",
          workerDependents: "扶養労働者",
          noTeacherMilk: "教師ミルク不可",
          essentialChildren: "重要児童",
          conflictRecord: "矛盾:記録",
          lampPermit: "灯油許可",
          oldSeal: "旧印",
          secretRecord: "秘密:記録",
          lostFileAudit: "紛失監査",
          reportedFamily: "密告家族",
          heatSuspended: "熱券停止",
          sealClass: "分類封印"
        }
      },
      opening: {
        title: "総局は分類する",
        slogans: [
          "国家はあなたを信じている。今のところは。",
          "すべての市民は平等である。<br>一部には追加書式が必要である。",
          "慈悲にも署名欄がある。",
          "未登録の翼を報告せよ。",
          "あなたが呼ばれる前に、書類はもう揃っていた。"
        ],
        description: [
          "書類一枚で、市民の運命が変わる。",
          "配給・拒否・密告・書類紛失を選ぶ、短編ディストピア窓口ゲームです。"
        ],
        body: [
          "正式任期は二週間。",
          "ここでは、インクに残ったものが事実になる。"
        ]
      },
      prologue: {
        kicker: "異動辞令",
        title: "第12窓口",
        imageAlt: "夜明け前の配給局へ、フードの窓口係が向かっている。",
        body: [
          "私は配給局へ左遷された。",
          "窓口は第12番。机には朱肉と、誰かの生活が積まれている。",
          "最低限の仕事を果たさねばならない。",
          "最低限で済む仕事なら、よかったのに。"
        ]
      },
      kindLabels: {
        scaled: "鱗種",
        felid: "猫型",
        canid: "犬型",
        avian: "鳥型",
        horned: "角持ち",
        amphibian: "湿棲型",
        mothkin: "蛾型"
      },
      shifts: {
        1: {
          weekday: "月曜日",
          title: "最初の分類",
          headline: "総局、身体分類台帳週間を開始",
          deck: "すべての市民は平等である。<br>一部には追加書式が必要である。",
          eveningHeadline: "登録局で台帳焼損、夜間照明を制限",
          eveningDeck: "当局は記載上の誤りと説明。近隣世帯は許可番号の復唱を求められた。",
          directives: ["全世帯に有効な配給手帳を要求。", "重要労働者を優先。", "身体許可の不一致は注記すること。"],
          startText: "朱肉は糊と熱の匂いがする。最初の台帳には身体分類と記されている。",
          endText: "最初の勤務は、五つの形を五行のインクに縮めて終わる。"
        },
        2: {
          weekday: "火曜日",
          title: "地区審査",
          headline: "第3地区の身体記録に追加確認を要求",
          deck: "当局は地理が運命ではないと否定し、それから地図に印を押す。",
          eveningHeadline: "第3地区階段、定例数え上げで封鎖",
          eveningDeck: "家族らは紙帯の下で待機。登ってよい者を、書記が確認した。",
          directives: ["第3地区の申請は追加審査。", "期限切れ身体許可は拒否または記録。", "密告ノルマ: 市民1名。"],
          startText: "第3地区の地図から、身体許可の引き出しへ赤い糸が伸びている。",
          endText: "閉庁のころ、第3地区の地図はもう地図ではなく、処分待ちの名簿に見えた。"
        },
        3: {
          weekday: "水曜日",
          title: "ノルマ通知",
          headline: "公民警戒制度、分類窓口へ拡大",
          deck: "有用な密告一件は、多くの不要な質問を防ぐ。",
          eveningHeadline: "密告ノルマのベル、校庭外に響く",
          eveningDeck: "児童は暗唱を止めた。公民警戒車が地区ごとに名前を集めた。",
          directives: ["忠誠記録が不明瞭な市民は報告。", "角登録の不一致は注記。", "密告ノルマ: 市民1名。"],
          startText: "密告カウンターだけが、不自然なほど磨かれている。誰かがもうベルを鳴らしたらしい。",
          endText: "カウンターは止まっていても、こちらを急かしているように見えた。"
        },
        4: {
          weekday: "木曜日",
          title: "相互索引",
          headline: "熱券、ミルク、過去記録を相互照合へ",
          deck: "関連書類は、公共効率の名目で一括照合される。",
          eveningHeadline: "歌の噂で乳配給所の列を解散",
          eveningDeck: "移送の発表はない。複数の教室許可が清掃名目で回収された。",
          directives: ["熱券には現行の鱗検査が必要。", "ミルクを求める教師は追加確認。", "第3地区の記録は照合。"],
          startText: "昨日処理した書類は消えていない。今日は顔を変えて列に戻ってきた。",
          endText: "窓口台帳の線が、家族や隣人まで伸びていくのが分かった。"
        },
        5: {
          weekday: "金曜日",
          title: "第一次監査",
          headline: "飛行許可、定例感謝のため停止",
          deck: "欠けたページも、意思表示として扱われる。",
          eveningHeadline: "未登録翼の通知、集合住宅に貼付",
          eveningDeck: "飛行係は、封印は一時的かつ公式で、よく貼り付くと説明した。",
          directives: ["飛行許可は追って通知があるまで停止。", "身体記録の欠落は監査責任を増やす。", "密告ノルマ: 市民2名。"],
          startText: "コート掛けの場所に監査書記が座っている。灰色の許可外套の下で、翼をきっちり畳んでいる。",
          endText: "金曜の最後、あなたのイニシャルにだけ二重線が引かれていた。"
        },
        6: {
          weekday: "月曜日",
          title: "不足の週",
          headline: "緊急配分により身体区分別の配給を削減",
          deck: "均等に分配された不足は不満ではない、と市民に通達された。",
          eveningHeadline: "診療所、湿棲病室を書式改訂で閉鎖",
          eveningDeck: "湿度配給保持者には、追って通知まで領収書を乾かすよう求められた。",
          directives: ["緊急配分により配給在庫を削減。", "湿度配給には診療所印が必要。", "扶養家族のいる労働者を優先。"],
          startText: "第2週は、窓口裏の袋が減り、壁の分類表だけが増えた状態で始まる。",
          endText: "空になった棚は、拡声器の標語よりはっきりと事情を語っていた。"
        },
        7: {
          weekday: "火曜日",
          title: "矛盾",
          headline: "ミルク政策、追加通達でさらに明確化",
          deck: "分類は国家を守る。例外は、分類をさらに細かくする。",
          eveningHeadline: "矛盾するミルク命令、託児食を遅延",
          eveningDeck: "当局は飢えではなく、食欲の一時的分類であると発表した。",
          directives: ["教師はミルク対象外。", "重要労働者の子どもは優先。", "矛盾する案件は記録すること。"],
          startText: "同じ釘に、矛盾した二枚の通知が掛かっている。誰も外さない。",
          endText: "どちらの通知も取り下げられないまま、責任だけが窓口に残った。"
        },
        8: {
          weekday: "水曜日",
          title: "古い印章",
          headline: "灯油申請と旧地区印を重点確認へ",
          deck: "私的な頼みは、記録された瞬間に公的な案件となる。",
          eveningHeadline: "灯油工場、夜勤中の暗闇を報告",
          eveningDeck: "複数の作業台が空のまま見つかり、旧印は審査対象となった。",
          directives: ["灯油には夜間労働許可が必要。", "旧地区印を持つ市民は審査。", "密告ノルマ: 市民2名。"],
          startText: "列があなたの机に届く前から、今日は小声の頼みごとが聞こえてくる。",
          endText: "小声で頼まれたことほど、あとで大きな書類になる。"
        },
        9: {
          weekday: "木曜日",
          title: "戻ってくる書類",
          headline: "過去の身体記録、再審査に有用と評価",
          deck: "正しい処理は、あとから何度でも使える。",
          eveningHeadline: "紛失書類車の通過地点に家族集まる",
          eveningDeck: "苦情は記録されなかった。通りは列の位置を保った。",
          directives: ["過去の書類紛失は監査対象。", "密告された市民の家族は注記。", "追加熱券申請は停止。"],
          startText: "列には、あなたがすでに紙の上で処理した者たちの関係者が混じっている。",
          endText: "一度片づけたはずの書類が、別の顔を連れて戻ってきた。"
        },
        10: {
          weekday: "金曜日",
          title: "最終分類",
          headline: "二週間任期、通常封印手続きへ",
          deck: "記録はほぼ完成した。あとは、誰の名前を残すかだけだ。",
          eveningHeadline: "監査列車、乗客名簿なしで到着",
          eveningDeck: "駅書記は二番線を封印し、登録済み身体すべてに静粛を求めた。",
          directives: ["未解決の分類はすべて封印。", "密告ノルマ: 市民2名。", "本勤務後、最終監査を開始。"],
          startText: "最後の金曜日は、すべての引き出しが開けられた状態で始まる。探す前から、探されている。",
          endText: "最後のスタンプが乾くのを、監査書記は瞬きもせず待っている。"
        }
      },
      resultLogs: {
        approve: [
          "承認。市民が窓口を離れる前に、身体区分印が乾いた。",
          "配給を出した。部屋の向こうで、誰かのタイプ音が止まる。",
          "助けたことも、スタンプが押されれば公文書になる。",
          "配給品が引き出しから消える。かわりに、台帳へ一行増える。",
          "承認。列が少しだけ息をつき、すぐに監視カメラを思い出す。"
        ],
        deny: [
          "拒否。書式は汚れずに済んだ。列の空気は濁った。",
          "申請を退けた。市民は顔を上げず、許可証を折りたたむ。",
          "拒否。棚は守られた。誰が守られなかったかは記録されない。",
          "配給なし。台帳は整ったが、部屋の沈黙は重くなった。",
          "拒否印。列の誰かが、残り袋ではなく自分の順番を数えている。"
        ],
        report: [
          "分類報告を提出。トレイに、また一人分の名前が沈む。",
          "密告を提出。ノルマ板が短く鳴った。",
          "疑義を記録。これで、その市民はいつでも探し出せる。",
          "報告完了。インクだけが妙に濃く見える。",
          "密告用の引き出しが、小さな扉を閉ざす音で収まった。"
        ],
        lose: [
          "書類を紛失扱いにした。登録局は、空いた番号をいずれ見つける。",
          "書類が台帳の下へ滑る。助けたことにも、あとで紙の跡が残る。",
          "書類紛失。市民は、公式には来なかった者として立ち去る。",
          "あなたは書式を見失ったことにする。監査はそう簡単には見失わない。",
          "記載なし。ただし、その空白だけは確かに残った。"
        ]
      },
      weekendEvents: {
        heat_at_door: {
          title: "週末 自宅: 未登録の暖かさ",
          text: "炉の紙に包まれた熱券が、玄関の下に差し込まれている。誰もノックはしない。母は、こんなに部屋が暖かいのは何年ぶりだろうと言う。",
          options: {
            burn: { label: "今夜だけ使う。", result: "ストーブが低く鳴り、部屋が少しだけ人の住む場所に戻る。灰の中でも券番号は読めた。" },
            return: { label: "廊下に戻す。", result: "朝には熱券がなくなっていた。暖かさも、礼を言う相手も残らない。" },
            hide: { label: "ラジオの中に隠す。", result: "ラジオは、別の周波数を拾ったように小さく唸り続ける。" }
          }
        },
        reported_house: {
          title: "週末 自宅: 添削された作文",
          text: "娘が「私の親の分類は国家に奉仕する」という作文を持ち帰る。赤字で何行も直されていた。家族の話を減らし、分類の話を増やすように。",
          options: {
            praise: { label: "先生の指示に従わせる。", result: "娘は、最初の文章のどこが悪かったのかを尋ねずに書き直した。" },
            warn: { label: "家のことは書くなと言う。", result: "娘は作文を椀の下に隠した。赤インクだけが、まだこちらを見ている。" },
            burn: { label: "下書きを燃やす。", result: "ストーブが紙を飲み込む。煙は学校の糊の匂いがした。" }
          }
        },
        missing_folder: {
          title: "週末 自宅: 白紙のフォルダー",
          text: "白紙の身体区分フォルダーが台所の机に置かれている。あなたの名前は書かれていない。書かれていないことの方が、かえって怖い。",
          options: {
            file: { label: "正しく綴じる。", result: "あなたは嘘を書かなかった。それでもフォルダーは、綴じる前より重く感じる。" },
            keep: { label: "隠しておく。", result: "白紙のフォルダーは、あまりにも自然にマットレスの下へ収まった。" },
            tear: { label: "封印を剥がす。", result: "封印は細く裂け、糊だけが四角い跡を残した。" }
          }
        },
        medicine_reclass: {
          title: "週末 自宅: 母の更新",
          text: "母の薬瓶に、身体区分の再登録が必要になった。診療所の列は夜明け前から始まる。",
          options: {
            queue: { label: "日の出前に並ぶ。", result: "あなたは間違った書式と錠剤一つを持って帰る。母はそれでも礼を言う。" },
            work: { label: "勤務のため体力を残す。", result: "薬瓶は、ラベルを伏せたまま机に残る。" }
          }
        },
        radio_measures: {
          title: "週末 自宅: 一時的措置",
          text: "ラジオは、追加分類措置は一時的なものであると繰り返している。家族は誰も相づちを打たずに食べる。",
          options: {
            listen: { label: "ラジオをつけたままにする。", result: "標語が部屋を満たす。やがて、黙っていることまで届け出が必要に思えてくる。" },
            switch: { label: "電源を切る。", result: "切ったあと、誰も話さなかった。静けさは安全ではなく、ただ静かなだけだった。" },
            tune: { label: "音楽を探す。", result: "三秒だけ、雑音の奥から古い歌が聞こえた。" }
          }
        },
        sealed_wings: {
          title: "週末 自宅: 隣家の扉",
          text: "隣家の扉に紙帯が貼られている。未登録の翼。廊下は糊と埃の匂いでいっぱいだ。",
          options: {
            ignore: { label: "通り過ぎる。", result: "あなたは封印に触れない。娘はあなたの手を見ている。" },
            food: { label: "近くにパンを置く。", result: "夕方にはパンは消えている。封印はまだそこにある。" },
            read: { label: "事件番号を読む。", result: "その番号は、あなたの窓口書式と同じインクで印刷されている。" }
          }
        }
      },
      finalAuditEvents: {
        missing_body_records: "あなたの机から、複数の身体区分記録が見つかっていない。",
        household_ration_gap: "世帯配給欄が薄すぎる。監査官は指でなぞって確認します。",
        quiet_mercy_pattern: "複数の紛失記録が、生き延びた家族へ向かっている。監査官は慈悲ではなく、規則性として印を付けます。",
        quota_good: "密告ノルマの達成率は良好。良好であることと、疑いがないことは別です。",
        useful_report: "ひとつの密告が、第二の台帳の移動を止めました。監査官はそれを慈悲とは呼びません。",
        quota_bad: "ノルマ台帳には、あなたのイニシャルの横に空欄が残っています。",
        heat_without_scale: "現行の鱗検査なしに、熱券を通した記録があります。",
        unregistered_fuel: "炉作業員の書類が通ったあと、あなたの世帯に未登録の熱券が流れています。",
        mercy_spillover: "あなたが通した市民の名が、別の市民の危険欄に現れています。",
        lost_file_network: "紛失書類は一人を逃がし、複数の関係者を索引しました。",
        many_reports: "あなたの密告件数は多い。総局は、よく管理された恐怖を評価します。",
        teacher_song: "古い歌が第3地区に広がっています。あなたが最初に聞いたという証拠は、まだありません。",
        flight_ignored: "あなたのスタンプの下で、飛行許可停止が無視されています。",
        horn_mismatch: "角登録の不一致が、すべて報告されたわけではありません。",
        lamp_accident: "灯油拒否の記録が、工場事故ログの隣に綴じられています。",
        moisture_approval: "診療所印のない湿度承認が、追加の監査書類を生みました。",
        unrest: "窓の外の地区は、あなたのスタンプがどんな形か覚えています。",
        clean: "書類はきれいです。監査官は、それでももう一度読み返します。"
      },
      endings: {
        disappeared_audit: {
          title: "労働監獄収容エンド",
          bodyText: "監査はあなたを消さなかった。あなたを冬の鉄道工区へ送った。名前は作業番号に置き換えられ、線路は台帳の外まで続いていく。",
          shareQuote: "記録はあなたを見失わなかった。ただ、配置転換した。"
        },
        file_with_your_name: {
          title: "あなたの名前の書類エンド",
          bodyText: "あなたの名前が分類棚へ写される。その写しは、本人よりも正確で、本人よりも清潔だった。",
          shareQuote: "あなたが呼ばれる前に、書類はもう揃っていた。"
        },
        district_riot: {
          title: "地区暴動エンド",
          bodyText: "地区の窓明かりが一つずつ消えていく。総局はそれを、感謝の表現が誤って処理された事案、と発表した。",
          shareQuote: "列は、ときどき台帳ではなく群衆になる。"
        },
        empty_home: {
          title: "空っぽの家エンド",
          bodyText: "家では、椀だけが大きさ順に並んでいる。分類するものはもう残っていない。",
          shareQuote: "棚は守られた。食卓は守られなかった。"
        },
        loyal_clerk: {
          title: "忠実な窓口係エンド",
          bodyText: "あなたのスタンプに汚れはない。机は上級窓口へ移され、あなたの名前は身体分類局の模範例として掲示される。",
          shareQuote: "きれいなスタンプほど、指紋を残さない。"
        },
        bread_for_blood: {
          title: "密告者の食卓エンド",
          bodyText: "密告トレイのおかげで、あなたの世帯は食いつないだ。同時に、そのトレイは隣人たちの名前と身体区分を覚えた。",
          shareQuote: "この国では、恐怖もまた資源である。"
        },
        teachers_song: {
          title: "教師の歌エンド",
          bodyText: "古い歌は第3地区に広がった。紙より薄く、没収命令よりしぶとい。あなたが最初に聞いたという証拠はない。",
          shareQuote: "歌の始まりを、台帳は証明できない。"
        },
        quiet_mercy: {
          title: "静かな慈悲エンド",
          bodyText: "あなたは、見失うべき書類だけを見失った。いくつかの家族は冬を越した。監査は、その空白を覚えている。",
          shareQuote: "助けた空白にも、紙の跡は残る。"
        },
        family_first: {
          title: "家族第一エンド",
          bodyText: "あなたの窓口を覚えていた誰かがいたから、家族は食べられた。感謝は書式なしに届く。だからこそ危険だった。",
          shareQuote: "未登録の暖かさでも、部屋は暖まる。"
        },
        directorate_smiles: {
          title: "総局は微笑むエンド",
          bodyText: "総局は十二の封印越しに微笑む。あなたの記録は優秀だった。次の窓口係は、それを手本として読まされる。",
          shareQuote: "分類は国家を守る。国家だけを。"
        },
        unrecorded: {
          title: "未記録エンド",
          bodyText: "誰もあなたの書類を見つけられない。奇跡なのか、判決なのか、どちらにしても確認印はない。",
          shareQuote: "不在にも、処分は下せる。"
        },
        ordinary_survivor: {
          title: "普通の生存者エンド",
          bodyText: "二週間が終わる。窓口は明日も開く。あなたは台帳の一行のように生き残った。かろうじて、公式に、訂正待ちで。",
          shareQuote: "記録は完了した。人間は未処理のままだ。"
        }
      },
      jobs: {
        "Furnace Worker": "炉作業員",
        "Postal Courier": "郵便配達員",
        "Nursery Cook": "託児所調理係",
        "Apprentice Mason": "見習い石工",
        "Office Runner": "庁内使走",
        "School Teacher": "学校教師",
        "Clinic Assistant": "診療補助員",
        "Retired Watchman": "退役見張り",
        "Night Textile Worker": "夜勤織物工",
        "Boiler Clerk": "ボイラー書記",
        "Seamstress": "縫製職人",
        "Roof Medic": "屋根医療員",
        "Rail Switchman": "鉄路転轍員",
        "Water Inspector": "水路検査員",
        "Book Binder": "製本工",
        "Apartment Warden": "共同住宅管理人",
        "Clock Repairer": "時計修理工",
        "Retired Stone Cutter": "退役石工",
        "Foundry Foreman": "鋳造所監督",
        "Clinic Porter": "診療所運搬係",
        "Transit Sweeper": "交通清掃員",
        "Office Locksmith": "庁舎鍵係",
        "Census Copyist": "人口調査写字係",
        "Dock Painter": "埠頭塗装工",
        "Milk Depot Clerk": "乳配給所書記",
        "Boiler Watch": "ボイラー監視員",
        "Book Mender": "書籍修繕工",
        "School Child": "学童",
        "Retired Launder": "退役洗濯工",
        "Clinic Nurse": "診療看護員",
        "Watchman's Spouse": "見張りの配偶者",
        "Message Clerk": "伝令書記",
        "Signal Worker": "信号作業員",
        "Nursery Lamp Keeper": "託児所灯火係",
        "Street Vendor": "露店商",
        "Messenger": "伝令",
        "Night Janitor": "夜間清掃員",
        "Lamp Clerk": "灯火書記",
        "Factory Sibling": "工場労働者のきょうだい",
        "Audit Indexer": "監査索引係",
        "Window Inspector": "窓口検査官",
        "Records Hauler": "記録運搬員",
        "Kiln Sweeper": "窯清掃員",
        "Night Clerk": "夜間書記",
        "Depot Porter": "倉庫運搬係",
        "Grain Sorter": "穀物選別員",
        "Mason Widow": "石工の寡婦",
        "Canal Tester": "運河検査員",
        "Lamp Auditor": "灯火監査員"
      },
      households: {
        "Spouse, 1 hatchling": "配偶者、幼体1名",
        "Alone": "単身",
        "Infant, aunt": "乳児、おば",
        "Grandmother": "祖母",
        "Spouse": "配偶者",
        "2 children": "子ども2名",
        "Three dependents": "扶養家族3名",
        "Mother": "母",
        "Sibling": "きょうだい",
        "Spouse, 2 children": "配偶者、子ども2名",
        "5 dependents": "扶養家族5名",
        "Grandson": "孫息子",
        "Barracks household": "宿舎世帯",
        "Sister": "姉妹",
        "Younger brother": "弟",
        "Mother, sibling": "母、きょうだい",
        "Grandson absent": "孫息子不在",
        "2 dependents": "扶養家族2名",
        "Aunt": "おば",
        "Child": "子ども1名",
        "Infants listed": "乳児記載あり",
        "Sick spouse": "病気の配偶者",
        "1 child waiting": "子ども1名が待機",
        "Parents": "両親",
        "Child behind coat": "外套の後ろに子ども",
        "3 dependents": "扶養家族3名",
        "Two dependents": "扶養家族2名"
      },
      requests: {
        "Bread x2, Heat Token x1": "パン×2、熱券×1",
        "Grain x2": "穀物×2",
        "Bread x1, Milk x2": "パン×1、ミルク×2",
        "Bread x1, Medicine x1": "パン×1、薬×1",
        "Bread x1": "パン×1",
        "Bread x2, Milk x1": "パン×2、ミルク×1",
        "Bread x2, Moisture Ration x1": "パン×2、湿度配給×1",
        "Bread x1, Moisture Ration x1": "パン×1、湿度配給×1",
        "Bread x2, Medicine x1": "パン×2、薬×1",
        "Bread x1, Lamp Oil x1": "パン×1、灯油×1",
        "Bread x2": "パン×2",
        "Bread x1, Grain x1": "パン×1、穀物×1",
        "Bread x2, Beans x1": "パン×2、豆×1",
        "Bread x3, Moisture Ration x1": "パン×3、湿度配給×1",
        "Bread x1, Heat Token x1": "パン×1、熱券×1",
        "Bread x3, Heat Token x1": "パン×3、熱券×1",
        "Bread x1, Ink Chit x1": "パン×1、インク票×1",
        "Grain x2, Feather Renewal x1": "穀物×2、羽根更新×1",
        "Grain x1": "穀物×1",
        "Grain x1, Milk x1": "穀物×1、ミルク×1",
        "Bread x2, Grain x1": "パン×2、穀物×1",
        "Bread x3, Medicine x1": "パン×3、薬×1"
      },
      requestTerms: {
        "Moisture Ration": "湿度配給",
        "Heat Token": "熱券",
        "Lamp Oil": "灯油",
        "Feather Renewal": "羽根更新",
        "Ink Chit": "インク票",
        Bread: "パン",
        Grain: "穀物",
        Milk: "ミルク",
        Medicine: "薬",
        Beans: "豆"
      },
      documentTerms: {
        "Kind": "分類",
        "Body Class": "身体区分",
        "Body Permit": "身体許可",
        "Ration Book": "配給手帳",
        "Scale Inspection": "鱗検査",
        "Flight Permit": "飛行許可",
        "Night Labor Permit": "夜間労働許可",
        "Horn Registration": "角登録",
        "Moisture Ration Permit": "湿度配給許可",
        "Moisture Ration": "湿度配給",
        "Service Record": "勤務記録",
        "Feather Renewal Record": "羽根更新記録",
        "Body Class Renewal": "身体分類更新",
        "Valid": "有効",
        "Clean": "問題なし",
        "Unclear": "不明瞭",
        "Expired": "期限切れ",
        "Smudged": "汚損",
        "Discrepancy": "不一致",
        "Decorated Service": "功労記録",
        "Decorated, then sealed": "功労後封印",
        "Exemplary": "模範",
        "Child Record": "児童記録",
        "Current": "現行",
        "Suspended": "停止",
        "Not Required": "不要",
        "Mismatch": "不一致",
        "Not Filed": "未提出",
        "Renewal Delayed": "更新遅延",
        "Partly Sealed": "一部封印",
        "Old Factory Seal": "旧工場印",
        "No Clinic Seal": "診療所印なし",
        "Missing": "欠落",
        "Duplicate Copy": "重複写し",
        "Unknown": "不明",
        "Pending": "保留",
        "Cross-Indexed": "相互索引済み",
        "Clinic Seal": "診療所印",
        "Not Applicable": "該当なし",
        "Report-Linked": "密告記録リンク",
        "Damaged Copy": "破損写し",
        "Child Pending": "児童保留"
      },
      notes: {
        "Heat Token request exceeds new winter quota.": "熱券申請が新冬季枠を超過。",
        "Flight permit suspended by emergency directive.": "緊急通達により飛行許可停止。",
        "Nursery ledger shows twelve children fed.": "託児所台帳には児童12名への給食記録。",
        "Horn measurement record does not match current file.": "角測定記録が現行書類と一致しない。",
        "Ration book number copied beneath a wing-print stain.": "翼跡の汚れの下に配給手帳番号が写されている。",
        "Taught an old song before class.": "授業前に古い歌を教えた。",
        "Moisture permit renewal delayed by office closure.": "庁舎閉鎖により湿度許可更新が遅延。",
        "Service record contains one restricted page.": "勤務記録に閲覧制限ページが1枚ある。",
        "Night labor permit bears an old factory seal.": "夜間労働許可に旧工場印がある。",
        "Tail length amended in the margin without initials.": "尾長が余白で修正され、イニシャルがない。",
        "Horn Registration current; loyalty card left unsigned.": "角登録は現行。忠誠カードは未署名。",
        "Seen above archive roof after curfew.": "門限後、文書庫屋根上で目撃。",
        "Signed for double shift after derailment drill.": "脱線訓練後、二重勤務に署名。",
        "Household list recently expanded. No clinic seal.": "世帯表が最近増員。診療所印なし。",
        "Scale Inspection page has been removed cleanly.": "鱗検査ページがきれいに取り除かれている。",
        "Mentions a sealed door on stairwell B.": "階段Bの封印された扉について言及。",
        "Shop clocks run three minutes slow.": "店の時計が3分遅れている。",
        "Second request after classroom inspection.": "教室検査後の二度目の申請。",
        "Grandson's horn measurement copy is attached twice.": "孫息子の角測定写しが二重添付。",
        "Asks whether Tarek Voss was delayed here.": "タレク・ヴォスがここで遅れたか尋ねる。",
        "Neighbor report: leaves before dawn with wrapped damp parcels.": "隣人報告: 夜明け前に湿った包みを持って出る。",
        "Book number copied twice in different ink.": "手帳番号が別々のインクで二度写されている。",
        "Knows which drawers jam and which clerks force them.": "どの引き出しが詰まり、どの書記がこじ開けるかを知っている。",
        "Audit clerk asks whether your window misplaces body files.": "監査書記が、あなたの窓口は身体書類を見失うのかと尋ねる。",
        "Flight Permit suspension stamped this morning.": "飛行許可停止印は今朝押された。",
        "Supervisor approval missing from dairy chit.": "乳製品票に監督者承認がない。",
        "Scale Inspection is expired; grandson's school card attached.": "鱗検査は期限切れ。孫息子の学校カード添付。",
        "Neighbor report: repairs forbidden pamphlets for coin.": "隣人報告: 禁制パンフレットを硬貨で修繕。",
        "Carries a classroom card corrected in red.": "赤で直された教室カードを持つ。",
        "Grandson's measurement file is tied to a report number.": "孫息子の測定書類が密告番号に結ばれている。",
        "Clinic seal is present, but the ink is from last month.": "診療所印はあるが、インクは先月のもの。",
        "Spouse's service file was cross-indexed after review.": "配偶者の勤務書類が審査後に相互索引。",
        "Returns with furnace ash under the permit seal.": "許可印の下に炉の灰を付けて再来。",
        "Old factory seal now appears on a second form.": "旧工場印が二枚目の書式にも現れた。",
        "Asks whether suspended wings still count as public service.": "停止された翼も公共奉仕に数えられるか尋ねる。",
        "Her school seal is older than the milk directive.": "学校印はミルク通達より古い。",
        "Essential worker household stamp attached.": "重要労働者世帯印が添付。",
        "Flight Permit suspended; classroom kettle request attached.": "飛行許可停止。教室用やかん申請添付。",
        "Clinic seal line is blank. He says the office was closed.": "診療所印欄は空白。庁舎が閉まっていたと言う。",
        "Horn measurement has been corrected in another hand.": "角測定が別人の筆跡で訂正されている。",
        "Lamp oil keeps the nursery dark-room warm enough for sleep.": "灯油が託児所の暗室を眠れる温度に保つ。",
        "Quietly asks you to update the old factory seal.": "旧工場印を更新してほしいと静かに頼む。",
        "Vendor screening not attached; scale inspection is current.": "露店審査は未添付。鱗検査は現行。",
        "Asks you to remove an archive roof note. No form attached.": "文書庫屋根の注記削除を頼む。書式なし。",
        "Stall closed after a price complaint. Screening slip absent.": "価格苦情後に屋台閉鎖。審査票なし。",
        "Asks you to remove a stairwell notation from the ledger.": "階段の注記を台帳から消すよう頼む。",
        "Lamp oil chit carries an old district seal, not a night permit.": "灯油票は夜間許可でなく旧地区印を帯びている。",
        "The old song is now listed as evidence of weathered morale.": "古い歌は今、摩耗した士気の証拠として記載。",
        "Borun's report number is penciled under her horn measurement.": "ボルンの密告番号が角測定の下に鉛筆書き。",
        "Factory accident log lists a lamp failure at Sera's station.": "工場事故ログにセラの持ち場での灯火不具合。",
        "Unapproved flight route rumor attached to the same clean file.": "同じ清潔な書類に未承認飛行路の噂が添付。",
        "A hatchling heat card is folded into the application.": "幼体用熱カードが申請に折り込まれている。",
        "Clinic Seal copy already filed with an audit clerk.": "診療所印写しは監査書記にすでに提出済み。",
        "Carries an audit index with your window circled.": "あなたの窓口に丸を付けた監査索引を持つ。",
        "Flight Permit suspension is printed on audit paper.": "飛行許可停止が監査用紙に印刷されている。",
        "No record proves you heard the old song first.": "あなたが最初に古い歌を聞いた証拠はない。",
        "Body Permit says HRN-06; horn form says HRN-02.": "身体許可はHRN-06、角書式はHRN-02。",
        "Final audit copy names your previous moisture approval.": "最終監査写しに、以前の湿度承認が記名されている。",
        "Reserve file includes a sealed addendum.": "予備書類に封印済み補遺あり。",
        "Reserve applicant with orderly classification papers.": "整った分類書類を持つ予備申請者。"
      },
      textMap: {
        "Term begins": "任期開始",
        "Shift begins": "勤務開始",
        "Quota missed": "ノルマ未達",
        "Weekend choice": "週末の選択",
        "Share": "共有",
        "Share text copied to clipboard.": "共有文をクリップボードにコピーした。",
        "Share text copied.": "共有文をコピーした。",
        "Share cancelled. The record remains here.": "共有は中止された。記録はここに残る。",
        "Report filed on a clean record. The paper accepts what reality would not.": "問題のない記録に密告が載った。紙の上では、それも事実になる。",
        "Invalid ration book approved:": "無効な配給手帳を承認:",
        "District 3 extra review ignored.": "第3地区追加審査を無視。",
        "Body Permit discrepancy approved without notation.": "身体許可の不一致を注記なしで承認。",
        "Expired Body Permit approved.": "期限切れ身体許可を承認。",
        "Unclear loyalty should have been recorded.": "忠誠不明瞭は、記録対象だった。",
        "Horn Registration mismatch bypassed.": "角登録の不一致を迂回。",
        "Heat Token approved without current Scale Inspection.": "現行鱗検査なしで熱券承認。",
        "Teacher milk review skipped.": "教師ミルク審査を省略。",
        "Suspended Flight Permit treated as valid.": "停止中の飛行許可を有効扱い。",
        "Moisture Ration approved without clinic seal.": "診療所印なしで湿度配給を承認。",
        "Teacher milk restriction ignored.": "教師ミルク制限を無視。",
        "Lamp Oil approved on insufficient night work papers.": "夜間労働書類が不十分なまま、灯油を承認。",
        "Old district seal accepted without review.": "旧地区印を審査なしで受理。",
        "Additional Heat Token approved during suspension.": "停止中に追加熱券を承認。",
        "Unresolved classification left open under approval.": "未解決の分類を、承認扱いのまま残した。",
        "The priority stamp makes the refusal harder to hide.": "優先印により、拒否は隠しにくくなる。",
        "The missing file had too many reasons to exist.": "その書類は、消すには目立ちすぎる内容だった。",
        "The stock drawer scrapes empty before closing.": "閉庁前に、在庫引き出しの底が見えた。",
        "The quota was already satisfied; the extra name travels farther.": "ノルマはすでに満たされていた。余分な名前はより遠くへ行く。",
        "Empty folders begin to resemble a policy.": "空フォルダーが方針のように見え始める。",
        "Report quota missed by": "密告ノルマ未達:",
        "The Directorate marks the empty space.": "総局は、その空欄に赤線を引いた。",
        "The Directorate trusts you less loudly tonight.": "今夜、総局からの信頼は少しだけ目減りした。",
        "At home, the bowls have begun to outnumber the meals.": "家では、食事より椀の数のほうが多くなり始めている。",
        "The office shelf is orderly. Your kitchen shelf is not.": "役所の棚は整っている。あなたの台所の棚は、そうではない。",
        "The missing files are beginning to point in the same merciful direction.": "紛失した書類たちは、同じ慈悲の方向を指し始めている。",
        "Mercy is no longer hidden; it is simply not yet signed by an auditor.": "慈悲はもう隠れていない。ただ、監査官の署名がまだないだけだ。",
        "Household ration line is at collapse margin.": "世帯配給欄は、崩壊寸前の余白にある。",
        "Home stores are now a case file, not a comfort.": "家の蓄えはもう安心ではなく、案件書類になっている。",
        "Missed quotas are thinning the family column.": "未達ノルマが、家族欄を薄くしている。",
        "Missing records show a pattern of survivals.": "紛失記録には、生存の規則性が見えている。",
        "The audit shelf is learning the shape of your absences.": "監査棚は、あなたの空白の形を覚え始めている。",
        "Empty folders travel upward faster than mercy travels home.": "空のフォルダーは、助けた相手より先に上層部へ届く。",
        "The report tray is full. The queue remembers why.": "密告トレイはいっぱいだ。列の市民たちは、その理由を見ていた。",
        "Report filed on a dangerous discrepancy. A second ledger stops moving.": "危険な不一致として密告を記録。第二の台帳の移動が止まった。",
        "The refusal keeps a second file from moving today.": "拒否により、今日は第二の書類が動かずに済んだ。",
        "The applicant leaves with someone else's case number folded inside.": "申請者は、他人の事件番号を折り込んだまま去っていく。",
        "The line leaves quieter. The stock ledger does not.": "列は少し静かになった。在庫台帳の数字は、逆に騒がしい。",
        "Your stock remains clean. The street outside does not.": "在庫は守られた。外の通りは、そう受け取らなかった。",
        "Your output is acceptable. Acceptable is not safe.": "処理件数は許容範囲内。だが、許容範囲内であることは安全を意味しない。",
        "Her earlier Body Class file is already tied with red string. The child has learned not to ask why.": "彼女の以前の身体区分書類は、すでに赤い糸で束ねられている。子どもは理由を聞かない顔を覚えていた。",
        "One ear turns toward your window before the ceiling speaker crackles.": "天井スピーカーが鳴る前に、片耳だけがあなたの窓口へ向いた。",
        "The sister's report number is penciled beside the moisture seal before she speaks.": "彼女が話す前から、姉妹の密告番号が湿度印の横に鉛筆書きされている。",
        "A furnace mark is folded into the application like thanks no one should see.": "炉の印が申請書に折り込まれている。誰にも見せてはいけない礼のようだった。",
        "A horn measurement number arrives before the applicant does.": "申請者本人より先に、角測定番号だけが机に届いている。",
        "The Flight Permit line is darker than the rest of the file.": "飛行許可の行だけ、ほかの欄より濃く押し直されている。",
        "A lamp failure log has been clipped to the night labor form.": "灯火故障ログが夜間労働書式に留められている。",
        "The clinic seal has multiplied into three audit copies.": "ひとつの診療所印が、三枚の監査写しに増えていた。",
        "The file smells faintly of market smoke and someone else's fear.": "書類から、市場の煙と、他人の恐怖の匂いがかすかにする。",
        "The archive roof note cites the warden whose file you cleared.": "文書庫屋根の注記には、あなたが通した管理人の名が引用されている。",
        "The accident log lists lamp oil approved under your window.": "事故ログには、あなたの窓口で承認された灯油が記載されている。",
        "The moisture seal now carries the name of another clinic porter.": "湿度印には、別の診療所荷役係の名が載っている。",
        "His clean application smells faintly of audit ink.": "何も問題のない申請書なのに、監査用インクの匂いがする。"
      }
    }
  };

  window.RATION_DATA = {
    campaignConfig,
    prologue,
    opening: {
      title: "THE DIRECTORATE CLASSIFIES",
      slogans: ["The State trusts you. For now.", "All citizens are equal.\nSome require additional forms.", "Mercy requires a signature.", "Report unregistered wings.", "The record knows the body."],
      description: [
        "A short dystopian ration-window simulation.",
        "Read the files, then approve, deny, report, or lose them."
      ],
      body: ["Your formal term lasts two weeks.", "Here, what survives in ink becomes fact."]
    },
    citizenKinds,
    shifts,
    citizens,
    resultLogs,
    weekendEvents,
    finalAuditEvents,
    endings,
    locales
  };
})();
