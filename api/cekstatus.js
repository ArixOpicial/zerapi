const axios = require('axios');

module.exports = function(app) {
  // API Key internal yang valid
  const ApikeyReal = "zerodev"; // API key yang harus digunakan
  const apiKeyExternal = "linebaik"; // API key untuk API eksternal

  // Fungsi untuk mengecek status transaksi
  async function checkTransaction(apikey, merchant, keyorkut) {
    try {
      // Periksa apakah API key yang diberikan valid
      if (apikey !== ApikeyReal) {
        return { error: 'API key tidak valid.' };
      }

      const url = `https://lineaja.my.id/api/orkut/cekstatus?apikey=${apiKeyExternal}&merchant=${merchant}&keyorkut=${keyorkut}`;

      // Melakukan permintaan ke API eksternal dengan parameter yang benar
      const response = await axios.get(url);

      if (response.data.message === "No transactions found.") {
        return { error: 'Tidak ada transaksi yang terdeteksi.' };
      } else if (response.data.date) {
        return response.data;
      } else {
        throw new Error('API Error: Response tidak sesuai.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return { error: 'Terjadi kesalahan saat memproses permintaan.' };
    }
  }

  // Endpoint '/cekstatus'
  app.get('/cekstatus', async (req, res) => {
    try {
      const { apikey, merchant, keyorkut } = req.query;

      // Periksa apakah parameter apikey, merchant, dan keyorkut ada
      if (!apikey || !merchant || !keyorkut) {
        return res.status(400).json({ error: 'Parameter "apikey", "merchant", dan "keyorkut" wajib disediakan.' });
      }

      // Validasi parameter "merchant" dan "keyorkut"
      if (!merchant.trim()) {
        return res.status(400).json({ error: 'Parameter "merchant" tidak boleh kosong.' });
      }

      if (!keyorkut.trim()) {
        return res.status(400).json({ error: 'Parameter "keyorkut" tidak boleh kosong.' });
      }

      // Panggil fungsi untuk mengecek transaksi jika API key valid
      const response = await checkTransaction(apikey, merchant, keyorkut);

      // Jika ada error dalam response
      if (response.error) {
        return res.status(404).json({ error: response.error });
      }

      // Jika API key valid dan data ditemukan, kembalikan respons yang sukses
      res.status(200).json({
        status: 200,
        creator: "ZeroDev",
        data: response
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan pada server.', message: error.message });
    }
  });
};
