// Real, openly licensed pictures used on the homepage, with their credits.
// They show the history around each idea; none of them is presented as AI Atlas's own work.
import type { ImageMetadata } from 'astro';
import type { Localized, PartId } from './roadmap';

import plateTaberd from '../assets/home/plate-taberd.jpg';
import plateTaberdWide from '../assets/home/plate-taberd-wide.jpg';
import plateMercator from '../assets/home/plate-mercator.jpg';
import plateNamKy from '../assets/home/plate-namky.jpg';
import partPython from '../assets/home/part-python-lovelace.jpg';
import partMath from '../assets/home/part-math-byrne.jpg';
import partMl from '../assets/home/part-ml-galton.jpg';
import partDl from '../assets/home/part-dl-cajal.jpg';
import partNlp from '../assets/home/part-nlp-rosetta.jpg';
import partCv from '../assets/home/part-cv-muybridge.jpg';
import partLlm from '../assets/home/part-llm-taberd-dictionary.jpg';
import lessonDeWit from '../assets/home/lesson-de-wit.jpg';
import termsIris from '../assets/home/terms-iris.jpg';
import stampMercator from '../assets/home/stamp-mercator-title.jpg';

export interface Credit {
  /** Original title of the work, kept in its own language. */
  title: string;
  creator: Localized;
  year: Localized;
  licence: Localized;
  licenceUrl?: string;
  /** Where the file comes from, as shown in the credit line. */
  via: Localized;
  source: string;
}

export interface Picture {
  src: ImageMetadata;
  alt: Localized;
  caption: Localized;
  /** CSS object-position used when the picture is cropped. */
  focus?: string;
  narrow?: ImageMetadata;
  credit: Credit;
}

const same = (text: string): Localized => ({ vi: text, en: text });
const PUBLIC_DOMAIN: Localized = { vi: 'Phạm vi công cộng', en: 'Public domain' };
const COMMONS = same('Wikimedia Commons');
// Scans from the David Rumsey Map Collection carry CC BY-NC-SA 3.0 and a required attribution.
const RUMSEY_LICENCE = same('CC BY-NC-SA 3.0');
const RUMSEY_LICENCE_URL = 'https://creativecommons.org/licenses/by-nc-sa/3.0/';
const RUMSEY = same('David Rumsey Map Collection, David Rumsey Map Center, Stanford Libraries; Wikimedia Commons');

export const HERO_PLATES: Picture[] = [
  {
    src: plateTaberd,
    focus: '50% 30%',
    narrow: plateTaberdWide,
    alt: {
      vi: 'Bản đồ An Nam đại quốc họa đồ năm 1838, tên bản đồ in bằng cả chữ Hán và chữ Latin.',
      en: 'The 1838 map An Nam dai quoc hoa do, its title printed in both Chinese characters and Latin script.',
    },
    caption: {
      vi: 'An Nam đại quốc họa đồ, Jean-Louis Taberd, 1838. Tên bản đồ in bằng hai thứ chữ.',
      en: 'An Nam dai quoc hoa do, Jean-Louis Taberd, 1838. Its title is printed in two scripts.',
    },
    credit: { title: 'An Nam Dai Quoc Hoa Do', creator: same('Jean-Louis Taberd'), year: same('1838'), licence: PUBLIC_DOMAIN, via: COMMONS, source: 'https://commons.wikimedia.org/wiki/File:An_Nam_Dai_Quoc_Hoa_Do_by_Jean_Louis_Taberd_1838.jpg' },
  },
  {
    src: plateMercator,
    focus: '30% 50%',
    alt: {
      vi: 'Bản đồ thế giới hai bán cầu trong cuốn Atlas của Mercator.',
      en: 'A two-hemisphere world map from Mercator’s Atlas.',
    },
    caption: {
      vi: 'Bản đồ thế giới của Rumold Mercator (1587) trong cuốn Atlas năm 1595, tập bản đồ đầu tiên được gọi là "atlas".',
      en: 'Rumold Mercator’s world map (1587) in the 1595 Atlas, the first collection of maps to be called an "atlas".',
    },
    credit: {
      title: 'Orbis terrae compendiosa descriptio (in Atlas sive Cosmographicae Meditationes)',
      creator: { vi: 'Rumold Mercator, theo Gerardus Mercator', en: 'Rumold Mercator, after Gerardus Mercator' },
      year: same('1587'),
      licence: PUBLIC_DOMAIN,
      via: COMMONS,
      source: 'https://commons.wikimedia.org/wiki/File:Atlas_Cosmographicae_(Mercator)_033.jpg',
    },
  },
  {
    src: plateNamKy,
    focus: '50% 50%',
    alt: {
      vi: 'Bản đồ Nam Kỳ lục tỉnh, trích từ bản đồ của Taberd năm 1838.',
      en: 'The six southern provinces, a detail of Taberd’s 1838 map.',
    },
    caption: {
      vi: 'Nam Kỳ lục tỉnh, trích từ bản đồ của Taberd, 1838.',
      en: 'The six southern provinces, from Taberd’s map, 1838.',
    },
    credit: { title: 'Nam Ky luc tinh (detail of An Nam Dai Quoc Hoa Do)', creator: same('Jean-Louis Taberd'), year: same('1838'), licence: PUBLIC_DOMAIN, via: COMMONS, source: 'https://commons.wikimedia.org/wiki/File:NamKy6tinh-Taberd.jpg' },
  },
];

