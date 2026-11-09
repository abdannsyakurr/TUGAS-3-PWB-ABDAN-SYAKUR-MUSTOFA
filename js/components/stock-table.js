const emptyForm = () => ({ kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: '', qty: '', safety: '', catatanHTML: '' });

Vue.component('ba-stock-table', {
  template: '#tpl-stock',
  props: {
    items: { type: Array, required: true },
    upbjjList: { type: Array, default: () => [] },
    kategoriList: { type: Array, default: () => [] }
  },
  data() {
    return {
      filterUpbjj: '', filterKategori: '', onlyReorder: false,
      sortBy: '', sortDir: 'asc',
      hoverCode: null,
      showForm: false, formMode: 'create', form: emptyForm(), errors: {},
      deleteTarget: null
    };
  },
  computed: {
    // dependent options: kategori hanya tersedia setelah UT-Daerah dipilih
    kategoriOptions() {
      if (!this.filterUpbjj) return [];
      const ada = new Set(this.items.filter(i => i.upbjj === this.filterUpbjj).map(i => i.kategori));
      return this.kategoriList.filter(k => ada.has(k));
    },
    // computed di-cache: hanya dihitung ulang jika dependensinya berubah
    filteredItems() {
      return this.items.filter(i =>
        (!this.filterUpbjj || i.upbjj === this.filterUpbjj) &&
        (!this.filterKategori || i.kategori === this.filterKategori) &&
        (!this.onlyReorder || i.qty < i.safety || i.qty === 0)
      );
    },
    sortedItems() {
      const arr = this.filteredItems.slice();
      if (!this.sortBy) return arr;
      const dir = this.sortDir === 'asc' ? 1 : -1;
      const k = this.sortBy;
      return arr.sort((a, b) => (k === 'judul' ? a.judul.localeCompare(b.judul) : a[k] - b[k]) * dir);
    },
    reorderCount() { return this.items.filter(i => i.qty < i.safety || i.qty === 0).length; }
  },
  watch: {
    // watcher 1: ganti UT-Daerah -> kategori di-reset
    filterUpbjj() { this.filterKategori = ''; },
    // watcher 2: tutup form -> bersihkan error & isian
    showForm(val) { if (!val) { this.errors = {}; this.form = emptyForm(); } },
    // watcher 3: tutup dialog hapus bila target hilang dari daftar
    items(val) { if (this.deleteTarget && !val.some(i => i.kode === this.deleteTarget.kode)) this.deleteTarget = null; }
  },
  methods: {
    resetFilter() { this.filterUpbjj = ''; this.filterKategori = ''; this.onlyReorder = false; this.sortBy = ''; this.sortDir = 'asc'; },
    openCreate() { this.formMode = 'create'; this.form = emptyForm(); this.errors = {}; this.showForm = true; },
    openEdit(item) { this.formMode = 'edit'; this.form = Object.assign({}, item); this.errors = {}; this.showForm = true; },
    validate() {
      const f = this.form, e = {};
      if (!/^[A-Za-z0-9]{3,15}$/.test(String(f.kode).trim())) e.kode = 'Kode 3-15 huruf/angka';
      else if (this.formMode === 'create' && this.items.some(i => i.kode.toUpperCase() === String(f.kode).trim().toUpperCase())) e.kode = 'Kode sudah ada';
      if (!String(f.judul).trim()) e.judul = 'Judul wajib diisi';
      if (!f.kategori) e.kategori = 'Pilih kategori';
      if (!f.upbjj) e.upbjj = 'Pilih UT-Daerah';
      if (!String(f.lokasiRak).trim()) e.lokasiRak = 'Lokasi rak wajib diisi';
      if (f.harga === '' || isNaN(f.harga) || Number(f.harga) <= 0) e.harga = 'Harga harus > 0';
      if (f.qty === '' || !Number.isInteger(Number(f.qty)) || Number(f.qty) < 0) e.qty = 'Qty bilangan bulat >= 0';
      if (f.safety === '' || !Number.isInteger(Number(f.safety)) || Number(f.safety) < 0) e.safety = 'Safety bilangan bulat >= 0';
      this.errors = e;
      return Object.keys(e).length === 0;
    },
    submitForm() {
      if (!this.validate()) return;
      const f = this.form;
      const data = {
        kode: String(f.kode).trim().toUpperCase(), judul: String(f.judul).trim(), kategori: f.kategori,
        upbjj: f.upbjj, lokasiRak: String(f.lokasiRak).trim(),
        harga: Number(f.harga), qty: Number(f.qty), safety: Number(f.safety), catatanHTML: f.catatanHTML || ''
      };
      this.$emit(this.formMode === 'create' ? 'create' : 'update', data);
      this.showForm = false;
    },
    askDelete(item) { this.deleteTarget = item; },
    doDelete() { this.$emit('delete', this.deleteTarget.kode); this.deleteTarget = null; }
  }
});
