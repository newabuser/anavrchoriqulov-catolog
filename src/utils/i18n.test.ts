import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS } from '../data/portfolioData';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';
import { validateInquiryForm } from './galleryLogic';
import { Language } from '../types/i18n';

test('LANGUAGE_OPTIONS lists uz as default first language followed by en and ru', () => {
  assert.deepEqual(
    LANGUAGE_OPTIONS.map((opt) => opt.code),
    ['uz', 'en', 'ru']
  );
  assert.deepEqual(
    LANGUAGE_OPTIONS.map((opt) => opt.shortLabel),
    ['UZ', 'EN', 'RU']
  );
});

test('TRANSLATIONS includes complete non-empty entries for uz, en, and ru', () => {
  const languages: Language[] = ['uz', 'en', 'ru'];

  for (const lang of languages) {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict, `Missing dictionary for ${lang}`);
    assert.ok(dict.nav.gallery.trim().length > 0);
    assert.ok(dict.nav.about.trim().length > 0);
    assert.ok(dict.nav.contact.trim().length > 0);
    assert.ok(dict.portfolio.catalogueTitle.trim().length > 0);
    assert.ok(dict.portfolio.catalogueSubtitle.trim().length > 0);
    assert.ok(dict.portfolio.searchPlaceholder.trim().length > 0);
    assert.ok(dict.portfolio.clearSearch.trim().length > 0);
    assert.ok(dict.portfolio.searchEmptyHeading.trim().length > 0);
    assert.equal(dict.about.aboutHeadline, 'ANVAR CHORIQULOV');
    assert.ok(dict.about.statementParagraphs.length >= 3);
    assert.ok(dict.contact.sendInquiry.trim().length > 0);
    assert.ok(dict.lightbox.medium.trim().length > 0);
    assert.ok(dict.lightbox.dimensions.trim().length > 0);
    assert.ok(dict.lightbox.price.trim().length > 0);
    assert.ok(dict.footer.rightsReserved.trim().length > 0);

    const confirmation = dict.contact.inquiryConfirmation(
      'Clara Vance',
      'Darvesh',
      'artistchoriqulov@gmail.com'
    );
    assert.ok(confirmation.includes('Clara Vance'));
    assert.ok(confirmation.includes('Darvesh'));
    assert.ok(confirmation.includes('artistchoriqulov@gmail.com'));
  }

  // Russian translations must contain Cyrillic script
  assert.match(TRANSLATIONS.ru.nav.gallery, /[А-Яа-яЁё]/);
  assert.match(TRANSLATIONS.ru.about.statementLead, /[А-Яа-яЁё]/);
  assert.match(TRANSLATIONS.ru.lightbox.price, /[А-Яа-яЁё]/);

  // Uzbek and English interface strings must be distinct
  assert.notEqual(TRANSLATIONS.uz.nav.gallery, TRANSLATIONS.en.nav.gallery);
  assert.notEqual(TRANSLATIONS.uz.nav.about, TRANSLATIONS.en.nav.about);
  assert.notEqual(TRANSLATIONS.uz.lightbox.price, TRANSLATIONS.en.lightbox.price);

  // Required English exhibition categories and purchase label
  assert.equal(TRANSLATIONS.en.portfolio.allCategory, 'All Works');
  assert.equal(TRANSLATIONS.en.portfolio.oilCategory, 'Oil Paintings');
  assert.equal(TRANSLATIONS.en.portfolio.watercolorCategory, 'Watercolor');
  assert.equal(TRANSLATIONS.en.portfolio.soldCategory, 'Sold');
  assert.equal(TRANSLATIONS.en.lightbox.buyButton, 'BUY THIS WORK');
  assert.equal(TRANSLATIONS.en.lightbox.soldStatus, 'SOLD');
});

test('validateInquiryForm returns localized errors for each language', () => {
  const languages: Language[] = ['uz', 'en', 'ru'];

  for (const lang of languages) {
    const expected = TRANSLATIONS[lang].contact.errors;
    const errors = validateInquiryForm(
      {
        name: '',
        email: 'invalid-email',
        subject: 'Darvesh',
        message: 'short',
      },
      expected
    );

    assert.equal(errors.name, expected.name);
    assert.equal(errors.email, expected.emailInvalid);
    assert.equal(errors.message, expected.message);
  }
});

