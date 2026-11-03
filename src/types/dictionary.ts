export interface DictionaryItem {
  id: string;
  ten_ban_ghi: string;
  tu_tieng_viet: string;
  tu_tieng_ede: string;
  phien_am: string;
  duong_dan_hinh_anh: string;
  chu_thich_hinh_anh: string;
  duong_dan_tep_am_thanh: string;
  audio_data_base64?: string;
  ten_nguoi_doc_ban_ghi: string;
  nguon_tu_lieu?: string;
  chu_de?: string;
  vi_du_ngu_canh?: string;
  trang_thai?: string;
  ngay_tao?: string;
}

export type SearchDirection = 'all' | 'vi_to_ede' | 'ede_to_vi';

export interface ContributionFormData {
  tu_tieng_viet: string;
  tu_tieng_ede: string;
  phien_am: string;
  duong_dan_hinh_anh: string;
  chu_thich_hinh_anh: string;
  duong_dan_tep_am_thanh: string;
  audio_data_base64?: string;
  ten_nguoi_doc_ban_ghi: string;
  nguon_tu_lieu?: string;
  chu_de: string;
  vi_du_ngu_canh: string;
  ghi_chu_nguoi_dong_gop?: string;
}
