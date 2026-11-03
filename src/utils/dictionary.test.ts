import test from 'node:test';
import assert from 'node:assert/strict';
import {
  removeDiacritics,
  searchDictionary,
  filterByCategory,
  validateContributionForm,
  clientAudioCache,
} from './dictionary';
import { DictionaryItem } from '../types/dictionary';

const mockItems: DictionaryItem[] = [
  {
    id: '1',
    ten_ban_ghi: 'Bản ghi: Sang',
    tu_tieng_viet: 'Nhà dài',
    tu_tieng_ede: 'Sang',
    phien_am: '/saːŋ/',
    duong_dan_hinh_anh: '/img/sang.jpg',
    chu_thich_hinh_anh: 'Nhà dài Ê-đê',
    duong_dan_tep_am_thanh: '/audio/sang.mp3',
    ten_nguoi_doc_ban_ghi: 'Y Bhiôn Niê',
    nguon_tu_lieu: 'Sở GD&ĐT Đắk Lắk',
    chu_de: 'Nhà cửa & Đời sống',
  },
  {
    id: '2',
    ten_ban_ghi: 'Bản ghi: Čing',
    tu_tieng_viet: 'Cồng chiêng',
    tu_tieng_ede: 'Čing',
    phien_am: '/tʃiːŋ/',
    duong_dan_hinh_anh: '/img/cing.jpg',
    chu_thich_hinh_anh: 'Chiêng đồng',
    duong_dan_tep_am_thanh: '/audio/cing.mp3',
    ten_nguoi_doc_ban_ghi: 'Y Mip Knul',
    nguon_tu_lieu: 'Bảo tàng Đắk Lắk',
    chu_de: 'Văn hóa & Âm nhạc',
  },
  {
    id: 'blank',
    ten_ban_ghi: 'Mẫu rỗng',
    tu_tieng_viet: '',
    tu_tieng_ede: '',
    phien_am: '',
    duong_dan_hinh_anh: '',
    chu_thich_hinh_anh: '',
    duong_dan_tep_am_thanh: '',
    ten_nguoi_doc_ban_ghi: '',
    nguon_tu_lieu: '',
  },
];

test('removeDiacritics cleans Vietnamese and E-de letters properly', () => {
  assert.equal(removeDiacritics('Čing'), 'cing');
  assert.equal(removeDiacritics('Đắk Lắk'), 'dak lak');
  assert.equal(removeDiacritics('Êsei'), 'esei');
  assert.equal(removeDiacritics('Amĭ'), 'ami');
  assert.equal(removeDiacritics('Hgơr'), 'hgor');
});

test('searchDictionary finds words in both Vietnamese and E-de', () => {
  // Vietnamese lookup
  const resVi = searchDictionary(mockItems, 'nhà', 'all');
  assert.equal(resVi.length, 1);
  assert.equal(resVi[0].tu_tieng_ede, 'Sang');

  // E-de lookup with diacritic Čing
  const resEde = searchDictionary(mockItems, 'cing', 'all');
  assert.equal(resEde.length, 1);
  assert.equal(resEde[0].tu_tieng_viet, 'Cồng chiêng');

  // Two-way direction constraint
  const viOnly = searchDictionary(mockItems, 'Sang', 'vi_to_ede');
  assert.equal(viOnly.length, 0); // 'Sang' is E-de, not Vietnamese

  const edeOnly = searchDictionary(mockItems, 'Sang', 'ede_to_vi');
  assert.equal(edeOnly.length, 1);
  assert.equal(edeOnly[0].tu_tieng_viet, 'Nhà dài');
});

test('filterByCategory filters correctly and skips empty template', () => {
  const music = filterByCategory(mockItems, 'Văn hóa & Âm nhạc');
  assert.equal(music.length, 1);
  assert.equal(music[0].id, '2');

  const all = filterByCategory(mockItems, 'Tất cả');
  assert.equal(all.length, 2); // Excludes blank template
});

test('validateContributionForm strictly enforces reader name and required fields', () => {
  // Missing reader name
  const invalidResult = validateContributionForm({
    tu_tieng_viet: 'Cơm',
    tu_tieng_ede: 'Êsei',
    ten_nguoi_doc_ban_ghi: '',
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.ten_nguoi_doc_ban_ghi);

  // Valid form
  const validResult = validateContributionForm({
    tu_tieng_viet: 'Cơm',
    tu_tieng_ede: 'Êsei',
    ten_nguoi_doc_ban_ghi: 'H’Lâm Êban',
  });
  assert.equal(validResult.isValid, true);
});

test('clientAudioCache manages audio keys correctly', () => {
  clientAudioCache.set('sang', 'data:audio/wav;base64,UklGR...');
  assert.equal(clientAudioCache.has('sang'), true);
  assert.equal(clientAudioCache.get('sang'), 'data:audio/wav;base64,UklGR...');
});
