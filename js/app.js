(async function () {
  const root = document.getElementById('app');
  try {
    await Api.loadTemplates();
    const data = await Api.loadAll();

    new Vue({
      el: '#app',
      data: { tab: 'stok', state: data, toast: '', infoModal: false, infoText: '' },
      methods: {
        notify(msg) { this.toast = msg; clearTimeout(this._t); this._t = setTimeout(() => (this.toast = ''), 2500); },
        addStok(item) { this.state.stok.push(item); this.notify('Bahan ajar ' + item.kode + ' ditambahkan'); },
        updateStok(item) {
          const i = this.state.stok.findIndex(s => s.kode === item.kode);
          if (i > -1) this.$set(this.state.stok, i, item);
          this.notify('Bahan ajar ' + item.kode + ' diperbarui');
        },
        deleteStok(kode) { this.state.stok = this.state.stok.filter(s => s.kode !== kode); this.notify('Bahan ajar ' + kode + ' dihapus'); },
        handleNewDO(d) {
          this.state.tracking.unshift(d);
          this.infoText = 'Delivery Order ' + d.no + ' berhasil dibuat.';
          this.infoModal = true;
          this.tab = 'tracking';
        },
        addProgress(p) {
          const d = this.state.tracking.find(x => x.no === p.no);
          if (d) { d.perjalanan.push({ waktu: p.waktu, keterangan: p.keterangan }); this.notify('Progress ditambahkan ke ' + p.no); }
        }
      }
    });
  } catch (err) {
    root.removeAttribute('v-cloak');
    root.innerHTML = '<div style="padding:2rem;font-family:sans-serif"><h2>Gagal memuat aplikasi</h2><p>' + err.message +
      '</p><p>Jalankan lewat web server lokal (mis. VS Code Live Server atau <code>python -m http.server</code>), bukan klik dua kali file index.html.</p></div>';
  }
})();