export const PART_PICTURES: Record<PartId, Picture> = {
  python: {
    src: partPython,
    focus: '20% 40%',
    alt: { vi: 'Bảng tính số Bernoulli của Ada Lovelace.', en: 'Ada Lovelace’s table for computing Bernoulli numbers.' },
    caption: { vi: 'Bảng tính số Bernoulli của Ada Lovelace, 1843: chương trình đầu tiên được in.', en: 'Ada Lovelace’s Bernoulli table, 1843: the first published program.' },
    credit: { title: 'Diagram for the computation of Bernoulli numbers', creator: same('Ada Lovelace'), year: same('1843'), licence: PUBLIC_DOMAIN, via: COMMONS, source: 'https://commons.wikimedia.org/wiki/File:Diagram_for_the_computation_of_Bernoulli_numbers.jpg' },
  },
  math: {
    src: partMath,
    focus: '50% 8%',
    alt: { vi: 'Định lý Pythagoras vẽ bằng các hình vuông màu đỏ, vàng, xanh.', en: 'The Pythagorean theorem drawn as red, yellow and blue squares.' },
    caption: { vi: 'Định lý Pythagoras trong sách Euclid của Oliver Byrne, 1847.', en: 'The Pythagorean theorem in Oliver Byrne’s Euclid, 1847.' },
    credit: {
      title: 'The Elements of Euclid, Pythagorean theorem',
      creator: { vi: 'Oliver Byrne (sắp đặt: Mirko Junge)', en: 'Oliver Byrne (arrangement: Mirko Junge)' },
      year: same('1847'),
      licence: PUBLIC_DOMAIN,
      via: COMMONS,
      source: 'https://commons.wikimedia.org/wiki/File:Byrne_1847_Satz_des_Pythagoras_Hochformat.jpg',
    },
  },
  ml: {
    src: partMl,
    focus: '55% 50%',
    alt: { vi: 'Sơ đồ chiều cao cha mẹ và con cái với một hình elip của Francis Galton.', en: 'Francis Galton’s diagram of parents’ and children’s heights, with an ellipse.' },
    caption: { vi: 'Sơ đồ của Francis Galton, 1886, trong bài báo đặt tên cho "regression".', en: 'Francis Galton’s diagram, 1886, from the paper that named "regression".' },
    credit: {
      title: 'Diagram based on Table I, Plate X, "Regression towards mediocrity in hereditary stature", Journal of the Anthropological Institute 15',
      creator: same('Francis Galton'),
      year: same('1886'),
      licence: PUBLIC_DOMAIN,
      via: COMMONS,
      source: 'https://commons.wikimedia.org/wiki/File:Galton%27s_correlation_diagram_1875.jpg',
    },
  },
  dl: {
    src: partDl,
    focus: '50% 30%',
    alt: { vi: 'Hình vẽ tay hai tế bào thần kinh Purkinje với nhánh tỏa ra như cây.', en: 'A hand drawing of two Purkinje neurons, branching like trees.' },
    caption: { vi: 'Tế bào Purkinje, Santiago Ramón y Cajal vẽ, 1899.', en: 'Purkinje cells, drawn by Santiago Ramón y Cajal, 1899.' },
    credit: { title: 'Purkinje cells', creator: same('Santiago Ramón y Cajal'), year: same('1899'), licence: PUBLIC_DOMAIN, via: COMMONS, source: 'https://commons.wikimedia.org/wiki/File:PurkinjeCell.jpg' },
  },
  nlp: {
    src: partNlp,
    focus: '50% 40%',
    alt: { vi: 'Phiến đá Rosetta khắc một văn bản bằng ba thứ chữ.', en: 'The Rosetta Stone, one text carved in three scripts.' },
    caption: { vi: 'Phiến đá Rosetta: một văn bản, ba thứ chữ. Ảnh in năm 1922.', en: 'The Rosetta Stone: one text, three scripts. Photo published in 1922.' },
    credit: {
      title: 'The Rosetta Stone',
      creator: {
        vi: 'Ảnh: Donald Macbeth, trong E. A. Wallis Budge, The Rosetta Stone (British Museum)',
        en: 'Photo: Donald Macbeth, in E. A. Wallis Budge, The Rosetta Stone (British Museum)',
      },
      year: same('1922'),
      licence: PUBLIC_DOMAIN,
      via: COMMONS,
      source: 'https://commons.wikimedia.org/wiki/File:The_Rosetta_Stone.jpg',
    },
  },
  cv: {
    src: partCv,
    focus: '30% 50%',
    alt: { vi: 'Mười hai khung ảnh con ngựa Sallie Gardner, mười một khung đang phi.', en: 'Twelve frames of the horse Sallie Gardner, eleven of them at a gallop.' },
    caption: { vi: 'Ngựa Sallie Gardner phi qua từng khung ảnh, Eadweard Muybridge, 1878.', en: 'Sallie Gardner galloping frame by frame, Eadweard Muybridge, 1878.' },
    credit: { title: 'Sallie Gardner at a Gallop (The Horse in Motion)', creator: same('Eadweard Muybridge'), year: same('1878'), licence: PUBLIC_DOMAIN, via: COMMONS, source: 'https://commons.wikimedia.org/wiki/File:Eadweard_Muybridge-Sallie_Gardner_1878.jpg' },
  },
  llm: {
    src: partLlm,
    focus: '50% 30%',
    alt: {
      vi: 'Một trang từ điển Việt – La tinh: chữ Nôm, chữ quốc ngữ và tiếng La tinh.',
      en: 'A page of a Vietnamese–Latin dictionary: chữ Nôm characters, Vietnamese script and Latin.',
    },
    caption: { vi: 'Từ điển Việt – La tinh, Pigneau de Béhaine soạn, Taberd in năm 1838.', en: 'A Vietnamese–Latin dictionary, compiled by Pigneau de Béhaine, printed by Taberd in 1838.' },
    credit: {
      title: 'Dictionarium Anamitico-Latinum',
      creator: { vi: 'Pigneau de Béhaine, Jean-Louis Taberd biên tập', en: 'Pigneau de Béhaine, edited by Jean-Louis Taberd' },
      year: same('1838'),
      licence: PUBLIC_DOMAIN,
      via: COMMONS,
      source: 'https://commons.wikimedia.org/wiki/File:Taberd_dictionary.jpg',
    },
  },
};

