Vue.component('do-tracking', {
  template: '#tpl-tracking',
  props: {
    items: { type: Array, required: true },
    paket: { type: Array, default: () => [] }
  },
  data() {
    return { mode: 'no', query: '', applied: '', drafts: {}, errors: {} };
  },
  computed: {
    results() {
      const q = this.applied.trim().toLowerCase();
      if (!q) return this.items;
      return this.items.filter(d => (this.mode === 'no' ? d.no : d.nim).toLowerCase().includes(q));
    }
  },
  watch: {
    // watcher 1: input dikosongkan -> pencarian otomatis di-reset
    query(val) { if (!val) this.applied = ''; },
    // watcher 2: ganti jenis pencarian -> reset
    mode() { this.resetSearch(); }
  },
  methods: {
    doSearch() { this.applied = this.query; },           // Enter
    resetSearch() { this.query = ''; this.applied = ''; }, // Esc
    namaPaket(kode) { const p = this.paket.find(x => x.kode === kode); return p ? p.nama : kode; },
    ringkasan(d) {   // name-based index pada v-for
      return {
        'NIM': d.nim, 'Nama': d.nama, 'Ekspedisi': d.ekspedisi,
        'Tanggal Kirim': this.$options.filters.tanggalIndo(d.tanggalKirim),
        'Paket': d.paket + ' - ' + this.namaPaket(d.paket),
        'Total': this.$options.filters.rupiah(d.total)
      };
    },
    statusClass(s) { return s === 'Terkirim' ? 'ok' : (s === 'Diproses' ? 'warn' : 'info'); },
    setDraft(no, v) { this.$set(this.drafts, no, v); if (v) this.$delete(this.errors, no); },
    addProgress(d) {
      const text = (this.drafts[d.no] || '').trim();
      if (!text) { this.$set(this.errors, d.no, 'Keterangan wajib diisi'); return; }
      this.$emit('add-progress', { no: d.no, waktu: Util.nowStamp(), keterangan: text });
      this.$set(this.drafts, d.no, '');
    }
  }
});
