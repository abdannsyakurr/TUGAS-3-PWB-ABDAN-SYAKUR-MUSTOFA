// Filter global (formatting teks) + helper tanggal
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const pad = n => String(n).padStart(2, '0');

window.Util = {
  todayISO() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); },
  nowStamp() { const d = new Date(); return this.todayISO() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
};

// 12000 -> "Rp 12.000"
Vue.filter('rupiah', v => 'Rp ' + Number(v || 0).toLocaleString('id-ID'));
// 28 -> "28 buah"
Vue.filter('buah', v => Number(v || 0) + ' buah');
// "2025-08-25" -> "25 Agustus 2025"
Vue.filter('tanggalIndo', v => {
  if (!v) return '-';
  const p = String(v).slice(0, 10).split('-');
  if (p.length !== 3) return v;
  return parseInt(p[2], 10) + ' ' + BULAN[parseInt(p[1], 10) - 1] + ' ' + p[0];
});