export const LESSON_PICTURE: Picture = {
  src: lessonDeWit,
  focus: '50% 45%',
  alt: { vi: 'Một cuốn atlas cổ mở ra ở trang bản đồ Đông Ấn.', en: 'An old atlas open at a map of the East Indies.' },
  caption: { vi: 'Tabula Indiae Orientalis, Frederick de Wit, khoảng 1682.', en: 'Tabula Indiae Orientalis, Frederick de Wit, c. 1682.' },
  credit: { title: 'Tabula Indiae Orientalis', creator: same('Frederick de Wit'), year: { vi: 'khoảng 1682', en: 'c. 1682' }, licence: RUMSEY_LICENCE, licenceUrl: RUMSEY_LICENCE_URL, via: RUMSEY, source: 'https://commons.wikimedia.org/wiki/File:Tabula_Indiae_Orientalis._(IA_dr_tabula-indiae-orientalis-12220073).jpg' },
};

export const TERMS_PICTURE: Picture = {
  src: termsIris,
  focus: '50% 25%',
  alt: { vi: 'Tranh vẽ hoa diên vĩ Iris versicolor màu tím.', en: 'A painting of a purple Iris versicolor flower.' },
  caption: { vi: 'Iris versicolor, Curtis’s Botanical Magazine, 1787: một loài hoa, tên Latin và tên thường gọi.', en: 'Iris versicolor, Curtis’s Botanical Magazine, 1787: one flower, a Latin name and a common name.' },
  credit: {
    title: 'Iris versicolor (plate 21)',
    creator: { vi: 'James Sowerby, tạp chí Curtis’s Botanical Magazine', en: 'James Sowerby, Curtis’s Botanical Magazine' },
    year: same('1787'),
    licence: PUBLIC_DOMAIN,
    via: COMMONS,
    source: 'https://commons.wikimedia.org/wiki/File:Iris_versicolor_1787.jpg',
  },
};

export const STAMP_PICTURE: Picture = {
  src: stampMercator,
  alt: { vi: 'Trang bìa cuốn Historia Mundi, or Mercator’s Atlas.', en: 'Title page of Historia Mundi, or Mercator’s Atlas.' },
  caption: { vi: 'Historia Mundi, or Mercator’s Atlas, London, 1635.', en: 'Historia Mundi, or Mercator’s Atlas, London, 1635.' },
  credit: { title: 'Historia mundi, or Mercator’s atlas (title page)', creator: same('Gerardus Mercator, Jodocus Hondius'), year: same('1635'), licence: RUMSEY_LICENCE, licenceUrl: RUMSEY_LICENCE_URL, via: RUMSEY, source: 'https://commons.wikimedia.org/wiki/File:(Title_Page_to)_Historia_mundi_-_or_Mercator%27s_atlas._Containing_his_cosmographicall_description_of_the_fabricke_and_figure_of_(IA_dr_title-page-to-historia-mundi-or-mercators-atlas-containing-his-cosmog-11248004).jpg' },
};

export const ALL_PICTURES: Picture[] = [
  ...HERO_PLATES,
  ...Object.values(PART_PICTURES),
  LESSON_PICTURE,
  TERMS_PICTURE,
  STAMP_PICTURE,
];
