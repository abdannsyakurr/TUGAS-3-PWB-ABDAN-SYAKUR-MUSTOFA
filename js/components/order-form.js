Vue.component('order-form', {
  template: '#tpl-order',
  props: {
    paket: { type: Array, required: true },
    ekspedisi: { type: Array, required: true },
    stok: { type: Array, default: () => [] },
    tracking: { type: Array, default: () => [] }
  },
  data() {
    return { form: { nim: '', nama: '', ekspedisi: '', paketKode: '', tanggal: Util.todayISO() }, errors: {} };
  },
  computed: {
    // DO + tahun berjalan + sequence number, mis. DO2026-002
    nomorDO() {
      const max = this.tracking.reduce((m, d) => {
        const mt = /-(\d+)$/.exec(d.no);
        return mt ? Math.max(m, parseInt(mt[1], 10)) : m;
      }, 0);
      return 'DO' + new Date().getFullYear() + '-' + String(max + 1).padStart(3, '0');
    },
    selectedPaket() { return this.paket.find(p => p.kode === this.form.paketKode) || null; },
    isiPaket() {
      if (!this.selectedPaket) return [];
      return this.selectedPaket.isi.map(k => {
        const s = this.stok.find(x => x.kode === k);
        return { kode: k, judul: s ? s.judul : '(tidak ada di stok)' };
      });
    },
    total() { return this.selectedPaket ? this.selectedPaket.harga : 0; }
  },
  watch: {
    // watcher 1: NIM hanya boleh angka
    'form.nim'(v) { const c = v.replace(/\D/g, ''); if (c !== v) this.form.nim = c; },
    // watcher 2: pilih paket -> hapus error paket
    'form.paketKode'(v) { if (v) this.$delete(this.errors, 'paketKode'); }
  },
  methods: {
    validate() {
      const f = this.form, e = {};
      if (!/^\d{5,15}$/.test(f.nim)) e.nim = 'NIM wajib angka 5-15 digit';
      if (f.nama.trim().length < 3) e.nama = 'Nama minimal 3 karakter';
      if (!f.ekspedisi) e.ekspedisi = 'Pilih ekspedisi';
      if (!f.paketKode) e.paketKode = 'Pilih paket';
      if (!f.tanggal) e.tanggal = 'Tanggal kirim wajib diisi';
      this.errors = e;
      return Object.keys(e).length === 0;
    },
    reset() { this.form = { nim: '', nama: '', ekspedisi: '', paketKode: '', tanggal: Util.todayISO() }; this.errors = {}; },
    submit() {
      if (!this.validate()) return;
      const eks = this.ekspedisi.find(x => x.kode === this.form.ekspedisi);
      this.$emit('created', {
        no: this.nomorDO, nim: this.form.nim, nama: this.form.nama.trim(),
        status: 'Diproses', ekspedisi: 'JNE ' + eks.nama,
        tanggalKirim: this.form.tanggal, paket: this.form.paketKode, total: this.total,
        perjalanan: [{ waktu: Util.nowStamp(), keterangan: 'Delivery Order dibuat' }]
      });
      this.reset();
    }
  }
});
