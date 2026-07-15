import { PrismaClient } from '@prisma/client';
import { COLOMBIA_DEPARTMENTS } from './CO';
import { NETHERLANDS_PROVINCES } from './NL';
import { PHILIPPINE_PROVINCES } from './PH';
import { UAE_EMIRATES } from './AE';
import { USA_STATE_CITY } from './US';
import { SOUTH_AFRICA_PROVINCES } from './ZA';
import { IND_STATE_CITY } from './IN';
import { CANADA_STATE_CITY } from './CA';
import { SINGAPORE_STATE_CITY } from './SG';
import { MAXICO_STATE_CITY } from './MX';
import { BRAZIL_STATE_CITY } from './BR';

const prisma = new PrismaClient();

async function createStates() {
  try {
    const countryStateCity = {
      USA: USA_STATE_CITY,
      IND: IND_STATE_CITY,
      ZA: SOUTH_AFRICA_PROVINCES,
      PH: PHILIPPINE_PROVINCES,
      CO: COLOMBIA_DEPARTMENTS,
      NL: NETHERLANDS_PROVINCES,
      UAE: UAE_EMIRATES,
      CA: CANADA_STATE_CITY,
      SG: SINGAPORE_STATE_CITY,
      MX: MAXICO_STATE_CITY,
      BR: BRAZIL_STATE_CITY,
    };

    for (const countryCode of Object.keys(countryStateCity)) {
      for (const state of Object.keys(countryStateCity[countryCode])) {
        const createdState = await prisma.state.findFirst({
          where: {
            name: state,
            countryCode: countryCode,
          },
        });
        if (!createdState) {
          console.log('creating state', state);
          await prisma.state.create({
            data: {
              name: state,
              countryCode: countryCode,
            },
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}

createStates().catch((e) => {
  console.error(e);
  process.exit(1);
});