test('protected artwork titles, prices, and dimensions remain language-independent constants', () => {
  const expectedImmutable = [
    { title: 'Darvesh', dimensions: '50 × 40 cm', price: '300 USD' },
    { title: 'Chol', dimensions: '30 × 40 cm', price: '300 USD' },
    { title: 'Dravesh', dimensions: '60 × 40 cm', price: '250 USD' },
    { title: 'Zikr', dimensions: '60 × 40 cm', price: '400 USD' },
    { title: 'Usta', dimensions: '55 × 75 cm', price: '500 USD' },
    { title: 'Mehrob', dimensions: '50 × 50 cm', price: '350 USD' },
    { title: 'Shahzoda', dimensions: '50 × 50 cm', price: '350 USD' },
    { title: 'Mulla', dimensions: '50 × 40 cm', price: '300 USD' },
    { title: 'Chavazdoz', dimensions: '40 × 40 cm', price: '250 USD' },
    { title: 'O’zbeklar', dimensions: '60 × 40 cm', price: '400 USD' },
    { title: 'O’zbeklar', dimensions: '40 × 30 cm', price: '500 USD' },
    { title: 'Paranji', dimensions: '60 × 40 cm / 65 × 40 cm', price: '400 USD' },
    { title: 'Amir', dimensions: '50 × 40 cm', price: '400 USD' },
    { title: 'PORTERT', dimensions: '40 × 30 cm', price: '150 USD' },
    { title: 'Portert', dimensions: '40 × 30 cm', price: '250 USD' },
    { title: 'Moziy', dimensions: '40 × 30 cm', price: '150 USD' },
    { title: 'Soqiy', dimensions: '50 × 40 cm', price: '300 USD' },
    { title: 'Tarix', dimensions: '60 × 40 cm', price: '350 USD' },
    { title: 'Tolibi-ilm', dimensions: '70 × 40 cm', price: '250 USD' },
    { title: 'Buxoroliklar', dimensions: '50 × 50 cm', price: '350 USD' },
    { title: 'MULLALAR', dimensions: '50 × 50 cm', price: '300 USD (sold)' },
    { title: 'Mullalar', dimensions: '90 × 90 cm', price: '1200 USD' },
    { title: 'Xushu', dimensions: '100 × 100 cm', price: '1100 USD' },
    { title: 'Choyxona', dimensions: '50 × 50 cm', price: '450 USD' },
    { title: 'Motam', dimensions: '50 × 50 cm', price: '300 USD' },
    { title: 'Mulla', dimensions: '30 × 40 cm', price: '400 USD' },
    { title: 'Sarob', dimensions: '50 × 70 cm', price: '700 USD' },
    { title: 'Dard', dimensions: '60 × 70 cm', price: '700 USD' },
    { title: 'Nigoh', dimensions: '50 × 50 cm', price: '750 USD' },
    { title: 'Mulla', dimensions: '50 × 50 cm', price: '500 USD' },
    { title: 'O’tmish', dimensions: '100 × 100 cm', price: '800 USD' },
    { title: 'Dard', dimensions: '50 × 70 cm', price: '600 USD' },
    { title: 'Ota', dimensions: '35 × 28 cm', price: '200 USD' },
    { title: 'Nonvoy', dimensions: '115 × 70 cm', price: '1500 USD' },
    { title: 'TArix', dimensions: '50 × 70 cm', price: '500 USD' },
    { title: 'Moziy', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'Lahza', dimensions: '50 × 50 cm', price: '250 USD' },
    { title: 'Chopon', dimensions: '30 × 40 cm', price: '100 USD' },
    { title: 'Ovchi', dimensions: 'Diametr 55 cm', price: '500 USD' },
    { title: 'Siymo', dimensions: '50 × 70 cm', price: '550 USD' },
    { title: 'Zikr', dimensions: '60 × 40 cm', price: '350 USD' },
    { title: 'Halqa', dimensions: '100 × 40 cm', price: '600 USD' },
    { title: 'Mullalar', dimensions: '60 × 40 cm', price: '400 USD' },
    { title: 'Samarqand', dimensions: '60 × 40 cm', price: '500 USD' },
    { title: 'MUAZZIN', dimensions: '60 × 40 cm', price: '500 USD' },
    { title: 'ARK', dimensions: '40 × 40 cm', price: '200 USD' },
    { title: 'ARK QAL’ASI', dimensions: '50 × 40 cm', price: '350 USD' },
    { title: 'ARK QAL’ASI OLDIDA', dimensions: '60 × 40 cm', price: '500 USD' },
    { title: 'MASJIDI-KALON', dimensions: '30 × 30 cm', price: '250 USD' },
    { title: 'MADRASA OLDIDA', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'Moziy', dimensions: '50 × 50 cm', price: '300 USD' },
    { title: 'TOQI TELPAKPO’SHON', dimensions: '60 × 40 cm', price: '350 USD' },
    { title: 'ESKI MASJID', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'MASJID', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'DARVOZA', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'CHORMINOR', dimensions: '50 × 40 cm', price: '350 USD' },
    { title: 'SHOHI-ZINDA', dimensions: '50 × 40 cm', price: '350 USD' },
    { title: 'ARK QAL’ASI OLDIDA', dimensions: '40 × 50 cm', price: '350 USD' },
    { title: 'MINORAI-KALON', dimensions: '100 × 100 cm', price: '1000 USD' },
    { title: 'POYI KALON', dimensions: '90 × 90 cm', price: '900 USD' },
    { title: 'BOTMAGAN QUYOSH', dimensions: '90 × 60 cm', price: '550 USD' },
    { title: 'ESKI SHAHAR', dimensions: '70 × 70 cm', price: '700 USD' },
    { title: 'BOQIY BUXORO', dimensions: '100 × 100 cm', price: '600 USD' },
    { title: 'MADRASA', dimensions: '70 × 50 cm', price: '500 USD' },
    { title: 'O’tmish', dimensions: '100 × 100 cm', price: '700 USD' },
    { title: 'Paxtachi oilasi', dimensions: '50 × 50 cm', price: '500 USD' },
    { title: 'O’zbegim', dimensions: '70 × 60 cm', price: '450 USD' },
    { title: 'Choyxona', dimensions: '70 × 60 cm', price: '700 USD' },
    { title: 'Maxzunlik', dimensions: '100 × 75 cm', price: '1000 USD' },
    { title: 'Turk', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'Amir', dimensions: '90 × 60 cm', price: '600 USD' },
    { title: 'SO’NGGI AMIR', dimensions: '70 × 40 cm', price: '500 USD' },
    { title: 'BUXORO AMIRI', dimensions: '60 × 40 cm', price: '350 USD' },
    { title: 'Amir', dimensions: '50 × 40 cm', price: '250 USD' },
    { title: 'SIAD AMIR OLIMXON', dimensions: '50 × 50 cm', price: '350 USD' },
    { title: 'SIAD AMIR OLIMXON', dimensions: '50 × 50 cm', price: '350 USD' },
    { title: 'Amir Olimxon', dimensions: '25 × 30 cm', price: '150 USD' },
    { title: 'Dard', dimensions: '60 × 40 cm', price: '450 USD' },
    { title: 'OTA VABOLA', dimensions: '50 × 50 cm', price: '350 USD' },
    { title: 'NONVOY', dimensions: '40 × 50 cm', price: '250 USD' },
    { title: 'NONVOY', dimensions: '90 × 60 cm', price: '500 USD' },
    { title: 'O’zbeklar', dimensions: '70 × 60 cm', price: '400 USD' },
    { title: 'Nola', dimensions: '40 × 30 cm', price: '300 USD' },
    { title: 'Darveshlar', dimensions: '60 × 50 cm', price: '250 USD' },
    { title: 'O’zbeklar', dimensions: '80 × 60 cm', price: '800 USD' },
    { title: 'Usta', dimensions: '50 × 50 cm', price: '500 USD' },
    { title: 'Kuz', dimensions: '60 × 40 cm', price: '200 USD' },
    { title: 'BUXOROLIKLAR', dimensions: '60 × 40 cm', price: '250 USD' },
    { title: 'Do’stlar', dimensions: '30 × 40 cm', price: '150 USD' },
    { title: 'Bolalik', dimensions: '60 × 40 cm', price: '300 USD' },
    { title: 'Imom', dimensions: '50 × 50 cm', price: '500 USD' },
    { title: 'Shayx', dimensions: '100 × 100 cm', price: '500 USD' },
    { title: 'Mulla', dimensions: '100 × 60 cm', price: '700 USD' },
    { title: 'Bobo', dimensions: '60 × 40 cm', price: '400 USD' },
    { title: 'Ibrohim Qo’rboshi', dimensions: '50 × 60 cm', price: '550 USD' },
    { title: 'Musofir', dimensions: '30 × 40 cm', price: '200 USD' },
    { title: 'Dehqonlar', dimensions: '50 × 50 cm', price: '200 USD' },
    { title: 'BUXOROLIKLAR', dimensions: '90 × 90 cm', price: '700 USD' },
    { title: 'POrtert', dimensions: '50 × 40 cm', price: '400 USD' },
    { title: 'O’zbek qizi', dimensions: '60 × 40 cm', price: '400 USD' },
    { title: 'Paranji', dimensions: '90 × 60 cm', price: '550 USD' },
    { title: 'Paranji', dimensions: '90 × 60 cm', price: '450 USD' },
    { title: 'O’zbegim', dimensions: '100 × 60 cm', price: '1000 USD' },
    { title: 'O’zbegim', dimensions: '100 × 60 cm', price: '600 USD' },
    { title: 'O’zbek qizi', dimensions: '50 × 40 cm', price: '350 USD' },
    { title: 'Portert', dimensions: '60 × 40 cm', price: '300 USD' },
    { title: 'Yangi asr', dimensions: '110 × 70 cm', price: '1000 USD' },
    { title: 'Tarix', dimensions: '50 × 70 cm', price: '400 USD' },
    { title: 'Xotira', dimensions: '90 × 60 cm', price: '500 USD' },
    { title: 'O’zbek qizi', dimensions: '50 × 50 cm', price: '500 USD' },
    { title: 'Sharq ayoli', dimensions: '50 × 70 cm', price: '300 USD' },
    { title: 'KElin', dimensions: '50 × 40 cm', price: '200 USD' },
    { title: 'Masjid', dimensions: '50 × 50 cm', price: '250 USD' },
    { title: 'YONAYOTGAN BUXORO', dimensions: '130 × 90 cm', price: '1000 USD' },
    { title: 'MINORA', dimensions: '30 × 20 cm', price: '200 USD' },
    { title: 'MINORA', dimensions: '30 × 40 cm', price: '150 USD' },
    { title: 'QIYOMAT', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'QONLI MADRASA', dimensions: '30 × 40 cm', price: '150 USD' },
    { title: 'MIR-ARAB MADRASASI', dimensions: '60 × 40 cm', price: '200 USD' },
    { title: 'MADRASA', dimensions: '60 × 40 cm', price: '200 USD' },
    { title: 'MAQBARA', dimensions: '30 × 40 cm', price: '250 USD' },
    { title: 'SHOHI-ZINDA', dimensions: '60 × 40 cm', price: '200 USD' },
    { title: 'SIRLI LABI-HAVUZ', dimensions: '50 × 70 cm', price: '300 USD' },
    { title: 'ESKI KO’CHA', dimensions: '30 × 40 cm', price: '200 USD' },
    { title: 'KO’XNA UY', dimensions: '30 × 40 cm', price: '100 USD' },
    { title: 'ESKI KO’CHA', dimensions: '30 × 40 cm', price: '100 USD' },
  ];

  assert.equal(ARTWORKS.length, expectedImmutable.length);
  const uniqueUrls = new Set(ARTWORKS.map((item) => item.imageUrl));
  assert.equal(uniqueUrls.size, ARTWORKS.length);
  expectedImmutable.forEach((item, index) => {
    assert.equal(ARTWORKS[index].title, item.title);
    assert.equal(ARTWORKS[index].dimensions, item.dimensions);
    assert.equal(ARTWORKS[index].price, item.price);
    assert.ok(ARTWORKS[index].width > 0);
    assert.ok(ARTWORKS[index].height > 0);
    assert.ok(ARTWORKS[index].status === 'available' || ARTWORKS[index].status === 'sold');
  });
  assert.equal(ARTWORKS[20].status, 'sold');
  assert.equal(ARTWORKS[124].medium, 'Watercolour');
  assert.equal(ARTWORKS[125].medium, 'Watercolour');
});
