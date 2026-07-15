import { ANDORRA_PARISHES_TOWNS } from './AD';
import { IND_STATE_CITY } from './IN';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const countryStateCity = {
  AD: ANDORRA_PARISHES_TOWNS,
  // AE: UAE_EMIRATES,
  // AF: AFGHANISTAN_PROVINCES_CITIES,
  // AG: ANTIGUA_AND_BARBUDA_PROVINCES_CITIES,
  // AM: ARMENIA_PROVINCES_CITIES,
  // AO: ANGOLA_STATE_CITY,
  // AR: ARGENTINA_PROVINCES_CITIES,
  // AT: AUSTRIA_STATES_CITIES,
  // AU: AUSTRALIA_STATES_TERRITORIES_CITIES,
  // AZ: AZERBAIJAN_REGIONS_CITIES,
  // AL: ALBANIA_COUNTIES_CITIES,
  // BA: BOSNIA_AND_HERZEGOVINA_REGIONS_CITIES,
  // BB: BARBADOS_PARISHES_TOWNS,
  // BD: BANGLADESH_DIVISIONS_DISTRICTS_CITIES,
  // BF: BURKINA_FASO_STATE_CITY,
  // BG: BULGARIA_REGIONS_CITIES,
  // BH: BAHRAIN_GOVERNORATES_CITIES,
  // BI: BURUNDI_PROVINCE_COMMUNE,
  // BJ: BENIN_STATE_CITY,
  // BN: BRUNEI_DARUSSALAM_DISTRICTS_TOWNS,
  // BO: BOLIVIA_DEPARTMENTS_CITIES,
  // BR: BRAZIL_STATE_CITY,
  // BS: BAHAMAS_ISLANDS_SETTLEMENTS,
  // BT: BHUTAN_DZONGKHAGS_TOWNS,
  // BW: BOTSWANA_STATE_CITY,
  // BY: BELARUS_REGIONS_CITIES,
  // BZ: BELIZE_REGIONS_CITIES,
  // CA: CANADA_STATE_CITY,
  // CF: CENTRAL_AFRICAN_REPUBLIC_PROVINCES_CITIES,
  // CG: CONGO_KINSHASA_REGIONS_CITIES,
  // CH: SWITZERLAND_REGIONS_CITIES,
  // CI: COTE_DIVOIRE_REGIONS_CITIES,
  // CL: CHILE_REGIONS_CITIES,
  // CM: CAMEROON_STATE_CITY,
  // CN: CHINA_PROVINCES_CITIES,
  // CO: COLOMBIA_DEPARTMENTS,
  // CR: COSTA_RICA_REGIONS_CITIES,
  // CU: CUBA_REGIONS_CITIES,
  // CV: CAPE_VERDE_ISLANDS,
  // CY: CYPRUS_DISTRICTS_CITIES,
  // CZ: CZECH_REPUBLIC_REGIONS_CITIES,
  // DE: GERMANY_STATES_CITIES,
  // DJ: DJIBOUTI_REGIONS_CITIES,
  // DK: DENMARK_REGIONS_CITIES,
  // DO: DOMINICAN_REPUBLIC_PROVINCES_CITIES,
  // EC: ECUADOR_PROVINCES_CITIES,
  // EE: ESTONIA_COUNTIES_CITIES,
  // EG: EGYPT_STATE_CITY,
  // EH: WESTERN_SAHARA_REGIONS_CITIES,
  // ER: ERITREA_REGIONS_CITIES,
  // ES: SPAIN_REGIONS_CITIES,
  // ET: ETHIOPIA_STATE_CITY,
  // FI: FINLAND_REGIONS_CITIES,
  // FJ: FIJI_DIVISIONS_CITIES,
  // FM: MICRONESIA_STATES_TOWNS,
  // FR: FRANCE_REGIONS_CITIES,
  // GA: GABON_PROVINCES_CITIES,
  // GB: UNITED_KINGDOM_REGIONS_CITIES,
  // GD: GRENADA_REGIONS_TOWNS,
  // GE: GEORGIA_COUNTIES_CITIES,
  // GH: GHANA_REGIONS_CITIES,
  // GQ: EQUATORIAL_GUINEA_PROVINCES_CITIES,
  // GR: GREECE_REGIONS_CITIES,
  // GT: GUATEMALA_REGIONS_CITIES,
  // GW: GUINEA_BISSAU_REGIONS_CITIES,
  // GY: GUYANA_REGIONS_CITIES,
  // HN: HONDURAS_REGIONS_CITIES,
  // HT: HAITI_REGIONS_CITIES,
  // HR: CROATIA_COUNTIES_CITIES,
  // HU: HUNGARY_COUNTIES_CITIES,
  // ID: INDONESIA_PROVINCES_CITIES,
  // IE: IRELAND_COUNTIES_CITIES,
  // IL: ISRAEL_DISTRICTS_CITIES,
  IN: IND_STATE_CITY,
  // IQ: IRAQ_GOVERNORATES_CITIES,
  // IR: IRAN_PROVINCES_CITIES,
  // IS: ICELAND_REGIONS_CITIES,
  // IT: ITALY_REGIONS_CITIES,
  // JM: JAMAICA_PARISHES_TOWNS,
  // JO: JORDAN_GOVERNORATES_CITIES,
  // JP: JAPAN_PREFECTURES_CITIES,
  // KE: KENYA_STATE_CITY,
  // KG: KYRGYZSTAN_PROVINCES_CITIES,
  // KH: CAMBODIA_PROVINCES_CITIES,
  // KI: KIRIBATI_ISLANDS_TOWNS,
  // KM: COMOROS_ISLANDS_CITIES,
  // KN: ST_KITTS_AND_NEVIS_REGIONS_TOWNS,
  // KR: SOUTH_KOREA_PROVINCES_CITIES,
  // KZ: KAZAKHSTAN_REGIONS_CITIES,
  // LA: LAOS_PROVINCES_CITIES,
  // LB: LEBANON_GOVERNORATES_CITIES,
  // LC: ST_LUCIA_REGIONS_TOWNS,
  // LI: LIECHTENSTEIN_REGIONS_CITIES,
  // LR: LIBERIA_COUNTIES_CITIES,
  // LS: LESOTHO_DISTRICTS_TOWNS,
  // LU: LUXEMBOURG_REGIONS_CITIES,
  // LV: LATVIA_REGIONS_CITIES,
  // LY: LIBYA_DISTRICTS_CITIES,
  // MA: MOROCCO_REGIONS_CITIES,
  // MC: MONACO_REGIONS_CITIES,
  // MD: MOLDOVA_REGIONS_CITIES,
  // ME: MONTENEGRO_REGIONS_CITIES,
  // MG: MADAGASCAR_REGIONS_CITIES,
  // MH: MARSHALL_ISLANDS_ATOLLS_TOWNS,
  // ML: MALI_REGIONS_CITIES,
  // MM: MYANMAR_STATES_CITIES,
  // MN: MONGOLIA_PROVINCES_CITIES,
  // MR: MAURITANIA_REGIONS_CITIES,
  // MT: MALTA_REGIONS_CITIES,
  // MU: MAURITIUS_DISTRICTS_CITIES,
  // MV: MALDIVES_ATOLLS_ISLANDS,
  // MW: MALAWI_REGIONS_CITIES,
  // MX: MAXICO_STATE_CITY,
  // MY: MALAYSIA_STATES_CITIES,
  // MZ: MOZAMBIQUE_PROVINCES_CITIES,
  // NA: NAMIBIA_REGIONS_CITIES,
  // NE: NIGER_REGIONS_CITIES,
  // NG: NIGERIA_STATE_CITY,
  // NL: NETHERLANDS_PROVINCES,
  // NO: NORWAY_REGIONS_CITIES,
  // NP: NEPAL_PROVINCES_CITIES,
  // NR: NAURU_DISTRICTS_TOWNS,
  // NZ: NEW_ZEALAND_REGIONS_CITIES,
  // OM: OMAN_GOVERNORATES_CITIES,
  // PE: PERU_REGIONS_CITIES,
  // PG: PAPUA_NEW_GUINEA_PROVINCES_CITIES,
  // PH: PHILIPPINE_PROVINCES,
  // PK: PAKISTAN_PROVINCES_CITIES,
  // PL: POLAND_REGIONS_CITIES,
  // PS: PALESTINIAN_TERRITORIES_GOVERNORATES_CITIES,
  // PT: PORTUGAL_REGIONS_CITIES,
  // PW: PALAU_STATES_TOWNS,
  // PY: PARAGUAY_DEPARTMENTS_CITIES,
  // QA: QATAR_MUNICIPALITIES_CITIES,
  // RO: ROMANIA_REGIONS_CITIES,
  // RS: SERBIA_REGIONS_CITIES,
  // RU: RUSSIA_REGIONS_CITIES,
  // RW: RWANDA_PROVINCES_CITIES,
  // SA: SAUDI_ARABIA_PROVINCES_CITIES,
  // SB: SOLOMON_ISLANDS_PROVINCES_TOWNS,
  // SC: SEYCHELLES_DISTRICTS_CITIES,
  // SD: SUDAN_STATES_CITIES,
  // SE: SWEDEN_REGIONS_CITIES,
  // SG: SINGAPORE_STATE_CITY,
  // SI: SLOVENIA_REGIONS_CITIES,
  // SK: SLOVAKIA_REGIONS_CITIES,
  // SL: SIERRA_LEONE_PROVINCES_CITIES,
  // SM: SAN_MARINO_REGIONS_CITIES,
  // SN: SENEGAL_REGIONS_CITIES,
  // SO: SOMALIA_REGIONS_CITIES,
  // SR: SURINAME_DISTRICTS_CITIES,
  // SS: SOUTH_SUDAN_STATES_CITIES,
  // ST: SAO_TOME_PRINCIPE_REGIONS_CITIES,
  // SV: EL_SALVADOR_REGIONS_CITIES,
  // SY: SYRIA_GOVERNORATES_CITIES,
  // SZ: ESWATINI_REGIONS_CITIES,
  // TD: CHAD_REGIONS_CITIES,
  // TG: TOGO_REGIONS_CITIES,
  // TH: THAILAND_PROVINCES_CITIES,
  // TJ: TAJIKISTAN_PROVINCES_CITIES,
  // TL: EAST_TIMOR_DISTRICS_TOWNS,
  // TM: TURKMENISTAN_PROVINCES_CITIES,
  // TN: TUNISIA_GOVERNORATES_CITIES,
  // TO: TONGA_DISTRICTS_TOWNS,
  // TR: TURKEY_PROVINCES_CITIES,
  // TT: TRINIDAD_TOBAGO_REGIONS_CITIES,
  // TV: TUVALU_ISLANDS_TOWNS,
  // TW: TAIWAN_COUNTIES_CITIES,
  // TZ: TANZANIA_REGIONS_CITIES,
  // UA: UKRAINE_REGIONS_CITIES,
  // UG: UGANDA_REGIONS_CITIES,
  // US: USA_STATE_CITY,
  // UY: URUGUAY_DEPARTMENTS_CITIES,
  // UZ: UZBEKISTAN_PROVINCES_CITIES,
  // VA: VATICAN_CITY,
  // VC: ST_VINCENT_AND_THE_GRENADINES_REGIONS_TOWNS,
  // VE: VENEZUELA_STATES_CITIES,
  // VN: VIETNAM_PROVINCES_CITIES,
  // VU: VANUATU_PROVINCES_TOWNS,
  // WS: SAMOA_DISTRICTS_TOWNS,
  // YE: YEMEN_GOVERNORATES_CITIES,
  // ZA: SOUTH_AFRICA_PROVINCES,
  // ZM: ZAMBIA_PROVINCES_CITIES,
  // DZ: ALGERIA_WILAYAS_CITIES,
  // BE: BELGIUM_REGIONS_CITIES,
  // KY: CAYMAN_ISLANDS_DISTRICTS,
  // CK: COOK_ISLANDS_ISLANDS,
  // DM: DOMINICA_REGIONS_CITIES,
  // GM: GAMBIA_REGIONS_CITIES,
  // GN: GUINEA_REGIONS_CITIES,
  // XK: KOSOVO_REGIONS_CITIES,
  // KW: KUWAIT_GOVERNORATES_CITIES,
  // LT: LITHUANIA_COUNTIES_CITIES,
  // NI: NICARAGUA_DEPARTMENTS_CITIES,
  // NU: NIUE_TOWNS,
  // MK: NORTH_MACEDONIA_REGIONS_CITIES,
  // PA: PANAMA_PROVINCES_DISTRICTS,
  // LK: SRI_LANKA_PROVINCES_DISTRICTS,
  // ZW: ZIMBABWE_PROVINCES_CITIES,
  // BM: BERMUDA_STATE_CITIES,
  // BQ: BONAIR_STATE_CITY,
  // CD: DEMOCRATIC_REPUBLIC_OF_CONGO_STATE_CITIES,
  // FO: FAROE_ISLAND_STATE_CITIES,
  // HK: HONG_KONG_STATE_CITY,
  // PR: PUERTO_RICO_STATE_CITY,
  // VI: US_VIRGIN_ISLAND_STATE_CITY,
  // NC: NEW_CALEDONIA_STATE_CITY,
};
async function main() {
  try {
    try {
      for (const countryCode of Object.keys(countryStateCity)) {
        const states = countryStateCity[countryCode];

        for (const state of Object.keys(states)) {
          let createdState = await prisma.state.findFirst({
            where: {
              name: state,
              countryCode: countryCode,
            },
          });

          if (!createdState) {
            createdState = await prisma.state.create({
              data: {
                name: state,
                countryCode: countryCode,
              },
              include: {
                City: true,
              },
            });
          }

          const stateCities = states[state];
          if (!Array.isArray(stateCities)) {
            console.warn(`Skipping ${state} in ${countryCode}: Not an array`);
            continue;
          }

          for (const city of stateCities) {
            const existCity = await prisma.city.findFirst({
              where: {
                name: {
                  equals: city,
                  mode: 'insensitive',
                },
                stateId: createdState.id,
              },
            });

            if (!existCity) {
              await prisma.city.create({
                data: {
                  name: city,
                  stateId: createdState.id,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing states and cities:', error);
    }

    // await prisma.$executeRaw`ALTER SEQUENCE state_id_seq RESTART WITH 3698`;
    // await prisma.$executeRaw`ALTER SEQUENCE city_id_seq RESTART WITH 111446`;
    // await Promise.all(
    //   Object.keys(countryStateCity).map(async (countryCode) => {
    //     return Promise.all(
    //       Object.keys(countryStateCity[countryCode]).map(async (state) => {
    //         let createdState = await prisma.state.findFirst({
    //           where: {
    //             name: state,
    //             countryCode: countryCode,
    //           },
    //         });

    //         if (!createdState) {
    //           createdState = await prisma.state.create({
    //             data: {
    //               name: state,
    //               countryCode: countryCode,
    //             },
    //             include: {
    //               cities: true,
    //             },
    //           });
    //         }

    //         const stateCities = countryStateCity[countryCode][state];
    //         if (!Array.isArray(stateCities)) {
    //           console.warn(`Skipping ${state} in ${countryCode}: Not an array`);
    //           return;
    //         }

    //         const cities = stateCities.map((city) => {
    //           return { stateId: createdState.id, name: city };
    //         });

    //         return Promise.all(
    //           cities.map(async (city) => {
    //             const existCity = await prisma.city.findFirst({
    //               where: {
    //                 name: {
    //                   equals: city.name,
    //                   mode: 'insensitive',
    //                 },
    //                 stateId: createdState.id,
    //               },
    //             });

    //             if (!existCity) {
    //               await prisma.city.create({ data: city });
    //             }
    //           }),
    //         );
    //       }),
    //     );
    //   }),
    // );
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}

// execute the main function
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
